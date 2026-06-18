import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: function() { return !this.googleId; } },
    googleId: { type: String, sparse: true },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
    isVerified: { type: Boolean, default: false },
    otp: { code: String, expiresAt: Date },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};
const User = mongoose.model('User', userSchema);
export default User;