import matter from 'gray-matter';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import type { DocumentMeta } from '../types.js';

export interface ParsedDocument {
  meta: DocumentMeta;
  content: string;
}

export function parseMarkdownFile(filePath: string): ParsedDocument {
  const raw = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const fileName = basename(filePath, '.md');

  const meta: DocumentMeta = {
    title: data.title || fileName,
    slug: data.slug || undefined,
    summary: data.summary || undefined,
    folder: data.folder || undefined,
    published: data.published !== undefined ? Boolean(data.published) : true,
    private: data.private !== undefined ? Boolean(data.private) : false,
    access_code: data.access_code || undefined,
  };

  return { meta, content: content.trim() };
}
