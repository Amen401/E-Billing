import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import { customerApi } from "@/lib/api";
import {toast} from 'sonner'

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  readingId: string;
  readingValue: string;
  onPaymentComplete: () => void;
}

export const EthiopianPaymentDialog = ({
  open,
  onOpenChange,
  amount,
  readingId,
  readingValue,
  onPaymentComplete,
}: PaymentDialogProps) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "card">(
    "telebirr"
  );
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

 const pollPaymentStatus = async (tx_ref: string) => {
  try {
    const statusData = await customerApi.checkPaymentStatus(tx_ref);
    console.log("Polling status data:", statusData);

  
    const paymentStatus = statusData.status || statusData.paymentStatus;
    
    if (paymentStatus === "paid" || paymentStatus === "Paid") {
      setSuccess(true);
      onPaymentComplete();
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    } else if (paymentStatus === "failed" || paymentStatus === "Failed") {
      toast.error("Payment failed. Please try again.");
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    } else {
      pollingRef.current = setTimeout(() => pollPaymentStatus(tx_ref), 3000);
    }
  } catch (err) {
    console.error("Polling error:", err);
    pollingRef.current = setTimeout(() => pollPaymentStatus(tx_ref), 3000);
  }
};

  const handlePayment = async () => {
    if (!readingId || processing) return;
    setProcessing(true);

    try {
      const { checkoutUrl, tx_ref } = await customerApi.payBill(
        readingId,
        paymentMethod
      );

      const newTab = window.open(checkoutUrl, "_blank");
      if (!newTab) return alert("Please allow popups.");

      pollPaymentStatus(tx_ref);

      if (import.meta.env.NEXT_PUBLIC_CHAPA_TEST_MODE === "true") {
        await customerApi.forceChapaCallback(tx_ref);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast("Payment initiation failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

useEffect(() => {
  if (!open && pollingRef.current) {
    clearTimeout(pollingRef.current); 
    pollingRef.current = null;
  }
  if (open) setSuccess(false);
  

  return () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  };
}, [open]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] p-6">
        {!success ? (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-bold">
                Pay Your Bill
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Meter Reading: {readingValue} kWh
              </DialogDescription>
            </DialogHeader>

            <Card className="p-4 mt-4 text-center bg-muted/50 border-border">
              <div className="text-lg font-semibold mb-2">Total Amount</div>
              <div className="text-2xl font-bold text-primary">
                {amount.toFixed(2)} birr
              </div>
            </Card>

            <div className="mt-4">
              <label className="text-sm font-medium">Select Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "telebirr" | "card")
                }
                className="w-full mt-1 p-2 border rounded"
                disabled={processing}
              >
                <option value="telebirr">Telebirr</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Pay with {paymentMethod === "telebirr" ? "Telebirr" : "Card"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <Card className="p-3 mt-4 bg-primary/5 border-primary/20 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
              Your payment is secured and encrypted. We never store your payment
              details.
            </Card>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 text-center"
          >
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your payment of {amount.toFixed(2)} birr has been processed successfully.
            </p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};
