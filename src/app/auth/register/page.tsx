'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        login(data.user);
        router.push('/shop');
      } else {
        setErrorMsg(data.error || 'Registration failed');
      }
    } catch (e) {
      setErrorMsg('Registration failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Create an Account
        </h1>
        <p className="text-xs text-gray-500">
          Join BharatDrop for fast checkout, order tracking, and exclusive discounts.
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
          <label className="block text-gray-700 font-semibold mb-1">Full Name *</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikas Sharma"
              className="w-full px-3.5 py-2.5 pl-9 border border-gray-300 rounded-xl outline-none focus:border-orange-500 font-medium"
            />
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Email Address *</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vikas@gmail.com"
              className="w-full px-3.5 py-2.5 pl-9 border border-gray-300 rounded-xl outline-none focus:border-orange-500 font-medium"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Mobile Phone (10 digits)</label>
          <div className="relative">
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 pl-9 border border-gray-300 rounded-xl outline-none focus:border-orange-500 font-medium"
            />
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Create Password *</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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
          {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-600">
        Already have an account?{' '}
        <a href="/auth/login" className="font-bold text-orange-600 hover:underline">
          Sign In
        </a>
      </div>
    </div>
  );
}

