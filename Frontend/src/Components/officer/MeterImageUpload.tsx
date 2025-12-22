import React, { useState, useRef } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MeterImageUploadProps {
  onImageSelect: (file: File | null, preview: string | null) => void;
  imagePreview: string | null;
}

const MeterImageUpload: React.FC<MeterImageUploadProps> = ({ onImageSelect, imagePreview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error('Please select a valid image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('File size must be less than 5MB');
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  onImageSelect(file, previewUrl);
};

  const handleClear = () => {
    onImageSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {imagePreview ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={imagePreview}
            alt="Meter reading"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Click to upload meter image
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 5MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default MeterImageUpload;
