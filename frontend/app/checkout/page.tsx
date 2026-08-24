'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import {
  Banknote, Loader2, MessageCircle, ShoppingBag,
  ArrowRight, CreditCard, Mail, ShieldCheck, RefreshCw,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/AuthModal';

const API = process.env.NEXT_PUBLIC_API_URL;
if (!API) console.error('❌ NEXT_PUBLIC_API_URL is not set — API calls will fail in production');
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

declare global {
  interface Window { Razorpay: any; }
}

interface FormState {
  firstName: string; lastName: string;
  email: string; phone: string;
  street: string; city: string; state: string; pincode: string;
}

function validateForm(form: FormState, hasItems: boolean): string | null {
  if (!hasItems) return 'Your cart is empty.';
  if (!form.firstName.trim()) return 'First name is required.';
  if (!form.lastName.trim()) return 'Last name is required.';
  if (!form.email.trim()) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email address.';
  if (!form.phone.trim()) return 'Phone number is required.';
  if (!/^[6-9]\d{9}$/.test(form.phone.replace(/[\s\-+()]/g, ''))) return 'Please enter a valid 10-digit Indian mobile number.';
  if (!form.street.trim()) return 'Street address is required.';
  if (!form.city.trim()) return 'City is required.';
  if (!form.state.trim()) return 'State is required.';
  if (!form.pincode.trim()) return 'Pincode is required.';
  if (!/^\d{6}$/.test(form.pincode.trim())) return 'Please enter a valid 6-digit pincode.';
  return null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, discount, total, clearCart } = useCart();
  const { user, isGuest, isLoading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', state: 'Telangana', pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('razorpay');
  const [submitting, setSubmitting] = useState(false);

  // Proactively wake the Render backend as soon as checkout loads
  useEffect(() => {
    fetch(`${API}/api/health`, { cache: 'no-store' }).catch(() => {});
  }, []);

  // Pre-fill form with logged-in user details
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // OTP state
  const [otpStep, setOtpStep] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Reset OTP verification if email changes
    if (field === 'email') {
      setOtpStep('idle');
      setOtp('');
      setOtpError('');
    }
  };

  // ── OTP: Send ──────────────────────────────────────────────────────────
  const sendOTP = async (retryCount = 0) => {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error('Please enter a valid email address first.'); return;
    }
    setOtpStep('sending');
    setOtpError('');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s — enough for Render cold start
      const res = await fetch(`${API}/api/payment/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), firstName: form.firstName.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.success) {
        setOtpStep('sent');
        toast.success(`Verification code sent to ${form.email.trim()}`);
        // Start countdown
        setOtpCountdown(600);
        countdownRef.current = setInterval(() => {
          setOtpCountdown(v => { if (v <= 1) { clearInterval(countdownRef.current!); return 0; } return v - 1; });
        }, 1000);
      } else {
        setOtpStep('idle');
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setOtpStep('idle');
      // Render cold start can take up to 50s — auto-retry once
      if (retryCount < 1) {
        toast.loading('Server is waking up, retrying…', { id: 'otp-retry', duration: 4000 });
        setTimeout(() => sendOTP(retryCount + 1), 4000);
      } else {
        toast.error('Server is taking too long. Please try again in a moment.');
      }
    }
  };

  // ── OTP: Verify ────────────────────────────────────────────────────────
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) { setOtpError('Enter the 6-digit code.'); return; }
    setOtpStep('verifying');
    setOtpError('');
    try {
      const res = await fetch(`${API}/api/payment/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), otp })
      });
      const data = await res.json();
      if (data.success) {
        setOtpStep('verified');
        toast.success('Email verified ✓');
        if (countdownRef.current) clearInterval(countdownRef.current);
      } else {
        setOtpStep('sent');
        setOtpError(data.message || 'Invalid OTP.');
      }
    } catch {
      setOtpStep('sent');
      setOtpError('Verification failed. Try again.');
    }
  };

  // ── Build order payload ────────────────────────────────────────────────
  const buildPayload = (extra: Record<string, any> = {}) => ({
    customer: {
      firstName: form.firstName.trim(), lastName: form.lastName.trim(),
      email: form.email.toLowerCase().trim(), phone: form.phone.trim(),
    },
    shippingAddress: {
      street: form.street.trim(), city: form.city.trim(),
      state: form.state.trim(), pincode: form.pincode.trim(),
    },
    items: items.map(item => ({
      productId: item.product_id, name: item.name, image: item.image,
      quantity: item.quantity, price: item.price,
      selected_size: item.selected_size, custom_note: item.custom_note,
    })),
    subtotal, deliveryCharge: shippingFee, total,
    paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery',
    ...extra,
  });

  // ── Submit COD ─────────────────────────────────────────────────────────
  const submitCOD = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        const params = new URLSearchParams({
          orderId: data.orderId || '', email: form.email.trim(),
          phone: form.phone.trim(), name: form.firstName.trim(),
          total: String(data.data?.total ?? total), paymentMethod: 'COD',
        });
        router.push(`/order-success?${params.toString()}`);
      } else {
        toast.error(data.message || 'Unable to place order.');
      }
    } catch {
      toast.error('Could not connect to server.');
    } finally { setSubmitting(false); }
  };

  // ── Razorpay payment flow ──────────────────────────────────────────────
  const initiateRazorpay = async () => {
    setSubmitting(true);
    try {
      // Create Razorpay order on backend
      const orderRes = await fetch(`${API}/api/payment/create-razorpay-order`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total, currency: 'INR',
          email: form.email.trim(),
          receipt: `order_${Date.now()}`,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) { toast.error(orderData.message || 'Payment init failed.'); setSubmitting(false); return; }

      const options = {
        key: RAZORPAY_KEY || orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'niharikartist Studio',
        description: `Order — ${items.map(i => i.name).join(', ').substring(0, 60)}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email.trim(),
          contact: form.phone.trim(),
        },
        theme: { color: '#e8c872' },
        handler: async (response: any) => {
          // Verify payment signature
          const verifyRes = await fetch(`${API}/api/payment/verify-razorpay`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) { toast.error('Payment verification failed.'); setSubmitting(false); return; }

          // Create order with payment info
          const placeRes = await fetch(`${API}/api/orders`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildPayload({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
            })),
          });
          const placeData = await placeRes.json();
          if (placeData.success) {
            clearCart();
            const params = new URLSearchParams({
              orderId: placeData.orderId || '', email: form.email.trim(),
              phone: form.phone.trim(), name: form.firstName.trim(),
              total: String(placeData.data?.total ?? total), paymentMethod: 'Razorpay',
              paymentId: response.razorpay_payment_id,
            });
            router.push(`/order-success?${params.toString()}`);
          } else {
            toast.error(placeData.message || 'Order creation failed after payment.');
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => { toast('Payment cancelled.', { icon: 'ℹ️' }); setSubmitting(false); }
        },
      };

      if (!window.Razorpay) { toast.error('Payment gateway not loaded. Please refresh.'); setSubmitting(false); return; }
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      toast.error('Payment initiation failed.');
      setSubmitting(false);
    }
  };

  // ── Main submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validErr = validateForm(form, items.length > 0);
    if (validErr) { toast.error(validErr); return; }

    if (paymentMethod === 'razorpay') {
      if (otpStep !== 'verified') { toast.error('Please verify your email first.'); return; }
      await initiateRazorpay();
    } else {
      await submitCOD();
    }
  };

  // ── WhatsApp ───────────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const validErr = validateForm(form, items.length > 0);
    if (validErr) { toast.error(validErr); return; }
    const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
    const msg = `Hi! Order request:\n${items.map(i => `• ${i.name} ×${i.quantity} ₹${i.price * i.quantity}`).join('\n')}\n\nDelivery: ${form.firstName} ${form.lastName}, ${form.street}, ${form.city}, ${form.state} ${form.pincode}\nPhone: ${form.phone}\nEmail: ${form.email}\nTotal: ₹${total.toLocaleString('en-IN')}`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const inputCls = 'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#d4af37] transition-colors placeholder-zinc-600';
  const labelCls = 'text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5';
  const needsOtp = paymentMethod === 'razorpay';
  const canPayOnline = otpStep === 'verified';

  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />

      {/* Auth modal */}
      {showAuthModal && (
        <AuthModal
          reason="Sign in to complete your order"
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Secure Studio Checkout</span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">Delivery &amp; Payment</h1>
        </div>

        {/* ── Guest gate ───────────────────────────────────────────── */}
        {!authLoading && isGuest && (
          <div className="max-w-md mx-auto text-center py-16 space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#0a2319] border border-[#d4af37]/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-zinc-100 mb-2">Sign in to Checkout</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                You are browsing as a guest. To place an order, please sign in or create a free account.
                This ensures your order confirmations and updates reach you reliably.
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Sign In / Register
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-zinc-600">
              You can continue browsing the{' '}
              <a href="/shop" className="text-[#d4af37] hover:underline">store</a> or{' '}
              <a href="/gallery" className="text-[#d4af37] hover:underline">gallery</a> as a guest.
            </p>
          </div>
        )}

        {/* Only show the checkout form to signed-in users */}
        {!authLoading && !isGuest && (
        <>

        {items.length === 0 && (
          <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-zinc-800 p-8 space-y-4 max-w-md mx-auto">
            <ShoppingBag className="w-14 h-14 text-zinc-700 mx-auto stroke-1" />
            <h3 className="font-editorial text-xl text-zinc-300">Your bag is empty</h3>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all mt-2">
              Browse Store <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── Left ────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">

              {/* 1. Contact */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-editorial text-xl text-zinc-100">1. Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>First Name *</label><input type="text" autoComplete="given-name" value={form.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="Priya" className={inputCls} /></div>
                  <div><label className={labelCls}>Last Name *</label><input type="text" autoComplete="family-name" value={form.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Sharma" className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <div className="flex gap-2">
                      <input type="email" autoComplete="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="priya@example.com" className={inputCls} />
                      {needsOtp && otpStep !== 'verified' && (
                        <button type="button" onClick={() => sendOTP()} disabled={otpStep === 'sending' || otpStep === 'sent' || otpStep === 'verifying'}
                          className="flex-shrink-0 bg-[#0a2319] border border-[#d4af37]/50 hover:border-[#d4af37] text-[#d4af37] px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50">
                          {otpStep === 'sending' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                          {otpStep === 'sent' || otpStep === 'verifying' ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                      {needsOtp && otpStep === 'verified' && (
                        <div className="flex-shrink-0 flex items-center gap-1.5 text-emerald-400 text-[11px] px-2">
                          <CheckCircle2 className="w-4 h-4" /> Verified
                        </div>
                      )}
                    </div>
                  </div>
                  <div><label className={labelCls}>Phone *</label><input type="tel" autoComplete="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="98765 43210" className={inputCls} /><p className="text-[10px] text-zinc-600 mt-1">10-digit Indian mobile</p></div>
                </div>

                {/* OTP Input */}
                {needsOtp && (otpStep === 'sent' || otpStep === 'verifying') && (
                  <div className="bg-[#0a2319]/60 border border-[#d4af37]/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#d4af37]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Enter the 6-digit code sent to <strong>{form.email}</strong></span>
                      {otpCountdown > 0 && <span className="ml-auto text-zinc-500">Expires in {Math.floor(otpCountdown/60)}:{String(otpCountdown%60).padStart(2,'0')}</span>}
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text" inputMode="numeric" maxLength={6}
                        value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setOtpError(''); }}
                        placeholder="• • • • • •" className={inputCls + ' tracking-[0.4em] text-center text-lg font-mono'}
                      />
                      <button type="button" onClick={verifyOTP} disabled={otp.length !== 6 || otpStep === 'verifying'}
                        className="bg-[#d4af37] hover:bg-[#c49f2e] disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center gap-2">
                        {otpStep === 'verifying' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        Verify
                      </button>
                    </div>
                    {otpError && <p className="text-xs text-red-400">{otpError}</p>}
                    <button type="button" onClick={() => sendOTP()} className="text-[11px] text-zinc-500 hover:text-[#d4af37] flex items-center gap-1 transition-colors">
                      <RefreshCw className="w-3 h-3" /> Resend code
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Shipping */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-editorial text-xl text-zinc-100">2. Shipping Address</h3>
                <div><label className={labelCls}>Street Address *</label><input type="text" autoComplete="address-line1" value={form.street} onChange={e => updateField('street', e.target.value)} placeholder="Flat 4B, Sunshine Apartments, MG Road" className={inputCls} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className={labelCls}>City *</label><input type="text" value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="Hyderabad" className={inputCls} /></div>
                  <div><label className={labelCls}>State *</label><input type="text" value={form.state} onChange={e => updateField('state', e.target.value)} placeholder="Telangana" className={inputCls} /></div>
                  <div><label className={labelCls}>Pincode *</label><input type="text" value={form.pincode} onChange={e => updateField('pincode', e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="500001" maxLength={6} className={inputCls} /></div>
                </div>
              </div>

              {/* 3. Payment */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-editorial text-xl text-zinc-100">3. Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Razorpay */}
                  <button type="button" onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${paymentMethod === 'razorpay' ? 'bg-[#d4af37]/15 border-[#d4af37]' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#d4af37]" />
                      <span className="text-sm font-semibold text-zinc-100">Pay Online</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">UPI · Cards · NetBanking · Wallets</span>
                    <span className="text-[10px] text-emerald-400">✓ Email OTP verification required</span>
                  </button>
                  {/* COD */}
                  <button type="button" onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${paymentMethod === 'cod' ? 'bg-[#d4af37]/15 border-[#d4af37]' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-[#d4af37]" />
                      <span className="text-sm font-semibold text-zinc-100">Cash on Delivery</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Pay when your order arrives</span>
                  </button>
                </div>

                {/* Online payment note */}
                {paymentMethod === 'razorpay' && (
                  <div className="bg-[#0a2319]/40 border border-emerald-900/50 rounded-xl p-3 text-[11px] text-[#a3b8af] flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Your email will be verified with a one-time code before payment. This ensures order confirmations reach you securely.</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Summary ───────────────────────────────── */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6 h-fit sticky top-24">
              <h3 className="font-editorial text-2xl text-zinc-100">In Your Bag <span className="text-zinc-500 text-lg font-light">({items.length})</span></h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="relative w-12 h-12 bg-zinc-950 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-zinc-200 line-clamp-1 font-editorial text-sm">{item.name}</h5>
                      <span className="text-[10px] text-zinc-500">Qty: {item.quantity}</span>
                    </div>
                    <span className="text-[#f3e5ab] font-semibold flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800 pt-4">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-zinc-200">₹{subtotal.toLocaleString('en-IN')}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>−₹{discount.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between"><span>Delivery</span><span className="text-zinc-200">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span></div>
                <div className="flex justify-between text-base font-semibold text-zinc-100 pt-3 border-t border-zinc-800">
                  <span>Total</span><span className="text-[#f3e5ab]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Main CTA */}
              <button type="submit" disabled={submitting || (needsOtp && !canPayOnline && paymentMethod === 'razorpay')}
                className="w-full bg-[#d4af37] hover:bg-[#c49f2e] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 btn-magnetic">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
                ) : paymentMethod === 'razorpay' ? (
                  <><CreditCard className="w-4 h-4" /><span>{needsOtp && !canPayOnline ? 'Verify Email to Pay' : `Pay ₹${total.toLocaleString('en-IN')}`}</span></>
                ) : (
                  <span>Confirm &amp; Place Order</span>
                )}
              </button>

              {/* WhatsApp */}
              <button type="button" onClick={handleWhatsApp} disabled={submitting}
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 btn-magnetic">
                <MessageCircle className="w-4 h-4" /><span>Order via WhatsApp</span>
              </button>

              <p className="text-[10px] text-zinc-600 text-center">
                By placing an order you agree to our{' '}
                <Link href="/terms" className="text-[#d4af37] hover:underline">Terms</Link> and{' '}
                <Link href="/privacy-policy" className="text-[#d4af37] hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </form>
        )}
        </> /* end signed-in wrapper */
        )}

      </main>
      <Footer />
    </div>
  );
}
