import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Trash2, ShieldCheck, Ticket, ArrowRight, Heart } from 'lucide-react';
import { setCart } from '../store/cartSlice.js';
export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [savedForLater, setSavedForLater] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product?.basePrice * item.quantity), 0) || 0;
  const tax = Math.round(subtotal * 0.08);
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + tax + shipping - discount;
  const handleUpdateQuantity = async (itemId, currentQty, increment) => {
    const newQty = increment ? currentQty + 1 : Math.max(1, currentQty - 1);
    if (newQty === currentQty) return;
    try {
      const res = await axios.put('/api/cart', { itemId, quantity: newQty });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleRemoveItem = async (itemId) => {
    try {
      const res = await axios.delete(`/api/cart/${itemId}`);
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleSaveForLater = (item) => {
    setSavedForLater(prev => [...prev, item]);
    handleRemoveItem(item._id);
  };
  const handleMoveToCart = async (item) => {
    try {
      const res = await axios.post('/api/cart', {
        productId: item.product._id,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        setSavedForLater(prev => prev.filter(i => i._id !== item._id));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const res = await axios.post('/api/coupons/apply', { code: couponCode, cartTotal: subtotal });
      if (res.data.success) {
        setDiscount(res.data.discount);
        setAppliedCoupon(res.data.code);
        setCouponCode('');
        alert(`Coupon applied! You saved ₹${res.data.discount}`);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    }
  };
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-32 px-6 space-y-6">
        <h2 className="font-display text-3xl text-slate-950">Sign in to view your cart</h2>
        <p className="text-sm text-slate-500">Your saved cart, offers, and checkout details will appear here.</p>
        <Link to="/auth" className="se-button w-full py-3 text-sm">
          Sign In
        </Link>
      </div>
    );
  }
  return (
    <div className="se-shell py-10 space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="se-eyebrow">Cart</p>
          <h1 className="font-display text-3xl sm:text-5xl text-slate-950">Shopping Bag</h1>
        </div>
        <Link to="/catalog" className="se-button-secondary px-4 py-2.5 text-sm">Continue Shopping</Link>
      </div>
      {cart?.items?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {cart.items.map(item => (
                <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 se-card se-card-hover">
                  <div className="flex items-center gap-4">
                    <img src={item.product?.images[0]} alt={item.product?.name} className="w-20 h-20 object-cover rounded-2xl bg-slate-100" />
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-slate-950 line-clamp-1">{item.product?.name}</h3>
                      <span className="text-xs text-slate-500 block">Variant: {item.color} / {item.size}</span>
                      <span className="text-sm font-bold text-slate-950 block mt-1">₹{item.product?.basePrice?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button onClick={() => handleUpdateQuantity(item._id, item.quantity, false)} className="px-3 py-1.5 text-xs font-bold text-apple-dark/60">-</button>
                      <span className="px-3 text-xs font-bold font-display">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item._id, item.quantity, true)} className="px-3 py-1.5 text-xs font-bold text-apple-dark/60">+</button>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => handleSaveForLater(item)} className="p-2 text-apple-dark/40 hover:text-brand-500 transition-colors" title="Save for Later">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRemoveItem(item._id)} className="p-2 text-apple-dark/40 hover:text-red-500 transition-colors" title="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {savedForLater.length > 0 && (
              <div className="border-t border-black/5 pt-12 space-y-6">
                <h3 className="font-display font-extrabold text-lg text-apple-dark">Saved For Later</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {savedForLater.map(item => (
                    <div key={item._id} className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm space-y-4">
                      <div className="flex gap-3">
                        <img src={item.product?.images[0]} alt={item.product?.name} className="w-12 h-12 object-cover rounded-lg" />
                        <div>
                          <h4 className="font-display font-bold text-xs text-apple-dark line-clamp-1">{item.product?.name}</h4>
                          <span className="text-[10px] text-apple-dark/50 block">{item.color} / {item.size}</span>
                        </div>
                      </div>
                      <button onClick={() => handleMoveToCart(item)} className="w-full py-2 rounded-xl bg-apple-dark hover:bg-brand-500 text-white text-xs font-semibold transition-colors">
                        Move to Bag
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="se-card p-6 space-y-6">
              <h3 className="font-display text-lg text-slate-950">Order Summary</h3>
              <div className="space-y-3.5 text-sm text-slate-600 border-b border-slate-100 pb-4">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-display font-semibold">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount ({appliedCoupon})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax (8%)</span>
                  <span className="font-display font-semibold">₹{tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="font-display font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
              </div>
              <div className="flex justify-between font-display text-base font-black text-apple-dark">
                <span>Estimated Total</span>
                <span>₹{total}</span>
              </div>
              <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Ticket className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Apply SHOPEZ10 or WELCOME50"
                      className="se-input pl-9 pr-3 py-2.5 text-xs"
                    />
                  </div>
                  <button type="submit" className="se-button px-4 py-2.5 text-xs">
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500">{couponError}</p>}
                {appliedCoupon && <p className="text-[10px] text-emerald-600 font-semibold">Promo code {appliedCoupon} applied successfully!</p>}
              </form>
              <button 
                onClick={() => navigate('/checkout', { state: { discount, appliedCoupon, total } })}
                className="se-button w-full py-3.5 text-sm cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-apple-dark/40">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Checkout security encrypted</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 se-card space-y-4 max-w-2xl mx-auto">
          <Trash2 className="w-12 h-12 text-apple-dark/20 mx-auto" />
          <h3 className="font-display font-bold text-lg text-apple-dark">Your Bag is empty</h3>
          <p className="text-xs text-apple-dark/50">Curate devices or premium technical coats on our discover catalog.</p>
          <Link to="/catalog" className="se-button px-6 py-3 text-sm">
            Discover catalog
          </Link>
        </div>
      )}
    </div>
  );
}
