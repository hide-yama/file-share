import Link from 'next/link';
import { Upload, Shield, Clock, Zap, Lock } from 'lucide-react';

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
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-purple-700 mb-8 shadow-md">
            <Zap className="h-4 w-4 mr-2" />
            高速・安全・簡単
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            大容量ファイル共有サービス AGERUYO
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-gray-700 font-light max-w-2xl mx-auto">
            大切なファイルを
            <span className="font-medium text-purple-600"> 安全に </span>
            共有
          </p>
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/upload"
            className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-4 sm:py-6 overflow-hidden font-medium transition duration-300 ease-out rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600"></span>
            <span className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-pink-500 rounded-full opacity-30 group-hover:rotate-90 ease"></span>
            <span className="relative flex items-center text-white">
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              <span className="text-base sm:text-lg font-semibold">ファイルをアップロード</span>
            </span>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm inline-block px-6 py-2 rounded-full">
            共有URLは自動生成されます
          </p>
        </div>

        <div className="mt-12 sm:mt-24 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
            <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2 sm:p-3 shadow-md">
              <Shield className="h-full w-full text-white" />
            </div>
            <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">セキュア</h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">暗号化保護</p>
          </div>

          <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
            <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2 sm:p-3 shadow-md">
              <Clock className="h-full w-full text-white" />
            </div>
            <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">期限管理</h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">7日で削除</p>
          </div>

          <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
            <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-2 sm:p-3 shadow-md">
              <Zap className="h-full w-full text-white" />
            </div>
            <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">高速転送</h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">最大2GB</p>
          </div>

          <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
            <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-2 sm:p-3 shadow-md">
              <Lock className="h-full w-full text-white" />
            </div>
            <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">プライバシー</h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">完全保護</p>
          </div>
        </div>
      </div>
    </div>
  );
}