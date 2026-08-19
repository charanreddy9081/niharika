'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ProductCard } from '../../components/ProductCard';
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams?.get('category') || 'all';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const { c } = useSiteContent('shop');

  useEffect(() => { if (initialCat) setActiveCategory(initialCat); }, [initialCat]);

  useEffect(() => {
    setLoading(true);
    let url = `${API}/api/products?`;
    if (activeCategory && activeCategory !== 'all') url += 'category=' + encodeURIComponent(activeCategory) + '&';
    if (search) url += 'search=' + encodeURIComponent(search) + '&';
    if (sort) url += 'sort=' + sort + '&';
    fetch(url)
      .then(res => res.json())
      .then(data => { if (data.success && Array.isArray(data.data)) setProducts(data.data); })
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, [activeCategory, search, sort]);

  const categories = useMemo(() => [
    { id: 'all', label: 'All Store Artworks' },
    { id: 'Spiritual & Heritage Art', label: 'Spiritual & Heritage' },
    { id: 'Pencil & Graphite Portraits', label: 'Pencil Portraits' },
    { id: 'Original Acrylic Paintings', label: 'Acrylic Paintings' },
    { id: 'Anime Fanart Series', label: 'Anime Fanart' },
    { id: 'Art Print', label: 'Art Prints' }
  ], []);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full font-sans">
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a2319] border border-[#e8c872]/35 text-[#fbf5e6] text-xs uppercase tracking-[0.25em] backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#e8c872] animate-pulse" />
          <span>{c('page_label', 'Original Artworks & Fine Art Prints')}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-zinc-100 font-light tracking-tight">
          {c('page_title', 'Original Fine Art &')}{' '}
          <span className="font-signature text-5xl sm:text-7xl text-[#fbf5e6] drop-shadow-[0_0_25px_rgba(232,200,114,0.45)]">
            {c('page_title_script', 'Catalogue')}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[#a3b8af] max-w-lg mx-auto leading-relaxed">
          {c('page_subtitle', 'Each artwork is rendered on archival canvas or heavyweight ivory paper, accompanied by our signature handwritten wax-sealed scroll.')}
        </p>
      </div>

      <div className="space-y-6 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a3b8af]" />
            <input type="text" placeholder="Search by title, medium, character..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0a2319]/90 border border-emerald-900/80 rounded-full pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-emerald-700 focus:outline-none focus:border-[#e8c872] transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-[#e8c872]" />
            <select value={sort} onChange={e => setSort(e.target.value)} className="bg-[#0a2319] border border-emerald-900/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#e8c872]">
              <option value="featured">Featured Artworks</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">New Releases</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-start gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] text-black font-semibold shadow-[0_0_15px_rgba(232,200,114,0.3)]'
                  : 'bg-[#0a2319]/70 border border-emerald-900/60 text-[#a3b8af] hover:border-[#e8c872]/50 hover:text-white'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[3/4] bg-emerald-950/40 rounded-3xl animate-pulse border border-emerald-900/40" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-[#0a2319]/50 border border-emerald-900/60 rounded-3xl space-y-3">
          <p className="font-display text-2xl text-zinc-300">No Artworks Found</p>
          <button onClick={() => { setActiveCategory('all'); setSearch(''); }} className="bg-[#e8c872] text-black px-6 py-2 rounded-full text-xs uppercase tracking-wider font-semibold inline-block mt-2 btn-magnetic">Show All</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => <ProductCard key={product._id || product.slug} product={product} />)}
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050f0b]">
      <Header />
      <Suspense fallback={<div className="flex-1 text-center py-24 text-zinc-400">Loading fine art catalogue...</div>}>
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  );
}
