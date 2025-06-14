// API レスポンス型定義

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadRequest {
  projectName: string;
  files: File[];
}

export interface UploadResponse {
  projectId: string;
  password: string;
  qrCode: string;
  expiresAt: string;
}

export interface AuthRequest {
  password: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  files: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  expiresAt: string;
}

export interface DownloadRequest {
  projectId: string;
  fileId?: string; // 指定しない場合は全ファイル
}