const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar',
  '.com', '.pif', '.app', '.gadget', '.msi', '.msp', '.hta',
  '.ps1', '.sh', '.deb', '.rpm', '.dmg', '.pkg'
];

const BLOCKED_MIME_TYPES = [
  'application/x-msdownload',
  'application/x-executable',
  'application/x-winexe',
  'application/x-ms-dos-executable',
  'text/javascript',
  'application/javascript'
];

export function isFileAllowed(filename: string, mimeType?: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  if (mimeType && BLOCKED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return false;
  }
  
  return true;
}

export function isFileSizeAllowed(size: number): boolean {
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
  return size > 0 && size <= MAX_FILE_SIZE;
}

export function isProjectSizeAllowed(totalSize: number, newFileSize: number): boolean {
  const MAX_PROJECT_SIZE = 2 * 1024 * 1024 * 1024; // 2GB (要件に合わせて変更)
  return (totalSize + newFileSize) <= MAX_PROJECT_SIZE;
}

export function sanitizeFilename(filename: string): string {
  // ファイル名と拡張子を分離
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
  
  // 日本語文字を含む非ASCII文字を削除し、英数字とハイフン、アンダースコアのみに限定
  const sanitizedName = name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .replace(/[^\w\-]/g, '_') // 英数字、アンダースコア、ハイフン以外を_に変換
    .replace(/_{2,}/g, '_') // 連続するアンダースコアを1つに
    .replace(/^_|_$/g, '') // 先頭・末尾のアンダースコアを削除
    .trim()
    .substring(0, 200); // 拡張子分の余裕を残す
  
  // 空になった場合はタイムスタンプを使用
  const finalName = sanitizedName || `file_${Date.now()}`;
  
  return finalName + ext;
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}