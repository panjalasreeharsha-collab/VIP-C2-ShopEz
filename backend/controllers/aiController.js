import Product from '../models/product.js';
import Wishlist from '../models/wishlist.js';
import Cart from '../models/cart.js';
import Order from '../models/order.js';
export const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const wishlist = await Wishlist.findOne({ user: userId });
    const cart = await Cart.findOne({ user: userId });
    const orders = await Order.find({ user: userId });
    let preferredCategoryIds = [];
    if (wishlist && wishlist.products.length > 0) {
      const wishlistedProducts = await Product.find({ _id: { $in: wishlist.products } });
      wishlistedProducts.forEach(p => preferredCategoryIds.push(p.category.toString()));
    }
    if (cart && cart.items.length > 0) {
      const cartProductIds = cart.items.map(item => item.product);
      const cartProducts = await Product.find({ _id: { $in: cartProductIds } });
      cartProducts.forEach(p => preferredCategoryIds.push(p.category.toString()));
    }
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        order.orderItems.forEach(item => {
          preferredCategoryIds.push(item.product.toString());
        });
      });
    }
    preferredCategoryIds = [...new Set(preferredCategoryIds)];
    let query = { isApproved: true };
    if (preferredCategoryIds.length > 0) {
      query.category = { $in: preferredCategoryIds };
    }
    let products = await Product.find(query).limit(8).populate('seller', 'storeName');
    if (products.length < 4) {
      products = await Product.find({ isApproved: true, trending: true }).limit(8).populate('seller', 'storeName');
    }
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};
export const handleAiChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const lowerMessage = message.toLowerCase();
    let reply = "";
    let recommendedProducts = [];
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('show')) {
      recommendedProducts = await Product.find({ isApproved: true }).limit(3).populate('category');
      reply = "Here are some of our top-curated recommendations matching your request:";
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('under') || lowerMessage.includes('cheap')) {
      const match = lowerMessage.match(/\d+/);
      const budgetLimit = match ? Number(match[0]) : 100;
      recommendedProducts = await Product.find({ isApproved: true, basePrice: { $lte: budgetLimit } }).limit(3);
      reply = `Based on your budget, here are a few premium choices under $${budgetLimit}:`;
    } else if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('best seller')) {
      recommendedProducts = await Product.find({ isApproved: true, trending: true }).limit(3);
      reply = "Check out what is trending in ShopEZ right now:";
    } else if (lowerMessage.includes('new') || lowerMessage.includes('arrival') || lowerMessage.includes('latest')) {
      recommendedProducts = await Product.find({ isApproved: true }).sort({ createdAt: -1 }).limit(3);
      reply = "Here are our absolute latest additions to the catalog:";
    } else if (lowerMessage.includes('compare')) {
      recommendedProducts = await Product.find({ isApproved: true }).limit(2);
      if (recommendedProducts.length >= 2) {
        reply = `Let's compare the **${recommendedProducts[0].name}** and the **${recommendedProducts[1].name}**:\n\n` +
          `* **Price**: $${recommendedProducts[0].basePrice} vs $${recommendedProducts[1].basePrice}\n` +
          `* **Rating**: ⭐ ${recommendedProducts[0].rating} vs ⭐ ${recommendedProducts[1].rating}\n` +
          `* **Specs**: ${recommendedProducts[0].specifications.map(s => `${s.name}: ${s.value}`).join(', ') || 'Standard'} vs ${recommendedProducts[1].specifications.map(s => `${s.name}: ${s.value}`).join(', ') || 'Standard'}\n\n` +
          `Which one fits your requirements?`;
        recommendedProducts = [];
      } else {
        reply = "I don't have enough products in the catalog to perform a comparison yet!";
      }
    } else {
      reply = "Hi there! I am your ShopEZ AI Shopping Assistant. I can help you discover products, compare features, find budget-friendly items, and navigate categories. Try asking me:\n\n" +
        "* *'Can you recommend some trending items?'*\n" +
        "* *'Show me products under $50'*\n" +
        "* *'Compare some products'*";
    }
    res.status(200).json({
      success: true,
      reply,
      products: recommendedProducts
    });
  } catch (error) {
    next(error);
  }
};