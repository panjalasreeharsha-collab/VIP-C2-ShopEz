import Seller from '../models/seller.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import Category from '../models/category.js';
import { uploadImage } from '../config/cloudinary.js';
export const registerSeller = async (req, res, next) => {
  try {
    const { storeName, description } = req.body;
    let seller = await Seller.findOne({ storeName });
    if (seller) {
      return res.status(400).json({ success: false, message: 'Store name already taken' });
    }
    seller = await Seller.create({
      user: req.user._id,
      storeName,
      description,
      isVerified: true
    });
    req.user.role = 'seller';
    await req.user.save();
    res.status(201).json({ success: true, seller });
  } catch (error) {
    next(error);
  }
};
export const sellerCreateProduct = async (req, res, next) => {
  try {
    const { name, description, basePrice, category, subcategory, variants, specifications } = req.body;
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadImage(file.buffer, 'shopez_products');
        images.push(result.url);
      }
    } else {
      images.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800');
    }
    const product = await Product.create({
      seller: seller._id,
      name,
      description,
      basePrice: Number(basePrice),
      category,
      subcategory: subcategory || null,
      variants: variants ? JSON.parse(variants) : [],
      specifications: specifications ? JSON.parse(specifications) : [],
      images,
      isApproved: true
    });
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};
export const getSellerAnalytics = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    const products = await Product.find({ seller: seller._id });
    const productIds = products.map(p => p._id);
    const orders = await Order.find({
      'orderItems.product': { $in: productIds },
      isPaid: true
    });
    let totalRevenue = 0;
    let totalSalesCount = 0;
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (productIds.map(id => id.toString()).includes(item.product.toString())) {
          totalRevenue += item.price * item.quantity;
          totalSalesCount += item.quantity;
        }
      });
    });
    const monthlyData = [
      { name: 'Jan', sales: totalRevenue * 0.1, orders: Math.round(totalSalesCount * 0.1) },
      { name: 'Feb', sales: totalRevenue * 0.15, orders: Math.round(totalSalesCount * 0.12) },
      { name: 'Mar', sales: totalRevenue * 0.2, orders: Math.round(totalSalesCount * 0.18) },
      { name: 'Apr', sales: totalRevenue * 0.12, orders: Math.round(totalSalesCount * 0.14) },
      { name: 'May', sales: totalRevenue * 0.18, orders: Math.round(totalSalesCount * 0.16) },
      { name: 'Jun', sales: totalRevenue || 5001, orders: totalSalesCount || 20 }
    ];
    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalSalesCount,
        productsCount: products.length,
        monthlyData
      }
    });
  } catch (error) {
    next(error);
  }
};