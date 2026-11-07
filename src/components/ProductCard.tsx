'use client';

import React, { useState } from 'react';
import { formatINR } from '@/lib/utils';
import { useCart } from './CartContext';
import { Heart, ShoppingCart, Check, Star } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    sku: string;
    name: string;
    categoryName: string;
    sellingPrice: number;
    mrp: number;
    discountPercent: number;
    imageUrl: string;
    hasImage?: boolean;
    isFeatured?: boolean;
    isTrending?: boolean;
    isBestSeller?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.sku);
  };

  const inWish = isInWishlist(product.sku);

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-300 transition-all duration-200 flex flex-col justify-between relative">
      {/* Top badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
        {product.discountPercent > 0 && (
          <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow uppercase">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        aria-label="Wishlist"
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition shadow-sm ${
          inWish ? 'bg-red-50 text-red-600' : 'bg-white/80 hover:bg-white text-gray-500 hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${inWish ? 'fill-red-600' : ''}`} />
      </button>

      {/* Image Link */}
      <a href={`/product/${product.sku}`} className="block relative bg-gray-50 aspect-square overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/products/images/0065.jpg';
          }}
        />
      </a>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1 truncate">
            {product.categoryName}
          </span>

          <a
            href={`/product/${product.sku}`}
            className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-2 hover:text-orange-600 transition leading-snug"
            title={product.name}
          >
            {product.name}
          </a>

          {/* Static rating representation */}
          <div className="flex items-center gap-1 mt-1.5 text-amber-500">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 font-medium ml-1">4.5 (Verified)</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-3 pt-2.5 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base sm:text-lg font-black text-gray-900">
              {formatINR(product.sellingPrice)}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>

          <div className="text-[10px] text-emerald-700 font-semibold mb-2.5 flex items-center gap-1">
            <span>✓ Free Delivery over ₹499</span>
          </div>

          <button
            onClick={handleAdd}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-200 hover:border-orange-600'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

