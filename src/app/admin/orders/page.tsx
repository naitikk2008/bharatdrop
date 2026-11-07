'use client';

import React, { useState, useEffect } from 'react';
import { formatINR, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  XCircle,
  ExternalLink,
  Edit2
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Update Status Modal
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [carrier, setCarrier] = useState('Delhivery Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('q', search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order: any) => {
    setActiveOrder(order);
    setNewStatus(order.orderStatus);
    setCarrier(order.shipments?.[0]?.carrier || 'Delhivery Express');
    setTrackingNumber(order.shipments?.[0]?.trackingNumber || `DLH-${Math.floor(100000000 + Math.random() * 900000000)}`);
  };

  const handleUpdateStatus = async () => {
    if (!activeOrder) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          orderStatus: newStatus,
          carrier,
          trackingNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setActiveOrder(null);
      }
    } catch (e) {
      alert('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-600" /> Order & Delivery Fulfillment
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track customer orders, update delivery milestones, dispatch tracking numbers, and manage cancellations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-orange-50 text-orange-800 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
          {['ALL', 'ORDER_PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-bold transition text-[11px] ${
                statusFilter === st ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pl-8 text-xs outline-none focus:border-orange-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No orders match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-3">Customer Details</th>
                  <th className="py-3 px-3">Items Summary</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Courier / AWB</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const addr = typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress;
                  const shipment = o.shipments?.[0];

                  return (
                    <tr key={o.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {o.orderNumber}
                        <span className="block text-[10px] font-sans font-normal text-gray-400">
                          {formatDate(o.createdAt)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900">{o.customerName}</p>
                        <p className="text-[10px] text-gray-500">{o.customerPhone}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{addr.city}, {addr.state} - {addr.pinCode}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-gray-800">{o.items?.length || 0} items</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[160px]">
                          {o.items?.map((i: any) => `${i.productName} (${i.quantity})`).join(', ')}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            o.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-700 block">{o.paymentMethod}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{o.paymentStatus}</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        {shipment ? (
                          <div>
                            <span className="font-bold text-gray-800 block text-[10px]">{shipment.carrier}</span>
                            <span className="text-orange-600">{shipment.trackingNumber}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not dispatched</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-black text-gray-900">
                        {formatINR(o.totalAmount)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openUpdateModal(o)}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Order Status & Add Tracking Modal */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Update Order Status
                </h3>
                <p className="text-[11px] text-gray-400">Order: {activeOrder.orderNumber}</p>
              </div>
              <button onClick={() => setActiveOrder(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-bold"
                >
                  <option value="ORDER_PLACED">ORDER PLACED</option>
                  <option value="CONFIRMED">CONFIRMED (Queued at Warehouse)</option>
                  <option value="PROCESSING">PROCESSING (Item Allocated)</option>
                  <option value="PACKED">PACKED (Ready for Courier)</option>
                  <option value="SHIPPED">SHIPPED (In Transit)</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Courier Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-medium"
                >
                  <option value="Delhivery Express">Delhivery Express</option>
                  <option value="Bluedart Courier">Bluedart Courier</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="DTDC India">DTDC India</option>
                  <option value="India Post EMS">India Post EMS</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">AWB / Courier Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DLH-9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleUpdateStatus}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition"
              >
                {updating ? 'Saving...' : 'Update & Notify Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

