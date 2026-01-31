import type { PageLoad } from './$types';
import { adminApi } from '$lib/api';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  try {
    const document = await adminApi.getDocument(params.id);
    return { document };
  } catch (err) {
    throw error(404, 'Document not found');
  }
};
