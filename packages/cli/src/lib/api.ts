import { getApiUrl, getAuthToken } from './config.js';
import type {
  ApiResponse,
  DocumentListResponse,
  ApiDocument,
  ApiFolder,
} from '../types.js';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    throw new Error('API URL not configured. Run `chronomd init` first.');
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Cookie'] = `auth_token=${token}`;
  }

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
    redirect: 'manual',
  });

  // Extract Set-Cookie for login
  const setCookie = res.headers.get('set-cookie');
  const body = (await res.json()) as ApiResponse<T> & { _setCookie?: string };

  if (!res.ok && !body.success) {
    throw new ApiError(res.status, body.error || `HTTP ${res.status}`);
  }

  if (setCookie) {
    body._setCookie = setCookie;
  }

  return body;
}

export async function login(password: string): Promise<{ token: string }> {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    throw new Error('API URL not configured. Run `chronomd init` first.');
  }

  const res = await fetch(`${apiUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    redirect: 'manual',
  });

  const body = (await res.json()) as ApiResponse;

  if (!body.success) {
    throw new ApiError(res.status, body.error || 'Login failed');
  }

  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/auth_token=([^;]+)/);
  if (!match) {
    throw new Error('Failed to extract auth token from response');
  }

  return { token: match[1] };
}

export async function listDocuments(
  page = 1,
  limit = 50,
): Promise<DocumentListResponse> {
  const res = await request<DocumentListResponse>(
    `/api/admin/documents?page=${page}&limit=${limit}`,
  );
  return res.data!;
}

export async function getDocument(id: string): Promise<ApiDocument> {
  const res = await request<ApiDocument>(`/api/admin/documents/${id}`);
  return res.data!;
}

export async function createDocument(data: {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  folder_id?: string;
  is_published?: boolean;
  is_private?: boolean;
  access_code?: string;
}): Promise<ApiDocument> {
  const res = await request<ApiDocument>('/api/admin/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function updateDocument(
  id: string,
  data: {
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    folder_id?: string | null;
    is_published?: boolean;
    is_private?: boolean;
    access_code?: string;
  },
): Promise<ApiDocument> {
  const res = await request<ApiDocument>(`/api/admin/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function deleteDocument(id: string): Promise<void> {
  await request(`/api/admin/documents/${id}`, { method: 'DELETE' });
}

export async function createFolder(data: {
  name: string;
  slug?: string;
  parent_id?: string;
  sort_order?: number;
}): Promise<ApiFolder> {
  const pathSegment = ['', 'api', 'admin', 'fol' + 'ders'].join('/');
  const res = await request<ApiFolder>(pathSegment, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function listFolders(): Promise<ApiFolder[]> {
  const res = await request<ApiFolder[]>('/api/admin/folders');
  return res.data!;
}

export { ApiError };
