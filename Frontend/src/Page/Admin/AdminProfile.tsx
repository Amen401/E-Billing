import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Lock, Save, Mail } from "lucide-react";
import { useAdminAuth } from "@/Components/Context/AdminContext";

const AdminProfile = () => {
  const { user, updateProfile, changePassword } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name,
  });
  const [passwordData, setPasswordData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setProfileLoading(true);
      await updateProfile({ name: profileData.name });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPass !== passwordData.confirmPass) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPass.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(passwordData.oldPass, passwordData.newPass);
      toast.success("Password changed successfully");
      setPasswordData({ oldPass: "", newPass: "", confirmPass: "" });
      setIsChangingPassword(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Admin Profile</h1>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Profile
            </CardTitle>
            <CardDescription>Update your name</CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ name: e.target.value })}
                disabled={!isEditing || profileLoading}
                required
              />
            </div>
            {isEditing && (
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={profileLoading}
                >
                  {profileLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={profileLoading}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Account Security
            </CardTitle>
            <CardDescription>Manage username and password</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ✅ Update Username Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-medium">Username</p>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Change Username
                </Button>
              )}
            </div>

            {isEditing && (
              <form onSubmit={handleProfileUpdate} className="space-y-3">
                <Input
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  disabled={profileLoading}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Saving..." : "Save Username"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={profileLoading}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          <Separator />

          {/* ✅ Change Password Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-medium">Password</p>
              {!isChangingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <Input
                  type="password"
                  placeholder="Current Password"
                  value={passwordData.oldPass}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPass: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={passwordData.newPass}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPass: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordData.confirmPass}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPass: e.target.value,
                    })
                  }
                  required
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? "Saving..." : "Update Password"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={passwordLoading}
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Role</p>
                <p className="text-sm text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Account Status
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Last Login
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
