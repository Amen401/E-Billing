import { Card } from "@/components/ui/card";
import { DollarSign, Zap, CheckCircle } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { AIInsights } from "@/Components/Customer/AIInsight";

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
  const [profile, setProfile] = useState<any>(null);
  const [currentBill, setCurrentBill] = useState<any>(null);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  const [currentMonthKwh, setCurrentMonthKwh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // Fetch current unpaid bill
        const { data: billData } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'unpaid')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setCurrentBill(billData);

        // Fetch consumption history
        const { data: consumptionHistory } = await supabase
          .from('consumption_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);

        if (consumptionHistory && consumptionHistory.length > 0) {
          setConsumptionData(
            consumptionHistory.reverse().map(h => ({
              month: h.month,
              kwh: h.consumption_kwh
            }))
          );
          setCurrentMonthKwh(consumptionHistory[0].consumption_kwh);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-muted-foreground">Here's a quick overview of your PowerConnect account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={DollarSign}
          title="Current Bill Amount"
          value={currentBill ? `ETB ${currentBill.total_amount.toFixed(2)}` : 'ETB 0.00'}
          subtitle={currentBill ? `Due ${new Date(currentBill.due_date).toLocaleDateString()}` : 'No pending bills'}
          iconBg="bg-primary/10 text-primary"
        />
        <StatsCard
          icon={Zap}
          title="Current Month's Consumption"
          value={`${currentMonthKwh} kWh`}
          subtitle={`As of ${new Date().toLocaleDateString()}`}
          iconBg="bg-warning/10 text-warning"
        />
        <StatsCard
          icon={CheckCircle}
          title="Account Status"
          value={currentBill ? "Unpaid" : "Paid"}
          subtitle={currentBill ? "Payment due soon" : "All clear!"}
          iconBg={currentBill ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}
        />
      </div>

      <AIInsights />

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
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
      </div>
    </div>
  );
};

export default Dashboard;