import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/Components/admin/AdminSideNav';

export default function AdminLayout() {
  return (
  <SidebarProvider>
       <div className="min-h-screen flex w-full">
         <AdminSidebar />
         <main className="flex-1">
           <header className="h-14 border-b flex items-center px-4 sticky top-0 bg-background z-10">
             <SidebarTrigger />
           </header>
           <div className="p-6">
             <Outlet />
           </div>
         </main>
       </div>
     </SidebarProvider>
  );
}
