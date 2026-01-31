import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server/auth';
import { getSettings, updateSettings } from '$lib/server/db';

async function checkAuth(cookies: import('@sveltejs/kit').Cookies, jwtSecret: string): Promise<boolean> {
  const token = cookies.get('auth_token');
  if (!token) return false;
  return verifyToken(token, jwtSecret);
}

export const GET: RequestHandler = async ({ cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getSettings(env.DB);
  return json({ success: true, data: settings });
};

export const PUT: RequestHandler = async ({ request, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  await updateSettings(env.DB, body);
  return json({ success: true, data: { message: 'Settings updated' } });
};
