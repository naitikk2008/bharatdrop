'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, Shield, Sparkles } from 'lucide-react';

const BANNERS = [
  {
    id: 1,
    title: 'Direct Wholesale Dropshipping',
    subtitle: 'Over 4,880+ Actual Catalogue Items Direct from Supplier',
    tag: 'FESTIVE WHOLESALE SALE',
    discount: 'UP TO 70% OFF',
    bgColor: 'from-orange-600 via-amber-600 to-yellow-500',
    btnText: 'Shop Best Sellers',
    btnLink: '/shop?filter=best_seller',
  },
  {
    id: 2,
    title: 'Kitchen & Home Utilities Store',
    subtitle: 'Choppers, Bag Sealers, Storage, Vegetable Cutters & More',
    tag: 'BUDGET DEALS',
    discount: 'STARTING AT ₹89',
    bgColor: 'from-blue-700 via-indigo-700 to-purple-800',
    btnText: 'Explore Kitchen Deals',
    btnLink: '/shop?category=Kitchen%20Accessories',
  },
  {
    id: 3,
    title: 'Cash on Delivery Across 28,000+ PIN Codes',
    subtitle: 'Fast dispatch, 7-Day Easy Replacement Guarantee',
    tag: 'TRUSTED PAN-INDIA',
    discount: 'FREE DELIVERY OVER ₹499',
    bgColor: 'from-emerald-700 via-teal-700 to-cyan-800',
    btnText: 'View All 58 Categories',
    btnLink: '/categories',
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const b = BANNERS[current];

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg my-4">
      <div className={`bg-gradient-to-r ${b.bgColor} text-white p-6 sm:p-10 transition-all duration-700 relative min-h-[220px] sm:min-h-[280px] flex flex-col justify-center`}>
        {/* Background decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/10 blur-3xl rounded-full transform translate-x-1/3"></div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>{b.tag}</span>
            <span className="text-yellow-300 ml-1">• {b.discount}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            {b.title}
          </h2>

          <p className="text-sm sm:text-base text-white/90 mb-6 font-medium">
            {b.subtitle}
          </p>

          <div className="flex items-center gap-3">
            <a
              href={b.btnLink}
              className="bg-white text-gray-900 hover:bg-yellow-400 font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm transform hover:scale-105"
            >
              {b.btnText} →
            </a>
            <a
              href="/shop?filter=under199"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold px-4 py-2.5 rounded-xl transition text-xs sm:text-sm"
            >
              Under ₹199 Store
            </a>
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)}
        aria-label="Previous banner"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrent((prev) => (prev + 1) % BANNERS.length)}
        aria-label="Next banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

