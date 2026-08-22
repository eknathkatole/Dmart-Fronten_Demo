import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, LogIn, LogOut, Store, ShieldCheck, Search, Sparkles, Package, X, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = ({
  onOpenAuth,
  onOpenCart,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
}) => {
  const { user, isAuthenticated, logout, isStaff, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);
  const prevCountRef = useRef(itemCount);

  // Animate badge whenever itemCount increases
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBadgeKey((k) => k + 1);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  const tabs = [
    { id: 'shop', label: 'Shop Catalog', always: true },
    { id: 'orders', label: 'My Orders', icon: <Package className="w-3.5 h-3.5" />, needsAuth: true },
    { id: 'staff', label: 'Staff Ops', icon: <Store className="w-3.5 h-3.5" />, needsStaff: true, color: 'sky' },
    { id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" />, needsAdmin: true, color: 'sky' },
  ].filter((t) => {
    if (t.needsAuth && !isAuthenticated) return false;
    if (t.needsStaff && !isStaff) return false;
    if (t.needsAdmin && !isAdmin) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-sm">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-sky-400 text-white text-xs text-center py-1.5 font-extrabold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>MINI D-MART EXPRESS — Free Home Delivery on orders ₹500+ · Store Pickup Ready in 30 Mins!</span>
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md glow-orange group-hover:scale-105 transition-transform duration-200">
              DM
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-800 group-hover:text-orange-500 transition-colors">
                  Mini D-Mart
                </span>
                <span className="bg-orange-100 text-orange-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-orange-200">
                  LIVE
                </span>
              </div>
              <span className="block text-[9px] uppercase tracking-widest font-bold text-slate-400">
                Supermarket & Grocery
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          {activeTab === 'shop' && (
            <div className="flex-1 max-w-md relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 rounded-full input-orange transition-all duration-200 focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isSky = tab.color === 'sky';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? isSky
                        ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md glow-sky'
                        : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md glow-orange'
                      : isSky
                        ? 'text-sky-500 hover:bg-sky-50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile search toggle */}
            {activeTab === 'shop' && (
              <button
                onClick={() => setMobileSearchOpen((o) => !o)}
                className="md:hidden p-2.5 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Cart button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-2xl border border-orange-200 transition group btn-ripple"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              {itemCount > 0 && (
                <span
                  key={badgeKey}
                  className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-badge-pop"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-2">
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-bold text-slate-700 max-w-[100px] truncate">{user.name}</div>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-600 border border-sky-200">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-200 transition btn-ripple"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white text-xs font-black rounded-2xl shadow-md glow-orange transition btn-ripple transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Login / Register</span>
                <span className="md:hidden">Login</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable */}
        {mobileSearchOpen && activeTab === 'shop' && (
          <div className="md:hidden pb-3 animate-page">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 rounded-full input-orange transition-all duration-200 focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-page">
          <div className="p-4 space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}

            <div className="border-t border-slate-100 pt-3 mt-3">
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-2">
                  <div>
                    <div className="text-sm font-bold text-slate-700">{user.name}</div>
                    <div className="text-xs text-sky-500 font-semibold">{user.role}</div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 font-bold text-xs rounded-xl border border-red-200 hover:bg-red-500 hover:text-white transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-black text-sm rounded-2xl shadow-md glow-orange"
                >
                  <LogIn className="w-4 h-4" /> Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
