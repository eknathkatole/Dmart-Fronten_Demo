import React, { useState } from 'react';
import { X, RotateCcw, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';

export const ReturnModal = ({ isOpen, onClose, order, products, onRequestSubmitted }) => {
  const toast = useToast();
  const [selectedItemId, setSelectedItemId] = useState('');
  const [type, setType] = useState('RETURN');
  const [reason, setReason] = useState('');
  const [targetProductId, setTargetProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const eligibleItems = order.items.filter((item) => !item.returned);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId) { setError('Please select an order item to return or exchange'); return; }
    if (reason.trim().length < 10) { setError('Please provide a detailed reason (at least 10 characters)'); return; }

    setError('');
    setLoading(true);
    try {
      const payload = { orderItemId: Number(selectedItemId), type, reason };
      if (type === 'EXCHANGE' && targetProductId) payload.targetProductId = Number(targetProductId);
      const res = await apiClient.post(`/api/v1/orders/${order.id}/returns`, payload);
      toast.success(`Return request submitted! Our staff will review it shortly.`);
      onClose();
      onRequestSubmitted(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-sky-400 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            <h3 className="font-bold text-base">Request Return / Exchange</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition btn-ripple">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 bg-red-50 text-red-500 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200 animate-page">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">
              Item to Return / Exchange — Order #{order.id}
            </label>
            <select required value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 input-orange transition"
            >
              <option value="">-- Choose an Item --</option>
              {eligibleItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.productName} ({item.quantity} {item.productUnit}) — ₹{item.totalPrice}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Request Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'RETURN', label: 'Return & Refund', icon: <RotateCcw className="w-3.5 h-3.5" />, color: 'orange' },
                { value: 'EXCHANGE', label: 'Product Exchange', icon: <RefreshCw className="w-3.5 h-3.5" />, color: 'sky' },
              ].map(({ value, label, icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition btn-ripple ${
                    type === value
                      ? color === 'orange'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-sky-500 text-white border-sky-500 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {type === 'EXCHANGE' && (
            <div className="animate-page">
              <label className="block font-bold text-slate-600 mb-1">
                Exchange Target Product (Optional)
              </label>
              <select value={targetProductId} onChange={(e) => setTargetProductId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 input-sky transition"
              >
                <option value="">-- Same Product Replacement --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.sellingPrice})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-600 mb-1">Reason for Request</label>
            <textarea required minLength={10} rows={3}
              placeholder="Describe the issue e.g. Expired product, damaged seal, wrong item..."
              value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-700 resize-none input-orange transition"
            />
            <div className="text-right text-[10px] text-slate-400 mt-0.5">{reason.length}/10 min chars</div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg glow-orange transition disabled:opacity-50 btn-ripple"
          >
            {loading ? 'Submitting...' : 'Submit Request for Staff Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
