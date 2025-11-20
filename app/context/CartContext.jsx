'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // cart shape: { [id]: { product, quantity } }
  const [cart, setCart] = useState({});
  const [hydrated, setHydrated] = useState(false); // <-- track when we've loaded from localStorage

  // 1) Hydrate from localStorage ONCE on mount
  useEffect(() => {
    try {
      const saved =
        typeof window !== 'undefined' ? localStorage.getItem('cart') : null;

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse cart from localStorage', err);
    } finally {
      setHydrated(true); // we're done trying to load
    }
  }, []);

  // 2) Persist to localStorage whenever cart changes, but ONLY after hydration
  useEffect(() => {
    if (!hydrated) return; // don't overwrite saved cart on first mount
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cart, hydrated]);

  const addToCart = (product) => {
    if (!product || !product.id) return;

    setCart((prev) => {
      const existing = prev[product.id];
      const currentQty = existing?.quantity || 0;

      if (product.inStock === false) return prev;
      if (typeof product.stock === 'number' && currentQty >= product.stock) {
        return prev;
      }

      return {
        ...prev,
        [product.id]: {
          product,
          quantity: currentQty + 1,
        },
      };
    });
  };

  const totalItems = Object.values(cart).reduce(
    (sum, entry) => sum + (entry?.quantity || 0),
    0
  );
  const clearCart = () => {
    setCart({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart'); // or whatever key you use
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, totalItems, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
