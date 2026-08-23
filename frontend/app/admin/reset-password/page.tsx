'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, KeyRound, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params?.get('token') || '';
  const email = params?.get('email') || '';

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.setAttribute('data-page', 'admin');
    return () => document.body.removeAttribute('data-page');
  }, []);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or missing reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      const res = await fetch(API + '/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword: form.newPassword, confirmPassword: form.confirmPassword })
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        toast.success('Password reset successfully!');
        setTimeout(() => router.push('/admin'), 2500);
      } else {
        setError(data.message || 'Reset failed. The link may have expired.');
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthLevel = form.newPassword.length >= 12 ? 4 : form.newPassword.length >= 10 ? 3 : form.newPassword.length >= 8 ? 2 : form.newPassword.length >= 4 ? 1 : 0;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong', 'Very Strong'][strengthLevel];
  const strengthColor = ['', 'bg-red-500', 'bg-[#e8c872]', 'bg-emerald-500', 'bg-emerald-400'][strengthLevel];

  return (
    <main className="relative z-10 w-full max-w-md my-auto">
      <div className="bg-[#0a2319]/90 border border-[#e8c872]/30 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-6">

        {done ? (
          /* ── Success state ─────────────────────────────────────── */
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-600/70 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl text-zinc-100 font-light">Password Reset!</h2>
            <p className="text-xs text-[#a3b8af]">Your password has been updated. Redirecting to the admin login...</p>
            <Sparkles className="w-5 h-5 text-[#e8c872] animate-pulse" />
          </div>
        ) : (
          <>
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#050f0b] border border-[#e8c872]/40 flex items-center justify-center mx-auto text-[#e8c872] shadow-inner">
                <KeyRound className="w-5 h-5" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl text-zinc-100 font-light">Set New Password</h1>
              {email && (
                <p className="text-xs text-[#a3b8af]">
                  Resetting password for <strong className="text-zinc-200">{email}</strong>
                </p>
              )}
            </div>

            {/* ── Error ───────────────────────────────────────────── */}
            {error && (
              <div className="bg-red-950/70 border border-red-800/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Form ────────────────────────────────────────────── */}
            {!error || (token && email) ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#a3b8af] mb-1.5 font-medium">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      value={form.newPassword}
                      onChange={e => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors"
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                      {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {form.newPassword && (
                    <div className="mt-1.5 flex items-center gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strengthLevel ? strengthColor : 'bg-zinc-800'}`} />
                      ))}
                      <span className="text-[10px] text-zinc-500 ml-1 min-w-[50px]">{strengthLabel}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#a3b8af] mb-1.5 font-medium">Confirm Password</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      className={`w-full bg-[#050f0b] border rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-emerald-800 focus:outline-none transition-colors ${
                        form.confirmPassword && form.newPassword !== form.confirmPassword
                          ? 'border-red-700 focus:border-red-500'
                          : form.confirmPassword && form.newPassword === form.confirmPassword
                          ? 'border-emerald-600 focus:border-emerald-400'
                          : 'border-emerald-900/80 focus:border-[#e8c872]'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                      {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                    <p className="text-[10px] text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token || !email}
                  className="w-full bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-95 disabled:opacity-60 text-black font-semibold py-3.5 rounded-xl uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(232,200,114,0.35)] btn-magnetic flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <><Sparkles className="w-4 h-4 animate-spin text-black" /><span>Resetting...</span></>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /><span>Reset Password</span></>
                  )}
                </button>
              </form>
            ) : null}

            <div className="text-center pt-1">
              <a href="/admin" className="text-[11px] text-[#a3b8af] hover:text-[#e8c872] transition-colors uppercase tracking-wider">
                ← Back to Login
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050f0b] flex flex-col justify-between items-center px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[25%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#e8c872]/15 via-emerald-900/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-15%] right-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-[#0b3323]/30 via-transparent to-transparent blur-3xl" />
      </div>

      <header className="relative z-10 text-center">
        <span className="font-signature text-4xl sm:text-5xl text-[#fbf5e6] drop-shadow-[0_0_25px_rgba(232,200,114,0.45)]">
          niharikartist
        </span>
        <span className="block text-[10px] tracking-[0.45em] uppercase text-[#a3b8af] mt-1">
          haute art atelier • admin portal
        </span>
      </header>

      <Suspense fallback={
        <div className="relative z-10 flex flex-col items-center gap-3 my-auto">
          <Sparkles className="w-7 h-7 text-[#e8c872] animate-spin" />
          <span className="text-xs text-[#a3b8af] uppercase tracking-widest">Loading...</span>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>

      <footer className="relative z-10 text-[10px] text-[#627a70] uppercase tracking-widest font-sans">
        &copy; 2026 niharikartist fine art atelier • private administration
      </footer>
    </div>
  );
}
