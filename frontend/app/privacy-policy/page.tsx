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
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Data Protection</span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">Privacy Policy</h1>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          <p>We respect your privacy and are committed to safeguarding the personal information you share with us.</p>
          <p>When you place an order or contact our studio, we collect your name, shipping address, email address, and phone number solely to process your order, deliver your package, and communicate tracking updates.</p>
          <p>We never sell, rent, or trade your personal data to third parties. All online payments are handled securely through encrypted payment gateways.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}