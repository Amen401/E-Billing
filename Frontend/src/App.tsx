import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Components/Context/AuthContext";
import ProtectedRoute from "./Components/auth/ProtectedRoute";
import AdminDashboard from "./Page/Admin/Dashboard";
import ManageCustomers from "./Page/Admin/ManageCustomer";
import ManageOfficers from "./Page/Admin/ManageOfficers";
import SystemLogs from "./Page/Admin/SystemLogs";
import Login from "./Page/Auth/Login";
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
            <Route path="/login" element={<Login />} />
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
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
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

            {/* Remove this duplicate "/" redirect route */}
            {/* <Route path="/" element={<Navigate to="/customer/dashboard" replace />} /> */}

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
