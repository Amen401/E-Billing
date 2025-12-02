import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readingValue: string;
  previousReading: string;
  imagePreview: string | null;
  onConfirm: () => void;
}

export const ReviewDialog = ({
  open,
  onOpenChange,
  readingValue,
  previousReading,
  imagePreview,
  onConfirm,
}: ReviewDialogProps) => {
  const usage = readingValue ? parseInt(readingValue) - parseInt(previousReading) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Review Your Reading
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {imagePreview && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={imagePreview}
                alt="Meter reading preview"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Previous Reading</span>
              <span className="font-mono font-semibold">{previousReading} kWh</span>
            </div>

            <div className="flex justify-between p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">Current Reading</span>
              <span className="font-mono font-bold text-lg">{readingValue} kWh</span>
            </div>

            <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Usage</span>
              <span className="font-mono font-semibold">{usage} kWh</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-gradient-primary">
            Confirm & Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
