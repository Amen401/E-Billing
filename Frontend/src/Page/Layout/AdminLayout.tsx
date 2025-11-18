import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/Components/admin/AdminSideNav';

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-blue-50">
        <AdminSidebar className="bg-blue-700 text-white shadow-lg" />

        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center px-6 bg-white shadow sticky top-0 z-20">
            <SidebarTrigger className="text-blue-700 hover:text-blue-900 transition-colors duration-200" />
            <h1 className="ml-4 text-xl font-bold text-blue-700">Admin Portal</h1>
          </header>
          <main className="flex-1 p-6 bg-blue-50">
            <div className="rounded-lg bg-white shadow-md p-6 min-h-[calc(100vh-64px)]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
