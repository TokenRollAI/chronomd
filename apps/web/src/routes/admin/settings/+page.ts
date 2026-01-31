import type { PageLoad } from './$types';
import { adminApi } from '$lib/api';

export const load: PageLoad = async () => {
  const settings = await adminApi.getSettings();
  return { settings };
};
