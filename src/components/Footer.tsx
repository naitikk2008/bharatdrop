'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-gray-900 text-gray-300 text-xs font-sans mt-16 pb-16 lg:pb-0">
      {/* 1. Value Proposition Banner */}
      <div className="border-b border-gray-800 py-8 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20 text-orange-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Pan-India Delivery</h4>
              <p className="text-gray-400 text-[11px]">Free shipping above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">7-Day Replacement</h4>
              <p className="text-gray-400 text-[11px]">Easy doorstep exchange</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Direct From Supplier</h4>
              <p className="text-gray-400 text-[11px]">100% verified authentic stock</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Cash on Delivery</h4>
              <p className="text-gray-400 text-[11px]">Pay when you receive</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div>
          <span className="text-2xl font-black text-white flex items-center gap-1">
            Bharat<span className="text-orange-500">Drop</span>
          </span>
          <p className="mt-3 text-gray-400 leading-relaxed text-xs">
            India's dedicated dropshipping marketplace delivering 4,880+ catalogue products direct from wholesale suppliers to your doorstep at unbeatable factory prices.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Pan-India Fulfillment Network, India</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              <span>support@bharatdrop.in</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>+91 96246 66631 (Mon - Sat 10AM - 7PM)</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Shop & Categories</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/shop" className="hover:text-white transition">All Products</a></li>
            <li><a href="/categories" className="hover:text-white transition">58 Categories</a></li>
            <li><a href="/shop?category=Kitchen%20Accessories" className="hover:text-white transition">Kitchen Appliances</a></li>
            <li><a href="/shop?category=House%20Hold" className="hover:text-white transition">Household Utilities</a></li>
            <li><a href="/shop?filter=under199" className="hover:text-white transition">Under ₹199 Store</a></li>
            <li><a href="/shop?filter=under499" className="hover:text-white transition">Under ₹499 Store</a></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/track/lookup" className="hover:text-white transition">Track Delivery</a></li>
            <li><a href="/orders" className="hover:text-white transition">My Orders</a></li>
            <li><a href="/wishlist" className="hover:text-white transition">My Wishlist</a></li>
            <li><a href="/policies/cancellation" className="hover:text-white transition">Cancellation Policy</a></li>
            <li><a href="/policies/refund" className="hover:text-white transition">Refund & Returns</a></li>
            <li><a href="/policies/shipping" className="hover:text-white transition">Shipping Policy</a></li>
            <li><a href="/contact" className="hover:text-white transition">Contact Us</a></li>
          </ul>
        </div>

        {/* Payment & Security */}
        <div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Payment & Trust</h4>
          <p className="text-gray-400 mb-3 text-xs">
            100% Safe & Secure payment processing through Razorpay and verified Indian payment rails.
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-300">
            <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">UPI / QR</span>
            <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">Google Pay</span>
            <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">PhonePe</span>
            <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">Paytm</span>
            <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">RuPay</span>
            <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">Visa / MC</span>
            <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">Cash on Delivery</span>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-orange-400 transition text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner Admin Portal
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-4 text-center text-gray-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 BharatDrop. All rights reserved. Supplier product catalogue powered by DeoDap.</p>
          <div className="flex items-center gap-4">
            <a href="/policies/privacy" className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="/about" className="hover:underline">About Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
