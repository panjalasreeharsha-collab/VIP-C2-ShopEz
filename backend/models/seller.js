import mongoose from 'mongoose';
const sellerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    logo: { type: String },
    banner: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationDocument: { type: String },
    rating: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  { timestamps: true }
);
const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;