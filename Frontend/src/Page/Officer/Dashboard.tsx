import { Button } from "@/Components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { UserPlus, Gauge, FileText, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { officerApi } from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/context/UnifiedContext";

interface Activity {
  activity: string;
  date: string;
}

interface Stat {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

type SortType = "newest" | "oldest" | "name";
type FilterType = "name" | "time";

const OfficerDashboard = () => {
  const { user, logout } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("time");
  const [sortType, setSortType] = useState<SortType>("newest");
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<Stat[]>([]);
  const navigate = useNavigate();

  const mapFilterToBackend = (filter: FilterType) =>
    filter === "name" ? "activity" : "date";

  const fetchStats = async () => {
    try {
      const data = await officerApi.getDashboardStats();
      setStats([
        {
          title: "Customers Registered",
          value: data.customersRegistered,
          icon: UserPlus,
          color: "text-primary",
        },
        {
          title: "Readings Today",
          value: data.readingsToday,
          icon: Gauge,
          color: "text-secondary",
        },
        {
          title: "Reports Generated",
          value: data.reportsGenerated,
          icon: FileText,
          color: "text-accent",
        },
        {
          title: "Pending Complaints",
          value: data.pendingComplaints,
          icon: AlertTriangle,
          color: "text-destructive",
        },
      ]);
    } catch {
      toast.error("Failed to fetch dashboard stats");
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const data = await officerApi.getSystemActivities();
      setActivities(data);
    } catch {
      toast.error("Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchParams({});
      fetchActivities();
      return;
    }

    const backendFilter = mapFilterToBackend(filterType);

    setSearchParams({
      value: query,
      filter: filterType,
    });

    try {
      setIsLoading(true);
      const data = await officerApi.searchMyActivities(query, backendFilter);
      setActivities(data);
    } catch {
      toast.error("Search failed");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const value = searchParams.get("value");
    const filter = (searchParams.get("filter") as FilterType) || "time";

    setFilterType(filter);

    if (value) {
      setSearchQuery(value);
      handleSearch(value);
    } else {
      fetchActivities();
    }

    fetchStats();
  }, []);

  const sortedActivities = [...activities].sort((a, b) => {
    if (sortType === "name") {
      return a.activity.localeCompare(b.activity);
    }
    if (sortType === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Officer Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            variant="outline"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>

            <div className="flex gap-4 mt-4">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="border rounded-md px-3 py-2"
              >
                <option value="name">Name</option>
                <option value="time">Time</option>
              </select>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : sortedActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedActivities.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell>{a.activity}</TableCell>
                      <TableCell>{new Date(a.date).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge>Success</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OfficerDashboard;
