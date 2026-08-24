'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    discount,
    discountCode,
    applyCoupon,
    total,
    shippingMethod,
    shippingZoneLabel,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon) return;
    const ok = applyCoupon(inputCoupon);
    if (ok) {
      toast.success('Coupon "' + inputCoupon.toUpperCase() + '" applied!');
      setInputCoupon('');
    } else {
      toast.error('Invalid code. Try LOVEART10 for 10% off!');
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div onClick={closeCart} className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300" />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#081812] border-l border-[#e8c872]/25 text-zinc-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#e8c872]" />
              <h2 className="font-display text-xl font-medium tracking-wide text-[#fbf5e6]">
                Your Atelier Bag ({items.length})
              </h2>
            </div>
            <button onClick={closeCart} className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shipping info */}
          <div className="bg-[#0d241c] px-6 py-3 border-b border-emerald-900/40">
            <div className="flex items-center justify-between text-xs">
              {shippingMethod ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{shippingMethod === 'speedPost' ? 'Speed Post' : 'Registered Parcel'} · {shippingZoneLabel}</span>
                </span>
              ) : (
                <span className="text-[#a3b8af]">Shipping calculated at checkout based on pincode</span>
              )}
              {shippingFee > 0 && (
                <span className="text-[#e8c872] font-semibold">₹{shippingFee}</span>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#627a70] space-y-4 py-12">
                <ShoppingBag className="w-16 h-16 text-emerald-900/60 stroke-1" />
                <div>
                  <p className="font-display text-lg text-zinc-300">Your atelier bag is empty</p>
                  <p className="text-xs text-[#a3b8af] mt-1">Discover handpainted keepsakes &amp; eternal sunflower bouquets.</p>
                </div>
                <button onClick={closeCart} className="mt-2 bg-[#e8c872] hover:bg-[#d4b055] text-black px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider btn-magnetic">
                  Explore Artworks
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex gap-4 p-3.5 bg-[#0e251d]/90 border border-emerald-900/50 rounded-xl hover:border-[#e8c872]/40 transition-colors">
                  <div className="relative w-20 h-20 bg-[#06120d] rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-sm text-zinc-200 line-clamp-1 leading-snug">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 hover:text-red-400 transition-colors p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-[#a3b8af] block">{item.selected_size}</span>
                      {item.custom_note && (
                        <span className="text-[10px] text-amber-300/80 italic block line-clamp-1 mt-0.5">"{item.custom_note}"</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-emerald-900/80 rounded-md bg-[#06120d]">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-zinc-400 hover:text-white">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-zinc-400 hover:text-white">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-sm text-[#fbf5e6]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-emerald-900/50 bg-[#071610] p-6 space-y-4">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. LOVEART10)"
                    value={inputCoupon}
                    onChange={e => setInputCoupon(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-900/60 rounded-lg px-3 pl-8 py-2 text-xs text-zinc-100 placeholder-emerald-700 uppercase focus:outline-none focus:border-[#e8c872]"
                  />
                </div>
                <button type="submit" className="bg-emerald-900/60 hover:bg-emerald-800/80 text-zinc-200 px-3.5 py-2 rounded-lg text-xs uppercase font-medium btn-magnetic">
                  Apply
                </button>
              </form>

              {discountCode && (
                <div className="text-xs text-emerald-400 flex items-center justify-between">
                  <span>Discount Applied ({discountCode}):</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="space-y-1.5 text-xs text-[#a3b8af]">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-zinc-200">₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-zinc-200">
                    {shippingFee > 0 ? `₹${shippingFee}` : 'Enter pincode at checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-zinc-100 pt-2 border-t border-emerald-900/50">
                  <span>Total</span>
                  <span className="text-[#fbf5e6]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/cart" onClick={closeCart} className="bg-[#0d241c] hover:bg-[#143328] border border-emerald-800/60 text-zinc-200 text-center py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors">
                  View Bag
                </Link>
                <Link href="/checkout" onClick={closeCart} className="bg-[#e8c872] hover:bg-[#d4b055] text-black text-center py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(232,200,114,0.35)] btn-magnetic">
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};