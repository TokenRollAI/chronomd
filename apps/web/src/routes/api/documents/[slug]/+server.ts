import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDocumentBySlug, unlockDocument } from '$lib/server/db';

export const GET: RequestHandler = async ({ params, request, platform }) => {
  const db = platform?.env?.DB;
  const bucket = platform?.env?.BUCKET;
  if (!db || !bucket) return json({ success: false, error: 'Storage not available' }, { status: 500 });

  const unlockedSlugs = request.headers.get('X-Unlocked-Documents')?.split(',') || [];
  const sessionUnlocked = unlockedSlugs.includes(params.slug);

  const doc = await getDocumentBySlug(db, bucket, params.slug, { includeContent: true, sessionUnlocked });
  if (!doc) return json({ success: false, error: 'Document not found' }, { status: 404 });

  return json({ success: true, data: doc });
};

export const POST: RequestHandler = async ({ params, request, platform }) => {
  const db = platform?.env?.DB;
  const bucket = platform?.env?.BUCKET;
  if (!db || !bucket) return json({ success: false, error: 'Storage not available' }, { status: 500 });

  const body = await request.json();
  const accessCode = body.access_code;
  if (!accessCode) return json({ success: false, error: 'Access code required' }, { status: 400 });

  const unlocked = await unlockDocument(db, params.slug, accessCode);
  if (!unlocked) return json({ success: false, error: 'Invalid access code' }, { status: 403 });

  const doc = await getDocumentBySlug(db, bucket, params.slug, { includeContent: true, sessionUnlocked: true });
  return json({ success: true, data: { unlocked: true, document: doc } });
};
