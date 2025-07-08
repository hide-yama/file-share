import Link from 'next/link';
import { Upload, Shield, Clock, Zap, MessageSquare, FileText, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent tracking-tight">
            NewsFlow
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            ファイルもテキストも
            <span className="font-bold"> 瞬時に安全に </span>
            共有
          </p>
        </div>

        {/* Service Cards */}
        <div className="mt-20 grid grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {/* Text Sharing Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-8 border border-blue-100 hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl mb-4 sm:mb-6">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">テキスト共有</h2>
              <p className="hidden sm:block text-gray-600 mb-4 sm:mb-8 text-sm sm:text-base">
                リアルタイムでテキストを共有<br />
                ルームIDだけで簡単アクセス
              </p>
              <Link
                href="/text"
                className="group inline-flex items-center justify-center px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">テキスト作成</span>
              </Link>
            </div>
          </div>

          {/* File Sharing Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-8 border border-purple-100 hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mb-4 sm:mb-6">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">ファイル共有</h2>
              <p className="hidden sm:block text-gray-600 mb-4 sm:mb-8 text-sm sm:text-base">
                最大2GBまでのファイルを安全に共有<br />
                パスワード保護・7日間の自動削除
              </p>
              <Link
                href="/upload"
                className="group inline-flex items-center justify-center px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">アップロード</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">NewsFlowの特徴</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
              <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2 sm:p-3 shadow-md">
                <Shield className="h-full w-full text-white" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">セキュア</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">パスワード保護</p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
              <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2 sm:p-3 shadow-md">
                <Users className="h-full w-full text-white" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">リアルタイム</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">瞬時に同期</p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
              <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-2 sm:p-3 shadow-md">
                <Zap className="h-full w-full text-white" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">高速・大容量</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">最大2GB対応</p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
              <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-2 sm:p-3 shadow-md">
                <Clock className="h-full w-full text-white" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">自動削除</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">7日で安全削除</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}