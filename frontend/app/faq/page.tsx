'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are all artworks individually handpainted by artist Niharika?',
      a: 'Yes, absolutely. Every piece in our atelier is an authentic original artwork sketched by hand with charcoal, painted with fine artist-grade acrylic and oil pigments, and finished with protective museum-grade glazes. No two frames are identical.'
    },
    {
      q: 'How does the complimentary wax-sealed gift calligraphy note work?',
      a: 'During checkout or on any product page, you can write a personal message (up to 150 words). Our artist hand-inks your words on textured aged parchment using vintage fountain calligraphy, rolled, and sealed with our signature melted gold-leaf wax emblem.'
    },
    {
      q: 'What are the delivery timelines across India?',
      a: 'Because pieces are handcrafted to order, please allow 2 to 3 business days for painting, curing, and framing. Dispatches are handled via Express Air courier with real-time tracking, arriving within 2-4 business days in metropolitan hubs and 4-6 days regionally.'
    },
    {
      q: 'How is the fine art protected during transit?',
      a: 'Each frame is protected in archival glassine paper, surrounded by reinforced 4-corner impact buffers, wrapped in multi-layer shockproof air cushioning, and housed within our heavy-duty atelier presentation box.'
    },
    {
      q: 'What is your studio transit guarantee?',
      a: 'If any piece is damaged in transit, notify our studio with unboxing photos/video within 48 hours at hello@niharikartist.com, and we will rush a handcrafted replacement to your door at zero additional cost.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d] font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block mb-1">Atelier Guidance</span>
          <h1 className="font-display text-4xl text-zinc-100 font-light">Frequently Asked Questions</h1>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#0c241a]/80 border border-emerald-900/60 rounded-2xl overflow-hidden shadow-lg">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-[#123124] transition-colors"
              >
                <span className="font-display text-lg text-[#fbf5e6] font-medium">{faq.q}</span>
                {openIdx === idx ? <ChevronUp className="w-4 h-4 text-[#e8c872] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#a3b8af] flex-shrink-0" />}
              </button>
              {openIdx === idx && (
                <div className="px-6 pb-6 text-xs text-[#a3b8af] leading-relaxed border-t border-emerald-900/60 pt-4 font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}