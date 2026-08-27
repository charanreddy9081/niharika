'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, Quote, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Review {
  id: string;
  user_name: string;
  designation: string;
  location?: string;
  photo_url?: string;
  rating: number;
  review: string;
  created_at: string;
}

// ── Star picker ───────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`w-6 h-6 ${(hover || value) >= s ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection() {
  const { user, isGuest } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/reviews`).then(r => r.json());
      if (r.success) setReviews(r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (review.trim().length < 10) { toast.error('Please write at least 10 characters.'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('nha_user_token');
      const r = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, review: review.trim(), designation: designation.trim() || 'Verified Collector', location: location.trim() }),
      }).then(r => r.json());
      if (r.success) {
        setSubmitted(true);
        toast.success(r.message);
      } else {
        toast.error(r.message);
      }
    } catch { toast.error('Could not submit. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="py-20 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">Patron Stories</span>
          <h2 className="font-display text-3xl sm:text-4xl text-zinc-100 font-light">Words from Collectors</h2>
          <p className="text-xs text-[#a3b8af]">Genuine experiences from our patrons across India.</p>
        </div>

        {/* Scrolling reviews marquee */}
        {!loading && reviews.length > 0 && (
          <div className="relative mb-14 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#050f0b] to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#050f0b] to-transparent" />
            <div
              className="flex gap-6"
              style={{ animation: 'testimonialScroll 30s linear infinite', width: 'max-content' }}
              onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
              onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
            >
              {[...reviews, ...reviews].map((t, i) => (
                <div key={`${t.id}-${i}`} className="flex-shrink-0 w-80 bg-[#0a2319]/70 border border-emerald-900/40 p-6 rounded-3xl space-y-4 shadow-xl">
                  <Quote className="w-5 h-5 text-[#e8c872]/40" />
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans italic">"{t.review}"</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${t.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />)}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-emerald-950">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.user_name} className="w-8 h-8 rounded-full object-cover border border-[#e8c872]/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#e8c872]/20 border border-[#e8c872]/30 flex items-center justify-center text-[#e8c872] font-bold text-xs flex-shrink-0">
                        {t.user_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{t.user_name}</p>
                      <p className="text-[10px] text-zinc-500">{t.designation}{t.location ? ` · ${t.location}` : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit form */}
        <div className="max-w-xl mx-auto">
          <div className="bg-[#0a2319]/80 border border-emerald-900/50 rounded-3xl p-8 shadow-xl space-y-5">
            <h3 className="font-display text-xl text-zinc-100">
              {isGuest ? 'Share Your Experience' : `Share Your Experience, ${user?.firstName}`}
            </h3>

            {isGuest ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-zinc-400">Sign in to share your review with our community.</p>
                <a href="/checkout" className="text-[#e8c872] text-xs hover:underline">Sign in to your account →</a>
              </div>
            ) : submitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-sm text-zinc-200 font-medium">Review submitted!</p>
                <p className="text-xs text-zinc-500">Your review is pending approval and will appear here once published.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star rating */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-2">Your Rating *</label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                {/* Review text */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1.5">Your Review *</label>
                  <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with our artwork — the quality, packaging, and how it made you feel..."
                    className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] transition-colors resize-none placeholder-emerald-900"
                    required
                    minLength={10}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1.5">Your Role / Gift Type</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      placeholder="e.g. Birthday Gift, Collector"
                      className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] transition-colors placeholder-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#a3b8af] block mb-1.5">City</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] transition-colors placeholder-emerald-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || review.trim().length < 10}
                  className="w-full bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-90 disabled:opacity-50 text-black font-semibold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Review</>}
                </button>
                <p className="text-[10px] text-zinc-600 text-center">Reviews are published after admin verification.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
