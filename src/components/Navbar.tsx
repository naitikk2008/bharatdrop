'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { formatINR } from '@/lib/utils';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  MapPin,
  Menu,
  X,
  Package,
  ShieldCheck,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Home,
  Grid,
  Zap,
  Phone,
  Truck,
  RotateCcw,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, subtotal, wishlist } = useCart();
  const { user, isAdmin, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [pincode, setPincode] = useState('110001');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Do not render navbar in owner admin backend
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  // Fetch top categories for search dropdown and mobile drawer
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories.slice(0, 15));
      })
      .catch(() => {});
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdown(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCat && selectedCat !== 'All') params.set('category', selectedCat);
    router.push(`/shop?${params.toString()}`);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm font-sans">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs py-1 px-3 sm:px-4 font-medium flex justify-between items-center overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate text-[11px] sm:text-xs">
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold tracking-wide uppercase shrink-0">
            Factory Dropship
          </span>
          <span className="truncate">🇮🇳 Free Delivery over ₹499 | Cash on Delivery Available</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] sm:text-xs shrink-0 pl-2">
          <a
            href="/track/lookup"
            className="hover:underline flex items-center gap-1 font-semibold text-amber-100 hover:text-white"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </a>
          <a href="/contact" className="hidden md:inline hover:underline text-white/90">
            Customer Support
          </a>
        </div>
      </div>

      {/* 2. Main Navigation Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Hamburger Button (Mobile/Tablet) + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <a href="/" className="flex flex-col group">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 flex items-center">
                Bharat<span className="text-orange-600">Drop</span>
                <span className="text-[9px] sm:text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded ml-1 uppercase">
                  Wholesale
                </span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium -mt-1 hidden sm:inline">
                Apna Bharat, Apni Dukan
              </span>
            </a>
          </div>

          {/* Delivery Pincode (Desktop only) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer hover:text-orange-600 px-2 py-1 rounded-md border border-transparent hover:border-gray-200 transition shrink-0">
            <MapPin className="w-4 h-4 text-orange-600" />
            <div className="leading-tight">
              <p className="text-[10px] text-gray-400">Deliver to</p>
              <p className="font-semibold text-gray-800">Pincode: {pincode}</p>
            </div>
          </div>

          {/* Desktop Search Bar (hidden on mobile, rendered below on mobile) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="flex w-full rounded-lg border-2 border-orange-500 overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-orange-400">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-gray-50 text-gray-700 text-xs px-2.5 py-2 border-r border-gray-200 outline-none max-w-[130px] truncate"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search from 4,880+ catalogue products, choppers, bags..."
                className="w-full px-3 py-2 text-sm outline-none text-gray-800 placeholder-gray-400"
              />

              <button
                type="submit"
                aria-label="Search"
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 flex items-center justify-center transition"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right: Wishlist, Account/Login, and Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Wishlist Icon */}
            <a
              href="/wishlist"
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 transition relative flex flex-col items-center"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <div className="relative">
                <Heart className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 hover:text-orange-600 transition" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[10px] font-medium text-gray-600 mt-0.5">Wishlist</span>
            </a>

            {/* Account / Login Button */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1 sm:gap-1.5 text-gray-800 hover:text-orange-600 text-xs font-semibold py-1.5 px-2 sm:px-2.5 rounded-lg border border-gray-200 hover:border-orange-300 bg-orange-50/40 transition"
                  aria-expanded={userDropdown}
                  aria-label="User Account Menu"
                >
                  <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[55px] sm:max-w-[85px] truncate text-[11px] sm:text-xs">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
              ) : (
                <a
                  href="/auth/login"
                  className="flex items-center gap-1 sm:gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-1.5 px-2.5 sm:px-3 rounded-lg shadow-sm transition whitespace-nowrap"
                  title="Login or Register"
                >
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-xs">Login</span>
                </a>
              )}

              {/* User Dropdown Menu */}
              {userDropdown && user && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 text-xs"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1">
                        Super Admin
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <a
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 text-orange-600 font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Dashboard
                    </a>
                  )}

                  <a href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    My Profile
                  </a>

                  <a href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700">
                    <Package className="w-4 h-4 text-gray-400" />
                    My Orders
                  </a>

                  <a href="/track/lookup" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700">
                    <Truck className="w-4 h-4 text-gray-400" />
                    Track Shipment
                  </a>

                  <a href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700">
                    <Heart className="w-4 h-4 text-gray-400" />
                    Wishlist ({wishlist.length})
                  </a>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <a
              href="/cart"
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold p-1.5 sm:px-3 sm:py-2 rounded-lg shadow-sm transition text-xs sm:text-sm shrink-0"
              aria-label={`Shopping cart with ${totalItems} items`}
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-bold">{formatINR(subtotal)}</span>
            </a>
          </div>
        </div>

        {/* Dedicated Mobile Search Bar (Mobile & Tablet) */}
        <div className="md:hidden px-2.5 pb-2 pt-0.5">
          <form onSubmit={handleSearch} className="flex rounded-lg border-2 border-orange-500 overflow-hidden shadow-inner bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 4,880+ wholesale products..."
              className="w-full px-3 py-1.5 text-xs outline-none text-gray-800 placeholder-gray-400"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 flex items-center justify-center transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Category Navigation Ribbon (Desktop) */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 text-xs font-semibold text-gray-700 py-2 overflow-x-auto whitespace-nowrap">
          <a href="/categories" className="flex items-center gap-1.5 text-orange-600 hover:underline">
            <SlidersHorizontal className="w-3.5 h-3.5" /> All 58 Categories
          </a>
          <a href="/shop?category=Kitchen%20Accessories" className="hover:text-orange-600 transition">Kitchen Accessories (978)</a>
          <a href="/shop?category=House%20Hold" className="hover:text-orange-600 transition">Household (318)</a>
          <a href="/shop?category=Beauty,%20Health%20&%20Personal%20Care" className="hover:text-orange-600 transition">Beauty & Care (341)</a>
          <a href="/shop?category=Stationery" className="hover:text-orange-600 transition">Stationery (296)</a>
          <a href="/shop?category=Home%20Decor" className="hover:text-orange-600 transition">Home Decor (253)</a>
          <a href="/shop?category=Toys" className="hover:text-orange-600 transition">Toys (189)</a>
          <a href="/shop?category=Bathroom%20Accessories" className="hover:text-orange-600 transition">Bathroom (187)</a>
          <a href="/shop?filter=under199" className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition font-bold">
            ⚡ Under ₹199 Store
          </a>
          <a href="/shop?filter=under499" className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded hover:bg-amber-200 transition font-bold">
            🔥 Under ₹499 Store
          </a>
        </div>
      </div>

      {/* 4. Hamburger Slide-Out Drawer (Mobile Off-Canvas Menu) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Menu Panel */}
          <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-50 overflow-y-auto">
            
            {/* Drawer Top Branding & Close Button */}
            <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
              <span className="text-xl font-black text-gray-900 flex items-center">
                Bharat<span className="text-orange-600">Drop</span>
                <span className="text-[9px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded ml-1 uppercase">
                  Wholesale
                </span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auth / Profile Welcome Card */}
            {user ? (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                        Super Admin
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold py-1.5 px-2 rounded-lg border border-gray-200 shadow-sm"
                  >
                    My Profile
                  </a>
                  <a
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold py-1.5 px-2 rounded-lg shadow-sm"
                  >
                    My Orders
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-orange-500 to-amber-600 text-white p-4">
                <p className="text-[11px] font-semibold text-orange-100 uppercase tracking-wider">Welcome to BharatDrop 👋</p>
                <h3 className="text-base font-extrabold mt-0.5">Direct Wholesale Shopping</h3>
                <p className="text-xs text-orange-100 mt-1 mb-3 leading-snug">
                  Login or create an account for live order tracking, saved wishlist & direct supplier pricing.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-white text-orange-600 hover:bg-orange-50 font-bold py-2 px-3 rounded-lg text-xs shadow-sm transition"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </a>
                  <a
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold py-2 px-3 rounded-lg text-xs border border-orange-400 shadow-sm transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </a>
                </div>
              </div>
            )}

            {/* Quick Actions Navigation List */}
            <div className="p-3 border-b border-gray-100 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-1">Quick Services</p>
              
              <a
                href="/track/lookup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 text-xs font-semibold transition"
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-orange-600" />
                  Track Live Order
                </span>
                <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">Fast</span>
              </a>

              <a
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 text-xs font-semibold transition"
              >
                <span className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  My Orders & History
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </a>

              <a
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 text-xs font-semibold transition"
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-red-500" />
                  My Wishlist
                </span>
                {wishlist.length > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                    {wishlist.length} items
                  </span>
                )}
              </a>

              <a
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 text-xs font-semibold transition"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  Shopping Cart
                </span>
                {totalItems > 0 && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                    {totalItems} items
                  </span>
                )}
              </a>
            </div>

            {/* Special Collections */}
            <div className="p-3 border-b border-gray-100 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-1">Deals & Discounts</p>
              
              <a
                href="/shop?filter=under199"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  ⚡ Under ₹199 Store
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
              </a>

              <a
                href="/shop?filter=under499"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  🔥 Under ₹499 Store
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
              </a>

              <a
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800 text-xs font-semibold transition"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                  Browse All 58 Categories
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>

            {/* Top Categories List */}
            <div className="p-3 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">Popular Categories</p>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <a
                  href="/shop?category=Kitchen%20Accessories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 flex justify-between"
                >
                  <span>Kitchen Accessories</span>
                  <span className="text-gray-400 text-[11px]">978</span>
                </a>
                <a
                  href="/shop?category=House%20Hold"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 flex justify-between"
                >
                  <span>Household Utilities</span>
                  <span className="text-gray-400 text-[11px]">318</span>
                </a>
                <a
                  href="/shop?category=Beauty,%20Health%20&%20Personal%20Care"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 flex justify-between"
                >
                  <span>Beauty & Personal Care</span>
                  <span className="text-gray-400 text-[11px]">341</span>
                </a>
                <a
                  href="/shop?category=Home%20Decor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 flex justify-between"
                >
                  <span>Home Decor</span>
                  <span className="text-gray-400 text-[11px]">253</span>
                </a>
                <a
                  href="/shop?category=Toys"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 flex justify-between"
                >
                  <span>Toys & Games</span>
                  <span className="text-gray-400 text-[11px]">189</span>
                </a>
              </div>
            </div>

            {/* Customer Care & Policies */}
            <div className="p-3 border-b border-gray-100 text-xs space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-1">Customer Support</p>
              <a
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-orange-600"
              >
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Contact Helpdesk
              </a>
              <a
                href="/policies/shipping"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-orange-600"
              >
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                Shipping Policy
              </a>
              <a
                href="/policies/cancellation"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-orange-600"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                Cancellation & Return Policy
              </a>
              <a
                href="/policies/refund"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-orange-600"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                Refund Guarantee
              </a>
            </div>

            {/* Bottom Actions (Admin & Logout) */}
            <div className="p-3 mt-auto bg-gray-50 border-t border-gray-200">
              {isAdmin && (
                <a
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-sm mb-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Owner Admin Portal
                </a>
              )}

              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 font-semibold py-2 px-3 rounded-lg border border-red-200 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  Logout of BharatDrop
                </button>
              ) : (
                <a
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In / Register
                </a>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. Mobile Bottom Navigation Bar (5-Tab Native App Experience) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 grid grid-cols-5 py-1.5 px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      >
        {/* Tab 1: Home */}
        <a
          href="/"
          className={`flex flex-col items-center justify-center text-center transition ${
            isActive('/') ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </a>

        {/* Tab 2: Categories */}
        <a
          href="/categories"
          className={`flex flex-col items-center justify-center text-center transition ${
            isActive('/categories') ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Categories</span>
        </a>

        {/* Tab 3: Track Order */}
        <a
          href="/track/lookup"
          className={`flex flex-col items-center justify-center text-center transition ${
            isActive('/track') ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Track</span>
        </a>

        {/* Tab 4: Cart */}
        <a
          href="/cart"
          className={`flex flex-col items-center justify-center text-center relative transition ${
            isActive('/cart') ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Cart</span>
        </a>

        {/* Tab 5: Account (Login / Register / Profile) */}
        <a
          href={user ? '/profile' : '/auth/login'}
          className={`flex flex-col items-center justify-center text-center transition ${
            isActive('/profile') || isActive('/auth')
              ? 'text-orange-600 font-bold'
              : 'text-gray-500 hover:text-orange-600'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate max-w-[55px]">
            {user ? 'Account' : 'Login'}
          </span>
        </a>
      </nav>
    </header>
  );
}
