import { LayoutDashboard, Users, UserCog, Activity, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '../Context/AuthContext';

const menuItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Customer Management', url: '/admin/customers', icon: Users },
  { title: 'Officer Management', url: '/admin/officers', icon: UserCog },
  { title: 'System Logs', url: '/admin/logs', icon: Activity },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { logout, user } = useAuth();
  const isCollapsed = state === 'collapsed';

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-blue-50 text-blue-700 font-semibold rounded-lg px-3 py-2 flex items-center gap-3 transition-all duration-200 border-l-4 border-blue-600'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg px-3 py-2 flex items-center gap-3 transition-all duration-200';

  return (
    <Sidebar 
      collapsible="icon" 
      className="bg-white text-gray-900 shadow-sm border-r border-gray-200"
    >
      {/* Header */}
      <SidebarHeader className="border-b border-gray-200 p-6 bg-white">
        {!isCollapsed ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">PowerPulse</h2>
            <p className="text-sm text-gray-600 font-medium">Admin Portal</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="bg-gray-900 rounded-lg p-2">
              <h2 className="text-sm font-bold text-white">PP</h2>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="p-4">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-gray-500 font-semibold text-sm uppercase tracking-wide mb-3">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-gray-200 p-4 bg-gray-50">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="px-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate mt-1">{user?.email}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <Button 
              onClick={logout} 
              variant="ghost" 
              size="icon" 
              className="text-gray-700 hover:bg-gray-200 border border-gray-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}