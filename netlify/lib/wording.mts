import { json, err, readJSON, env } from './util.mts';

/* "Write it with Claude": the invitation line in FR / AR / EN. Needs the ANTHROPIC_API_KEY variable. */
export async function wording(req: Request) {
  const key = env('ANTHROPIC_API_KEY');
  if (!key) return err(501, 'Add the ANTHROPIC_API_KEY variable in Netlify to enable this.');
  const b = await readJSON(req, 5000);
  const s = (v: unknown, n: number, d = '') => String(v || d).slice(0, n);
  const prompt = `You write the invitation line for Reefq, a Tunisian digital wedding invitation studio. The line sits directly ABOVE the couple's names, so it must lead into them. Do NOT include the names, the date, the time or the venue.
Write three versions with the same meaning:
- "fr": natural French as written on Tunisian wedding cards
- "ar": elegant Modern Standard Arabic suitable for Tunisian families
- "en": English
Each version 14 to 32 words. Keep the wording modest and dignified, suitable for conservative Muslim families: you may open with a short blessing (for example "بسم الله" / "Au nom de Dieu") when it fits the tone; never mention music, dancing, drinks or alcohol, and never describe anyone's appearance. Tone: ${s(b.tone, 80, 'classic and elegant')}.
Occasion: ${s(b.eventType, 20, 'wedding')}. Bride: ${s(b.bride, 60)}. Groom: ${s(b.groom, 60)}. City: ${s(b.city, 60, 'Tunisia')}.
Return only JSON: {"fr":"...","ar":"...","en":"..."}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: env('ANTHROPIC_MODEL') || 'claude-sonnet-4-5', max_tokens: 700, messages: [{ role: 'user', content: prompt }] })
  });
  if (!r.ok) return err(502, 'Claude did not answer (' + r.status + ').');
  const data: any = await r.json();
  const text = (data.content || []).map((c: any) => c.text || '').join('');
  const m = text.match(/\{[\s\S]*\}/);
  try { const o = JSON.parse(m ? m[0] : text); return json({ fr: String(o.fr || ''), ar: String(o.ar || ''), en: String(o.en || '') }); }
  catch { return err(502, 'Unexpected answer. Try again.'); }
}
