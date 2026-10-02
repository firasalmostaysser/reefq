// Fills a local or preview Reefq with data, through the studio API (POST /api/import, refused on the live site).
//   npm run seed                       realistic demo couples: one order in every state, live invitations, guests, replies
//   npm run seed -- reefq-backup.json  a backup from Studio → Settings → "Download a backup" (or the Monday Telegram file)
// Env: BASE (default http://localhost:8888), PASSWORD (default change-me, as in .env.example). Needs `npm run dev` running.
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:8888', PASSWORD = process.env.PASSWORD || 'change-me';
const file = process.argv[2];
const data = file ? JSON.parse(readFileSync(file, 'utf8')) : demo();

const login = await fetch(BASE + '/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) });
if (!login.ok) { console.error('Studio sign-in failed:', (await login.json().catch(() => ({}))).error || login.status, '(is `npm run dev` running? is PASSWORD right?)'); process.exit(1); }
const cookie = login.headers.get('set-cookie').split(';')[0];
const r = await fetch(BASE + '/api/import', { method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: JSON.stringify(data) });
const out = await r.json();
if (!r.ok) { console.error('Import refused:', out.error); process.exit(1); }
console.log('Imported', out.counts);
console.log('Studio:', BASE + '/studio/  (password: ' + (process.env.PASSWORD ? '$PASSWORD' : 'change-me') + ')');
for (const { value: o } of data.orders || []) console.log(`  ${o.code}  ${o.status.padEnd(16)} ${o.names.padEnd(18)} client space: ${BASE}/commande/${o.code}?t=${o.token}`);
for (const { value: i } of (data.invitations || []).filter(x => !x.value.locked && x.value.designSource !== 'canva').slice(0, 3)) if (i.guests?.[0]) console.log(`  guest link: ${BASE}/i/${i.id}?g=${i.guests[0].id}`);

/* ---------------- demo couples ---------------- */
function demo() {
  const H = 3600e3, D = 24 * H, now = Date.now(), day = n => new Date(now + n * D + H).toISOString().slice(0, 10);
  let n = 0; const rid = () => 'demo' + String(++n).padStart(6, '0');
  const gid = () => Math.random().toString(36).slice(2, 12).padEnd(10, 'x');
  const orders = [], invitations = [], rsvps = [], opens = [];
  const msg = {
    fr: 'Entourés de leurs familles, ils ont la joie de vous convier à la célébration de leur mariage',
    ar: 'بقلوبٍ يغمرها الفرح، يتشرّفان بدعوتكم لمشاركتهما فرحة زفافهما',
    en: 'Together with their families, they joyfully invite you to celebrate their wedding'
  };
  const FAMILIES = [['Famille Ben Salah', '22 145 678', 4], ['Famille Trabelsi', '98 223 344', 3], ['Amira et Youssef', '55 667 788', 2], ['Famille Gharbi', '20 909 112', 5],
    ['Dr. Kamel Jaziri', '27 300 400', 2], ['Famille Mejri', '93 121 212', 4], ['Souad Hammami', '24 555 010', 1], ['Famille Chaabane', '50 777 001', 3]];
  function add({ code, names, plan, status, ago, wedding, city, phone, brief, guests = 0, replies = 0, site, source, referrer, theme = 'reefq', lang = 'fr' }) {
    const base = { Essentiel: 149, Signature: 249, Prestige: 349 }[plan];
    const price = referrer ? Math.round(base * 0.9) : base;
    const created = now - ago * D, o = {
      code, token: 'demo' + code.slice(3).toLowerCase() + 'x'.repeat(15), status, plan, price, deposit: price, paid: status === 'paid' ? price : 0,
      createdAt: created, updatedAt: created, proofs: [], inviteId: null, adminNote: '', names, date: wedding, city, guests: String(guests * 3 || 150), theme, model: '', note: '', phone, lang,
      history: [{ at: created, status: 'awaiting_payment', note: 'Commande reçue', by: 'client' }], ...(site ? { site, model: 'Olivier doré' } : {}),
      ...(source ? { source } : {}), ...(referrer ? { referrer } : {})
    };
    if (status !== 'awaiting_payment' && status !== 'cancelled') o.history.push({ at: created + 3 * H, status: 'proof_sent', note: 'Justificatif de virement envoyé', by: 'client' });
    if (status === 'rejected') o.history.push({ at: created + 20 * H, status: 'rejected', note: 'Virement introuvable sur le compte', by: 'studio' });
    if (status === 'paid') { o.paidAt = created + 22 * H; o.history.push({ at: o.paidAt, status: 'paid', note: `Virement de ${price} DT vérifié`, by: 'studio' }); }
    if (status === 'cancelled') o.history.push({ at: created + 2 * D, status: 'cancelled', note: 'Le couple a choisi le papier', by: 'studio' });
    if (brief || site) {
      const [a, b] = names.split(' & '), id = `${a}-${b}`.toLowerCase() + '-demo';
      o.inviteId = id;
      if (brief) { o.briefAt = created + H; o.history.splice(1, 0, { at: o.briefAt, status: 'brief', note: 'Invitation préparée par les mariés', by: 'client' }); }
      const gl = FAMILIES.slice(0, guests).map(([name, ph, seats]) => ({ id: gid(), name, phone: ph, seats, ...(status === 'paid' ? { sent: created + D } : {}) }));
      invitations.push({ key: id, value: {
        id, theme, eventType: 'wedding', lang, a: { name: a, ar: '' }, b: { name: b, ar: '' }, date: wedding, time: '20:30', city, venue: brief ? 'Salle des fêtes Dar El Yasmine' : '',
        maps: '', dress: brief ? 'Tenue de soirée' : '', note: '', events: [], message: brief ? msg : { fr: '', ar: '', en: '' }, opening: brief ? 'bismillah' : 'none', photos: [], rsvpBy: '', maxGuests: 2,
        whatsapp: phone, guests: gl, orderCode: code, designSource: site ? 'canva' : 'theme', ...(site ? { siteTemplate: site, canvaStatus: 'waiting_designer' } : {}),
        ...(status === 'paid' ? {} : { locked: true }), createdAt: created + H, updatedAt: created + H
      } });
      gl.slice(0, replies).forEach((g, k) => {
        const at = now - (k + 1) * 7 * H, r = { id: String(at).padStart(14, '0') + '-' + rid(), inviteId: id, guestId: g.id, name: g.name, attending: k !== 2,
          guests: k !== 2 ? g.seats : 0, dietary: k === 1 ? 'Sans gluten pour une personne' : '', message: k === 0 ? 'Mabrouk ! On sera là avec plaisir.' : '', lang: 'fr', source: 'guest', at };
        rsvps.push({ key: id + '/' + r.id, value: r });
      });
      gl.slice(0, replies + 2).forEach((g, k) => opens.push({ key: id + '/' + g.id, value: { guestId: g.id, first: now - (k + 2) * 9 * H, last: now - k * 3 * H, count: 1 + (k % 3) } }));
    }
    orders.push({ key: code, value: o });
  }
  add({ code: 'RQ-DEMO1', names: 'Yasmine & Karim', plan: 'Signature', status: 'awaiting_payment', ago: 0.15, wedding: day(70), city: 'La Marsa', phone: '22 111 222', source: { source: 'facebook', medium: 'post', campaign: 'reel-ouverture' } });
  add({ code: 'RQ-DEMO2', names: 'Ines & Mehdi', plan: 'Signature', status: 'awaiting_payment', ago: 2, wedding: day(45), city: 'Sousse', phone: '98 333 444', brief: true, guests: 3, theme: 'zitouna' });
  add({ code: 'RQ-DEMO3', names: 'Salma & Anis', plan: 'Essentiel', status: 'proof_sent', ago: 1, wedding: day(30), city: 'Sfax', phone: '55 222 111', brief: true, theme: 'layl', source: { source: 'instagram', medium: 'story' } });
  add({ code: 'RQ-DEMO4', names: 'Nour & Sami', plan: 'Signature', status: 'paid', ago: 12, wedding: day(21), city: 'Nabeul', phone: '20 444 555', brief: true, guests: 8, replies: 5, theme: 'yasmine' });
  add({ code: 'RQ-DEMO5', names: 'Hiba & Omar', plan: 'Signature', status: 'paid', ago: 3, wedding: day(60), city: 'Bizerte', phone: '93 666 777' });
  add({ code: 'RQ-DEMO6', names: 'Olfa & Ahmed', plan: 'Prestige', status: 'paid', ago: 5, wedding: day(40), city: 'Hammamet', phone: '27 888 999', brief: true, guests: 4, site: 'olivier-dore' });
  add({ code: 'RQ-DEMO7', names: 'Rania & Fares', plan: 'Essentiel', status: 'rejected', ago: 4, wedding: day(50), city: 'Monastir', phone: '24 123 123' });
  add({ code: 'RQ-DEMO8', names: 'Mariem & Aziz', plan: 'Signature', status: 'cancelled', ago: 20, wedding: day(15), city: 'Tunis', phone: '50 321 321' });
  add({ code: 'RQ-DEMO9', names: 'Amira & Youssef', plan: 'Signature', status: 'paid', ago: 40, wedding: day(-1), city: 'Kairouan', phone: '52 654 654', brief: true, guests: 6, replies: 6, theme: 'kairouan', referrer: 'RQ-DEMO4' });
  return { app: 'reefq', version: 1, exportedAt: new Date(now).toISOString(), orders, invitations, rsvps, opens, 'site-templates': [] };
}
