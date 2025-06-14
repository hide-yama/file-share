'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, Eye, Calendar, FileText, AlertTriangle, Shield, Sparkles, Key } from 'lucide-react';
import { ErrorAlert, LoadingSpinner, FileIcon } from '@/components/common';
import { formatDate, formatFileSize } from '@/utils/format';

interface ProjectData {
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
  totalSize: number;
}

export default function ShareProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'プロジェクトの取得に失敗しました');
        return;
      }

      setProjectData(result.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('認証エラー:', error);
      setError('サーバーエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/download/${projectId}/${encodeURIComponent(fileName)}?password=${encodeURIComponent(password)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('ダウンロードに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      setError('ダウンロードに失敗しました。もう一度お試しください。');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Modern Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass rounded-3xl p-1">
            <div className="bg-white/50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  セキュアアクセス
                </h1>
                <p className="text-lg text-gray-700 mb-3">
                  共有されたパスワードを入力してください
                </p>
                <p className="text-sm text-gray-500 bg-gray-100/60 px-3 py-1 rounded-full inline-block">
                  ID: {projectId.substring(0, 8)}...
                </p>
              </div>

              {error && <ErrorAlert message={error} onClose={() => setError('')} className="mb-6" />}

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Key className="h-4 w-4 mr-2 text-blue-600" />
                    アクセスパスワード
                  </label>
                  <input
                    type="text"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-white/80 backdrop-blur-sm text-lg px-4 py-4 shadow-sm text-gray-800 font-mono text-center tracking-widest placeholder:text-gray-400"
                    placeholder="12桁の英数字"
                    maxLength={12}
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || password.length !== 12}
                  className="group relative w-full inline-flex items-center justify-center px-8 py-4 overflow-hidden font-semibold transition duration-300 ease-out rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></span>
                  <span className="absolute bottom-0 right-0 block w-32 h-32 mb-16 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-12 bg-white rounded-full opacity-10 group-hover:rotate-90 ease"></span>
                  <span className="relative flex items-center text-white text-lg">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-3" />
                        認証中...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-3 h-6 w-6" />
                        ファイルを表示
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-8 text-center">
                <div className="glass rounded-2xl p-4 bg-blue-50/50">
                  <p className="text-sm text-gray-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                    パスワードはファイルの所有者から共有されます
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="glass rounded-3xl p-8">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">プロジェクトデータを読み込んでいます...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(projectData.expiresAt) < new Date();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass rounded-3xl p-1 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50/80 to-green-50/80 px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {projectData.name}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-blue-100/80 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                    {projectData.files.length}件
                  </span>
                  <span className="bg-green-100/80 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                    {formatFileSize(projectData.totalSize)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatDate(projectData.expiresAt)}
                  </span>
                </div>
                {isExpired && (
                  <div className="flex items-center bg-red-100/80 text-red-700 px-3 py-1 rounded-full mt-2">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">期限切れ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/40 rounded-2xl p-8">
            {isExpired && (
              <div className="glass rounded-2xl p-6 mb-8 bg-gradient-to-r from-red-50/80 to-orange-50/80">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-red-800 font-semibold text-lg">
                      このプロジェクトは有効期限が切れています
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      ファイルのダウンロードはできません。
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                ファイル一覧
              </h2>
            
              {projectData.files.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-500 text-lg">ファイルがありません</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {projectData.files.map((file) => (
                    <div
                      key={file.id}
                      className="group flex items-center justify-between bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <FileIcon fileName={file.name} className="flex-shrink-0 mr-4" />
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-medium text-gray-900 truncate mb-2">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-3">
                            <span className="bg-gray-100/80 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
                              {formatFileSize(file.size)}
                            </span>
                            <span className="bg-blue-100/80 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
                              {file.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDownload(file.id, file.name)}
                        disabled={isExpired}
                        className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition duration-300 ease-out rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-500 via-blue-500 to-purple-500"></span>
                        <span className="absolute bottom-0 right-0 block w-16 h-16 mb-8 mr-2 transition duration-500 origin-bottom-left transform rotate-45 translate-x-6 bg-white rounded-full opacity-10 group-hover:rotate-90 ease"></span>
                        <span className="relative flex items-center text-white font-medium">
                          <Download className="h-5 w-5 mr-2" />
                          ダウンロード
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}