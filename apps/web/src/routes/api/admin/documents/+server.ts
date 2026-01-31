import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server/auth';
import { getAdminDocuments, createDocument } from '$lib/server/db';

async function checkAuth(cookies: import('@sveltejs/kit').Cookies, jwtSecret: string): Promise<boolean> {
  const token = cookies.get('auth_token');
  if (!token) return false;
  return verifyToken(token, jwtSecret);
}

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  const result = await getAdminDocuments(env.DB, { page, limit });
  return json({ success: true, data: result });
};

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const doc = await createDocument(env.DB, env.BUCKET, body);
  return json({ success: true, data: doc }, { status: 201 });
};
