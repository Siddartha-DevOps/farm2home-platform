// farmer/DemandAlerts/DemandAlertsPage.jsx
// Farmers see live demand from hotels, retailers, wholesalers
import { useEffect, useState } from 'react';
import { Bell, MapPin, Package, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import api from '../../../services/api';

const BUYER_COLORS = { hotel: 'bg-purple-100 text-purple-700', retailer: 'bg-blue-100 text-blue-700', wholesaler: 'bg-amber-100 text-amber-700', household: 'bg-green-100 text-green-700' };

export default function DemandAlertsPage() {
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [responding, setResponding] = useState(null);
  const [form, setForm]         = useState({ offeredPrice: '', offeredQtyKg: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter]     = useState({ crop: '', city: '' });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.crop) params.crop = filter.crop;
      if (filter.city) params.city = filter.city;
      const res = await api.get('/demand-alerts', { params });
      setAlerts(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleRespond = async (alertId) => {
    setSubmitting(true);
    try {
      await api.post(`/demand-alerts/${alertId}/respond`, {
        offeredPrice: Number(form.offeredPrice),
        offeredQtyKg: Number(form.offeredQtyKg),
        message: form.message,
      });
      setResponding(null);
      setForm({ offeredPrice: '', offeredQtyKg: '', message: '' });
      fetchAlerts();
    } finally { setSubmitting(false); }
  };

  const daysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Bell size={22} className="text-green-600" />
        <h1 className="text-2xl font-semibold">Demand Alerts</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8">Hotels, retailers, and wholesalers looking for fresh produce. Respond to secure bulk deals.</p>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input value={filter.crop} onChange={(e) => setFilter({...filter, crop: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && fetchAlerts()} placeholder="Search crop (e.g. Mango)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        <input value={filter.city} onChange={(e) => setFilter({...filter, city: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && fetchAlerts()} placeholder="City (e.g. Hyderabad)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        <button onClick={fetchAlerts} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">Search</button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-2xl" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><Bell size={40} className="mx-auto mb-3 opacity-30" /><p>No demand alerts right now. Check back later.</p></div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${BUYER_COLORS[alert.buyerType]}`}>{alert.buyerType}</span>
                      {alert.isOrganic && <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">Organic only</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysLeft(alert.neededBy) <= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        {daysLeft(alert.neededBy)} days left
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {alert.cropName} — {alert.quantityKg} kg needed
                    </h3>
                    <p className="text-green-600 font-semibold text-lg">Offer: ₹{alert.offerPrice}/kg</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={13} />{alert.deliveryCity}{alert.deliveryState && `, ${alert.deliveryState}`}</span>
                      <span className="flex items-center gap-1"><Clock size={13} />Needed by {new Date(alert.neededBy).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
                      <span className="flex items-center gap-1"><Package size={13} />{alert.responses?.length || 0} response{alert.responses?.length !== 1 ? 's' : ''}</span>
                    </div>
                    {alert.buyerName && <p className="text-sm text-gray-400 mt-1">{alert.buyerName}</p>}
                  </div>
                  {/* Potential earnings */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Potential earning</p>
                    <p className="text-xl font-bold text-green-700">₹{(alert.offerPrice * alert.quantityKg).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400">for full {alert.quantityKg}kg</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => setResponding(responding === alert._id ? null : alert._id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition font-medium">
                    Respond to Demand
                  </button>
                  <button onClick={() => setExpanded(expanded === alert._id ? null : alert._id)} className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">
                    {expanded === alert._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Respond form */}
              {responding === alert._id && (
                <div className="border-t border-gray-100 bg-green-50 p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">Your Offer</h4>
                    <button onClick={() => setResponding(null)}><X size={16} className="text-gray-400" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Your price (₹/kg)</label>
                      <input type="number" value={form.offeredPrice} onChange={(e) => setForm({...form, offeredPrice: e.target.value})} placeholder={`Buyer offering ₹${alert.offerPrice}`} className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantity you can supply (kg)</label>
                      <input type="number" value={form.offeredQtyKg} onChange={(e) => setForm({...form, offeredQtyKg: e.target.value})} placeholder={`Max ${alert.quantityKg}kg`} className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                  </div>
                  <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} rows={2} placeholder="Optional note to buyer (quality, harvest date, delivery capability...)" className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none mb-3" />
                  {form.offeredPrice && form.offeredQtyKg && (
                    <p className="text-sm text-green-700 font-medium mb-3">Your total: ₹{(Number(form.offeredPrice) * Number(form.offeredQtyKg)).toLocaleString('en-IN')}</p>
                  )}
                  <button onClick={() => handleRespond(alert._id)} disabled={submitting || !form.offeredPrice || !form.offeredQtyKg} className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-300 transition">
                    {submitting ? 'Submitting...' : 'Submit Offer'}
                  </button>
                </div>
              )}

              {/* Responses list */}
              {expanded === alert._id && alert.responses?.length > 0 && (
                <div className="border-t border-gray-100 p-5">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">All Responses ({alert.responses.length})</h4>
                  <div className="space-y-2">
                    {alert.responses.map((r, i) => (
                      <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-600">Farmer #{i+1} — {r.offeredQtyKg}kg @ ₹{r.offeredPrice}/kg</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${r.status === 'accepted' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}