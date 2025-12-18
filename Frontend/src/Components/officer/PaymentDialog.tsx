import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Customer, MissedMonth, SubmissionResult } from '@/Types/type';
import MeterImageUpload from './MeterImageUpload';
import { toast } from 'sonner';
import { customerApi, officerApi } from '@/lib/api';

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
  const [fine, setFine] = useState('0');
  const [meterImage, setMeterImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    if (isOpen && customer) {
      fetchMissedMonths();
    }
  }, [isOpen, customer]);

  const fetchMissedMonths = async () => {
    if (!customer) return;
    setIsLoadingMonths(true);

    try {
      const data = await officerApi.checkMissedMonths(customer._id) as { missedMonths: MissedMonth[] };
      setMissedMonths(data.missedMonths || []);
    } catch (error) {
      console.error('Fetch missed months error:', error);
      toast.error('Failed to load missed months');
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
    toast.error('Please upload a meter image first');
    return;
  }

  if (selectedMonths.length === 0) {
    toast.error('Please select at least one month to pay');
    return;
  }

  setIsExtracting(true);

  try {
    // Get the full month objects for selected months
    const selectedMonthObjects = missedMonths.filter(month => 
      selectedMonths.includes(month._id)
    );

    const formData = new FormData();
    formData.append("photo", meterImage);
    formData.append('cId', customer._id);
    
    // Send the full month objects with _id and monthName
    formData.append('months', JSON.stringify(selectedMonthObjects.map(month => ({
      _id: month._id,
      monthName: `${month.month} ${month.year}`
    }))));
    
    formData.append('fine', fine);

    const response = await officerApi.PayManual(formData);

    if (response.message?.includes('not your meter')) {
      toast.error('Meter number does not match customer record');
      return;
    }

    setExtractionResult(response);
    toast.success('Meter reading extracted successfully');
  } catch (error: any) {
    console.error('Extraction error:', error);
    

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error('Failed to extract meter reading');
    }
  } finally {
    setIsExtracting(false);
  }
};

  const handleConfirmPayment = async () => {
    if (!extractionResult) {
      toast.error('Please extract meter reading first');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.success(`Payment of ${extractionResult.totalPayment?.toFixed(2)} Birr processed successfully!`);
      resetForm();
      onClose();
    } catch (error) {
      toast.error('Failed to confirm payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMonths([]);
    setFine('0');
    setMeterImage(null);
    setImagePreview(null);
    setExtractionResult(null);
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
            <div className="p-2 rounded-full bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
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
          {/* Customer Info Card */}
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
                  <p className="font-mono font-medium">{customer.accountNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Meter SN</p>
                  <p className="font-mono font-medium">{customer.meterReaderSN}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Missed Months Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium">Missed Months</Label>
              </div>
              {missedMonths.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedMonths.length === missedMonths.length
                    ? 'Deselect All'
                    : 'Select All'}
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
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No missed payments found</span>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{missedMonths.length} missed payment(s) found</span>
                </div>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {missedMonths.map((month) => (
                    <Card
                      key={month._id}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedMonths.includes(month._id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
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
                              Due: {new Date(month.normalPaymentStartDate).toLocaleDateString()}
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
              variant="secondary"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Extracting & Calculating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Extract Reading & Calculate
                </>
              )}
            </Button>
          )}

          {/* Payment Summary */}
          {extractionResult && (
            <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Payment Summary
                </h3>
              </div>
              <Separator className="mb-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Months:</span>
                  <span className="font-medium">{selectedMonths.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meter Reading:</span>
                  <span className="font-mono font-medium">
                    {extractionResult.meterReadingresult?.kilowatt || 'N/A'} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Usage:</span>
                  <span className="font-mono font-medium">
                    {extractionResult.meterReadingresult?.monthlyUsage?.toFixed(2) || 'N/A'} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fine:</span>
                  <span className="font-medium">{parseFloat(fine).toFixed(2)} Birr</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-green-700 dark:text-green-300">
                  <span>Total Payment:</span>
                  <span>{extractionResult.totalPayment?.toFixed(2)} Birr</span>
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
              onClick={handleConfirmPayment}
              disabled={!extractionResult || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
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
