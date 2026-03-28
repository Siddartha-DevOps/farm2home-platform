// frontend/src/pages/Orders/OrdersPage.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, ChevronRight, CheckCircle } from 'lucide-react';
import { orderAPI } from '../../services/api';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed:    'bg-purple-100 text-purple-800',
  shipped:   'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  useEffect(() => {
    (async () => {
      try {
        const res = await orderAPI.getAll();
        setOrders(res.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-28 mb-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Order placed confirmation banner */}
      {justPlaced && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-6">
          <CheckCircle size={20} className="flex-shrink-0" />
          <span className="text-sm font-medium">Order placed successfully! We'll notify you once it's confirmed.</span>
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="mx-auto h-14 w-14 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="text-green-600 hover:underline font-medium">
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-green-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="font-medium text-gray-800 mt-1">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                    <span className="text-green-600">₹{order.totalAmount.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>

              {/* Item preview */}
              <div className="flex gap-2 mt-4">
                {order.items.slice(0, 4).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                  />
                ))}
                {order.items.length > 4 && (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
