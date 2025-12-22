import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./Components/auth/ProtectedRoute";
import OfficerProtectedRoute from "./Components/auth/OfficerProtectedRoute";
import AdminProtectedRoute from "./Components/auth/AdminProtectedRoute";
import AddMeterReading from "./Components/officer/AddMeterReading";
import UnifiedLogin from "./Page/Auth/Login";
import SchedulePayment from "./Page/Officer/SchedulePayment";
import MeterReadingDetail from "./Page/Officer/DetailmeterReading";
import AdminReports from "./Page/Admin/Reports";


const Home = lazy(() => import("./Page/Home"));
const DashboardRouter = lazy(() => import("./Page/DashBoardLayout"));
const AdminLayout = lazy(() => import("./Page/Layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./Page/Admin/Dashboard"));
const ManageCustomers = lazy(() => import("./Page/Admin/ManageCustomer"));
const ManageOfficers = lazy(() => import("./Page/Admin/ManageOfficers"));
const SystemLogs = lazy(() => import("./Page/Admin/SystemLogs"));
const CustomerDetailPage = lazy(() => import("./Page/Officer/CustomerDetailPage"));
const AdminProfile = lazy(() => import("./Page/Admin/AdminProfile"));

const CustomerLayout = lazy(() => import("./Page/Layout/CustomerLayout"));
const CustomerDashboard = lazy(() => import("./Page/Customer/CustomerDashboard"));
const Bills = lazy(() => import("./Page/Customer/Bills"));
const Consumption = lazy(() => import("./Page/Customer/Consumption"));
const Profile = lazy(() => import("./Page/Customer/Profile"));
const SubmitReading = lazy(() => import("./Page/Customer/SubmitReading"));
const Support = lazy(() => import("./Page/Customer/Support"));
const OfficerLayout = lazy(() => import("./Page/Layout/OfficerLayout"));
const OfficerDashboard = lazy(() => import("./Page/Officer/Dashboard"));
const MeterReadings = lazy(() => import("./Page/Officer/MeterReading"));
const RegisterCustomer = lazy(() => import("./Page/Officer/RegisterCustomer"));
const Complaints = lazy(() => import("./Page/Officer/Complaints"));
const OfficerProfile = lazy(() => import("./Page/Officer/OfficerProfile"));
const Reports = lazy(() => import("./Page/Officer/Report"));
const Customers = lazy(() => import("./Page/Officer/Customers"));

const NotFound = lazy(() => import("./Page/NotFound"));

const queryClient = new QueryClient();


const LoadingScreen = () => (
  <div className="w-full h-screen flex items-center justify-center text-lg">
    Loading...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>

            <Route path="/" element={<Home />} />
     <Route path="/login/:role?" element={<UnifiedLogin />} />

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
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="customers" element={<ManageCustomers />} />
              <Route path="officers" element={<ManageOfficers />} />
              <Route path="logs" element={<SystemLogs />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="admin-reports" element={<AdminReports/>}/>
            </Route>

            <Route
              path="/customer"
              element={
                <ProtectedRoute>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="submit-reading" element={<SubmitReading />} />
              <Route path="consumption" element={<Consumption />} />
              <Route path="bills" element={<Bills />} />
              <Route path="support" element={<Support />} />
              <Route path="profile" element={<Profile />} />
            </Route>


            <Route
              path="/officer"
              element={
                <OfficerProtectedRoute>
                  <OfficerLayout />
                </OfficerProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/officer/dashboard" replace />} />
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="meter-readings" element={<MeterReadings />} />
              <Route path="meter-readings/:id" element={<MeterReadingDetail />} />
              <Route path="schedule-payment" element={<SchedulePayment />} />
              <Route path="register-customer" element={<RegisterCustomer />} />
              <Route path="customers" element={<Customers />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<OfficerProfile />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="meter-readings/add" element={<AddMeterReading />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
