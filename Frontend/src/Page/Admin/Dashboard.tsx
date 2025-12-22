import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
  Users,
  Shield,
  DollarSign,
  AlertCircle,
  Loader2,
  RefreshCw,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/Components/ui/button";
import type { DashboardResponse } from "../Types/type";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getadmindashboard();
      setData(res);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading dashboard...
        </span>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recent } = data;

  const quickStats = [
    {
      title: "Active Officers",
      value: stats.users.officers.active,
      total: stats.users.officers.total,
      icon: Shield,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Customers",
      value: stats.users.customers.active,
      total: stats.users.customers.total,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Bills",
      value: stats.payments.pending,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Paid Bills",
      value: stats.payments.paid,
      icon: DollarSign,
      color: "text-green-700",
      bg: "bg-green-100",
    },
  ];

  const statusBadge = (active: boolean) =>
    active ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.total !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    / {stat.total}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Officers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.officers.length ? (
              recent.officers.map((o) => (
                <div
                  key={o._id}
                  className="flex justify-between items-center p-2 hover:bg-muted rounded"
                >
                  <div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.department}
                    </p>
                  </div>
                  {statusBadge(o.isActive)}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No officers</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.customers.length ? (
              recent.customers.map((c) => (
                <div
                  key={c._id}
                  className="flex justify-between items-center p-2 hover:bg-muted rounded"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Acc: {c.accountNumber}
                    </p>
                  </div>
                  {statusBadge(c.isActive)}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No customers</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default AdminDashboard;
