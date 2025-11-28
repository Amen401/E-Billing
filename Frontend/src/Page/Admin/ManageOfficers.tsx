import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { useAdminAuth } from "@/Components/Context/AdminContext";

const ManageOfficers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [allOfficers, setAllOfficers] = useState<Officer[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAdminAuth();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [newOfficer, setNewOfficer] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    role: "",
    department: "",
    assignedArea: "",
  });

  const stats = useMemo(() => {
    const active = allOfficers.filter((o) => o.isActive).length;
    return {
      total: allOfficers.length,
      active,
      inactive: allOfficers.length - active,
    };
  }, [allOfficers]);


  const fetchOfficerStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await adminApi.getOfficerStats();
      if (res.allOfficers) {
        const normalized: Officer[] = res.allOfficers.map((o: any) => ({
          _id: o._id,
          name: o.name || "N/A",
          username: o.username || "N/A",
          email: o.email || "N/A",
          department: o.department || "N/A",
          isActive: o.isActive ?? true,
          assignedArea: o.assignedArea || "N/A",
          createdAt: o.createdAt || new Date().toISOString(),
          deactivatedAt: o.deactivatedAt,
          lastPasswordReset: o.lastPasswordReset,
        }));
        setAllOfficers(normalized);
        setOfficers(normalized);
      } else {
        setAllOfficers([]);
        setOfficers([]);
        toast.error("No officers found");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch officers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setOfficers(allOfficers);
      return;
    }

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
  }, [allOfficers]);


  const handleSearchInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      setSearchParams({ q: value.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
      setOfficers(allOfficers);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  }, [setSearchParams, performSearch, allOfficers]);

  const handleSearch = useCallback(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      performSearch(trimmedQuery);
    } else {
      setOfficers(allOfficers);
    }
  }, [searchQuery, performSearch, allOfficers]);

  const handleToggleStatus = useCallback(async (officer: Officer) => {
    if (!user?.id) {
      toast.error("Admin information missing");
      return;
    }
    
    try {
      await adminApi.activateDeactivateOfficer(
        officer._id,
        !officer.isActive,
        user.id
      );
      
      const updatedOfficers = allOfficers.map((o) =>
        o._id === officer._id ? { ...o, isActive: !o.isActive } : o
      );
      
      setAllOfficers(updatedOfficers);
      setOfficers((prev) =>
        prev.map((o) =>
          o._id === officer._id ? { ...o, isActive: !o.isActive } : o
        )
      );

      toast.success(
        `Officer ${!officer.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update officer status");
    }
  }, [user?.id, allOfficers]);

  const handleResetPassword = useCallback(async (officer: Officer) => {
    setSelectedOfficer(officer);
    try {
      const response: any = await adminApi.officerResetPassword(officer._id);
      setResetPasswordResult(response.password || "12345678");
      setIsResetPasswordDialogOpen(true);
      toast.success("Password reset successfully");
    } catch (error) {
      toast.error("Failed to reset password");
    }
  }, []);

  const handleViewDetails = useCallback((officer: Officer) => {
    setSelectedOfficer(officer);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleAddOfficer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOfficer.role) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        newOfficer: {
          name: newOfficer.name,
          username: newOfficer.username,
          password: newOfficer.password,
          email: newOfficer.email,
          assignedArea: newOfficer.assignedArea,
          department: newOfficer.department,
          role: newOfficer.role,
        },
        adminId: user?.id,
      };

      const response: any = await adminApi.createOfficer(payload);

      toast.success(response.message || "Officer added successfully!");
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

      const createdOfficer: Officer = {
        _id: response.newOfficer._id || Math.random().toString(),
        name: response.newOfficer.fullName || "N/A",
        username: response.newOfficer.username || "N/A",
        email: response.newOfficer.email || "N/A",
        department: response.newOfficer.department || "N/A",
        isActive: true,
        assignedArea: response.newOfficer.assignedArea || "N/A",
        createdAt: new Date().toISOString(),
        deactivatedAt: undefined,
        lastPasswordReset: undefined,
      };

      setAllOfficers((prev) => [createdOfficer, ...prev]);
      setOfficers((prev) => [createdOfficer, ...prev]);
    } catch (error: any) {
      toast.error(error.message || "Failed to add officer");
    } finally {
      setIsLoading(false);
    }
  }, [newOfficer, user?.id]);

  useEffect(() => {
    fetchOfficerStats();
  }, [fetchOfficerStats]);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    if (query !== searchQuery) {
      setSearchQuery(query);
      if (query.trim()) {
        performSearch(query);
      } else {
        setOfficers(allOfficers);
      }
    }
  }, [searchParams]);


  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);


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

          <div className="rounded-md border overflow-auto max-h-[300px]">
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
