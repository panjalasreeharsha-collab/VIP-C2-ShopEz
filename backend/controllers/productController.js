import Product from '../models/product.js';
import Category from '../models/category.js';
import Review from '../models/review.js';
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate('parent');
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 20,
      featured,
      trending,
      bestSeller,
      newArrival
    } = req.query;
    const query = { isApproved: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { 
            $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      // If it looks like a valid ObjectId, use it directly; otherwise resolve by name/slug
      const isObjectId = /^[a-f\d]{24}$/i.test(category);
      if (isObjectId) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({
          $or: [
            { slug: category.toLowerCase().replace(/\s+/g, '-') },
            { name: { $regex: new RegExp(`^${category}$`, 'i') } }
          ]
        });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          // No category found — return empty
          return res.status(200).json({ success: true, count: 0, totalPages: 0, currentPage: 1, totalProducts: 0, products: [] });
        }
      }
    }
    if (subcategory) {
      query.subcategory = subcategory;
    }
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }
    if (featured) query.featured = featured === 'true';
    if (trending) query.trending = trending === 'true';
    if (bestSeller) query.bestSeller = bestSeller === 'true';
    if (newArrival) query.newArrival = newArrival === 'true';
    let queryBuilder = Product.find(query).populate('seller', 'storeName').populate('category', 'name slug');
    if (sort) {
      if (sort === 'price_asc') queryBuilder = queryBuilder.sort({ basePrice: 1 });
      else if (sort === 'price_desc') queryBuilder = queryBuilder.sort({ basePrice: -1 });
      else if (sort === 'rating') queryBuilder = queryBuilder.sort({ rating: -1 });
      else if (sort === 'newest') queryBuilder = queryBuilder.sort({ createdAt: -1 });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }
    const skip = (Number(page) - 1) * Number(limit);
    queryBuilder = queryBuilder.skip(skip).limit(Number(limit));
    const products = await queryBuilder;
    const total = await Product.countDocuments(query);
    res.status(200).json({
        success: true,
      count: products.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalProducts: total,
      products
    });
  } catch (error) {
    next(error);
  }
};
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'storeName description rating logo')
      .populate('category')
      .populate('subcategory');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const reviews = await Review.find({ product: product._id }).populate('user', 'name');
    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id }
    }).limit(4);
    res.status(200).json({ success: true, product, reviews, related });
  } catch (error) {
    next(error);
  }
};
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    let review = await Review.findOne({ product: productId, user: req.user._id });
    if (review) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment
    });
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, suggestions: [] });
    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    }).select('name category').limit(5).populate('category', 'name');
    const suggestions = products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category ? p.category.name : ''
    }));
    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};