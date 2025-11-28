import {  useCustomerAuth } from "@/Components/Context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { UserPlus, Gauge, FileText, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { officerApi } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import type { SystemLog } from "../Types/type";
import { fi } from "date-fns/locale";

interface Activity {
  activity: string;
  details: string;
  date: string;
}
const OfficerDashboard = () => {
    const { customer, logout } = useCustomerAuth();
  const [systemActivities, setSystemActivities] = useState<Activity[]>([]);
  const [filtered, setFiltered] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<"time" | "date" | "name">("time");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const stats = [
    {
      title: "Customers Registered",
      value: "156",
      icon: UserPlus,
      color: "text-primary",
    },
    {
      title: "Readings Today",
      value: "23",
      icon: Gauge,
      color: "text-secondary",
    },
    {
      title: "Reports Generated",
      value: "8",
      icon: FileText,
      color: "text-accent",
    },
    {
      title: "Pending Complaints",
      value: "5",
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];


 
  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const activities: Activity[] = await officerApi.getSystemActivities();
      setSystemActivities(activities);
      setFiltered(activities);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  };


  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchParams(query ? { value: query } : {});

    if (!query.trim()) {
      fetchActivities();
      return;
    }

    try {
      setIsLoading(true);
      const activities: Activity[] = await officerApi.searchMyActivities(query);
      setSystemActivities(activities);
      setFiltered(activities);
    } catch (err: any) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const value = searchParams.get("value") || "";
    const filter = (searchParams.get("filter") as "time" | "date" | "name") || "time";
    setSearchQuery(value);
    setFilterType(filter);

    if (value) {
      handleSearch(value, filter);
    } else {
      fetchActivities();
    }
  }, []);


  useEffect(() => {
    let result = [...systemActivities];

    if (searchQuery.trim() !== "") {
      result = result.filter((item) =>
        item.activity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (filterType === "name") return a.activity.localeCompare(b.activity);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFiltered(result);
  }, [searchQuery, filterType, systemActivities]);
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Officer Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {customer?.name}
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
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

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Recent System Activity
            </CardTitle>

            <div className="flex items-center gap-4 mt-3">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs by event, user, or timestamp..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white"
              >
                <option value="time">Newest</option>
                <option value="date">Oldest</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border overflow-auto max-h-[470px]">
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
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((activity, i) => (
                      <TableRow key={i}>
                        <TableCell>{activity.activity}</TableCell>
                        <TableCell>
                          {new Date(activity.date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Success</Badge>
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
