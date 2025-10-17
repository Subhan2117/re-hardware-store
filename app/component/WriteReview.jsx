"use client";
import React, { useState } from "react";
import { Star } from "lucide-react";
import { db } from "../../api/firebase/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function WriteReview({ onClose, productId, onPublished }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [review, setReview] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    if (!productId) {
      console.warn('No productId provided for review, aborting');
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        author: name || 'Anonymous',
        title: title || '',
        comment: review || '',
        rating: rating || 0,
        productId,
        verified: false,
        createdAt: Timestamp.now(),
      });

      // notify parent to refresh reviews
      if (typeof onPublished === 'function') onPublished();
    } catch (error) {
      console.error("Error adding review:", error);
    }

    onClose(); // closes modal after publishing
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Write a Review</h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {/* Rating */}
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <Star
                key={index}
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(null)}
                className={`h-6 w-6 cursor-pointer ${
                  ratingValue <= (hover || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            );
          })}
        </div>

        {/* Review Text */}
        <textarea
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
