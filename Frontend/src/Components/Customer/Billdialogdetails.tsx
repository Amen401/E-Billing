import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { 
  Calendar, 
  Zap, 
  Receipt, 
  Camera, 
  Activity,
  Hash,
  Download
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import {StatusBadge} from "./BillsTable"
import type {BillRow} from "@/Page/Types/type"
interface BillDetailDialogProps {
  bill: BillRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BillDetailDialog = ({ bill, open, onOpenChange }: BillDetailDialogProps) => {
  if (!bill) return null;

 const details = [
  {
    icon: Calendar,
    label: "Billing Month",
    value: bill.month ?? "-",
  },
  {
    icon: Zap,
    label: "Meter Reading",
    value: `${Number(bill.killowatRead ?? 0).toLocaleString()} kWh`,
  },
  {
    icon: Activity,
    label: "Monthly Consumption",
    value: `${Number(bill.consumption ?? 0).toLocaleString()} kWh`,
  },
  {
    icon: Receipt,
    label: "Amount Due",
    value: `ETB ${Number(bill.amount ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    highlight: true,
  },
  {
    icon: Calendar,
    label: "Submission Date",
    value: bill.dateOfSubmission ?? "-",
  },
];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden animate-scale-in">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Bill Details
            </DialogTitle>
          <StatusBadge status={bill.status}/>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Separator />
        </div>

        <div className="p-6 space-y-6">
          {bill.photo?.secure_url && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Camera className="w-4 h-4" />
                Meter Reading Photo
              </div>
              <div className="relative group rounded-lg overflow-hidden border border-border bg-muted/30">
                <img
                  src={bill.photo.secure_url}
                  alt="Meter reading"
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={() => window.open(bill.photo?.secure_url, '_blank')}
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  View Full
                </Button>
              </div>
            </div>
          )}

          {/* Bill Details Grid */}
          <div className="grid gap-4">
            {details.map((detail, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <detail.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{detail.label}</span>
                </div>
                <span className={`font-medium ${detail.highlight ? 'text-primary text-lg' : ''}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="gap-1.5 bg-accent/50">
              <Activity className="w-3 h-3" />
              Anomaly: {bill.anomalyStatus}
            </Badge>
            {bill.txRef && (
              <Badge variant="outline" className="gap-1.5 font-mono text-xs">
                <Hash className="w-3 h-3" />
                {bill.txRef.slice(0, 16)}...
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailDialog;
