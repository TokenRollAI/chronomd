import { createInterface } from 'node:readline';
import chalk from 'chalk';
import { isConfigured, setAuthToken } from '../lib/config.js';
import { login } from '../lib/api.js';

function promptPassword(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    // Use stdout.write to avoid newline, then read
    process.stdout.write(question);
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();

    let password = '';
    const onData = (ch: Buffer) => {
      const c = ch.toString('utf8');
      if (c === '\n' || c === '\r' || c === '\u0004') {
        if (stdin.isTTY) {
          stdin.setRawMode(wasRaw ?? false);
        }
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        rl.close();
        resolve(password);
      } else if (c === '\u0003') {
        process.exit(0);
      } else if (c === '\u007F' || c === '\b') {
        password = password.slice(0, -1);
      } else {
        password += c;
      }
    };
    stdin.on('data', onData);
  });
}

export async function loginCommand(): Promise<void> {
  if (!isConfigured()) {
    console.log(chalk.red('请先运行 `chronomd init` 配置 API URL'));
    process.exit(1);
  }

  const password = await promptPassword('Admin 密码: ');
  if (!password) {
    console.log(chalk.red('密码不能为空'));
    process.exit(1);
  }

  try {
    const { token } = await login(password);
    setAuthToken(token);
    console.log(chalk.green('✓ 登录成功'));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(`✗ 登录失败: ${message}`));
    process.exit(1);
  }
}
