import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadPreviewProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  className?: string;
}

export function ImageUploadPreview({ 
  images, 
  onImagesChange, 
  maxFiles = 5,
  maxSizeInMB = 5,
  className 
}: ImageUploadPreviewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateAndProcessFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError("");
    const newImages: string[] = [];
    const maxSizeBytes = maxSizeInMB * 1024 * 1024;
    const errors: string[] = [];
    let validFileCount = 0;
    let processedCount = 0;

    if (images.length + files.length > maxFiles) {
      setError(`Chỉ có thể tải tối đa ${maxFiles} ảnh`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        errors.push(`"${file.name}" không phải là ảnh`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        errors.push(`"${file.name}" vượt quá ${maxSizeInMB}MB`);
        continue;
      }

      validFileCount++;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
        }
        processedCount++;
        
        if (processedCount === validFileCount) {
          onImagesChange([...images, ...newImages]);
          if (errors.length > 0) {
            setError(errors.join(', '));
          }
        }
      };
      reader.readAsDataURL(file);
    }

    if (validFileCount === 0 && errors.length > 0) {
      setError(errors.join(', '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    validateAndProcessFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError("");
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging 
            ? "border-orange-500 bg-orange-50" 
            : "border-gray-300 hover:border-gray-400",
          images.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={cn(
            "h-10 w-10 mb-3",
            isDragging ? "text-orange-600" : "text-gray-400"
          )} />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isDragging ? "Thả ảnh vào đây" : "Kéo thả ảnh vào đây"}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            hoặc
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={openFilePicker}
            disabled={images.length >= maxFiles}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Chọn ảnh từ máy
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-3">
            Tối đa {maxFiles} ảnh, mỗi ảnh tối đa {maxSizeInMB}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border"
            >
              <img 
                src={image} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Xóa ảnh"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                Ảnh {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-600">
          Đã chọn {images.length}/{maxFiles} ảnh
        </p>
      )}
    </div>
  );
}
