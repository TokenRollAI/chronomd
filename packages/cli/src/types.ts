export interface CliConfig {
  apiUrl: string;
  authToken: string;
}

export interface DocumentMeta {
  title: string;
  slug?: string;
  summary?: string;
  folder?: string;
  published?: boolean;
  private?: boolean;
  access_code?: string;
}

export interface ApiDocument {
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
  content?: string;
  folder?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ApiFolder {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DocumentListResponse {
  items: ApiDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface PublishResult {
  file: string;
  action: 'created' | 'updated' | 'skipped';
  title: string;
  slug: string;
  error?: string;
}
