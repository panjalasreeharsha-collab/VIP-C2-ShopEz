import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Cart from '../models/cart.js';
import Wishlist from '../models/wishlist.js';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../utils/email.js';
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopez_super_secret_jwt_key_123456!@#', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      otp: { code: otpCode, expiresAt: otpExpires }
    });
    console.log(`\n--- [ShopEZ OTP Dispatch] ---`);
    console.log(`To: ${email}`);
    console.log(`OTP: ${otpCode} (Valid for 10 minutes)`);
    console.log(`-----------------------------\n`);
    res.status(201).json({
      success: true,
      message: 'Registration initiated. Verification OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }
    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    await Cart.create({ user: user._id, items: [] });
    await Wishlist.create({ user: user._id, products: [] });
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otp = { code: otpCode, expiresAt: otpExpires };
      await user.save();
      console.log(`\n--- [ShopEZ OTP Dispatch (Re-send)] ---`);
      console.log(`To: ${email}`);
      console.log(`OTP: ${otpCode}`);
      console.log(`-------------------------------------\n`);
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Verification OTP sent to your email.'
      });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
export const googleAuth = async (req, res, next) => {
  try {
    const { credential, isMock, email: mockEmail, name: mockName, googleId: mockGoogleId } = req.body;
    let email, name, googleId;

    if (isMock && process.env.NODE_ENV !== 'production') {
      email = mockEmail;
      name = mockName;
      googleId = mockGoogleId;
    } else {
      if (!credential) {
        return res.status(400).json({ success: false, message: 'Google credential token is required' });
      }
      const clientId = process.env.GOOGLE_CLIENT_ID || '123456789-mock.apps.googleusercontent.com';
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Could not retrieve email from Google Account' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true
      });
      await Cart.create({ user: user._id, items: [] });
      await Wishlist.create({ user: user._id, products: [] });
    } else {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ success: false, message: 'Google Authentication failed: ' + error.message });
  }
};
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with that email' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const subject = 'ShopEZ Password Reset Verification Code';
    const text = `Your ShopEZ password reset verification code is: ${resetCode}. It is valid for 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaec; border-radius: 24px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1a1a1a; margin: 0; font-weight: 300; letter-spacing: -0.5px; font-size: 28px;">ShopEZ</h2>
          <p style="color: #c9a86a; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Premium E-Commerce</p>
        </div>
        <div style="background-color: #f7f4ee; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 14px;">Here is your verification code to reset your password:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; margin: 15px 0;">${resetCode}</div>
          <p style="margin: 0; color: #1a1a1a; opacity: 0.4; font-size: 11px; font-style: italic;">This code is valid for 10 minutes.</p>
        </div>
        <p style="color: #1a1a1a; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0;">
          If you did not request a password reset, please ignore this email or contact support if you have security concerns.
        </p>
        <hr style="border: 0; border-top: 1px solid #f0f0f2; margin: 20px 0;" />
        <div style="text-align: center; color: #1a1a1a; opacity: 0.4; font-size: 11px;">
          &copy; ${new Date().getFullYear()} ShopEZ. All rights reserved.
        </div>
      </div>
    `;

    const emailResult = await sendEmail({ to: email, subject, text, html });
    let message = 'Password reset verification code sent to your email.';
    if (emailResult.previewUrl) {
      message += ` (Development Mode: Ethereal test inbox active)`;
    }

    res.status(200).json({
      success: true,
      message,
      previewUrl: emailResult.previewUrl
    });
  } catch (error) {
    next(error);
  }
};
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email, code, and new password' });
    }
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    next(error);
  }
};
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};