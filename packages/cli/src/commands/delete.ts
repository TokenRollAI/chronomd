import { createInterface } from 'node:readline';
import chalk from 'chalk';
import ora from 'ora';
import { isAuthenticated } from '../lib/config.js';
import { listDocuments, deleteDocument } from '../lib/api.js';

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function deleteCommand(slug: string): Promise<void> {
  if (!isAuthenticated()) {
    console.log(chalk.red('请先登录。运行 `chronomd login`'));
    process.exit(1);
  }

  // Find document by slug
  const spinner = ora('查找文档...').start();
  try {
    const data = await listDocuments(1, 1000);
    const doc = data.items.find((d) => d.slug === slug);

    if (!doc) {
      spinner.fail(`未找到 slug 为 "${slug}" 的文档`);
      process.exit(1);
    }

    spinner.stop();
    console.log(
      `\n将删除: ${chalk.bold(doc.title)} (${chalk.gray(doc.slug)})`,
    );

    const confirm = await prompt('确认删除? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log(chalk.gray('已取消'));
      return;
    }

    const deleteSpinner = ora('删除中...').start();
    await deleteDocument(doc.id);
    deleteSpinner.succeed(`已删除 "${doc.title}"`);
  } catch (err: unknown) {
    spinner.fail('操作失败');
    const message = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(message));
    process.exit(1);
  }
}
