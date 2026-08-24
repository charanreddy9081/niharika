'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ScrollText, ShieldCheck, CreditCard, Truck, Scale, UserCheck, Mail } from 'lucide-react';

const Section = ({ number, icon: Icon, title, children }: {
  number: string; icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode;
}) => (
  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#d4af37]" />
      </div>
      <div>
        <span className="text-[10px] text-[#d4af37] uppercase tracking-widest font-semibold">{number}</span>
        <h2 className="font-editorial text-xl text-zinc-100 mt-0.5">{title}</h2>
      </div>
    </div>
    <div className="text-sm text-zinc-300 leading-relaxed space-y-3 pl-14">
      {children}
    </div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">

        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-2">Studio Agreement</span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-zinc-100 font-light mb-4">Terms &amp; Conditions</h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            By visiting this website or purchasing our artworks, you agree to be bound by the following terms.
            Please read them carefully before placing an order.
          </p>
          <p className="text-xs text-zinc-600 mt-3">Last updated: August 2026</p>
        </div>

        <div className="space-y-6">

          {/* 1. General */}
          <Section number="01" icon={ScrollText} title="General Terms of Use">
            <p>
              Welcome to niharikartist Fine Art Atelier. These terms govern your use of our website and any purchase
              made through it. By accessing any part of this site, you confirm that you are at least 18 years of age
              or have the consent of a parent or legal guardian.
            </p>
            <p>
              All intellectual property rights in original artwork designs, illustrations, brand names, photography,
              and website content belong exclusively to niharikartist. You may not reproduce, distribute, or
              commercially exploit any content without prior written permission.
            </p>
            <p>
              We reserve the right to refuse service, cancel orders, or limit sales to any person or geographic
              region at our sole discretion.
            </p>
          </Section>

          {/* 2. Account & Orders */}
          <Section number="02" icon={UserCheck} title="Account Registration & Guest Access">
            <p>
              You may browse the website as a guest. However, to place an order or proceed to checkout, you are
              required to <strong className="text-zinc-100">create an account or sign in</strong>. This ensures order
              confirmations, shipping updates, and any refund communications reach you reliably.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. niharikartist is
              not liable for any loss arising from unauthorised use of your account.
            </p>
            <p>
              All order information provided — name, address, email, phone — must be accurate. We are not responsible
              for non-delivery caused by incorrect details supplied at checkout.
            </p>
          </Section>

          {/* 3. Payments via Razorpay */}
          <Section number="03" icon={CreditCard} title="Payments — Powered by Razorpay">
            <p>
              All online payments on niharikartist are processed securely through{' '}
              <strong className="text-zinc-100">Razorpay</strong>, a PCI-DSS compliant payment gateway. We accept
              UPI, Credit Cards, Debit Cards, Net Banking, and supported Wallets.
            </p>
            <p>
              By choosing online payment at checkout, you agree to Razorpay&apos;s{' '}
              <a href="https://razorpay.com/terms/" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:underline">
                Privacy Policy
              </a>.
            </p>

            {/* Cancellation & Refund highlight box */}
            <div className="bg-[#0a1f15]/80 border border-[#d4af37]/30 rounded-xl p-5 space-y-3 text-xs mt-2">
              <p className="text-[#d4af37] font-semibold uppercase tracking-wider text-[11px]">Cancellation &amp; Refund Policy — Razorpay Orders</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-300 font-semibold">Cancelled within 24 hours of order placement</p>
                    <p className="text-zinc-400 mt-0.5">
                      A <strong className="text-zinc-200">full refund</strong> will be issued to the original payment method.
                      Refunds are initiated within 1–2 business days and typically reflect in your account within
                      5–7 business days, subject to your bank&apos;s processing timelines.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-semibold">Cancelled after 24 hours — or once painting has begun</p>
                    <p className="text-zinc-400 mt-0.5">
                      <strong className="text-zinc-200">No refund</strong> will be issued. As each artwork is hand-painted
                      specifically for your order, we cannot recover the materials or artist time once work has commenced.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-zinc-500 text-[11px] border-t border-zinc-800 pt-3">
                To request a cancellation within the eligible window, email{' '}
                <a href="mailto:hello@niharikartist.com" className="text-[#d4af37] hover:underline">hello@niharikartist.com</a>
                {' '}with subject <em>"Cancel Order — [Order ID]"</em> immediately after placing your order.
              </p>
            </div>

            <p className="text-xs text-zinc-500">
              niharikartist does not store your card details. All payment data is handled exclusively by Razorpay&apos;s
              encrypted infrastructure.
            </p>
          </Section>

          {/* 4. Shipping */}
          <Section number="04" icon={Truck} title="Shipping & Delivery">
            <p>
              Orders are typically dispatched within 5–10 business days after placement, as each piece is created
              to order. Estimated delivery timelines are communicated at checkout and via email.
            </p>
            <p>
              niharikartist is not liable for delays caused by courier partners, customs clearance, or circumstances
              beyond our control (natural events, strikes, etc.).
            </p>
            <p>
              For international orders, customs duties and import taxes are the sole responsibility of the recipient.
              See our{' '}
              <Link href="/refund-returns-policy" className="text-[#d4af37] hover:underline">
                Refund &amp; Returns Policy
              </Link>{' '}
              for full details.
            </p>
          </Section>

          {/* 5. Intellectual Property */}
          <Section number="05" icon={ShieldCheck} title="Intellectual Property & Artwork Rights">
            <p>
              All original artworks, designs, photographs, and digital assets on this website are the exclusive
              intellectual property of niharikartist. Purchasing a physical artwork does not transfer any copyright
              or reproduction rights to the buyer.
            </p>
            <p>
              You may not photograph, scan, reproduce, or digitally distribute any purchased artwork for commercial
              purposes without explicit written consent from the studio.
            </p>
          </Section>

          {/* 6. Governing Law */}
          <Section number="06" icon={Scale} title="Governing Law & Dispute Resolution">
            <p>
              These terms are governed by and construed in accordance with the laws of India. Any disputes arising
              from the use of this website or any purchase shall be subject to the exclusive jurisdiction of the
              courts of Hyderabad, Telangana.
            </p>
            <p>
              We encourage you to reach out to us directly before initiating any formal dispute. Most concerns can
              be resolved promptly through open communication.
            </p>
          </Section>

          {/* 7. Grievance Officer */}
          <Section number="07" icon={Mail} title="Grievance Officer">
            <p>
              In accordance with the Information Technology Act, 2000, and rules made thereunder, the name and
              contact details of the Grievance Officer are provided below:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-xl p-4 text-xs space-y-1.5">
              <p className="text-zinc-100 font-semibold text-sm">Niharika</p>
              <p className="text-zinc-400">Grievance Officer — niharikartist Fine Art Atelier</p>
              <p><span className="text-zinc-500">Email: </span><a href="mailto:hello@niharikartist.com" className="text-[#d4af37] hover:underline">hello@niharikartist.com</a></p>
              <p className="text-zinc-500 text-[11px] pt-1">
                Grievances will be acknowledged within 2 business days and resolved within 7 business days of receipt.
              </p>
            </div>
          </Section>

          <div className="text-center pt-4 text-xs text-zinc-600 space-y-1">
            <p>These terms may be updated periodically. Continued use of the site constitutes acceptance of any revised terms.</p>
            <p>
              <Link href="/privacy-policy" className="text-[#d4af37] hover:underline">Privacy Policy</Link>
              {' · '}
              <Link href="/refund-returns-policy" className="text-[#d4af37] hover:underline">Refund &amp; Returns Policy</Link>
              {' · '}
              <Link href="/contact" className="text-[#d4af37] hover:underline">Contact Studio</Link>
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
