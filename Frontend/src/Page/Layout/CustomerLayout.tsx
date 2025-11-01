import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  BarChart3, 
  FileText, 
  Headphones, 
  User,
  Search,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Zap } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { name: "Submit Reading", href: "/customer/submit-reading", icon: Upload },
  { name: "Consumption History", href: "/customer/consumption", icon: BarChart3 },
  { name: "Pay Bill", href: "/customer/bills", icon: FileText },
  { name: "Complaints/Support", href: "/customer/support", icon: Headphones },
  { name: "Profile", href: "/customer/profile", icon: User },
];

export function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-card border-r border-border
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">PowerConnect</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search account details..."
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="h-14 bg-card border-t border-border flex items-center justify-center px-6">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Product</a>
            <a href="#" className="hover:text-foreground transition-colors">Resources</a>
            <a href="#" className="hover:text-foreground transition-colors">Legal</a>
          </div>
        </footer>
      </div>
    </div>
  );
}


