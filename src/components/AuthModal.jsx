import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const toast = useToast();
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLoginView) {
        await login(email, password);
        toast.success('Welcome back! You\'re now signed in. 👋');
      } else {
        await register(name, email, password, phone);
        toast.success('Account created! Welcome to Mini D-Mart! 🎉');
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchView = (loginView) => {
    setIsLoginView(loginView);
    setError('');
    setShowPassword(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-sky-400 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition btn-ripple"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white text-orange-500 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl mb-3 shadow-lg hover:scale-110 transition-transform duration-200 cursor-default">
            DM
          </div>
          <h2 className="text-xl font-black">
            {isLoginView ? 'Welcome Back!' : 'Join Mini D-Mart'}
          </h2>
          <p className="text-xs text-white/90 font-medium mt-1">
            {isLoginView
              ? 'Sign in to access your orders, cart & returns'
              : 'Create an account to start ordering fresh groceries'}
          </p>
        </div>

        {/* Toggle */}
        <div className="p-1.5 flex gap-1 m-5 rounded-2xl bg-slate-100 text-xs font-bold">
          <button
            onClick={() => switchView(true)}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-200 btn-ripple ${
              isLoginView
                ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md glow-orange'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchView(false)}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-200 btn-ripple ${
              !isLoginView
                ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md glow-orange'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 bg-red-50 text-red-500 p-3 rounded-2xl text-xs flex items-center gap-2 border border-red-200 animate-page">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3 text-xs">
          {!isLoginView && (
            <div>
              <label className="block font-bold mb-1 text-slate-600">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="text" required placeholder="Eknath Katole" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold mb-1 text-slate-600">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-600">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type={showPassword ? 'text' : 'password'} required minLength={8} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLoginView && (
            <div>
              <label className="block font-bold mb-1 text-slate-600">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="tel" required pattern="[6-9][0-9]{9}" placeholder="9876543210"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg glow-orange transition disabled:opacity-50 btn-ripple active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {isLoginView ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : isLoginView ? 'Sign In to Account' : 'Create Customer Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
