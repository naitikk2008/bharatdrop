'use client';

import React from 'react';
import { XCircle, RotateCcw } from 'lucide-react';

export default function CancellationPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <XCircle className="w-6 h-6 text-red-600" /> Cancellation Policy
        </h1>
        <p className="text-xs text-gray-400 mt-1">Fair & Transparent Consumer Cancellation Rules</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-sm">1. Cancellation Window</h3>
        <p>
          You can cancel any order free of charge at any time before the package has been handed over to the courier partner (i.e., while status is <strong>Order Placed</strong>, <strong>Confirmed</strong>, or <strong>Processing</strong>).
        </p>

        <h3 className="font-bold text-gray-900 text-sm">2. How to Cancel</h3>
        <p>
          1. Go to your <a href="/orders" className="text-orange-600 font-bold underline">My Orders</a> page.<br />
          2. Click on the order you wish to cancel.<br />
          3. Click the <strong>Cancel Order</strong> button, select your cancellation reason, and confirm.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">3. Post-Dispatch Cancellations</h3>
        <p>
          Once an order has been dispatched and assigned an active courier tracking number, it cannot be cancelled in-flight. However, you may refuse delivery at your doorstep or initiate a 7-day return request upon arrival.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">4. Refund for Cancelled Orders</h3>
        <p>
          If you made an advance online payment via Razorpay, Google Pay, PhonePe, or Cards, a full 100% refund is automatically initiated to your original payment source within 24 hours (funds reflect in your bank account in 2–5 business days).
        </p>
      </div>
    </div>
  );
}

