import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { ShopCatalogView } from './views/ShopCatalogView';
import { MyOrdersView } from './views/MyOrdersView';
import { StaffDashboardView } from './views/StaffDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { CheckCircle2, Package, Truck, ArrowRight, X } from 'lucide-react';

/* ─── Page Transition Wrapper ─────────────────────────────── */
const PageTransition = ({ id, children }) => {
  return (
    <div key={id} className="animate-page will-change-transform">
      {children}
    </div>
  );
};

/* ─── Order Success Banner ─────────────────────────────────── */
const OrderSuccessBanner = ({ order, onDismiss, onViewOrders }) => {
  if (!order) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-page">
      <div className="bg-white border border-green-200 rounded-3xl shadow-2xl p-5 flex items-start gap-4">
        <div className="w-11 h-11 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-sm">Order Placed Successfully! 🎉</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Order #{order.id} · ₹{order.totalAmount} ·{' '}
            {order.fulfillmentType === 'HOME_DELIVERY' ? '🚚 Home Delivery' : '🏪 Store Pickup'}
          </p>
          <button
            onClick={onViewOrders}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-orange-500 hover:text-orange-600 transition"
          >
            Track your order <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button onClick={onDismiss} className="text-slate-300 hover:text-slate-500 transition mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── Main App Shell ──────────────────────────────────────── */
const MainApp = () => {
  const [activeTab, setActiveTab] = useState('shop');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  const { isStaff, isAdmin } = useAuth();

  // Auto-dismiss order banner after 8 seconds
  useEffect(() => {
    if (!lastPlacedOrder) return;
    const t = setTimeout(() => setLastPlacedOrder(null), 8000);
    return () => clearTimeout(t);
  }, [lastPlacedOrder]);

  const handleOrderPlaced = (order) => {
    setLastPlacedOrder(order);
  };

  const handleViewOrders = () => {
    setLastPlacedOrder(null);
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'shop'  && (
          <PageTransition id="shop">
            <ShopCatalogView
              searchTerm={searchTerm}
              onOpenCart={() => setIsCartOpen(true)}
            />
          </PageTransition>
        )}
        {activeTab === 'orders' && (
          <PageTransition id="orders">
            <MyOrdersView />
          </PageTransition>
        )}
        {activeTab === 'staff' && isStaff && (
          <PageTransition id="staff">
            <StaffDashboardView />
          </PageTransition>
        )}
        {activeTab === 'admin' && isAdmin && (
          <PageTransition id="admin">
            <AdminDashboardView />
          </PageTransition>
        )}
      </main>

      <footer className="bg-gradient-to-r from-orange-500 via-orange-400 to-sky-400 text-white text-xs py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="font-bold text-white text-sm">Mini D-Mart — Grocery Store Application</div>
          <div className="text-white/90">Full Stack Developer Assessment · Connected to Live Render Backend API</div>
          <div className="text-[10px] text-white/80">© 2026 Eknath Katole. All rights reserved.</div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={handleOrderPlaced}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <OrderSuccessBanner
        order={lastPlacedOrder}
        onDismiss={() => setLastPlacedOrder(null)}
        onViewOrders={handleViewOrders}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
