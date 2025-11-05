import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import {
  Search,
  Plus,
  MoreHorizontal,
  KeyRound,
  Eye,
  Power,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusBadgeVariant } from "@/lib/bage-utils";
import type { Officer } from "../Types/type";

const ManageOfficers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const [newOfficer, setNewOfficer] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    role: "",
    department: "",
    assignedArea: "",
  });


useEffect(() => {
  const params = new URLSearchParams();
  if (searchQuery.trim()) {
    params.set("q", searchQuery.trim());
  }
  setSearchParams(params, { replace: true }); 
}, [searchQuery, setSearchParams]);


  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      setSearchParams({ q: trimmedQuery });
    } else {
      setSearchParams({});
      setOfficers([]);
    }
  };

  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await adminApi.searchOfficer(query);
      if (Array.isArray(result)) {
        setOfficers(result);
      } else {
        setOfficers([]);
        toast.error("Unexpected response from server");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load officers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchParams({});
    }
  };

  const handleToggleStatus = async (officer: Officer) => {
    try {
      await adminApi.activateDeactivateOfficer(officer._id, !officer.isActive);
      toast.success(
        `Officer ${
          !officer.isActive ? "activated" : "deactivated"
        } successfully`
      );
      performSearch(searchParams.get("q") || "");
    } catch (error) {
      toast.error("Failed to update officer status");
    }
  };

  const handleResetPassword = async (officer: Officer) => {
    setSelectedOfficer(officer);
    try {
      const response: any = await adminApi.officerResetPassword(officer._id);
      setResetPasswordResult(response.password || "12345678");
      setIsResetPasswordDialogOpen(true);
      toast.success("Password reset successfully");
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const handleViewDetails = (officer: Officer) => {
    setSelectedOfficer(officer);
    setIsDetailsDialogOpen(true);
  };

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOfficer.role) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...newOfficer,
        password: "12345678",
      };

      await adminApi.createOfficer(payload);

      toast.success("Officer created successfully!");
      setIsAddDialogOpen(false);

      setNewOfficer({
        name: "",
        username: "",
        password: "",
        email: "",
        role: "",
        department: "",
        assignedArea: "",
      });

      performSearch(searchParams.get("q") || "");
    } catch (error: any) {
      toast.error(error.message || "Failed to add officer");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfficerStats = async () => {
    try {
      const data = await adminApi.getOfficerStats();
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load officer stats");
    }
  };
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    performSearch(query);
    fetchOfficerStats();
  }, [searchParams]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Officer Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage field officers and support staff
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Officer
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Officers</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Active Officers
            </p>
            <p className="text-3xl font-bold text-success">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Inactive Officers
            </p>
            <p className="text-3xl font-bold text-destructive">
              {stats.inactive}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Officers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSearch}
              disabled={isLoading}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assigned Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      {isLoading ? "Loading..." : "No officers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  officers.map((officer) => (
                    <TableRow key={officer._id}>
                      <TableCell className="font-medium">
                        {officer.name}
                      </TableCell>
                      <TableCell>{officer.username}</TableCell>
                      <TableCell>{officer.email || "N/A"}</TableCell>
                      <TableCell>{officer.department || "N/A"}</TableCell>
                      <TableCell>{officer.assignedArea || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(officer.isActive)}
                        >
                          {officer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(officer)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(officer)}
                            >
                              <KeyRound className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(officer)}
                            >
                              <Power className="h-4 w-4 mr-2" />
                              {officer.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Officer</DialogTitle>
            <DialogDescription>
              Create a new officer account. Default password will be set to
              12345678.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddOfficer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newOfficer.name}
                onChange={(e) =>
                  setNewOfficer({ ...newOfficer, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newOfficer.username}
                onChange={(e) =>
                  setNewOfficer({ ...newOfficer, username: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newOfficer.email}
                onChange={(e) =>
                  setNewOfficer({ ...newOfficer, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={newOfficer.role}
                onValueChange={(value) =>
                  setNewOfficer({ ...newOfficer, role: value })
                }
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Field Officer">Field Officer</SelectItem>
                  <SelectItem value="Team Leader">Team Leader</SelectItem>
                  <SelectItem value="Coordinator">Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newOfficer.department}
                onValueChange={(value) =>
                  setNewOfficer({ ...newOfficer, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Field Operations">
                    Field Operations
                  </SelectItem>
                  <SelectItem value="Customer Support">
                    Customer Support
                  </SelectItem>
                  <SelectItem value="Meter Reading">Meter Reading</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedArea">Assigned Area</Label>
              <Input
                id="assignedArea"
                value={newOfficer.assignedArea}
                onChange={(e) =>
                  setNewOfficer({ ...newOfficer, assignedArea: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Officer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset Successful</DialogTitle>
            <DialogDescription>
              The password has been reset for {selectedOfficer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                New Password:
              </p>
              <p className="text-2xl font-mono font-bold text-foreground">
                {resetPasswordResult}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please share this password with the officer. They should change it
              upon first login.
            </p>
            <Button
              onClick={() => setIsResetPasswordDialogOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Officer Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedOfficer?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedOfficer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedOfficer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{selectedOfficer.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {selectedOfficer.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {selectedOfficer.department || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Area</p>
                  <p className="font-medium">
                    {selectedOfficer.assignedArea || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={getStatusBadgeVariant(selectedOfficer.isActive)}
                  >
                    {selectedOfficer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Added On</p>
                  <p className="font-medium">
                    {selectedOfficer.createdAt
                      ? new Date(selectedOfficer.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                {!selectedOfficer.isActive && selectedOfficer.deactivatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Deactivated On
                    </p>
                    <p className="font-medium">
                      {new Date(
                        selectedOfficer.deactivatedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedOfficer.lastPasswordReset && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Password Last Reset
                    </p>
                    <p className="font-medium">
                      {new Date(
                        selectedOfficer.lastPasswordReset
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {!selectedOfficer.isActive && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive">
                    Account Inactive
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This officer's account is currently deactivated. They cannot
                    log in until reactivated.
                  </p>
                  <Button
                    onClick={() => {
                      handleToggleStatus(selectedOfficer);
                      setIsDetailsDialogOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    Activate Account
                  </Button>
                </div>
              )}
              <Button
                onClick={() => setIsDetailsDialogOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageOfficers;
