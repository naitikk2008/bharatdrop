'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Search,
  XCircle
} from 'lucide-react';

const TIMELINE_STEPS = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Order details registered in database' },
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Verified and queued for warehouse packing' },
  { key: 'PROCESSING', label: 'Processing', desc: 'Item allocated at DeoDap warehouse hub' },
  { key: 'PACKED', label: 'Packed', desc: 'Quality checked and packed with secure shipping seal' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Handed over to courier partner' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier agent out for doorstep delivery' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Package safely delivered to customer' },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lookupInput, setLookupInput] = useState('');
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found cheaper elsewhere');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (!orderId || orderId === 'lookup') {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.order);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupInput.trim()) {
      router.push(`/track/${lookupInput.trim()}`);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccess(true);
        setOrder(data.order);
        setTimeout(() => setCancelModal(false), 2000);
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (e) {
      alert('Error cancelling order');
    } finally {
      setCancelLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.orderStatus === 'CANCELLED') return -1;
    const idx = TIMELINE_STEPS.findIndex((s) => s.key === order.orderStatus);
    return idx !== -1 ? idx : 0;
  };

  const currentIdx = getCurrentStepIndex();

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header & Lookup Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-orange-600" />
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Order Delivery Tracking
          </h1>
        </div>

        <form onSubmit={handleLookup} className="flex gap-2 text-xs">
          <input
            type="text"
            value={lookupInput}
            onChange={(e) => setLookupInput(e.target.value)}
            placeholder="Search by Order ID or Order Number (e.g. BD-123456-7890)"
            className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-orange-500 font-medium"
          />
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" /> Track
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-12 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 font-semibold">Retrieving tracking records...</p>
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Order Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-400 font-semibold">Tracking Order</span>
              <h2 className="text-xl font-black text-gray-900 tracking-wider">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Placed on {formatDate(order.createdAt)} • Total: {formatINR(order.totalAmount)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {order.orderStatus === 'CANCELLED' ? (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Cancelled
                </span>
              ) : (
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {order.orderStatus.replace(/_/g, ' ')}
                </span>
              )}

              {/* Cancel Button if eligible */}
              {!['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus) && (
                <button
                  onClick={() => setCancelModal(true)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Cancellation Notice if cancelled */}
          {order.orderStatus === 'CANCELLED' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 space-y-1">
              <p className="font-bold">This order was cancelled.</p>
              <p>Reason: {order.cancellationReason || 'Requested by customer'}</p>
              {order.paymentStatus === 'REFUNDED' && (
                <p className="font-semibold text-emerald-700">✓ Refund has been processed to your original payment method.</p>
              )}
            </div>
          )}

          {/* Interactive Visual Timeline */}
          {order.orderStatus !== 'CANCELLED' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider pb-2 border-b border-gray-100">
                Delivery Timeline
              </h3>

              <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                          isDone
                            ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent ? 'text-orange-600' : isDone ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Current Status
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Courier info if present */}
              {order.shipments && order.shipments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 bg-gray-50 p-4 rounded-xl text-xs flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Courier Partner</span>
                    <strong className="text-gray-900">{order.shipments[0].carrier}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Air Waybill (AWB) / Tracking #</span>
                    <strong className="text-orange-600 font-mono tracking-wider">{order.shipments[0].trackingNumber}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Items Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-2">
              Package Contents
            </h3>

            <div className="divide-y divide-gray-100 text-xs">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{item.productName}</p>
                    <p className="text-[11px] text-gray-500">
                      SKU: {item.sku} • Quantity: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">{formatINR(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-gray-900">Cancel Order {order.orderNumber}?</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to cancel this order? If you paid online via Razorpay or UPI, a full refund will be processed back to your source account.
            </p>

            <div className="text-xs space-y-1">
              <label className="block text-gray-700 font-semibold">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
              >
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Need to change delivery address">Need to change delivery address</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Other reasons">Other reasons</option>
              </select>
            </div>

            {cancelSuccess && (
              <p className="text-emerald-700 text-xs font-bold">Order cancelled successfully!</p>
            )}

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

