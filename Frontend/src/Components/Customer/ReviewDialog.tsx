import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Calendar, Zap } from "lucide-react";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readingValue: string;
  previousReading: string;
  imagePreview: string | null;
  onConfirm: () => void;
}

export const ReviewDialog = ({ open, onOpenChange, readingValue, previousReading, imagePreview, onConfirm }: ReviewDialogProps) => {
  const usage = parseInt(readingValue) - parseInt(previousReading);
  const isHighUsage = usage > 300;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Review Your Reading</DialogTitle>
          <DialogDescription>
            Please verify the details before submitting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Preview */}
          {imagePreview && (
            <Card className="overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Meter reading" 
                className="w-full h-48 object-cover"
              />
            </Card>
          )}

          {/* Reading Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Reading</p>
                  <p className="text-2xl font-bold font-mono">{readingValue}</p>
                  <p className="text-xs text-muted-foreground">kWh</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Previous Reading</p>
                  <p className="text-2xl font-bold font-mono">{previousReading}</p>
                  <p className="text-xs text-muted-foreground">kWh</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Usage Summary */}
          <Card className={`p-4 ${isHighUsage ? 'bg-warning/5 border-warning/30' : 'bg-success/5 border-success/30'}`}>
            <div className="flex items-start gap-3">
              {isHighUsage ? (
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold mb-1">
                  {isHighUsage ? 'Higher Than Usual Usage' : 'Normal Usage Detected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  You've used <span className="font-mono font-semibold">{usage} kWh</span> this billing period.
                  {isHighUsage && ' This is higher than your average usage.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Estimated Bill */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Bill Amount</p>
                <p className="text-xs text-muted-foreground">Based on $0.15 per kWh</p>
              </div>
              <p className="text-3xl font-bold text-primary">${(usage * 0.15).toFixed(2)}</p>
            </div>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1"
          >
            Edit Reading
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1 bg-gradient-primary"
          >
            Confirm & Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
