import React from 'react';
export function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-6 border border-[#c6e7f5] space-y-6 animate-pulse">
          <div className="aspect-video w-full rounded-2xl bg-[#E5F4FB] flex items-center justify-center">
            <svg className="w-16 h-16 text-[#14B8A6]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M2 20h20" />
              <path d="M20 17H4" />
            </svg>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-1/3 bg-[#E5F4FB] rounded-full" />
            <div className="h-4.5 w-3/4 bg-[#E5F4FB] rounded-full" />
            <div className="h-3.5 w-1/2 bg-[#E5F4FB] rounded-full" />
          </div>
          <div className="pt-4 border-t border-black/5 flex items-center justify-between">
            <div className="h-4.5 w-1/4 bg-black/5 rounded-full" />
            <div className="h-3.5 w-1/3 bg-black/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
      <div className="space-y-6">
        <div className="aspect-square w-full rounded-3xl bg-black/5 flex items-center justify-center">
          <svg className="w-24 h-24 text-apple-dark/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M2 20h20" />
          </svg>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-black/5" />
          ))}
        </div>
      </div>
      <div className="space-y-6 pt-8">
        <div className="h-3 w-1/6 bg-black/5 rounded-full" />
        <div className="h-10 w-3/4 bg-black/5 rounded-full" />
        <div className="h-4 w-1/4 bg-black/5 rounded-full" />
        <div className="h-24 w-full bg-black/5 rounded-3xl" />
        <div className="h-12 w-1/2 bg-black/5 rounded-full" />
      </div>
    </div>
  );
}