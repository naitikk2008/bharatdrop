'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatINR } from '@/lib/utils';
import { useCart } from '@/components/CartContext';
import ProductCard from '@/components/ProductCard';
import {
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  MapPin,
  Star,
  Zap,
  Share2,
  Package
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sku = params.sku as string;

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('110001');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [added, setAdded] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newReviewer, setNewReviewer] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!sku) return;
    setLoading(true);
    fetch(`/api/products/${sku}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProduct(d.product);
          setRelated(d.related || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [sku]);

  if (loading) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-gray-500 font-semibold">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 my-8">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">This catalogue product might not be available or pending review.</p>
        <a href="/shop" className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-lg">
          Browse All Products
        </a>
      </div>
    );
  }

  const specs = product.specifications ? JSON.parse(product.specifications) : {};
  const inWish = isInWishlist(product.sku);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment,
          userName: newReviewer.trim() || 'Verified Buyer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProduct((prev: any) => ({
          ...prev,
          reviews: [data.review, ...(prev.reviews || [])],
        }));
        setNewComment('');
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <a href="/" className="hover:text-orange-600">Home</a>
        <span>/</span>
        <a href="/shop" className="hover:text-orange-600">Shop</a>
        <span>/</span>
        <a href={`/shop?category=${encodeURIComponent(product.categoryName)}`} className="hover:text-orange-600">
          {product.categoryName}
        </a>
        <span>/</span>
        <span className="text-gray-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Product Image Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative bg-gray-50 rounded-2xl border border-gray-100 aspect-square overflow-hidden flex items-center justify-center p-4">
            {product.discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded shadow">
                {product.discountPercent}% OFF
              </span>
            )}

            <button
              onClick={() => toggleWishlist(product.sku)}
              aria-label="Wishlist"
              className={`absolute top-3 right-3 p-2 rounded-full transition shadow-sm ${
                inWish ? 'bg-red-50 text-red-600' : 'bg-white text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${inWish ? 'fill-red-600' : ''}`} />
            </button>

            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/products/images/0065.jpg';
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Catalogue Code: <strong className="text-gray-800">{product.sku}</strong>
            </span>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href });
                }
              }}
              className="flex items-center gap-1 hover:text-orange-600 transition"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Right: Product Details & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-block bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mb-2">
              {product.categoryName}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Status */}
            <div className="flex items-center gap-4 mt-2.5 text-xs">
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>4.5</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-emerald-700 font-bold">In Stock ({product.stock} units)</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">DeoDap Certified Stock</span>
            </div>

            {/* Pricing Section (Strict Customer Price - Private Supplier Cost Hidden) */}
            <div className="mt-5 p-4 rounded-xl bg-orange-50/60 border border-orange-100">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">
                  {formatINR(product.sellingPrice)}
                </span>
                {product.mrp > product.sellingPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatINR(product.mrp)}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-sm font-extrabold text-red-600">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Inclusive of all Indian taxes. Direct wholesale dropship pricing.
              </p>
            </div>

            {/* Pincode Delivery Check */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-gray-800">Check Delivery & COD Availability</span>
              </div>
              <div className="flex max-w-xs gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setPincodeChecked(true)}
                  className="bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800"
                >
                  Check
                </button>
              </div>

              {pincodeChecked && (
                <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Delivery in 3–5 business days to PIN {pincode} • Cash on Delivery Available</span>
                </div>
              )}
            </div>

            {/* Quantity Selector & Buy Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden self-start">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-black text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 px-6 rounded-xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-600 text-gray-950 flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Zap className="w-4 h-4 fill-gray-950" /> Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-gray-100 text-center text-[10px] text-gray-600">
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                <Truck className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                <span className="font-semibold block">Free Shipping</span>
                <span className="text-gray-400">On orders &gt; ₹499</span>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="font-semibold block">7 Days Return</span>
                <span className="text-gray-400">Doorstep replacement</span>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="font-semibold block">100% Genuine</span>
                <span className="text-gray-400">Verified factory stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Verified Description */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-lg font-black text-gray-900 mb-4 pb-2 border-b border-gray-100">
          Product Specifications & Description
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Verified Specifications
            </h4>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500 font-medium w-1/3">Catalogue SKU</td>
                  <td className="py-2 font-bold text-gray-900">{product.sku}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500 font-medium">Category</td>
                  <td className="py-2 font-bold text-gray-900">{product.categoryName}</td>
                </tr>
                {Object.entries(specs).map(([key, val]) => (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-2 text-gray-500 font-medium">{key}</td>
                    <td className="py-2 font-semibold text-gray-800">{String(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              About This Item
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              {product.description || `High quality ${product.name} from verified DeoDap wholesale dropship catalogue.`}
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1 text-gray-600">
              <p>• <strong>Condition:</strong> 100% Brand New Original Packaging</p>
              <p>• <strong>Return Policy:</strong> 7 Days Easy Replacement for damaged or defective units</p>
              <p>• <strong>Dispatched By:</strong> BharatDrop Supplier Fulfillment Rajkot Hub</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-lg font-black text-gray-900 mb-4 pb-2 border-b border-gray-100">
          Customer Reviews & Ratings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Review form */}
          <div className="md:col-span-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-3">
              Write a Review
            </h4>
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  value={newReviewer}
                  onChange={(e) => setNewReviewer(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Rating</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-semibold"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Below Average)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Comment</label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition"
              >
                Submit Review
              </button>

              {reviewSubmitted && (
                <p className="text-emerald-700 text-[11px] font-bold text-center">
                  Thank you! Your verified review has been submitted.
                </p>
              )}
            </form>
          </div>

          {/* Reviews list */}
          <div className="md:col-span-7 space-y-4">
            {(!product.reviews || product.reviews.length === 0) ? (
              <p className="text-xs text-gray-500 italic">
                No reviews yet. Be the first customer to review this catalogue product!
              </p>
            ) : (
              product.reviews.map((rev: any) => (
                <div key={rev.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-gray-900">{rev.userName}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 mb-1.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                    {rev.isVerifiedPurchase && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded ml-2">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-700">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h3 className="text-lg font-black text-gray-900 mb-4">
            More in {product.categoryName}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

