'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { formatINR, INDIAN_STATES } from '@/lib/utils';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const couponCode = searchParams.get('coupon') || '';

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [pinCode, setPinCode] = useState('360001');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');

  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const freeShippingThreshold = 499;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 49;

  useEffect(() => {
    if (couponCode) {
      fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setDiscount(d.discount);
        })
        .catch(() => {});
    }
  }, [couponCode, subtotal]);

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 my-8 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cart is empty</h2>
        <p className="text-xs text-gray-500 mb-4">Please add products before checking out.</p>
        <a href="/shop" className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-lg">
          Shop Products
        </a>
      </div>
    );
  }

  const finalTotal = Math.max(0, subtotal + shippingFee - discount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !pinCode.trim()) {
      setErrorMsg('Please fill in all delivery address details.');
      return;
    }

    if (phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (pinCode.length < 6) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customerName: fullName.trim(),
        customerEmail: email.trim() || `${phone}@bharatdrop.in`,
        customerPhone: phone.trim(),
        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          pinCode,
        },
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY_ONLINE',
        couponCode: couponCode || undefined,
        items: cart.map((i) => ({
          sku: i.sku,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      const createdOrder = data.order;

      // Handle payment routing
      if (paymentMethod === 'RAZORPAY') {
        // Initiate Razorpay order
        const rzpRes = await fetch('/api/payment/razorpay-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: createdOrder.id }),
        });
        const rzpData = await rzpRes.json();

        // Verify or complete
        await fetch('/api/payment/razorpay-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: createdOrder.id,
            razorpay_order_id: rzpData.rzpOrderId,
            razorpay_payment_id: `pay_${Date.now()}`,
          }),
        });
      }

      // Clear local cart
      clearCart();
      router.push(`/order-confirmation/${createdOrder.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error processing checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">
        Checkout & Secure Payment
      </h1>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Address & Payment Selection (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-600" /> 1. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For tracking updates and invoice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Flat / House No. / Building / Street *</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. 402, Shivalik Heights, 150ft Ring Road"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Area / Landmark</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Near Hanuman Temple"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Rajkot / Ahmedabad / Mumbai"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">PIN Code (6 digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 360001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-600" /> 2. Select Payment Method
            </h3>

            <div className="space-y-3">
              {/* Cash on Delivery option */}
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-xs sm:text-sm block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-gray-500">Pay cash or UPI at your doorstep upon delivery</span>
                  </div>
                </div>
                <Banknote className="w-6 h-6 text-emerald-600" />
              </label>

              {/* Online Payment via Razorpay */}
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'RAZORPAY' ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-xs sm:text-sm block">Online UPI / Cards / Net Banking</span>
                    <span className="text-[11px] text-gray-500">Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard</span>
                  </div>
                </div>
                <CreditCard className="w-6 h-6 text-blue-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Review & Place Order Button (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-3">
              Order Items ({cart.length})
            </h3>

            <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 text-xs pr-1">
              {cart.map((item) => (
                <div key={item.sku} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded bg-gray-50 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 whitespace-nowrap">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">{formatINR(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : formatINR(shippingFee)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-black text-gray-900">
                <span>Total Payable</span>
                <span>{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-xl text-center text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition"
            >
              {isSubmitting ? (
                <>Processing Order...</>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Place Order ({formatINR(finalTotal)})
                </>
              )}
            </button>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Doorstep Verification & 7-Day Replacement Guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

