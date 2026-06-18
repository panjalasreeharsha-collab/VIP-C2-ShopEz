import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Sparkles,
  ArrowRight,
  Star,
  Heart,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Flame,
  Home as HomeIcon,
  Lock,
  LogIn,
  Zap,
  Package,
  TrendingUp,
  Clock,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Hero Slides (carousel)
// ─────────────────────────────────────────────
const heroSlides = [
  {
    id: 1,
    headline: 'Starting ₹199',
    sub: 'Deals on Fashion & Beauty',
    badge: 'Today only',
    bg: 'from-[#071B2D] to-[#14B8A6]',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
    cta: '/catalog?category=fashion',
    ctaLabel: 'Shop Now',
  },
  {
    id: 2,
    headline: 'Up to 40% Off',
    sub: 'Premium Electronics — Limited Stock',
    badge: 'Flash Sale',
    bg: 'from-[#071B2D] to-[#0EA5E9]',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    cta: '/catalog?category=electronics',
    ctaLabel: 'Explore Deals',
  },
  {
    id: 3,
    headline: 'New Arrivals',
    sub: 'Home Decor & Lifestyle Picks',
    badge: 'Just In',
    bg: 'from-[#071B2D] to-[#14B8A6]',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    cta: '/catalog?category=home+decor',
    ctaLabel: 'See Collection',
  },
];

// ─────────────────────────────────────────────
// Deal Panels (Amazon-style grid below hero)
// ─────────────────────────────────────────────
const dealPanels = [
  {
    title: 'Appliances for your home',
    sub: 'Up to 55% off',
    color: '#fff',
    items: [
      { 
        label: 'Air conditioners',    
        img: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Refrigerators',       
        img: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1571175432247-f31d0fa47f3b?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Microwaves',          
        img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Washing machines',    
        img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=200'
      },
    ],
    category: 'electronics',
  },
  {
    title: 'Revamp your home in style',
    sub: null,
    color: '#fff',
    items: [
      { 
        label: 'Cushion covers & more', 
        img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Figurines & more',      
        img: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Home storage',          
        img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Lighting solutions',    
        img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=200'
      },
    ],
    category: 'home-decor',
  },
  {
    title: 'Starting ₹49',
    sub: 'Deals on home essentials',
    color: '#fff',
    items: [
      { 
        label: 'Cleaning supplies',    
        img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Bathroom accessories', 
        img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Home tools',           
        img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1530124560676-acbe3222e92c?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Wallpapers',           
        img: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=200'
      },
    ],
    category: 'accessories',
  },
  {
    title: 'Starting ₹199',
    sub: 'ShopEZ Brand Picks & more',
    color: '#fff',
    items: [
      { 
        label: 'Starting ₹199 | Bedsheets',  
        img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Starting ₹199 | Curtains',   
        img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Minimum 40% Off | Ironing',  
        img: 'https://images.unsplash.com/photo-1489278353717-f57e2b77a01f?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200'
      },
      { 
        label: 'Up to 60% Off | Home Decor', 
        img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=200',
        fallback: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200'
      },
    ],
    category: 'home-decor',
  },
];

// ─────────────────────────────────────────────
// Fallback products
// ─────────────────────────────────────────────
const fallbackProducts = [
  { _id: 'mock1', name: 'AeroBook Pro 14', description: 'Futuristic unibody laptop.', basePrice: 99999, rating: 4.9, reviewsCount: 128, discount: 15, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600'], category: 'Electronics', seller: { storeName: 'AeroTech Studio' } },
  { _id: 'mock2', name: 'AeroPhone Ultra 15', description: 'Titanium flagship smartphone.', basePrice: 69999, rating: 4.8, reviewsCount: 342, discount: 10, images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600'], category: 'Electronics', seller: { storeName: 'AeroTech Studio' } },
  { _id: 'mock3', name: 'AeroPods Max', description: 'Premium over-ear wireless audio.', basePrice: 19999, rating: 4.9, reviewsCount: 84, discount: 25, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'], category: 'Electronics', seller: { storeName: 'AeroTech Studio' } },
  { _id: 'mock_ac', name: 'AeroTemp 1.5 Ton Split AC', description: 'Premium 1.5 Ton 5-Star Split AC with copper condenser, inverter compressor, and smart Wi-Fi control.', basePrice: 35999, rating: 4.8, reviewsCount: 195, discount: 15, images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=600'], category: 'Electronics', seller: { storeName: 'AeroTech Studio' } },
  { _id: 'mock_microwave', name: 'AeroWave 25L Convection Microwave', description: '25L Convection Microwave Oven with 150+ auto-cook menus, touch control, and child lock feature.', basePrice: 12999, rating: 4.7, reviewsCount: 142, discount: 20, images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=600'], category: 'Electronics', seller: { storeName: 'AeroTech Studio' } },
  { _id: 'mock_tools', name: 'AeroFix 100-Piece Home Tool Kit', description: '100-Piece premium home tool set with cordless drill, hammer, screwdrivers, wrenches, and heavy duty carry case.', basePrice: 2499, rating: 4.6, reviewsCount: 88, discount: 10, images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600'], category: 'Accessories', seller: { storeName: 'GearZone' } },
  { _id: 'mock4', name: 'Merino Wool Coat', description: 'Premium warm merino wool coat.', basePrice: 14999, rating: 4.7, reviewsCount: 52, discount: 20, images: ['https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600'], category: 'Fashion', seller: { storeName: 'Studio Threadwork' } },
  { _id: 'mock5', name: 'Mid-Century Desk', description: 'Handcrafted solid walnut desk.', basePrice: 29999, rating: 4.9, reviewsCount: 19, discount: 5, images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600'], category: 'Home Decor', seller: { storeName: 'Atelier Maison' } },
  { _id: 'mock6', name: 'Comfort Sneaker', description: 'Performance running shoe.', basePrice: 8999, rating: 4.6, reviewsCount: 164, discount: 30, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'], category: 'Fashion', seller: { storeName: 'Studio Threadwork' } },
  { _id: 'mock7', name: 'Wireless Gaming Mouse', description: 'High-DPI precision gaming mouse.', basePrice: 4999, rating: 4.5, reviewsCount: 210, discount: 18, images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=600'], category: 'Gaming', seller: { storeName: 'GearZone' } },
  { _id: 'mock8', name: 'Minimalist Backpack', description: 'Sleek everyday carry backpack.', basePrice: 3499, rating: 4.4, reviewsCount: 88, discount: 12, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'], category: 'Accessories', seller: { storeName: 'Carry Co.' } },
];

// ─────────────────────────────────────────────
// Reusable Product Card
// ─────────────────────────────────────────────
function ProductCard({ prod, isWishlisted, onWishlist, onAdd }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col group relative text-left hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className="relative bg-slate-50 p-5 flex items-center justify-center h-52">
        <img src={prod.images[0]} alt={prod.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
        <button onClick={() => onWishlist(prod._id)} className="absolute top-3 right-3 p-2 bg-white rounded-full border border-slate-200 shadow-sm text-slate-500 hover:text-red-500 transition-colors">
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        {prod.discount && (
          <span className="absolute top-3 left-3 bg-[#14B8A6] text-white text-[9px] font-bold px-2 py-1 rounded-xl shadow-sm">
            {prod.discount}% OFF
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-[0.14em]">{typeof prod.category === 'object' && prod.category !== null ? prod.category.name : prod.category}</span>
        <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#14B8A6] transition-colors">{prod.name}</h4>
        <div className="flex items-center gap-1 mt-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`w-3 h-3 ${s <= Math.round(prod.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
          ))}
          <span className="text-[10px] text-slate-400 font-medium ml-1">({prod.reviewsCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold text-slate-900">₹{prod.basePrice.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-400 line-through">₹{Math.round(prod.basePrice * 1.2).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Link to={`/product/${prod._id}`} className="flex-1 py-2 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-xl transition-colors">
            View
          </Link>
          <button onClick={() => onAdd(prod)} className="px-3 py-2 bg-[#14B8A6] hover:bg-[#0F766E] text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer">
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const [products, setProducts] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 47, seconds: 22 });

  // Carousel state
  const [slideIdx, setSlideIdx] = useState(0);
  const carouselTimer = useRef(null);

  const startCarousel = () => {
    clearInterval(carouselTimer.current);
    carouselTimer.current = setInterval(() => setSlideIdx(i => (i + 1) % heroSlides.length), 5001);
  };

  const goToSlide = (i) => { setSlideIdx(i); startCarousel(); };
  const prevSlide = () => { setSlideIdx(i => (i - 1 + heroSlides.length) % heroSlides.length); startCarousel(); };
  const nextSlide = () => { setSlideIdx(i => (i + 1) % heroSlides.length); startCarousel(); };

  // ── Fetch products ──
  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        if (res.data.success && res.data.products?.length > 0) {
          const enriched = res.data.products.map((p, idx) => ({
            ...p,
            reviewsCount: p.reviewsCount || Math.floor(Math.random() * 200) + 15,
            discount: p.discount || [10, 15, 20, 25, 30][idx % 5],
          }));
          setProducts(enriched);
        } else {
          setProducts(fallbackProducts);
        }
      })
      .catch(() => setProducts(fallbackProducts))
      .finally(() => setLoading(false));

    // Flash deal timer
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 59, seconds: 59 };
      });
    }, 1000);

    startCarousel();
    return () => { clearInterval(t); clearInterval(carouselTimer.current); };
  }, []);

  // ── Fetch personalized recs (auth-gated) ──
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingPersonalized(true);
      axios.get('/api/ai/recommendations')
        .then(res => {
          if (res.data.success && res.data.products?.length > 0) {
            const enriched = res.data.products.map((p, idx) => ({
              ...p,
              reviewsCount: p.reviewsCount || Math.floor(Math.random() * 200) + 15,
              discount: p.discount || [10, 15, 20, 25, 30][idx % 5],
            }));
            setPersonalizedProducts(enriched);
          } else {
            setPersonalizedProducts([]);
          }
        })
        .catch(() => setPersonalizedProducts([]))
        .finally(() => setLoadingPersonalized(false));
    } else {
      setPersonalizedProducts([]);
    }
  }, [isAuthenticated]);

  const toggleWishlist = id =>
    setWishlistedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleQuickAdd = async (product) => {
    try {
      const res = await axios.post('/api/cart', { productId: product._id, quantity: 1, color: 'Default', size: 'Standard' });
      if (res.data.success) { alert(`${product.name} added to cart!`); window.location.reload(); }
    } catch { alert('Sign in to add items to your cart.'); navigate('/auth'); }
  };

  const displayProducts = products.length > 0 ? products : fallbackProducts;
  const recProducts   = personalizedProducts.length > 0 ? personalizedProducts : displayProducts;
  const slide = heroSlides[slideIdx];

  return (
    <div className="text-[#0F172A] min-h-screen font-sans">

      {/* ═══════════════════════════════════════
          HERO CAROUSEL
      ═══════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[540px] bg-slate-950">
        {/* Slide */}
        <div
          key={slide.id}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg} flex items-center justify-between px-6 sm:px-12 lg:px-20 transition-all duration-700`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.72)_0%,rgba(15,23,42,0.46)_44%,rgba(15,23,42,0.12)_100%)] z-[1]" />
          {/* Left copy */}
          <div className="z-10 space-y-5 max-w-xl relative">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-[10px] font-bold uppercase tracking-[0.28em] px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
              {slide.badge}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]">
              {slide.headline}
            </h1>
            <p className="max-w-lg text-base sm:text-lg text-white/85 font-medium leading-relaxed">{slide.sub}</p>
            <Link
              to={slide.cta}
              className="inline-flex items-center gap-2 mt-4 bg-white text-slate-950 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
            >
              {slide.ctaLabel} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right image */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
            <img
              src={slide.img}
              alt={slide.headline}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-slate-950/35 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/15 hover:bg-white/30 text-white flex items-center justify-center rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/15 hover:bg-white/30 text-white flex items-center justify-center rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === slideIdx ? 'bg-white scale-110' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          AMAZON-STYLE DEAL PANELS GRID
      ═══════════════════════════════════════ */}
      <section className="se-shell relative z-20 pt-10 sm:pt-12 pb-8">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="se-eyebrow">Popular Departments</p>
            <h2 className="font-display text-2xl sm:text-3xl text-slate-950 mt-1">Shop by Category</h2>
          </div>
          <Link to="/catalog" className="hidden sm:inline-flex text-sm font-bold text-[#0F766E] hover:text-[#14B8A6] items-center gap-1">
            Browse catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dealPanels.map((panel, pi) => (
            <div
              key={pi}
              className="se-card se-card-hover p-4"
            >
              {/* Panel header */}
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{panel.title}</h3>
                {panel.sub && <p className="text-[11px] text-[#14B8A6] font-semibold mt-0.5">{panel.sub}</p>}
              </div>
              {/* 2×2 image grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {panel.items.map((item, ii) => (
                  <button
                    key={ii}
                    onClick={() => navigate(`/catalog?category=${panel.category}`)}
                    className="group text-left"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2">
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = item.fallback || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight line-clamp-2">{item.label}</p>
                  </button>
                ))}
              </div>
              <Link
                to={`/catalog?category=${panel.category}`}
                className="text-[11px] text-[#14B8A6] hover:text-[#0b9281] font-semibold inline-flex items-center"
              >
                See all offers <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PERSONALISED RECOMMENDATIONS
          (Auth-gated — Amazon "Based on your recent searches" style)
      ═══════════════════════════════════════ */}
      <section className="se-shell pb-8">
        <div className="se-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#14B8A6]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isAuthenticated ? `Based on your recent searches` : 'Personalised Recommendations'}
                </h3>
                {isAuthenticated && (
                  <p className="text-[10px] text-slate-400 mt-0.5">Curated just for you, {user?.name?.split(' ')[0]}</p>
                )}
              </div>
            </div>
            {isAuthenticated && (
              <Link
                to="/catalog?recommendations=true"
                className="text-[11px] text-[#14B8A6] hover:text-[#0b9281] font-semibold flex items-center gap-0.5"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Body */}
          {!isAuthenticated ? (
            /* ── Guest state ── */
            <div className="flex flex-col sm:flex-row items-center gap-8 px-6 py-8">
              {/* Left: Sign-in prompt */}
              <div className="flex-shrink-0 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 max-w-xs">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-blue-500" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Sign in for personalised recommendations</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  See products curated based on your searches, orders, and wishlist — just like your own personal shopper.
                </p>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 bg-[#14B8A6] hover:bg-[#0b9281] text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" /> Sign In Now
                </Link>
              </div>

              {/* Right: Blurred preview products */}
              <div className="flex-1 overflow-hidden relative">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {displayProducts.slice(0, 4).map(prod => (
                    <div key={prod._id} className="bg-white rounded-lg p-3 flex flex-col items-center gap-2 border border-slate-200">
                      <div className="w-full aspect-square rounded-md overflow-hidden bg-white flex items-center justify-center p-2">
                        <img src={prod.images[0]} alt={prod.name} className="max-h-full max-w-full object-contain blur-[2px] opacity-70" />
                      </div>
                      <div className="w-full space-y-1 blur-[2px] opacity-70">
                        <div className="h-2 bg-slate-200 rounded w-3/4 mx-auto" />
                        <div className="h-2 bg-slate-200 rounded w-1/2 mx-auto" />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Overlay fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent pointer-events-none rounded-lg" />
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-semibold text-center whitespace-nowrap">
                  Sign in to unlock your recommendations
                </p>
              </div>
            </div>
          ) : loadingPersonalized ? (
            /* ── Loading ── */
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 p-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="aspect-square bg-slate-100 rounded-lg" />
                  <div className="h-2.5 bg-slate-100 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            /* ── Logged-in recommendations ── */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-0 divide-x divide-y divide-slate-100">
              {recProducts.slice(0, 6).map(prod => (
                <Link
                  key={prod._id}
                  to={`/product/${prod._id}`}
                  className="group p-4 flex flex-col items-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-full aspect-square flex items-center justify-center">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="max-h-28 max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="w-full text-left space-y-0.5">
                    <p className="text-[11px] font-semibold text-slate-800 line-clamp-2 leading-snug">{prod.name}</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-2 h-2 ${s <= Math.round(prod.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                      ))}
                      <span className="text-[9px] text-slate-400">({prod.reviewsCount})</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">₹{prod.basePrice.toLocaleString('en-IN')}</p>
                    {prod.discount && (
                      <p className="text-[10px] text-emerald-600 font-semibold">{prod.discount}% off</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRENDING TODAY
      ═══════════════════════════════════════ */}
      <section className="se-shell pb-8">
        <div className="se-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#14B8A6]" />
              <h3 className="text-sm font-bold text-slate-900">Trending Today</h3>
            </div>
            <Link to="/catalog" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-36 bg-slate-100 rounded-lg" />
                  <div className="h-2.5 bg-slate-100 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {displayProducts.slice(0, 6).map(prod => (
                <ProductCard
                  key={prod._id}
                  prod={prod}
                  isWishlisted={wishlistedIds.includes(prod._id)}
                  onWishlist={toggleWishlist}
                  onAdd={handleQuickAdd}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FLASH DEALS BANNER
      ═══════════════════════════════════════ */}
      <section className="se-shell pb-8">
        <div className="bg-gradient-to-r from-[#071B2D] to-[#0EA5E9] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400 fill-red-400/20" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Limited Time</span>
            </div>
            <h3 className="text-xl font-bold text-white">Flash Deals</h3>
            <p className="text-xs text-slate-400">Exclusive markdowns. Express checkout. Instant UPI pay.</p>
            {/* Countdown */}
            <div className="flex items-center gap-2 mt-3">
              {[
                { val: timeLeft.hours, label: 'HRS' },
                { val: timeLeft.minutes, label: 'MIN' },
                { val: timeLeft.seconds, label: 'SEC' },
              ].map(({ val, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span className="text-white/30 font-bold">:</span>}
                  <div className="text-center">
                    <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-base font-bold text-blue-300 min-w-[42px] text-center">
                      {val.toString().padStart(2, '0')}
                    </div>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest">{label}</span>
                  </div>
                </React.Fragment>
              ))}
              <Clock className="w-3.5 h-3.5 text-slate-500 ml-1 animate-pulse" />
            </div>
          </div>
          {/* Flash product */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 w-full sm:w-auto sm:min-w-[280px]">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=150" alt="Deal" className="w-16 h-16 object-contain" />
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">AeroPods Max Wireless</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-blue-300 font-bold text-base">₹14,999</span>
                <span className="text-white/30 text-xs line-through">₹19,999</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/4 rounded-full" />
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">Only 3 units left</p>
            </div>
            <Link to="/catalog" className="flex-shrink-0 bg-white text-slate-900 text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Buy
            </Link>
          </div>
          <Link to="/catalog" className="sm:hidden text-[11px] text-blue-400 font-semibold">
            See all flash deals →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MORE PRODUCTS — AI PICKS
      ═══════════════════════════════════════ */}
      <section className="se-shell pb-10">
        <div className="se-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">More to Explore</h3>
            </div>
            <Link to="/catalog" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5">
              Full Catalog <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayProducts.slice(2, 6).map(prod => (
              <ProductCard
                key={prod._id}
                prod={prod}
                isWishlisted={wishlistedIds.includes(prod._id)}
                onWishlist={toggleWishlist}
                onAdd={handleQuickAdd}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST STRIP
      ═══════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-200 py-6 px-4">
        <div className="se-shell grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: Package,    label: 'Free Delivery',      sub: 'On orders over ₹499' },
            { icon: Zap,        label: 'Express Shipping',   sub: 'Same-day for metros' },
            { icon: UserCheck,  label: 'Verified Sellers',   sub: 'Audited & certified' },
            { icon: ShoppingBag,label: 'Easy Returns',       sub: '30-day hassle-free' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 py-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#14B8A6]" />
              </div>
              <p className="text-xs font-bold text-slate-800">{label}</p>
              <p className="text-[10px] text-slate-500">{sub}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
