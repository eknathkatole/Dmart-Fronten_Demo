import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';

export const StaffDashboardView = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockQty, setStockQty] = useState(10);
  const [stockOp, setStockOp] = useState('ADD');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [staffNote, setStaffNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true); setError('');
    try {
      const [ordersRes, returnsRes, lowStockRes] = await Promise.all([
        apiClient.get('/api/v1/staff/orders?size=50'),
        apiClient.get('/api/v1/staff/returns'),
        apiClient.get('/api/v1/staff/products/low-stock'),
      ]);
      setOrders(ordersRes.data?.content || []);
      setReturns(returnsRes.data || []);
      setLowStockProducts(lowStockRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.patch(`/api/v1/staff/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.');
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/v1/staff/products/${selectedProduct.id}/stock`, {
        quantity: Number(stockQty),
        operation: stockOp,
        reason: 'Staff manual inventory adjustment',
      });
      toast.success(`Stock for "${selectedProduct.name}" updated successfully!`);
      setSelectedProduct(null);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to update stock.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessReturn = async (requestId, action) => {
    if (action === 'REJECT' && !staffNote.trim()) {
      toast.warning('Please provide a staff note for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/v1/staff/returns/${requestId}/process`, { action, staffNote });
      toast.success(`Return request ${action === 'APPROVE' ? 'approved & restocked' : 'rejected'}.`);
      setSelectedReturn(null);
      setStaffNote('');
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to process return.');
    } finally {
      setActionLoading(false);
    }
  };

  const TABS = [
    { id: 'orders',    label: `Orders (${orders.length})` },
    { id: 'returns',   label: `Returns (${returns.filter((r) => r.status === 'PENDING').length} Pending)` },
    { id: 'inventory', label: `Low Stock (${lowStockProducts.length})`, hasAlert: lowStockProducts.length > 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-xs">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-400 to-orange-400 p-6 sm:p-8 rounded-3xl text-white shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="bg-white/20 text-white border border-white/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Store Fulfillment & Operations
          </span>
          <h2 className="text-2xl font-black mt-2">Staff Operations Center</h2>
          <p className="text-white/90 mt-1">Fulfill orders, restock inventory, and process customer returns.</p>
        </div>
        <button onClick={fetchAllData}
          className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl border border-white/30 flex items-center gap-2 font-black transition btn-ripple"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-2 shadow-sm">
        {TABS.map(({ id, label, hasAlert }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === id
                ? id === 'inventory'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md glow-orange'
                  : 'bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md glow-sky'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((n) => <div key={n} className="bg-white rounded-3xl border border-slate-100 p-6 h-40 skeleton" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-500 p-6 rounded-3xl text-center">
          {error}
          <button onClick={fetchAllData} className="ml-3 underline font-bold">Retry</button>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-4 stagger-children">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-black text-slate-600">All orders fulfilled!</p>
            </div>
          ) : orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md hover:border-sky-200 transition">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-800">Order #{order.id}</span>
                  <span className="bg-amber-100 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">{order.status}</span>
                  <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">{order.fulfillmentType}</span>
                </div>
                <div className="font-black text-base text-orange-500">₹{order.totalAmount}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2">
                <div><strong className="text-slate-600">Customer:</strong> {order.customerName}</div>
                <div><strong className="text-slate-600">Placed:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                {order.fulfillmentType === 'HOME_DELIVERY' && order.deliveryStreet && (
                  <div className="col-span-2"><strong className="text-orange-500">📍 Address:</strong> {order.deliveryStreet}, {order.deliveryCity} — {order.deliveryPincode}</div>
                )}
                {order.fulfillmentType === 'STORE_PICKUP' && order.pickupSlot && (
                  <div className="col-span-2"><strong className="text-sky-500">🏪 Pickup:</strong> {new Date(order.pickupSlot).toLocaleString()}</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 items-center justify-end">
                {order.status === 'PLACED' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-xl shadow transition btn-ripple">Confirm Order</button>
                )}
                {order.status === 'CONFIRMED' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'PREPARING')} className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl shadow transition btn-ripple">Start Preparing</button>
                )}
                {order.status === 'PREPARING' && (
                  order.fulfillmentType === 'STORE_PICKUP'
                    ? <button onClick={() => handleUpdateStatus(order.id, 'READY_FOR_PICKUP')} className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-xl shadow transition btn-ripple">Ready for Pickup</button>
                    : <button onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')} className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl shadow transition btn-ripple">Out for Delivery</button>
                )}
                {(order.status === 'READY_FOR_PICKUP' || order.status === 'OUT_FOR_DELIVERY') && (
                  <button onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-black rounded-xl shadow transition btn-ripple">✅ Mark Delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'returns' ? (
        <div className="space-y-4 stagger-children">
          {returns.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-black text-slate-600">No return requests.</p>
            </div>
          ) : returns.map((req) => (
            <div key={req.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-700">Request #{req.id}</span>
                  <span className="text-slate-400">(Order #{req.orderId})</span>
                  <span className="bg-amber-100 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">{req.status}</span>
                  <span className="bg-sky-50 text-sky-500 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold uppercase">{req.type}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div><strong className="text-orange-500">Item:</strong> {req.productName} ({req.quantity})</div>
                <div><strong className="text-slate-600">Reason:</strong> {req.reason}</div>
              </div>
              {req.status === 'PENDING' ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <input type="text" placeholder="Staff review note (required for rejection)..."
                    value={selectedReturn === req.id ? staffNote : ''}
                    onChange={(e) => { setSelectedReturn(req.id); setStaffNote(e.target.value); }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-sky transition"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleProcessReturn(req.id, 'REJECT')} disabled={actionLoading}
                      className="px-5 py-2 bg-red-500 hover:bg-red-400 text-white font-black rounded-xl shadow transition btn-ripple disabled:opacity-50"
                    >Reject</button>
                    <button onClick={() => handleProcessReturn(req.id, 'APPROVE')} disabled={actionLoading}
                      className="px-5 py-2 bg-green-500 hover:bg-green-400 text-white font-black rounded-xl shadow transition btn-ripple disabled:opacity-50"
                    >Approve & Restock</button>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 italic">{req.staffNote}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-black text-sm text-slate-800">Low Stock Replenishment List</h3>
          {lowStockProducts.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-black">All products well-stocked!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 stagger-children">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 text-sm">{product.name}</span>
                    <span className="text-slate-400 ml-2">({product.categoryName})</span>
                    <div className="text-amber-500 font-bold mt-1">
                      Stock: {product.stockQuantity} {product.unit} · Min: {product.minStockAlert}
                    </div>
                  </div>
                  <button onClick={() => { setSelectedProduct(product); setStockQty(20); }}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-black rounded-xl shadow-md glow-orange transition btn-ripple"
                  >
                    Adjust Stock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stock Adjust Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-in">
            <h3 className="font-black text-sm text-slate-800">Adjust Stock: {selectedProduct.name}</h3>
            <form onSubmit={handleStockUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Operation</label>
                <select value={stockOp} onChange={(e) => setStockOp(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition"
                >
                  <option value="ADD">ADD (Receive Stock)</option>
                  <option value="SUBTRACT">SUBTRACT (Write-off)</option>
                  <option value="SET">SET (Exact Count)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Quantity</label>
                <input type="number" min={1} required value={stockQty} onChange={(e) => setStockQty(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition btn-ripple"
                >Cancel</button>
                <button type="submit" disabled={actionLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-black rounded-xl shadow glow-orange transition btn-ripple disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
