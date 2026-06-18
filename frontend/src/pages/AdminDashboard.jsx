import React, { useState, useEffect } from 'react';
import axios_import from 'axios';
import { Users, ShieldCheck, Ticket, Percent, Plus, Loader } from 'lucide-react';
export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', expiryDate: ''
  });
  const [couponLoading, setCouponLoading] = useState(false);
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [anaRes, usersRes, sellersRes] = await Promise.all([
          axios_import.get('/api/admin/analytics'),
          axios_import.get('/api/admin/users'),
          axios_import.get('/api/admin/sellers')
        ]);
        if (anaRes.data.success) setAnalytics(anaRes.data.analytics);
        if (usersRes.data.success) setUsers(usersRes.data.users);
        if (sellersRes.data.success) setSellers(sellersRes.data.sellers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);
  const handleToggleVerify = async (sellerId) => {
    try {
      const res = await axios_import.put(`/api/admin/seller/${sellerId}/verify`);
      if (res.data.success) {
        setSellers(prev => prev.map(sel => 
          sel._id === sellerId ? { ...sel, isVerified: res.data.seller.isVerified } : sel
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponLoading(true);
    try {
      const res = await axios_import.post('/api/admin/coupon', couponForm);
      if (res.data.success) {
        alert('Promo Coupon created successfully!');
        setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', expiryDate: '' });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create coupon.');
    } finally {
      setCouponLoading(false);
    }
  };
  if (loading) return <div className="text-center py-32 font-display">Loading admin console...</div>;
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 min-h-screen">
      <div>
        <h1 className="font-display font-black text-3xl text-apple-dark">Admin Console</h1>
        <p className="text-xs text-apple-dark/50">Oversee users, verify seller credentials, and issue promo codes.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm space-y-2">
          <span className="text-[10px] text-apple-dark/40 uppercase block font-semibold">Total Revenue</span>
          <span className="font-display font-black text-xl text-apple-dark">₹{analytics?.revenue || 0}</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm space-y-2">
          <span className="text-[10px] text-apple-dark/40 uppercase block font-semibold">Orders Completed</span>
          <span className="font-display font-black text-xl text-apple-dark">{analytics?.ordersCount || 0}</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm space-y-2">
          <span className="text-[10px] text-apple-dark/40 uppercase block font-semibold">Active Users</span>
          <span className="font-display font-black text-xl text-apple-dark">{analytics?.usersCount || 0}</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm space-y-2">
          <span className="text-[10px] text-apple-dark/40 uppercase block font-semibold">Sellers Registered</span>
          <span className="font-display font-black text-xl text-apple-dark">{analytics?.sellersCount || 0}</span>
        </div>
      </div>
      <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-apple-dark">Verify Sellers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-apple-dark border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-apple-dark/40">
                <th className="py-3 pr-4">Store Name</th>
                <th className="py-3 pr-4">Owner Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(sel => (
                <tr key={sel._id} className="border-b border-black/5 last:border-b-0">
                  <td className="py-4 pr-4 font-bold">{sel.storeName}</td>
                  <td className="py-4 pr-4">{sel.user?.name}</td>
                  <td className="py-4 pr-4 font-display text-apple-dark/60">{sel.user?.email}</td>
                  <td className="py-4 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      sel.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {sel.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4">
                    <button 
                      onClick={() => handleToggleVerify(sel._id)}
                      className="px-3.5 py-1.5 rounded-xl border border-black/10 hover:border-brand-500 hover:text-brand-500 transition-colors font-semibold"
                    >
                      {sel.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6 h-fit">
          <div className="flex items-center gap-2 pb-4 border-b border-black/5">
            <Plus className="w-5 h-5 text-brand-500" />
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-apple-dark">Issue Promo Coupon</h3>
          </div>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-apple-dark/50 block">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. FLASH30"
                  className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-apple-dark/50 block">Discount Value</label>
                <input
                  type="number"
                  required
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, discountValue: e.target.value }))}
                  placeholder="30"
                  className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-apple-dark/50 block">Discount Type</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, discountType: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Cash (₹)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-apple-dark/50 block">Min Order Value (₹)</label>
                <input
                  type="number"
                  value={couponForm.minOrderValue}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, minOrderValue: e.target.value }))}
                  placeholder="100"
                  className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-apple-dark/50 block">Expiry Date</label>
              <input
                type="date"
                required
                value={couponForm.expiryDate}
                onChange={(e) => setCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={couponLoading}
              className="w-full py-2.5 rounded-full bg-apple-dark hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {couponLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Issue Coupon'}
            </button>
          </form>
        </div>
        <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm max-h-[420px] overflow-y-auto no-scrollbar">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-apple-dark border-b border-black/5 pb-4">Audit Users</h3>
          <div className="space-y-4">
            {users.map(usr => (
              <div key={usr._id} className="flex items-center justify-between py-2 border-b border-black/5 last:border-b-0 pb-3 last:pb-0">
                <div>
                  <h4 className="font-display font-bold text-xs text-apple-dark">{usr.name}</h4>
                  <span className="text-[10px] text-apple-dark/40 font-display block">{usr.email}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                  usr.role === 'admin' ? 'bg-red-100 text-red-700' : usr.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {usr.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}