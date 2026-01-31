import { statSync, readdirSync } from 'node:fs';
import { resolve, join, relative, dirname, basename } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { isAuthenticated } from '../lib/config.js';
import { parseMarkdownFile } from '../lib/frontmatter.js';
import {
  listDocuments,
  createDocument,
  updateDocument,
  listFolders,
  createFolder,
} from '../lib/api.js';
import type { ApiDocument, ApiFolder, PublishResult } from '../types.js';

interface FileEntry {
  path: string;
  /** Direct parent directory name relative to the publish root, undefined for root-level files */
  dirName?: string;
}

function collectMarkdownFiles(dirPath: string, rootPath: string): FileEntry[] {
  const entries: FileEntry[] = [];
  const items = readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = join(dirPath, item.name);
    if (item.isDirectory()) {
      entries.push(...collectMarkdownFiles(fullPath, rootPath));
    } else if (item.isFile() && item.name.endsWith('.md')) {
      const rel = relative(rootPath, fullPath);
      const parentDir = dirname(rel);
      entries.push({
        path: fullPath,
        dirName: parentDir === '.' ? undefined : basename(parentDir),
      });
    }
  }
  return entries;
}

function findDocBySlug(
  slug: string,
  docList: ApiDocument[],
): ApiDocument | undefined {
  return docList.find((d) => d.slug === slug);
}

function findFolderByName(
  name: string,
  folderList: ApiFolder[],
): ApiFolder | undefined {
  return folderList.find(
    (f) => f.name === name || f.slug === name,
  );
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Resolve folder ID for a given name, auto-creating if it doesn't exist.
 * Uses a cache to avoid creating duplicates within a single publish run.
 */
async function resolveFolder(
  name: string,
  folderList: ApiFolder[],
  folderCache: Map<string, string>,
  dryRun?: boolean,
): Promise<string | undefined> {
  // Check cache first
  const cached = folderCache.get(name);
  if (cached) return cached;

  // Check existing remote
  const existing = findFolderByName(name, folderList);
  if (existing) {
    folderCache.set(name, existing.id);
    return existing.id;
  }

  if (dryRun) return undefined;

  // Auto-create
  const created = await createFolder({
    name,
    slug: slugify(name),
  });
  folderCache.set(name, created.id);
  folderList.push(created); // keep local list in sync
  return created.id;
}

export async function publishCommand(
  path: string,
  options: { dryRun?: boolean },
): Promise<void> {
  if (!isAuthenticated()) {
    console.log(chalk.red('请先登录。运行 `chronomd login`'));
    process.exit(1);
  }

  const resolved = resolve(path);
  let fileEntries: FileEntry[];
  let isDir = false;

  try {
    const stat = statSync(resolved);
    if (stat.isDirectory()) {
      isDir = true;
      fileEntries = collectMarkdownFiles(resolved, resolved);
      if (fileEntries.length === 0) {
        console.log(chalk.yellow('目录中没有找到 .md 文件'));
        return;
      }
      console.log(chalk.gray(`找到 ${fileEntries.length} 个 .md 文件\n`));
    } else {
      fileEntries = [{ path: resolved }];
    }
  } catch {
    console.log(chalk.red(`路径不存在: ${path}`));
    process.exit(1);
  }

  const spinner = ora('获取远程数据...').start();
  let allDocs: ApiDocument[] = [];
  let allFolderList: ApiFolder[] = [];
  try {
    const [docsResult, folderResult] = await Promise.all([
      listDocuments(1, 1000),
      listFolders(),
    ]);
    allDocs = docsResult.items;
    allFolderList = folderResult;
    spinner.succeed('远程数据已获取');
  } catch (err: unknown) {
    spinner.fail('获取远程数据失败');
    const message = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(message));
    process.exit(1);
  }

  const results: PublishResult[] = [];
  const folderCache = new Map<string, string>();

  for (const entry of fileEntries) {
    const displayPath = relative(process.cwd(), entry.path);
    const fileSpinner = ora(`处理 ${displayPath}`).start();

    try {
      const { meta, content } = parseMarkdownFile(entry.path);

      const slug =
        meta.slug ||
        slugify(meta.title);

      // Resolve folder: frontmatter > directory name (when publishing a dir)
      let folderId: string | undefined;
      const folderName = meta.folder || (isDir ? entry.dirName : undefined);

      if (folderName) {
        if (options.dryRun) {
          const existingFolder = findFolderByName(folderName, allFolderList);
          const folderAction = existingFolder ? '已存在' : '将创建';
          fileSpinner.info(
            `[DRY RUN] ${findDocBySlug(slug, allDocs) ? 'UPDATE' : 'CREATE'} "${meta.title}" (${slug}) → 文件夹: ${folderName} (${folderAction})`,
          );
          results.push({
            file: displayPath,
            action: findDocBySlug(slug, allDocs) ? 'updated' : 'created',
            title: meta.title,
            slug,
          });
          continue;
        }

        folderId = await resolveFolder(
          folderName,
          allFolderList,
          folderCache,
          options.dryRun,
        );
        if (folderId && !findFolderByName(folderName, allFolderList.filter(f => f.id !== folderId))) {
          fileSpinner.text = `已创建文件夹 "${folderName}"，处理 ${displayPath}`;
        }
      }

      const existing = findDocBySlug(slug, allDocs);

      if (options.dryRun) {
        const action = existing ? 'UPDATE' : 'CREATE';
        fileSpinner.info(
          `[DRY RUN] ${action} "${meta.title}" (${slug})`,
        );
        results.push({
          file: displayPath,
          action: existing ? 'updated' : 'created',
          title: meta.title,
          slug,
        });
        continue;
      }

      const payload = {
        title: meta.title,
        slug,
        summary: meta.summary,
        content,
        folder_id: folderId,
        is_published: meta.published !== false,
        is_private: meta.private === true,
        access_code: meta.access_code,
      };

      if (existing) {
        await updateDocument(existing.id, payload);
        fileSpinner.succeed(
          `${chalk.blue('更新')} "${meta.title}" (${slug})${folderId ? ` → ${folderName}` : ''}`,
        );
        results.push({
          file: displayPath,
          action: 'updated',
          title: meta.title,
          slug,
        });
      } else {
        await createDocument(payload);
        fileSpinner.succeed(
          `${chalk.green('创建')} "${meta.title}" (${slug})${folderId ? ` → ${folderName}` : ''}`,
        );
        results.push({
          file: displayPath,
          action: 'created',
          title: meta.title,
          slug,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      fileSpinner.fail(`${displayPath}: ${message}`);
      results.push({
        file: displayPath,
        action: 'skipped',
        title: '',
        slug: '',
        error: message,
      });
    }
  }

  console.log('');
  const created = results.filter((r) => r.action === 'created').length;
  const updated = results.filter((r) => r.action === 'updated').length;
  const skipped = results.filter((r) => r.action === 'skipped').length;
  console.log(
    chalk.bold(
      `完成: ${chalk.green(`${created} 创建`)}, ${chalk.blue(`${updated} 更新`)}, ${chalk.red(`${skipped} 跳过`)}`,
    ),
  );
}
