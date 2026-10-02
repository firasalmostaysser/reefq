import type { Config } from '@netlify/functions';
import { sendDigest } from '../lib/digest-run.mts';

/* Every morning at 08:00 Tunis time: the team's to-do list and yesterday's numbers on Telegram/email, plus a full backup on Mondays. */
export default async () => {
  await sendDigest({ send: true, backup: new Date().getUTCDay() === 1 });
};

export const config: Config = { schedule: '0 7 * * *' };
