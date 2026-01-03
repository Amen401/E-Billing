import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, FileText } from "lucide-react";

interface ComplaintMetricsProps {
  metrics: {
    allComplients: number;
    InProgress: number;
    pendingComplients: number;
    resolvedComplients: number;
  };
}

const ComplaintMetrics = ({ metrics }: ComplaintMetricsProps) => {
  const metricCards = [
    { title: "Total Complaints", value: metrics.allComplients, icon: FileText, color: "text-primary" },
    { title: "In-progress", value: metrics.InProgress, icon: AlertCircle, color: "text-destructive" },
    { title: "Pending", value: metrics.pendingComplients, icon: Clock, color: "text-warning" },
    { title: "Resolved", value: metrics.resolvedComplients, icon: CheckCircle, color: "text-success" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="flex flex-col justify-between p-4 sm:p-3">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm sm:text-xs font-medium">{metric.title}</CardTitle>
              <Icon className={`h-5 w-5 ${metric.color}`} />
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <div className="text-2xl sm:text-xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
export default ComplaintMetrics;