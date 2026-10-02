// Morning summary: what the team is asked to do, and which stale orders are cancelled.
import assert from 'node:assert';
import { buildDigest, tnDate, waPhone, AUTO_CANCEL_DAYS } from '../netlify/lib/digest.mts';

const H = 3600e3, D = 24 * H, now = Date.parse('2027-05-10T07:00:00Z'); // 08:00 in Tunis
const order = (code, extra) => ({ code, token: 'tok' + code, names: 'Amel & Hedi', phone: '22 333 444', plan: 'Signature', price: 249, deposit: 249, paid: 0, history: [], proofs: [], createdAt: now - 2 * D, updatedAt: now - 2 * D, status: 'awaiting_payment', ...extra });
const orders = [
  order('RQ-PROOF', { status: 'proof_sent', history: [{ at: now - 5 * H, status: 'proof_sent' }] }),
  order('RQ-UNPD1'),
  order('RQ-FRESH', { createdAt: now - 2 * H }),                                   // too fresh to remind
  order('RQ-STALE', { createdAt: now - (AUTO_CANCEL_DAYS + 1) * D, updatedAt: now - 5 * D }),
  order('RQ-NOBRF', { status: 'paid', paid: 249, paidAt: now - 2 * D }),
  order('RQ-BRIEF', { status: 'paid', paid: 249, paidAt: now - 2 * D, briefAt: now - D }),
  order('RQ-YDAY1', { status: 'paid', paid: 224, paidAt: now - 10 * H, createdAt: now - 20 * H, briefAt: now - H, inviteId: 'wed-y' }),
];
const invitations = [
  { id: 'wed-y', orderCode: 'RQ-YDAY1', a: { name: 'Amel' }, b: { name: 'Hedi' }, date: tnDate(now - D), guests: [] },
  { id: 'wed-soon', orderCode: 'RQ-BRIEF', a: { name: 'Rim' }, b: { name: 'Ali' }, date: tnDate(now + 2 * D), guests: [{}, {}] },
  { id: 'locked', orderCode: 'RQ-UNPD1', locked: true, a: { name: 'X' }, b: { name: 'Y' }, date: tnDate(now + D), designSource: 'canva', canvaStatus: 'waiting_designer' },
  { id: 'custom', orderCode: 'RQ-NOBRF', a: { name: 'Sana' }, b: { name: 'Omar' }, date: '2027-07-01', designSource: 'canva', canvaStatus: 'waiting_designer' },
];
const rsvpKeys = [`wed-soon/${String(now - 12 * H).padStart(14, '0')}-abc`, `wed-soon/${String(now - 40 * H).padStart(14, '0')}-def`];
const d = buildDigest({ orders, invitations, rsvpKeys, now, site: 'https://reefq.com' });

assert.deepEqual(d.autoCancel, ['RQ-STALE']);
assert.match(d.text, /Virements à vérifier \(1\)\n• RQ-PROOF .* reçu il y a 5 h/);
assert.match(d.text, /non payées : relancer \(1\)\n• RQ-UNPD1/);
assert.ok(!/RQ-FRESH|• RQ-STALE/.test(d.text), 'fresh orders wait, stale ones are cancelled, not reminded');
assert.ok(d.text.includes('https://wa.me/21622333444?text='), 'Tunisian 8-digit numbers get the 216 prefix');
assert.ok(decodeURIComponent(d.text).includes('https://reefq.com/commande/RQ-UNPD1?t=tokRQ-UNPD1'));
assert.match(d.text, /pas encore préparée \(1\)\n• RQ-NOBRF/);
assert.match(d.text, /à publier \(designer\) \(1\)\n• Sana & Omar/, 'unpaid (locked) custom designs are not the designer\'s job yet');
assert.match(d.text, /3 prochains jours \(1\)\n• .* Rim & Ali · 2 invités/);
assert.match(d.text, /Mariages d'hier.*\n• Amel & Hedi\n  https:\/\/wa\.me\//);
assert.ok(decodeURIComponent(d.text).includes('https://reefq.com/?ref=RQ-YDAY1'), 'thank-you message carries the referral link');
assert.match(d.text, /Hier : 1 commande\(s\), 1 paiement\(s\) confirmé\(s\) \(224 DT\), 1 réponse\(s\)/);
assert.equal(d.empty, false);

const quiet = buildDigest({ orders: [], invitations: [], rsvpKeys: [], now, site: 'https://reefq.com' });
assert.ok(quiet.empty && /Rien à faire/.test(quiet.text));
assert.equal(waPhone('+216 22 333 444'), '21622333444'); assert.equal(waPhone('0033612345678'), '33612345678'); assert.equal(waPhone('12'), '');
console.log('Morning summary: ok');
