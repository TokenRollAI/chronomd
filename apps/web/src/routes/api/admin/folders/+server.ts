import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server/auth';
import { getFolders, createFolder } from '$lib/server/db';

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

  const folders = await getFolders(env.DB);
  return json({ success: true, data: folders });
};

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const folder = await createFolder(env.DB, body);
  return json({ success: true, data: folder }, { status: 201 });
};
