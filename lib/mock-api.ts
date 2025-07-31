import { generateRandomString } from '@/utils/format';

export interface MockUploadResponse {
  projectId: string;
  password: string;
  shareUrl: string;
  expiresAt: string;
  files: {
    name: string;
    size: number;
    url: string;
  }[];
}

export interface MockProject {
  id: string;
  name: string;
  password: string;
  createdAt: string;
  expiresAt: string;
  files: {
    id: string;
    name: string;
    size: number;
    url: string;
  }[];
}

export async function mockUpload(
  projectName: string, 
  files: File[]
): Promise<MockUploadResponse> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const projectId = generateRandomString(12);
  const password = generateRandomString(12);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const mockFiles = files.map(file => ({
    name: file.name,
    size: file.size,
    url: `${window.location.origin}/api/files/${projectId}/${encodeURIComponent(file.name)}`
  }));
  
  return {
    projectId,
    password,
    shareUrl: `${window.location.origin}/share/${projectId}`,
    expiresAt: expiresAt.toISOString(),
    files: mockFiles
  };
}

export async function mockGetProject(
  projectId: string, 
  password: string
): Promise<MockProject> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (password !== 'test123') {
    throw new Error('パスワードが正しくありません');
  }
  
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - 1);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 6);
  
  return {
    id: projectId,
    name: 'テストプロジェクト',
    password,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    files: [
      {
        id: generateRandomString(8),
        name: 'sample-image.jpg',
        size: 1024 * 1024 * 2,
        url: `${window.location.origin}/api/files/${projectId}/sample-image.jpg`
      },
      {
        id: generateRandomString(8),
        name: 'document.pdf',
        size: 1024 * 512,
        url: `${window.location.origin}/api/files/${projectId}/document.pdf`
      }
    ]
  };
}