import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Star, ShoppingCart, Heart, Shield, RotateCcw, Truck } from 'lucide-react';
import { setCart } from '../store/cartSlice.js';
import { DetailSkeleton } from '../components/skeletonLoader.jsx';
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [questions, setQuestions] = useState([
    { q: 'Is the battery replaceable?', a: 'No, the battery is integrated for a slim unibody design.' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  useEffect(() => {
    setLoading(true);
    axios.get(`/api/products/${id}`)
      .then(res => {
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setReviews(res.data.reviews);
          setRelated(res.data.related);
          setActiveImage(prod.images[0]);
          setPrice(prod.basePrice);
          if (prod.variants && prod.variants.length > 0) {
            setSelectedColor(prod.variants[0].color);
            setSelectedSize(prod.variants[0].size);
            setPrice(prod.variants[0].price);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);
  const handleVariantChange = (color, size) => {
    setSelectedColor(color);
    setSelectedSize(size);
    const variant = product.variants.find(v => v.color === color && v.size === size);
    if (variant) {
      setPrice(variant.price);
    }
  };
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      const res = await axios.post('/api/cart', {
        productId: product._id,
        quantity,
        color: selectedColor,
         size: selectedSize
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        alert('Product added to your bag!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add product to cart.');
    }
  };
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      const res = await axios.post('/api/wishlist', { productId: product._id });
      if (res.data.success) {
        alert('Wishlist updated!');
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setReviewError('');
    try {
      const res = await axios.post(`/api/products/${product._id}/reviews`, { rating, comment });
      if (res.data.success) {
        setReviews(prev => [res.data.review, ...prev]);
        setComment('');
        alert('Review submitted successfully!');
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };
  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestions(prev => [...prev, { q: newQuestion, a: 'Thank you for your question. A support representative or verified seller will answer soon.' }]);
    setNewQuestion('');
  };
  if (loading) return <div className="se-shell py-24"><DetailSkeleton /></div>;
  if (!product) return <div className="text-center py-32 font-display font-bold">Product not found.</div>;
  return (
    <div className="se-shell py-10 space-y-16 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_520px] gap-10 items-start">
        <div className="space-y-6">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200 relative shadow-sm flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-100)_0%,_transparent_75%)] opacity-60 pointer-events-none" />
            <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-700 hover:scale-105 drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-2xl overflow-hidden bg-white border p-2 flex items-center justify-center ${activeImage === img ? 'border-[#14B8A6] ring-4 ring-[#14B8A6]/10' : 'border-slate-200'} transition-all`}
              >
                <img src={img} alt="preview" className="max-h-full max-w-full object-contain" />
              </button>
            ))}
          </div>
        </div>
        <div className="se-card p-6 sm:p-8 space-y-8 lg:sticky lg:top-24">
          <div className="space-y-4">
            <span className="se-eyebrow">
              {product.seller?.storeName || 'AeroTech Studio'}
            </span>
            
            <h1 className="font-display text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-0.5 text-amber-600 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {product.rating.toFixed(1)}
              </span>
               <span className="text-[#111827]/20 text-xs">|</span>
              <span className="text-[#111827]/40 text-xs font-sans">{reviews.length} Verified Reviews</span>
            </div>
            
            <p className="font-display font-semibold text-3xl text-slate-950 pt-2">
              ₹{price.toLocaleString('en-IN')}
            </p>
          </div>
          
          <p className="text-sm text-slate-600 leading-relaxed font-sans border-t border-slate-100 pt-6">
            {product.description}
          </p>
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h4 className="font-display font-bold text-[10px] uppercase tracking-wider text-slate-400">Choose Variant</h4>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleVariantChange(v.color, v.size)}
                    className={`px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                      selectedColor === v.color && selectedSize === v.size
                        ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {v.color} - {v.size} (₹{v.price})
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1 shadow-sm">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3.5 py-2 text-xs font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors">-</button>
              <span className="px-3 text-sm font-medium font-sans text-[#1A1A1A]">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3.5 py-2 text-xs font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors">+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="se-button flex-grow py-4 text-[15px] cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Bag
            </button>
            
            <button 
              onClick={handleToggleWishlist}
              className="p-4 rounded-2xl border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-100 transition-all bg-white shadow-sm cursor-pointer"
            >
              <Heart className="w-4.5 h-4.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Complimentary Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-500" />
              <span>30 Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Shield className="w-4 h-4 text-brand-500" />
              <span>1 Year Warranty</span>
            </div>
             </div>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-12 space-y-6">
        <h3 className="font-display text-2xl text-slate-950">Specifications</h3>
        <div className="max-w-xl se-card overflow-hidden">
          {product.specifications && product.specifications.length > 0 ? (
            product.specifications.map((spec, i) => (
              <div key={i} className="grid grid-cols-2 px-8 py-5 text-xs border-b border-black/5 last:border-b-0">
                <span className="font-display font-semibold text-apple-dark/50">{spec.name}</span>
                <span className="text-apple-dark font-bold">{spec.value}</span>
              </div>
            ))
          ) : (
            <p className="p-6 text-xs text-apple-dark/50 text-center">No specification lists entered.</p>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <div className="border-t border-slate-200 pt-12 space-y-8">
          <h3 className="font-display text-2xl text-slate-950">Frequently Bought Together</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map(prod => (
              <Link to={`/product/${prod._id}`} key={prod._id} className="se-card se-card-hover p-5 group">
                <img src={prod.images[0]} alt={prod.name} className="w-full h-40 object-cover rounded-2xl mb-4" />
                <h4 className="font-display font-bold text-xs text-apple-dark line-clamp-1 group-hover:text-brand-500 transition-colors">{prod.name}</h4>
                <span className="text-xs text-apple-dark/50 font-semibold font-display block mt-1">₹{prod.basePrice}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="border-t border-slate-200 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <h3 className="font-display text-2xl text-slate-950">Reviews</h3>
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((rev, i) => (
                <div key={i} className="p-6 se-card space-y-3">
                  <div className="flex items-center justify-between text-xs text-apple-dark/45">
                    <span className="font-bold text-apple-dark">{rev.user?.name || 'Customer'}</span>
                    <span className="flex items-center gap-0.5 text-brand-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {rev.rating}
                    </span>
                  </div>
                  <p className="text-xs text-apple-dark/65 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-apple-dark/40 py-6">No rating reviews yet.</p>
            )}
          </div>
        </div>
        <div className="se-card p-6 space-y-6 h-fit">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-apple-dark">Write Review</h4>
          {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-apple-dark/45 block">Rating Score</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                className="se-input px-3.5 py-2.5 text-xs"
              >
                <option value={5}>⭐⭐⭐⭐⭐</option>
                <option value={4}>⭐⭐⭐⭐</option>
                <option value={3}>⭐⭐⭐</option>
                <option value={2}>⭐⭐</option>
                <option value={1}>⭐</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-apple-dark/45 block">Experience Details</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                required
                className="se-input px-3.5 py-2.5 text-xs resize-none"
              />
            </div>
            <button type="submit" className="se-button w-full py-3 text-xs cursor-pointer">
              Submit review
            </button>
          </form>
        </div>
      </div>
       <div className="border-t border-slate-200 pt-12 space-y-6">
        <h3 className="font-display text-2xl text-slate-950">Questions & Answers</h3>
        <div className="max-w-2xl space-y-4">
          {questions.map((qna, idx) => (
            <div key={idx} className="space-y-2 p-6 se-card">
              <div className="flex gap-2 text-xs">
                <span className="font-display font-bold text-brand-500">Q:</span>
                <span className="font-semibold text-apple-dark">{qna.q}</span>
              </div>
              <div className="flex gap-2 text-xs pl-4 text-apple-dark/50">
                <span className="font-display font-bold text-apple-dark/30">A:</span>
                <span>{qna.a}</span>
              </div>
            </div>
          ))}
          <form onSubmit={handleQuestionSubmit} className="flex gap-3 max-w-xl bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow px-3 py-2 text-xs bg-transparent focus:outline-none text-apple-dark"
            />
            <button type="submit" className="se-button px-4 py-2 text-xs">
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
