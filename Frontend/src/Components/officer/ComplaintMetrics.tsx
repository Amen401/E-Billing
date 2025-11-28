import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, FileText } from "lucide-react";

interface ComplaintMetricsProps {
  metrics: {
    allComplients: number;
    urgentComplients: number;
    pendingComplients: number;
    resolvedComplients: number;
  };
}

const ComplaintMetrics = ({ metrics }: ComplaintMetricsProps) => {
  const metricCards = [
    {
      title: "Total Complaints",
      value: metrics.allComplients,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Urgent",
      value: metrics.urgentComplients,
      icon: AlertCircle,
      color: "text-destructive",
    },
    {
      title: "Pending",
      value: metrics.pendingComplients,
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Resolved",
      value: metrics.resolvedComplients,
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ComplaintMetrics;
