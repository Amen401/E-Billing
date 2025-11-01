import { Card } from "@/components/ui/card";
import { DollarSign, Zap, CheckCircle, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const consumptionData = [
  { month: "Jan", kwh: 210 },
  { month: "Feb", kwh: 198 },
  { month: "Mar", kwh: 215 },
  { month: "Apr", kwh: 235 },
  { month: "May", kwh: 248 },
  { month: "Jun", kwh: 250 },
];

const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  iconBg 
}: { 
  icon: any; 
  title: string; 
  value: string; 
  subtitle: string; 
  iconBg: string;
}) => (
  <Card className="p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, John Doe!</h1>
        <p className="text-muted-foreground">Here's a quick overview of your PowerConnect account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={DollarSign}
          title="Current Bill Amount"
          value="ETB 1,250.00"
          subtitle="Due in 5 days"
          iconBg="bg-primary/10 text-primary"
        />
        <StatsCard
          icon={Zap}
          title="Current Month's Consumption"
          value="250 kWh"
          subtitle="As of June 25, 2024"
          iconBg="bg-warning/10 text-warning"
        />
        <StatsCard
          icon={CheckCircle}
          title="Account Status"
          value="Paid"
          subtitle="All clear!"
          iconBg="bg-success/10 text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Electricity Consumption (Last 6 Months)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="kwh" 
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-info/5 border-info/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <TrendingUp className="w-5 h-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Your consumption is stable.
              </h3>
              <p className="text-sm text-muted-foreground">
                Consider optimizing your appliance usage during peak hours to save more.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
