import type { Config } from '@netlify/functions';

/* Every 15 minutes: start the background Canva sync (scheduled functions stop after 30 seconds). */
export default async () => {
  const env = (globalThis as any).Netlify.env;
  if (!(env.get('CANVA_FOLDER_ID') || env.get('CANVA_TEMPLATES_FOLDER_ID')) || !env.get('SESSION_SECRET')) return;
  const base = env.get('URL') || env.get('SITE_URL');
  await fetch(base + '/.netlify/functions/canva-sync-background', { method: 'POST', headers: { 'x-reefq-key': env.get('SESSION_SECRET') } });
};

export const config: Config = { schedule: '*/15 * * * *' };
