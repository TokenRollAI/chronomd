import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { loginCommand } from './commands/login.js';
import { publishCommand } from './commands/publish.js';
import { listCommand } from './commands/list.js';
import { deleteCommand } from './commands/delete.js';
import { clearAuth } from './lib/config.js';

const program = new Command();

program
  .name('chronomd')
  .description('ChronoMD CLI - 本地 Markdown 发布工具')
  .version('0.1.0');

program
  .command('init')
  .description('初始化配置（设置 API URL）')
  .action(initCommand);

program
  .command('login')
  .description('登录获取认证 token')
  .action(loginCommand);

program
  .command('publish <path>')
  .description('发布 .md 文件或目录')
  .option('--dry-run', '预览操作，不实际执行')
  .action(publishCommand);

program
  .command('list')
  .description('列出远程文档')
  .action(listCommand);

program
  .command('delete <slug>')
  .description('删除指定 slug 的文档')
  .action(deleteCommand);

program
  .command('logout')
  .description('登出，清除本地 token')
  .action(() => {
    clearAuth();
    console.log(chalk.green('✓ 已登出'));
  });

program.parse();
