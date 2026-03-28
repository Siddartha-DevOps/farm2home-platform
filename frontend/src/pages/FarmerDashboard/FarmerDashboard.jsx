// frontend/src/pages/FarmerDashboard/FarmerDashboard.jsx
import { useEffect, useState } from 'react';
import { Plus, Package, ShoppingBag, TrendingUp, Edit2, Trash2, X } from 'lucide-react';
import { productAPI, orderAPI } from '../../services/api';

export default function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: '', description: '', unit: 'kg' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        productAPI.getAll({ myProducts: true }),
        orderAPI.getAll({ role: 'farmer' }),
      ]);
      setProducts(prodRes.data.data || []);
      setOrders(ordRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setForm({ name: product.name, price: product.price, stock: product.stock, category: product.category, description: product.description || '', unit: product.unit || 'kg' });
    } else {
      setEditingProduct(null);
      setForm({ name: '', price: '', stock: '', category: '', description: '', unit: 'kg' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editingProduct) {
        await productAPI.update(editingProduct._id, payload);
      } else {
        await productAPI.create(payload);
      }
      setShowModal(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await productAPI.delete(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleStatusUpdate = async (orderId, status) => {
    await orderAPI.updateStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
  };

  const totalRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);
  const STATUS_COLORS = { pending: 'text-yellow-600', confirmed: 'text-blue-600', packed: 'text-purple-600', shipped: 'text-indigo-600', delivered: 'text-green-600', cancelled: 'text-red-500' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Farmer Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'My Products', value: products.length, icon: <Package size={20} />, color: 'text-green-600' },
          { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={20} />, color: 'text-blue-600' },
          { label: 'Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: <TrendingUp size={20} />, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {['products', 'orders'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{products.length} products</p>
            <button onClick={() => openModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
              <Plus size={16} /> Add Product
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-xl" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><Package size={40} className="mx-auto mb-3 opacity-30" /><p>No products yet.</p></div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p._id} className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <img src={p.images?.[0] || '/placeholder-product.jpg'} alt={p.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-sm text-gray-500">₹{p.price}/{p.unit} · Stock: {p.stock}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{p.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                    <button onClick={() => openModal(p)} className="p-1.5 text-gray-400 hover:text-blue-600 transition"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3">
          {loading ? [1,2].map((i) => <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-xl" />) :
            orders.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><ShoppingBag size={40} className="mx-auto mb-3 opacity-30" /><p>No orders received yet.</p></div>
            ) : orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</p>
                    <p className="text-sm text-green-600 font-medium mt-1">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <select value={order.status} onChange={(e) => handleStatusUpdate(order._id, e.target.value)} className={`text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 font-medium ${STATUS_COLORS[order.status]}`}>
                    {['pending','confirmed','packed','shipped','delivered','cancelled'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {[{label:'Product Name',key:'name',type:'text',placeholder:'e.g. Fresh Tomatoes'},{label:'Price (₹)',key:'price',type:'number',placeholder:'40'},{label:'Stock',key:'stock',type:'number',placeholder:'100'}].map(({label,key,type,placeholder}) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm({...form,[key]:e.target.value})} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form,category:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option value="">Select</option>
                    {['vegetables','fruits','grains','dairy','herbs'].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({...form,unit:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    {['kg','g','litre','dozen','bunch','piece'].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form,description:e.target.value})} rows={3} placeholder="Describe your product..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:bg-green-300 transition">{saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
