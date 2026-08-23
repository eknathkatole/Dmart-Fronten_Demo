import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, AlertCircle, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2, Sparkles, Send, Store, Building2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, sendRegistrationOtp, verifyRegistrationOtp, applyForStaff, forgotPassword, resetPassword } = useAuth();
  const toast = useToast();

  // Mode: 'LOGIN' | 'REGISTER' | 'REGISTER_VERIFY' | 'STAFF_APPLY' | 'FORGOT_REQUEST' | 'FORGOT_VERIFY'
  const [authMode, setAuthMode] = useState('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Staff / Restaurant Partner fields
  const [storeName, setStoreName] = useState('');
  const [reason, setReason] = useState('');

  // Registration OTP
  const [registerOtp, setRegisterOtp] = useState('');
  const [registerOtpHint, setRegisterOtpHint] = useState('');

  // Forgot password OTP & new password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [generatedOtpHint, setGeneratedOtpHint] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetFormState = (newMode) => {
    setAuthMode(newMode);
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! You\'re now signed in. 👋');
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Customer Registration OTP
  const handleRegisterSendOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match! Please check your confirm password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const otpCode = await sendRegistrationOtp(name, email, password, confirmPassword, phone);
      setRegisterOtpHint(otpCode || '');
      toast.success('Verification OTP sent to your email! Please check your inbox.');
      setAuthMode('REGISTER_VERIFY');
    } catch (err) {
      setError(err.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Customer Registration OTP
  const handleRegisterVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyRegistrationOtp(name, email, password, confirmPassword, phone, registerOtp);
      toast.success('Account created & verified! Welcome to Mini D-Mart! 🎉');
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Staff / Restaurant Partner Application Submit
  const handleStaffApplySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await applyForStaff(name, email, phone, storeName, reason);
      toast.success('Staff application submitted! The Admin will generate your password and notify you via email.');
      setName('');
      setEmail('');
      setPhone('');
      setStoreName('');
      setReason('');
      setAuthMode('LOGIN');
    } catch (err) {
      setError(err.message || 'Failed to submit staff application.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setGeneratedOtpHint(res || '');
      toast.success('Reset OTP code generated! Check your email or code hint.');
      setAuthMode('FORGOT_VERIFY');
    } catch (err) {
      setError(err.message || 'Failed to generate reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match!');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword, confirmNewPassword);
      toast.success('Password reset successfully! Please sign in with your new password. 🔒');
      setPassword('');
      setConfirmPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setOtp('');
      setGeneratedOtpHint('');
      setAuthMode('LOGIN');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Check OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-sky-400 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition btn-ripple"
          >
            <X className="w-5 h-5" />
          </button>

          {(authMode === 'REGISTER_VERIFY' || authMode === 'STAFF_APPLY' || authMode === 'FORGOT_REQUEST' || authMode === 'FORGOT_VERIFY') && (
            <button
              onClick={() => resetFormState(authMode === 'REGISTER_VERIFY' ? 'REGISTER' : authMode === 'STAFF_APPLY' ? 'REGISTER' : 'LOGIN')}
              className="absolute top-4 left-4 p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition flex items-center gap-1 text-xs font-bold btn-ripple"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <div className="w-14 h-14 bg-white text-orange-500 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl mb-3 shadow-lg hover:scale-110 transition-transform duration-200 cursor-default">
            DM
          </div>

          <h2 className="text-xl font-black">
            {authMode === 'LOGIN' && 'Welcome to Mini D-Mart'}
            {authMode === 'REGISTER' && 'Join as Customer'}
            {authMode === 'STAFF_APPLY' && 'Staff / Restaurant Partner Registration'}
            {authMode === 'REGISTER_VERIFY' && 'Verify Email Address'}
            {authMode === 'FORGOT_REQUEST' && 'Reset Your Password'}
            {authMode === 'FORGOT_VERIFY' && 'Set New Password'}
          </h2>

          <p className="text-xs text-white/90 font-medium mt-1">
            {authMode === 'LOGIN' && 'Sign in to access your Customer, Staff, or Admin account'}
            {authMode === 'REGISTER' && 'Create your customer account with Email OTP'}
            {authMode === 'STAFF_APPLY' && 'Submit your details; Admin will generate and email your login password'}
            {authMode === 'REGISTER_VERIFY' && `Enter the 6-digit code sent to ${email}`}
            {authMode === 'FORGOT_REQUEST' && 'Enter your registered email to receive a 6-digit OTP'}
            {authMode === 'FORGOT_VERIFY' && 'Enter your 6-digit code and choose a new password'}
          </p>
        </div>

        {/* Toggle Pills (Only on LOGIN & REGISTER) */}
        {(authMode === 'LOGIN' || authMode === 'REGISTER' || authMode === 'STAFF_APPLY') && (
          <div className="p-1.5 flex gap-1 m-5 rounded-2xl bg-slate-100 text-xs font-bold">
            <button
              onClick={() => resetFormState('LOGIN')}
              className={`flex-1 py-2.5 rounded-xl transition-all duration-200 btn-ripple ${
                authMode === 'LOGIN'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md glow-orange'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => resetFormState('REGISTER')}
              className={`flex-1 py-2.5 rounded-xl transition-all duration-200 btn-ripple ${
                authMode === 'REGISTER'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md glow-orange'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => resetFormState('STAFF_APPLY')}
              className={`flex-1 py-2.5 rounded-xl transition-all duration-200 btn-ripple flex items-center justify-center gap-1 ${
                authMode === 'STAFF_APPLY'
                  ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md glow-sky'
                  : 'text-sky-600 hover:text-sky-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Staff Partner
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 my-2 bg-red-50 text-red-500 p-3 rounded-2xl text-xs flex items-center gap-2 border border-red-200 animate-page">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── 1. SIGN IN FORM ─────────────────────────────────────────────── */}
        {authMode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="px-6 pb-6 space-y-3.5 text-xs animate-page">
            <div>
              <label className="block font-bold mb-1 text-slate-600">Email Address (Customer / Staff / Admin)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-600">Password</label>
                <button
                  type="button"
                  onClick={() => resetFormState('FORGOT_REQUEST')}
                  className="text-orange-500 hover:text-orange-600 font-bold text-[11px] transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg glow-orange transition disabled:opacity-50 btn-ripple active:scale-[0.98]"
            >
              {loading ? 'Signing in...' : 'Sign In to Account'}
            </button>
          </form>
        )}

        {/* ─── 2. CUSTOMER REGISTER (With OTP) ─────────────────────────────── */}
        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSendOtp} className="px-6 pb-6 space-y-3 text-xs animate-page">
            <div>
              <label className="block font-bold mb-1 text-slate-600">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Eknath Katole"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600">Email Address (For Verification OTP)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="customer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1 text-slate-600">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Min 8 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-600">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-8 pr-7 py-2 bg-slate-50 border rounded-xl text-slate-700 placeholder-slate-400 input-orange transition text-xs ${
                      confirmPassword && password !== confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-[10px] text-red-500 font-bold">⚠️ Passwords do not match</p>
            )}

            <div>
              <label className="block font-bold mb-1 text-slate-600">Mobile Number (10 Digits)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg glow-orange transition disabled:opacity-50 btn-ripple active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Sending Verification OTP...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Continue & Send Email OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── 3. STAFF / RESTAURANT PARTNER APPLICATION FORM ─────────────── */}
        {authMode === 'STAFF_APPLY' && (
          <form onSubmit={handleStaffApplySubmit} className="px-6 pb-6 space-y-3 text-xs animate-page">
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-sky-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <span>
                Register as a Staff or Restaurant Partner. Once approved, the Super Admin will generate and email your login password.
              </span>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600">Applicant Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Rohan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-sky transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600">Email Address (Where password will be received)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="partner@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-sky transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1 text-slate-600">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-sky transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-600">Store / Outlet Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pizza Corner"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-sky transition text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600">Application Notes / Description</label>
              <textarea
                rows={2}
                placeholder="Briefly describe your store or role (e.g. Restaurant Manager, Grocery Store Operator)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-sky transition text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-black text-xs rounded-xl shadow-lg glow-sky transition disabled:opacity-50 btn-ripple active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Staff Application</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── 4. CUSTOMER REGISTER STEP 2 (Verify OTP) ────────────────────── */}
        {authMode === 'REGISTER_VERIFY' && (
          <form onSubmit={handleRegisterVerifyOtp} className="p-6 space-y-4 text-xs animate-page">
            <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl text-orange-900 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">Email Verification Required</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  We sent a 6-digit OTP code to <strong className="text-orange-600">{email}</strong>.
                </div>
              </div>
            </div>

            {registerOtpHint && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold">Verification Code:</span>
                </div>
                <span className="bg-white px-3 py-1 rounded-xl font-black text-emerald-600 tracking-widest text-sm border border-emerald-200 shadow-sm">
                  {registerOtpHint}
                </span>
              </div>
            )}

            <div>
              <label className="block font-bold mb-1 text-slate-600">Enter 6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="e.g. 748291"
                  value={registerOtp}
                  onChange={(e) => setRegisterOtp(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono tracking-widest text-base font-bold placeholder-slate-400 input-orange transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || registerOtp.length < 6}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg glow-orange transition disabled:opacity-50 btn-ripple active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Verifying & Creating Account...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Complete Account</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleRegisterSendOtp}
                disabled={loading}
                className="text-slate-400 hover:text-orange-500 font-bold text-xs transition"
              >
                Didn't receive code? <span className="text-orange-500 underline">Resend OTP</span>
              </button>
            </div>
          </form>
        )}

        {/* ─── 5. FORGOT PASSWORD STEP 1: REQUEST OTP ───────────────────────── */}
        {authMode === 'FORGOT_REQUEST' && (
          <form onSubmit={handleForgotRequestSubmit} className="p-6 space-y-4 text-xs animate-page">
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-sky-800 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <span>We'll send a 6-digit verification code to your registered email to reset your password.</span>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="customer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-sky transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-black text-xs rounded-xl shadow-lg glow-sky transition disabled:opacity-50 btn-ripple"
            >
              {loading ? 'Sending Code...' : 'Send 6-Digit Reset Code'}
            </button>
          </form>
        )}

        {/* ─── 6. FORGOT PASSWORD STEP 2: VERIFY OTP & SET NEW PASSWORD ────── */}
        {authMode === 'FORGOT_VERIFY' && (
          <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-3.5 text-xs animate-page">
            {generatedOtpHint && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold">Reset OTP Code:</span>
                </div>
                <span className="bg-white px-3 py-1 rounded-xl font-black text-emerald-600 tracking-widest text-sm border border-emerald-200 shadow-sm">
                  {generatedOtpHint}
                </span>
              </div>
            )}

            <div>
              <label className="block font-bold mb-1 text-slate-600">6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono tracking-widest text-sm font-bold placeholder-slate-400 input-orange transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600">New Password (Min 8 characters)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 input-orange transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-600">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-slate-700 placeholder-slate-400 input-orange transition ${
                    confirmNewPassword && newPassword !== confirmNewPassword ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {confirmNewPassword && newPassword !== confirmNewPassword && (
              <p className="text-[10px] text-red-500 font-bold">⚠️ Passwords do not match</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg glow-orange transition disabled:opacity-50 btn-ripple"
            >
              {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
