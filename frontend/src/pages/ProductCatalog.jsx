import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Search, SlidersHorizontal, ArrowUpDown, Mic, Star, Heart, ArrowRight, Eye } from 'lucide-react';
import { CatalogSkeleton } from '../components/skeletonLoader.jsx';

export default function ProductCatalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector(state => state.auth);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);

  // Sync state with URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const catParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    setCategory(catParam || '');
    setSearch(searchParam || '');
  }, [location.search]);

  // Fetch user wishlist if logged in
  useEffect(() => {
    if (isAuthenticated) {
      axios.get('/api/wishlist')
        .then(res => {
          if (res.data.success && res.data.wishlist?.products) {
            const ids = res.data.wishlist.products.map(p => typeof p === 'object' ? p._id : p);
            setWishlistProductIds(ids);
          }
        })
        .catch(err => console.error('Error fetching wishlist:', err));
    } else {
      setWishlistProductIds([]);
    }
  }, [isAuthenticated]);

  const handleToggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to manage your wishlist.');
      navigate('/auth');
      return;
    }
    try {
      const res = await axios.post('/api/wishlist', { productId });
      if (res.data.success && res.data.wishlist?.products) {
        const ids = res.data.wishlist.products.map(p => typeof p === 'object' ? p._id : p);
        setWishlistProductIds(ids);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleCategorySelect = (catIdOrSlug) => {
    const params = new URLSearchParams(window.location.search);
    if (catIdOrSlug) {
      params.set('category', catIdOrSlug);
    } else {
      params.delete('category');
    }
    params.delete('recommendations'); // clear recommendation flag if standard category selected
    navigate(`/catalog?${params.toString()}`);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const isRecs = new URLSearchParams(window.location.search).get('recommendations') === 'true';
      const isWishlist = new URLSearchParams(window.location.search).get('wishlist') === 'true';
      let res;
      if (isWishlist) {
        res = await axios.get('/api/wishlist');
        if (res.data.success && res.data.wishlist?.products) {
          setProducts(res.data.wishlist.products);
        }
      } else if (isRecs) {
        res = await axios.get('/api/ai/recommendations');
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } else {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sort) params.append('sort', sort);
        res = await axios.get(`/api/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort, location.search]);

  useEffect(() => {
    axios.get('/api/products/categories')
      .then(res => {
        if (res.data.success) {
          setCategories(res.data.categories.filter(c => c.parent === null));
        }
      });
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const delaySuggestions = setTimeout(() => {
      axios.get(`/api/products/suggestions?q=${search}`)
        .then(res => {
          if (res.data.success) {
            setSuggestions(res.data.suggestions);
          }
        });
    }, 200);
    return () => clearTimeout(delaySuggestions);
  }, [search]);

  const startVoiceSearch = () => {
    setVoiceSearchActive(true);
    setTimeout(() => {
      setVoiceSearchActive(false);
      setSearch('AeroBook');
    }, 2500);
  };

  // Helper check to see if a category matches active category state (supports id, name or slug matching)
  const isCategoryActive = (cat) => {
    if (!category) return false;
    return (
      category === cat._id || 
      category.toLowerCase() === cat.name.toLowerCase() || 
      category.toLowerCase() === cat.slug?.toLowerCase()
    );
  };

  return (
    <div className="se-shell py-10 space-y-8 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div className="space-y-2">
          <p className="se-eyebrow">ShopEZ Catalog</p>
          <h1 className="font-display text-3xl sm:text-5xl text-slate-950 leading-tight">Shop All Products</h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">Browse products across fashion, electronics, home decor, accessories, and more.</p>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-white border border-slate-200 px-4 py-2 shadow-sm">{products.length} items shown</span>
          <span className="rounded-full bg-white border border-slate-200 px-4 py-2 shadow-sm">Fast delivery</span>
        </div>
      </div>
      
      <div className="relative max-w-2xl">
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-3 shadow-sm focus-within:ring-4 focus-within:ring-[#14B8A6]/10 focus-within:border-[#14B8A6] transition-all">
          <Search className="w-4.5 h-4.5 text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search products, brands, or categories..."
            className="flex-grow px-3 bg-transparent text-sm focus:outline-none text-slate-900 placeholder:text-slate-400 font-sans"
          />
          <button 
            onClick={startVoiceSearch} 
            className={`p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors ${voiceSearchActive ? 'animate-bounce text-[#14B8A6]' : ''}`}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-xl overflow-hidden z-20">
            {suggestions.map(sug => (
              <button
                key={sug.id}
                onClick={() => {
                  setSearch(sug.name);
                  setShowSuggestions(false);
                }}
              className="w-full text-left px-5 py-3.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>{sug.name}</span>
                <span className="text-[9px] text-[#14B8A6] font-bold uppercase tracking-wider font-sans">{sug.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
        {/* Scrollable Filters Sidebar */}
        <div className="space-y-7 lg:sticky lg:top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto se-card p-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <SlidersHorizontal className="w-4 h-4 text-[#14B8A6]" />
            <h3 className="font-display text-lg text-slate-950">Filters</h3>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest text-slate-400">Department</h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleCategorySelect('')} 
                className={`text-left text-xs py-2.5 px-3.5 rounded-xl transition-all ${!category ? 'bg-[#0F172A] text-white font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
              >
                All Departments
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat._id)}
                  className={`text-left text-xs py-2.5 px-3.5 rounded-xl transition-all ${isCategoryActive(cat) ? 'bg-[#0F172A] text-white font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest text-slate-400">Price Range (₹)</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#14B8A6]"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#14B8A6]"
              />
            </div>
          </div>
          
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest text-slate-400">Sort By</h4>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#14B8A6]"
            >
              <option value="newest">Newest Releases</option>
              <option value="price_asc">Price: Lowest first</option>
              <option value="price_desc">Price: Highest first</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
        
        <div>
          {loading ? (
            <CatalogSkeleton />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(prod => (
                <div 
                  key={prod._id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative group"
                >
                  <div className="relative overflow-hidden aspect-square bg-slate-50 p-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.06)_0%,_transparent_70%)] opacity-80 pointer-events-none" />
                    
                    <img 
                      src={prod.images[0]} 
                      alt={prod.name} 
                      className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105 drop-shadow-[0_8px_16px_rgba(15,23,42,0.06)]" 
                    />
                    
                    <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1.5px] z-10">
                      <Link 
                        to={`/product/${prod._id}`}
                        className="p-3.5 rounded-full bg-white text-slate-900 hover:bg-[#14B8A6] hover:text-white transition-all shadow-md hover:scale-105 duration-300 cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </Link>
                    </div>
                    
                    <button 
                      onClick={() => handleToggleWishlist(prod._id)}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-pink-500 transition-all shadow-sm z-10 cursor-pointer"
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${wishlistProductIds.includes(prod._id) ? 'fill-pink-500 text-pink-500' : 'text-slate-400'}`} />
                    </button>
                  </div>
                  
                  <div className="p-5 space-y-3 flex flex-col flex-grow bg-white">
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                      <span>{prod.seller?.storeName || 'AeroTech'}</span>
                      <span className="flex items-center gap-0.5 text-amber-600 px-2 py-0.5 rounded-full bg-amber-50">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {prod.rating.toFixed(1)}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-lg text-slate-950 line-clamp-1 group-hover:text-[#0F766E] transition-colors duration-300 leading-snug">
                      {prod.name}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow font-sans">
                      {prod.description}
                    </p>
                    
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-display text-xl text-slate-950 tracking-tight">
                        ₹{prod.basePrice.toLocaleString('en-IN')}
                      </span>
                      
                      <Link 
                        to={`/product/${prod._id}`}
                        className="text-[12px] font-sans font-semibold text-[#0F766E] hover:text-[#14B8A6] transition-colors flex items-center gap-1 group/btn capitalize"
                      >
                        Details
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 space-y-4">
              <Search className="w-12 h-12 text-apple-dark/20 mx-auto" />
              <h3 className="font-display font-bold text-lg text-apple-dark">No Products Found</h3>
              <p className="text-xs text-apple-dark/50">Try removing search keywords or filters to fetch all items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
