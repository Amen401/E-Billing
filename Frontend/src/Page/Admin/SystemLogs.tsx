import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download } from 'lucide-react';

const SystemLogs = () => {
  const systemActivities = [
    { event: 'User "Bob Kim" logged in', user: 'System', timestamp: '2025-07-25 18:30:45', status: 'info', ipAddress: '192.168.1.105' },
    { event: 'Meeting request report generated', user: 'Admin', timestamp: '2025-07-25 18:20:12', status: 'success', ipAddress: '192.168.1.100' },
    { event: 'Tariff plan "Premium" updated', user: 'Admin', timestamp: '2025-07-25 03:15:08', status: 'success', ipAddress: '192.168.1.100' },
    { event: 'Database backup initiated', user: 'System', timestamp: '2025-07-25 02:00:45', status: 'success', ipAddress: 'Server' },
    { event: 'Login attempt failed for "Bob Jones"', user: 'System', timestamp: '2025-07-25 11:45:23', status: 'warning', ipAddress: '192.168.1.150' },
    { event: 'New user "Charlie Brown" registered', user: 'Marketing', timestamp: '2025-07-25 07:30:11', status: 'info', ipAddress: '192.168.1.102' },
    { event: 'Email campaign "Summer Sale" pending delivery', user: 'Marketing', timestamp: '2025-07-24 22:00:789', status: 'pending', ipAddress: '192.168.1.102' },
    { event: 'Customer "Diana Prince" bill generated', user: 'System', timestamp: '2025-07-24 20:15:33', status: 'success', ipAddress: 'Server' },
    { event: 'Officer "Zoe Adams" updated meter reading', user: 'Officer', timestamp: '2025-07-24 15:45:20', status: 'info', ipAddress: '192.168.1.110' },
    { event: 'System maintenance completed', user: 'System', timestamp: '2025-07-24 03:00:00', status: 'success', ipAddress: 'Server' },
    { event: 'Password reset requested by user', user: 'Customer', timestamp: '2025-07-23 19:22:15', status: 'info', ipAddress: '192.168.1.200' },
    { event: 'Unauthorized access attempt blocked', user: 'System', timestamp: '2025-07-23 14:10:55', status: 'warning', ipAddress: '10.0.0.50' },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'default';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
          <p className="text-sm text-slate-600 mt-1">Monitor all system activities and events</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Total Events</p>
            <p className="text-3xl font-bold text-slate-900">1,456</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Success</p>
            <p className="text-3xl font-bold text-green-600">1,289</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Warnings</p>
            <p className="text-3xl font-bold text-orange-600">145</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Errors</p>
            <p className="text-3xl font-bold text-red-600">22</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search logs by event, user, or timestamp..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemActivities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{activity.event}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell>{activity.timestamp}</TableCell>
                  <TableCell className="text-slate-600">{activity.ipAddress}</TableCell>
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

export default SystemLogs;
