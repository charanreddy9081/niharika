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
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Studio Agreement</span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">Terms & Conditions</h1>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          <p>Welcome to niharikartist. By visiting our website or purchasing our artworks, you engage in our Service and agree to be bound by the following terms and conditions.</p>
          <p>All intellectual property rights in original artwork designs, illustrations, brand names, and website content belong exclusively to niharikartist.</p>
          <p>Prices for our artworks and products are subject to change without notice. We reserve the right to refuse service or limit sales of our items to any person or geographic region.</p>
          <p>For any inquiries regarding terms and studio practices, please write to us at hello@niharikartist.com.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}