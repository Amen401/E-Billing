import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Wallet } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  readingValue: string;
  onPaymentComplete: () => void;
}

export const EthiopianPaymentDialog = ({
  open,
  onOpenChange,
  amount,
  readingValue,
  onPaymentComplete,
}: PaymentDialogProps) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [polling, setPolling] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    try {
      const res = await fetch("http://localhost:3000/payment/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, customerId: "USER_ID_FROM_AUTH" }),
      });

      const data = await res.json();

      if (data.checkoutUrl && data.tx_ref) {
        window.open(data.checkoutUrl, "_blank");


        setPolling(true);
        const interval = setInterval(async () => {
          const statusRes = await fetch(`http://localhost:3000/payment/chapa-status/${data.tx_ref}`);
          const statusData = await statusRes.json();

          if (statusData.status === "success") {
            clearInterval(interval);
            setPolling(false);
            setSuccess(true);
            onPaymentComplete();
          } else if (statusData.status === "failed") {
            clearInterval(interval);
            setPolling(false);
            alert("Payment failed. Please try again.");
          }
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Payment error. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] p-6">
        {!success ? (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-bold">Pay Your Bill</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Meter Reading: {readingValue} kWh
              </DialogDescription>
            </DialogHeader>

            <Card className="p-4 mt-4 text-center bg-muted/50 border-border">
              <div className="text-lg font-semibold mb-2">Total Amount</div>
              <div className="text-2xl font-bold text-primary">{amount.toFixed(2)}birr</div>
            </Card>

            <div className="mt-6 text-center space-y-3">
              <Button
                onClick={handlePayment}
                className="w-full bg-gradient-primary flex items-center justify-center gap-2"
                disabled={processing || polling}
              >
                {processing || polling ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white bg-black border-t-transparent rounded-full animate-spin" />
                    {polling ? "Waiting for payment..." : "Processing..."}
                  </span>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Pay with Chapa
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
                disabled={processing || polling}
              >
                Cancel
              </Button>
            </div>

            <Card className="p-3 mt-4 bg-primary/5 border-primary/20 text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              Your payment is secured and encrypted. We never store your payment details.
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
              Your payment of ${amount.toFixed(2)} has been processed successfully.
            </p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};
