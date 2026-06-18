import React from 'react';

export const LogoMark = ({ className = "w-6 h-6", glow = false }) => {
  return (
    <svg 
      className={`${className} ${glow ? 'drop-shadow-[0_0_12px_rgba(20,184,166,0.35)]' : ''} transition-all duration-300`} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="teal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      
      {/* 
        Geometric "SE" interlocking blocks - representing smart connectivity and fast commerce.
        Modern, clean, trustworthy.
      */}
      {/* Left block (forming S-curve base) */}
      <rect 
        x="20" 
        y="25" 
        width="28" 
        height="50" 
        rx="6" 
        fill="url(#teal-gradient)" 
      />
      
      {/* Right block (interlocking with left) */}
      <rect 
        x="52" 
        y="25" 
        width="28" 
        height="50" 
        rx="6" 
        fill="currentColor" 
      />

      {/* Center connector dot */}
      <circle 
        cx="50" 
        cy="50" 
        r="8" 
        fill="#FFFFFF" 
      />
      <circle 
        cx="50" 
        cy="50" 
        r="4" 
        fill="url(#teal-gradient)" 
      />
    </svg>
  );
};

export const Logo = ({ className = "flex items-center gap-2", lightMode = true }) => {
  return (
    <div className={className}>
      <span 
        className={`font-display font-semibold text-[20px] tracking-tight transition-colors duration-300 ${
          lightMode ? 'text-[#071B2D]' : 'text-white'
        }`}
      >
        Shop<span className="text-[#14B8A6] font-bold">EZ</span>
      </span>
    </div>
  );
};
