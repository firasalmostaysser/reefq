import { json, err, readJSON } from './lib.js';

/* "Write it with Claude": invitation line in FR / AR / EN. Needs the ANTHROPIC_API_KEY secret. */
export async function wording(req, env) {
  if (!env.ANTHROPIC_API_KEY) return err(501, 'Add the ANTHROPIC_API_KEY secret to enable this.');
  const b = await readJSON(req, 5000);
  const prompt = `You write the invitation line for Reefq, a Tunisian digital wedding invitation studio. The line sits directly ABOVE the couple's names, so it must lead into them. Do NOT include the names, the date, the time or the venue.
Write three versions with the same meaning:
- "fr": natural French as written on Tunisian wedding cards
- "ar": elegant Modern Standard Arabic suitable for Tunisian families
- "en": English
Each version 14 to 32 words. Tone: ${String(b.tone || 'classic and elegant').slice(0, 80)}.
Occasion: ${String(b.eventType || 'wedding').slice(0, 20)}. Bride: ${String(b.bride || '').slice(0, 60)}. Groom: ${String(b.groom || '').slice(0, 60)}. City: ${String(b.city || 'Tunisia').slice(0, 60)}.
Return only JSON: {"fr":"...","ar":"...","en":"..."}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: env.ANTHROPIC_MODEL || 'claude-sonnet-4-5', max_tokens: 700, messages: [{ role: 'user', content: prompt }] })
  });
  if (!r.ok) return err(502, 'Claude did not answer (' + r.status + ').');
  const data = await r.json();
  const text = (data.content || []).map(c => c.text || '').join('');
  const m = text.match(/\{[\s\S]*\}/);
  try { const o = JSON.parse(m ? m[0] : text); return json({ fr: String(o.fr || ''), ar: String(o.ar || ''), en: String(o.en || '') }); }
  catch { return err(502, 'Unexpected answer. Try again.'); }
}
