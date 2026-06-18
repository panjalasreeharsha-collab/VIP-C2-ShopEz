import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Sparkles, Mail, Lock, User, Key, ShieldAlert } from 'lucide-react';
import { authStart, authSuccess, authFailure } from '../store/authSlice.js';

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mode, setMode] = useState('login');
  const [forgotStep, setForgotStep] = useState('email'); // 'email' or 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const googleInitializedRef = useRef(false);

  // Clear messages when mode changes
  useEffect(() => {
    setErrorMsg('');
    setInfoMsg('');
    setForgotStep('email');
    setPassword('');
    setOtp('');
  }, [mode]);

  const handleGoogleCredentialResponse = async (response) => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      dispatch(authStart());
      const res = await axios.post('/api/auth/google', { credential: response.credential });
      if (res.data.success) {
        dispatch(authSuccess({ token: res.data.token, user: res.data.user }));
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google Authentication failed';
      setErrorMsg(msg);
      dispatch(authFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only initialize Google button if the GSI script is loaded and we're on login or register screen
    if (typeof window.google !== 'undefined' && (mode === 'login' || mode === 'register')) {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-mock.apps.googleusercontent.com';
        if (!googleInitializedRef.current) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
          });
          googleInitializedRef.current = true;
        }
        
        const renderBtn = () => {
          const btnEl = document.getElementById('google-signin-button');
          if (btnEl) {
            window.google.accounts.id.renderButton(
              btnEl,
              { theme: 'outline', size: 'large', width: '380' }
            );
          }
        };
        renderBtn();
        setTimeout(renderBtn, 50);
      } catch (e) {
        console.error('Error rendering Google button:', e);
      }
    }
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      if (mode === 'login') {
        dispatch(authStart());
        const res = await axios.post('/api/auth/login', { email, password });
        if (res.data.success) {
          dispatch(authSuccess({ token: res.data.token, user: res.data.user }));
          navigate('/');
        }
      } else if (mode === 'register') {
        const res = await axios.post('/api/auth/register', { name, email, password, role });
        if (res.data.success) {
          setInfoMsg(res.data.message);
          setMode('otp');
        }
      } else if (mode === 'otp') {
        dispatch(authStart());
        const res = await axios.post('/api/auth/verify-otp', { email, otp });
        if (res.data.success) {
          dispatch(authSuccess({ token: res.data.token, user: res.data.user }));
          navigate('/');
        }
      } else if (mode === 'forgot') {
        if (forgotStep === 'email') {
          const res = await axios.post('/api/auth/forgot-password', { email });
          if (res.data.success) {
            setInfoMsg(res.data.message);
            if (res.data.previewUrl) {
              console.log(`🔗 [Dev SMTP Mailbox]: ${res.data.previewUrl}`);
            }
            setForgotStep('reset');
            setOtp('');
            setPassword('');
          }
        } else if (forgotStep === 'reset') {
          const res = await axios.post('/api/auth/reset-password', { email, code: otp, password });
          if (res.data.success) {
            setInfoMsg(res.data.message);
            setMode('login');
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setErrorMsg(msg);
      dispatch(authFailure(msg));
      if (err.response?.status === 403 && mode === 'login') {
        setMode('otp');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl se-card p-8 sm:p-10 space-y-7 relative overflow-hidden">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-emerald-50 rounded-2xl text-[#14B8A6] mb-1 shadow-inner">
            <Sparkles className="w-5 h-5 fill-[#14B8A6]/10" />
          </div>
          
          <h2 className="font-display text-3xl sm:text-[38px] tracking-tight text-slate-950">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'otp' && 'OTP Verification'}
            {mode === 'forgot' && (forgotStep === 'email' ? 'Forgot Password' : 'Verify & Reset')}
          </h2>
          
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            {mode === 'login' && 'Sign in to access your customized dashboard, orders, and addresses.'}
            {mode === 'register' && 'Onboard as a custom buyer, merchant seller, or system administrator.'}
            {mode === 'otp' && 'We sent a 6-digit confirmation code to your email.'}
            {mode === 'forgot' && (forgotStep === 'email' ? 'Enter your registered email to receive a 6-digit verification code.' : `Enter the 6-digit code sent to ${email} and your new password.`)}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50/40 border border-red-100 text-xs text-red-600 flex items-start gap-3">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
            <span className="font-sans font-medium">{errorMsg}</span>
          </div>
        )}
        
        {infoMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 text-xs text-emerald-600 flex items-start gap-3">
            <Sparkles className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            <span className="font-sans font-medium">
              {infoMsg}
              {mode === 'forgot' && forgotStep === 'reset' && (
                <div className="mt-2 font-mono text-[10px] text-emerald-700/80 break-all bg-emerald-50 p-2 rounded-lg">
                  Check console for Ethereal email test link!
                </div>
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-5 top-4 w-5 h-5 text-[#1A1A1A]/30" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="se-input pl-13 pr-5 py-3.5 text-sm"
              />
            </div>
          )}
          
          {(mode !== 'otp' && (mode !== 'forgot' || forgotStep === 'email')) && (
            <div className="relative">
              <Mail className="absolute left-5 top-4 w-5 h-5 text-[#1A1A1A]/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="se-input pl-13 pr-5 py-3.5 text-sm"
              />
            </div>
          )}
          
          {(mode === 'otp' || (mode === 'forgot' && forgotStep === 'reset')) && (
            <div className="relative">
              <Key className="absolute left-5 top-4 w-5 h-5 text-[#1A1A1A]/30" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={mode === 'otp' ? "6-Digit OTP Code" : "6-Digit Reset Code"}
                className="se-input pl-13 pr-5 py-3.5 text-sm tracking-[0.5em] text-center font-bold"
              />
            </div>
          )}
          
          {(mode === 'login' || mode === 'register' || (mode === 'forgot' && forgotStep === 'reset')) && (
            <div className="relative">
              <Lock className="absolute left-5 top-4 w-5 h-5 text-[#1A1A1A]/30" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'forgot' ? "New Password" : "Password"}
                className="se-input pl-13 pr-5 py-3.5 text-sm"
              />
            </div>
          )}
          
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#1A1A1A]/40 block uppercase tracking-widest font-sans">Register Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="se-input px-5 py-3.5 text-xs font-bold bg-white"
              >
                <option value="customer">Customer Buyer</option>
                <option value="seller">Store Merchant Seller</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="se-button w-full py-3.5 text-[13px] uppercase tracking-wider cursor-pointer"
          >
            {loading ? 'Processing...' : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Register Account'}
                {mode === 'otp' && 'Verify & Login'}
                {mode === 'forgot' && (forgotStep === 'email' ? 'Send Reset Code' : 'Reset Password')}
              </>
            )}
          </button>
        </form>

        {/* Premium click-link designs (Moved above Google Sign-In) */}
        <div className="flex flex-col items-center gap-4 pt-4 text-center border-t border-[#1A1A1A]/5">
          {mode === 'login' && (
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold font-sans">New to ShopEZ?</span>
                <button 
                  onClick={() => setMode('register')} 
                  className="text-[#0F766E] font-bold hover:text-[#14B8A6] transition-all cursor-pointer underline underline-offset-4 decoration-[#14B8A6]/30 hover:decoration-[#14B8A6] flex items-center gap-1 group font-sans text-[11px] uppercase tracking-wider"
                >
                  Create Account <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </button>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold font-sans">Lost access?</span>
                <button 
                  onClick={() => setMode('forgot')} 
                  className="text-[#0F766E] font-bold hover:text-[#14B8A6] transition-all cursor-pointer underline underline-offset-4 decoration-[#14B8A6]/30 hover:decoration-[#14B8A6] font-sans text-[11px] uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}
          
          {mode === 'register' && (
            <div className="w-full flex flex-col items-center gap-1 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold font-sans">Already registered?</span>
              <button 
                onClick={() => setMode('login')} 
                className="text-[#0F766E] font-bold hover:text-[#14B8A6] transition-all cursor-pointer underline underline-offset-4 decoration-[#14B8A6]/30 hover:decoration-[#14B8A6] flex items-center gap-1 group font-sans text-[11px] uppercase tracking-wider"
              >
                Sign In <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </button>
            </div>
          )}
          
          {(mode === 'otp' || mode === 'forgot') && (
            <button 
              onClick={() => setMode('login')} 
              className="text-[#0F766E] font-bold hover:text-[#14B8A6] transition-all cursor-pointer flex items-center gap-2 group font-sans text-[11px] uppercase tracking-wider"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span> Back to Sign In
            </button>
          )}
        </div>

        {/* Google Sign-in Section (Moved to the very bottom) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="space-y-4 pt-4 border-t border-[#1A1A1A]/5">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#1A1A1A]/5"></div>
              <span className="flex-shrink mx-4 text-[10px] text-[#1A1A1A]/30 uppercase tracking-widest font-bold">Or Continue With</span>
              <div className="flex-grow border-t border-[#1A1A1A]/5"></div>
            </div>

            <div className="flex justify-center min-h-[44px]">
              {/* Google Native Button Container */}
              <div id="google-signin-button" className="w-full flex justify-center"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
