'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  /** Context hint shown at the top — e.g. "Sign in to complete your order" */
  reason?: string;
}

type Mode = 'signin' | 'register';

export default function AuthModal({ onClose, onSuccess, reason }: AuthModalProps) {
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!form.email.trim() || !form.password) {
      toast.error('Email and password are required.'); return;
    }
    if (mode === 'register') {
      if (!form.firstName.trim()) { toast.error('First name is required.'); return; }
      if (!form.lastName.trim()) { toast.error('Last name is required.'); return; }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
      if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    }

    setLoading(true);
    const result = mode === 'signin'
      ? await signIn(form.email, form.password)
      : await register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        });
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      onSuccess();
    } else {
      toast.error(result.message);
    }
  };

  const inputCls = 'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#d4af37] transition-colors placeholder-zinc-600';
  const labelCls = 'text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5';

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-[#0a0f0c] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37]" />

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-800">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            {reason && (
              <div className="flex items-center justify-center gap-2 mb-4 bg-[#0a2319] border border-[#d4af37]/30 rounded-xl px-4 py-2.5">
                <ShoppingBag className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                <span className="text-xs text-[#d4af37]">{reason}</span>
              </div>
            )}
            <h2 className="font-editorial text-2xl text-zinc-100">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {mode === 'signin'
                ? 'Sign in to your niharikartist account'
                : 'Join the studio — it only takes a moment'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-zinc-900 rounded-xl p-1 mb-6">
            {(['signin', 'register'] as Mode[]).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs rounded-lg font-medium transition-all ${
                  mode === m ? 'bg-[#d4af37] text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}>
                {m === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <input type="text" value={form.firstName} onChange={set('firstName')} placeholder="Priya" className={inputCls + ' pl-8'} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Last Name *</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Sharma" className={inputCls} />
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls + ' pl-8'} autoComplete="email" />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className={labelCls}>Phone <span className="text-zinc-600 normal-case">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="98765 43210" className={inputCls + ' pl-8'} />
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : '••••••••'}
                  className={inputCls + ' pl-8 pr-10'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className={labelCls}>Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.confirmPassword} onChange={set('confirmPassword')}
                    placeholder="Re-enter password"
                    className={inputCls + ' pl-8'}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#c49f2e] disabled:opacity-60 text-black font-semibold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait…</>
                : mode === 'signin' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-xs text-zinc-600 mt-5">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}
              className="text-[#d4af37] hover:underline font-medium">
              {mode === 'signin' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
