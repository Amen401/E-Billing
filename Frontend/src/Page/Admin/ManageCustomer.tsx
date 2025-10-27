import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Filter } from 'lucide-react';

const ManageCustomers = () => {
  const customers = [
    { name: 'John Thompson', email: 'john.thompson@email.com', customerId: 'CUS001', meterNo: 'MTR1001', status: 'Active', outstanding: '$0' },
    { name: 'Charlie Brown', email: 'charlie.brown@email.com', customerId: 'CUS123', meterNo: 'MTR1002', status: 'Inactive', outstanding: '$150' },
    { name: 'Diana Prince', email: 'diana.prince@email.com', customerId: 'CUS456', meterNo: 'MTR1003', status: 'Active', outstanding: '$0' },
    { name: 'Grace Hall', email: 'grace.hall@email.com', customerId: 'CUS789', meterNo: 'MTR1004', status: 'Active', outstanding: '$75' },
    { name: 'Emma Wilson', email: 'emma.wilson@email.com', customerId: 'CUS234', meterNo: 'MTR1005', status: 'Active', outstanding: '$0' },
    { name: 'Oliver Davis', email: 'oliver.davis@email.com', customerId: 'CUS567', meterNo: 'MTR1006', status: 'Inactive', outstanding: '$220' },
    { name: 'Sophia Martinez', email: 'sophia.martinez@email.com', customerId: 'CUS890', meterNo: 'MTR1007', status: 'Active', outstanding: '$0' },
    { name: 'James Anderson', email: 'james.anderson@email.com', customerId: 'CUS345', meterNo: 'MTR1008', status: 'Active', outstanding: '$45' },
  ];

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-sm text-slate-600 mt-1">Manage all registered customers and their accounts</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-slate-900">1,234</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Active Customers</p>
            <p className="text-3xl font-bold text-green-600">1,156</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Inactive Customers</p>
            <p className="text-3xl font-bold text-red-600">78</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Outstanding Bills</p>
            <p className="text-3xl font-bold text-orange-600">$12,450</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by name, email, or customer ID..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Meter No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.customerId}</TableCell>
                  <TableCell>{customer.meterNo}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={customer.outstanding !== '$0' ? 'text-red-600 font-semibold' : ''}>
                    {customer.outstanding}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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

export default ManageCustomers;
