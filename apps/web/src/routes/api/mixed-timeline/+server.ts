import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMixedTimeline } from '$lib/server/db';

export const GET: RequestHandler = async ({ url, platform }) => {
  const env = platform?.env;
  if (!env) return json({ success: false, error: 'Environment not available' }, { status: 500 });

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const folderId = url.searchParams.get('folder') || undefined;

  const result = await getMixedTimeline(env.DB, { page, limit, folder_id: folderId });
  return json({ success: true, data: result });
};
