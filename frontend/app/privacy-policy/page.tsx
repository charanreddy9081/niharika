'use client';

import React from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useSiteContent } from '../../hooks/useSiteContent';

export default function PrivacyPolicyPage() {
  const { c } = useSiteContent('privacy');

  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">
            {c('page_label', 'Data Protection')}
          </span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">
            {c('page_title', 'Privacy Policy')}
          </h1>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans justified">
          <p>{c('para_1', 'We respect your privacy and are committed to safeguarding the personal information you share with us.')}</p>
          <p>{c('para_2', 'When you place an order or contact our studio, we collect your name, shipping address, email address, and phone number solely to process your order, deliver your package, and communicate tracking updates.')}</p>
          <p>{c('para_3', 'We never sell, rent, or trade your personal data to third parties. All online payments are handled securely through encrypted payment gateways.')}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
