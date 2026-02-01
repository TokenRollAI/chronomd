import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server/auth';
import { getQuickNoteById, updateQuickNote, deleteQuickNote } from '$lib/server/db';

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

  const note = await getQuickNoteById(env.DB, params.id);
  if (!note) {
    return json({ success: false, error: 'Note not found' }, { status: 404 });
  }

  return json({ success: true, data: note });
};

export const PUT: RequestHandler = async ({ params, request, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (body.content !== undefined && body.content.length > 500) {
    return json({ success: false, error: 'Content exceeds 500 characters' }, { status: 400 });
  }

  const note = await updateQuickNote(env.DB, params.id, body);
  if (!note) {
    return json({ success: false, error: 'Note not found' }, { status: 404 });
  }

  return json({ success: true, data: note });
};

export const DELETE: RequestHandler = async ({ params, cookies, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  if (!await checkAuth(cookies, env.JWT_SECRET)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await deleteQuickNote(env.DB, params.id);
  if (!deleted) {
    return json({ success: false, error: 'Note not found' }, { status: 404 });
  }

  return json({ success: true });
};
