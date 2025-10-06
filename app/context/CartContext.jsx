'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});

  // hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const currentQty = prev[product.id] || 0;
      if (!product.inStock) return prev;
      if (currentQty >= product.stock) return prev;
      return { ...prev, [product.id]: currentQty + 1 };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
