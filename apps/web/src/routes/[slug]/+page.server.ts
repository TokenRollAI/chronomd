import type { PageServerLoad } from './$types';
import { getDocumentBySlug, getSettings } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { renderMarkdown } from '$lib/utils/markdown';

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
  const db = platform?.env?.DB;
  const bucket = platform?.env?.BUCKET;

  if (!db || !bucket) {
    throw error(500, 'Database not available');
  }

  const settings = await getSettings(db);

  const unlockedCookie = cookies.get('unlocked_docs');
  const unlockedSlugs = unlockedCookie ? unlockedCookie.split(',') : [];
  const sessionUnlocked = unlockedSlugs.includes(params.slug);

  const document = await getDocumentBySlug(db, bucket, params.slug, {
    includeContent: true,
    sessionUnlocked
  });

  if (!document) {
    throw error(404, 'Document not found');
  }

  // Pre-render markdown on server
  let renderedContent = '';
  if (!document.is_locked && document.content) {
    renderedContent = await renderMarkdown(document.content);
  }

  return { document, settings, renderedContent };
};
