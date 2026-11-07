'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Calculator,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);
  const [editMarkupPercent, setEditMarkupPercent] = useState<number>(75);
  const [editStock, setEditStock] = useState<number>(50);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, categoryFilter, searchQuery, page]);

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
      const params = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        q: searchQuery,
        page: page.toString(),
        limit: '30',
      });
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApprove = async (product: any) => {
    try {
      const newStatus = !product.isApproved;
      const res = await fetch('/api/admin/products/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: [product.id],
          action: newStatus ? 'approve' : 'reject',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, isApproved: newStatus, status: newStatus ? 'APPROVED' : 'DRAFT' } : p
          )
        );
      }
    } catch (e) {
      alert('Error updating approval status');
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditSellingPrice(product.sellingPrice);
    const markup = product.supplierCost > 0
      ? Math.round(((product.sellingPrice - product.supplierCost) / product.supplierCost) * 100)
      : 75;
    setEditMarkupPercent(markup);
    setEditStock(product.stock);
  };

  const handleMarkupChange = (percent: number) => {
    setEditMarkupPercent(percent);
    if (editingProduct && editingProduct.supplierCost > 0) {
      const calculated = Math.round(editingProduct.supplierCost * (1 + percent / 100));
      // End in 9
      const rounded = Math.round(calculated / 10) * 10 - 1;
      setEditSellingPrice(Math.max(editingProduct.supplierCost + 10, rounded));
    }
  };

  const handleSaveProductEdit = async () => {
    if (!editingProduct) return;
    setEditSaving(true);
    try {
      const res = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          sellingPrice: editSellingPrice,
          mrp: Math.round(editSellingPrice * 1.35),
          stock: editStock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  sellingPrice: editSellingPrice,
                  stock: editStock,
                  profit: editSellingPrice - p.supplierCost,
                  margin: Math.round(((editSellingPrice - p.supplierCost) / editSellingPrice) * 100),
                }
              : p
          )
        );
        setEditingProduct(null);
      }
    } catch (e) {
      alert('Error saving product changes');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-600" /> Catalogue & Pricing Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Private wholesale supplier costs vs public customer selling prices for all 4,889 catalogue entries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-orange-50 text-orange-800 border border-orange-200 px-3 py-1.5 rounded-lg font-bold">
            Total in Catalogue: {pagination.total}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => { setStatusFilter('ALL'); setPage(1); }}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => { setStatusFilter('DRAFT'); setPage(1); }}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              statusFilter === 'DRAFT' ? 'bg-orange-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Drafts (Pending Approval)
          </button>
          <button
            onClick={() => { setStatusFilter('APPROVED'); setPage(1); }}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Live Approved
          </button>
        </div>

        {/* Category & Search Filter */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none max-w-[160px] truncate"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name} ({c.productCount})</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by SKU or Title..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pl-8 text-xs outline-none focus:border-orange-500 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading catalogue products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No products match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Item / Image</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 bg-red-50/50 text-red-900">Supplier Wholesale Cost</th>
                  <th className="py-3 px-3 bg-emerald-50/50 text-emerald-900">Customer Selling Price</th>
                  <th className="py-3 px-3">Profit & Margin</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition">
                    {/* Item Image & Title */}
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 object-contain rounded-lg bg-gray-50 border border-gray-100 shrink-0 p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/images/0065.jpg';
                        }}
                      />
                      <div className="max-w-xs">
                        <span className="font-bold text-gray-900 line-clamp-1" title={p.name}>
                          {p.name}
                        </span>
                        <span className="text-[10px] text-gray-400">PDF Page {p.pageNumber || 'N/A'}</span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-3 font-mono font-bold text-gray-800">
                      {p.sku}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-gray-600 truncate max-w-[120px]">
                      {p.categoryName}
                    </td>

                    {/* Private Wholesale Supplier Cost */}
                    <td className="py-3 px-3 font-black text-red-700 bg-red-50/30">
                      {formatINR(p.supplierCost)}
                    </td>

                    {/* Customer Selling Price */}
                    <td className="py-3 px-3 font-black text-emerald-700 bg-emerald-50/30">
                      {formatINR(p.sellingPrice)}
                    </td>

                    {/* Profit */}
                    <td className="py-3 px-3 font-bold text-blue-700">
                      +{formatINR(p.profit)} <span className="text-[10px] text-gray-400">({p.margin}%)</span>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-3 font-semibold text-gray-800">
                      {p.stock} units
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {p.isApproved ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleApprove(p)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition ${
                          p.isApproved
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {p.isApproved ? 'Unpublish' : 'Approve'}
                      </button>

                      <button
                        onClick={() => openEditModal(p)}
                        className="bg-gray-100 hover:bg-orange-100 hover:text-orange-700 text-gray-700 p-1 rounded-md transition inline-block align-middle"
                        title="Edit Price & Markup"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold bg-gray-50">
            <span className="text-gray-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Automatic Price Calculator & Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Price Calculator & Product Editor
                </h3>
                <p className="text-[11px] text-gray-400">SKU: {editingProduct.sku} • {editingProduct.name}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Pricing Formula Breakdown */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-semibold">Private Supplier Cost (DeoDap):</span>
                <span className="text-base font-black text-red-700">
                  {formatINR(editingProduct.supplierCost)}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-gray-700 mb-1">
                  <span className="font-semibold">Desired Markup:</span>
                  <span className="font-black text-orange-700">{editMarkupPercent}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={editMarkupPercent}
                  onChange={(e) => handleMarkupChange(parseInt(e.target.value))}
                  className="w-full accent-orange-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>+10%</span>
                  <span>+50%</span>
                  <span>+75% (Std)</span>
                  <span>+100% (2x)</span>
                  <span>+200%</span>
                </div>
              </div>

              <div className="border-t border-orange-200/80 pt-2 flex justify-between items-center">
                <span className="font-bold text-gray-900">Calculated Customer Price:</span>
                <div className="text-right">
                  <input
                    type="number"
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-28 text-right font-black text-base px-2 py-1 border border-orange-300 rounded bg-white text-emerald-700 outline-none"
                  />
                  <span className="text-[10px] text-gray-500 block">
                    Profit: +{formatINR(editSellingPrice - editingProduct.supplierCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Editor */}
            <div className="text-xs space-y-1">
              <label className="block text-gray-700 font-semibold">Available Wholesale Stock</label>
              <input
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editSaving}
                onClick={handleSaveProductEdit}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition shadow-sm"
              >
                {editSaving ? 'Saving...' : 'Save & Update Selling Price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

