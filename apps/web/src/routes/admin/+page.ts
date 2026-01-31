import type { PageLoad } from './$types';
import { adminApi } from '$lib/api';

export const load: PageLoad = async () => {
  const [allDocs, publishedDocs, recentResult] = await Promise.all([
    adminApi.getDocuments({ limit: 1 }),
    adminApi.getDocuments({ limit: 1, published: true }),
    adminApi.getDocuments({ limit: 5 })
  ]);

  return {
    stats: {
      totalDocuments: allDocs.total,
      publishedDocuments: publishedDocs.total,
      draftDocuments: allDocs.total - publishedDocs.total
    },
    recentDocuments: recentResult.items
  };
};
