import QRCode from 'qrcode';
import Order from '../models/order.js';
import Cart from '../models/cart.js';
import Product from '../models/product.js';
import { getIO } from '../sockets/socketManager.js';
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice
    } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }
    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (dbProduct.variants && dbProduct.variants.length > 0) {
        const variant = dbProduct.variants.find(v => v.color === item.color && v.size === item.size);
        if (variant) {
          if (variant.stock < item.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name} (${item.color}/${item.size})` });
          }
          variant.stock -= item.quantity;
        }
      }
      await dbProduct.save();
    }
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      timeline: [
        { status: 'pending', description: 'Order has been placed and is awaiting payment.' }
      ]
    });
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    const io = getIO();
    if (io) {
      io.emit('inventory_update', { message: 'Stock updated after order creation' });
    }
    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
     }
};
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const generateQrPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const upiId = process.env.QR_UPI_ID || 'shopez@upi';
    const merchantName = process.env.QR_MERCHANT_NAME || 'ShopEZ E-Commerce';
    const amount = order.totalPrice;
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=Order_${order._id}`;
    const qrDataUrl = await QRCode.toDataURL(upiUri);
    res.status(200).json({
      success: true,
      qrCode: qrDataUrl, upiUri,
      amount
    });
  } catch (error) {
    next(error);
  }
};
export const confirmQrPayment = async (req, res, next) => {
  try {
    const { orderId, transactionRef } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'paid';
    order.paymentResult = {
      id: transactionRef || `TXN_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      status: 'SUCCESS',
      updateTime: new Date().toISOString()
    };
    order.timeline.push({
      status: 'paid',
      description: 'Payment confirmed successfully via QR code.'
    });
    await order.save();
    const io = getIO();
    if (io) {
      io.emit('order_status_update', { orderId: order._id, status: 'paid', message: 'Order paid successfully!' });
      io.emit('seller_new_order', { orderId: order._id, totalPrice: order.totalPrice });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};