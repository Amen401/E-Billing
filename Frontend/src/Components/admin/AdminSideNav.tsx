import {
  LayoutDashboard,
  UserCog,
  Activity,
  LogOut,
  User,
  FileText,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UnifiedContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Officer Management", url: "/admin/officers", icon: UserCog },
  { title: "Customer Management", url: "/admin/customers", icon: User },
  { title: "Reports", url: "/admin/admin-reports", icon: FileText },
  { title: "System Logs", url: "/admin/logs", icon: Activity },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "A";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground text-lg m-5">
            Admin Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 p-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 space-y-2 flex flex-col items-start">
          {user && (
            <NavLink
              to="/admin/profile"
              className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent transition-colors w-full"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary justify-center text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm  font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70">
                    View Profile
                  </p>
                </div>
              )}
            </NavLink>
          )}

          <Button
            variant="ghost"
            className={`w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent ${
              !open ? "justify-center" : ""
            }`}
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            {open && <span>Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
