/* Team alerts. Both channels are optional; nothing happens when their env vars are missing.
   Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (free, instant on the phone, receipts arrive as files).
   Email (Resend): RESEND_API_KEY + ALERT_EMAIL, optional ALERT_FROM. */
import { env } from './util.mts';

export type Attachment = { name: string; type: string; data: ArrayBuffer };

export function alertsConfigured() {
  return { telegram: !!(env('TELEGRAM_BOT_TOKEN') && env('TELEGRAM_CHAT_ID')), email: !!(env('RESEND_API_KEY') && env('ALERT_EMAIL')) };
}

export async function notify(subject: string, text: string, file?: Attachment) {
  const jobs: Promise<unknown>[] = [];
  const tg = env('TELEGRAM_BOT_TOKEN'), chat = env('TELEGRAM_CHAT_ID');
  if (tg && chat) {
    const api = `https://api.telegram.org/bot${tg}`;
    const body = `${subject}\n\n${text}`.slice(0, 4000);
    if (file) {
      const fd = new FormData();
      fd.set('chat_id', chat); fd.set('caption', body.slice(0, 1000));
      fd.set('document', new Blob([file.data], { type: file.type }), file.name);
      jobs.push(fetch(`${api}/sendDocument`, { method: 'POST', body: fd }));
    } else {
      jobs.push(fetch(`${api}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text: body, disable_web_page_preview: true }) }));
    }
  }
  const rk = env('RESEND_API_KEY'), to = env('ALERT_EMAIL');
  if (rk && to) {
    const payload: any = { from: env('ALERT_FROM') || 'Reefq <onboarding@resend.dev>', to: to.split(',').map(s => s.trim()).filter(Boolean), subject, text };
    if (file && file.data.byteLength < 5_000_000) payload.attachments = [{ filename: file.name, content: Buffer.from(file.data).toString('base64') }];
    jobs.push(fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${rk}`, 'content-type': 'application/json' }, body: JSON.stringify(payload) }));
  }
  const res = await Promise.allSettled(jobs);
  for (const r of res) if (r.status === 'rejected') console.error('notify failed', r.reason);
}

/* Run after the response is sent when the platform allows it. */
export function later(context: any, p: Promise<unknown>) {
  const safe = p.catch(e => console.error('notify failed', e));
  if (context && typeof context.waitUntil === 'function') context.waitUntil(safe);
}

export const siteUrl = () => (env('SITE_URL') || env('URL') || '').replace(/\/$/, '');
