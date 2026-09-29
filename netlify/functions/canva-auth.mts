import type { Config } from '@netlify/functions';
import { isStudio } from '../lib/auth.mts';
import { authStartResponse, authCallbackResponse } from '../lib/canva.mts';

export default async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname === '/auth/canva/start') {
    if (!(await isStudio(req))) return new Response('Sign in to the studio first.', { status: 401 });
    return authStartResponse(url);
  }
  if (url.pathname === '/auth/canva/callback') return authCallbackResponse(url);
  return new Response('Not found', { status: 404 });
};

export const config: Config = { path: '/auth/canva/*' };
