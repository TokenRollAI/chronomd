import Conf from 'conf';
import type { CliConfig } from '../types.js';

const config = new Conf<CliConfig>({
  projectName: 'chronomd-cli',
  schema: {
    apiUrl: {
      type: 'string',
      default: '',
    },
    authToken: {
      type: 'string',
      default: '',
    },
  },
});

export function getApiUrl(): string {
  return config.get('apiUrl');
}

export function setApiUrl(url: string): void {
  config.set('apiUrl', url.replace(/\/+$/, ''));
}

export function getAuthToken(): string {
  return config.get('authToken');
}

export function setAuthToken(token: string): void {
  config.set('authToken', token);
}

export function clearAuth(): void {
  config.delete('authToken');
}

export function clearAll(): void {
  config.clear();
}

export function isConfigured(): boolean {
  return !!config.get('apiUrl');
}

export function isAuthenticated(): boolean {
  return !!config.get('apiUrl') && !!config.get('authToken');
}

export function getConfigPath(): string {
  return config.path;
}
