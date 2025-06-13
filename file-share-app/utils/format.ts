export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export function generateRandomString(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export function validateFileName(fileName: string): boolean {
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  
  if (!fileName || fileName.length === 0) {
    return false;
  }
  
  if (fileName.length > 255) {
    return false;
  }
  
  if (invalidChars.test(fileName)) {
    return false;
  }
  
  const nameWithoutExt = fileName.split('.')[0];
  if (reservedNames.test(nameWithoutExt)) {
    return false;
  }
  
  if (fileName.endsWith('.') || fileName.endsWith(' ')) {
    return false;
  }
  
  return true;
}