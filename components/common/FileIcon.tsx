import React from 'react';
import { 
  FileText, 
  Image, 
  FileVideo, 
  FileAudio, 
  FileArchive, 
  FileCode, 
  FileSpreadsheet,
  File 
} from 'lucide-react';

interface FileIconProps {
  fileName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ 
  fileName, 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const iconMap: { [key: string]: React.ReactNode } = {
      jpg: <Image className={`${sizeClasses[size]} text-green-600`} />,
      jpeg: <Image className={`${sizeClasses[size]} text-green-600`} />,
      png: <Image className={`${sizeClasses[size]} text-green-600`} />,
      gif: <Image className={`${sizeClasses[size]} text-green-600`} />,
      svg: <Image className={`${sizeClasses[size]} text-green-600`} />,
      webp: <Image className={`${sizeClasses[size]} text-green-600`} />,
      
      mp4: <FileVideo className={`${sizeClasses[size]} text-purple-600`} />,
      avi: <FileVideo className={`${sizeClasses[size]} text-purple-600`} />,
      mov: <FileVideo className={`${sizeClasses[size]} text-purple-600`} />,
      wmv: <FileVideo className={`${sizeClasses[size]} text-purple-600`} />,
      mkv: <FileVideo className={`${sizeClasses[size]} text-purple-600`} />,
      
      mp3: <FileAudio className={`${sizeClasses[size]} text-pink-600`} />,
      wav: <FileAudio className={`${sizeClasses[size]} text-pink-600`} />,
      flac: <FileAudio className={`${sizeClasses[size]} text-pink-600`} />,
      aac: <FileAudio className={`${sizeClasses[size]} text-pink-600`} />,
      ogg: <FileAudio className={`${sizeClasses[size]} text-pink-600`} />,
      
      zip: <FileArchive className={`${sizeClasses[size]} text-yellow-600`} />,
      rar: <FileArchive className={`${sizeClasses[size]} text-yellow-600`} />,
      tar: <FileArchive className={`${sizeClasses[size]} text-yellow-600`} />,
      gz: <FileArchive className={`${sizeClasses[size]} text-yellow-600`} />,
      '7z': <FileArchive className={`${sizeClasses[size]} text-yellow-600`} />,
      
      js: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      jsx: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      ts: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      tsx: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      html: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      css: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      py: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      java: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      cpp: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      c: <FileCode className={`${sizeClasses[size]} text-orange-600`} />,
      
      xls: <FileSpreadsheet className={`${sizeClasses[size]} text-green-700`} />,
      xlsx: <FileSpreadsheet className={`${sizeClasses[size]} text-green-700`} />,
      csv: <FileSpreadsheet className={`${sizeClasses[size]} text-green-700`} />,
      
      pdf: <FileText className={`${sizeClasses[size]} text-red-600`} />,
      doc: <FileText className={`${sizeClasses[size]} text-blue-600`} />,
      docx: <FileText className={`${sizeClasses[size]} text-blue-600`} />,
      txt: <FileText className={`${sizeClasses[size]} text-gray-600`} />,
      md: <FileText className={`${sizeClasses[size]} text-gray-600`} />,
    };

    return iconMap[extension] || <File className={`${sizeClasses[size]} text-gray-500`} />;
  };

  return (
    <span className={className}>
      {getFileIcon(fileName)}
    </span>
  );
};