import type { PageLoad } from './$types';
import { adminApi } from '$lib/api';

export const load: PageLoad = async () => {
  const documents = await adminApi.getDocuments();
  return { documents };
};
