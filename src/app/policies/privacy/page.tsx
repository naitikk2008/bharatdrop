'use client';

import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" /> Privacy & Data Security Policy
        </h1>
        <p className="text-xs text-gray-400 mt-1">Compliant with the Digital Personal Data Protection (DPDP) Act, India</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-sm">1. Commitment to Data Privacy</h3>
        <p>
          At BharatDrop, we respect your privacy. We only collect the minimal personal information required to safely process and deliver your orders (your full name, contact phone number, delivery address, and email for notifications).
        </p>

        <h3 className="font-bold text-gray-900 text-sm">2. Private Wholesale Pricing Integrity</h3>
        <p>
          Internal supplier wholesale pricing, cost formulas, and wholesale discounts remain strictly private within encrypted administrative access controls and are never exposed across public APIs, client-side bundles, or third parties.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">3. Payment Information Security</h3>
        <p>
          We never store your credit/debit card numbers, CVVs, or UPI PINs. All online payments are handled directly by PCI-DSS compliant payment gateways (Razorpay) over 256-bit SSL encrypted channels.
        </p>
      </div>
    </div>
  );
}

