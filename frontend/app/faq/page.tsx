'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/cms/faqs`)
      .then(r => r.json())
      .then(d => { if (d.success) setFaqs(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d] font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block mb-1">Atelier Guidance</span>
          <h1 className="font-display text-4xl text-zinc-100 font-light">Frequently Asked Questions</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-center text-zinc-500 py-12">No FAQs available yet.</p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-[#0c241a]/80 border border-emerald-900/60 rounded-2xl overflow-hidden shadow-lg">
                <button
                  onClick={() => setOpenIdx(openIdx === faq.id ? null : faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-[#123124] transition-colors"
                >
                  <span className="font-display text-lg text-[#fbf5e6] font-medium">{faq.question}</span>
                  {openIdx === faq.id
                    ? <ChevronUp className="w-4 h-4 text-[#e8c872] flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-[#a3b8af] flex-shrink-0" />}
                </button>
                {openIdx === faq.id && (
                  <div className="px-6 pb-6 text-xs text-[#a3b8af] leading-relaxed border-t border-emerald-900/60 pt-4 font-sans justified">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
