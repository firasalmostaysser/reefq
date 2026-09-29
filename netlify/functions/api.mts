import type { Context, Config } from '@netlify/functions';
import { json, err, readJSON, id, slug, clampStr, env, clientIp, HttpError } from '../lib/util.mts';
import { invitations, rsvps, orders, files, listJSON, rateLimit } from '../lib/stores.mts';
import { isStudio, login, logout } from '../lib/auth.mts';
import { wording } from '../lib/wording.mts';
import { canvaStatus } from '../lib/canva.mts';
import { THEME_IDS } from '../lib/themes.mts';

const MAX_INVITE_BYTES = 900_000;
const PRICES: Record<string, number> = { Essentiel: 149, Signature: 249, Prestige: 349 };
const ORDER_STATUSES = ['awaiting_payment', 'proof_sent', 'paid', 'rejected', 'cancelled'];

export default async (req: Request, context: Context) => {
  try { return await route(req, context); }
  catch (e: any) {
    if (e instanceof HttpError || (e && typeof e.status === 'number')) return err(e.status, e.message);
    console.error(e);
    return err(500, 'Something went wrong.');
  }
};

export const config: Config = { path: '/api/*' };

async function route(req: Request, context: Context): Promise<Response> {
  const url = new URL(req.url), p = url.pathname.replace(/\/+$/, ''), m = req.method;
  let mm: RegExpMatchArray | null;

  /* ---------------- public ---------------- */
  if (p === '/api/login' && m === 'POST') return login(req, context);
  if (p === '/api/logout' && m === 'POST') return logout();
  if (p === '/api/config' && m === 'GET') return json({ whatsapp: env('REEFQ_WHATSAPP'), prices: PRICES, depositPercent: depositPct() });

  if ((mm = p.match(/^\/api\/public\/invitations\/([a-z0-9-]{3,80})$/)) && m === 'GET') return publicInvitation(mm[1], url.searchParams.get('g'));
  if ((mm = p.match(/^\/api\/public\/invitations\/([a-z0-9-]{3,80})\/rsvp$/)) && m === 'POST') return publicRsvp(req, context, mm[1]);

  if (p === '/api/public/orders' && m === 'POST') return createOrder(req, context);
  if ((mm = p.match(/^\/api\/public\/orders\/(RQ-[A-Z0-9]{5})$/))) {
    const o = await clientOrder(mm[1], url.searchParams.get('t'));
    if (m === 'GET') return json(await clientView(o));
  }
  if ((mm = p.match(/^\/api\/public\/orders\/(RQ-[A-Z0-9]{5})\/proof$/)) && m === 'POST') {
    const o = await clientOrder(mm[1], url.searchParams.get('t'));
    return uploadProof(req, context, o);
  }
  if ((mm = p.match(/^\/api\/public\/orders\/(RQ-[A-Z0-9]{5})\/rsvps\.csv$/)) && m === 'GET') {
    const o = await clientOrder(mm[1], url.searchParams.get('t'));
    if (o.status !== 'paid' || !o.inviteId) return err(403, 'Available once your payment is confirmed.');
    return csvResponse(await rsvpList(o.inviteId), `reponses-${o.code}.csv`);
  }

  /* ---------------- studio (signed in) ---------------- */
  if (!(await isStudio(req))) return err(401, 'Sign in to the studio.');
  if (p === '/api/me') return json({ ok: true, wording: !!env('ANTHROPIC_API_KEY'), canva: !!env('CANVA_CLIENT_ID'), canvaStatus: await canvaStatus().catch(() => null), bankReady: !!env('BANK_RIB') });

  if (p === '/api/invitations' && m === 'GET') {
    const items = (await listJSON(invitations())).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return json({ items });
  }
  if (p === '/api/invitations' && m === 'POST') {
    const body = await readJSON(req, MAX_INVITE_BYTES);
    if (!(body.a && body.a.name && body.b && body.b.name)) return err(400, 'Both names are required.');
    return json(await saveInvitation(slug(body.a.name + '-' + body.b.name) + '-' + id(4), body));
  }
  if ((mm = p.match(/^\/api\/invitations\/([a-z0-9-]{3,80})$/))) {
    const iid = mm[1];
    if (m === 'GET') { const d = await invitations().get(iid, { type: 'json' }); return d ? json(d) : err(404, 'Not found'); }
    if (m === 'PUT') return json(await saveInvitation(iid, await readJSON(req, MAX_INVITE_BYTES)));
    if (m === 'DELETE') {
      await invitations().delete(iid);
      const s = rsvps(), { blobs } = await s.list({ prefix: iid + '/' });
      await Promise.all(blobs.map((b: any) => s.delete(b.key)));
      return json({ ok: true });
    }
  }
  if ((mm = p.match(/^\/api\/invitations\/([a-z0-9-]{3,80})\/rsvps$/))) {
    if (m === 'GET') return json({ items: await rsvpList(mm[1]) });
    if (m === 'POST') return json(await insertRsvp(mm[1], { ...(await readJSON(req, 10_000)), source: 'manual' }));
  }
  if ((mm = p.match(/^\/api\/rsvps\/([a-z0-9-]{3,80})\/([0-9a-z-]{6,40})$/)) && m === 'DELETE') { await rsvps().delete(mm[1] + '/' + mm[2]); return json({ ok: true }); }

  if (p === '/api/orders' && m === 'GET') {
    const items = (await listJSON(orders())).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return json({ items });
  }
  if ((mm = p.match(/^\/api\/orders\/(RQ-[A-Z0-9]{5})$/))) {
    const o = await getOrder(mm[1]);
    if (m === 'GET') return json(o);
    if (m === 'PATCH') {
      const b = await readJSON(req, 5000);
      if ('adminNote' in b) o.adminNote = clampStr(b.adminNote, 1000);
      if ('inviteId' in b) o.inviteId = b.inviteId ? clampStr(b.inviteId, 80) : null;
      if ('price' in b && +b.price > 0) o.price = Math.round(+b.price);
      return json(await saveOrder(o));
    }
  }
  if ((mm = p.match(/^\/api\/orders\/(RQ-[A-Z0-9]{5})\/proof$/)) && m === 'GET') {
    const o = await getOrder(mm[1]);
    const idx = Math.min(+(url.searchParams.get('i') ?? o.proofs.length - 1), o.proofs.length - 1);
    const pr = o.proofs[idx];
    if (!pr) return err(404, 'No proof yet');
    const data = await files().get(pr.key, { type: 'arrayBuffer' });
    if (!data) return err(404, 'Proof file missing');
    return new Response(data, { headers: { 'content-type': pr.type, 'cache-control': 'private, no-store' } });
  }
  if ((mm = p.match(/^\/api\/orders\/(RQ-[A-Z0-9]{5})\/status$/)) && m === 'POST') {
    const o = await getOrder(mm[1]), b = await readJSON(req, 5000);
    const note = clampStr(b.note, 500);
    if (b.action === 'confirm') {
      o.status = 'paid'; o.paid = Math.max(0, Math.round(+b.amountReceived || o.deposit)); o.paidAt = Date.now();
      o.history.push({ at: Date.now(), status: 'paid', note: note || `Virement de ${o.paid} DT vérifié`, by: 'studio' });
    } else if (b.action === 'reject') {
      o.status = 'rejected';
      o.history.push({ at: Date.now(), status: 'rejected', note: note || 'Virement introuvable sur le compte', by: 'studio' });
    } else if (b.action === 'cancel') {
      o.status = 'cancelled'; o.history.push({ at: Date.now(), status: 'cancelled', note, by: 'studio' });
    } else if (b.action === 'reopen') {
      o.status = 'awaiting_payment'; o.history.push({ at: Date.now(), status: 'awaiting_payment', note, by: 'studio' });
    } else return err(400, 'Unknown action');
    return json(await saveOrder(o));
  }
  if ((mm = p.match(/^\/api\/orders\/(RQ-[A-Z0-9]{5})\/invitation$/)) && m === 'POST') {
    const o = await getOrder(mm[1]);
    if (o.inviteId) { const ex = await invitations().get(o.inviteId, { type: 'json' }); if (ex) return json({ order: o, invitation: ex }); }
    const [a, bn] = String(o.names || '').split(/\s*(?:&|et|\+|و)\s*/i);
    const inv = { theme: THEME_IDS.includes(o.theme) ? o.theme : 'reefq', eventType: 'wedding', lang: o.lang === 'ar' ? 'ar' : 'fr',
      a: { name: (a || o.names || '').trim(), ar: '' }, b: { name: (bn || '').trim() || '—', ar: '' }, date: o.date || '', time: '20:00', city: o.city || '',
      venue: '', maps: '', dress: '', note: '', events: [], message: { fr: '', ar: '', en: '' }, photos: [], rsvpBy: '', maxGuests: 2, whatsapp: o.phone || '', guests: [], orderCode: o.code };
    const saved = await saveInvitation(slug(o.names) + '-' + id(4), inv);
    o.inviteId = saved.id; await saveOrder(o);
    return json({ order: o, invitation: saved });
  }

  if (p === '/api/upload' && m === 'POST') return upload(req);
  if (p === '/api/wording' && m === 'POST') return wording(req);
  if (p === '/api/canva/sync' && m === 'POST') {
    const r = await fetch(new URL('/.netlify/functions/canva-sync-background', url), { method: 'POST', headers: { 'x-reefq-key': env('SESSION_SECRET') } });
    return json({ started: r.status === 202, note: 'Sync started. New templates appear within a few minutes.' });
  }
  return err(404, 'Unknown endpoint');
}

/* ---------------- invitations & RSVPs ---------------- */
async function saveInvitation(iid: string, body: any) {
  delete body.id; delete body.sample;
  const prev: any = await invitations().get(iid, { type: 'json' });
  const doc = { ...body, id: iid, createdAt: prev?.createdAt || Date.now(), updatedAt: Date.now() };
  if (JSON.stringify(doc).length > MAX_INVITE_BYTES) throw new HttpError(413, 'Invitation too large. Use smaller photos.');
  await invitations().setJSON(iid, doc);
  return doc;
}

async function publicInvitation(iid: string, gid: string | null) {
  const inv: any = await invitations().get(iid, { type: 'json' });
  if (!inv) return err(404, 'Invitation not found');
  const guest = gid && Array.isArray(inv.guests) ? inv.guests.find((g: any) => g.id === gid) : null;
  const { guests, orderCode, rsvpEndpoint, siteUrl, ...pub } = inv;
  return json({ invitation: pub, guest: guest ? { id: guest.id, name: guest.name, seats: guest.seats } : null });
}

async function publicRsvp(req: Request, context: Context, iid: string) {
  if (!(await rateLimit(`rsvp/${iid}/${clientIp(req, context)}`, 20, 3600))) return err(429, 'Too many replies from this connection. Try again later.');
  const inv: any = await invitations().get(iid, { type: 'json' });
  if (!inv) return err(404, 'Invitation not found');
  const b = await readJSON(req, 10_000);
  if (b.website) return json({ ok: true });
  if (!b.name || typeof b.attending !== 'boolean') return err(400, 'Name and answer are required.');
  const guest = b.guestId && Array.isArray(inv.guests) ? inv.guests.find((g: any) => g.id === b.guestId) : null;
  const max = Math.max(1, guest ? +guest.seats || 1 : +inv.maxGuests || 1);
  return json(await insertRsvp(iid, { ...b, guests: Math.min(max, Math.max(0, +b.guests || 0)), source: 'guest' }));
}

async function insertRsvp(iid: string, b: any) {
  const at = Date.now(), rid = String(at).padStart(14, '0') + '-' + id(6), att = !!b.attending;
  const doc = { id: rid, inviteId: iid, guestId: clampStr(b.guestId, 40) || null, name: clampStr(b.name, 120), attending: att,
    guests: att ? Math.max(1, Math.min(50, +b.guests || 1)) : 0, dietary: clampStr(b.dietary, 300), message: clampStr(b.message, 1000),
    lang: clampStr(b.lang, 5), source: b.source === 'manual' ? 'manual' : 'guest', at };
  await rsvps().setJSON(iid + '/' + rid, doc);
  return { ok: true, id: rid };
}
const rsvpList = async (iid: string) => (await listJSON(rsvps(), iid + '/')).sort((a, b) => b.at - a.at);

function csvResponse(list: any[], filename: string) {
  const q = (v: unknown) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = '﻿Nom,Réponse,Personnes,Régime,Message,Reçu\n' + list.map(r => [r.name, r.attending ? 'Présent' : 'Absent', r.attending ? r.guests : 0, r.dietary, r.message, new Date(r.at).toISOString().slice(0, 16).replace('T', ' ')].map(q).join(',')).join('\n');
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${filename}"` } });
}

/* ---------------- orders & RIB payments ---------------- */
function depositPct() { const v = +env('DEPOSIT_PERCENT'); return v > 0 && v <= 100 ? v : 50; }

async function newCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 8; i++) {
    const b = crypto.getRandomValues(new Uint8Array(5)); let c = 'RQ-'; for (const x of b) c += A[x % A.length];
    if (!(await orders().get(c))) return c;
  }
  throw new HttpError(500, 'Could not create an order code');
}

async function createOrder(req: Request, context: Context) {
  if (!(await rateLimit('order/' + clientIp(req, context), 10, 3600))) return err(429, 'Too many requests.');
  const b = await readJSON(req, 5000);
  if (b.website) return json({ ok: true });
  if (!b.names || !b.phone) return err(400, 'Names and WhatsApp number are required.');
  const plan = PRICES[b.plan] ? b.plan : 'Signature', price = PRICES[plan];
  const code = await newCode(), token = id(24), now = Date.now();
  const o: any = { code, token, status: 'awaiting_payment', plan, price, deposit: Math.round(price * depositPct() / 100), paid: 0,
    createdAt: now, updatedAt: now, proofs: [], inviteId: null, adminNote: '',
    history: [{ at: now, status: 'awaiting_payment', note: 'Commande reçue', by: 'client' }] };
  for (const k of ['names', 'date', 'city', 'guests', 'theme', 'model', 'note', 'phone', 'lang']) o[k] = clampStr(b[k], 600);
  await orders().setJSON(code, o);
  return json({ code, token, url: `/commande/${code}?t=${token}` });
}

async function getOrder(code: string) {
  const o: any = await orders().get(code, { type: 'json' });
  if (!o) throw new HttpError(404, 'Order not found');
  return o;
}
async function saveOrder(o: any) { o.updatedAt = Date.now(); await orders().setJSON(o.code, o); return o; }

/* The client space is opened with the secret link sent at checkout (?t=…). */
async function clientOrder(code: string, t: string | null) {
  const o: any = await orders().get(code, { type: 'json' });
  if (!o || !t || t.length !== o.token.length) throw new HttpError(404, 'Commande introuvable. Vérifiez votre lien.');
  let d = 0; for (let i = 0; i < t.length; i++) d |= t.charCodeAt(i) ^ o.token.charCodeAt(i);
  if (d) throw new HttpError(404, 'Commande introuvable. Vérifiez votre lien.');
  return o;
}

async function clientView(o: any) {
  const view: any = {
    code: o.code, status: o.status, plan: o.plan, price: o.price, deposit: o.deposit, paid: o.paid, names: o.names, date: o.date, city: o.city,
    theme: o.theme, createdAt: o.createdAt, proofs: o.proofs.map((p: any) => ({ at: p.at, type: p.type })),
    history: o.history.map((h: any) => ({ at: h.at, status: h.status, note: h.status === 'rejected' || h.by === 'client' || h.status === 'paid' ? h.note : '' })),
    bank: { name: env('BANK_NAME'), holder: env('BANK_HOLDER'), rib: env('BANK_RIB'), iban: env('BANK_IBAN') },
    whatsapp: env('REEFQ_WHATSAPP'), role: o.status === 'paid' ? 'client' : 'pending'
  };
  if (o.status === 'paid' && o.inviteId) {
    const inv: any = await invitations().get(o.inviteId, { type: 'json' });
    if (inv) {
      const list = await rsvpList(o.inviteId);
      const yes = list.filter(r => r.attending);
      view.invitation = { id: inv.id, names: [inv.a?.name, inv.b?.name], date: inv.date, url: `/i/${inv.id}`,
        guests: (inv.guests || []).map((g: any) => ({ id: g.id, name: g.name, seats: g.seats, link: `/i/${inv.id}?g=${g.id}` })) };
      view.rsvps = { total: list.length, coming: yes.reduce((s, r) => s + (r.guests || 1), 0), declined: list.length - yes.length,
        items: list.map(r => ({ name: r.name, attending: r.attending, guests: r.guests, dietary: r.dietary, message: r.message, at: r.at })) };
    }
  }
  return view;
}

async function uploadProof(req: Request, context: Context, o: any) {
  if (!(await rateLimit('proof/' + o.code, 10, 3600))) return err(429, 'Too many uploads. Try again later.');
  if (o.status === 'paid' || o.status === 'cancelled') return err(409, 'Cette commande est déjà clôturée.');
  const type = (req.headers.get('content-type') || '').split(';')[0];
  if (!/^(image\/(jpeg|png|webp|heic)|application\/pdf)$/.test(type)) return err(415, 'Envoyez une photo (JPG, PNG) ou un PDF du reçu.');
  const buf = await req.arrayBuffer();
  if (buf.byteLength > 6_000_000) return err(413, 'Fichier trop lourd (6 Mo maximum).');
  if (buf.byteLength < 1000) return err(400, 'Fichier vide.');
  const ext = type === 'application/pdf' ? 'pdf' : type.split('/')[1].replace('jpeg', 'jpg');
  const key = `proofs/${o.code}/${Date.now()}.${ext}`;
  await files().set(key, new Blob([buf], { type }));
  o.proofs.push({ key, type, at: Date.now() });
  o.status = 'proof_sent';
  o.history.push({ at: Date.now(), status: 'proof_sent', note: 'Justificatif de virement envoyé', by: 'client' });
  await saveOrder(o);
  return json(await clientView(o));
}

/* Photos for invitations (public, served at /media/uploads/…) */
async function upload(req: Request) {
  const type = (req.headers.get('content-type') || '').split(';')[0];
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return err(415, 'Upload a JPEG, PNG or WebP image.');
  const buf = await req.arrayBuffer();
  if (buf.byteLength > 3_000_000) return err(413, 'Image too large (max 3 MB).');
  const key = 'uploads/' + id(16) + '.' + type.split('/')[1].replace('jpeg', 'jpg');
  await files().set(key, new Blob([buf], { type }));
  return json({ url: '/media/' + key });
}
