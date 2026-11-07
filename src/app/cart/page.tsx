'use client';

import React, { useState } from 'react';
import { useCart } from '@/components/CartContext';
import { formatINR } from '@/lib/utils';
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Check
} from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const freeShippingThreshold = 499;
  const standardShippingFee = 49;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : (cart.length > 0 ? standardShippingFee : 0);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const total = Math.max(0, subtotal + shippingFee - discount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponMsg('');

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscount(data.discount);
        setCouponApplied(data.code);
        setCouponMsg(data.message);
      } else {
        setCouponError(data.error);
      }
    } catch (e) {
      setCouponError('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponApplied('');
    setCouponMsg('');
    setCouponCode('');
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 my-8 max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500 mb-6">
          Explore over 4,880+ catalogue products direct from wholesale suppliers at unbeatable prices.
        </p>
        <a
          href="/shop"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition inline-flex items-center gap-2 shadow-sm"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">
        Shopping Cart ({totalItems} items)
      </h1>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs">
        <div className="flex items-center justify-between mb-1.5 font-bold text-emerald-900">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            {amountToFreeShipping === 0
              ? '🎉 You unlocked FREE Delivery on this order!'
              : `Add ${formatINR(amountToFreeShipping)} more to qualify for FREE Delivery!`}
          </span>
          <span>{subtotal >= freeShippingThreshold ? '100%' : `${Math.round((subtotal / freeShippingThreshold) * 100)}%`}</span>
        </div>
        <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {cart.map((item) => (
            <div key={item.sku} className="p-4 sm:p-5 flex gap-4 items-center justify-between">
              <a
                href={`/product/${item.sku}`}
                className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 shrink-0 p-1 flex items-center justify-center overflow-hidden"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/products/images/0065.jpg';
                  }}
                />
              </a>

              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                  {item.categoryName} • SKU: {item.sku}
                </span>
                <a
                  href={`/product/${item.sku}`}
                  className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-orange-600 transition"
                >
                  {item.name}
                </a>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-black text-gray-900">
                    {formatINR(item.price)}
                  </span>
                  {item.mrp && item.mrp > item.price && (
                    <span className="text-[11px] text-gray-400 line-through">
                      {formatINR(item.mrp)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs">
                  <button
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                    className="px-2.5 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-bold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                    className="px-2.5 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.sku)}
                  aria-label="Remove item"
                  className="text-gray-400 hover:text-red-600 p-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-3">
              Order Summary
            </h3>

            {/* Coupon Code Input */}
            <div>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon Code (e.g. WELCOME10)"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 uppercase font-semibold"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800 transition whitespace-nowrap"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>

              {couponMsg && (
                <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center justify-between">
                  <span>✓ {couponMsg}</span>
                  <button onClick={removeCoupon} className="text-red-500 underline text-[10px]">Remove</button>
                </div>
              )}
              {couponError && (
                <p className="mt-2 text-xs text-red-600 font-medium">{couponError}</p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs pt-2 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-gray-900">{formatINR(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : formatINR(shippingFee)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({couponApplied})</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm sm:text-base font-black text-gray-900">
                <span>Total Amount</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            {/* Proceed to Checkout */}
            <a
              href={`/checkout?coupon=${encodeURIComponent(couponApplied)}`}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 px-4 rounded-xl text-center text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </a>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe and Secure 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

