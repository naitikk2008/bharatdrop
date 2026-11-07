'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Package,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Search
} from 'lucide-react';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneLookup, setPhoneLookup] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async (phone?: string) => {
    setLoading(true);
    try {
      let url = '/api/orders';
      if (phone) {
        url += `?phone=${phone.trim()}`;
      } else if (user?.phone) {
        url += `?phone=${user.phone}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneLookup.trim()) {
      fetchOrders(phoneLookup);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            My Orders & Deliveries
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track past and active orders across Delhivery, Bluedart, and Ecom Express.
          </p>
        </div>

        {/* Quick Phone Lookup if guest */}
        {!user && (
          <form onSubmit={handlePhoneSearch} className="flex gap-2 text-xs">
            <input
              type="tel"
              value={phoneLookup}
              onChange={(e) => setPhoneLookup(e.target.value)}
              placeholder="Enter mobile number"
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-2 rounded-lg"
            >
              Search
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 font-semibold">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-md mx-auto">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
          <p className="text-xs text-gray-500 mb-4">
            You haven't placed any orders yet. Discover our wholesale dropship catalogue!
          </p>
          <a
            href="/shop"
            className="bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition inline-block"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4 hover:border-orange-200 transition"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs">
                <div>
                  <span className="font-bold text-gray-900 text-sm">
                    Order {order.orderNumber}
                  </span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Placed on {formatDate(order.createdAt)} • Payment: {order.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      order.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="divide-y divide-gray-50 text-xs">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{item.productName}</p>
                      <p className="text-[11px] text-gray-400">
                        SKU: {item.sku} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">{formatINR(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 text-xs">
                <a
                  href={`/track/${order.id}`}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" /> Track Delivery
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

