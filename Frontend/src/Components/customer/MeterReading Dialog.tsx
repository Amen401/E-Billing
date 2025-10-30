import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import api from "@/lib/api"; // make sure this path is correct

interface MeterReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const MeterReadingDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: MeterReadingDialogProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !imagePreview) {
      toast({
        title: "Error",
        description: "Please select a meter image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Send image data to your backend API
      const response = await api.post("/meter/process-reading", {
        imageData: imagePreview,
      });

      setResult(response.data);
      toast({
        title: "Success",
        description: "Meter reading processed successfully!",
      });

      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setImageFile(null);
        setImagePreview(null);
        setResult(null);
      }, 3000);
    } catch (error: any) {
      console.error("Error processing meter reading:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to process meter reading",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Meter Reading</DialogTitle>
          <DialogDescription>
            Take a clear photo of your electricity meter and our AI will extract
            the reading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="meter-image" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Meter preview"
                    className="max-h-64 mx-auto rounded"
                  />
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Click to upload meter image
                    </p>
                  </div>
                )}
              </div>
              <input
                id="meter-image"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
                disabled={isProcessing}
              />
            </Label>
          </div>

          {result && (
            <Card className="p-6 bg-success/10 border-success/20">
              <h3 className="font-semibold text-lg mb-4">Reading Result</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meter Reading:</span>
                  <span className="font-bold">{result.reading} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Previous Reading:
                  </span>
                  <span>{result.previousReading} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consumption:</span>
                  <span>{result.consumptionKwh} kWh</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">
                    Estimated Amount:
                  </span>
                  <span className="font-bold text-lg text-primary">
                    ETB {result.calculatedAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!imageFile || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Reading"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
