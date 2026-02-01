import type { PageServerLoad } from './$types';
import { getMixedTimeline, getFolderBySlug, getSettings } from '$lib/server/db';
import { verifyToken } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, platform, cookies }) => {
  const db = platform?.env?.DB;
  const jwtSecret = platform?.env?.JWT_SECRET;

  if (!db) {
    return {
      timeline: { items: [], total: 0, page: 1, limit: 20 },
      settings: { site_title: 'ChronoMD', site_description: 'A minimalist personal Markdown publishing platform', site_subtitle: '', timezone: 'UTC', posts_per_page: '20' },
      isLoggedIn: false
    };
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const folderSlug = url.searchParams.get('folder');

  const settings = await getSettings(db);
  const limit = parseInt(settings.posts_per_page) || 20;

  let folderId: string | undefined;
  if (folderSlug) {
    const folder = await getFolderBySlug(db, folderSlug);
    if (folder) folderId = folder.id;
  }

  const timeline = await getMixedTimeline(db, { page, limit, folder_id: folderId });

  // Check login status
  let isLoggedIn = false;
  if (jwtSecret) {
    const token = cookies.get('auth_token');
    if (token) {
      isLoggedIn = await verifyToken(token, jwtSecret);
    }
  }

  return { timeline, settings, isLoggedIn };
};
