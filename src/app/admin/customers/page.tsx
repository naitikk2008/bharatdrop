'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users via simple fetch
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          // Extract unique customers from orders
          const map = new Map();
          d.orders.forEach((o: any) => {
            if (!map.has(o.customerPhone)) {
              map.set(o.customerPhone, {
                name: o.customerName,
                email: o.customerEmail,
                phone: o.customerPhone,
                orderCount: 1,
                totalSpent: o.totalAmount,
                lastOrder: o.createdAt,
              });
            } else {
              const existing = map.get(o.customerPhone);
              existing.orderCount += 1;
              existing.totalSpent += o.totalAmount;
            }
          });
          setCustomers(Array.from(map.values()));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-600" /> Customer Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Registered dropshipping customer accounts and order histories.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading customer accounts...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            No customer order history yet.
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Mobile Number</th>
                <th className="py-3 px-3">Orders Count</th>
                <th className="py-3 px-3">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-bold text-gray-900">{c.name}</td>
                  <td className="py-3 px-3 text-gray-600">{c.email}</td>
                  <td className="py-3 px-3 font-mono text-gray-800">{c.phone}</td>
                  <td className="py-3 px-3 font-bold text-orange-600">{c.orderCount} orders</td>
                  <td className="py-3 px-3 text-gray-500">{formatDate(c.lastOrder)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

