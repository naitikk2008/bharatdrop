'use client';

import React from 'react';
import { ShieldCheck, Truck, Sparkles, Building } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed pb-16">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          About BharatDrop
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          India's Dedicated Dropshipping Platform Direct From Verified Wholesale Suppliers.
        </p>
      </div>

      <p className="text-sm text-gray-800 font-medium leading-relaxed">
        BharatDrop was established to eliminate unnecessary middlemen, distributors, and retailer markups by connecting Indian shoppers directly to premier B2B suppliers and manufacturing warehouses, including our primary catalogue supplier DeoDap.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-1">
          <Sparkles className="w-5 h-5 text-orange-600 mb-1" />
          <h3 className="font-bold text-gray-900 text-sm">4,880+ Catalogue Items</h3>
          <p className="text-gray-600 text-xs">
            From smart kitchen choppers to eco-friendly garbage rolls and household utilities.
          </p>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
          <h3 className="font-bold text-gray-900 text-sm">Verified Wholesale Pricing</h3>
          <p className="text-gray-600 text-xs">
            Direct-from-factory wholesale pricing passing huge margin savings directly to the customer.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">Our Operations Hub</h3>
        <p>
          Located in Rajkot, Gujarat—the manufacturing and wholesale capital of Indian household utility innovations—our dropship operations team processes, inspects, and dispatches thousands of consumer packages daily to all corners of India.
        </p>
      </div>
    </div>
  );
}

