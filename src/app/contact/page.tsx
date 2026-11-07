'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Contact Customer Support
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Have questions about an order, tracking status, or wholesale dropshipping? Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <Phone className="w-5 h-5 text-orange-600 mb-2" />
            <span className="font-bold text-gray-900 block">Phone Support</span>
            <p className="text-gray-500">+91 96246 66631</p>
            <p className="text-[10px] text-gray-400">10:00 AM - 7:00 PM IST</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <Mail className="w-5 h-5 text-blue-600 mb-2" />
            <span className="font-bold text-gray-900 block">Email Support</span>
            <p className="text-gray-500">support@bharatdrop.in</p>
            <p className="text-[10px] text-gray-400">Response in 2-4 hours</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <MapPin className="w-5 h-5 text-emerald-600 mb-2" />
            <span className="font-bold text-gray-900 block">Fulfillment Hub</span>
            <p className="text-gray-500">Rajkot, Gujarat, India</p>
            <p className="text-[10px] text-gray-400">DeoDap Direct Hub</p>
          </div>
        </div>

        {/* Message Form */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Send Us a Message</h3>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your message has been received. Our team will contact you shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Email / Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. anand@gmail.com / 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Order Number (if applicable)</label>
                <input
                  type="text"
                  placeholder="e.g. BD-123456-7890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

