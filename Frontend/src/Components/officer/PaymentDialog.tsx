import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Zap,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Checkbox } from "@/Components/ui/checkbox";
import type { Customer,MissedMonth } from "@/Page/Types/type";
import MeterImageUpload from "./MeterImageUpload";
import {toast} from "sonner"
import { officerApi } from "@/lib/api";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}


const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const [missedMonths, setMissedMonths] = useState<MissedMonth[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [fine, setFine] = useState<string>("0");
  const [meterImage, setMeterImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      fetchMissedMonths();
    }
  }, [isOpen, customer]);

const fetchMissedMonths = async () => {
  setIsLoadingMonths(true);

  try {
    const res = await officerApi.checkMissedMonths(customer?._id);
    const data = await res;

    console.log("Missed months from backend:", data);

    setMissedMonths(data);
  } catch (error) {
    console.error("Fetch missed months error:", error);
    toast.error("Failed to load missed months");
  } finally {
    setIsLoadingMonths(false);
  }
};


  const handleMonthToggle = (monthId: string) => {
    setSelectedMonths((prev) =>
      prev.includes(monthId)
        ? prev.filter((id) => id !== monthId)
        : [...prev, monthId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMonths.length === missedMonths.length) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths(missedMonths.map((m) => m._id));
    }
  };

  const handleSubmit = async () => {
    if (!meterImage) {
      toast({
        title: "Image Required",
        description: "Please upload a meter reading image",
        variant: "destructive",
      });
      return;
    }

    if (selectedMonths.length === 0) {
      toast({
        title: "Select Months",
        description: "Please select at least one month to pay",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

  
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Payment Processed",
      description: `Successfully processed payment for ${selectedMonths.length} month(s)`,
    });

    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedMonths([]);
    setFine("0");
    setMeterImage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            Process Payment
          </DialogTitle>
          <DialogDescription>
            Process meter reading and payment for {customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Account:</span>
                <p className="font-mono font-medium">{customer.accountNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Meter SN:</span>
                <p className="font-mono font-medium">{customer.meterReaderSN}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-warning" />
                Missed Months
              </Label>
              {missedMonths.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedMonths.length === missedMonths.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              )}
            </div>

            {isLoadingMonths ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Checking missed months...
                </span>
              </div>
            ) : missedMonths.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-success font-medium">
                  No missed payments found
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm text-warning">
                    {missedMonths.length} missed payment(s) found
                  </span>
                </div>
                <div className="grid gap-2">
                  {missedMonths.map((month) => (
                    <label
                      key={month._id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMonths.includes(month._id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={selectedMonths.includes(month._id)}
                        onCheckedChange={() => handleMonthToggle(month._id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {month.month} {month.year}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(month.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="warning">Overdue</Badge>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              Meter Reading Image
            </Label>
            <MeterImageUpload
              onImageSelect={setMeterImage}
              selectedImage={meterImage}
            />
          </div>

          {selectedMonths.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Months:</span>
                  <span className="font-medium">{selectedMonths.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fine Amount:</span>
                  <span className="font-medium">
                    ${parseFloat(fine || "0").toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}


          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="gradient"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedMonths.length === 0 || !meterImage}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
