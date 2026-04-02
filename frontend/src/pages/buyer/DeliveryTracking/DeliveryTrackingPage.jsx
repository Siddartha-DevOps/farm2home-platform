// DeliveryTracking/DeliveryTrackingPage.jsx

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import api from '../../../services/api';

const STAGES = [
  { key: 'order_placed',     label: 'Order Placed',          icon: <Package size={16} /> },
  { key: 'farmer_confirmed', label: 'Farmer Confirmed',      icon: <CheckCircle size={16} /> },
  { key: 'being_packed',     label: 'Being Packed',          icon: <Package size={16} /> },
  { key: 'picked_up',        label: 'Picked Up from Farm',   icon: <Truck size={16} /> },
  { key: 'in_transit',       label: 'In Transit',            icon: <Truck size={16} /> },
  { key: 'out_for_delivery', label: 'Out for Delivery',      icon: <Truck size={16} /> },
  { key: 'delivered',        label: 'Delivered',             icon: <CheckCircle size={16} /> },
];

export default function DeliveryTrackingPage() {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [otp, setOtp]           = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const intervalRef             = useRef(null);

  const fetchTracking = async () => {
    try {
      const res = await api.get(`/delivery/${orderId}`);
      setTracking(res.data.data);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTracking();
    // Poll every 30s for live updates
    intervalRef.current = setInterval(fetchTracking, 30000);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  const verifyOtp = async () => {
    try {
      await api.post(`/delivery/${orderId}/verify-otp`, { otp });
      fetchTracking();
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const currentStageIdx = tracking ? STAGES.findIndex((s) => s.key === tracking.currentStatus) : -1;
  const isDelivered     = tracking?.currentStatus === 'delivered';
  const isOutForDelivery = tracking?.currentStatus === 'out_for_delivery';

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 rounded w-1/2" />
          <div className="bg-gray-100 h-64 rounded-2xl" />
          <div className="bg-gray-100 h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!tracking) {
    return <div className="max-w-lg mx-auto px-4 py-20 text-center text-gray-400"><Package size={40} className="mx-auto mb-3 opacity-30" /><p>Tracking information not available yet.</p></div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">Track Your Order</h1>
      <p className="text-sm text-gray-500 mb-6">Order #{orderId.slice(-8).toUpperCase()}</p>

      {/* Live location map placeholder */}
      {(tracking.currentStatus === 'in_transit' || tracking.currentStatus === 'out_for_delivery') && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
          <Truck size={32} className="mx-auto text-green-600 mb-2" />
          <p className="text-green-700 font-medium text-sm">Your order is on the way!</p>
          {tracking.estimatedDeliveryTime && (
            <p className="text-green-600 text-xs mt-1">
              Expected by {new Date(tracking.estimatedDeliveryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {tracking.currentLocation?.lat && (
            <p className="text-xs text-gray-500 mt-2">
              Last location update: {new Date(tracking.currentLocation.updatedAt).toLocaleTimeString('en-IN')}
            </p>
          )}
        </div>
      )}

      {/* Delivery person card */}
      {tracking.deliveryPartner?.name && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
            {tracking.deliveryPartner.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{tracking.deliveryPartner.name}</p>
            <p className="text-sm text-gray-500">Delivery Partner</p>
            {tracking.deliveryPartner.vehicleNumber && (
              <p className="text-xs text-gray-400">{tracking.deliveryPartner.vehicleNumber}</p>
            )}
          </div>
          {tracking.deliveryPartner.phone && (
            <a href={`tel:${tracking.deliveryPartner.phone}`} className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
              <Phone size={16} />
            </a>
          )}
        </div>
      )}

      {/* Progress stages */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Delivery Progress</h2>
        <div className="space-y-1">
          {STAGES.map((stage, i) => {
            const done    = i < currentStageIdx;
            const current = i === currentStageIdx;
            const future  = i > currentStageIdx;
            return (
              <div key={stage.key} className="flex items-start gap-3">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-green-600 text-white' : current ? 'bg-green-100 text-green-600 ring-2 ring-green-400' : 'bg-gray-100 text-gray-300'}`}>
                    {stage.icon}
                  </div>
                  {i < STAGES.length - 1 && <div className={`w-0.5 h-6 mt-1 ${done ? 'bg-green-400' : 'bg-gray-100'}`} />}
                </div>
                {/* Label + time */}
                <div className="flex-1 pb-5">
                  <p className={`text-sm font-medium ${done || current ? 'text-gray-800' : 'text-gray-400'}`}>{stage.label}</p>
                  {current && <p className="text-xs text-green-600 font-medium">Current status</p>}
                  {(() => {
                    const event = tracking.timeline?.find((t) => t.status === stage.key);
                    return event ? (
                      <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OTP verification (shown when out for delivery) */}
      {isOutForDelivery && !tracking.otpVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-1">Confirm Delivery</h3>
          <p className="text-sm text-gray-600 mb-4">Share the 4-digit OTP with the delivery person to confirm receipt of your order.</p>
          <div className="flex gap-3">
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/,'').slice(0,4))} placeholder="4-digit OTP" maxLength={4} className="flex-1 border border-amber-300 bg-white rounded-lg px-3 py-2 text-sm text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <button onClick={verifyOtp} disabled={otp.length !== 4} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:bg-amber-200 transition">
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Delivered state */}
      {isDelivered && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <CheckCircle size={36} className="mx-auto text-green-600 mb-2" />
          <h3 className="font-semibold text-green-800">Delivered!</h3>
          <p className="text-sm text-green-600 mt-1">
            {tracking.actualDeliveryTime && `Delivered at ${new Date(tracking.actualDeliveryTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
      )}

      {/* Farmer contact */}
      {tracking.farmer && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">Questions about your order?</p>
          <a href={`tel:${tracking.farmer.phone}`} className="text-sm text-green-600 hover:underline font-medium">
            Contact Farmer: {tracking.farmer.name}
          </a>
        </div>
      )}
    </div>
  );
}