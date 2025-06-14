export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  password: string;
  qrCode: string;
  expiresAt: Date;
  createdAt: Date;
  files: FileItem[];
}

export interface AccessLog {
  id: string;
  projectId: string;
  accessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}