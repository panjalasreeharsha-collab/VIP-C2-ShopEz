import User from '../models/user.js';
import Seller from '../models/seller.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import Coupon from '../models/coupon.js';
import Category from '../models/category.js';
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};
export const getSellers = async (req, res, next) => {
  try {
    const sellers = await Seller.find().populate('user', 'name email');
    res.status(200).json({ success: true, sellers });
  } catch (error) {
    next(error);
  }
};
export const verifySeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }
    seller.isVerified = !seller.isVerified;
    await seller.save();
    res.status(200).json({ success: true, seller });
  } catch (error) {
    next(error);
  }
};
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, expiryDate } = req.body;
    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      expiryDate: new Date(expiryDate)
    });
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
  };
export const applyCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true, expiryDate: { $gt: new Date() } });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
    }
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ success: false, message: `Minimum order value of $${coupon.minOrderValue} required` });
    }
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = cartTotal * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }
    res.status(200).json({ success: true, discount, code: coupon.code });
  } catch (error) {
    next(error);
  }
};
export const getSystemAnalytics = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments();
    const sellersCount = await Seller.countDocuments();
    const productsCount = await Product.countDocuments();
    const orders = await Order.find({ isPaid: true });
    const revenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    res.status(200).json({
      success: true,
      analytics: {
        usersCount,
        sellersCount,
        productsCount,
        ordersCount: orders.length,
        revenue
      }
    });
  } catch (error) {
    next(error);
  }
};