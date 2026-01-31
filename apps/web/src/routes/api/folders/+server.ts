import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFolderTree } from '$lib/server/db';

export const GET: RequestHandler = async ({ platform }) => {
  const db = platform?.env?.DB;
  if (!db) return json({ success: false, error: 'Database not available' }, { status: 500 });

  const folders = await getFolderTree(db);
  return json({ success: true, data: folders });
};
