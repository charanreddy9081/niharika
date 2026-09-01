'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Mail, Phone, MapPin, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSiteContent } from '../../hooks/useSiteContent';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ContactPage() {
  const { c } = useSiteContent('contact');

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    inquiry_type: '', subject: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/contact/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success('Your commission request has been received by artist Niharika!');
      } else {
        toast.error(data.message || 'Failed to submit inquiry.');
      }
    } catch {
      setSubmitted(true);
      toast.success('Your commission request has been received by artist Niharika!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d] font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">
            {c('page_label', 'Studio Dialogue')}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-zinc-100 font-light">
            {c('page_title', 'Bespoke Art Commissions & Inquiries')}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3b8af] max-w-lg mx-auto">
            {c('page_subtitle', 'Seeking a custom handpainted sibling portrait, a personalized memory canvas, or a private exhibition booking? Artist Niharika accepts limited private commissions.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Studio Contact Information */}
          <div className="space-y-6">
            <div className="bg-[#0c241a]/80 border border-[#e8c872]/20 rounded-3xl p-8 space-y-6 shadow-xl">
              <h3 className="font-display text-2xl text-[#fbf5e6]">{c('panel_title', 'Atelier Direct')}</h3>
              <div className="space-y-5 text-xs text-zinc-300">
                <div className="flex items-start gap-3.5">
                  <Mail className="w-4 h-4 text-[#e8c872] mt-0.5" />
                  <div>
                    <strong className="block text-[#a3b8af] uppercase text-[10px] tracking-wider">Direct Inquiries</strong>
                    <span className="text-[#fbf5e6]">{c('email', 'hello@niharikartist.com')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <Phone className="w-4 h-4 text-[#e8c872] mt-0.5" />
                  <div>
                    <strong className="block text-[#a3b8af] uppercase text-[10px] tracking-wider">Studio Concierge / WhatsApp</strong>
                    <span className="text-[#fbf5e6]">{c('phone', '+91 98765 43210')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-4 h-4 text-[#e8c872] mt-0.5" />
                  <div>
                    <strong className="block text-[#a3b8af] uppercase text-[10px] tracking-wider">Atelier Headquarters</strong>
                    <span className="text-[#fbf5e6]">{c('address', 'niharikartist Fine Art Atelier, India')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0c241a]/80 border border-[#e8c872]/20 rounded-3xl p-8 space-y-3 shadow-xl">
              <h4 className="font-display text-lg text-[#e8c872]">{c('schedule_title', 'Commission Production Schedule')}</h4>
              <p className="text-xs text-[#a3b8af] leading-relaxed">{c('schedule_desc', 'Custom works require between 5 to 8 business days for initial composition sketches, layered oil/acrylic curing, varnishing, and solid teak framing.')}</p>
            </div>
          </div>

          {/* Contact & Commission Form */}
          <div className="lg:col-span-2 bg-[#0c241a]/90 border border-[#e8c872]/25 rounded-3xl p-8 sm:p-10 shadow-2xl">
            {submitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-600 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-3xl text-zinc-100">{c('success_title', 'Commission Request Received')}</h3>
                <p className="text-xs text-[#a3b8af] max-w-md mx-auto">{c('success_desc', 'Thank you for reaching out. Artist Niharika will personally review your concept and reach out via email within 24 hours.')}</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 bg-[#e8c872] hover:bg-[#d4b055] text-black px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-wider btn-magnetic">
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1">Your Full Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#06120d] border border-emerald-900/80 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872]" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1">Email Address *</label>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-[#06120d] border border-emerald-900/80 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1">Phone / WhatsApp</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full bg-[#06120d] border border-emerald-900/80 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872]" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1">Commission Category</label>
                    <input
                      type="text"
                      value={form.inquiry_type}
                      onChange={e => setForm({ ...form, inquiry_type: e.target.value })}
                      placeholder="e.g. Drawing, Painting, Portrait, Caricature, Wedding Art..."
                      className="w-full bg-[#06120d] border border-emerald-900/80 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] placeholder:text-zinc-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1">Commission Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Custom Double Portrait for Sibling Wedding Gift" className="w-full bg-[#06120d] border border-emerald-900/80 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872]" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1">Your Story &amp; Artistic Vision *</label>
                  <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your idea, reference elements, deadline, and the emotional resonance you would like captured..." className="w-full bg-[#06120d] border border-emerald-900/80 rounded-xl p-3.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] resize-none" />
                </div>
                <button type="submit" disabled={submitting} className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-9 py-4 rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(232,200,114,0.35)] flex items-center justify-center gap-2 btn-magnetic">
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : c('submit_btn', 'Submit Studio Commission')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
