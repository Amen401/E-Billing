import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Components/Context/AuthContext";
import {ProtectedRoute} from "./Components/auth/ProtectedRoute";
import AdminDashboard from "./Page/Admin/Dashboard";
import ManageCustomers from "./Page/Admin/ManageCustomer";
import ManageOfficers from "./Page/Admin/ManageOfficers";
import SystemLogs from "./Page/Admin/SystemLogs";
import DashboardRouter from "./Page/DashBoardLayout";
import AdminLayout from "./Page/Layout/AdminLayout";
import NotFound from "./Page/NotFound";
import Home from "./Page/Home";
import Dashboard from "./Page/Admin/Dashboard";
import { CustomerLayout } from "./Page/Layout/CustomerLayout";
import Bills from "./Page/Customer/Bills";
import Consumption from "./Page/Customer/Consumption";
import Profile from "./Page/Customer/Profile";
import SubmitReading from "./Page/Customer/SubmitReading";
import Support from "./Page/Customer/Support";
import AdminLogin from "./Page/Admin/AdminLogin";
import { CustomerLogin } from "./Page/Customer/CustomerLogin";
import OfficerLogin from "./Page/Officer/OfficerLogin";
import { OfficerLayout } from "./Page/Layout/OfficerLayout";
import OfficerDashboard from "./Page/Officer/Dashboard";
import MeterReadings from "./Page/Officer/MeterReading";
import RegisterCustomer from "./Page/Officer/RegisterCustomer";
import Complaints from "./Page/Officer/Complaints";
import OfficerProfile from "./Page/Officer/OfficerProfile";
import OfficerProtectedRoute from "./Components/auth/OfficerProtectedRoute";
import AdminProtectedRoute from "./Components/auth/AdminProtectedRoute";
import Reports from "./Page/Officer/Report";
import Customers from "./Page/Officer/Customers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
           <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="customers" element={<ManageCustomers />} />
              <Route path="officers" element={<ManageOfficers />} />
              <Route path="logs" element={<SystemLogs />} />
            </Route>

    
         <Route path="/login" element={<CustomerLogin/>} />
            <Route
              path="/customer"
              element={
                <ProtectedRoute>
                  <CustomerLayout /> 
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/customer/dashboard" replace />}
              />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="submit-reading" element={<SubmitReading />} />
              <Route path="consumption" element={<Consumption />} />
              <Route path="bills" element={<Bills />} />
              <Route path="support" element={<Support />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
         <Route path="/officer/login" element={<OfficerLogin/>} />
            <Route
              path="/officer"
              element={
                <OfficerProtectedRoute>
                  <OfficerLayout /> 
                </OfficerProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/officer/dashboard" replace />}
              />
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="meter-readings" element={<MeterReadings />} />
              <Route path="register-customer" element={<RegisterCustomer />} />
              <Route  path="customers" element={<Customers/>}/>
              <Route path="complaints" element={<Complaints />} />
              <Route path="reports" element={<Reports/>}/>
              <Route path="profile" element={<OfficerProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
