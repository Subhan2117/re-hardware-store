'use client';

export default function ProductPreviewCard({ product }) {
  return (
    <div className="backdrop-blur-lg bg-white/60 border border-slate-200/30 rounded-2xl shadow-lg p-4 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-xl overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="object-contain h-full w-full"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image</div>
        )}
      </div>

      <h3 className="text-lg font-semibold mt-4 text-slate-800">{product.name}</h3>
      <p className="text-orange-600 font-bold text-lg mt-2">${product.price}</p>
    </div>
  );
}
