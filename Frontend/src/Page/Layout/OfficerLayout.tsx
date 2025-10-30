import { OfficerSidebar } from "@/Components/officer/OfficerSidenav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";


export function OfficerLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <OfficerSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-foreground">Electricity Billing System</h2>
            </div>
          </header>
          <div className="flex-1 p-6 bg-background">
        <Outlet/>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
