import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ADMIN_PASSWORD_HASH: string;
  JWT_SECRET: string;
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

export interface Document {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  folder_id: string | null;
  is_published: number;
  is_private: number;
  access_code_hash: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface FolderTree extends Folder {
  children: FolderTree[];
}

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

export interface SiteSettings {
  site_title: string;
  site_description: string;
  site_subtitle?: string;
  timezone: string;
  posts_per_page: string;
}
