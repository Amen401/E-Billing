import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Zap,
  CheckCircle2,
  Loader2,
  Receipt,
  User,
  Hash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Customer, MissedMonth, SubmissionResult } from "@/types";
import MeterImageUpload from "./MeterImageUpload";
import { toast } from "sonner";
import {officerApi} from "@/lib/api";

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
  const [fine, setFine] = useState("0");
  const [meterImage, setMeterImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] =
    useState<SubmissionResult | null>(null);

  useEffect(() => {
    if (isOpen && customer) {
      fetchMissedMonths();
    }
  }, [isOpen, customer]);

  const fetchMissedMonths = async () => {
    console.log(customer._id)
    if (!customer?._id) {
      toast.error("Customer ID is required");
      return;
    }
    setIsLoadingMonths(true);

    try {
      const missed = await officerApi.checkMissedMonths(customer._id);
      setMissedMonths(missed.missedMonths || []);
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

  const handleImageSelect = (file: File | null, preview: string | null) => {
    setMeterImage(file);
    setImagePreview(preview);
    setExtractionResult(null);
  };

  const handleExtractAndCalculate = async () => {
  if (!meterImage || !customer) {
    toast.error("Please upload a meter image first");
    return;
  }

  if (selectedMonths.length === 0) {
    toast.error("Please select at least one month to pay");
    return;
  }

  setIsExtracting(true);

  try {
    const formData = new FormData();

    formData.append("photo", meterImage); 
    formData.append("cId", customer._id);
   formData.append(
  "months",
  JSON.stringify(
    missedMonths
      .filter((m) => selectedMonths.includes(m._id))
      .map((m) => ({
        _id: m._id,
        monthName: m.yearAndMonth, 
      }))
  )
);

    formData.append("fine", fine);

    const response = await officerApi.PayManual(formData);

   setExtractionResult({
  success: true,
  totalBill: response.summary.totalBill,
  totalUsage: response.summary.totalUsage,
  currentRead: response.summary.currentRead,
  previousRead: response.summary.previousRead,
  summary: response.summary,
});

console.log("Extraction result:", response);

    toast.success("Meter reading extracted successfully");
  } catch (error) {
    console.error("Extraction error:", error);
    toast.error("Failed to extract meter reading");
  } finally {
    setIsExtracting(false);
  }
};

  const handleConfirmPayment = async () => {
    if (!extractionResult) {
      toast.error("Please extract meter reading first");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(
        `Payment of ${extractionResult.totalBill?.toFixed(
          2
        )} Birr processed successfully!`
      );
      resetForm();
      onClose();
    } catch (error) {
      toast.error("Failed to confirm payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMonths([]);
    setFine("0");
    setMeterImage(null);
    setImagePreview(null);
    setExtractionResult(null);
    setMissedMonths([]);
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full gradient-primary shadow-glow">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Process Payment</DialogTitle>
              <DialogDescription>
                Process meter reading and payment for {customer.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
       
          <Card className="p-4 bg-muted/30">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Customer</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Account</p>
                  <p className="font-mono font-medium">
                    {customer.accountNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Meter SN</p>
                  <p className="font-mono font-medium">
                    {customer.meterReaderSN}
                  </p>
                </div>
              </div>
            </div>
          </Card>

        
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium">Missed Months</Label>
              </div>
              {missedMonths.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedMonths.length === missedMonths.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              )}
            </div>

            {isLoadingMonths ? (
              <Card className="p-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking missed months...</span>
                </div>
              </Card>
            ) : missedMonths.length === 0 ? (
              <Card className="p-6">
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No missed payments found</span>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 p-2 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{missedMonths.length} missed payment(s) found</span>
                </div>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {missedMonths.map((month) => (
                    <Card
                      key={month._id}
                      className={`p-3 cursor-pointer transition-all duration-200 ${
                        selectedMonths.includes(month._id)
                          ? "border-primary bg-primary/5 shadow-md"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleMonthToggle(month._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedMonths.includes(month._id)}
                            onCheckedChange={() => handleMonthToggle(month._id)}
                          />
                          <div>
                            <p className="font-medium">
                              {month.month} {month.year}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due:{" "}
                              {new Date(
                                month.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fine Amount */}
          <div className="space-y-2">
            <Label htmlFor="fine" className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Fine Amount (Birr)
            </Label>
            <Input
              id="fine"
              type="number"
              min="0"
              value={fine}
              onChange={(e) => setFine(e.target.value)}
              placeholder="Enter fine amount"
            />
          </div>

          {/* Meter Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Meter Reading Image
            </Label>
            <MeterImageUpload
              onImageSelect={handleImageSelect}
              imagePreview={imagePreview}
            />
          </div>

          {/* Extract Button */}
          {meterImage && selectedMonths.length > 0 && !extractionResult && (
            <Button
              onClick={handleExtractAndCalculate}
              disabled={isExtracting}
              className="w-full"
              variant="gradient"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting & Calculating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Extract Reading & Calculate
                </>
              )}
            </Button>
          )}

          {/* Payment Summary */}
          {extractionResult && (
            <Card className="p-4 bg-success/10 border-success/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="font-semibold text-success">
                  Payment Summary
                </h3>
              </div>
              <Separator className="mb-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Selected Months:
                  </span>
                  <span className="font-medium">{selectedMonths.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meter Reading:</span>
                  <span className="font-mono font-medium">
                    {extractionResult.currentRead || "N/A"} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fine:</span>
                  <span className="font-medium">
                    {parseFloat(fine).toFixed(2)} Birr
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-success">
                  <span>Total Payment:</span>
                  <span>{extractionResult.totalBill?.toFixed(2)} Birr</span>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant="success"
              onClick={handleConfirmPayment}
              disabled={!extractionResult || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
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
