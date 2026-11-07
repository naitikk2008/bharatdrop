'use client';

import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { User, Mail, Phone, Package, Heart, LogOut, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 my-8 max-w-md mx-auto">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Please Login</h2>
        <p className="text-xs text-gray-500 mb-4">You need to sign in to access your profile and saved addresses.</p>
        <a href="/auth/login" className="bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 font-black text-xl flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900">{user.name}</h1>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          {isAdmin && (
            <a
              href="/admin"
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Portal
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-400 font-medium">Account Type</span>
            <p className="font-bold text-gray-900">{user.role}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-400 font-medium">Contact Number</span>
            <p className="font-bold text-gray-900">{user.phone || 'Not set'}</p>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="pt-2 flex flex-wrap gap-3">
          <a
            href="/orders"
            className="flex-1 min-w-[140px] p-3 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 transition flex items-center gap-2 text-xs font-bold text-gray-800"
          >
            <Package className="w-4 h-4 text-orange-600" /> My Orders
          </a>

          <a
            href="/wishlist"
            className="flex-1 min-w-[140px] p-3 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 transition flex items-center gap-2 text-xs font-bold text-gray-800"
          >
            <Heart className="w-4 h-4 text-red-500" /> Wishlist
          </a>
        </div>

        <div className="border-t border-gray-100 pt-4 flex justify-end">
          <button
            onClick={logout}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

