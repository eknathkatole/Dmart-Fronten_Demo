import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Truck, Store, AlertCircle, Sparkles, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';

export const CartDrawer = ({ isOpen, onClose, onOrderPlaced, onOpenAuth }) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryCharge,
    freeDeliveryThreshold,
    total,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY');
  const [pickupSlot, setPickupSlot] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '', city: '', state: '', pincode: '', landmark: '',
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { onOpenAuth(); return; }
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const payload = {
        fulfillmentType,
        items: cartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        notes,
      };
      if (fulfillmentType === 'HOME_DELIVERY') payload.deliveryAddress = deliveryAddress;
      else payload.pickupSlot = pickupSlot;

      const res = await apiClient.post('/api/v1/orders', payload);
      clearCart();
      onClose();
      onOrderPlaced(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const remaining = (freeDeliveryThreshold - subtotal).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 flex flex-col shadow-2xl animate-slide-right">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 text-orange-500 rounded-xl border border-orange-200">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-800">Shopping Cart</h2>
              <span className="text-[11px] text-slate-400 font-semibold">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition btn-ripple"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress */}
        {cartItems.length > 0 && (
          <div className="bg-orange-50 px-5 py-3 border-b border-orange-100 shrink-0">
            <div className="flex justify-between text-xs font-extrabold mb-1.5">
              <span className="flex items-center gap-1.5 text-orange-600">
                <Sparkles className="w-3.5 h-3.5" />
                {progressPercent >= 100
                  ? '🎉 FREE Delivery Unlocked!'
                  : `Add ₹${remaining} more for FREE Delivery`}
              </span>
              <span className="text-slate-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-orange-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 space-y-4 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center border border-orange-100 animate-page">
                <ShoppingBag className="w-10 h-10 text-orange-300 stroke-1" />
              </div>
              <div>
                <p className="font-black text-slate-600 text-base">Your cart is empty</p>
                <p className="text-xs text-slate-400 mt-1">Add fresh groceries to get started!</p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-orange-500 text-white text-xs font-black rounded-2xl shadow-md glow-orange transition btn-ripple"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="stagger-children">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100 gap-3 hover:border-orange-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-orange-100 to-sky-100 rounded-xl shrink-0 flex items-center justify-center font-black text-lg text-orange-500 border border-slate-100">
                      {item.product.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-[11px] text-slate-400">₹{item.product.sellingPrice} / {item.product.unit}</p>
                      <p key={item.quantity} className="text-xs font-black text-orange-500 animate-count-bump">
                        ₹{(item.product.sellingPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-slate-400 hover:text-orange-500 rounded-lg transition active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span key={item.quantity} className="w-5 text-center text-xs font-black text-slate-700 animate-count-bump">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="p-1 text-slate-400 hover:text-orange-500 rounded-lg transition active:scale-90 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.product.id);
                        toast.info(`${item.product.name} removed from cart`);
                      }}
                      className="p-1.5 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition btn-ripple"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        {cartItems.length > 0 && (
          <form onSubmit={handleCheckout} className="p-5 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
            {/* Fulfillment Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-2xl border border-slate-200">
              {[
                { type: 'HOME_DELIVERY', icon: <Truck className="w-3.5 h-3.5" />, label: 'Home Delivery', color: 'orange' },
                { type: 'STORE_PICKUP',  icon: <Store className="w-3.5 h-3.5" />, label: 'Store Pickup',   color: 'sky' },
              ].map(({ type, icon, label, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFulfillmentType(type)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all duration-200 btn-ripple ${
                    fulfillmentType === type
                      ? color === 'orange'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md glow-orange'
                        : 'bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md glow-sky'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Address / Slot Inputs */}
            {fulfillmentType === 'HOME_DELIVERY' ? (
              <div className="space-y-2 text-xs">
                {[
                  { key: 'street',   placeholder: 'Street / Flat / House No.', required: true },
                ].map(({ key, placeholder, required }) => (
                  <input key={key} type="text" placeholder={placeholder} required={required}
                    value={deliveryAddress[key]}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, [key]: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                  />
                ))}
                <div className="grid grid-cols-2 gap-2">
                  {['city', 'state'].map((key) => (
                    <input key={key} type="text" placeholder={key.charAt(0).toUpperCase() + key.slice(1)} required
                      value={deliveryAddress[key]}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, [key]: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="6-digit Pincode" pattern="[1-9][0-9]{5}" required
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                  />
                  <input type="text" placeholder="Landmark (Optional)"
                    value={deliveryAddress.landmark}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs space-y-1">
                <label className="font-bold text-slate-600">Pickup Time Slot:</label>
                <input type="datetime-local" required value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 input-sky transition"
                />
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-slate-200 pt-2 space-y-1 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryCharge === 0 ? <strong className="text-green-500">FREE</strong> : `₹${deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-800 pt-1 border-t border-slate-200">
                <span>Total</span>
                <span className="text-orange-500">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA */}
            {!isAuthenticated ? (
              <button type="button" onClick={onOpenAuth}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-black text-xs rounded-2xl shadow-lg transition btn-ripple"
              >
                Sign In to Complete Checkout
              </button>
            ) : (
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black text-sm rounded-2xl shadow-xl glow-orange transition disabled:opacity-50 btn-ripple active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processing Order...
                  </span>
                ) : `Place Order • ₹${total.toFixed(2)}`}
              </button>
            )}
          </form>
        )}
      </div>
    </>
  );
};
