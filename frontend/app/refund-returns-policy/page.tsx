'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { AlertCircle, Package, XCircle, RefreshCw, Globe, MessageSquare } from 'lucide-react';

const Section = ({ number, icon: Icon, title, children }: {
  number: string; icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode;
}) => (
  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-[#d4af37]" />
      </div>
      <div>
        <span className="text-[10px] text-[#d4af37] uppercase tracking-widest font-semibold">{number}</span>
        <h2 className="font-editorial text-xl text-zinc-100 mt-0.5">{title}</h2>
      </div>
    </div>
    <div className="text-sm text-zinc-300 leading-relaxed space-y-3 pl-14 justified">
      {children}
    </div>
  </div>
);

const Step = ({ num, title, desc }: { num: string; title: string; desc: string }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] font-bold text-xs">{num}</div>
    <div>
      <p className="text-zinc-100 font-semibold text-sm">{title}</p>
      <p className="text-zinc-400 text-xs mt-0.5">{desc}</p>
    </div>
  </div>
);

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">

        {/* Hero */}
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-2">Customer Assurance</span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-zinc-100 font-light mb-4">Refund &amp; Returns Policy</h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Every piece created at niharikartist is individually hand-painted for you. Please read this policy carefully before placing an order.
          </p>
          <p className="text-xs text-zinc-600 mt-3">Last updated: August 2026</p>
        </div>

        <div className="space-y-6">

          {/* 1. Custom Artwork */}
          <Section number="01" icon={AlertCircle} title="Custom & Personalised Artwork Policy">
            <p>
              Because every artwork created at niharikartist is individually hand-painted, hand-lettered, or custom-framed
              for your specific occasion, <strong className="text-zinc-100">personalised orders are non-refundable and non-returnable
              once hand-painting has begun.</strong>
            </p>
            <blockquote className="border-l-2 border-[#d4af37]/50 pl-4 italic text-zinc-400 text-xs">
              "Custom pieces bear unique names, memories, and personal lettering made specifically for you.
              As such, they cannot be returned or resold unless damaged during courier delivery."
            </blockquote>
            <p>
              This applies to all commissioned portraits, name-lettered frames, date-inscribed artworks, and any piece
              where personal details have been incorporated into the design.
            </p>
          </Section>

          {/* 2. Damaged in Transit */}
          <Section number="02" icon={Package} title="Damaged or Defective in Transit — Free Replacement">
            <p>
              We take immense care with our rigid gallery packaging. However, if your artwork arrives damaged or bent
              during transit, we provide a <strong className="text-zinc-100">100% free replacement</strong> — no questions asked.
            </p>
            <div className="space-y-4 mt-2">
              <Step
                num="01"
                title="Notify Within 48 Hours"
                desc="Email us within 48 hours of delivery at hello@niharikartist.com with your Order ID. Claims submitted after 48 hours cannot be processed."
              />
              <Step
                num="02"
                title="Attach Photos / Video"
                desc="Include clear photos or a short unboxing video showing the outer package damage and the condition of the artwork inside."
              />
              <Step
                num="03"
                title="Priority Replacement"
                desc="Once verified, a fresh replacement piece will be hand-painted and dispatched on an express priority timeline at zero additional cost to you."
              />
            </div>
          </Section>

          {/* 3. Cancellations */}
          <Section number="03" icon={XCircle} title="Order Cancellations">
            <p>
              If you need to cancel an order, please contact the studio as soon as possible after placement.
            </p>
            <div className="bg-[#0a2319]/60 border border-[#d4af37]/25 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-emerald-300 font-semibold">Within 24 hours of placing the order</p>
                  <p className="text-zinc-400 mt-0.5">Full refund issued to your original payment method. No questions asked.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-300 font-semibold">After 24 hours — or once painting has begun</p>
                  <p className="text-zinc-400 mt-0.5">Cancellation requests cannot be accepted. No refund will be issued as the artwork creation process will have already commenced.</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              To cancel, email hello@niharikartist.com with subject line <em>"Cancel Order — [Your Order ID]"</em> within the
              eligible window.
            </p>
          </Section>

          {/* 4. Refund Processing */}
          <Section number="04" icon={RefreshCw} title="Refund Processing Timeline">
            <p>
              When a refund is approved — due to eligible cancellation within 24 hours or unresolvable transit damage — the
              following applies:
            </p>
            <ul className="space-y-2 text-xs text-zinc-400 list-none">
              {[
                'Refunds are credited back to the original payment method — UPI, Credit/Debit Card, Net Banking, or Bank Account.',
                'Processing typically takes 5 to 7 business days to reflect in your account, depending on your bank\'s timelines and applicable RBI guidelines.',
                'Razorpay payment gateway refunds are initiated within 1–2 business days of approval on our end.',
                'You will receive an email confirmation once the refund is initiated.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 5. International */}
          <Section number="05" icon={Globe} title="International Orders">
            <p>
              For orders shipped outside India, any customs duties, import taxes, or clearance charges are the
              recipient&apos;s sole responsibility.
            </p>
            <p>
              These charges are levied by the destination country&apos;s customs authority and are not collected by niharikartist.
              They are therefore <strong className="text-zinc-100">non-refundable</strong> under any circumstances.
            </p>
            <p>
              We recommend checking your country&apos;s import regulations before placing an international order.
            </p>
          </Section>

          {/* 6. Grievance */}
          <Section number="06" icon={MessageSquare} title="Grievance Redressal">
            <p>
              If you are not satisfied with how a refund, return, or cancellation request has been handled, you may escalate
              to our Grievance Officer:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-xl p-4 text-xs space-y-1">
              <p className="text-zinc-100 font-semibold">Niharika</p>
              <p className="text-zinc-400">Grievance Officer — niharikartist Fine Art Atelier</p>
              <p>
                <span className="text-zinc-500">Email: </span>
                <a href="mailto:hello@niharikartist.com" className="text-[#d4af37] hover:underline">hello@niharikartist.com</a>
              </p>
              <p className="text-zinc-500 text-[11px] mt-2">
                We aim to acknowledge all grievance escalations within 2 business days and resolve them within 7 business days.
              </p>
            </div>
            <p className="text-xs text-zinc-500">
              Full grievance officer details are also listed on our{' '}
              <Link href="/terms" className="text-[#d4af37] hover:underline">Terms &amp; Conditions</Link> page.
            </p>
          </Section>

          {/* Footer note */}
          <div className="text-center pt-4 text-xs text-zinc-600 space-y-1">
            <p>This policy is governed by the laws of India.</p>
            <p>
              Questions?{' '}
              <Link href="/contact" className="text-[#d4af37] hover:underline">Contact the studio</Link>
              {' '}or read our{' '}
              <Link href="/terms" className="text-[#d4af37] hover:underline">Terms &amp; Conditions</Link>.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
