// frontend/src/pages/Checkout/CheckoutPage.jsx
// npm install lucide-react
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI, paymentAPI } from '../../services/api';

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 299;

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const deliveryFee = totalAmount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const grandTotal = totalAmount + deliveryFee;

  const validate = () => {
    const e = {};
    if (!address.street.trim()) e.street = 'Street is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!address.pincode.match(/^\d{6}$/)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRazorpay = async (orderId) => {
    const res = await paymentAPI.createRazorpayOrder(orderId);
    const { razorpayOrderId, amount, currency, keyId } = res.data.data;

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'Farm2Home',
        description: 'Fresh produce delivery',
        theme: { color: '#16a34a' },
        handler: async (response) => {
          try {
            await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
            });
            resolve();
          } catch {
            reject(new Error('Payment verification failed'));
          }
        },
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await orderAPI.create({
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
      });

      const orderId = orderRes.data.data._id;

      // 2. If online payment, trigger Razorpay
      if (paymentMethod === 'online') {
        await handleRazorpay(orderId);
      }

      // 3. Clear cart and go to confirmation
      await clearCart();
      navigate(`/orders/${orderId}`, { state: { justPlaced: true } });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || err.message || 'Failed to place order' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Address + Payment */}
        <div className="md:col-span-2 space-y-6">
          {/* Delivery address */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Street / House No.</label>
                <input
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.street ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="123, MG Road"
                />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  <input
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.city ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="Hyderabad"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State</label>
                  <input
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Telangana"
                  />
                </div>
              </div>

              <div className="w-1/2">
                <label className="block text-sm text-gray-600 mb-1">Pincode</label>
                <input
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  maxLength={6}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.pincode ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="500001"
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                { value: 'online', label: 'Pay Online (UPI / Card)', desc: 'Secure payment via Razorpay' },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${paymentMethod === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 accent-green-600"
                  />
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1 mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-gray-800 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                </span>
              </div>
            </div>

            <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-gray-900 mb-6">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm mb-3 text-center">{errors.submit}</p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition font-medium"
            >
              {loading ? 'Placing Order...' : `Place Order · ₹${grandTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
