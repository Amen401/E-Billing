import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const SystemLogs = () => {
  const [systemActivities, setSystemActivities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const newSort =
    filterType === "time" ? "time" : filterType === "date" ? "date" : "name";
  const filters = filterType === "name" ? "name" : "date";

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const activities = await adminApi.getSystemActivities();
      setSystemActivities(activities);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch system activities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSearch = async (query: string, filterType: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchParams({});
      fetchActivities();
      return;
    }

    setSearchParams({ value: query, filter: newSort });

    try {
      setIsLoading(true);
      const res = await adminApi.searchMyActivities(query, newSort);
      setSystemActivities(res);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = [...systemActivities].sort((a, b) => {
    if (filterType === "name") return a.activity.localeCompare(b.activity);
    if (filterType === "time" || filterType === "date")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  const toggleSort = () => {
    setFilterType(newSort);

    const params: any = {};
    if (searchQuery) params.q = searchQuery;
    if (newSort) params.sort = newSort;

    setSearchParams(params);
  };

  const exportLogs = () => {
    if (systemActivities.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const header = ["Event", "User", "Timestamp", "IP Address", "Status"];
    const rows = systemActivities.map((log) => [
      `"${log.activity}"`,
      `"Admin"`,
      `"${new Date(log.createdAt).toLocaleString()}"`,
      `"Unknown"`,
      `"Success"`,
    ]);

    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `system_logs_${new Date().toISOString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            System Logs
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor all system activities and events
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 self-start md:self-auto"
          onClick={exportLogs}
        >
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search logs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value, filters)}
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={toggleSort}>
          <Filter className="h-4 w-4" />
          {filterType === "time"
            ? "Time"
            : filterType === "date"
            ? "Date"
            : "Name"}
        </Button>
      </div>

      {/* Logs Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border max-h-[470px]">
            <Table className="min-w-[600px] sm:min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {activity.activity}
                      </TableCell>
                      <TableCell>Admin</TableCell>
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
    </div>
  );
};

export default SystemLogs;
