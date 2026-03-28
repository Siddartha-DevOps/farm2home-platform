// frontend/src/components/common/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Usage in router:
//   <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
//   <Route path="/farmer/dashboard" element={<PrivateRoute role="farmer"><FarmerDashboard /></PrivateRoute>} />

export default function PrivateRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but remember where they were going
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
