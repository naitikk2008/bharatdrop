'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/CartContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch products by SKUs
    Promise.all(
      wishlist.map((sku) =>
        fetch(`/api/products/${sku}`)
          .then((r) => r.json())
          .then((d) => (d.success ? d.product : null))
          .catch(() => null)
      )
    )
      .then((items) => {
        setProducts(items.filter(Boolean));
      })
      .finally(() => setLoading(false));
  }, [wishlist]);

  if (wishlist.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 my-8 max-w-md mx-auto shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 mb-6">
          Save your favourite wholesale products here to easily add them to your cart later.
        </p>
        <a
          href="/shop"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition inline-flex items-center gap-2 shadow-sm"
        >
          Explore Catalogue <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My Wishlist
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {wishlist.length} saved dropship catalogue items
          </p>
        </div>
        <a
          href="/cart"
          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          Go to Cart <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

