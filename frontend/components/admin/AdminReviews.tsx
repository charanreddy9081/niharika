'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Trash2, RefreshCw, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const token = () => localStorage.getItem('niharikartist_admin_token') || '';
const authH = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() });

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-950/60 border-amber-700/60 text-amber-300',
  approved: 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300',
  rejected: 'bg-red-950/60 border-red-700/60 text-red-300',
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? `${API}/api/admin/reviews`
        : `${API}/api/admin/reviews?status=${filter}`;
      const r = await fetch(url, { headers: authH() }).then(r => r.json());
      if (r.success) setReviews(r.data);
      else toast.error(r.message);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setActing(id);
    try {
      const r = await fetch(`${API}/api/admin/reviews/${id}/status`, {
        method: 'PUT',
        headers: authH(),
        body: JSON.stringify({ status }),
      }).then(r => r.json());
      if (r.success) {
        toast.success(`Review ${status}!`);
        load();
      } else toast.error(r.message);
    } catch { toast.error('Action failed.'); }
    finally { setActing(null); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const r = await fetch(`${API}/api/admin/reviews/${id}`, {
        method: 'DELETE', headers: authH(),
      }).then(r => r.json());
      if (r.success) { toast.success('Deleted.'); load(); }
      else toast.error(r.message);
    } catch { toast.error('Delete failed.'); }
  };

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl text-zinc-100">Patron Reviews</h3>
          <p className="text-xs text-[#a3b8af]">Approve reviews to display them publicly on the site.</p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 bg-[#0a2319] border border-emerald-900 hover:border-[#e8c872]/50 rounded-lg text-[#a3b8af] hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#e8c872]' : ''}`} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all border ${
              filter === f
                ? 'bg-[#e8c872] text-black border-[#e8c872]'
                : 'bg-[#0a2319]/70 border-emerald-900/60 text-[#a3b8af] hover:text-white hover:border-[#e8c872]/40'
            }`}>
            {f} ({f === 'all' ? reviews.length : reviews.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading reviews…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#0a2319]/40 border border-emerald-900/40 rounded-2xl text-zinc-500 text-sm">
          No {filter === 'all' ? '' : filter} reviews.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(rev => (
            <div key={rev.id} className="bg-[#0a2319]/70 border border-emerald-900/50 rounded-2xl p-5 space-y-4 shadow-xl">
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-100">{rev.user_name}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[rev.status]}`}>
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {rev.user_email}
                    {rev.designation ? ` · ${rev.designation}` : ''}
                    {rev.location ? ` · ${rev.location}` : ''}
                  </p>
                  <p className="text-[10px] text-zinc-600">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {/* Star rating */}
                <div className="flex gap-0.5 flex-shrink-0">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${rev.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                  ))}
                </div>
              </div>

              {/* Review text */}
              <blockquote className="text-sm text-zinc-300 leading-relaxed border-l-2 border-[#e8c872]/30 pl-4 italic">
                "{rev.review}"
              </blockquote>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-950 flex-wrap">
                {rev.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(rev.id, 'approved')}
                    disabled={acting === rev.id}
                    className="flex items-center gap-1.5 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve & Publish
                  </button>
                )}
                {rev.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(rev.id, 'rejected')}
                    disabled={acting === rev.id}
                    className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}
                {rev.status === 'approved' && (
                  <button
                    onClick={() => updateStatus(rev.id, 'pending')}
                    disabled={acting === rev.id}
                    className="flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-700/60 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Unpublish
                  </button>
                )}
                <button
                  onClick={() => deleteReview(rev.id)}
                  className="ml-auto flex items-center gap-1.5 text-zinc-600 hover:text-red-400 transition-colors text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
