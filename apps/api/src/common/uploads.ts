import { join } from 'node:path';

// Uploaded files live on disk and are served under /uploads (see main.ts).
export const uploadsDir =
  process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');

export const uploadsPrefix = '/uploads';

export function uploadUrl(fileName: string | null): string | null {
  return fileName ? `${uploadsPrefix}/${fileName}` : null;
}
