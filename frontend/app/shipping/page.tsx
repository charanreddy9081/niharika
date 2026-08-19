'use client';

import React from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function PolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Studio Logistics</span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">Shipping & Delivery Policy</h1>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          <p>At niharikartist, each artwork is handpainted and customized to order. Please allow 2 to 3 business days for our studio artists to complete your piece, apply the protective varnish, and frame it securely.</p>
          <p>We offer FREE Studio Delivery on all orders above ₹999 across India. Orders below this threshold incur a flat ₹99 shipping fee.</p>
          <p>Once dispatched, packages are routed via trusted courier partners (Shiprocket, Bluedart, Delhivery). Delivery timelines range between 2-4 business days for metropolitan cities and 4-6 business days for other regional areas.</p>
          <p>You will receive live tracking updates via email and SMS as soon as your parcel leaves our studio.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}