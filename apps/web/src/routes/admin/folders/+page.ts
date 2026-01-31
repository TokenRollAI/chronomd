import type { PageLoad } from './$types';
import { adminApi } from '$lib/api';

export const load: PageLoad = async () => {
  const folders = await adminApi.getFolders();
  return { folders };
};
