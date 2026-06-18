import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'dns';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import { init as initSockets } from './sockets/socketManager.js';
import errorHandler from './middlewares/error.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import { applyCoupon } from './controllers/adminController.js';
import { protect } from './middlewares/auth.js';
import fs from 'fs';

// DNS override — run before connectDB to reliably resolve Atlas SRV records
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

dotenv.config();
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
initSockets(server);

// ── Security ──────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ── CORS (allow multiple origins) ────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://shop-ez-lilac.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed: ' + origin));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ── API Routes ────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/address', addressRoutes);
app.post('/api/coupons/apply', protect, applyCoupon);

// ── Health Check ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ShopEZ API is running!' });
});

// ── Serve React Build in Production ──────────
const clientBuild = path.join(__dirname, '..', 'frontend', 'dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
  } else {
  app.get('/', (req, res) => {
    res.json({ message: 'ShopEZ Premium E-Commerce API is running.' });
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});