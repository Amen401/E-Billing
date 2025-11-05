import { LayoutDashboard, UserPlus, Gauge, MessageSquare, FileText, LogOut, } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/Components/Context/AuthContext";
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

const items = [
  { title: "Dashboard", url: "/officer/dashboard", icon: LayoutDashboard },
  { title: "Register Customer", url: "/officer/register-customer", icon: UserPlus },
  { title: "Meter Readings", url: "/officer/meter-readings", icon: Gauge },
  { title: "Complaints", url: "/officer/complaints", icon: MessageSquare },
  { title: "Reports", url: "/officer/reports", icon: FileText },
];

export function OfficerSidebar() {
  const { open } = useSidebar();
  const { logout, user } = useAuth();

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">
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
                        `flex items-center gap-2 ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50"
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
                  {getInitials(user.email || "U")}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70">View Profile</p>
                </div>
              )}
            </NavLink>
          )}
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {open && <span>Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}