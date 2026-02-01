import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server/auth';
import { getQuickNotes, createQuickNote } from '$lib/server/db';

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
  const includeArchived = url.searchParams.get('archived') === 'true';

  const result = await getQuickNotes(env.DB, { page, limit, includeArchived });
  return json({ success: true, data: result });
};

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.content || typeof body.content !== 'string') {
    return json({ success: false, error: 'Content is required' }, { status: 400 });
  }

  if (body.content.length > 500) {
    return json({ success: false, error: 'Content exceeds 500 characters' }, { status: 400 });
  }

  const note = await createQuickNote(env.DB, body.content);
  return json({ success: true, data: note }, { status: 201 });
};
