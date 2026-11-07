'use client';

import React, { useState, useEffect } from 'react';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import {
  Sparkles,
  Flame,
  Tag,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Package,
  Clock,
  Layers
} from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [under199Products, setUnder199Products] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featRes, trendRes, budgetRes, catRes] = await Promise.all([
          fetch('/api/products?filter=featured&limit=8'),
          fetch('/api/products?filter=trending&limit=8'),
          fetch('/api/products?filter=under199&limit=8'),
          fetch('/api/categories'),
        ]);

        const [featData, trendData, budgetData, catData] = await Promise.all([
          featRes.json(),
          trendRes.json(),
          budgetRes.json(),
          catRes.json(),
        ]);

        if (featData.success) setFeaturedProducts(featData.products);
        if (trendData.success) setTrendingProducts(trendData.products);
        if (budgetData.success) setUnder199Products(budgetData.products);
        if (catData.success) setCategories(catData.categories.slice(0, 12));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-10 pb-12">
      {/* 1. Main Hero Carousel */}
      <BannerCarousel />

      {/* 2. Top Categories Visual Grid */}
      <section className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Popular Catalogue Categories
            </h2>
          </div>
          <a
            href="/categories"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            All 58 Categories <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/shop?category=${encodeURIComponent(c.name)}`}
              className="group flex flex-col items-center p-3 rounded-xl hover:bg-orange-50 border border-gray-100 hover:border-orange-200 transition text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-100/60 flex items-center justify-center mb-2 overflow-hidden group-hover:scale-110 transition-transform shadow-inner">
                <span className="text-xl sm:text-2xl font-black text-orange-700">
                  {c.name.charAt(0)}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition">
                {c.name}
              </span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                {c.productCount} Items
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 3. Featured Dropship Deals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Featured Factory Deals
            </h2>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ml-1">
              Supplier Verified
            </span>
          </div>
          <a
            href="/shop?filter=featured"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Banner - Under ₹199 Store */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
            Budget Saver
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            The ₹199 & Under Wholesale Corner
          </h3>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-lg">
            High utility household essentials, garbage rolls, choppers, and stationery starting from just ₹89.
          </p>
        </div>
        <a
          href="/shop?filter=under199"
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-extrabold px-6 py-3 rounded-xl shadow-md transition text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap"
        >
          Explore Under ₹199 →
        </a>
      </div>

      {/* 5. Under ₹199 Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Budget Finds Under ₹199
            </h2>
          </div>
          <a
            href="/shop?filter=under199"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {under199Products.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      </section>

      {/* 6. Trending Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Trending Dropship Bestsellers
            </h2>
            <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ml-1">
              High Demand
            </span>
          </div>
          <a
            href="/shop?filter=trending"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {trendingProducts.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      </section>

      {/* 7. How BharatDrop Works (Indian Dropshipping Transparency) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200">
        <h3 className="text-center text-xl font-black text-gray-900 mb-2">
          How BharatDrop Dropshipping Works
        </h3>
        <p className="text-center text-xs text-gray-500 max-w-xl mx-auto mb-8">
          We connect consumers directly with verified wholesale warehouses like DeoDap, eliminating multi-layer middlemen markups.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
            <div className="w-12 h-12 bg-orange-600 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-3 shadow">
              1
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Place Your Order</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Browse 4,880+ catalogue products and checkout via UPI, Cards or Cash on Delivery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="w-12 h-12 bg-blue-600 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-3 shadow">
              2
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Supplier Packed & Dispatched</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Order routes directly to the certified warehouse for barcode verification, packaging, and dispatch.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-600 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-3 shadow">
              3
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Doorstep Delivery</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Fast courier tracking (Delhivery/Bluedart) with 7-Day easy replacement guarantee.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

