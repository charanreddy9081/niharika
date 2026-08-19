'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Sparkles, Heart, ArrowRight, Star } from 'lucide-react';

export default function CommunityPage() {
  const stories = [
    {
      title: 'A Bond Across Oceans: The London & Mumbai Connection',
      author: 'Aarav & Meera S.',
      image: '/images/product_1_1.jpg',
      excerpt: 'Living 4,000 miles apart, opening the "Whispers of Twilight" keepsake frame on Raksha Bandhan brought our entire childhood back into our living room.'
    },
    {
      title: 'Sunlight in a Winter Apartment',
      author: 'Dr. Ananya Roy',
      image: '/images/product_2_1.jpg',
      excerpt: 'The delicate hand-sculpted petals of "Solace in Golden Light" brighten every morning. It has become the spiritual focal point of our home library.'
    },
    {
      title: 'An Unbroken Vow Inked in Gold Wax',
      author: 'Kabir & Rohan V.',
      image: '/images/product_7_1.jpg',
      excerpt: 'Reading our personal letter handwritten in fountain script and breaking the gold wax seal felt like opening a historic heirloom from a century ago.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d] font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">The Atelier Journal</span>
          <h1 className="font-display text-4xl sm:text-5xl text-zinc-100 font-light">Patron Reflections &amp; Stories</h1>
          <p className="text-xs sm:text-sm text-[#a3b8af] max-w-lg mx-auto">
            Behind every handpainted frame is an intimate tale of reunions, whispered gratitude, and quiet love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stories.map((story, i) => (
            <div key={i} className="bg-[#0c241a]/80 border border-[#e8c872]/20 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#e8c872]/50 transition-all duration-300 shadow-xl">
              <div>
                <div className="relative aspect-[4/3] bg-[#06120d]">
                  <Image src={story.image} alt={story.title} fill className="object-cover" />
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#e8c872] font-semibold block">Patron Chronicle</span>
                  <h3 className="font-display text-xl text-zinc-100">{story.title}</h3>
                  <p className="text-xs text-[#a3b8af] leading-relaxed">{story.excerpt}</p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 border-t border-emerald-900/60 text-xs text-[#627a70] flex items-center justify-between">
                <span>By {story.author}</span>
                <Heart className="w-4 h-4 text-red-400 fill-red-400/40" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0b1f16] border border-[#e8c872]/25 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
          <Sparkles className="w-8 h-8 text-[#e8c872] mx-auto" />
          <h3 className="font-display text-3xl text-zinc-100 font-light">Share Your Atelier Memory</h3>
          <p className="text-xs text-[#a3b8af] leading-relaxed">
            Did your niharikartist frame create a cherished moment? Send us your story or photo to be archived in our exhibition annals.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#e8c872] hover:bg-[#d4b055] text-black px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-colors btn-magnetic"
            >
              <span>Submit Chronicle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}