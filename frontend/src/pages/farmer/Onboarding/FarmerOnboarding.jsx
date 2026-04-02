// farmer/Onboarding/FarmerOnboarding.jsx
// 4-step wizard: Aadhaar → Farm Location → Crop Types → Bank Account
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Leaf, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../../../services/api';

const STEPS = [
  { id: 1, label: 'Aadhaar & Farm', icon: <CheckCircle size={18} /> },
  { id: 2, label: 'Farm Location', icon: <MapPin size={18} /> },
  { id: 3, label: 'Crop Types',    icon: <Leaf size={18} /> },
  { id: 4, label: 'Bank Account',  icon: <CreditCard size={18} /> },
];

const CATEGORIES = ['vegetables','fruits','grains','dairy','herbs'];
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function FarmerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Step 1
  const [s1, setS1] = useState({ aadhaarNumber: '', farmName: '', farmSizeAcres: '', bio: '' });
  // Step 2
  const [s2, setS2] = useState({ address: '', village: '', district: '', state: '', pincode: '', latitude: '', longitude: '' });
  // Step 3
  const [crops, setCrops] = useState([{ name: '', category: 'vegetables', isOrganic: false, seasonMonths: [] }]);
  // Step 4
  const [s4, setS4] = useState({ accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' });

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      if (step === 1) {
        await api.post('/farmer/onboarding/step1', { ...s1, farmSizeAcres: Number(s1.farmSizeAcres) });
      } else if (step === 2) {
        await api.post('/farmer/onboarding/step2', { ...s2, latitude: Number(s2.latitude), longitude: Number(s2.longitude) });
      } else if (step === 3) {
        await api.post('/farmer/onboarding/step3', { cropTypes: crops });
      } else if (step === 4) {
        await api.post('/farmer/onboarding/bank', s4);
        navigate('/farmer/dashboard');
        return;
      }
      setStep((s) => s + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleMonth = (idx, month) => {
    const updated = [...crops];
    const months  = updated[idx].seasonMonths;
    updated[idx].seasonMonths = months.includes(month) ? months.filter((m) => m !== month) : [...months, month];
    setCrops(updated);
  };

  const addCrop = () => setCrops([...crops, { name: '', category: 'vegetables', isOrganic: false, seasonMonths: [] }]);
  const removeCrop = (i) => setCrops(crops.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">Farmer Registration</h1>
        <p className="text-gray-500 text-sm mb-8">Complete all steps to start selling on Farm2Home.</p>

        {/* Step indicators */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition ${step === s.id ? 'bg-green-600 text-white' : step > s.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {s.icon} {s.label}
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>}

          {/* ── Step 1: Aadhaar + Farm Basics ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Aadhaar & Farm Details</h2>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Aadhaar Number <span className="text-red-500">*</span></label>
                <input value={s1.aadhaarNumber} onChange={(e) => setS1({...s1, aadhaarNumber: e.target.value.replace(/\D/,'')})} maxLength={12} placeholder="12-digit Aadhaar number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-mono tracking-widest" />
                <p className="text-xs text-gray-400 mt-1">Your Aadhaar is encrypted and used only for identity verification.</p>
              </div>
              {[{label:'Farm Name',key:'farmName',placeholder:'e.g. Ravi Organic Farms'},{label:'Farm Size (acres)',key:'farmSizeAcres',placeholder:'e.g. 5.5',type:'number'}].map(({label,key,placeholder,type='text'}) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label} <span className="text-red-500">*</span></label>
                  <input type={type} value={s1[key]} onChange={(e) => setS1({...s1,[key]:e.target.value})} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-600 mb-1">About your farm</label>
                <textarea value={s1.bio} onChange={(e) => setS1({...s1,bio:e.target.value})} rows={3} maxLength={500} placeholder="Tell buyers about your farming practices..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>
            </div>
          )}

          {/* ── Step 2: Farm Location ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Farm Location</h2>
              {[
                {label:'Street / Village Address',key:'address',placeholder:'Survey No. 123, Main Road'},
                {label:'Village / Hamlet',key:'village',placeholder:'Warangal Village'},
                {label:'District',key:'district',placeholder:'Rangareddy'},
                {label:'State',key:'state',placeholder:'Telangana'},
                {label:'Pincode',key:'pincode',placeholder:'500001',maxLength:6},
              ].map(({label,key,placeholder,maxLength}) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input value={s2[key]} onChange={(e) => setS2({...s2,[key]:e.target.value})} placeholder={placeholder} maxLength={maxLength} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[{label:'GPS Latitude',key:'latitude',placeholder:'17.3850'},{label:'GPS Longitude',key:'longitude',placeholder:'78.4867'}].map(({label,key,placeholder}) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                    <input type="number" step="any" value={s2[key]} onChange={(e) => setS2({...s2,[key]:e.target.value})} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => navigator.geolocation?.getCurrentPosition((p) => setS2({...s2,latitude:p.coords.latitude.toFixed(6),longitude:p.coords.longitude.toFixed(6)}))} className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium">
                <MapPin size={16} /> Use my current location
              </button>
            </div>
          )}

          {/* ── Step 3: Crop Types ── */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Crop Types You Grow</h2>
              {crops.map((crop, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                  {crops.length > 1 && <button onClick={() => removeCrop(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs">Remove</button>}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Crop Name</label>
                      <input value={crop.name} onChange={(e) => { const u=[...crops]; u[i].name=e.target.value; setCrops(u); }} placeholder="e.g. Mango" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select value={crop.category} onChange={(e) => { const u=[...crops]; u[i].category=e.target.value; setCrops(u); }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={crop.isOrganic} onChange={(e) => { const u=[...crops]; u[i].isOrganic=e.target.checked; setCrops(u); }} className="accent-green-600" />
                    <span>Organically grown (no synthetic pesticides)</span>
                  </label>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Harvest season (select months)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MONTHS.map((m, mi) => (
                        <button key={m} type="button" onClick={() => toggleMonth(i, mi+1)} className={`px-2.5 py-1 rounded-full text-xs border transition ${crop.seasonMonths.includes(mi+1) ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCrop} className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium">
                + Add another crop
              </button>
            </div>
          )}

          {/* ── Step 4: Bank Account ── */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-1">Bank Account for Payouts</h2>
              <p className="text-sm text-gray-500 mb-4">Your earnings will be transferred here within 2 business days of delivery confirmation.</p>
              {[
                {label:'Account Holder Name',key:'accountHolder',placeholder:'Name as on bank account'},
                {label:'Account Number',key:'accountNumber',placeholder:'e.g. 1234567890',type:'password'},
                {label:'IFSC Code',key:'ifscCode',placeholder:'e.g. SBIN0001234'},
                {label:'Bank Name',key:'bankName',placeholder:'e.g. State Bank of India'},
              ].map(({label,key,placeholder,type='text'}) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label} <span className="text-red-500">*</span></label>
                  <input type={type} value={s4[key]} onChange={(e) => setS4({...s4,[key]:e.target.value.toUpperCase()})} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-mono" />
                </div>
              ))}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                Your bank details are encrypted and stored securely. Farm2Home uses RBI-compliant payment rails for farmer payouts.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button onClick={submit} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-300 transition">
              {saving ? 'Saving...' : step === 4 ? 'Complete Registration' : <>Next Step <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}