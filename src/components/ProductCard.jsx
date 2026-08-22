import React, { useRef } from 'react';
import { Plus, Minus, ShoppingBag, AlertTriangle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const toast = useToast();

  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = !product.inStock || product.stockQuantity === 0;
  const isLowStock = product.lowStock;

  const handleAdd = () => {
    addToCart(product, 1);
    toast.success(`🛒 ${product.name} added to cart!`, 2500);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
      {/* Image Area */}
      <div className="relative aspect-square bg-gradient-to-br from-orange-50 to-sky-50 flex items-center justify-center p-6 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            {product.name.charAt(0)}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {product.discountPercent > 0 && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              SAVE {product.discountPercent}%
            </span>
          )}
          <span className="bg-white/90 backdrop-blur text-sky-600 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {product.unit}
          </span>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="bg-slate-100 text-slate-500 border border-slate-200 text-xs font-black px-4 py-1.5 rounded-full uppercase">
              Out of Stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-3 left-3 bg-amber-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
            <AlertTriangle className="w-3 h-3" />
            Only {product.stockQuantity} Left!
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold text-sky-500 uppercase tracking-widest block mb-1">
            {product.categoryName}
          </span>
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors duration-200">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Cart Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold line-through leading-none">
              ₹{product.mrpPrice}
            </div>
            <div className="text-xl font-black text-slate-800 tracking-tight leading-tight">
              ₹{product.sellingPrice}
            </div>
          </div>

          {!isOutOfStock && (
            <div>
              {currentQuantity > 0 ? (
                <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 p-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                    className="p-1.5 bg-white text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-all duration-150 shadow-sm active:scale-90 btn-ripple"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    key={currentQuantity}
                    className="w-7 text-center text-xs font-black text-orange-600 animate-count-bump"
                  >
                    {currentQuantity}
                  </span>
                  <button
                    onClick={() => {
                      if (currentQuantity < product.stockQuantity) {
                        updateQuantity(product.id, currentQuantity + 1);
                        toast.info(`${product.name}: ${currentQuantity + 1} in cart`, 1800);
                      }
                    }}
                    disabled={currentQuantity >= product.stockQuantity}
                    className="p-1.5 bg-white text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-all duration-150 shadow-sm active:scale-90 disabled:opacity-30 btn-ripple"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white text-xs font-black rounded-xl shadow-md glow-orange transition-all duration-200 active:scale-95 btn-ripple"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  ADD
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
