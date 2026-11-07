'use client';

import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, Search } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              All 58 Catalogue Categories
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Browse through 4,880+ wholesale catalogue items categorized for effortless dropshipping discovery.
          </p>
        </div>

        {/* Search within categories */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter categories..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-orange-500 pl-9"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((c) => (
            <a
              key={c.id}
              href={`/shop?category=${encodeURIComponent(c.name)}`}
              className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col items-center text-center justify-between"
            >
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
                <span className="text-2xl font-black text-orange-700">
                  {c.name.charAt(0)}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-orange-600 transition">
                  {c.name}
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {c.productCount} Products
                </p>
              </div>

              <span className="text-[10px] font-bold text-orange-600 mt-3 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

