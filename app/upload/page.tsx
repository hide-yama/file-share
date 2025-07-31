'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, AlertTriangle, Cloud, Sparkles } from 'lucide-react';
import { FileIcon, ErrorAlert, LoadingSpinner } from '@/components/common';
import { formatFileSize } from '@/utils/format';
import { createBrowserClient } from '@/lib/supabase-client';

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const MAX_TOTAL_SIZE = 50 * 1024 * 1024 * 1024; // 50GB (Supabase Free tier limit)
  
  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const existingFiles = [...files];
      
      // 既存のファイルと新しいファイルを結合
      const combinedFiles = [...existingFiles, ...newFiles];
      
      // 重複ファイルを除外（同じ名前とサイズのファイル）
      const uniqueFiles = combinedFiles.filter((file, index, self) => 
        index === self.findIndex((f) => 
          f.name === file.name && f.size === file.size
        )
      );
      
      // 合計サイズをチェック
      const totalSize = uniqueFiles.reduce((total, file) => total + file.size, 0);
      
      if (totalSize > MAX_TOTAL_SIZE) {
        setError(`ファイルサイズの合計が${formatFileSize(MAX_TOTAL_SIZE)}を超えています。`);
        return;
      }
      
      setFiles(uniqueFiles);
      setError('');
      
      // ファイル選択をリセットして、同じファイルを再度選択可能にする
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('ファイルを選択してください。');
      return;
    }
    
    if (getTotalSize() > MAX_TOTAL_SIZE) {
      setError(`ファイルサイズの合計が${formatFileSize(MAX_TOTAL_SIZE)}を超えています。`);
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      // Step 1: プロジェクトを作成してアップロード設定を取得
      const fileInfos = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));

      const response = await fetch('/api/upload/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: fileInfos })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'プロジェクトの作成に失敗しました');
      }

      const { projectId, password, uploadConfigs } = result.data;
      const supabase = createBrowserClient();
      
      // Step 2: 各ファイルを直接Supabase Storageにアップロード
      const uploadedFiles = [];
      const uploadErrors = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const config = uploadConfigs[i];
        
        try {
          // プログレス追跡用のキーを設定
          const progressKey = file.name;
          setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
          
          // Supabase Storageに直接アップロード
          const { error: uploadError } = await supabase.storage
            .from('project-files')
            .upload(config.storagePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            uploadErrors.push({ fileName: file.name, error: uploadError.message });
          } else {
            uploadedFiles.push({
              name: config.fileName,
              size: file.size,
              url: `/api/download/${projectId}/${encodeURIComponent(config.fileName)}`
            });
            setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));
          }
        } catch (error) {
          uploadErrors.push({ 
            fileName: file.name, 
            error: error instanceof Error ? error.message : 'アップロードエラー' 
          });
        }
      }
      
      // エラーがある場合は報告
      if (uploadErrors.length > 0) {
        const errorMessages = uploadErrors.map(e => `${e.fileName}: ${e.error}`).join('\n');
        throw new Error(`一部のファイルのアップロードに失敗しました:\n${errorMessages}`);
      }
      
      // Step 3: 成功ページへ遷移
      const successData = {
        projectId,
        password,
        shareUrl: `${window.location.origin}/share/${projectId}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        files: uploadedFiles
      };
      
      const queryParam = encodeURIComponent(JSON.stringify(successData));
      router.push(`/upload/success?data=${queryParam}`);
    } catch (error) {
      console.error('アップロードに失敗しました:', error);
      setError(error instanceof Error ? error.message : 'アップロードに失敗しました。もう一度お試しください。');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-purple-700 mb-6 shadow-md">
            <Cloud className="h-4 w-4 mr-2" />
            ドラッグ&ドロップでかんたんアップロード
          </div>
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            ファイルをアップロード
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            最大2GBまでのファイルを安全に共有できます
          </p>
        </div>
      
        {error && <ErrorAlert message={error} onClose={() => setError('')} className="mb-8" />}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass rounded-3xl p-1">
            <div className="bg-white/50 rounded-2xl p-8">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <Upload className="h-12 w-12 text-white" />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="file-upload"
                    className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium transition duration-300 ease-out rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600"></span>
                    <span className="absolute bottom-0 right-0 block w-32 h-32 mb-16 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-12 bg-pink-500 rounded-full opacity-30 group-hover:rotate-90 ease"></span>
                    <span className="relative flex items-center text-white font-semibold">
                      <Sparkles className="h-5 w-5 mr-2" />
                      ファイルを選択
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-gray-600 mb-2">
                  またはファイルをここにドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-500 bg-gray-50/80 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                  最大{formatFileSize(MAX_TOTAL_SIZE)}まで（合計）※無料プラン
                </p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="glass rounded-3xl p-1">
              <div className="bg-white/40 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                    選択されたファイル
                  </h3>
                  <div className="flex items-center text-sm bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-gray-600">合計サイズ: </span>
                    <span className={`ml-1 font-semibold ${getTotalSize() > MAX_TOTAL_SIZE * 0.8 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {formatFileSize(getTotalSize())}
                    </span>
                    {getTotalSize() > MAX_TOTAL_SIZE * 0.8 && (
                      <AlertTriangle className="h-4 w-4 text-orange-600 ml-1" />
                    )}
                  </div>
                </div>
                
                <ul className="space-y-4">
                  {files.map((file, index) => (
                    <li key={index} className="group flex items-start justify-between bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-200 hover:shadow-lg">
                      <div className="flex items-start min-w-0 flex-1">
                        <FileIcon fileName={file.name} className="flex-shrink-0 mt-0.5 mr-4" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                            <span className="ml-3 text-xs text-gray-500 bg-gray-100/60 px-2 py-1 rounded-full flex-shrink-0">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                          {isImageFile(file) && (
                            <div className="mt-3">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-24 h-24 object-cover rounded-xl border border-white/40 shadow-md"
                              />
                            </div>
                          )}
                          {isUploading && uploadProgress[file.name] !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>アップロード中...</span>
                                <span>{uploadProgress[file.name]}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[file.name]}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="group-hover:bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 ml-4 p-2 rounded-xl transition-all duration-200 flex-shrink-0"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={isUploading || files.length === 0}
              className="group relative inline-flex items-center justify-center px-12 py-6 overflow-hidden font-semibold transition duration-300 ease-out rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-500 via-blue-500 to-purple-600"></span>
              <span className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-white rounded-full opacity-10 group-hover:rotate-90 ease"></span>
              <span className="relative flex items-center text-white text-lg">
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-3" />
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mr-3" />
                    ファイルをアップロード
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}