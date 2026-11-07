'use client';

import React from 'react';
import { Truck, ShieldCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Truck className="w-6 h-6 text-orange-600" /> Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-gray-400 mt-1">Last updated: November 2026</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-sm">1. Delivery Coverage</h3>
        <p>
          BharatDrop delivers products across 28,000+ Indian PIN codes through certified tier-1 logistics partners including Delhivery, Blue Dart, Ecom Express, and India Post.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">2. Delivery Charges</h3>
        <p>
          • <strong>FREE Delivery:</strong> On all orders of ₹499 and above across India.<br />
          • <strong>Standard Delivery:</strong> Flat ₹49 shipping charge for orders below ₹499.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">3. Order Processing & Dispatch Timelines</h3>
        <p>
          All catalogue orders are routed directly to our wholesale hub in Rajkot, Gujarat. Orders are packed, barcode-verified, and dispatched within 24 to 48 business hours from order confirmation.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">4. Estimated Delivery Time</h3>
        <p>
          • Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata): 3–4 business days.<br />
          • Tier-2 & Tier-3 Cities: 4–6 business days.<br />
          • Rest of India & Remote locations: 6–8 business days.
        </p>

        <h3 className="font-bold text-gray-900 text-sm">5. Order Tracking</h3>
        <p>
          As soon as your package is dispatched, a real-time Air Waybill (AWB) tracking number is generated. You can track your shipment anytime via our <a href="/track/lookup" className="text-orange-600 font-bold underline">Order Tracking page</a>.
        </p>
      </div>
    </div>
  );
}

