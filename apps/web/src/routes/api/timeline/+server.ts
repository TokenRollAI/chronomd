import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTimeline, getFolderBySlug } from '$lib/server/db';

export const GET: RequestHandler = async ({ url, platform }) => {
  const db = platform?.env?.DB;
  if (!db) return json({ success: false, error: 'Database not available' }, { status: 500 });

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const folderSlug = url.searchParams.get('folder');

  let folderId: string | undefined;
  if (folderSlug) {
    const folder = await getFolderBySlug(db, folderSlug);
    if (folder) folderId = folder.id;
  }

  const result = await getTimeline(db, { page, limit, folder_id: folderId });
  return json({ success: true, data: result });
};
