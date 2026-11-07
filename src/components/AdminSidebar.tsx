'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Users,
  Settings,
  Store,
  LogOut,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { useAuth } from './AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products & Pricing', icon: Package },
    { href: '/admin/orders', label: 'Orders & Tracking', icon: ShoppingBag },
    { href: '/admin/suppliers', label: 'Suppliers (DeoDap)', icon: Truck },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/settings', label: 'Website Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-gray-800">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white p-1.5 rounded-lg shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-white text-base tracking-tight leading-none">
                Owner<span className="text-orange-500">Portal</span>
              </h2>
              <span className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase">
                BharatDrop Admin
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 text-xs font-semibold">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Back to Store */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        <a
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition py-1"
        >
          <Store className="w-4 h-4 text-orange-400" />
          <span>View Public Storefront</span>
        </a>

        <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-xs">
          <div className="truncate pr-2">
            <p className="font-bold text-white truncate text-[11px]">{user?.name || 'Owner'}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email || 'admin@bharatdrop.in'}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Logout"
            className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

