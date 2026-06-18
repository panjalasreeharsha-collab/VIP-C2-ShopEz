import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { Package, IndianRupee, ShoppingBag, Plus, Loader } from 'lucide-react';
export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '', description: '', basePrice: '', category: '', subcategory: '',
    specifications: '[{"name":"Warranty","value":"1 Year"}]',
    variants: '[{"color":"Default","size":"Standard","price":100,"stock":10}]'
  });
  const [formLoading, setFormLoading] = useState(false);
  useEffect(() => {
    axios.get('/api/sellers/analytics')
      .then(res => {
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    axios.get('/api/products/categories')
      .then(res => {
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      });
  }, []);
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await axios.post('/api/sellers/product', productForm);
      if (res.data.success) {
        alert('Product added successfully!');
        setProductForm({
          name: '', description: '', basePrice: '', category: '', subcategory: '',
          specifications: '[{"name":"Warranty","value":"1 Year"}]',
          variants: '[{"color":"Default","size":"Standard","price":100,"stock":10}]'
        });
        const anaRes = await axios.get('/api/sellers/analytics');
        setAnalytics(anaRes.data.analytics);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add product.');
    } finally {
      setFormLoading(false);
    }
  };
  if (loading) return <div className="text-center py-32 font-display">Loading seller analytics...</div>;
  const data = analytics?.monthlyData || [];
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-6">
        <div>
          <h1 className="font-display font-black text-3xl text-apple-dark">Seller Studio</h1>
          <p className="text-xs text-apple-dark/50">Manage store listings and analyze revenue metrics.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-200/50 text-brand-500 rounded-2xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-apple-dark/40 uppercase block font-semibold">Total Revenue</span>
            <span className="font-display font-black text-xl text-apple-dark">₹{analytics?.totalRevenue || 0}</span>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-200/50 text-brand-500 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-apple-dark/40 uppercase block font-semibold">Orders Completed</span>
            <span className="font-display font-black text-xl text-apple-dark">{analytics?.totalSalesCount || 0}</span>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-200/50 text-brand-500 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-apple-dark/40 uppercase block font-semibold">Live Listings</span>
            <span className="font-display font-black text-xl text-apple-dark">{analytics?.productsCount || 0}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-apple-dark">Revenue Over Time</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-apple-dark">Orders Completed</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Bar dataKey="orders" fill="#1d1d1f" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm max-w-4xl space-y-8">
        <div className="flex items-center gap-2 pb-4 border-b border-black/5">
          <Plus className="w-5 h-5 text-brand-500" />
          <h3 className="font-display font-black text-lg text-apple-dark">Onboard New Product</h3>
        </div>
        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-apple-dark/50 block">Product Name</label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. AeroBook Air 13"
                className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-apple-dark/50 block">Base Price (₹)</label>
              <input
                type="number"
                required
                value={productForm.basePrice}
                onChange={(e) => setProductForm(prev => ({ ...prev, basePrice: e.target.value }))}
                placeholder="999"
                className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-apple-dark/50 block">Department Category</label>
              <select
required
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-apple-dark/50 block">Specs JSON</label>
              <textarea
                value={productForm.specifications}
                onChange={(e) => setProductForm(prev => ({ ...prev, specifications: e.target.value }))}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-[10px] font-mono focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-apple-dark/50 block">Variants JSON</label>
              <textarea
                value={productForm.variants}
                onChange={(e) => setProductForm(prev => ({ ...prev, variants: e.target.value }))}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-[10px] font-mono focus:outline-none"
              />
            </div>
            <div className="space-y-1">
                 <label className="text-[10px] font-bold text-apple-dark/50 block">Description</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
                placeholder="Product description detailing specifications..."
                className="w-full px-3.5 py-2.5 bg-brand-50 border border-black/10 rounded-xl text-xs focus:outline-none resize-none"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={formLoading}
              className="px-8 py-3 rounded-full bg-apple-dark hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {formLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Publish to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}