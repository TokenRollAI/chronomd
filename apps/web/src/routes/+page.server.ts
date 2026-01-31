import type { PageServerLoad } from './$types';
import { getTimeline, getFolderBySlug, getSettings } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, platform }) => {
  const db = platform?.env?.DB;
  if (!db) {
    return {
      timeline: { items: [], total: 0, page: 1, limit: 20 },
      settings: { site_title: 'ChronoMD', site_description: 'A minimalist personal Markdown publishing platform', site_subtitle: '', timezone: 'UTC', posts_per_page: '20' }
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

  const timeline = await getTimeline(db, { page, limit, folder_id: folderId });

  return { timeline, settings };
};
