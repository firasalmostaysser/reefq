import { json, err, readJSON, id, slug, clampStr, HttpError } from './lib.js';
import { isStudio, login, logout } from './auth.js';
import { wording } from './wording.js';
import { syncNow } from './canva.js';

const MAX_INVITE_BYTES = 900_000;

export async function handleApi(req, env, url) {
  const p = url.pathname.replace(/\/+$/, '');
  const m = req.method;

  /* ---------- public ---------- */
  if (p === '/api/login' && m === 'POST') return login(req, env);
  if (p === '/api/logout' && m === 'POST') return logout();
  if (p === '/api/config' && m === 'GET') return json({ whatsapp: env.REEFQ_WHATSAPP || '', catalog: env.CANVA_FOLDER_ID ? '/templates.json' : '' });

  let mm = p.match(/^\/api\/public\/invitations\/([a-z0-9-]{3,80})$/);
  if (mm && m === 'GET') return publicInvitation(env, mm[1], url.searchParams.get('g'));
  mm = p.match(/^\/api\/public\/invitations\/([a-z0-9-]{3,80})\/rsvp$/);
  if (mm && m === 'POST') return publicRsvp(req, env, mm[1]);
  if (p === '/api/public/leads' && m === 'POST') return publicLead(req, env);

  /* ---------- studio (signed in) ---------- */
  if (!(await isStudio(req, env))) return err(401, 'Sign in to the studio.');
  if (p === '/api/me') return json({ ok: true, wording: !!env.ANTHROPIC_API_KEY, canva: !!env.CANVA_CLIENT_ID });

  if (p === '/api/invitations' && m === 'GET') {
    const { results } = await env.DB.prepare('SELECT id, data, updated_at FROM invitations ORDER BY updated_at DESC LIMIT 500').all();
    return json({ items: results.map(r => ({ ...JSON.parse(r.data), id: r.id, updatedAt: r.updated_at })) });
  }
  if (p === '/api/invitations' && m === 'POST') {
    const body = await readJSON(req, MAX_INVITE_BYTES);
    const a = body.a && body.a.name, b = body.b && body.b.name;
    if (!a || !b) return err(400, 'Both names are required.');
    let newId = slug(a + '-' + b) + '-' + id(4);
    return saveInvitation(env, newId, body, true);
  }
  mm = p.match(/^\/api\/invitations\/([a-z0-9-]{3,80})$/);
  if (mm) {
    const iid = mm[1];
    if (m === 'GET') {
      const r = await env.DB.prepare('SELECT data, updated_at FROM invitations WHERE id=?').bind(iid).first();
      return r ? json({ ...JSON.parse(r.data), id: iid, updatedAt: r.updated_at }) : err(404, 'Not found');
    }
    if (m === 'PUT') return saveInvitation(env, iid, await readJSON(req, MAX_INVITE_BYTES), false);
    if (m === 'DELETE') {
      await env.DB.batch([env.DB.prepare('DELETE FROM invitations WHERE id=?').bind(iid), env.DB.prepare('DELETE FROM rsvps WHERE invite_id=?').bind(iid)]);
      return json({ ok: true });
    }
  }
  mm = p.match(/^\/api\/invitations\/([a-z0-9-]{3,80})\/rsvps$/);
  if (mm && m === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM rsvps WHERE invite_id=? ORDER BY created_at DESC LIMIT 2000').bind(mm[1]).all();
    return json({ items: results.map(rowToRsvp) });
  }
  if (mm && m === 'POST') {
    const b = await readJSON(req, 10_000);
    return json(await insertRsvp(env, mm[1], { ...b, source: 'manual' }));
  }
  mm = p.match(/^\/api\/rsvps\/([a-z0-9]{6,20})$/);
  if (mm && m === 'DELETE') { await env.DB.prepare('DELETE FROM rsvps WHERE id=?').bind(mm[1]).run(); return json({ ok: true }); }

  if (p === '/api/leads' && m === 'GET') {
    const { results } = await env.DB.prepare('SELECT id, data, created_at FROM leads ORDER BY created_at DESC LIMIT 500').all();
    return json({ items: results.map(r => ({ id: r.id, at: r.created_at, ...JSON.parse(r.data) })) });
  }
  if (p === '/api/upload' && m === 'POST') return upload(req, env);
  if (p === '/api/wording' && m === 'POST') return wording(req, env);
  if (p === '/api/canva/sync' && m === 'POST') return json(await syncNow(env, { force: url.searchParams.get('force') === '1' }));

  return err(404, 'Unknown endpoint');
}

async function saveInvitation(env, iid, body, isNew) {
  delete body.id; delete body.updatedAt; delete body.sample;
  const now = Date.now(), data = JSON.stringify(body);
  if (data.length > MAX_INVITE_BYTES) return err(413, 'Invitation too large. Use smaller photos.');
  if (isNew) await env.DB.prepare('INSERT INTO invitations (id, data, created_at, updated_at) VALUES (?,?,?,?)').bind(iid, data, now, now).run();
  else {
    const r = await env.DB.prepare('UPDATE invitations SET data=?, updated_at=? WHERE id=?').bind(data, now, iid).run();
    if (!r.meta.changes) await env.DB.prepare('INSERT INTO invitations (id, data, created_at, updated_at) VALUES (?,?,?,?)').bind(iid, data, now, now).run();
  }
  return json({ ...body, id: iid, updatedAt: now });
}

/* What a guest may see: no guest list (except their own entry), no internal fields. */
async function publicInvitation(env, iid, gid) {
  const r = await env.DB.prepare('SELECT data, updated_at FROM invitations WHERE id=?').bind(iid).first();
  if (!r) return err(404, 'Invitation not found');
  const inv = JSON.parse(r.data);
  const guest = gid && Array.isArray(inv.guests) ? inv.guests.find(g => g.id === gid) : null;
  delete inv.guests; delete inv.rsvpEndpoint; delete inv.siteUrl;
  return json({ invitation: { ...inv, id: iid }, guest: guest ? { id: guest.id, name: guest.name, seats: guest.seats } : null }, 200, { 'cache-control': 'no-store' });
}

async function publicRsvp(req, env, iid) {
  const ip = req.headers.get('cf-connecting-ip') || 'local', rk = `rl:${iid}:${ip}`;
  const n = +(await env.STATE.get(rk)) || 0;
  if (n >= 20) return err(429, 'Too many replies from this connection. Try again later.');
  await env.STATE.put(rk, String(n + 1), { expirationTtl: 3600 });
  const exists = await env.DB.prepare('SELECT data FROM invitations WHERE id=?').bind(iid).first();
  if (!exists) return err(404, 'Invitation not found');
  const b = await readJSON(req, 10_000);
  if (b.website) return json({ ok: true });                // honeypot
  if (!b.name || typeof b.attending !== 'boolean') return err(400, 'Name and answer are required.');
  const inv = JSON.parse(exists.data);
  const guest = b.guestId && Array.isArray(inv.guests) ? inv.guests.find(g => g.id === b.guestId) : null;
  const max = Math.max(1, guest ? +guest.seats || 1 : +inv.maxGuests || 1);
  return json(await insertRsvp(env, iid, { ...b, guests: Math.min(max, Math.max(0, +b.guests || 0)), source: 'guest' }));
}

async function insertRsvp(env, iid, b) {
  const rid = id(10), now = Date.now(), att = !!b.attending;
  await env.DB.prepare('INSERT INTO rsvps (id, invite_id, guest_id, name, attending, guests, dietary, message, lang, source, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(rid, iid, clampStr(b.guestId, 40) || null, clampStr(b.name, 120), att ? 1 : 0, att ? Math.max(1, Math.min(50, +b.guests || 1)) : 0,
      clampStr(b.dietary, 300), clampStr(b.message, 1000), clampStr(b.lang, 5), b.source === 'manual' ? 'manual' : 'guest', now).run();
  return { ok: true, id: rid };
}

const rowToRsvp = r => ({ id: r.id, inviteId: r.invite_id, guestId: r.guest_id, name: r.name, attending: !!r.attending, guests: r.guests, dietary: r.dietary, message: r.message, lang: r.lang, source: r.source, at: r.created_at });

async function publicLead(req, env) {
  const ip = req.headers.get('cf-connecting-ip') || 'local', rk = `lead:${ip}`;
  const n = +(await env.STATE.get(rk)) || 0;
  if (n >= 10) return err(429, 'Too many requests.');
  await env.STATE.put(rk, String(n + 1), { expirationTtl: 3600 });
  const b = await readJSON(req, 5000);
  if (b.website) return json({ ok: true });
  if (!b.names) return err(400, 'Names are required.');
  const lead = {}; for (const k of ['names', 'date', 'city', 'guests', 'plan', 'theme', 'model', 'note', 'phone', 'lang']) lead[k] = clampStr(b[k], 600);
  await env.DB.prepare('INSERT INTO leads (id, data, created_at) VALUES (?,?,?)').bind(id(10), JSON.stringify(lead), Date.now()).run();
  return json({ ok: true });
}

/* Photos for invitations: stored in R2, served at /media/uploads/… */
async function upload(req, env) {
  const type = req.headers.get('content-type') || '';
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return err(415, 'Upload a JPEG, PNG or WebP image.');
  const buf = await req.arrayBuffer();
  if (buf.byteLength > 3_000_000) return err(413, 'Image too large (max 3 MB).');
  const key = 'uploads/' + id(16) + '.' + type.split('/')[1].replace('jpeg', 'jpg');
  await env.MEDIA.put(key, buf, { httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' } });
  return json({ url: '/media/' + key });
}

export { HttpError };
