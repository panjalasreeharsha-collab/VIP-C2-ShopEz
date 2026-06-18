import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Seller from '../models/seller.js';
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopez_super_secret_jwt_key_123456!@#');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
export const sellerProtect = async (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ success: false, message: 'Seller resource. Access denied' });
  }
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) {
    return res.status(404).json({ success: false, message: 'Seller profile not found' });
  }
  req.seller = seller;
  next();
};