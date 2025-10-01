// app/hooks/useCatalogFilters.js
'use client';

import { useMemo, useState } from 'react';

export default function useCatalogFilters(allProducts) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

  const filtered = useMemo(() => {
    return (allProducts || [])
      .filter((p) =>
        selectedCategory === 'all' ? true : slug(p.category)  === selectedCategory
      )
      .filter((p) => {
        if (priceRange === 'all') return true;
        if (priceRange === 'under50') return p.price < 50;
        if (priceRange === '50to100') return p.price >= 50 && p.price <= 100;
        if (priceRange === 'over100') return p.price > 100;
        return true;
      })
      .filter((p) =>
        stockFilter === 'all'
          ? true
          : stockFilter === 'instock'
          ? p.inStock
          : !p.inStock
      )
      .filter((p) =>
        searchQuery.trim()
          ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      );
  }, [allProducts, selectedCategory, priceRange, stockFilter, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setStockFilter('all');
  };

  return {
    // state
    searchQuery,
    selectedCategory,
    priceRange,
    stockFilter,
    // setters
    setSearchQuery,
    setSelectedCategory,
    setPriceRange,
    setStockFilter,
    // derived
    filtered,
    clearFilters,
  };
}
