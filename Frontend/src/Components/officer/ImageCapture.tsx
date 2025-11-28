import { useState, useRef } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImageCaptureProps {
  onImageCapture: (file: File) => void;
  currentImage?: File | null;
  onRemoveImage: () => void;
}

export const ImageCapture = ({ onImageCapture, currentImage, onRemoveImage }: ImageCaptureProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageCapture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemoveImage();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl || currentImage ? (
        <Card className="relative overflow-hidden">
          <img
            src={previewUrl || (currentImage ? URL.createObjectURL(currentImage) : "")}
            alt="Meter reading preview"
            className="w-full h-64 object-contain bg-muted"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleRemove}
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2">
            <div className="bg-success/90 text-success-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Check className="h-3 w-3" />
              Image captured
            </div>
          </div>
        </Card>
      ) : (
        <Card className={cn(
          "border-2 border-dashed border-border hover:border-primary/50 transition-colors",
          "bg-muted/30 p-8"
        )}>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Capture Meter Reading</h3>
              <p className="text-sm text-muted-foreground">Take a photo or upload an image</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => cameraInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Open Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
