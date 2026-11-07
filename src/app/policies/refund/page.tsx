'use client';

import React from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-emerald-600" /> Returns & Refund Policy
        </h1>
        <p className="text-xs text-gray-400 mt-1">7 Days Easy Doorstep Replacement Guarantee</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-sm">1. 7-Day Easy Replacement</h3>
        <p>
          We offer a hassle-free 7-day replacement policy for items received in damaged, defective, wrong, or physically incomplete condition. The 7-day window begins on the date of delivery.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">2. Return Eligibility Criteria</h3>
        <p>
          • The product must be in its original condition with original packaging, tags, accessories, and user manual intact.<br />
          • For damaged/defective items, please share a quick photo or unboxing video with our support team at <strong>support@bharatdrop.in</strong>.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">3. Refund Processing</h3>
        <p>
          • <strong>Prepaid Orders (UPI / Cards / Net Banking):</strong> 100% of the purchase amount is refunded to your source bank account within 3–5 working days.<br />
          • <strong>Cash on Delivery (COD) Orders:</strong> Refunds for COD orders are transferred directly via UPI (Google Pay / PhonePe) or IMPS bank transfer after verification.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">4. Customer Support Desk</h3>
        <p>
          Email: support@bharatdrop.in<br />
          Helpline: +91 96246 66631 (Monday to Saturday, 10:00 AM – 7:00 PM IST)
        </p>
      </div>
    </div>
  );
}

