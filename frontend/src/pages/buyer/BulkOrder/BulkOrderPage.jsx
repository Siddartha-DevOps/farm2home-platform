// buyer/BulkOrder/BulkOrderPage.jsx
// Hotels, retailers, wholesalers place bulk orders
import { useState } from 'react';
import { Plus, X, Building2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const BUYER_TYPES = ['household','retailer','hotel','wholesaler'];

export default function BulkOrderPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    buyerType: 'hotel', buyerName: '',
    items: [{ productName: '', quantityKg: '', unit: 'kg', requestedPrice: '' }],
    deliveryDate: '', specialInstructions: '',
    deliveryAddress: { street: '', city: '', state: '', pincode: '' },
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const addItem = () => setForm({ ...form, items: [...form.items, { productName: '', quantityKg: '', unit: 'kg', requestedPrice: '' }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => { const items = [...form.items]; items[i][key] = val; setForm({ ...form, items }); };

  const totalKg = form.items.reduce((sum, i) => sum + (Number(i.quantityKg) || 0), 0);
  const estValue = form.items.reduce((sum, i) => sum + ((Number(i.quantityKg) || 0) * (Number(i.requestedPrice) || 0)), 0);

  const handleSubmit = async () => {
    setError('');
    if (!form.buyerName || !form.deliveryDate || !form.deliveryAddress.city) {
      setError('Please fill in all required fields.'); return;
    }
    if (form.items.some((i) => !i.productName || !i.quantityKg)) {
      setError('Each item needs a product name and quantity.'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/bulk-orders', form);
      setSubmitted(true);
    } catch (err) { setError(err.response?.data?.message || 'Failed to submit order'); }
    finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Send size={28} className="text-green-600" /></div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Bulk Order Submitted!</h2>
      <p className="text-gray-500 mb-6">Our team will match you with the right farmers and contact you within 24 hours for confirmation.</p>
      <button onClick={() => navigate('/')} className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition">Back to Home</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2"><Building2 size={22} className="text-green-600" /><h1 className="text-2xl font-semibold">Bulk Order</h1></div>
      <p className="text-gray-500 text-sm mb-8">For hotels, retailers, wholesalers. Our team will match you with farmers and confirm pricing within 24 hours.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Business info */}
        <div>
          <h2 className="text-base font-semibold mb-4">Business Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Buyer Type <span className="text-red-500">*</span></label>
              <select value={form.buyerType} onChange={(e) => setForm({...form,buyerType:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                {BUYER_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Business Name <span className="text-red-500">*</span></label>
              <input value={form.buyerName} onChange={(e) => setForm({...form,buyerName:e.target.value})} placeholder="e.g. Taj Hotel, Reliance Fresh" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-base font-semibold mb-4">Items Required</h2>
          <div className="space-y-3">
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Product</label>}
                  <input value={item.productName} onChange={(e) => updateItem(i,'productName',e.target.value)} placeholder="e.g. Tomatoes" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="col-span-3">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Quantity</label>}
                  <input type="number" value={item.quantityKg} onChange={(e) => updateItem(i,'quantityKg',e.target.value)} placeholder="100" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Unit</label>}
                  <select value={item.unit} onChange={(e) => updateItem(i,'unit',e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    {['kg','litre','dozen','piece','bunch'].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Your price (₹)</label>}
                  <input type="number" value={item.requestedPrice} onChange={(e) => updateItem(i,'requestedPrice',e.target.value)} placeholder="offer" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="col-span-1 flex justify-center">
                  {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1"><X size={16} /></button>}
                </div>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="mt-3 flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"><Plus size={16} /> Add item</button>

          {totalKg > 0 && (
            <div className="mt-4 bg-green-50 rounded-xl px-4 py-3 flex justify-between text-sm">
              <span className="text-gray-600">Total: <strong>{totalKg} kg</strong></span>
              {estValue > 0 && <span className="text-green-700 font-semibold">Estimated: ₹{estValue.toLocaleString('en-IN')}</span>}
            </div>
          )}
        </div>

        {/* Delivery */}
        <div>
          <h2 className="text-base font-semibold mb-4">Delivery Details</h2>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Delivery Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.deliveryDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({...form,deliveryDate:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <input value={form.deliveryAddress.street} onChange={(e) => setForm({...form,deliveryAddress:{...form.deliveryAddress,street:e.target.value}})} placeholder="Street / Area" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <div className="grid grid-cols-3 gap-3">
              {[{key:'city',ph:'City *'},{key:'state',ph:'State'},{key:'pincode',ph:'Pincode *',max:6}].map(({key,ph,max}) => (
                <input key={key} value={form.deliveryAddress[key]} maxLength={max} onChange={(e) => setForm({...form,deliveryAddress:{...form.deliveryAddress,[key]:e.target.value}})} placeholder={ph} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              ))}
            </div>
            <textarea value={form.specialInstructions} onChange={(e) => setForm({...form,specialInstructions:e.target.value})} rows={2} placeholder="Special instructions (quality grade, packaging, certifications needed...)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:bg-green-300 transition">
          {submitting ? 'Submitting...' : <><Send size={16} /> Submit Bulk Order Request</>}
        </button>
      </div>
    </div>
  );
}