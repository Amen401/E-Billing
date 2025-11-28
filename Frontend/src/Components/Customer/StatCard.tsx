import { memo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideProps } from "lucide-react";

type LucideIcon = React.ComponentType<LucideProps>;


interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
}

export const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const colorClasses = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className={`text-3xl font-bold ${colorClasses[variant]}`}>{value}</p>
          </div>
          {Icon && <Icon className={`h-8 w-8 ${colorClasses[variant]} opacity-60`} />}
        </div>
      </CardContent>
    </Card>
  );
});
