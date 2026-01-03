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
import {
  UserPlus,
  Gauge,
  FileText,
  AlertTriangle,
  Search,
} from "lucide-react";
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("time");
  const [sortType] = useState<SortType>("newest");

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
    setSearchParams({ value: query, filter: filterType });

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
      {/* HEADER */}
      <header className="border-b bg-card">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Officer Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.name}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="px-3 py-4 sm:px-6 sm:py-6">
        {/* STATS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ACTIVITY LOG */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>

            {/* SEARCH + FILTER */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as FilterType)
                }
                className="w-full sm:w-40 rounded-md border px-3 py-2 text-sm"
              >
                <option value="name">Name</option>
                <option value="time">Time</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="px-0 sm:px-4">
            <div className="overflow-x-auto">
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
                        <TableCell className="max-w-[200px] truncate">
                          {a.activity}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(a.date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Success</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OfficerDashboard;
