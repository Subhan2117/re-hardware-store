'use client';

import clsx from 'clsx';
import { Star, ShoppingCart, Package, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({
  product,
  onAddToCart,
  cartQuantity,
  className,
}) {
  const imgSrc = product.image || '/file.svg';

  const handleAdd = (e) => {
    e.stopPropagation(); // don't bubble to overlay link
    e.preventDefault(); // don't trigger navigation
    onAddToCart?.();
  };

  // ProductCard.jsx
const ratingValue = Number(product.rating ?? 0);

// ✅ Only treat as a deal if finalPrice is a valid number AND less than original
const hasDeal =
  product.deal &&
  typeof product.finalPrice === 'number' &&
  !Number.isNaN(product.finalPrice) &&
  product.finalPrice <
    (product.originalPrice ?? product.price ?? Number.POSITIVE_INFINITY);

const displayPrice = hasDeal
  ? product.finalPrice
  : product.originalPrice ?? product.price;

const originalPriceValue =
  hasDeal && typeof (product.originalPrice ?? product.price) === 'number'
    ? Number(product.originalPrice ?? product.price).toFixed(2)
    : null;


  return (
    <div
      className={clsx(
        'group flex flex-col h-full rounded-3xl overflow-hidden backdrop-blur-lg border border-slate-200/40 bg-white/80 hover:shadow-2xl hover:border-amber-300/70 transition-all duration-300',
        className
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
          <Link
            href={`/store/${product.id}`}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={`View ${product.name}`}
            prefetch={false}
          >
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              priority={false}
            />
          </Link>
          ...
        </div>

        {/* Deal badge */}
        {hasDeal && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[11px] font-semibold px-2.5 py-1 shadow-md">
            <Tag className="w-3 h-3" />
            <span>
              {product.deal?.discountPercent
                ? `${product.deal.discountPercent}% OFF`
                : 'On Sale'}
            </span>
          </div>
        )}

        {/* In-cart badge */}
        {cartQuantity > 0 && (
          <span className="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1 text-xs font-medium rounded-full shadow-lg">
            {cartQuantity} in cart
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category Badge */}
        {product.category && (
          <span className="inline-block mb-3 bg-amber-50/80 text-amber-700 border border-amber-200/60 text-[11px] px-3 py-1 rounded-full">
            {product.category}
          </span>
        )}

        {/* Product Name */}
        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1.5 line-clamp-2 group-hover:text-amber-600 transition-colors">
          <Link href={`/store/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-xs md:text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={clsx(
                  'w-3.5 h-3.5',
                  ratingValue && i < Math.round(ratingValue)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-slate-300'
                )}
              />
            ))}
          </div>
          <span className="text-[11px] md:text-xs text-slate-600 font-medium">
            {ratingValue ? ratingValue.toFixed(1) : '-'}
            {typeof product.reviewCount === 'number' &&
              ` (${product.reviewCount})`}
          </span>
        </div>

        {/* Stock Info */}
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-slate-500" />
          <span className="text-xs md:text-sm text-slate-600">
            {product.inStock
              ? `${product.stock ?? 0} in stock`
              : 'Out of stock'}
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="mt-auto pt-3 border-t border-slate-200/70 flex items-center gap-3 justify-between">
          <div className="flex flex-col">
            {hasDeal && originalPriceValue && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                ${originalPriceValue}
              </span>
            )}
            <span className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              ${Number(displayPrice).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="inline-flex items-center justify-center gap-1.5 h-9 md:h-10 min-w-[8.5rem] px-3.5 text-[13px] leading-none whitespace-nowrap rounded-xl shrink-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
