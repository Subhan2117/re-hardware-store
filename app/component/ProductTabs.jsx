'use client';
import { useState } from 'react';
import { Check, Star } from 'lucide-react';

export default function ProductTabs({ product, mockReviews }) {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 rounded-3xl p-8 mt-12">
      {/* Tab Buttons */}
      <div className="grid grid-cols-3 mb-8 bg-slate-100/50 p-1 rounded-2xl">
        {['features', 'specifications', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl py-2 font-medium transition ${
              activeTab === tab
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* FEATURES TAB */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Key Features</h3>
          <ul className="space-y-4">
            {product.features?.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SPECIFICATIONS TAB */}
      {activeTab === 'specifications' && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Technical Specifications</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(product.specifications || {}).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-200/30"
              >
                <span className="font-medium text-slate-700">{key}</span>
                <span className="text-slate-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Customer Reviews</h3>
            <button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl px-4 py-2 text-sm font-medium">
              Write a Review
            </button>
          </div>

          <div className="space-y-6">
            {mockReviews?.map((review) => (
              <div
                key={review.id}
                className="p-6 bg-slate-50/50 border border-slate-200/30 rounded-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-slate-800">{review.author}</span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-700 border border-green-200 text-xs px-2 py-1 rounded-lg">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">{review.date}</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{review.title}</h4>
                <p className="text-slate-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
