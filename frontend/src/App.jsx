import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import ProductCatalog from './pages/ProductCatalog.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Auth from './pages/Auth.jsx';
import AddressPage from './pages/AddressPage.jsx';
import { setCart } from './store/cartSlice.js';
import { logout } from './store/authSlice.js';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://shopez-4vgd.onrender.com');

const FloatingSilhouette = ({ children, delay = 0, x = "10%", y = "20%", rotate = 0 }) => (
  <motion.div
    initial={{ y: '80vh', opacity: 0, rotate }}
    animate={{ 
      y: ['60vh', '-20vh'], 
      opacity: [0, 0.08, 0.08, 0],
      rotate: [rotate, rotate + 20, rotate - 20, rotate]
    }}
    transition={{ 
      duration: 15, 
      ease: 'easeInOut', 
      repeat: Infinity,
      delay 
    }}
    className="absolute pointer-events-none text-apple-dark/15 hidden sm:block"
    style={{ left: x, top: y }}
  >
    {children}
  </motion.div>
);

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector(state => state.auth);
  const [booting, setBooting] = useState(true);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Axios request and response interceptors to handle dynamic token inclusion and expired tokens
  useEffect(() => {
    // Request interceptor to dynamically inject the token
    const reqInterceptor = axios.interceptors.request.use(
      config => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor to handle expired tokens (401 Unauthorized)
    const resInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          dispatch(logout());
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [dispatch]);
  
  const loadingMessages = [
    'Finding products you’ll love…',
    'Loading today’s best deals…',
    'Preparing your recommendations…',
    'Updating catalog availability…',
    'Setting up your personalized dashboard…'
  ];

  useEffect(() => {
    if (token) {
      axios.get('/api/cart')
        .then(res => {
          if (res.data.success) {
            dispatch(setCart(res.data.cart));
          }
        })
        .catch(err => console.error('Error fetching cart:', err));
    }
  }, [token, dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
    }, 700);
    const timeout = setTimeout(() => {
      setBooting(false);
      clearInterval(interval);
    }, 3500);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) return <Navigate to="/auth" />;
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Router>
      <AnimatePresence mode="wait">
        {booting ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#071B2D] z-[9999] flex flex-col items-center justify-center px-6 text-center space-y-8 overflow-hidden"
          >
            {/* Drifting silhouettes in background */}
            <FloatingSilhouette x="8%" y="10%" rotate={12} delay={0}>
              <svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                <rect x="2" y="4" width="20" height="12" rx="2" />
                <path d="M2 18h20a1 1 0 0 1 1 1v1H1v-1a1 1 0 0 1 1-1z" />
              </svg>
            </FloatingSilhouette>
            
            <FloatingSilhouette x="78%" y="15%" rotate={-15} delay={2}>
              <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M3 18a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2H3v-2z" />
                <path d="M12 13V3a2 2 0 0 1 2-2h3v4h-3v8" />
              </svg>
            </FloatingSilhouette>

            <FloatingSilhouette x="15%" y="60%" rotate={25} delay={4}>
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                <rect x="6" y="6" width="12" height="12" rx="3" />
                <path d="M9 6V2h6v4" />
                <path d="M9 18v4h6v-4" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </FloatingSilhouette>

            <FloatingSilhouette x="82%" y="55%" rotate={-8} delay={1}>
              <svg className="w-22 h-22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M12 2a3 3 0 0 0-3 3h2a1 1 0 0 1 2 0v1.5L4 17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2L13 6.5V5a3 3 0 0 0-1-3z" />
              </svg>
            </FloatingSilhouette>

            {/* Active cinematic messages crossfades */}
            <div className="h-6 overflow-hidden relative w-80 z-10">
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={loadingMsgIdx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="font-sans font-semibold text-xs tracking-wider text-white absolute left-0 right-0 uppercase"
                >
                  {loadingMessages[loadingMsgIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Glowing blue progress bar */}
            <div className="w-48 h-[2px] bg-black/5 rounded-full overflow-hidden relative z-10 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.5, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#14B8A6] shadow-[0_0_16px_rgba(20,184,166,0.3)]"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen se-page selection:bg-brand-500 selection:text-white"
          >
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<ProductCatalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/address" element={<AddressPage />} />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/order/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                      <OrderSuccess />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/seller" 
                  element={
                    <ProtectedRoute allowedRoles={['seller']}>
                      <SellerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
}
export default App;
