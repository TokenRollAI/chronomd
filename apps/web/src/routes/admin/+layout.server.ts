import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth';

// Guard every admin page: without a valid session the client-side loads
// would hit 401s and surface as a 500 error page.
export const load: LayoutServerLoad = async ({ url, cookies, platform }) => {
  if (url.pathname.startsWith('/admin/login')) return {};

  const env = platform?.env;
  const token = cookies.get('auth_token');
  if (!env || !token || !(await verifyToken(token, env.JWT_SECRET))) {
    throw redirect(302, '/admin/login');
  }

  return {};
};
