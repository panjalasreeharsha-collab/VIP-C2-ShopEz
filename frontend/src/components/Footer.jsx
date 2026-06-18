import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-16 px-4 border-t border-slate-900">
      <div className="se-shell grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[20px] tracking-tight text-white">Shop<span className="text-[#14B8A6]">EZ</span></span>
            </div>
          </Link>
          <p className="text-sm text-white/55 leading-relaxed max-w-xs font-sans font-medium mt-3">
            A polished shopping experience with curated products, smart recommendations, secure checkout, and fast delivery.
          </p>
          <div className="text-xs text-white/50 space-y-1.5 pt-2 font-sans text-left">
            <p className="font-semibold text-white/80">Helpline: 1800-123-4567</p>
            <p>support@shopez.in</p>
            <p className="text-[10px] leading-snug pt-1 text-white/40">ShopEZ HQ: Sector 5, HSR Layout, Bengaluru, KA 560102</p>
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#CFFAFE]/70 mb-4">Shop</h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link to="/catalog" className="hover:text-[#A7F3D0] transition-colors">Catalog Products</Link></li>
            <li><Link to="/catalog?category=electronics" className="hover:text-[#A7F3D0] transition-colors">Electronics</Link></li>
            <li><Link to="/catalog?category=fashion" className="hover:text-[#A7F3D0] transition-colors">Fashion</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#CFFAFE]/70 mb-4">Store Policies</h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><a href="#" className="hover:text-[#A7F3D0] transition-colors">Shipping & Customs</a></li>
            <li><a href="#" className="hover:text-[#A7F3D0] transition-colors">Returns & Exchanges</a></li>
            <li><a href="#" className="hover:text-[#A7F3D0] transition-colors">Privacy and Security</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#CFFAFE]/70 mb-4">Corporate</h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><a href="#" className="hover:text-[#A7F3D0] transition-colors">Become a Seller</a></li>
            <li><a href="#" className="hover:text-[#A7F3D0] transition-colors">Careers at ShopEZ</a></li>
            <li><a href="#" className="hover:text-[#A7F3D0] transition-colors">Press Inquiries</a></li>
          </ul>
        </div>
        </div>
      <div className="se-shell mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] text-white/50 gap-4">
        <p>&copy; {new Date().getFullYear()} ShopEZ Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#A7F3D0] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#A7F3D0] transition-colors">Cookie Prefs</a>
        </div>
      </div>
    </footer>
  );
}
