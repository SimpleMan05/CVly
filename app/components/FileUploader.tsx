import { useCallback, useId } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  file: File | null;
  onFileSelect?: (file: File | null) => void;
}

function FileUploader({ file, onFileSelect }: FileUploaderProps) {
  const inputId = useId();
  const maxFileSize = 20 * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileSelect?.(acceptedFiles[0] || null);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: maxFileSize,
  });

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps({ className: 'uplader-drag-area' })}>
        <input id={inputId} {...getInputProps()} />

        <div className="space-y-4 cursor-pointer">
          {file ? (
            <div className="uploader-selected-file">
              <img src="/images/pdf.png" alt="pdf" className="size-10" />
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-56">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                </div>
              </div>

              <button
                type="button"
                className="p-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect?.(null);
                }}
              >
                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                <img src="/icons/info.svg" alt="upload" className="size-20" />
              </div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">
                  {isDragActive ? 'Drop it here' : 'Click to Upload'}
                </span>
              </p>
              <p className="text-lg text-gray-500">or drag and drop</p>
              <p className="text-lg text-gray-500">
                PDF (max {formatSize(maxFileSize)})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUploader;
