'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, login } = useAuth();

  const [email, setEmail] = useState('admin@bharatdrop.in');
  const [password, setPassword] = useState('Admin@BharatDrop2026!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
        Verifying owner admin privileges...
      </div>
    );
  }

  // If not logged in as admin, show secure Owner Gate
  if (!user || !isAdmin) {
    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginLoading(true);
      setErrorMsg('');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success && (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN')) {
          login(data.user);
        } else {
          setErrorMsg(data.error || 'Access denied: Super Admin authorization required');
        }
      } catch (e) {
        setErrorMsg('Authentication error');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6 text-white shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-orange-600/10 text-orange-500 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Owner Admin Portal</h1>
            <p className="text-xs text-gray-400">
              Restricted area. Only the website owner can manage private supplier wholesale pricing, order fulfillment, and website controls.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Owner Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Owner Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30 text-xs uppercase tracking-wider"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In as Super Admin'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-3 text-[11px] text-gray-400 space-y-1">
            <p className="font-bold text-gray-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> Pre-configured Super Admin Account:
            </p>
            <p>Email: <code className="text-orange-400 font-mono">admin@bharatdrop.in</code></p>
            <p>Password: <code className="text-orange-400 font-mono">Admin@BharatDrop2026!</code></p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              BharatDrop Super-Admin
            </h2>
            <p className="text-[11px] text-gray-500">
              Supplier: DeoDap Wholesale Catalogue Direct Hub
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              Live Store ↗
            </a>
            <div className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1.5 rounded-lg">
              Owner: {user.name}
            </div>
          </div>
        </header>

        <main className="p-6 sm:p-8 flex-1 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}

