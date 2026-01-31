interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data;
}

// Public API
export const api = {
  getTimeline: (params?: { page?: number; limit?: number; folder?: string }) =>
    request<{ items: TimelineItem[]; total: number; page: number; limit: number }>('/api/timeline', { params }),

  getFolders: () => request<FolderTree[]>('/api/folders'),

  getDocument: (slug: string, unlockedSlugs: string[] = []) =>
    request<DocumentDetail>(`/api/documents/${slug}`, {
      headers: unlockedSlugs.length ? { 'X-Unlocked-Documents': unlockedSlugs.join(',') } : {}
    }),

  unlockDocument: (slug: string, accessCode: string) =>
    request<{ unlocked: boolean; document: DocumentDetail }>(`/api/documents/${slug}`, {
      method: 'POST',
      body: JSON.stringify({ access_code: accessCode })
    })
};

// Admin API
export const adminApi = {
  login: (password: string) =>
    request<{ message: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    }),

  logout: () =>
    request<{ message: string }>('/api/admin/logout', { method: 'POST' }),

  getDocuments: (params?: { page?: number; limit?: number }) =>
    request<{ items: AdminDocument[]; total: number }>('/api/admin/documents', { params }),

  getDocument: (id: string) =>
    request<AdminDocument & { content: string }>(`/api/admin/documents/${id}`),

  createDocument: (data: CreateDocumentInput) =>
    request<AdminDocument>('/api/admin/documents', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateDocument: (id: string, data: UpdateDocumentInput) =>
    request<AdminDocument>(`/api/admin/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteDocument: (id: string) =>
    request<{ message: string }>(`/api/admin/documents/${id}`, { method: 'DELETE' }),

  getFolders: () => request<Folder[]>('/api/admin/folders'),

  createFolder: (data: CreateFolderInput) =>
    request<Folder>('/api/admin/folders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateFolder: (id: string, data: UpdateFolderInput) =>
    request<Folder>(`/api/admin/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteFolder: (id: string) =>
    request<{ message: string }>(`/api/admin/folders/${id}`, { method: 'DELETE' }),

  getSettings: () => request<SiteSettings>('/api/admin/settings'),

  updateSettings: (settings: Record<string, string>) =>
    request<{ message: string }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
};

// Types
export interface TimelineItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  is_private: boolean;
  published_at: string;
  folder?: { id: string; name: string; slug: string } | null;
}

export interface DocumentDetail {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  is_private: boolean;
  is_locked: boolean;
  published_at: string | null;
  folder?: { id: string; name: string; slug: string } | null;
}

export interface FolderTree {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  children: FolderTree[];
}

export interface Folder {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminDocument {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  folder_id: string | null;
  is_published: number;
  is_private: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  site_title: string;
  site_description: string;
  site_subtitle?: string;
  timezone: string;
  posts_per_page: string;
}

export interface CreateDocumentInput {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  folder_id?: string;
  is_published?: boolean;
  is_private?: boolean;
  access_code?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  folder_id?: string | null;
  is_published?: boolean;
  is_private?: boolean;
  access_code?: string;
}

export interface CreateFolderInput {
  name: string;
  slug?: string;
  parent_id?: string;
  sort_order?: number;
}

export interface UpdateFolderInput {
  name?: string;
  slug?: string;
  parent_id?: string | null;
  sort_order?: number;
}
