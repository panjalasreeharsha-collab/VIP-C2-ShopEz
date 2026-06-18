import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Download } from 'lucide-react';
export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`/api/orders/${id}`)
      .then(res => {
        if (res.data.success) {
          setOrder(res.data.order);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);
  const handleDownloadInvoice = () => {
    if (!order) return;
    const invoiceContent = `
=========================================
            SHOPEZ INVOICE
=========================================
Order ID: ${order._id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Customer Name: ${order.shippingAddress.fullName}
Phone: ${order.shippingAddress.phone}
Address: ${order.shippingAddress.addressLine}, ${order.shippingAddress.city}

Items:
-----------------------------------------
${order.orderItems.map(item => `${item.name} (${item.color}/${item.size}) x${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}

Summary:
-----------------------------------------
Items Subtotal: ₹${order.itemsPrice}
Tax (8%): ₹${order.taxPrice}
Shipping: ₹${order.shippingPrice}
Discounts Applied: -₹${order.discountPrice}
-----------------------------------------
TOTAL PAID: ₹${order.totalPrice}

Thank you for choosing ShopEZ!
=========================================
    `;
    const element = document.createElement("a");
    const file = new Blob([invoiceContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `shopez_invoice_${order._id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  if (loading) return <div className="text-center py-32 font-display">Loading order tracking...</div>;
  if (!order) return <div className="text-center py-32 font-display">Order not found.</div>;
  const steps = [
    { label: 'Ordered', status: 'pending', desc: 'Order details confirmed' },
    { label: 'Paid', status: 'paid', desc: 'Transaction successfully processed' },
    { label: 'Processing', status: 'processing', desc: 'Seller preparing package' },
    { label: 'Shipped', status: 'shipped', desc: 'In transit to distribution hub' },
    { label: 'Delivered', status: 'delivered', desc: 'Arrived at shipping destination' }
  ];
  const getStepIndex = (status) => {
    const map = { pending: 0, paid: 1, processing: 2, shipped: 3, delivered: 4, cancelled: -1 };
    return map[status] || 0;
     };
  const currentStepIdx = getStepIndex(order.status);
  return (
    <div className="se-shell max-w-5xl py-10 space-y-10 min-h-screen">
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-brand-500 fill-brand-500/10 mx-auto" />
        <h1 className="font-display text-3xl sm:text-5xl text-slate-950">Order Confirmed</h1>
        <p className="text-sm text-slate-500">Order ref: #{order._id}</p>
      </div>
      <div className="se-card p-6 sm:p-8 space-y-8">
        <h3 className="font-display text-xl text-slate-950">Delivery Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isActive = currentStepIdx === idx;
            return (
              <div key={idx} className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 text-left relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs border-2 ${
                  isCompleted 
                    ? 'bg-slate-950 border-slate-950 text-white' 
                    : 'bg-white border-slate-200 text-slate-400'
                } ${isActive ? 'ring-4 ring-brand-500/20' : ''}`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isCompleted ? 'text-apple-dark' : 'text-apple-dark/40'}`}>{step.label}</h4>
                  <p className="text-[10px] text-apple-dark/50 mt-0.5 md:max-w-[120px]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 se-card p-6 space-y-6">
          <h3 className="font-display text-xl text-slate-950">Items Ordered</h3>
          <div className="space-y-4">
            {order.orderItems.map(item => (
              <div key={item._id} className="flex items-center justify-between border-b border-black/5 last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-black/5" />
                  <div>
                    <h4 className="font-display font-bold text-xs text-apple-dark line-clamp-1">{item.name}</h4>
                    <span className="text-[10px] text-apple-dark/40">{item.color} / {item.size} x{item.quantity}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-apple-dark font-display">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="se-card p-6 space-y-6">
          <h3 className="font-display text-xl text-slate-950">Summary</h3>
          <div className="space-y-3.5 text-xs text-apple-dark/60 border-b border-black/5 pb-4">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span>₹{order.itemsPrice}</span>
            </div>
            {order.discountPrice > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discounts</span>
                <span>-₹{order.discountPrice}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Sales Tax</span>
              <span>₹{order.taxPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
            </div>
          </div>
          <div className="flex justify-between font-display text-sm font-black text-apple-dark">
            <span>Amount Paid</span>
            <span>₹{order.totalPrice}</span>
          </div>
          <button 
            onClick={handleDownloadInvoice}
            className="se-button-secondary w-full py-2.5 text-xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
