import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { adminApi, officerApi } from '@/lib/api';
import { toast } from 'sonner';

interface SystemMetrics {
  activeUsers: number;
  totalRevenue: number;
  systemUptime: number;
  aiModelAccuracy: number;
}

interface ConsumptionData {
  month: string;
  residential: number;
  commercial: number;
  industrial: number;
}

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

interface SystemActivity {
  _id: string;
  event: string;
  user: string;
  timestamp: string;
  status: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  statusNo: string;
  status: string;
}

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<PaymentStatusData[]>([]);
  const [systemActivities, setSystemActivities] = useState<SystemActivity[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, consumptionRes, paymentRes, activitiesRes, usersRes] = await Promise.all([
        adminApi.getSystemMetrics(),
        adminApi.getConsumptionTrends(),
        adminApi.getPaymentStatus(),
        adminApi.getSystemActivities(),
        officerApi.getCustomers(),
      ]);

      setMetrics(metricsRes);
      setConsumptionData(consumptionRes.data || []);
      setPaymentStatusData(paymentRes.data || []);
      setSystemActivities(activitiesRes.activities || []);
      setAllUsers(usersRes.users || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { title: 'Active Users', value: metrics?.activeUsers?.toLocaleString() || '0', icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Total Revenue', value: `$${metrics?.totalRevenue?.toLocaleString() || '0'}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'System Uptime', value: `${metrics?.systemUptime || 0}%`, icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'AI Model Accuracy', value: `${metrics?.aiModelAccuracy || 0}%`, icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
        return 'default';
      case 'inactive':
      case 'warning':
        return 'destructive';
      case 'pending':
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key System Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key System Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Visualization */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Data Visualization</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consumption Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Trends City-Wide</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly kWh for Residential, Commercial and Industrial</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="residential" stroke="#8884d8" name="Residential" />
                  <Line type="monotone" dataKey="commercial" stroke="#82ca9d" name="Commercial" />
                  <Line type="monotone" dataKey="industrial" stroke="#ffc658" name="Industrial" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">Percentage of payment statuses for all transactions</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent System Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemActivities.map((activity) => (
                <TableRow key={activity._id}>
                  <TableCell>{activity.event}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell>{activity.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(activity.status)}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All Users */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status No</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.statusNo}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
