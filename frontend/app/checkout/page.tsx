'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { Banknote, Loader2, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

// ─── Validation ───────────────────────────────────────────────────────────
function validateForm(form: FormState, hasItems: boolean): string | null {
  if (!hasItems) return 'Your cart is empty. Please add items before placing an order.';
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

// ─── Checkout Page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, discount, total, clearCart } = useCart();

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: 'Telangana',
    pincode: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ─── Main order submission ─────────────────────────────────────────────
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm(form, items.length > 0);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (submitting) return; // Prevent duplicate submissions
    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const payload = {
        customer: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.toLowerCase().trim(),
          phone: form.phone.trim(),
        },
        shippingAddress: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        items: items.map(item => ({
          productId: item.product_id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          selected_size: item.selected_size,
          custom_note: item.custom_note,
        })),
        subtotal,
        deliveryCharge: shippingFee,
        total,
        paymentMethod: 'Cash on Delivery',
      };

      const res = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
        toast.success('Order placed successfully!');

        // Redirect to success page with order details as query params
        const params = new URLSearchParams({
          orderId: data.orderId || data.data?.order_id || '',
          email: form.email.trim(),
          phone: form.phone.trim(),
          name: form.firstName.trim(),
          total: String(data.data?.total ?? total),
        });
        router.push(`/order-success?${params.toString()}`);
      } else {
        toast.error(data.message || 'Unable to place order. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Could not connect to the server. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── WhatsApp order ────────────────────────────────────────────────────
  const handleWhatsAppOrder = () => {
    const validationError = validateForm(form, items.length > 0);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';

    const itemLines = items.map(item =>
      `🛍️ Item: ${item.name}\n🔢 Qty: ${item.quantity}\n💰 Price: ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
    ).join('\n\n');

    const message = [
      `Hi! I'd like to place an order:\n`,
      itemLines,
      `\n📦 Delivery to:\n${form.firstName.trim()} ${form.lastName.trim()}\n${form.street.trim()}, ${form.city.trim()}, ${form.state.trim()} - ${form.pincode.trim()}`,
      `\n📞 Phone: ${form.phone.trim()}`,
      `📧 Email: ${form.email.trim()}`,
      `\nPayment: Cash on Delivery`,
      `\n🛒 Order Total: ₹${total.toLocaleString('en-IN')}`,
    ].join('\n');

    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // ─── Shared input class ────────────────────────────────────────────────
  const inputCls = 'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#d4af37] transition-colors placeholder-zinc-600';
  const labelCls = 'text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5';

  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page heading */}
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Secure Studio Checkout</span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">Delivery &amp; Payment</h1>
        </div>

        {/* Empty cart guard */}
        {items.length === 0 && (
          <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-zinc-800 p-8 space-y-4 max-w-md mx-auto">
            <ShoppingBag className="w-14 h-14 text-zinc-700 mx-auto stroke-1" />
            <h3 className="font-editorial text-xl text-zinc-300">Your bag is empty</h3>
            <p className="text-xs text-zinc-500">Add artworks to your bag before checking out.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all mt-2">
              <span>Browse Studio Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <form onSubmit={handleSubmitOrder} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── Left: Form ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Section 1: Contact */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-editorial text-xl text-zinc-100">1. Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={e => updateField('firstName', e.target.value)}
                      placeholder="Priya"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      value={form.lastName}
                      onChange={e => updateField('lastName', e.target.value)}
                      placeholder="Sharma"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={e => updateField('email', e.target.value)}
                      placeholder="priya@example.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone (for delivery) <span className="text-red-400">*</span></label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder="98765 43210"
                      className={inputCls}
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">10-digit Indian mobile number</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-editorial text-xl text-zinc-100">2. Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Street Address / Flat No <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      autoComplete="address-line1"
                      value={form.street}
                      onChange={e => updateField('street', e.target.value)}
                      placeholder="Flat 4B, Sunshine Apartments, MG Road"
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>City <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={e => updateField('city', e.target.value)}
                        placeholder="Hyderabad"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>State <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        autoComplete="address-level1"
                        value={form.state}
                        onChange={e => updateField('state', e.target.value)}
                        placeholder="Telangana"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Pincode <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        autoComplete="postal-code"
                        value={form.pincode}
                        onChange={e => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="500001"
                        maxLength={6}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-editorial text-xl text-zinc-100">3. Payment Method</h3>
                <div className="flex items-start gap-4 p-4 bg-[#d4af37]/10 border border-[#d4af37] rounded-xl">
                  <Banknote className="w-6 h-6 text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-zinc-100 block">Cash on Delivery</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">Pay when your order arrives. No online payment required right now.</span>
                  </div>
                  <div className="ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#050f0b]" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Order Summary ──────────────────────────────── */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6 h-fit sticky top-24">
              <h3 className="font-editorial text-2xl text-zinc-100">
                In Your Bag <span className="text-zinc-500 text-lg font-light">({items.length})</span>
              </h3>

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
                    <span className="text-[#f3e5ab] font-semibold flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-zinc-200">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-zinc-100 pt-3 border-t border-zinc-800">
                  <span>Total</span>
                  <span className="text-[#f3e5ab]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Primary CTA: Place Order */}
              <button
                type="submit"
                disabled={submitting}
                aria-disabled={submitting}
                className="w-full bg-[#d4af37] hover:bg-[#c49f2e] disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 btn-magnetic"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Confirm &amp; Place Order</span>
                )}
              </button>

              {/* Secondary CTA: WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                disabled={submitting}
                aria-label="Order via WhatsApp"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 btn-magnetic"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </button>

              <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                By placing an order you agree to our{' '}
                <Link href="/terms" className="text-[#d4af37] hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="text-[#d4af37] hover:underline">Privacy Policy</Link>.
              </p>
            </div>

          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
