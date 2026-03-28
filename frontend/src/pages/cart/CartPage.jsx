// frontend/src/pages/Cart/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { items, totalAmount, itemCount, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-4 mb-6">
            <div className="bg-gray-200 rounded-lg w-24 h-24" />
            <div className="flex-1 space-y-3">
              <div className="bg-gray-200 rounded h-5 w-1/2" />
              <div className="bg-gray-200 rounded h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some fresh produce to get started.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Browse Products <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">
        Your Cart <span className="text-gray-400 text-lg font-normal">({itemCount} items)</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product._id} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              {/* Product image */}
              <img
                src={item.product.images?.[0] || '/placeholder-product.jpg'}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product._id}`}
                  className="font-medium text-gray-800 hover:text-green-700 truncate block"
                >
                  {item.product.name}
                </Link>
                <p className="text-green-600 font-semibold mt-1">
                  ₹{item.price} / {item.product.unit || 'kg'}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 rounded-full border border-gray-200 hover:border-gray-400 disabled:opacity-40 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="p-1 rounded-full border border-gray-200 hover:border-gray-400 transition"
                  >
                    <Plus size={14} />
                  </button>
                  <span className="text-sm text-gray-400 ml-2">
                    = ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.product._id)}
                className="text-gray-300 hover:text-red-500 transition self-start p-1"
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600">
                  {totalAmount >= 299 ? 'Free' : '₹40'}
                </span>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between font-semibold text-gray-800 mb-6">
              <span>Total</span>
              <span>₹{(totalAmount >= 299 ? totalAmount : totalAmount + 40).toFixed(2)}</span>
            </div>

            {totalAmount < 299 && (
              <p className="text-xs text-orange-500 mb-4">
                Add ₹{(299 - totalAmount).toFixed(2)} more for free delivery
              </p>
            )}

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
