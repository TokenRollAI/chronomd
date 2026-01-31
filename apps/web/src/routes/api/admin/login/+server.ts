import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword } from '$lib/server/utils';
import { createToken } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  const body = await request.json();
  const password = body.password;
  if (!password) return json({ success: false, error: 'Password required' }, { status: 400 });

  const isValid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
  if (!isValid) return json({ success: false, error: 'Invalid password' }, { status: 401 });

  const token = await createToken(env.JWT_SECRET);
  cookies.set('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  return json({ success: true, data: { message: 'Login successful' } });
};
