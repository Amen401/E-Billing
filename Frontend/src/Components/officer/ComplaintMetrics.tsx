import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertCircle, Clock, CheckCircle } from "lucide-react";

interface ComplaintMetricsProps {
  metrics: {
    total: number;
    urgent: number;
    pending: number;
    resolved: number;
  };
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
}

const MetricCard = ({ title, value, icon, iconColor }: MetricCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ComplaintMetrics = ({ metrics }: ComplaintMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Complaints"
        value={metrics.total.toString()}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        iconColor="bg-primary/10"
      />
      <MetricCard
        title="Urgent"
        value={metrics.urgent.toString()}
        icon={<AlertCircle className="h-5 w-5 text-destructive" />}
        iconColor="bg-destructive/10"
      />
      <MetricCard
        title="Pending"
        value={metrics.pending.toString()}
        icon={<Clock className="h-5 w-5 text-warning" />}
        iconColor="bg-warning/10"
      />
      <MetricCard
        title="Resolved"
        value={metrics.resolved.toString()}
        icon={<CheckCircle className="h-5 w-5 text-success" />}
        iconColor="bg-success/10"
      />
    </div>
  );
};

export default ComplaintMetrics;
