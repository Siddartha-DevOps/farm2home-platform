// FarmerVerificationPage.jsx
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, MapPin, Leaf } from 'lucide-react';
import api from '../../../services/api';

const STATUS_CONFIG = {
  pending:              { label:'Pending',            color:'bg-gray-100 text-gray-600' },
  documents_submitted:  { label:'Docs Submitted',     color:'bg-blue-100 text-blue-700' },
  under_review:         { label:'Under Review',       color:'bg-yellow-100 text-yellow-700' },
  approved:             { label:'Approved',           color:'bg-green-100 text-green-700' },
  rejected:             { label:'Rejected',           color:'bg-red-100 text-red-600' },
};

export default function FarmerVerificationPage() {
  const [farmers, setFarmers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('documents_submitted');
  const [selected, setSelected] = useState(null);
  const [note, setNote]         = useState('');
  const [saving, setSaving]     = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/farmers', { params: { status: filter } }); setFarmers(r.data.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleVerify = async (profileId, action) => {
    setSaving(true);
    try {
      await api.patch(`/admin/farmers/${profileId}/verify`, { action, note });
      setSelected(null);
      setNote('');
      fetch();
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Farmer Verification</h1>
      <p className="text-sm text-gray-500 mb-6">Review Aadhaar, farm location, and crop details before approving farmers.</p>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${filter === key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {cfg.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-xl" />)}</div>
      ) : farmers.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><Clock size={40} className="mx-auto mb-3 opacity-30" /><p>No farmers in this status.</p></div>
      ) : (
        <div className="space-y-3">
          {farmers.map((f) => (
            <div key={f._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_CONFIG[f.verificationStatus]?.color}`}>
                      {STATUS_CONFIG[f.verificationStatus]?.label}
                    </span>
                    {f.aadhaar?.verified && <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">Aadhaar ✓</span>}
                  </div>
                  <h3 className="font-semibold text-gray-800">{f.user?.name} <span className="font-normal text-gray-500">— {f.farmName}</span></h3>
                  <p className="text-sm text-gray-500">{f.user?.email} · {f.user?.phone}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {f.location?.district && <span className="flex items-center gap-1"><MapPin size={11} />{f.location.district}, {f.location.state}</span>}
                    {f.cropTypes?.length > 0 && <span className="flex items-center gap-1"><Leaf size={11} />{f.cropTypes.map((c) => c.name).join(', ')}</span>}
                    <span>Farm: {f.farmSizeCre} acres</span>
                    <span>Joined {new Date(f.user?.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(selected?._id === f._id ? null : f)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-500">
                    <Eye size={16} />
                  </button>
                  {f.verificationStatus !== 'approved' && (
                    <button onClick={() => { setSelected(f); }} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition">
                      <CheckCircle size={14} /> Review
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded review panel */}
              {selected?._id === f._id && (
                <div className="border-t border-gray-100 mt-4 pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-xs text-gray-400 mb-1">Aadhaar (masked)</p><p className="font-mono">{f.aadhaar?.maskedNumber || 'Not submitted'}</p></div>
                    <div><p className="text-xs text-gray-400 mb-1">Bank Account</p><p className="font-mono">{f.bankAccount?.maskedAccount || 'Not submitted'} {f.bankAccount?.ifscCode && `· ${f.bankAccount.ifscCode}`}</p></div>
                    <div><p className="text-xs text-gray-400 mb-1">Farm Address</p><p>{f.location?.address || '—'}, {f.location?.village}</p></div>
                    <div><p className="text-xs text-gray-400 mb-1">GPS Coordinates</p><p className="font-mono text-xs">{f.location?.coordinates?.coordinates?.join(', ') || '—'}</p></div>
                  </div>
                  {f.cropTypes?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Crops declared</p>
                      <div className="flex flex-wrap gap-2">
                        {f.cropTypes.map((c, i) => (
                          <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${c.isOrganic ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            {c.name} · {c.category}{c.isOrganic ? ' · Organic' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Note to farmer (optional)</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="e.g. Please submit clearer farm photos..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleVerify(f._id, 'approved')} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-300 transition">
                      <CheckCircle size={16} /> Approve Farmer
                    </button>
                    <button onClick={() => handleVerify(f._id, 'rejected')} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:bg-red-300 transition">
                      <XCircle size={16} /> Reject
                    </button>
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