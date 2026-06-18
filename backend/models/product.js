import mongoose from 'mongoose';
const variantSchema = new mongoose.Schema({
  color: { type: String, trim: true },
  size: { type: String, trim: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }]
});
const specSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
});
const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    variants: [variantSchema],
    specifications: [specSchema],
    images: [{ type: String, required: true }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true }
  },
  { timestamps: true }
);
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
const Product = mongoose.model('Product', productSchema);
export default Product;