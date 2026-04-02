// frontend/src/services/api.js
// npm install axios
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),      // { page, limit, category, search, sort }
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),             // farmer only
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (id, formData) =>
    api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity) => api.post('/cart/items', { productId, quantity }),
  updateItem: (productId, quantity) => api.patch(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => api.delete(`/orders/${id}`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createRazorpayOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/products/${productId}/reviews`),
  create: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  delete: (productId, reviewId) => api.delete(`/products/${productId}/reviews/${reviewId}`),
};

// frontend/src/services/api.additions.js
// ADD THESE to your existing frontend/src/services/api.js file

// ── Farmer Onboarding ─────────────────────────────────────────────────────────
export const farmerOnboardingAPI = {
  getStatus:  ()     => api.get('/farmer/onboarding'),
  step1:      (data) => api.post('/farmer/onboarding/step1', data),
  step2:      (data) => api.post('/farmer/onboarding/step2', data),
  step3:      (data) => api.post('/farmer/onboarding/step3', data),
  addBank:    (data) => api.post('/farmer/onboarding/bank', data),
};

// ── Demand Alerts ─────────────────────────────────────────────────────────────
export const demandAlertAPI = {
  getAll:       (params) => api.get('/demand-alerts', { params }),
  create:       (data)   => api.post('/demand-alerts', data),
  respond:      (id, data) => api.post(`/demand-alerts/${id}/respond`, data),
  acceptResponse: (alertId, responseId, action) =>
    api.patch(`/demand-alerts/${alertId}/responses/${responseId}`, { action }),
  getMyResponses: () => api.get('/demand-alerts/my-responses'),
};

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionAPI = {
  getAll:  ()     => api.get('/subscriptions'),
  create:  (data) => api.post('/subscriptions', data),
  pause:   (id, pauseUntil) => api.patch(`/subscriptions/${id}/pause`, { pauseUntil }),
  resume:  (id)   => api.patch(`/subscriptions/${id}/resume`),
  cancel:  (id)   => api.delete(`/subscriptions/${id}`),
};

// ── Delivery Tracking ─────────────────────────────────────────────────────────
export const deliveryTrackingAPI = {
  getByOrder:     (orderId) => api.get(`/delivery/${orderId}`),
  updateStatus:   (orderId, status, location) => api.patch(`/delivery/${orderId}/status`, { status, ...location }),
  verifyOtp:      (orderId, otp)  => api.post(`/delivery/${orderId}/verify-otp`, { otp }),
  updateLocation: (orderId, lat, lng) => api.patch(`/delivery/${orderId}/live-location`, { lat, lng }),
};

// ── Bulk Orders ───────────────────────────────────────────────────────────────
export const bulkOrderAPI = {
  getAll:        (params) => api.get('/bulk-orders', { params }),
  create:        (data)   => api.post('/bulk-orders', data),
  negotiate:     (id, message) => api.post(`/bulk-orders/${id}/negotiate`, { message }),
  assignFarmers: (id, assignments) => api.patch(`/bulk-orders/${id}/assign-farmers`, { assignments }),
  farmerRespond: (id, action, notes) => api.patch(`/bulk-orders/${id}/farmer-response`, { action, notes }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getFarmers:       (params) => api.get('/admin/farmers', { params }),
  verifyFarmer:     (profileId, action, note) => api.patch(`/admin/farmers/${profileId}/verify`, { action, note }),
  getProducts:      (params) => api.get('/admin/products', { params }),
  moderateProduct:  (id, action, reason) => api.patch(`/admin/products/${id}/moderate`, { action, reason }),
  getLogistics:     () => api.get('/admin/logistics'),
  assignDelivery:   (orderId, data) => api.patch(`/admin/logistics/${orderId}/assign`, data),
  getPayments:      (params) => api.get('/admin/payments', { params }),
  refundOrder:      (orderId) => api.post(`/admin/payments/${orderId}/refund`),
  getAnalytics:     (period) => api.get(`/admin/analytics?period=${period}`),
};


export default api;
