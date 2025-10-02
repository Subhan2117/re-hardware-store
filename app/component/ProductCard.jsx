'use client';

import { Star, ShoppingCart, Package } from 'lucide-react';
import Image from 'next/image';

export default function ProductCard({ product, onAddToCart, cartQuantity }) {
  return (
    <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-3xl">
      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
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
      <div className="p-6">
        {/* Category Badge */}
        <span className="inline-block mb-3 bg-amber-50/70 text-amber-700 border border-amber-200/30 text-xs px-3 py-1 rounded-full">
          {product.category}
        </span>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
          {product.name}
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
                  i < Math.floor(product.rating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-600 font-medium">
            {product.rating}
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
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
          <span className="text-2xl font-bold text-slate-800">
            ${product.price}
          </span>
          <button
            onClick={onAddToCart} // ← no args needed now
            disabled={!product.inStock}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
