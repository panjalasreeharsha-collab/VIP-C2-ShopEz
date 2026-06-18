import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { MapPin, Plus, CreditCard, QrCode, ShieldCheck, ArrowRight, Loader } from 'lucide-react';
import { clearCart } from '../store/cartSlice.js';
export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { cart } = useSelector(state => state.cart);
  const statePrices = location.state || {};
  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product?.basePrice * item.quantity), 0) || 0;
  const tax = Math.round(subtotal * 0.08);
  const shipping = subtotal > 150 ? 0 : 15;
  const discount = statePrices.discount || 0;
  const total = subtotal + tax + shipping - discount;
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', addressLine: '', city: '', postalCode: '', country: 'US', phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('qr_pay');
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  useEffect(() => {
    axios.get('/api/address')
      .then(res => {
        if (res.data.success) {
          setAddresses(res.data.addresses);
          if (res.data.addresses.length > 0) {
            setSelectedAddress(res.data.addresses[0]);
          }
        }
      });
  }, []);
  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/address', newAddress);
      if (res.data.success) {
        setAddresses(prev => [...prev, res.data.address]);
        setSelectedAddress(res.data.address);
        setShowAddressForm(false);
        setNewAddress({ fullName: '', addressLine: '', city: '', postalCode: '', country: 'US', phone: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }
    setLoading(true);
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.basePrice,
      color: item.color,
      size: item.size,
      image: item.product.images[0]
    }));
    try {
      const orderRes = await axios.post('/api/orders', {
        orderItems,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          addressLine: selectedAddress.addressLine,
          city: selectedAddress.city,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone
        },
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        discountPrice: discount,
        totalPrice: total
        });
      if (orderRes.data.success) {
        const orderId = orderRes.data.order._id;
        setActiveOrderId(orderId);
        const qrRes = await axios.post('/api/orders/qr-pay', { orderId });
        if (qrRes.data.success) {
          setQrCodeData(qrRes.data.qrCode);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order.');
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmQr = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/orders/qr-confirm', {
        orderId: activeOrderId,
        transactionRef: 'QR_UPI_' + Math.random().toString(36).substring(3, 11).toUpperCase()
      });
      if (res.data.success) {
        dispatch(clearCart());
        navigate(`/order/${activeOrderId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
     };
  return (
    <div className="se-shell py-10 space-y-8 min-h-screen relative">
      <div>
        <p className="se-eyebrow">Checkout</p>
        <h1 className="font-display text-3xl sm:text-5xl text-slate-950">Secure Checkout</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <div className="space-y-8">
          <div className="se-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-display text-xl text-slate-950">Shipping Address</h3>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-semibold text-[#0F766E] hover:text-[#14B8A6] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Address
              </button>
            </div>
            {showAddressForm && (
              <form onSubmit={handleCreateAddress} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Full Name"
                    className="se-input px-3 py-2.5 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone Number"
                    className="se-input px-3 py-2.5 text-xs"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine: e.target.value }))}
                  placeholder="Address Line"
                  className="se-input px-3 py-2.5 text-xs"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="se-input px-3 py-2.5 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Postal Code"
                    className="se-input px-3 py-2.5 text-xs"
                  />
                  </div>
                <button type="submit" className="se-button px-6 py-2.5 text-xs">
                  Save Address
                </button>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <button
                  key={addr._id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    selectedAddress?._id === addr._id
                      ? 'border-[#14B8A6] bg-white shadow-md ring-4 ring-[#14B8A6]/10'
                      : 'border-slate-200 bg-white/70 opacity-80 hover:opacity-100'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-brand-500 mb-2" />
                  <h4 className="font-display font-bold text-sm text-slate-950">{addr.fullName}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {addr.addressLine}, {addr.city}, {addr.postalCode}
                  </p>
                  <span className="text-[10px] text-apple-dark/40 block mt-2 font-display">{addr.phone}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="se-card p-6 space-y-6">
            <h3 className="font-display text-xl text-slate-950 border-b border-slate-100 pb-4">Payment Method</h3>
            <div className="max-w-sm">
              <div className="p-5 rounded-2xl border border-[#14B8A6] bg-white shadow-md flex items-center gap-4 ring-4 ring-[#14B8A6]/10">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <QrCode className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <span className="font-display font-bold text-xs block text-apple-dark">QR Code Pay (UPI)</span>
                  <span className="text-[10px] text-apple-dark/50">Pay via Google Pay, PhonePe, Paytm, etc.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="se-card p-6 space-y-6 lg:sticky lg:top-24">
          <h3 className="font-display text-lg text-slate-950">Order Overview</h3>
          <div className="space-y-3 border-b border-slate-100 pb-4 text-xs text-slate-600">
            {cart.items.map(item => (
              <div key={item._id} className="flex justify-between">
                <span>{item.product?.name} (x{item.quantity})</span>
                <span className="font-display font-semibold">₹{item.product?.basePrice * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3.5 text-sm text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-display font-semibold">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discounts</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Sales Tax</span>
              <span className="font-display font-semibold">₹{tax}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-display font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
          </div>
          <div className="flex justify-between font-display text-lg font-black text-slate-950">
            <span>Total Payable</span>
            <span>₹{total}</span>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="se-button w-full py-3.5 text-sm cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Confirm Order'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {qrCodeData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center space-y-6 shadow-2xl border border-slate-200">
            <div className="space-y-2">
              <h3 className="font-display font-black text-lg text-apple-dark">Scan & Pay</h3>
              <p className="text-[11px] text-apple-dark/60 leading-relaxed">Scan the UPI QR code below using Google Pay, PhonePe, Paytm, or your bank application.</p>
            </div>
            <div className="bg-apple-gray p-6 rounded-2xl border border-black/5 inline-block mx-auto">
              <img src={qrCodeData} alt="UPI Payment QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-apple-dark/40 block font-display">AMOUNT PAYABLE</span>
              <span className="font-display font-black text-2xl text-apple-dark">₹{total}</span>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleConfirmQr}
                className="se-button w-full py-2.5 text-xs"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Confirm Payment'}
              </button>
              <button 
                onClick={() => setQrCodeData(null)}
                className="text-xs text-apple-dark/50 hover:text-apple-dark py-2"
              >
                Cancel payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
);
}
