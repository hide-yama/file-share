import Link from 'next/link';
import { Share2, Upload, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Share2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AGERUYO
            </span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 transition-all duration-200 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">ホーム</span>
            </Link>
            <Link 
              href="/upload" 
              className="group flex items-center space-x-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Upload className="h-4 w-4" />
              <span>アップロード</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}