import { Card } from "@/components/ui/card";
import { ClipboardList, User, FileWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { customerApi } from "@/lib/api";
import { useAuth } from "@/components/context/UnifiedContext";

interface Complaint {
  _id: string;
  complainType: string;
  description: string;
  status: string;
  createdAt: string;
}

const StatsCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  iconBg
}: {
  icon: any;
  title: string;
  value: string | number;
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

const CustomerDashboard = () => {
 const {user} = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [latestComplaint, setLatestComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    const fetchData = async () => {

      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const result = await customerApi.getComplaints(); 

        if (result && Array.isArray(result.complains)) {
          setComplaints(result.complains);

          if (result.complains.length > 0) {
            setLatestComplaint(result.complains[result.complains.length - 1]);
          }
        }
      } catch (err) {
        console.error("Failed to load complaints:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {user?.name || "Customer"}!
        </h1>
        <p className="text-muted-foreground">
          Here’s a quick overview of your customer dashboard.
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={User}
          title="Account Number"
          value={user?.username || "---"}
          subtitle="Your registered account number"
          iconBg="bg-primary/10 text-primary"
        />

        <StatsCard
          icon={ClipboardList}
          title="Total Complaints"
          value={complaints.length}
          subtitle="Your submitted complaints"
          iconBg="bg-warning/10 text-warning"
        />

        <StatsCard
          icon={FileWarning}
          title="Latest Status"
          value={latestComplaint ? latestComplaint.status : "No Complaints"}
          subtitle={latestComplaint ? latestComplaint.complainType : "No recent activity"}
          iconBg="bg-accent/10 text-accent-foreground"
        />
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Complaint</h2>

        {!latestComplaint && (
          <p className="text-muted-foreground text-sm">You have no complaints yet.</p>
        )}

        {latestComplaint && (
          <div className="space-y-2">
            <p><strong>Type:</strong> {latestComplaint.complainType}</p>
            <p><strong>Status:</strong> {latestComplaint.status}</p>
            <p><strong>Description:</strong> {latestComplaint.description}</p>
            <p className="text-sm text-muted-foreground">
              Submitted: {new Date(latestComplaint.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerDashboard;
