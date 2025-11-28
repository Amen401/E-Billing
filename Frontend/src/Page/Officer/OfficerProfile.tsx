import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Image as  Lock, Save, X, Edit2, Camera } from "lucide-react";
import { useOfficerAuth } from "@/Components/Context/OfficerContext";

const OfficerProfile = () => {
  const { user, updateNameOrEmail, changeProfilePicture, changePassword } = useOfficerAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const[ isEditigUsername, setisEditingUsername] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [passwordData, setPasswordData] = useState({ oldPass: "", newPass: "", confirmPass: "" });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateNameOrEmail("name", name);
      setIsEditingName(false);
      toast.success("Name updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateNameOrEmail("email", email);
      setIsEditingEmail(false);
      toast.success("Email updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(e.target.files?.[0]);
    if (!file) return;

    try {
      setImageLoading(true);
      await changeProfilePicture(file);
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to update picture");
    } finally {
      setImageLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPass !== passwordData.confirmPass) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(passwordData.oldPass, passwordData.newPass);
      setPasswordData({ oldPass: "", newPass: "", confirmPass: "" });
      setIsChangingPassword(false);
      toast.success("Password changed successfully");
    } catch {
      toast.error("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-background">
      <div className="container max-w-6xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">

          <Card className="h-fit shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg">
                    {user?.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase() || "O"}</span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      disabled={imageLoading}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{user?.username || "Officer"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                {imageLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Uploading...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your full name</CardDescription>
                  </div>
                  {!isEditingName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingName(true)}
                      className="hover:bg-secondary"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNameUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      disabled={!isEditingName || loading}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="transition-all"
                    />
                  </div>
                  {isEditingName && (
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingName(false);
                          setName(user?.name || "");
                        }}
                        disabled={loading}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Username</Label>
                    <Input
                      id="name"
                      value={username}
                      disabled={!isEditigUsername || loading}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="transition-all"
                    />
                  </div>
                  {isEditigUsername && (
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setisEditingUsername(false);
                          setUsername(user?.username || "");
                        }}
                        disabled={loading}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Mail className="h-5 w-5 text-primary" />
                      Email Address
                    </CardTitle>
                    <CardDescription>Update your email address</CardDescription>
                  </div>
                  {!isEditingEmail && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingEmail(true)}
                      className="hover:bg-secondary"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled={!isEditingEmail || loading}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-all"
                    />
                  </div>
                  {isEditingEmail && (
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingEmail(false);
                          setEmail(user?.email || "");
                        }}
                        disabled={loading}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Lock className="h-5 w-5 text-primary" />
                      Password Settings
                    </CardTitle>
                    <CardDescription>Change your account password</CardDescription>
                  </div>
                  {!isChangingPassword && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsChangingPassword(true)}
                      className="hover:bg-secondary"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPass" className="text-sm font-medium">Current Password</Label>
                      <Input
                        id="oldPass"
                        type="password"
                        placeholder="Enter current password"
                        value={passwordData.oldPass}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPass: e.target.value })}
                        required
                        className="transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPass" className="text-sm font-medium">New Password</Label>
                      <Input
                        id="newPass"
                        type="password"
                        placeholder="Enter new password"
                        value={passwordData.newPass}
                        onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                        required
                        className="transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPass" className="text-sm font-medium">Confirm New Password</Label>
                      <Input
                        id="confirmPass"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPass}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPass: e.target.value })}
                        required
                        className="transition-all"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={passwordLoading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({ oldPass: "", newPass: "", confirmPass: "" });
                        }}
                        disabled={passwordLoading}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">••••••••</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerProfile;
