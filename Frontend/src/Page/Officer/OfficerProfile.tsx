import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface OfficerProfileData {
  _id: string;
  name: string;
  username: string;
  email: string;
  department: string;
  assignedArea: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const OfficerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<OfficerProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [assignedArea, setAssignedArea] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/officer/profile");
      
      if (response.data) {
        setProfile(response.data);
        setFullName(response.data.name || '');
        setEmail(response.data.email || '');
        setDepartment(response.data.department || '');
        setAssignedArea(response.data.assignedArea || '');
        setUsername(response.data.username || '');
      }
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put("/officer/update-profile", {
        name: fullName,
      });

      if (response.success) {
        toast.success('Profile updated successfully!');

        fetchProfile();
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Officer Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(fullName || username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{fullName || username}</CardTitle>
              <CardDescription className="capitalize">{department} Officer</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                type="text"
                value={department}
                disabled
                className="bg-muted capitalize"
              />
              <p className="text-xs text-muted-foreground">
                Department is assigned by administrator
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedArea">Assigned Area</Label>
              <Input
                id="assignedArea"
                type="text"
                value={assignedArea}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Assigned area is managed by administrator
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Input
                id="status"
                type="text"
                value={profile?.isActive ? "Active" : "Inactive"}
                disabled
                className="bg-muted"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerProfile;