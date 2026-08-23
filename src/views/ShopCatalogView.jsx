import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tag, ShieldCheck, Truck, Store, Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import apiClient from '../api/client';

/* ─── Skeleton Card ───────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
    <div className="skeleton aspect-square w-full" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-3 w-1/3 rounded-full" />
      <div className="skeleton h-4 w-3/4 rounded-full" />
      <div className="skeleton h-3 w-full rounded-full" />
      <div className="flex justify-between items-center mt-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-9 w-20 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ─── Empty State ─────────────────────────────────────────── */
const EmptyState = ({ searchTerm, onReset }) => (
  <div className="col-span-full flex flex-col items-center py-20 text-center space-y-4">
    <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-4xl border border-orange-100">
      🛒
    </div>
    <div>
      <p className="font-black text-slate-700 text-base">
        {searchTerm ? `No results for "${searchTerm}"` : 'No products found'}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        {searchTerm ? 'Try a different keyword or browse a category.' : 'Try adjusting your filters.'}
      </p>
    </div>
    <button
      onClick={onReset}
      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-black rounded-2xl shadow-md glow-orange transition btn-ripple"
    >
      <X className="w-3.5 h-3.5" /> Clear Filters
    </button>
  </div>
);

/* ─── Main View ───────────────────────────────────────────── */
export const ShopCatalogView = ({ searchTerm: rawSearch, onOpenCart }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gridKey, setGridKey] = useState(0); // forces re-animation on filter change

  // Debounce search so API only fires after user stops typing
  const searchTerm = useDebounce(rawSearch, 350);

  const categoryRowRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    setGridKey((k) => k + 1);
    fetchProducts();
  }, [selectedCategoryId, inStockOnly, sortBy, sortDir, searchTerm]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/api/v1/categories');
      setCategories(res.data || []);
    } catch {}
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: 0, size: 50, inStockOnly, sortBy, sortDir };
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (searchTerm?.trim()) params.search = searchTerm.trim();
      const res = await apiClient.get('/api/v1/products', { params });
      setProducts(res.data?.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
    // Smooth scroll category row to the active pill
    setTimeout(() => {
      const active = categoryRowRef.current?.querySelector('[data-active="true"]');
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  };

  const handleReset = () => {
    setSelectedCategoryId(null);
    setInStockOnly(false);
    setSortBy('createdAt');
    setSortDir('desc');
  };

  const hasActiveFilter = selectedCategoryId || inStockOnly || sortBy !== 'createdAt';

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-400 to-sky-400 p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/30 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            Supermarket Fresh Guarantee
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Fresh Groceries,{' '}
            <span className="text-orange-100">Lowest Prices</span> Every Day.
          </h1>
          <p className="text-sm text-white/90 font-medium max-w-lg leading-relaxed">
            Shop oil, milk, staples, and packaged foods with up to 20% off.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold text-white">
            {[
              { icon: <Truck className="w-4 h-4" />, label: 'Free Delivery > ₹500' },
              { icon: <Store className="w-4 h-4" />, label: 'Instant Store Pickup' },
              { icon: <ShieldCheck className="w-4 h-4" />, label: '7-Day Return Policy' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-white/30 hover:bg-white/30 transition cursor-default"
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-16 w-72 h-72 bg-white/5 rounded-full" />
      </div>

      {/* Category Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Tag className="w-4 h-4 text-orange-500" />
            Explore Categories
          </span>
          <span className="text-slate-400">{categories.length} categories</span>
        </div>

        <div ref={categoryRowRef} className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[{ id: null, name: 'All Products' }, ...categories].map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id ?? 'all'}
                data-active={isActive}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-200 btn-ripple flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white glow-orange scale-105 shadow-md'
                    : 'bg-white text-slate-600 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 hover:scale-105'
                }`}
              >
                {cat.name}
                {cat.productCount > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-white/30 text-white' : 'bg-sky-100 text-sky-600'
                  }`}>
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold shadow-sm">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-500 hover:text-slate-700 transition">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-500"
            />
            In-Stock Only
          </label>

          {hasActiveFilter && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-bold transition"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Result count */}
          {!loading && (
            <span className="text-slate-400">
              <span className="font-black text-slate-700">{products.length}</span> products
            </span>
          )}

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split('-');
                setSortBy(by);
                setSortDir(dir);
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 input-orange text-xs font-bold"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="sellingPrice-asc">Price: Low → High</option>
              <option value="sellingPrice-desc">Price: High → Low</option>
              <option value="name-asc">A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-500 p-8 rounded-3xl text-center space-y-2">
          <p className="font-black text-sm">Failed to connect to catalog service</p>
          <p className="text-xs text-red-400">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 px-5 py-2 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-400 transition btn-ripple"
          >
            Retry
          </button>
        </div>
      ) : (
        <div
          key={gridKey}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
        >
          {products.length === 0
            ? <EmptyState searchTerm={rawSearch} onReset={handleReset} />
            : products.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-page"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  <ProductCard product={product} onOpenCart={onOpenCart} />
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
};
