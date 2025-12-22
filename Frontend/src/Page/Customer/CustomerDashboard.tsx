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
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [latestComplaint, setLatestComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Using customerApi from your backend integration
        const result = await customerApi.getComplaints();

        if (result && Array.isArray(result.myComplains)) {
          // Note: The backend returns "myComplains" not "complains"
          const fetchedComplaints: Complaint[] = result.myComplains.map((complaint: any) => ({
            _id: complaint._id || complaint.id,
            complainType: complaint.complainType || complaint.type || "General",
            description: complaint.description || "No description provided",
            status: complaint.status || "Pending",
            createdAt: complaint.createdAt || new Date().toISOString()
          }));

          setComplaints(fetchedComplaints);

          // Sort complaints by date to get the latest one
          const sortedComplaints = [...fetchedComplaints].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          if (sortedComplaints.length > 0) {
            setLatestComplaint(sortedComplaints[0]);
          } else {
            setLatestComplaint(null);
          }
        } else {
          setComplaints([]);
          setLatestComplaint(null);
        }
      } catch (err: any) {
        console.error("Failed to load complaints:", err);
        setError(err.message || "Failed to load your complaints data");
        setComplaints([]);
        setLatestComplaint(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {user?.name || user?.username || "Customer"}!
        </h1>
        <p className="text-muted-foreground">
          Here's a quick overview of your customer dashboard.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={User}
          title="Account Number"
          value={user?.username || user?.accountNumber || "---"}
          subtitle="Your registered account number"
          iconBg="bg-primary/10 text-primary"
        />

        <StatsCard
          icon={ClipboardList}
          title="Total Complaints"
          value={complaints.length}
          subtitle={`Your submitted complaints`}
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Latest Complaint</h2>
          {complaints.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Total: {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {!latestComplaint && !error && (
          <div className="text-center py-8">
            <FileWarning className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">You have no complaints yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Submit a complaint through the Complaints section.
            </p>
          </div>
        )}

        {error && !latestComplaint && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Unable to load complaint data.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please try refreshing the page or contact support.
            </p>
          </div>
        )}

        {latestComplaint && !error && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{latestComplaint.complainType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    latestComplaint.status === 'Resolved' 
                      ? 'bg-green-100 text-green-800'
                      : latestComplaint.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {latestComplaint.status}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-foreground mt-1">{latestComplaint.description}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">
                Submitted: {new Date(latestComplaint.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerDashboard;