import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server/auth';
import { getFolderById, updateFolder, deleteFolder } from '$lib/server/db';

async function checkAuth(cookies: import('@sveltejs/kit').Cookies, jwtSecret: string): Promise<boolean> {
  const token = cookies.get('auth_token');
  if (!token) return false;
  return verifyToken(token, jwtSecret);
}

export const GET: RequestHandler = async ({ params, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const folder = await getFolderById(env.DB, params.id);
  if (!folder) return json({ success: false, error: 'Folder not found' }, { status: 404 });

  return json({ success: true, data: folder });
};

export const PUT: RequestHandler = async ({ params, request, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const folder = await updateFolder(env.DB, params.id, body);
  if (!folder) return json({ success: false, error: 'Folder not found' }, { status: 404 });

  return json({ success: true, data: folder });
};

export const DELETE: RequestHandler = async ({ params, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await deleteFolder(env.DB, params.id);
  if (!deleted) return json({ success: false, error: 'Folder not found' }, { status: 404 });

  return json({ success: true, data: { message: 'Folder deleted' } });
};
