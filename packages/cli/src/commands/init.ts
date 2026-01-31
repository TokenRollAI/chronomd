import { createInterface } from 'node:readline';
import chalk from 'chalk';
import { setApiUrl, getConfigPath } from '../lib/config.js';

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function initCommand(): Promise<void> {
  console.log(chalk.bold('\nChronoMD CLI 初始化\n'));

  const url = await prompt('API URL (例如 https://chronomd.pdjjq.org): ');

  if (!url) {
    console.log(chalk.red('API URL 不能为空'));
    process.exit(1);
  }

  try {
    new URL(url);
  } catch {
    console.log(chalk.red('无效的 URL 格式'));
    process.exit(1);
  }

  setApiUrl(url);
  console.log(chalk.green('\n✓ 配置已保存'));
  console.log(chalk.gray(`  配置文件: ${getConfigPath()}`));
  console.log(chalk.gray(`  API URL: ${url}`));
  console.log(chalk.yellow('\n运行 `chronomd login` 登录'));
}
