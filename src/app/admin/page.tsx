'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingAll, setApprovingAll] = useState(false);
  const [approveMsg, setApproveMsg] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders'),
      ]);
      const [statsData, ordersData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setRecentOrders(ordersData.orders.slice(0, 8));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm('Are you sure you want to approve all draft catalogue products to make them live on the storefront?')) return;
    setApprovingAll(true);
    try {
      const res = await fetch('/api/admin/products/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allDrafts: true }),
      });
      const data = await res.json();
      if (data.success) {
        setApproveMsg(data.message);
        loadDashboard();
      }
    } catch (e) {
      alert('Error approving products');
    } finally {
      setApprovingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-gray-500 font-semibold">Loading owner analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
            Owner Mission Control
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-2">
            DeoDap Dropship Store Overview
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Supplier catalogue imported with private wholesale costs. Customer prices configured with target margins.
          </p>
        </div>

        {stats?.draftProducts > 0 && (
          <button
            onClick={handleApproveAll}
            disabled={approvingAll}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-orange-900/30 whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            {approvingAll ? 'Publishing...' : `Approve All ${stats.draftProducts} Drafts`}
          </button>
        )}
      </div>

      {approveMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{approveMsg}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Customer Sales</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{formatINR(stats?.totalRevenue || 0)}</p>
          <p className="text-[10px] text-gray-400">Total processed revenue</p>
        </div>

        {/* Estimated Profit */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Estimated Profit</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600">{formatINR(stats?.estimatedProfit || 0)}</p>
          <p className="text-[10px] text-gray-400">Margin: {stats?.profitMargin || 0}% avg</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Total Orders</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.totalOrders || 0}</p>
          <p className="text-[10px] text-orange-600 font-semibold">{stats?.pendingOrders || 0} pending fulfillment</p>
        </div>

        {/* Catalogue Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Imported Products</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.totalProducts || 0}</p>
          <p className="text-[10px] text-gray-400">
            {stats?.approvedProducts || 0} Live • {stats?.draftProducts || 0} Drafts
          </p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/products"
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-orange-300 hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition">
            Catalogue & Pricing Calculator
          </h3>
          <p className="text-xs text-gray-500">
            Review 4,889 catalogue products, adjust customer markups, and verify supplier costs.
          </p>
        </a>

        <a
          href="/admin/orders"
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-orange-300 hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition">
            Orders & Tracking Management
          </h3>
          <p className="text-xs text-gray-500">
            Update order lifecycle, add courier tracking numbers, and manage cancellations.
          </p>
        </a>

        <a
          href="/admin/suppliers"
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-orange-300 hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition">
            Supplier Fulfillment (DeoDap)
          </h3>
          <p className="text-xs text-gray-500">
            View supplier purchase orders, check item availability, and dispatch logs.
          </p>
        </a>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">
            Recent Customer Orders
          </h3>
          <a
            href="/admin/orders"
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No customer orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5">Order Number</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Payment</th>
                  <th className="py-2.5">Total Amount</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                    <td className="py-3">
                      <p className="font-semibold text-gray-800">{o.customerName}</p>
                      <p className="text-[10px] text-gray-400">{o.customerPhone}</p>
                    </td>
                    <td className="py-3">
                      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-gray-600">{o.paymentMethod}</span>
                    </td>
                    <td className="py-3 font-bold text-gray-900">{formatINR(o.totalAmount)}</td>
                    <td className="py-3 text-right">
                      <a
                        href="/admin/orders"
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Manage →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

