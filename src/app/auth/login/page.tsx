'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        login(data.user);
        if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/shop');
        }
      } else {
        setErrorMsg(data.error || 'Invalid credentials');
      }
    } catch (e) {
      setErrorMsg('Login failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Login to BharatDrop
        </h1>
        <p className="text-xs text-gray-500">
          Access your orders, track shipments, or log into the owner admin portal.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@gmail.com or admin@bharatdrop.in"
              className="w-full px-3.5 py-2.5 pl-9 border border-gray-300 rounded-xl outline-none focus:border-orange-500 font-medium"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 pl-9 border border-gray-300 rounded-xl outline-none focus:border-orange-500 font-medium"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-sm"
        >
          {loading ? 'Logging in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-600">
        Don't have an account yet?{' '}
        <a href="/auth/register" className="font-bold text-orange-600 hover:underline">
          Create Account
        </a>
      </div>

      <div className="bg-orange-50/70 border border-orange-100 rounded-xl p-3.5 text-[11px] text-orange-800 space-y-1">
        <p className="font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Owner Super Admin Access:
        </p>
        <p>Email: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[10px]">admin@bharatdrop.in</code></p>
        <p>Password: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[10px]">Admin@BharatDrop2026!</code></p>
      </div>
    </div>
  );
}

