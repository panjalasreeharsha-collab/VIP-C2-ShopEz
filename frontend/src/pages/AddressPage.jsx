import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Plus, Trash2, Home, Building2, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AddressPage() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', country: 'India', type: 'home'
  });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/address');
      if (res.data.success) setAddresses(res.data.addresses);
    } catch { showToast('Failed to load addresses', 'error'); }
    finally { setLoading(false); }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    if (!form.fullName || !form.addressLine1 || !form.city || !form.state || !form.postalCode || !form.phone) {
      showToast('Please fill in all required fields', 'error'); return;
    }
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        addressLine: form.addressLine1 + (form.addressLine2 ? `, ${form.addressLine2}` : ''),
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        type: form.type
      };
      const res = await axios.post('/api/address', payload);
      if (res.data.success) {
        setAddresses(prev => [...prev, res.data.address]);
        setShowForm(false);
        setForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', type: 'home' });
        showToast('Address saved successfully!');
      }
    } catch { showToast('Failed to save address. Please try again.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await axios.delete(`/api/address/${id}`);
      setAddresses(prev => prev.filter(a => a._id !== id));
      showToast('Address removed.');
    } catch { showToast('Could not remove address.', 'error'); }
  };

  const typeIcon = (type) => {
    if (type === 'work') return <Briefcase className="w-4 h-4" />;
    if (type === 'other') return <Building2 className="w-4 h-4" />;
    return <Home className="w-4 h-4" />;
  };

  const indiaStates = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
    'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
    'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
    'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
    'Chandigarh','Puducherry'
  ];

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
          ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {toast.type === 'error'
            ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
            : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <div className="se-shell max-w-4xl py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 flex items-center justify-center shadow">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="se-eyebrow">Account</p>
              <h1 className="font-display text-3xl text-slate-950">Delivery Addresses</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage where your orders are delivered</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="se-button px-4 py-2.5 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>

        {/* Add address form */}
        {showForm && (
          <div className="se-card mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0F766E]" />
              <h2 className="text-sm font-bold text-slate-800">New Delivery Address</h2>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Type selector */}
              <div className="flex gap-2">
                {['home', 'work', 'other'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: t }))}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                      ${form.type === t ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-600 border-slate-200 hover:border-[#14B8A6]'}`}
                  >
                    {typeIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Full Name *</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" required
                    className="se-input px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" required maxLength={10}
                    className="se-input px-3 py-2.5 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Address Line 1 *</label>
                <input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="Flat, House no., Building, Street" required
                  className="se-input px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Address Line 2</label>
                <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Area, Colony, Sector (optional)"
                  className="se-input px-3 py-2.5 text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" required
                    className="se-input px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">State *</label>
                  <select name="state" value={form.state} onChange={handleChange} required
                    className="se-input px-3 py-2.5 text-sm bg-white">
                    <option value="">Select state</option>
                    {indiaStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">PIN Code *</label>
                  <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="6-digit PIN" required maxLength={6}
                    className="se-input px-3 py-2.5 text-sm" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="se-button flex-1 py-2.5 text-sm disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'Saving…' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-200 p-5">
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="se-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-[#14B8A6]" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">No addresses yet</h3>
            <p className="text-sm text-slate-500 mb-5">Add your first delivery address to get started.</p>
            <button onClick={() => setShowForm(true)}
              className="se-button px-5 py-2.5 text-sm cursor-pointer">
              <Plus className="w-4 h-4" /> Add First Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr, idx) => (
              <div key={addr._id} className="se-card se-card-hover p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                      ${idx === 0 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {typeIcon(addr.type || 'home')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                          ${addr.type === 'work' ? 'bg-purple-50 text-purple-600' :
                            addr.type === 'other' ? 'bg-slate-100 text-slate-500' :
                            'bg-blue-50 text-blue-600'}`}>
                          {addr.type || 'Home'}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {addr.addressLine}
                      </p>
                      <p className="text-sm text-slate-600">
                        {addr.city}, {addr.state} – {addr.postalCode}
                      </p>
                        <p className="text-xs text-slate-400 mt-1">{addr.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
