import { useRef, useState } from 'react';
import type { Attachment } from '../types';
import { generateId } from '../utils/status';

interface AttachmentUploaderProps {
  files: Attachment[];
  onChange: (files: Attachment[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/json'];

export function AttachmentUploader({ files, onChange, disabled }: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): { valid: boolean; message: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, message: `${file.name} 超过大小限制（最大 5MB）` };
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|json)$/i)) {
      return { valid: false, message: `${file.name} 类型不允许，请上传图片、PDF、文档或表格文件` };
    }
    return { valid: true, message: '' };
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    
    setError('');
    const newFiles: Attachment[] = [];
    let processed = 0;
    const totalFiles = fileList.length;
    
    Array.from(fileList).forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(prev => prev ? `${prev}\n${validation.message}` : validation.message);
        processed++;
        if (processed === totalFiles && newFiles.length > 0) {
          onChange([...files, ...newFiles]);
        }
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        newFiles.push({
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: e.target?.result as string,
          uploadedAt: new Date().toISOString(),
        });
        processed++;
        if (processed === totalFiles) {
          onChange([...files, ...newFiles]);
        }
      };
      reader.onerror = () => {
        setError(prev => prev ? `${prev}\n无法读取 ${file.name}` : `无法读取 ${file.name}`);
        processed++;
        if (processed === totalFiles && newFiles.length > 0) {
          onChange([...files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled}
        />
        <svg
          className="mx-auto h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          点击或拖拽文件到此处上传
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          支持图片、PDF、文档、表格，单文件最大 5MB
        </p>
      </div>

      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
            >
              <div className="flex items-center space-x-2 truncate">
                <svg
                  className="h-4 w-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <a
                  href={file.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {file.name}
                </a>
                <span className="text-gray-400 flex-shrink-0">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(file.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
