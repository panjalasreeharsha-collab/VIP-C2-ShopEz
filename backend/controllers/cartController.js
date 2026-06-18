import Cart from '../models/cart.js';
import Product from '../models/product.js';
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, color, size } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      item.color === color && 
      item.size === size
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity || 1);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity || 1), color, size });
    }
    await cart.save();
    cart = await cart.populate('items.product');
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    item.quantity = Number(quantity);
    await cart.save();
    cart = await cart.populate('items.product');
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};
export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    cart = await cart.populate('items.product');
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
    }
};