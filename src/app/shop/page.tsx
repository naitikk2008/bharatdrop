'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Search
} from 'lucide-react';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 1 });
  const [filterDrawer, setFilterDrawer] = useState(false);

  // Filters from query
  const currentQuery = searchParams.get('q') || '';
  const currentCat = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'popular';
  const currentFilter = searchParams.get('filter') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (e) {}
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get('limit')) params.set('limit', '24');
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error('Fetch products error:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // reset page
    router.push(`/shop?${params.toString()}`);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/shop?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {currentCat !== 'All' ? currentCat : currentQuery ? `Search: "${currentQuery}"` : 'All Catalogue Products'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing {products.length} of {pagination.total} wholesale products direct from supplier
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterDrawer(true)}
            className="md:hidden flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-2 rounded-lg"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-orange-500"
            >
              <option value="popular">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-6 shrink-0">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-orange-600" /> Filters
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-semibold text-orange-600 hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Quick Preset Stores */}
          <div>
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-2.5">Budget Stores</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => updateParam('filter', currentFilter === 'under199' ? '' : 'under199')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
                  currentFilter === 'under199' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                ⚡ Under ₹199 Store
              </button>
              <button
                onClick={() => updateParam('filter', currentFilter === 'under499' ? '' : 'under499')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
                  currentFilter === 'under499' ? 'bg-amber-100 text-amber-800 font-bold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                🔥 Under ₹499 Store
              </button>
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-2.5">Categories</h4>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1 text-xs">
              <button
                onClick={() => updateParam('category', 'All')}
                className={`w-full text-left px-2 py-1.5 rounded-md font-medium transition ${
                  currentCat === 'All' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                All Categories ({pagination.total})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.name)}
                  className={`w-full text-left px-2 py-1.5 rounded-md flex justify-between items-center transition ${
                    currentCat === c.name ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="truncate pr-2">{c.name}</span>
                  <span className={`text-[10px] ${currentCat === c.name ? 'text-white' : 'text-gray-400'}`}>
                    {c.productCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-xs text-gray-500 mb-4">Try clearing filters or search for another term.</p>
              <button
                onClick={clearAllFilters}
                className="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-orange-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((p) => (
                  <ProductCard key={p.sku} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => changePage(pagination.page - 1)}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => changePage(pageNum)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                            pagination.page === pageNum
                              ? 'bg-orange-600 text-white font-bold'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => changePage(pagination.page + 1)}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading shop catalogue...</div>}>
      <ShopContent />
    </Suspense>
  );
}

