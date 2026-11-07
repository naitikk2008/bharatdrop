'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatINR, formatDate } from '@/lib/utils';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  MapPin,
  CreditCard,
  Printer
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.order);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-gray-500 font-semibold">Generating order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 my-8 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <a href="/shop" className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-lg">
          Return to Shop
        </a>
      </div>
    );
  }

  const address = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Success Hero */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Order Successfully Placed!
        </h1>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          Thank you for shopping with BharatDrop. Your order has been registered and routed directly to the wholesale supplier for fulfillment.
        </p>

        <div className="inline-block bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 mt-2">
          <span className="text-xs text-gray-500 block">Order Reference Number:</span>
          <span className="text-base font-black text-orange-600 tracking-wider">
            {order.orderNumber}
          </span>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`/track/${order.id}`}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Truck className="w-4 h-4" /> Track Order Delivery
          </a>
          <a
            href="/orders"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> View My Orders
          </a>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">
            Order Details
          </h3>
          <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
        </div>

        {/* Purchased Products */}
        <div className="divide-y divide-gray-100 text-xs">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">{item.productName}</p>
                <p className="text-[11px] text-gray-500">
                  SKU: {item.sku} • Qty: {item.quantity} × {formatINR(item.price)}
                </p>
              </div>
              <span className="font-black text-gray-900">{formatINR(item.total)}</span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900">{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="font-bold text-gray-900">
              {order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Discount</span>
              <span>- {formatINR(order.discount)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-gray-900">
            <span>Final Paid / Payable</span>
            <span>{formatINR(order.totalAmount)}</span>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-600" /> Delivery Address
            </h4>
            <p className="font-semibold text-gray-800">{address.fullName || order.customerName}</p>
            <p className="text-gray-600">{address.addressLine1}</p>
            {address.addressLine2 && <p className="text-gray-600">{address.addressLine2}</p>}
            <p className="text-gray-600">{address.city}, {address.state} - {address.pinCode}</p>
            <p className="text-gray-600 mt-1 font-medium">Phone: {address.phone || order.customerPhone}</p>
          </div>

          <div className="p-4 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" /> Payment & Status
            </h4>
            <p className="text-gray-600">Method: <strong>{order.paymentMethod}</strong></p>
            <p className="text-gray-600">Payment Status: <strong className="text-emerald-700">{order.paymentStatus}</strong></p>
            <p className="text-gray-600">Order Status: <strong className="text-orange-600">{order.orderStatus}</strong></p>
            <p className="text-[11px] text-gray-400 mt-2">
              An invoice notification has been logged for this purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

