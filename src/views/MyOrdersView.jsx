import React, { useState, useEffect } from 'react';
import { Package, Truck, Store, Clock, RotateCcw, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';
import { ReturnModal } from '../components/ReturnModal';

export const MyOrdersView = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchOrdersAndReturns();
    fetchProducts();
  }, []);

  const fetchOrdersAndReturns = async () => {
    setLoading(true); setError('');
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        apiClient.get('/api/v1/orders'),
        apiClient.get('/api/v1/orders/my-returns'),
      ]);
      setOrders(ordersRes.data || []);
      setReturns(returnsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/api/v1/products?size=100');
      setProducts(res.data?.content || []);
    } catch {}
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await apiClient.patch(`/api/v1/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully.');
      fetchOrdersAndReturns();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    }
  };

  const STATUS_STYLES = {
    PLACED:           'bg-sky-100 text-sky-600 border-sky-200',
    CONFIRMED:        'bg-blue-100 text-blue-600 border-blue-200',
    PREPARING:        'bg-amber-100 text-amber-600 border-amber-200',
    READY_FOR_PICKUP: 'bg-purple-100 text-purple-600 border-purple-200',
    OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-600 border-teal-200',
    DELIVERED:        'bg-green-100 text-green-600 border-green-200',
    CANCELLED:        'bg-red-100 text-red-500 border-red-200',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-xs">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-wrap justify-between items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800">My Orders & Return Center</h2>
          <p className="text-slate-400 mt-0.5">Track orders, manage fulfillment, or request 7-day returns</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchOrdersAndReturns}
            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition btn-ripple"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 font-bold">
            {[
              { id: 'orders', label: `Orders (${orders.length})` },
              { id: 'returns', label: `Returns (${returns.length})`, color: 'sky' },
            ].map(({ id, label, color }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === id
                    ? color === 'sky'
                      ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md glow-sky'
                      : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md glow-orange'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-100 p-6 space-y-3 shadow-sm">
              <div className="skeleton h-5 w-1/3 rounded-full" />
              <div className="skeleton h-3 w-1/2 rounded-full" />
              <div className="skeleton h-12 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-500 p-6 rounded-3xl text-center space-y-2">
          <p className="font-black">{error}</p>
          <button onClick={fetchOrdersAndReturns}
            className="px-5 py-2 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-400 transition btn-ripple"
          >
            Retry
          </button>
        </div>
      ) : activeTab === 'orders' ? (
        orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 space-y-3">
            <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto text-3xl">📦</div>
            <p className="font-black text-slate-600 text-base">No orders placed yet</p>
            <p className="text-slate-400 text-xs">Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {orders.map((order) => {
              const isDelivered = order.status === 'DELIVERED';
              const canCancel = order.status === 'PLACED' || order.status === 'CONFIRMED';
              return (
                <div key={order.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200">
                  <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-800">Order #{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                        <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] flex items-center gap-1">
                          {order.fulfillmentType === 'HOME_DELIVERY'
                            ? <><Truck className="w-3 h-3 text-orange-500" /> Home Delivery</>
                            : <><Store className="w-3 h-3 text-sky-500" /> Store Pickup</>}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-orange-500">₹{order.totalAmount}</div>
                      <div className="text-slate-400 text-[11px]">{order.itemCount} items</div>
                    </div>
                  </div>

                  {order.fulfillmentType === 'HOME_DELIVERY' && order.deliveryStreet && (
                    <div className="bg-orange-50 p-3.5 rounded-2xl text-slate-600 border border-orange-100 text-xs">
                      <strong className="text-orange-500">📍 Delivery:</strong> {order.deliveryStreet}, {order.deliveryCity}, {order.deliveryState} — {order.deliveryPincode}
                    </div>
                  )}
                  {order.fulfillmentType === 'STORE_PICKUP' && order.pickupSlot && (
                    <div className="bg-sky-50 p-3.5 rounded-2xl text-slate-600 border border-sky-100 text-xs">
                      <strong className="text-sky-500">🏪 Pickup Slot:</strong> {new Date(order.pickupSlot).toLocaleString()}
                    </div>
                  )}

                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{item.productName}</span>
                          <span className="text-slate-400">({item.quantity} {item.productUnit})</span>
                          {item.returned && (
                            <span className="bg-amber-100 text-amber-600 border border-amber-200 px-2 py-0.5 rounded font-bold text-[10px]">Returned</span>
                          )}
                        </div>
                        <div className="font-black text-slate-700">₹{item.totalPrice}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      {isDelivered && (
                        <span className="text-green-500 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {canCancel && (
                        <button onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-xl border border-red-200 transition btn-ripple"
                        >
                          Cancel
                        </button>
                      )}
                      {isDelivered && (
                        <button onClick={() => setSelectedOrderForReturn(order)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black rounded-xl shadow-md glow-orange transition btn-ripple flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Return / Exchange
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-3 stagger-children">
          {returns.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 space-y-3">
              <div className="text-4xl">🔄</div>
              <p className="font-black text-slate-600">No return requests yet</p>
            </div>
          ) : returns.map((req) => (
            <div key={req.id} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-700">Request #{req.id}</span>
                  <span className="text-slate-400 text-[10px]">Order #{req.orderId}</span>
                  <span className="bg-amber-100 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">{req.status}</span>
                  <span className="bg-sky-50 text-sky-500 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold uppercase">{req.type}</span>
                </div>
                <span className="text-slate-400">{new Date(req.requestedAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div><strong className="text-orange-500">Item:</strong> {req.productName} ({req.quantity})</div>
                <div><strong className="text-slate-600">Reason:</strong> {req.reason}</div>
                {req.targetProductName && <div><strong className="text-sky-500">Exchange Target:</strong> {req.targetProductName}</div>}
              </div>
              {req.staffNote && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-700 text-xs">
                  <strong>Staff Note:</strong> {req.staffNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ReturnModal
        isOpen={!!selectedOrderForReturn}
        onClose={() => setSelectedOrderForReturn(null)}
        order={selectedOrderForReturn}
        products={products}
        onRequestSubmitted={fetchOrdersAndReturns}
      />
    </div>
  );
};
