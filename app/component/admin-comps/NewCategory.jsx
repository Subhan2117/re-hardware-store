'use client';
import { db } from '@/app/api/firebase/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';

export default function NewCategoryModal({ onClose, onCreated }) {
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slug = (s) => s.toLowerCase().trim().replace(/\s+/g, '-');

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 stop full page reload
    if (!categoryName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const name = categoryName.trim();
      const filterValue = slug(name);

      // 1) write to Firestore
      const docRef = await addDoc(collection(db, 'categories'), {
        name,
        filter: filterValue, // for catalog filters
        createdAt: Timestamp.now(),
      });

      // 2) build the object for parent state
      const newCategory = {
        id: docRef.id,
        name,
        filter: filterValue,
        createdAt: Timestamp.now(),
      };

      // 3) notify parent so it can push into categories[]
      onCreated?.(newCategory);

      // 4) close modal
      onClose?.();
      setCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">New Category</h2>

        {/* FORM SUBMISSION */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name
          </label>
          <input
            type="text"
            placeholder="Name of new category"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          {/* CANCEL OR SUBMIT */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
