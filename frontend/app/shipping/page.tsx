'use client';

import React from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useSiteContent } from '../../hooks/useSiteContent';

export default function ShippingPage() {
  const { c } = useSiteContent('shipping');

  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">
            {c('page_label', 'Studio Logistics')}
          </span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">
            {c('page_title', 'Shipping & Delivery Policy')}
          </h1>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans justified">
          <p>{c('para_1', 'At niharikartist, each artwork is handpainted and customized to order. Please allow 2 to 3 business days for our studio artists to complete your piece, apply the protective varnish, and frame it securely.')}</p>
          <p>{c('para_2', 'Shipping charges are calculated at checkout based on your pincode. We dispatch via India Post Speed Post and Registered Parcel from Alwal, Hyderabad.')}</p>
          <p>{c('para_3', 'Once dispatched, packages are routed via India Post. Delivery timelines range between 1–4 business days for metropolitan cities and 4–7 business days for other regional areas.')}</p>
          <p>{c('para_4', 'You will receive live tracking updates via email as soon as your parcel leaves our studio.')}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
