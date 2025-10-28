"use client";
import React, { useState } from "react";

export default function NewCategoryModal({ onClose }) {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = () => {

    console.log({ categoryName }); // later hook this to backend or Firestore
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">New Category</h2>

        {/* FORM SUBMISSIOn */}
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
            >Cancel</button>



            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >Submit</button>




          </div>
        </form>
      </div>
    </div>
  );
}