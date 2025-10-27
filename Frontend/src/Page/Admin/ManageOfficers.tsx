import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Filter } from 'lucide-react';

const ManageOfficers = () => {
  const officers = [
    { name: 'Bob Williams', email: 'bob.williams@powerpulse.com', officerId: 'USR002', department: 'Field Operations', status: 'Active', assignedArea: 'Zone A' },
    { name: 'Zoe Adams', email: 'zoe.adams@powerpulse.com', officerId: 'USR003', department: 'Customer Support', status: 'Active', assignedArea: 'Zone B' },
    { name: 'Henry King', email: 'henry.king@powerpulse.com', officerId: 'USR011', department: 'Field Operations', status: 'Inactive', assignedArea: 'Zone C' },
    { name: 'Sarah Connor', email: 'sarah.connor@powerpulse.com', officerId: 'USR015', department: 'Meter Reading', status: 'Active', assignedArea: 'Zone D' },
    { name: 'Michael Scott', email: 'michael.scott@powerpulse.com', officerId: 'USR020', department: 'Customer Support', status: 'Active', assignedArea: 'Zone A' },
    { name: 'Jessica Jones', email: 'jessica.jones@powerpulse.com', officerId: 'USR025', department: 'Field Operations', status: 'Active', assignedArea: 'Zone B' },
  ];

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Officer Management</h1>
          <p className="text-sm text-slate-600 mt-1">Manage field officers and support staff</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Officer
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Total Officers</p>
            <p className="text-3xl font-bold text-slate-900">45</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Active Officers</p>
            <p className="text-3xl font-bold text-green-600">42</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Field Operations</p>
            <p className="text-3xl font-bold text-blue-600">28</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Support Staff</p>
            <p className="text-3xl font-bold text-purple-600">17</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Officers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by name, email, or officer ID..." className="pl-10" />
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
                <TableHead>Officer ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assigned Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officers.map((officer, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{officer.name}</TableCell>
                  <TableCell>{officer.email}</TableCell>
                  <TableCell>{officer.officerId}</TableCell>
                  <TableCell>{officer.department}</TableCell>
                  <TableCell>{officer.assignedArea}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(officer.status)}>
                      {officer.status}
                    </Badge>
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

export default ManageOfficers;
