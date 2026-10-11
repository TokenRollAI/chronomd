import type { PageLoad } from './$types';
import { adminApi } from '$lib/api';

export const load: PageLoad = async () => {
  const [allDocs, publishedDocs, recentResult, notes] = await Promise.all([
    adminApi.getDocuments({ limit: 1 }),
    adminApi.getDocuments({ limit: 1, published: true }),
    adminApi.getDocuments({ limit: 5 }),
    adminApi.getQuickNotes({ limit: 1 })
  ]);

  return {
    stats: {
      totalDocuments: allDocs.total,
      publishedDocuments: publishedDocs.total,
      draftDocuments: allDocs.total - publishedDocs.total,
      quickNotes: notes.total
    },
    recentDocuments: recentResult.items
  };
};
