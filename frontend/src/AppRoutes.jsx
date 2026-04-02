// src/AppRoutes.jsx
// Wire ALL routes — paste this into your App.jsx or router config
// npm install react-router-dom

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { CartProvider }  from './context/CartContext';
import { ToastProvider } from './components/common/Toast';
import PrivateRoute from './components/common/PrivateRoute';

// ── Existing pages ─────────────────────────────────────────────────────────────
import CartPage      from './pages/cart/CartPage';
import CheckoutPage  from './pages/Checkout/CheckoutPage';
import OrdersPage    from './pages/Orders/OrdersPage';

// ── Farmer App ────────────────────────────────────────────────────────────────
import FarmerOnboarding    from './pages/farmer/Onboarding/FarmerOnboarding';
import FarmerDashboard     from './pages/FarmerDashboard/FarmerDashboard';
import DemandAlertsPage    from './pages/farmer/DemandAlerts/DemandAlertsPage';

// ── Buyer App ─────────────────────────────────────────────────────────────────
import BulkOrderPage         from './pages/buyer/BulkOrder/BulkOrderPage';
import SubscriptionsPage     from './pages/buyer/SubscriptionsPage';
import DeliveryTrackingPage  from './pages/buyer/DeliveryTracking/DeliveryTrackingPage';

// ── Admin Dashboard ───────────────────────────────────────────────────────────
import FarmerVerificationPage  from './pages/admin/FarmerVerificationPage';
import AnalyticsDashboard      from './pages/admin/AnalyticsDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* ── Public ── */}
              {/* <Route path="/"         element={<HomePage />} /> */}
              {/* <Route path="/products" element={<ProductsPage />} /> */}
              {/* <Route path="/products/:id" element={<ProductDetailPage />} /> */}
              {/* <Route path="/login"    element={<LoginPage />} /> */}
              {/* <Route path="/register" element={<RegisterPage />} /> */}

              {/* ── Buyer routes ── */}
              <Route path="/cart"     element={<PrivateRoute><CartPage /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
              <Route path="/orders"   element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
              <Route path="/orders/:orderId" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
              <Route path="/track/:orderId"  element={<PrivateRoute><DeliveryTrackingPage /></PrivateRoute>} />
              <Route path="/subscriptions"   element={<PrivateRoute><SubscriptionsPage /></PrivateRoute>} />
              <Route path="/bulk-order"      element={<PrivateRoute><BulkOrderPage /></PrivateRoute>} />

              {/* ── Farmer routes ── */}
              <Route path="/farmer/onboarding" element={<PrivateRoute role="farmer"><FarmerOnboarding /></PrivateRoute>} />
              <Route path="/farmer/dashboard"  element={<PrivateRoute role="farmer"><FarmerDashboard /></PrivateRoute>} />
              <Route path="/farmer/demand-alerts" element={<PrivateRoute role="farmer"><DemandAlertsPage /></PrivateRoute>} />

              {/* ── Admin routes ── */}
              <Route path="/admin/farmers"    element={<PrivateRoute role="admin"><FarmerVerificationPage /></PrivateRoute>} />
              <Route path="/admin/analytics"  element={<PrivateRoute role="admin"><AnalyticsDashboard /></PrivateRoute>} />
              {/* <Route path="/admin/products"   element={<PrivateRoute role="admin"><ProductModerationPage /></PrivateRoute>} /> */}
              {/* <Route path="/admin/logistics"  element={<PrivateRoute role="admin"><LogisticsPage /></PrivateRoute>} /> */}
              {/* <Route path="/admin/payments"   element={<PrivateRoute role="admin"><PaymentManagementPage /></PrivateRoute>} /> */}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}