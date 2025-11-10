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

export default function ProductDetailsClient({ productId }) {
  const router = useRouter();
  const { cart, addToCart, setCart } = useCart();

  const [product, setProduct] = useState(null);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

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

  // Add the chosen quantity using your CartContext shape (object map)
  const handleAddToCart = useCallback(() => {
    if (!inStock || maxAddable <= 0) return;

    // If quantity is 1, you can just call addToCart(product)
    // For >1, use setCart to batch add within stock bounds
    if (quantity === 1) {
      addToCart(product);
      return;
    }

    setCart((prev) => {
      const prevQty = Number(prev[product.id] || 0);
      const nextQty = Math.min(prevQty + quantity, stock);
      return { ...prev, [product.id]: nextQty };
    });
  }, [addToCart, setCart, inStock, maxAddable, product, quantity, stock]);

  // Ensure item is in cart with the selected qty, then route to /cart
  const handleBuyNow = useCallback(() => {
    if (!inStock || maxAddable <= 0) return;

    setCart((prev) => {
      const prevQty = Number(prev[product.id] || 0);
      const addQty = Math.min(quantity, Math.max(0, stock - prevQty));
      const nextQty = prevQty + addQty;
      return { ...prev, [product.id]: nextQty };
    });

    router.push('/cart'); // or '/checkout'
  }, [inStock, maxAddable, quantity, router, setCart, product, stock]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Product not found
        </h1>
        <p className="text-slate-600">
          We couldn't find the product you're looking for.
        </p>
      </div>
    );
  }

  const displayRating =
    typeof avgRating === 'number'
      ? avgRating
      : typeof product?.rating === 'number'
      ? product.rating
      : null;

  return (
    <div className="grid lg:grid-cols-2 gap-12 mb-16">
      {/* LEFT: Images */}
      <div className="space-y-4">
        <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 overflow-hidden rounded-3xl p-8">
          <div className="relative h-96 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden">
            <Image
              src={images[selectedImageIdx]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIdx(idx)}
              className={`relative h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden border-2 transition
                ${
                  selectedImageIdx === idx
                    ? 'border-amber-400'
                    : 'border-slate-200/30'
                }`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img || '/placeholder.svg'}
                alt={`${product.name} ${idx + 1}`}
                fill
                className="object-fit"
                sizes="(max-width: 1024px) 33vw, 15vw"
              />
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Info */}
      <div className="space-y-6">
        {/* Category */}
        <div className="inline-flex bg-amber-50/70 text-amber-700 border border-amber-200/30 px-4 py-2 rounded-md">
          {product.category}
        </div>

        {/* Name */}
        <h1 className="text-4xl font-bold text-slate-800 text-balance leading-tight">
          {product.name}
        </h1>

        {/* Rating */}
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
          <span className="text-5xl font-bold text-slate-800">
            ${Number(product.price).toFixed(2)}
          </span>
          <span className="text-slate-600">+ Free Shipping</span>
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2">
          <Package
            className={`w-5 h-5 ${inStock ? 'text-green-600' : 'text-red-600'}`}
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
            <span className="text-sm text-slate-600 font-medium">Warranty</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <span className="text-sm text-slate-600 font-medium">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
