import {
  LayoutDashboard,
  UserPlus,
  Gauge,
  MessageSquare,
  FileText,
  LogOut,
  User,
  Calendar,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
import { useAuth } from "../context/UnifiedContext";

const items = [
  { title: "Dashboard", url: "/officer/dashboard", icon: LayoutDashboard },
  {
    title: "Customers",
    url: "/officer/customers",
    icon: UserPlus,
  },
  {
    title: "schedule a payment",
    url: "/officer/schedule-payment",
    icon: Calendar,
  },
  { title: "Meter Readings", url: "/officer/meter-readings", icon: Gauge },
  { title: "Complaints", url: "/officer/complaints", icon: MessageSquare },
  { title: "Reports", url: "/officer/reports", icon: FileText },
];

export function OfficerSidebar() {
  const { open } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "U";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground text-lg m-5">
            Officer Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
        <div className="p-2 space-y-2">
          {user && (
            <NavLink
              to="/officer/profile"
              className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
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
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
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
