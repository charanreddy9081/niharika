'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    discount,
    discountCode,
    applyCoupon,
    total,
    freeShippingThreshold,
    freeShippingProgress
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const success = applyCoupon(couponInput);
    if (success) {
      toast.success('Coupon code applied successfully!');
      setCouponInput('');
    } else {
      toast.error('Invalid coupon code. Try LOVEART10 for 10% off!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Shopping Bag</span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">Your Selected Artworks</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950/40 rounded-2xl border border-zinc-800 p-8 space-y-4 max-w-lg mx-auto">
            <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto stroke-1" />
            <h3 className="font-editorial text-2xl text-zinc-300">Your studio bag is empty</h3>
            <p className="text-xs text-zinc-500">Explore our collection of handpainted keepsakes, eternal sunflower bouquets, and vintage calligraphy letters.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all mt-2"
            >
              <span>Browse Studio Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs">
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Congratulations! You qualify for FREE Studio Shipping!</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400">
                      Add <strong className="text-[#f3e5ab]">₹{freeShippingThreshold - subtotal}</strong> more for FREE Pan-India delivery
                    </span>
                  )}
                  <span className="text-zinc-400 font-mono">{freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] h-full transition-all duration-500" style={{ width: freeShippingProgress + '%' }} />
                </div>
              </div>

              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl items-start sm:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 bg-zinc-950 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-editorial text-lg text-zinc-100">{item.name}</h4>
                        <span className="text-xs text-zinc-400 block">{item.selected_size}</span>
                        {item.custom_note && (
                          <span className="text-[11px] text-amber-300/80 italic block mt-0.5">"{item.custom_note}"</span>
                        )}
                        <span className="text-xs text-[#f3e5ab] font-semibold sm:hidden mt-1 block">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-zinc-800">
                      <div className="flex items-center border border-zinc-700 rounded bg-zinc-950">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-zinc-400 hover:text-white">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-zinc-400 hover:text-white">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="hidden sm:block font-semibold text-base text-[#f3e5ab] min-w-[80px] text-right">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 hover:text-red-400 p-1 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6 h-fit">
              <h3 className="font-editorial text-2xl text-zinc-100">Order Summary</h3>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. LOVEART10)"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 pl-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 uppercase focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-xs font-semibold uppercase">
                  Apply
                </button>
              </form>

              <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800 pt-4">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-zinc-200">₹{subtotal.toLocaleString('en-IN')}</span></div>
                {discountCode && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountCode})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between"><span>Shipping</span><span className="text-zinc-200">{shippingFee === 0 ? 'FREE' : '₹' + shippingFee}</span></div>
                <div className="flex justify-between text-base font-semibold text-zinc-100 pt-3 border-t border-zinc-800">
                  <span>Total</span>
                  <span className="text-[#f3e5ab]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold py-3.5 rounded-lg text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}