'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X, Mail, Lock, User, Phone, Eye, EyeOff,
  Loader2, ShoppingBag, ShieldCheck, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  reason?: string;
}

type Mode = 'signin' | 'register';
type RegStep = 'form' | 'otp' | 'done';

export default function AuthModal({ onClose, onSuccess, reason }: AuthModalProps) {
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');

  // ── Sign-in state ──────────────────────────────────────────────────
  const [siLoading, setSiLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [siForm, setSiForm] = useState({ email: '', password: '' });
  const setSi = (k: keyof typeof siForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSiForm(prev => ({ ...prev, [k]: e.target.value }));

  // ── Register state ─────────────────────────────────────────────────
  const [regStep, setRegStep] = useState<RegStep>('form');
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const setReg = (k: keyof typeof regForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setRegForm(prev => ({ ...prev, [k]: e.target.value }));

  // ── OTP state (register) ───────────────────────────────────────────
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  // ── Helpers ────────────────────────────────────────────────────────
  const inputCls = 'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#d4af37] transition-colors placeholder-zinc-600';
  const labelCls = 'text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5';

  function startCountdown() {
    setOtpCountdown(600);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setOtpCountdown(v => {
        if (v <= 1) { clearInterval(countdownRef.current!); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  // ── Sign in submit ─────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siForm.email.trim() || !siForm.password) { toast.error('Email and password are required.'); return; }
    setSiLoading(true);
    const result = await signIn(siForm.email, siForm.password);
    setSiLoading(false);
    if (result.success) { toast.success(result.message); onSuccess(); }
    else toast.error(result.message);
  };

  // ── Register step 1: validate form & send OTP ─────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.firstName.trim()) { toast.error('First name is required.'); return; }
    if (!regForm.lastName.trim()) { toast.error('Last name is required.'); return; }
    if (!regForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) {
      toast.error('Enter a valid email address.'); return;
    }
    if (regForm.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (regForm.password !== regForm.confirmPassword) { toast.error('Passwords do not match.'); return; }

    setOtpSending(true);
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(`${API}/api/payment/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regForm.email.trim(), firstName: regForm.firstName.trim() }),
        signal: controller.signal,
      });
      clearTimeout(t);
      const data = await res.json();
      if (data.success) {
        setRegStep('otp');
        setOtp('');
        setOtpError('');
        startCountdown();
        toast.success(`Verification code sent to ${regForm.email.trim()}`);
      } else {
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch {
      toast.error('Could not reach server. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    setOtpSending(true);
    try {
      const res = await fetch(`${API}/api/payment/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regForm.email.trim(), firstName: regForm.firstName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        startCountdown();
        setOtp('');
        setOtpError('');
        toast.success('New code sent!');
      } else {
        toast.error(data.message || 'Failed to resend OTP.');
      }
    } catch {
      toast.error('Could not reach server.');
    } finally {
      setOtpSending(false);
    }
  };

  // ── Register step 2: verify OTP then create account ───────────────
  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length !== 6) { setOtpError('Enter the 6-digit code.'); return; }
    setOtpVerifying(true);
    setOtpError('');
    try {
      const res = await fetch(`${API}/api/payment/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regForm.email.trim(), otp }),
      });
      const data = await res.json();
      if (!data.success) {
        setOtpError(data.message || 'Invalid OTP.');
        setOtpVerifying(false);
        return;
      }
    } catch {
      setOtpError('Verification failed. Please try again.');
      setOtpVerifying(false);
      return;
    }

    // OTP verified — create account locally
    setRegLoading(true);
    const result = await register({
      firstName: regForm.firstName,
      lastName: regForm.lastName,
      email: regForm.email,
      phone: regForm.phone,
      password: regForm.password,
    });
    setRegLoading(false);
    setOtpVerifying(false);

    if (result.success) {
      setRegStep('done');
      toast.success('Account verified & created!');
      setTimeout(() => onSuccess(), 900);
    } else {
      toast.error(result.message);
      setRegStep('form'); // edge case: duplicate email
    }
  };

  // ── Reset when switching mode ──────────────────────────────────────
  const switchMode = (m: Mode) => {
    setMode(m);
    setRegStep('form');
    setOtp('');
    setOtpError('');
    if (countdownRef.current) clearInterval(countdownRef.current);
    setOtpCountdown(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-[#0a0f0c] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top gold accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37]" />

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-800 z-10">
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
              {mode === 'signin' ? 'Welcome Back' : (regStep === 'otp' ? 'Verify Your Email' : 'Create Account')}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {mode === 'signin'
                ? 'Sign in to your niharikartist account'
                : regStep === 'otp'
                  ? `Enter the 6-digit code sent to ${regForm.email}`
                  : 'Join the studio — it only takes a moment'}
            </p>
          </div>

          {/* Mode toggle — hide during OTP step */}
          {regStep === 'form' && (
            <div className="flex bg-zinc-900 rounded-xl p-1 mb-6">
              {(['signin', 'register'] as Mode[]).map(m => (
                <button key={m} type="button" onClick={() => switchMode(m)}
                  className={`flex-1 py-2 text-xs rounded-lg font-medium transition-all ${
                    mode === m ? 'bg-[#d4af37] text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}>
                  {m === 'signin' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>
          )}

          {/* ══ SIGN IN ════════════════════════════════════════════════ */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className={labelCls}>Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type="email" value={siForm.email} onChange={setSi('email')} placeholder="you@example.com"
                    className={inputCls + ' pl-8'} autoComplete="email" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type={showPw ? 'text' : 'password'} value={siForm.password} onChange={setSi('password')}
                    placeholder="••••••••" className={inputCls + ' pl-8 pr-10'} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={siLoading}
                className="w-full bg-[#d4af37] hover:bg-[#c49f2e] disabled:opacity-60 text-black font-semibold py-3 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-1">
                {siLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
              </button>
            </form>
          )}

          {/* ══ REGISTER — STEP 1: FORM ════════════════════════════════ */}
          {mode === 'register' && regStep === 'form' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <input type="text" value={regForm.firstName} onChange={setReg('firstName')} placeholder="Priya"
                      className={inputCls + ' pl-8'} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Last Name *</label>
                  <input type="text" value={regForm.lastName} onChange={setReg('lastName')} placeholder="Sharma"
                    className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type="email" value={regForm.email} onChange={setReg('email')} placeholder="you@example.com"
                    className={inputCls + ' pl-8'} autoComplete="email" />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">A 6-digit code will be sent here to verify your email.</p>
              </div>

              <div>
                <label className={labelCls}>Phone <span className="text-zinc-600 normal-case">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type="tel" value={regForm.phone} onChange={setReg('phone')} placeholder="98765 43210"
                    className={inputCls + ' pl-8'} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type={showRegPw ? 'text' : 'password'} value={regForm.password} onChange={setReg('password')}
                    placeholder="Minimum 6 characters" className={inputCls + ' pl-8 pr-10'} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowRegPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                    {showRegPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type={showRegPw ? 'text' : 'password'} value={regForm.confirmPassword}
                    onChange={setReg('confirmPassword')} placeholder="Re-enter password"
                    className={inputCls + ' pl-8'} autoComplete="new-password" />
                </div>
              </div>

              <button type="submit" disabled={otpSending}
                className="w-full bg-[#d4af37] hover:bg-[#c49f2e] disabled:opacity-60 text-black font-semibold py-3 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-1">
                {otpSending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code…</>
                  : <><Mail className="w-4 h-4" /> Send Verification Code</>}
              </button>
            </form>
          )}

          {/* ══ REGISTER — STEP 2: OTP ═════════════════════════════════ */}
          {mode === 'register' && regStep === 'otp' && (
            <div className="space-y-5">
              {/* Email badge */}
              <div className="bg-[#0a2319]/80 border border-[#d4af37]/25 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Code sent to</p>
                  <p className="text-xs text-zinc-100 font-medium truncate">{regForm.email}</p>
                </div>
                {otpCountdown > 0 && (
                  <span className="ml-auto text-[10px] text-zinc-500 flex-shrink-0">
                    {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* OTP input */}
              <div>
                <label className={labelCls}>6-Digit Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                  placeholder="• • • • • •"
                  className={inputCls + ' tracking-[0.5em] text-center text-xl font-mono'}
                  autoFocus
                />
                {otpError && <p className="text-xs text-red-400 mt-1.5">{otpError}</p>}
              </div>

              {/* Verify button */}
              <button
                type="button"
                onClick={handleVerifyAndRegister}
                disabled={otp.length !== 6 || otpVerifying || regLoading}
                className="w-full bg-[#d4af37] hover:bg-[#c49f2e] disabled:opacity-60 text-black font-semibold py-3 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                {(otpVerifying || regLoading)
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                  : <><ShieldCheck className="w-4 h-4" /> Verify & Create Account</>}
              </button>

              {/* Resend & back */}
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <button
                  type="button"
                  onClick={() => setRegStep('form')}
                  className="hover:text-zinc-400 transition-colors">
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpSending || otpCountdown > 540}
                  className="flex items-center gap-1 hover:text-[#d4af37] disabled:opacity-40 transition-colors">
                  <RefreshCw className="w-3 h-3" />
                  {otpSending ? 'Sending…' : 'Resend code'}
                </button>
              </div>
            </div>
          )}

          {/* ══ REGISTER — STEP 3: DONE ════════════════════════════════ */}
          {mode === 'register' && regStep === 'done' && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-zinc-100 font-editorial text-lg">Account Created!</p>
              <p className="text-xs text-zinc-500">Signing you in…</p>
            </div>
          )}

          {/* Bottom switch link */}
          {regStep === 'form' && (
            <p className="text-center text-xs text-zinc-600 mt-5">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => switchMode(mode === 'signin' ? 'register' : 'signin')}
                className="text-[#d4af37] hover:underline font-medium">
                {mode === 'signin' ? 'Register here' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
