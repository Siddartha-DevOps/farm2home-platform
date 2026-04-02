// AnalyticsDashboard.jsx
import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Users, DollarSign, Package } from 'lucide-react';
import api from '../../../services/api';

const PERIOD_OPTIONS = [{ value: '7', label: '7 days' },{ value: '30', label: '30 days' },{ value: '90', label: '90 days' }];
const STATUS_COLORS  = { pending:'bg-yellow-100 text-yellow-800', confirmed:'bg-blue-100 text-blue-800', delivered:'bg-green-100 text-green-800', cancelled:'bg-red-100 text-red-800', shipped:'bg-indigo-100 text-indigo-800' };
const CATEGORY_COLORS = { vegetables:'#16a34a', fruits:'#ea580c', grains:'#ca8a04', dairy:'#0284c7', herbs:'#7c3aed' };

export default function AnalyticsDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('30');

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics?period=${period}d`).then((r) => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [period]);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="animate-pulse grid grid-cols-4 gap-4 mb-8">{[1,2,3,4].map((i) => <div key={i} className="bg-gray-100 h-28 rounded-2xl" />)}</div>
      <div className="animate-pulse grid grid-cols-2 gap-6">{[1,2].map((i) => <div key={i} className="bg-gray-100 h-64 rounded-2xl" />)}</div>
    </div>
  );

  const stats = [
    { label: 'Total Revenue', value: `₹${(data?.revenue?.total || 0).toLocaleString('en-IN')}`, icon: <DollarSign size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Orders', value: data?.revenue?.ordersCount || 0, icon: <ShoppingBag size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New Buyers', value: data?.newUsers?.find((u) => u._id === 'buyer')?.count || 0, icon: <Users size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'New Farmers', value: data?.newUsers?.find((u) => u._id === 'farmer')?.count || 0, icon: <TrendingUp size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-gray-500">Platform performance overview</p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setPeriod(opt.value)} className={`px-3 py-1.5 rounded-lg text-sm transition ${period === opt.value ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`${s.bg} ${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Revenue by category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold mb-4">Revenue by Category</h2>
          {data?.revenue?.byCategory?.length ? (
            <div className="space-y-3">
              {data.revenue.byCategory.map((cat) => {
                const max = Math.max(...data.revenue.byCategory.map((c) => c.revenue));
                const pct = max > 0 ? (cat.revenue / max) * 100 : 0;
                return (
                  <div key={cat._id || 'unknown'}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">{cat._id || 'Unknown'}</span>
                      <span className="font-medium">₹{cat.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat._id] || '#6b7280' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-gray-400 text-sm">No data for this period</p>}
        </div>

        {/* Orders by status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold mb-4">Orders by Status</h2>
          {data?.orders?.length ? (
            <div className="space-y-2">
              {data.orders.map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[s._id] || 'bg-gray-100 text-gray-600'}`}>{s._id}</span>
                  <div className="flex items-center gap-3 flex-1 ml-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(s.count / Math.max(...data.orders.map((o) => o.count))) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-8 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="text-base font-semibold mb-4">Top Selling Products</h2>
        {data?.topProducts?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium text-right">Qty Sold</th>
                <th className="pb-2 font-medium text-right">Revenue</th>
              </tr></thead>
              <tbody>
                {data.topProducts.map((p, i) => (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="w-5 h-5 bg-gray-100 rounded text-xs flex items-center justify-center font-medium text-gray-500">{i+1}</span>
                      {p.name}
                    </td>
                    <td className="py-2.5 text-right text-gray-600">{p.totalQty} kg</td>
                    <td className="py-2.5 text-right font-medium text-green-600">₹{p.totalRevenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-sm">No data</p>}
      </div>

      {/* Top farmers */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold mb-4">Top Performing Farmers</h2>
        {data?.topFarmers?.length ? (
          <div className="space-y-3">
            {data.topFarmers.map((f, i) => (
              <div key={f._id} className="flex items-center gap-3">
                <span className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{f.user?.name} <span className="text-gray-400 font-normal">· {f.farmName}</span></p>
                  <p className="text-xs text-gray-500">{f.stats?.totalOrders} orders · avg rating {f.stats?.avgRating?.toFixed(1) || '—'}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">₹{f.stats?.totalRevenue?.toLocaleString('en-IN') || '0'}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-sm">No data</p>}
      </div>
    </div>
  );
}