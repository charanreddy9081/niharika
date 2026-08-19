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
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Customer Assurance</span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">Refund & Returns Policy</h1>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          <p>Because every frame, bouquet, and handwritten letter is made individually by hand and customized with your personal notes, we do not accept standard returns for buyer remorse.</p>
          <p>Transit Damage Guarantee: In the rare event that your artwork arrives damaged or defective, please notify us within 48 hours of delivery at hello@niharikartist.com with your Order ID and unboxing photos/videos.</p>
          <p>Upon verification, our studio will craft and dispatch a brand new replacement frame to you at zero additional cost.</p>
          <p>Cancellations can be made within 6 hours of placing the order before artist painting has begun.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}