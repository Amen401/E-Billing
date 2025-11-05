import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Monitor, CheckCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";

const SubmitReading = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const toast = Toaster;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      toast({
        title: "Reading Submitted",
        description: "Your meter reading has been successfully submitted.",
      });
      setSelectedFile(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Submit Your Meter Reading
        </h1>
      </div>

      <Card className="p-8">
        <div className="flex gap-3 mb-6">
          <Button variant="default" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          <Button variant="outline" className="flex-1">
            <span className="text-sm">Manual Entry</span>
          </Button>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {selectedFile
                ? selectedFile.name
                : "Drag and drop your meter image here or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Accepted formats: JPG, PNG, Max file size: 5MB
            </p>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
            />
            <label htmlFor="fileInput">
              <Button type="button" variant="outline" asChild>
                <span className="cursor-pointer">Browse Files</span>
              </Button>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button variant="outline" className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Capture from Camera
          </Button>
          <Button variant="outline" className="w-full">
            <Monitor className="w-4 h-4 mr-2" />
            Upload from Device
          </Button>
        </div>

        {selectedFile && (
          <Button onClick={handleSubmit} className="w-full mt-6">
            Submit Reading
          </Button>
        )}

        <Card className="mt-8 p-4 bg-success/5 border-success/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Last Submitted Reading:{" "}
                <span className="font-bold">12589 kWh</span> on 2024-03-28
              </p>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default SubmitReading;
