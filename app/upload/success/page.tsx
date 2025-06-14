'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Copy, Download, QrCode, CheckCircle, Clock, Eye, EyeOff, Sparkles, Shield, Link } from 'lucide-react';
import QRCode from 'qrcode';
import { formatDate } from '@/utils/format';

interface SuccessData {
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

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data));
        setSuccessData(parsedData);
        
        QRCode.toDataURL(parsedData.shareUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1F2937',
            light: '#FFFFFF'
          }
        }).then(setQrCodeUrl);
      } catch (error) {
        console.error('データの解析に失敗しました:', error);
      }
    }
  }, [searchParams]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess({ ...copySuccess, [key]: true });
      setTimeout(() => {
        setCopySuccess({ ...copySuccess, [key]: false });
      }, 2000);
    } catch (error) {
      console.error('コピーに失敗しました:', error);
    }
  };

  if (!successData) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50"></div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="glass rounded-3xl p-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">データを読み込んでいます...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            アップロード完了
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            ファイル共有準備完了
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            共有URLとパスワードが生成されました
          </p>
        </div>

        <div className="space-y-8">
          {qrCodeUrl && (
            <div className="flex justify-center">
              <div className="glass rounded-3xl p-8 text-center">
                <div className="bg-white/80 rounded-2xl p-6 inline-block shadow-lg">
                  <img src={qrCodeUrl} alt="QRコード" className="mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-700">
                    QRコードをスキャンしてアクセス
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass rounded-3xl p-1">
              <div className="bg-white/50 rounded-2xl p-8 space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Link className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">共有情報</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                    共有URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={successData.shareUrl}
                      readOnly
                      className="flex-1 block w-full rounded-l-xl border-0 bg-white/80 backdrop-blur-sm text-sm px-4 py-3 shadow-sm text-gray-800"
                    />
                    <button
                      onClick={() => copyToClipboard(successData.shareUrl, 'url')}
                      className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-r-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-sm"
                    >
                      {copySuccess.url ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-purple-600" />
                    アクセスパスワード
                  </label>
                  <div className="flex">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={successData.password}
                      readOnly
                      className="flex-1 block w-full rounded-l-xl border-0 bg-white/80 backdrop-blur-sm text-sm px-4 py-3 shadow-sm font-mono text-gray-800"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="inline-flex items-center px-4 py-3 bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 transition-all duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(successData.password, 'password')}
                      className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-r-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-sm"
                    >
                      {copySuccess.password ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-3xl p-1">
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-orange-800">
                      有効期限
                    </h3>
                  </div>
                  <p className="text-lg font-semibold text-orange-700 mb-2">
                    {formatDate(successData.expiresAt)}
                  </p>
                  <p className="text-sm text-orange-600">
                    期限後、ファイルは自動的に削除されます
                  </p>
                </div>
              </div>

              <div className="glass rounded-3xl p-1">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    セキュリティ情報
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                      パスワードを安全に保管してください
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                      URLとパスワードを別々に共有することを推奨
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
                      期限前でも必要に応じて削除可能
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-1">
            <div className="bg-white/40 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Download className="h-6 w-6 mr-3 text-purple-600" />
                アップロードされたファイル
                <span className="ml-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {successData.files.length}件
                </span>
              </h3>
              <div className="space-y-3">
                {successData.files.map((file, index) => (
                  <div key={index} className="group flex items-center justify-between bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-200 hover:shadow-lg">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                        <Download className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </span>
                        <span className="block text-xs text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={() => window.open(successData.shareUrl, '_blank')}
              className="group relative flex-1 inline-flex items-center justify-center px-8 py-4 overflow-hidden font-semibold transition duration-300 ease-out rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></span>
              <span className="absolute bottom-0 right-0 block w-32 h-32 mb-16 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-12 bg-white rounded-full opacity-10 group-hover:rotate-90 ease"></span>
              <span className="relative flex items-center text-white text-lg">
                <QrCode className="h-6 w-6 mr-3" />
                ファイルを確認
              </span>
            </button>
            <button
              onClick={() => window.location.href = '/upload'}
              className="group flex-1 inline-flex items-center justify-center px-8 py-4 glass rounded-2xl font-semibold text-gray-700 hover:bg-white/80 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="h-6 w-6 mr-3 text-purple-600" />
              新しいアップロード
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50"></div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="glass rounded-3xl p-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">データを読み込んでいます...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}