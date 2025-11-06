'use client';

import clsx from 'clsx';
import { Star, ShoppingCart, Package } from 'lucide-react';
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
  return (
    <div
      className={clsx(
        'flex flex-col rounded-3xl overflow-hidden backdrop-blur-lg border border-slate-200/30 bg-white/70 hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-[2/2] bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        <Link
          href={`/store/${product.id}`}
          className="absolute inset-0"
          aria-label={`View ${product.name}`}
          prefetch={false}
        >
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            priority={false}
          />
        </Link>

        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        )}
        {cartQuantity > 0 && (
          <span className="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1 text-xs font-medium rounded-full shadow-lg">
            {cartQuantity} in cart
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category Badge */}
        <span className="inline-block mb-3 bg-amber-50/70 text-amber-700 border border-amber-200/30 text-xs px-3 py-1 rounded-full">
          {product.category}
        </span>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
          <Link href={`/store/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating ?? 0)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-600 font-medium">
            {product.rating ?? '-'}
          </span>
        </div>

        {/* Stock Info */}
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">
            {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center gap-3 justify-between">
          <span className="text-2xl font-bold text-slate-800 tabular-nums shrink-0">
            ${Number(product.price).toFixed(2)}
          </span>

          <button
            onClick={handleAdd}
            // ← no args needed now
            disabled={!product.inStock}
            className="inline-flex items-center justify-center gap-2 h-10 min-w-[9rem] px-4 text-[14px] leading-none whitespace-nowrap rounded-xl shrink-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
