
import { useAuth } from '@/Components/Context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Gauge, FileText, AlertTriangle } from 'lucide-react';

const OfficerDashboard = () => {
  const { user, logout } = useAuth();

  const stats = [
    { title: 'Customers Registered', value: '156', icon: UserPlus, color: 'text-primary' },
    { title: 'Readings Today', value: '23', icon: Gauge, color: 'text-secondary' },
    { title: 'Reports Generated', value: '8', icon: FileText, color: 'text-accent' },
    { title: 'Pending Complaints', value: '5', icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Officer Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your pending tasks will appear here...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Recent activities will appear here...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;
