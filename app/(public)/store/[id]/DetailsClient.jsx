'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star,
  Package,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  Check,
} from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { db } from '@/app/api/firebase/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

/* ---------- Helpers for deal dates ---------- */

const toJsDate = (d) => {
  if (!d) return null;
  if (d.toDate) return d.toDate(); // Firestore Timestamp
  if (d instanceof Date) return d;
  return new Date(d);
};

const isDealActive = (deal, now) => {
  if (!deal) return false;
  if (deal.active === false) return false;

  const start = toJsDate(deal.startAt);
  const end = toJsDate(deal.endAt);

  if (start && start > now) return false;
  if (end && end < now) return false;

  return true;
};

export default function ProductDetailsClient({ productId }) {
  const router = useRouter();
  const { cart, addToCart, setCart } = useCart();

  const [product, setProduct] = useState(null);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  /* ---------- Fetch product + deal ---------- */

  useEffect(() => {
    if (!productId) return;

    const fetchProductAndDeal = async () => {
      try {
        const productRef = doc(db, 'products', productId);

        const [productSnap, dealsSnap] = await Promise.all([
          getDoc(productRef),
          getDocs(
            query(collection(db, 'deals'), where('productId', '==', productId))
          ),
        ]);

        if (!productSnap.exists()) {
          setProduct(null);
          return;
        }

        const baseData = productSnap.data();
        const now = new Date();

        // pick first active deal, if any
        let dealData = null;
        let dealId = null;
        dealsSnap.forEach((d) => {
          const data = d.data();
          if (!isDealActive(data, now)) return;
          if (!dealData) {
            dealData = data;
            dealId = d.id;
          }
        });

        // base/original price from product
        const basePrice =
          typeof baseData.price === 'number'
            ? baseData.price
            : Number(baseData.price ?? 0) || 0;

        // if deal has its own originalPrice, prefer that
        const dealOriginalPrice =
          typeof dealData?.originalPrice === 'number'
            ? dealData.originalPrice
            : basePrice;

        let finalPrice = basePrice;
        let discountPercent = null;

        if (dealData) {
          // 1) explicit dealPrice
          if (
            typeof dealData.dealPrice === 'number' &&
            !Number.isNaN(dealData.dealPrice)
          ) {
            finalPrice = Number(dealData.dealPrice.toFixed(2));

            if (dealOriginalPrice > 0 && finalPrice < dealOriginalPrice) {
              discountPercent = Math.round(
                ((dealOriginalPrice - finalPrice) / dealOriginalPrice) * 100
              );
            }
          }

          // 2) explicit discountPercent / discountPercentage
          if (
            discountPercent == null &&
            typeof dealData.discountPercent === 'number'
          ) {
            discountPercent = dealData.discountPercent;
          } else if (
            discountPercent == null &&
            typeof dealData.discountPercentage === 'number'
          ) {
            discountPercent = dealData.discountPercentage;
          }

          // 3) parse "Save 25%" from savingsLabel
          if (discountPercent == null && typeof dealData.savingsLabel === 'string') {
            const match = dealData.savingsLabel.match(/(\d+(\.\d+)?)%/);
            if (match) discountPercent = Number(match[1]);
          }
        }

        const hasDealActive =
          !!dealData &&
          finalPrice < dealOriginalPrice &&
          !Number.isNaN(finalPrice);

        const enrichedProduct = {
          id: productSnap.id,
          ...baseData,
          // effective price: what the cart should charge
          price: hasDealActive ? finalPrice : basePrice,
          // keep both for display
          originalPrice: dealOriginalPrice,
          finalPrice,
          deal: hasDealActive
            ? { id: dealId, ...dealData, discountPercent }
            : null,
        };

        setProduct(enrichedProduct);
      } catch (error) {
        console.error('Error fetching product/deal:', error);
        setProduct(null);
      }
    };

    fetchProductAndDeal();
  }, [productId]);

  /* ---------- Fetch reviews ---------- */

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('productId', '==', productId));
        const snap = await getDocs(q);

        if (snap.empty) {
          setAvgRating(null);
          setReviewCount(0);
          return;
        }

        let total = 0;
        snap.forEach((doc) => {
          const data = doc.data();
          total += Number(data.rating || 0);
        });

        setReviewCount(snap.size);
        setAvgRating(total / snap.size);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setAvgRating(null);
        setReviewCount(0);
      }
    };

    fetchReviews();
  }, [productId]);

  /* ---------- Derived values ---------- */

  const currentQtyInCart = Number(cart?.[product?.id] || 0);
  const stock = Number(product?.stock ?? 0);
  const inStock = Boolean(product?.inStock);
  const maxAddable = Math.max(0, stock - currentQtyInCart);

  const images = useMemo(
    () =>
      Array.isArray(product?.images) && product.images.length
        ? product.images
        : [product?.image || '/placeholder.svg'],
    [product]
  );

  const dec = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const inc = useCallback(() => {
    setQuantity((q) => Math.min(maxAddable === 0 ? 1 : maxAddable, q + 1));
  }, [maxAddable]);

  const displayRating =
    typeof avgRating === 'number'
      ? avgRating
      : typeof product?.rating === 'number'
      ? product.rating
      : null;

  const hasDeal =
    product?.deal &&
    typeof product.finalPrice === 'number' &&
    !Number.isNaN(product.finalPrice) &&
    product.finalPrice <
      (product.originalPrice ?? product.price ?? Number.POSITIVE_INFINITY);

  const effectivePrice = hasDeal
    ? product.finalPrice
    : product?.originalPrice ?? product?.price ?? 0;

  const strikePrice = hasDeal
    ? product?.originalPrice ?? product?.price
    : null;

  const discountPercent =
    hasDeal && typeof product.deal?.discountPercent === 'number'
      ? product.deal.discountPercent
      : null;

  /* ---------- Cart handlers ---------- */

  const handleAddToCart = useCallback(() => {
    if (!inStock || maxAddable <= 0) return;

    // product.price is already set to effective deal price if active
    if (quantity === 1) {
      addToCart(product);
      return;
    }

    // batch quantity change; price stays what it was when first added
    setCart((prev) => {
      const prevQty = Number(prev[product.id] || 0);
      const nextQty = Math.min(prevQty + quantity, stock);
      return { ...prev, [product.id]: nextQty };
    });
  }, [addToCart, setCart, inStock, maxAddable, product, quantity, stock]);

  const handleBuyNow = useCallback(() => {
    if (!inStock || maxAddable <= 0) return;

    setCart((prev) => {
      const prevQty = Number(prev[product.id] || 0);
      const addQty = Math.min(quantity, Math.max(0, stock - prevQty));
      const nextQty = prevQty + addQty;
      return { ...prev, [product.id]: nextQty };
    });

    router.push('/cart');
  }, [inStock, maxAddable, quantity, router, setCart, product, stock]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Product not found
        </h1>
        <p className="text-slate-600">
          We couldn&apos;t find the product you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* LEFT: Images */}
        <div className="space-y-4">
          <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 overflow-hidden rounded-3xl p-8">
            <div
              className="relative h-96 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
             <div className="relative w-full h-full">
                <Image
                  src={images[selectedImageIdx]}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                className={`relative aspect-square w-full bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden border-2 transition
                ${
                  selectedImageIdx === idx
                    ? 'border-amber-400'
                    : 'border-slate-200/30'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={img || '/placeholder.svg'}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 1024px) 33vw, 15vw"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="space-y-6">
          {/* Category + deal tag */}
          <div className="flex items-center gap-3">
            <div className="inline-flex bg-amber-50/70 text-amber-700 border border-amber-200/30 px-4 py-2 rounded-md">
              {product.category}
            </div>
            {hasDeal && (
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                {discountPercent != null ? `${discountPercent}% OFF` : 'On Sale'}
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-4xl font-bold text-slate-800 text-balance leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    displayRating && i < Math.round(displayRating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>

            <span className="text-lg font-bold text-slate-800">
              {displayRating ? displayRating.toFixed(1) : '-'}
            </span>

            <span className="text-slate-600">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {hasDeal && strikePrice != null && (
              <span className="text-2xl font-semibold text-slate-400 line-through">
                ${Number(strikePrice).toFixed(2)}
              </span>
            )}
            <span className="text-5xl font-bold text-slate-800">
              ${Number(effectivePrice).toFixed(2)}
            </span>
            {hasDeal && discountPercent != null && (
              <span className="ml-1 text-sm px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                {discountPercent}% OFF
              </span>
            )}
            <span className="text-slate-600 ml-2">+ Free Shipping</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package
              className={`w-5 h-5 ${
                inStock ? 'text-green-600' : 'text-red-600'
              }`}
            />
            <span
              className={`font-medium ${
                inStock ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {inStock ? `In Stock (${stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <p className="text-slate-600 leading-relaxed text-lg">
            {product.longDescription}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-slate-700 font-medium">Quantity:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={dec}
                className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-50"
                disabled={!inStock || quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-xl font-bold text-slate-800 w-12 text-center select-none">
                {Math.min(quantity, Math.max(1, maxAddable || 1))}
              </span>

              <button
                onClick={inc}
                className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-50"
                disabled={!inStock || maxAddable <= 0 || quantity >= maxAddable}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {currentQtyInCart > 0 && (
              <span className="text-sm text-slate-500">
                In cart: {currentQtyInCart} / {stock}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || maxAddable <= 0}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 h-14 text-lg rounded-2xl disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock || maxAddable <= 0}
              className="flex-1 border-2 border-amber-600 text-amber-600 hover:bg-amber-50 h-14 text-lg rounded-2xl disabled:opacity-50 bg-transparent"
            >
              Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/50">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-sm text-slate-600 font-medium">
                Free Shipping
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-sm text-slate-600 font-medium">
                Warranty
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <span className="text-sm text-slate-600 font-medium">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom overlay */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-5 right-6 text-white text-2xl font-bold"
            onClick={() => setIsZoomed(false)}
            aria-label="Close zoomed image"
          >
            ×
          </button>
          <div
            className="relative w-[90vw] max-w-3xl h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImageIdx]}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
