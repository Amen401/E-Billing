import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building2, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  readingValue: string;
  onPaymentComplete: () => void;
}

export const PaymentDialog = ({ open, onOpenChange, amount, readingValue, onPaymentComplete }: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "wallet">("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
const handlePayment = async () => {
  try {
    setProcessing(true);

    const res = await fetch("http://localhost:3000/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        email: "hana@example.com",
        name: "Hana",
        customerId: "USER_ID_FROM_AUTH",
      }),
    });

    const data = await res.json();

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
  } catch (err) {
    console.error(err);
  } finally {
    setProcessing(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        {!success ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Complete Payment</DialogTitle>
              <DialogDescription>
                Review your bill and select a payment method
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <Card className="p-4 bg-muted/50 border-border">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Meter Reading</span>
                    <span className="font-mono font-large">{readingValue} kWh</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Usage This Period</span>
                    <span className="font-mono">234 kWh</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Rate per kWh</span>
                    <span className="font-mono">$0.15</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Amount</span>
                    <span className="font-bold text-2xl text-primary">${amount.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <Card 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      paymentMethod === "card" ? "border-primary ring-2 ring-primary/20" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor="card" className="font-semibold cursor-pointer">Credit/Debit Card</Label>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      paymentMethod === "bank" ? "border-primary ring-2 ring-primary/20" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod("bank")}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="bank" id="bank" />
                      <Building2 className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor="bank" className="font-semibold cursor-pointer">Bank Transfer</Label>
                        <p className="text-xs text-muted-foreground">Direct from your bank account</p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      paymentMethod === "wallet" ? "border-primary ring-2 ring-primary/20" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod("wallet")}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Wallet className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor="wallet" className="font-semibold cursor-pointer">Digital Wallet</Label>
                        <p className="text-xs text-muted-foreground">Apple Pay, Google Pay</p>
                      </div>
                    </div>
                  </Card>
                </RadioGroup>
              </div>

              {/* Security Notice */}
              <Card className="p-3 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Your payment is secured with 256-bit SSL encryption. We never store your card details.
                  </p>
                </div>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                className="flex-1 bg-gradient-primary"
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay $${amount.toFixed(2)}`
                )}
              </Button>
            </div>
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
