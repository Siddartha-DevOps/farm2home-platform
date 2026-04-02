// Subscriptions/SubscriptionsPage.jsx
// Recurring order management — daily milk, weekly vegetables
import { useEffect, useState } from 'react';
import { Plus, Pause, Play, X, RefreshCw, Calendar } from 'lucide-react';
import api from '../../../services/api';

const FREQ_LABELS = { daily:'Daily', weekly:'Weekly', biweekly:'Every 2 weeks', monthly:'Monthly' };
const FREQ_COLORS = { daily:'bg-green-100 text-green-700', weekly:'bg-blue-100 text-blue-700', biweekly:'bg-purple-100 text-purple-700', monthly:'bg-amber-100 text-amber-700' };
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function SubscriptionsPage() {
  const [subs, setSubs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts]     = useState([]);

  const [form, setForm] = useState({
    name: '', frequency: 'daily', deliveryDays: [], deliverySlot: '6am-9am',
    items: [{ productId: '', quantityKg: '' }],
    shippingAddress: { street:'', city:'', state:'', pincode:'' },
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSubs();
    api.get('/products', { params: { limit: 100 } }).then((r) => setProducts(r.data.data || []));
  }, []);

  const fetchSubs = async () => {
    setLoading(true);
    try { const r = await api.get('/subscriptions'); setSubs(r.data.data); }
    finally { setLoading(false); }
  };

  const togglePause = async (sub) => {
    const endpoint = sub.status === 'active' ? 'pause' : 'resume';
    await api.patch(`/subscriptions/${sub._id}/${endpoint}`);
    fetchSubs();
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return;
    await api.delete(`/subscriptions/${id}`);
    fetchSubs();
  };

  const createSub = async () => {
    try {
      await api.post('/subscriptions', {
        ...form,
        items: form.items.map((i) => ({ productId: i.productId, quantityKg: Number(i.quantityKg) })),
      });
      setShowCreate(false);
      fetchSubs();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create subscription'); }
  };

  const toggleDay = (d) => {
    setForm((f) => ({ ...f, deliveryDays: f.deliveryDays.includes(d) ? f.deliveryDays.filter((x) => x !== d) : [...f.deliveryDays, d] }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Subscriptions</h1>
          <p className="text-sm text-gray-500">Set up recurring deliveries — daily milk, weekly vegetables, and more.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
          <Plus size={16} /> New Subscription
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2].map((i) => <div key={i} className="animate-pulse bg-gray-100 h-40 rounded-2xl" />)}</div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <RefreshCw size={40} className="mx-auto mb-3 opacity-30" />
          <p className="mb-4">No subscriptions yet.</p>
          <p className="text-sm">Set up automatic deliveries for items you need regularly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subs.map((sub) => (
            <div key={sub._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${sub.status === 'cancelled' ? 'opacity-50 border-gray-100' : sub.status === 'paused' ? 'border-amber-200' : 'border-gray-100'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${FREQ_COLORS[sub.frequency]}`}>{FREQ_LABELS[sub.frequency]}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${sub.status === 'active' ? 'bg-green-100 text-green-700' : sub.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{sub.status}</span>
                      <span className="text-xs text-gray-400">{sub.deliverySlot}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-lg">{sub.name}</h3>
                    <div className="mt-2 space-y-1">
                      {sub.items?.map((item, i) => (
                        <p key={i} className="text-sm text-gray-600">{item.productName || item.product?.name} — {item.quantityKg}{item.unit}</p>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={12} />Starts {new Date(sub.startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                      {sub.nextDeliveryDate && <span>Next: {new Date(sub.nextDeliveryDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                      <span className="font-medium text-green-600">₹{sub.totalPerCycle?.toFixed(2)}/cycle</span>
                    </div>
                  </div>
                  {/* Actions */}
                  {sub.status !== 'cancelled' && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => togglePause(sub)} title={sub.status === 'active' ? 'Pause' : 'Resume'} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-500">
                        {sub.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button onClick={() => cancel(sub._id)} title="Cancel" className="p-2 border border-red-100 rounded-lg hover:bg-red-50 transition text-red-400">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create subscription modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">New Subscription</h2>
              <button onClick={() => setShowCreate(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Subscription Name</label>
                <input value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="e.g. Daily Dairy Pack" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Frequency</label>
                <select value={form.frequency} onChange={(e) => setForm({...form,frequency:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  {Object.entries(FREQ_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {form.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Delivery days</label>
                  <div className="flex gap-2 flex-wrap">
                    {DAY_NAMES.map((d,i) => <button key={d} type="button" onClick={() => toggleDay(i)} className={`px-3 py-1.5 rounded-full text-xs border font-medium transition ${form.deliveryDays.includes(i) ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>{d}</button>)}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Delivery Slot</label>
                <select value={form.deliverySlot} onChange={(e) => setForm({...form,deliverySlot:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  {['6am-9am','9am-12pm','12pm-3pm','3pm-6pm'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Items */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Items per delivery</label>
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={item.productId} onChange={(e) => { const u=[...form.items]; u[i].productId=e.target.value; setForm({...form,items:u}); }} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                      <option value="">Select product</option>
                      {products.map((p) => <option key={p._id} value={p._id}>{p.name} — ₹{p.price}/{p.unit}</option>)}
                    </select>
                    <input type="number" value={item.quantityKg} onChange={(e) => { const u=[...form.items]; u[i].quantityKg=e.target.value; setForm({...form,items:u}); }} placeholder="Qty" className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    {form.items.length > 1 && <button onClick={() => setForm({...form,items:form.items.filter((_,idx)=>idx!==i)})} className="text-red-400 hover:text-red-600"><X size={16}/></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({...form,items:[...form.items,{productId:'',quantityKg:''}]})} className="text-sm text-green-600 hover:text-green-700 font-medium">+ Add item</button>
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Delivery Address</label>
                <div className="grid gap-2">
                  <input value={form.shippingAddress.street} onChange={(e) => setForm({...form,shippingAddress:{...form.shippingAddress,street:e.target.value}})} placeholder="Street" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={form.shippingAddress.city} onChange={(e) => setForm({...form,shippingAddress:{...form.shippingAddress,city:e.target.value}})} placeholder="City" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    <input value={form.shippingAddress.state} onChange={(e) => setForm({...form,shippingAddress:{...form.shippingAddress,state:e.target.value}})} placeholder="State" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    <input value={form.shippingAddress.pincode} maxLength={6} onChange={(e) => setForm({...form,shippingAddress:{...form.shippingAddress,pincode:e.target.value}})} placeholder="Pincode" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({...form,startDate:e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={createSub} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">Create Subscription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}