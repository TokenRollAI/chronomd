import type { Env, Folder, FolderTree, Document, TimelineItem, DocumentDetail, SiteSettings, QuickNote, MixedTimelineItem } from './types';
import { generateId, generateSlug, slugify, hashPassword, verifyPassword } from './utils';

// Settings
export async function getSettings(db: D1Database): Promise<SiteSettings> {
  const result = await db.prepare('SELECT key, value FROM settings').all();
  const settings: Record<string, string> = {};
  for (const row of (result.results || []) as { key: string; value: string }[]) {
    settings[row.key] = row.value;
  }
  return {
    site_title: settings.site_title || 'ChronoMD',
    site_description: settings.site_description || 'A minimalist personal Markdown publishing platform',
    site_subtitle: settings.site_subtitle || '',
    timezone: settings.timezone || 'UTC',
    posts_per_page: settings.posts_per_page || '20'
  };
}

export async function updateSettings(db: D1Database, settings: Record<string, string>): Promise<void> {
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(settings)) {
    await db.prepare(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)'
    ).bind(key, value, now).run();
  }
}

// Folders
export async function getFolders(db: D1Database): Promise<Folder[]> {
  const result = await db.prepare('SELECT * FROM folders ORDER BY sort_order, name').all<Folder>();
  return result.results || [];
}

export async function getFolderTree(db: D1Database): Promise<FolderTree[]> {
  const folders = await getFolders(db);
  return buildTree(folders, null);
}

function buildTree(folders: Folder[], parentId: string | null): FolderTree[] {
  return folders
    .filter(f => f.parent_id === parentId)
    .map(folder => ({
      ...folder,
      children: buildTree(folders, folder.id)
    }));
}

export async function getFolderById(db: D1Database, id: string): Promise<Folder | null> {
  return db.prepare('SELECT * FROM folders WHERE id = ?').bind(id).first<Folder>();
}

export async function getFolderBySlug(db: D1Database, slug: string): Promise<Folder | null> {
  return db.prepare('SELECT * FROM folders WHERE slug = ?').bind(slug).first<Folder>();
}

export async function createFolder(db: D1Database, input: { name: string; slug?: string; parent_id?: string; sort_order?: number }): Promise<Folder> {
  const id = generateId();
  const slug = input.slug ? slugify(input.slug) : generateSlug(input.name);
  const now = new Date().toISOString();

  await db.prepare(
    `INSERT INTO folders (id, name, slug, parent_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, input.name, slug, input.parent_id || null, input.sort_order || 0, now, now).run();

  return { id, name: input.name, slug, parent_id: input.parent_id || null, sort_order: input.sort_order || 0, created_at: now, updated_at: now };
}

export async function updateFolder(db: D1Database, id: string, input: { name?: string; slug?: string; parent_id?: string | null; sort_order?: number }): Promise<Folder | null> {
  const existing = await getFolderById(db, id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) { updates.push('name = ?'); values.push(input.name); }
  if (input.slug !== undefined) { updates.push('slug = ?'); values.push(slugify(input.slug)); }
  if (input.parent_id !== undefined) { updates.push('parent_id = ?'); values.push(input.parent_id); }
  if (input.sort_order !== undefined) { updates.push('sort_order = ?'); values.push(input.sort_order); }

  if (updates.length === 0) return existing;

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await db.prepare(`UPDATE folders SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  return getFolderById(db, id);
}

export async function deleteFolder(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM folders WHERE id = ?').bind(id).run();
  return result.meta.changes > 0;
}

// Timeline
export async function getTimeline(db: D1Database, options: { page?: number; limit?: number; folder_id?: string } = {}): Promise<{ items: TimelineItem[]; total: number; page: number; limit: number }> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const offset = (page - 1) * limit;

  let query = `
    SELECT d.id, d.title, d.slug, d.summary, d.is_private, d.published_at,
           f.id as folder_id, f.name as folder_name, f.slug as folder_slug
    FROM documents d
    LEFT JOIN folders f ON d.folder_id = f.id
    WHERE d.is_published = 1
  `;
  const params: unknown[] = [];

  if (options.folder_id) {
    query += ' AND d.folder_id = ?';
    params.push(options.folder_id);
  }

  query += ' ORDER BY d.published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await db.prepare(query).bind(...params).all();

  let countQuery = 'SELECT COUNT(*) as count FROM documents WHERE is_published = 1';
  const countParams: unknown[] = [];
  if (options.folder_id) {
    countQuery += ' AND folder_id = ?';
    countParams.push(options.folder_id);
  }
  const countResult = await db.prepare(countQuery).bind(...countParams).first<{ count: number }>();

  const items: TimelineItem[] = (result.results || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    summary: row.summary as string | null,
    is_private: Boolean(row.is_private),
    published_at: row.published_at as string,
    folder: row.folder_id ? { id: row.folder_id as string, name: row.folder_name as string, slug: row.folder_slug as string } : null
  }));

  return { items, total: countResult?.count || 0, page, limit };
}

// Documents
export async function getDocumentBySlug(db: D1Database, bucket: R2Bucket, slug: string, options: { includeContent?: boolean; sessionUnlocked?: boolean } = {}): Promise<DocumentDetail | null> {
  const doc = await db.prepare(
    `SELECT d.*, f.id as folder_id, f.name as folder_name, f.slug as folder_slug
     FROM documents d LEFT JOIN folders f ON d.folder_id = f.id
     WHERE d.slug = ? AND d.is_published = 1`
  ).bind(slug).first<Record<string, unknown>>();

  if (!doc) return null;

  const isPrivate = Boolean(doc.is_private);
  const isLocked = isPrivate && !options.sessionUnlocked;

  let content = '';
  if (options.includeContent && !isLocked) {
    const obj = await bucket.get(`documents/${slug}.md`);
    content = obj ? await obj.text() : '';
  }

  return {
    id: doc.id as string,
    title: doc.title as string,
    slug: doc.slug as string,
    summary: doc.summary as string | null,
    content,
    is_private: isPrivate,
    is_locked: isLocked,
    published_at: doc.published_at as string | null,
    folder: doc.folder_id ? { id: doc.folder_id as string, name: doc.folder_name as string, slug: doc.folder_slug as string } : null
  };
}

export async function unlockDocument(db: D1Database, slug: string, accessCode: string): Promise<boolean> {
  const doc = await db.prepare('SELECT access_code_hash FROM documents WHERE slug = ? AND is_private = 1').bind(slug).first<{ access_code_hash: string | null }>();
  if (!doc || !doc.access_code_hash) return false;
  return verifyPassword(accessCode, doc.access_code_hash);
}

// Admin Documents
export async function getAdminDocuments(db: D1Database, options: { page?: number; limit?: number } = {}): Promise<{ items: Document[]; total: number }> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const offset = (page - 1) * limit;

  const result = await db.prepare('SELECT * FROM documents ORDER BY updated_at DESC LIMIT ? OFFSET ?').bind(limit, offset).all<Document>();
  const countResult = await db.prepare('SELECT COUNT(*) as count FROM documents').first<{ count: number }>();

  return { items: result.results || [], total: countResult?.count || 0 };
}

export async function getAdminDocumentById(db: D1Database, id: string): Promise<Document | null> {
  return db.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first<Document>();
}

export async function getDocumentContent(bucket: R2Bucket, slug: string): Promise<string> {
  const obj = await bucket.get(`documents/${slug}.md`);
  return obj ? await obj.text() : '';
}

export async function createDocument(db: D1Database, bucket: R2Bucket, input: { title: string; slug?: string; summary?: string; content: string; folder_id?: string; is_published?: boolean; is_private?: boolean; access_code?: string }): Promise<Document> {
  const id = generateId();
  const slug = input.slug ? slugify(input.slug) : generateSlug(input.title);
  const now = new Date().toISOString();
  const publishedAt = input.is_published ? now : null;
  const accessCodeHash = input.is_private && input.access_code ? await hashPassword(input.access_code) : null;

  await db.prepare(
    `INSERT INTO documents (id, title, slug, summary, folder_id, is_published, is_private, access_code_hash, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, input.title, slug, input.summary || null, input.folder_id || null, input.is_published ? 1 : 0, input.is_private ? 1 : 0, accessCodeHash, publishedAt, now, now).run();

  await bucket.put(`documents/${slug}.md`, input.content, { httpMetadata: { contentType: 'text/markdown; charset=utf-8' } });

  return { id, title: input.title, slug, summary: input.summary || null, folder_id: input.folder_id || null, is_published: input.is_published ? 1 : 0, is_private: input.is_private ? 1 : 0, access_code_hash: accessCodeHash, published_at: publishedAt, created_at: now, updated_at: now };
}

export async function updateDocument(db: D1Database, bucket: R2Bucket, id: string, input: { title?: string; slug?: string; summary?: string; content?: string; folder_id?: string | null; is_published?: boolean; is_private?: boolean; access_code?: string }): Promise<Document | null> {
  const existing = await getAdminDocumentById(db, id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: unknown[] = [];
  let newSlug = existing.slug;

  if (input.title !== undefined) { updates.push('title = ?'); values.push(input.title); }
  if (input.slug !== undefined && input.slug !== existing.slug) { newSlug = slugify(input.slug); updates.push('slug = ?'); values.push(newSlug); }
  if (input.summary !== undefined) { updates.push('summary = ?'); values.push(input.summary); }
  if (input.folder_id !== undefined) { updates.push('folder_id = ?'); values.push(input.folder_id); }
  if (input.is_published !== undefined) {
    updates.push('is_published = ?');
    values.push(input.is_published ? 1 : 0);
    if (input.is_published && !existing.published_at) {
      updates.push('published_at = ?');
      values.push(new Date().toISOString());
    }
  }
  if (input.is_private !== undefined) { updates.push('is_private = ?'); values.push(input.is_private ? 1 : 0); }
  if (input.access_code !== undefined) {
    const hash = input.access_code ? await hashPassword(input.access_code) : null;
    updates.push('access_code_hash = ?');
    values.push(hash);
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  if (updates.length > 1) {
    await db.prepare(`UPDATE documents SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  }

  if (input.content !== undefined) {
    if (newSlug !== existing.slug) {
      await bucket.delete(`documents/${existing.slug}.md`);
    }
    await bucket.put(`documents/${newSlug}.md`, input.content, { httpMetadata: { contentType: 'text/markdown; charset=utf-8' } });
  } else if (newSlug !== existing.slug) {
    const oldContent = await getDocumentContent(bucket, existing.slug);
    await bucket.put(`documents/${newSlug}.md`, oldContent, { httpMetadata: { contentType: 'text/markdown; charset=utf-8' } });
    await bucket.delete(`documents/${existing.slug}.md`);
  }

  return getAdminDocumentById(db, id);
}

export async function deleteDocument(db: D1Database, bucket: R2Bucket, id: string): Promise<boolean> {
  const doc = await db.prepare('SELECT slug FROM documents WHERE id = ?').bind(id).first<{ slug: string }>();
  if (!doc) return false;

  await db.prepare('DELETE FROM documents WHERE id = ?').bind(id).run();
  await bucket.delete(`documents/${doc.slug}.md`);
  return true;
}

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

// Quick Notes
export async function createQuickNote(db: D1Database, content: string): Promise<QuickNote> {
  const id = generateId();
  const now = new Date().toISOString();

  await db.prepare(
    `INSERT INTO quick_notes (id, content, created_at, updated_at, is_archived) VALUES (?, ?, ?, ?, 0)`
  ).bind(id, content, now, now).run();

  return { id, content, created_at: now, updated_at: now, is_archived: 0 };
}

export async function getQuickNotes(db: D1Database, options: { page?: number; limit?: number; includeArchived?: boolean } = {}): Promise<{ items: QuickNote[]; total: number; page: number; limit: number }> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM quick_notes';
  const params: unknown[] = [];

  if (!options.includeArchived) {
    query += ' WHERE is_archived = 0';
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await db.prepare(query).bind(...params).all<QuickNote>();

  let countQuery = 'SELECT COUNT(*) as count FROM quick_notes';
  if (!options.includeArchived) {
    countQuery += ' WHERE is_archived = 0';
  }
  const countResult = await db.prepare(countQuery).first<{ count: number }>();

  return { items: result.results || [], total: countResult?.count || 0, page, limit };
}

export async function getQuickNoteById(db: D1Database, id: string): Promise<QuickNote | null> {
  return db.prepare('SELECT * FROM quick_notes WHERE id = ?').bind(id).first<QuickNote>();
}

export async function updateQuickNote(db: D1Database, id: string, input: { content?: string; is_archived?: boolean }): Promise<QuickNote | null> {
  const existing = await getQuickNoteById(db, id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.content !== undefined) { updates.push('content = ?'); values.push(input.content); }
  if (input.is_archived !== undefined) { updates.push('is_archived = ?'); values.push(input.is_archived ? 1 : 0); }

  if (updates.length === 0) return existing;

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await db.prepare(`UPDATE quick_notes SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  return getQuickNoteById(db, id);
}

export async function deleteQuickNote(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM quick_notes WHERE id = ?').bind(id).run();
  return result.meta.changes > 0;
}

// Mixed Timeline (Documents + Quick Notes)
export async function getMixedTimeline(db: D1Database, options: { page?: number; limit?: number; folder_id?: string } = {}): Promise<{ items: MixedTimelineItem[]; total: number; page: number; limit: number }> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const offset = (page - 1) * limit;

  // Build UNION query for documents and quick notes
  let query = `
    SELECT 'document' as type, d.id, d.title, d.slug, d.summary, d.is_private, d.published_at,
           f.id as folder_id, f.name as folder_name, f.slug as folder_slug, NULL as content
    FROM documents d
    LEFT JOIN folders f ON d.folder_id = f.id
    WHERE d.is_published = 1
  `;

  const params: unknown[] = [];

  if (options.folder_id) {
    query += ' AND d.folder_id = ?';
    params.push(options.folder_id);
  }

  // Only include quick notes if no folder filter
  if (!options.folder_id) {
    query += `
    UNION ALL
    SELECT 'note' as type, id, NULL as title, NULL as slug, NULL as summary, 0 as is_private,
           created_at as published_at, NULL as folder_id, NULL as folder_name, NULL as folder_slug, content
    FROM quick_notes
    WHERE is_archived = 0
    `;
  }

  query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await db.prepare(query).bind(...params).all();

  // Count total
  let countQuery = 'SELECT COUNT(*) as count FROM documents WHERE is_published = 1';
  const countParams: unknown[] = [];
  if (options.folder_id) {
    countQuery += ' AND folder_id = ?';
    countParams.push(options.folder_id);
  }

  let totalDocs = 0;
  let totalNotes = 0;

  const docCountResult = await db.prepare(countQuery).bind(...countParams).first<{ count: number }>();
  totalDocs = docCountResult?.count || 0;

  if (!options.folder_id) {
    const noteCountResult = await db.prepare('SELECT COUNT(*) as count FROM quick_notes WHERE is_archived = 0').first<{ count: number }>();
    totalNotes = noteCountResult?.count || 0;
  }

  const items: MixedTimelineItem[] = (result.results || []).map((row: Record<string, unknown>) => {
    if (row.type === 'note') {
      return {
        type: 'note' as const,
        id: row.id as string,
        content: row.content as string,
        published_at: row.published_at as string
      };
    }
    return {
      type: 'document' as const,
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      summary: row.summary as string | null,
      is_private: Boolean(row.is_private),
      published_at: row.published_at as string,
      folder: row.folder_id ? { id: row.folder_id as string, name: row.folder_name as string, slug: row.folder_slug as string } : null
    };
  });

  return { items, total: totalDocs + totalNotes, page, limit };
}
