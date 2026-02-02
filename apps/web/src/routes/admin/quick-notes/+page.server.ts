import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth';
import { getQuickNotes } from '$lib/server/db';

export const load: PageServerLoad = async ({ cookies, platform, url }) => {
  const env = platform?.env;
  if (!env) {
    throw redirect(302, '/admin/login');
  }

  const token = cookies.get('auth_token');
  if (!token || !await verifyToken(token, env.JWT_SECRET)) {
    throw redirect(302, '/admin/login');
  }

  const filter = url.searchParams.get('filter') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1');

  // Determine includeArchived based on filter
  // 'all' = include archived, 'active' = exclude archived, 'archived' = only archived (handled differently)
  const includeArchived = filter !== 'active';

  const result = await getQuickNotes(env.DB, { page, limit: 50, includeArchived });

  // Filter for archived-only view
  let filteredItems = result.items;
  if (filter === 'archived') {
    filteredItems = result.items.filter(item => item.is_archived);
  } else if (filter === 'active') {
    filteredItems = result.items.filter(item => !item.is_archived);
  }

  return {
    notes: {
      items: filteredItems,
      total: filteredItems.length,
      page: result.page,
      limit: result.limit
    },
    filter
  };
};
