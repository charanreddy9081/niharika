'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { CheckCircle2, Package, Mail, Phone, Banknote, ArrowRight, Sparkles, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Inner component uses useSearchParams (needs Suspense boundary) ────────
function OrderSuccessContent() {
  const params = useSearchParams();
  const { user, isGuest } = useAuth();

  const orderId      = params?.get('orderId')      || '';
  const email        = params?.get('email')        || '';
  const phone        = params?.get('phone')        || '';
  const name         = params?.get('name')         || '';
  const total        = params?.get('total')        || '';
  const paymentMethod = params?.get('paymentMethod') || 'COD';
  const paymentId    = params?.get('paymentId')    || '';

  const formattedTotal = total ? Number(total).toLocaleString('en-IN') : null;
  const isOnline = paymentMethod === 'Razorpay';

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">
      {/* Animated check icon */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 bg-emerald-950/60 border-2 border-emerald-600/70 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.25)]">
            <CheckCircle2 className="w-11 h-11 text-emerald-400" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-[#e8c872] animate-pulse" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">Order Confirmed</span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-zinc-100 font-light leading-tight">
            Order Placed Successfully!
          </h1>
          {name && (
            <p className="text-sm text-zinc-400">
              Thank you, <strong className="text-zinc-200">{name}</strong>. Your handcrafted artwork is now in our studio queue.
            </p>
          )}
        </div>

        {/* Order summary card */}
        <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-left space-y-4">
          {orderId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#d4af37]" />
                Order ID
              </span>
              <strong className="text-[#f3e5ab] font-mono text-base">{orderId}</strong>
            </div>
          )}

          {email && (
            <div className="flex items-center justify-between text-sm border-t border-zinc-800 pt-4">
              <span className="text-zinc-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d4af37]" />
                Confirmation sent to
              </span>
              <span className="text-zinc-200 text-xs">{email}</span>
            </div>
          )}

          {phone && (
            <div className="flex items-center justify-between text-sm border-t border-zinc-800 pt-4">
              <span className="text-zinc-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d4af37]" />
                We&apos;ll contact you on
              </span>
              <span className="text-zinc-200">{phone}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm border-t border-zinc-800 pt-4">
            <span className="text-zinc-500 flex items-center gap-2">
              {isOnline ? <CreditCard className="w-4 h-4 text-[#d4af37]" /> : <Banknote className="w-4 h-4 text-[#d4af37]" />}
              Payment
            </span>
            <div className="text-right">
              <span className="text-zinc-200 block">
                {isOnline ? 'Paid via Razorpay' : 'Cash on Delivery'}
              </span>
              {isOnline && paymentId && (
                <span className="text-[10px] text-zinc-500 font-mono">{paymentId}</span>
              )}
              {!isOnline && (
                <span className="text-[10px] text-zinc-500">Pay when your order arrives</span>
              )}
            </div>
          </div>

          {formattedTotal && (
            <div className="flex items-center justify-between text-base font-semibold border-t border-zinc-800 pt-4">
              <span className="text-zinc-400">Order Total</span>
              <span className="text-[#f3e5ab]">₹{formattedTotal}</span>
            </div>
          )}
        </div>

        {/* Delivery info */}
        <div className="w-full bg-[#0a2319]/80 border border-emerald-900/60 rounded-2xl p-5 text-sm text-center space-y-1">
          <p className="text-zinc-200 font-medium">Expected Delivery: 5–7 Business Days</p>
          <p className="text-xs text-zinc-500">
            Your artwork will be carefully packed with museum-grade protection and shipped via a tracked courier.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full pt-2">
          {orderId && (
            <Link
              href={`/track-order${!isGuest ? '' : `?orderId=${encodeURIComponent(orderId)}`}`}
              className="flex-1 sm:flex-none bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-6 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] text-center flex items-center justify-center gap-2 btn-magnetic"
            >
              <Package className="w-4 h-4" />
              {isGuest ? 'Track This Order' : 'View All My Orders'}
            </Link>
          )}
          <Link
            href="/shop"
            className="flex-1 sm:flex-none bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-6 py-3.5 rounded-full text-xs uppercase tracking-widest transition-colors text-center flex items-center justify-center gap-2 btn-magnetic"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 24hr cancellation reminder */}
        {!isGuest && (
          <div className="w-full bg-amber-950/20 border border-amber-800/30 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-amber-300/80">
              Need to cancel? You have <strong>24 hours</strong> from now to cancel this order for a full refund.{' '}
              <Link href="/track-order" className="underline hover:text-amber-200">
                Manage in My Orders →
              </Link>
            </p>
          </div>
        )}

        {/* Fine print */}
        <p className="text-[11px] text-zinc-600 text-center">
          Questions about your order? Email us at{' '}
          <a href="mailto:niharikaananthoja@gmail.com" className="text-[#d4af37] hover:underline">
            niharikaananthoja@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}

// ─── Page component with Suspense boundary ────────────────────────────────
export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#e8c872] animate-spin mx-auto" />
              <p className="text-zinc-400 text-sm font-editorial">Loading your order confirmation...</p>
            </div>
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
