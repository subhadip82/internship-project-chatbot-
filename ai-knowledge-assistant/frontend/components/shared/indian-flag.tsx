'use client';

import React from 'react';

interface IndianFlagProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function IndianFlag({ size = 'md', showLabel = false }: IndianFlagProps) {
  const dimensions = {
    sm: { w: 20, h: 13, radius: 2 },
    md: { w: 24, h: 16, radius: 2.5 },
    lg: { w: 30, h: 20, radius: 3 },
  }[size];

  return (
    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-white/5 to-emerald-500/10 shadow-sm transition hover:scale-105 select-none shrink-0">
      {/* Crisp Official Indian Flag SVG */}
      <svg
        width={dimensions.w}
        height={dimensions.h}
        viewBox="0 0 900 600"
        className="rounded-xs shadow-xs border border-white/20 flex-shrink-0"
      >
        {/* Saffron Band */}
        <rect width="900" height="200" fill="#FF9933" />
        {/* White Band */}
        <rect y="200" width="900" height="200" fill="#FFFFFF" />
        {/* Green Band */}
        <rect y="400" width="900" height="200" fill="#138808" />
        {/* Ashoka Chakra Center */}
        <g transform="translate(450, 300)">
          {/* Outer Ring */}
          <circle r="85" fill="none" stroke="#000080" strokeWidth="12" />
          {/* Inner Hub */}
          <circle r="18" fill="#000080" />
          {/* 24 Spokes */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2="0"
              y2="-85"
              stroke="#000080"
              strokeWidth="5"
              transform={`rotate(${i * 15})`}
            />
          ))}
        </g>
      </svg>
      {showLabel && (
        <span className="hidden sm:inline text-[11px] font-semibold tracking-wide bg-gradient-to-r from-amber-500 via-slate-200 to-emerald-500 bg-clip-text text-transparent">
          INDIA
        </span>
      )}
    </div>
  );
}
