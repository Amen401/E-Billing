
import { Navigate } from 'react-router-dom';
import OfficerDashboard from './Officer/Dashboard';
import CustomerDashboard from './Customer/CustomerDashboard';
import { useCustomerAuth } from '@/Components/Context/AuthContext';

const DashboardRouter = () => {
  const { user } = useCustomerAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'officer':
      return <OfficerDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    default:
      return null;
  }
};

export default DashboardRouter;
