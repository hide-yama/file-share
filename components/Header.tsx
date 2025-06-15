import Link from 'next/link';
import { Share2, Upload, MessageSquare } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                <Share2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              AGERUYO
            </span>
          </Link>
          
          <nav className="flex items-center space-x-1 sm:space-x-3">
            <Link 
              href="/text" 
              className="group flex items-center space-x-2 p-2 sm:px-5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              title="テキスト"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="hidden sm:inline text-base">テキスト</span>
            </Link>
            <Link 
              href="/upload" 
              className="group flex items-center space-x-2 p-2 sm:px-5 sm:py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              title="アップロード"
            >
              <Upload className="h-5 w-5" />
              <span className="hidden sm:inline text-base">アップロード</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}