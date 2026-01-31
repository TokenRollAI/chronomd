import chalk from 'chalk';
import ora from 'ora';
import { isAuthenticated } from '../lib/config.js';
import { listDocuments } from '../lib/api.js';

export async function listCommand(): Promise<void> {
  if (!isAuthenticated()) {
    console.log(chalk.red('请先登录。运行 `chronomd login`'));
    process.exit(1);
  }

  const spinner = ora('获取文档列表...').start();

  try {
    const data = await listDocuments(1, 100);
    spinner.stop();

    if (data.items.length === 0) {
      console.log(chalk.yellow('没有文档'));
      return;
    }

    console.log(
      chalk.bold(`\n文档列表 (共 ${data.total} 篇)\n`),
    );

    const header = `${'ID'.padEnd(12)} ${'标题'.padEnd(30)} ${'Slug'.padEnd(25)} ${'状态'.padEnd(8)} ${'日期'}`;
    console.log(chalk.gray(header));
    console.log(chalk.gray('─'.repeat(90)));

    for (const doc of data.items) {
      const status = doc.is_published
        ? chalk.green('已发布')
        : chalk.yellow('草稿');
      const priv = doc.is_private ? chalk.red(' [私密]') : '';
      const date = doc.published_at
        ? new Date(doc.published_at).toLocaleDateString('zh-CN')
        : '-';
      const title =
        doc.title.length > 28
          ? doc.title.slice(0, 27) + '…'
          : doc.title;
      const slug =
        doc.slug.length > 23
          ? doc.slug.slice(0, 22) + '…'
          : doc.slug;

      console.log(
        `${chalk.gray(doc.id.slice(0, 10).padEnd(12))} ${title.padEnd(30)} ${slug.padEnd(25)} ${status}${priv}  ${chalk.gray(date)}`,
      );
    }
    console.log('');
  } catch (err: unknown) {
    spinner.fail('获取失败');
    const message = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(message));
    process.exit(1);
  }
}
