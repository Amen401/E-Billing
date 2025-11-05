import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {

  const stats = [
    { title: 'Active Users', value: '12,345', icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Total Revenue', value: '$567,890', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'System Uptime', value: '99.9%', icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'AI Model Accuracy', value: '92.5%', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  const consumptionData = [
    { month: 'Jan', residential: 240, commercial: 180, industrial: 280 },
    { month: 'Feb', residential: 250, commercial: 190, industrial: 290 },
    { month: 'Mar', residential: 260, commercial: 200, industrial: 310 },
    { month: 'Apr', residential: 270, commercial: 210, industrial: 320 },
    { month: 'May', residential: 280, commercial: 220, industrial: 340 },
    { month: 'Jun', residential: 300, commercial: 240, industrial: 360 },
  ];

  const paymentStatusData = [
    { name: 'Completed', value: 65, color: '#22c55e' },
    { name: 'Pending', value: 25, color: '#3b82f6' },
    { name: 'Failed', value: 10, color: '#ef4444' },
  ];

  const systemActivities = [
    { event: 'User "Bob Kim" logged in', user: 'System', timestamp: '2025-07-25 18:30:45', status: 'info' },
    { event: 'Meeting request report generated', user: 'Admin', timestamp: '2025-07-25 18:20:12', status: 'success' },
    { event: 'Tariff plan "Premium" updated', user: 'Admin', timestamp: '2025-07-25 03:15:08', status: 'success' },
    { event: 'Database backup initiated', user: 'System', timestamp: '2025-07-25 02:00:45', status: 'success' },
    { event: 'Login attempt failed for "Bob Jones"', user: 'System', timestamp: '2025-07-25 11:45:23', status: 'warning' },
    { event: 'New user "Charlie Brown" registered', user: 'Marketing', timestamp: '2025-07-25 07:30:11', status: 'info' },
    { event: 'Email campaign "Summer Sale" pending delivery', user: 'Marketing', timestamp: '2025-07-24 22:00:789', status: 'pending' },
  ];

  const allUsers = [
    { name: 'John Thompson', email: 'john.thompson@email.com', role: 'Admin', statusNo: 'USR001', status: 'Active' },
    { name: 'Bob Williams', email: 'bob.williams@email.com', role: 'Officer', statusNo: 'USR002', status: 'Active' },
    { name: 'Charlie Brown', email: 'charlie.brown@email.com', role: 'Customer', statusNo: 'CUS123', status: 'Inactive' },
    { name: 'Diana Prince', email: 'diana.prince@email.com', role: 'Customer', statusNo: 'CUS456', status: 'Active' },
    { name: 'Zoe Adams', email: 'zoe.adams@email.com', role: 'Officer', statusNo: 'USR003', status: 'Active' },
    { name: 'Frank White', email: 'frank.white@email.com', role: 'Admin', statusNo: 'USR004', status: 'Active' },
    { name: 'Grace Hall', email: 'grace.hall@email.com', role: 'Customer', statusNo: 'CUS789', status: 'Active' },
    { name: 'Henry King', email: 'henry.king@email.com', role: 'Officer', statusNo: 'USR011', status: 'Inactive' },
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

  return (
    <div className="space-y-6">
            {/* Key System Metrics */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Key System Metrics</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                      </div>
                      <p className="text-sm text-slate-600">{stat.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Data Visualization */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Data Visualization</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Consumption Trends */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Consumption Trends City-Wide</CardTitle>
                    <p className="text-sm text-slate-600">Monthly kWh for Residential, Commercial and Industrial</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={consumptionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="residential" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="commercial" stroke="#8b5cf6" strokeWidth={2} />
                        <Line type="monotone" dataKey="industrial" stroke="#ec4899" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Payment Status Distribution */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Payment Status Distribution</CardTitle>
                    <p className="text-sm text-slate-600">Percentage of payment statuses for all transactions</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={paymentStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
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
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Recent System Activity</CardTitle>
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
                    {systemActivities.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{activity.event}</TableCell>
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
    </div>
  );
};

export default AdminDashboard;
