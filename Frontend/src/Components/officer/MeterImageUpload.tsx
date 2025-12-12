import React, { useRef, useState } from "react";
import { Upload, Camera, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface MeterImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
}

const MeterImageUpload: React.FC<MeterImageUploadProps> = ({
  onImageSelect,
  selectedImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clearImage = () => {
    onImageSelect(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 bg-muted/30">
        <img
          src={preview}
          alt="Meter reading preview"
          className="w-full h-48 object-contain bg-background"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
          onClick={clearImage}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
          <p className="text-sm font-medium truncate">{selectedImage?.name}</p>
          <p className="text-xs text-muted-foreground">
            {selectedImage && (selectedImage.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <ImageIcon className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-medium mb-1">Upload meter image</p>
        <p className="text-xs text-muted-foreground mb-4">
          JPG, PNG or WebP • Max 5MB
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Browse
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeterImageUpload;
