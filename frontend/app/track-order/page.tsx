'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import {
  Package, Palette, Truck, CheckCircle2, MapPin, Copy,
  ChevronDown, ChevronUp, XCircle, AlertTriangle, RefreshCw,
  Clock, ShoppingBag, Search, ArrowRight, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Status helpers ────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { label: 'Order Placed',       key: 'Ordered',              icon: Package },
  { label: 'Crafting in Studio', key: 'Crafting in Studio',   icon: Palette },
  { label: 'Dispatched',         key: 'Dispatched',           icon: Truck },
  { label: 'Out for Delivery',   key: 'Out for Delivery',     icon: MapPin },
  { label: 'Delivered',          key: 'Delivered',            icon: CheckCircle2 },
];

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

function isCancelled(status: string) {
  return status?.toLowerCase().includes('cancel');
}

function hoursAgo(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
}

function canCancel(order: any) {
  return !isCancelled(order.order_status) &&
    order.order_status !== 'Delivered' &&
    hoursAgo(order.created_at) <= 24;
}

function timeLeft(dateStr: string) {
  const hrs = 24 - hoursAgo(dateStr);
  if (hrs <= 0) return null;
  const h = Math.floor(hrs);
  const m = Math.floor((hrs - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── Status badge ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cancelled = isCancelled(status);
  const delivered = status === 'Delivered';
  const dispatched = status === 'Dispatched' || status === 'Out for Delivery';
  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border ${
      cancelled  ? 'bg-red-950/60 border-red-700/60 text-red-300' :
      delivered  ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300' :
      dispatched ? 'bg-blue-950/60 border-blue-700/60 text-blue-300' :
                   'bg-amber-950/60 border-amber-700/60 text-amber-300'
    }`}>
      {status}
    </span>
  );
}

// ── Progress stepper ─────────────────────────────────────────────────────
function Stepper({ status }: { status: string }) {
  if (isCancelled(status)) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-xs">
        <XCircle className="w-4 h-4" /> Order cancelled
      </div>
    );
  }
  const currentStep = getStepIndex(status);
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto py-2">
      {STATUS_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done    = idx < currentStep;
        const current = idx === currentStep;
        const future  = idx > currentStep;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center flex-shrink-0 min-w-[60px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                current ? 'bg-[#d4af37] border-[#f3e5ab] text-black shadow-[0_0_12px_rgba(212,175,55,0.5)]' :
                done    ? 'bg-zinc-800 border-[#d4af37] text-[#d4af37]' :
                          'bg-zinc-950 border-zinc-700 text-zinc-600'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] uppercase tracking-wide mt-1.5 text-center leading-tight ${
                done || current ? 'text-zinc-300' : 'text-zinc-600'
              }`}>{step.label}</span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${done ? 'bg-[#d4af37]' : 'bg-zinc-800'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Order card ───────────────────────────────────────────────────────────
function OrderCard({ order, email, onCancelled }: { order: any; email: string; onCancelled: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const eligible = canCancel(order);
  const remaining = timeLeft(order.created_at);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`${API}/api/orders/${order.order_id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onCancelled(order.order_id);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Could not reach server. Please try again.');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className={`bg-zinc-900/40 border rounded-2xl overflow-hidden transition-all ${
      isCancelled(order.order_status) ? 'border-red-900/40' : 'border-zinc-800 hover:border-zinc-700'
    }`}>
      {/* Card header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* Order ID + meta */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono font-bold text-[#d4af37] text-sm">{order.order_id}</span>
              <StatusBadge status={order.order_status} />
            </div>
            <p className="text-[11px] text-zinc-500">{fmtDate(order.created_at)}</p>
            <p className="text-xs text-zinc-400">
              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} ·{' '}
              <span className="text-[#f3e5ab] font-semibold">₹{order.total?.toLocaleString('en-IN')}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cancel button */}
            {eligible && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 border border-red-800/50 hover:border-red-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Order
              </button>
            )}
            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-700/60 px-3 py-1.5 rounded-lg transition-colors"
            >
              {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Hide</> : <><ChevronDown className="w-3.5 h-3.5" /> Details</>}
            </button>
          </div>
        </div>

        {/* Cancellation eligibility hint */}
        {eligible && remaining && !showCancelConfirm && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-400/80">
            <Clock className="w-3 h-3" />
            Cancel window closes in <strong>{remaining}</strong>
          </div>
        )}
        {!eligible && !isCancelled(order.order_status) && order.order_status !== 'Delivered' && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-600">
            <AlertTriangle className="w-3 h-3" />
            Cancellation window expired (24hrs passed)
          </div>
        )}

        {/* Cancel confirm box */}
        {showCancelConfirm && (
          <div className="mt-3 bg-red-950/30 border border-red-800/50 rounded-xl p-3 space-y-2">
            <p className="text-xs text-red-200 font-medium">Cancel this order?</p>
            <p className="text-[11px] text-zinc-400">
              A full refund will be issued to your original payment method within 5–7 business days.
              This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white text-xs px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {cancelling ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling…</> : 'Yes, Cancel Order'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors"
              >
                Keep Order
              </button>
            </div>
          </div>
        )}

        {/* Progress stepper — always visible */}
        <div className="mt-4">
          <Stepper status={order.order_status} />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-zinc-800 px-4 sm:px-5 py-4 space-y-5 bg-zinc-950/30">

          {/* Items */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Items Ordered</h4>
            <div className="space-y-2">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/60">
                  {item.image && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 font-editorial truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {item.selected_size && <span>{item.selected_size} · </span>}
                      Qty: {item.quantity}
                    </p>
                    {item.custom_note && (
                      <p className="text-[10px] text-amber-300/80 italic mt-0.5">"{item.custom_note}"</p>
                    )}
                  </div>
                  <span className="text-[#f3e5ab] text-xs font-semibold flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals + Shipping side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price breakdown */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Price Summary</h4>
              <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/60 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString('en-IN') ?? order.total?.toLocaleString('en-IN')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span><span>−₹{order.discount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery</span>
                  <span>{order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-zinc-100 pt-1.5 border-t border-zinc-800">
                  <span>Total</span>
                  <span className="text-[#f3e5ab]">₹{order.total?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[10px] pt-1">
                  <span>Payment</span><span>{order.payment_method}</span>
                </div>
              </div>
            </div>

            {/* Shipping + Tracking */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Delivery Details</h4>
              <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/60 text-xs space-y-1.5 text-zinc-400">
                <p className="text-zinc-200 text-[11px] leading-relaxed">
                  {order.shipping_address?.street},<br />
                  {order.shipping_address?.city}, {order.shipping_address?.state} — {order.shipping_address?.pincode}
                </p>
                {order.tracking_number && (
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800 mt-1">
                    <span className="text-[10px]">Tracking: <span className="font-mono text-[#d4af37]">{order.tracking_number}</span></span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(order.tracking_number); toast.success('Copied!'); }}
                      className="p-1 text-zinc-500 hover:text-[#d4af37] transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Order Timeline</h4>
              <div className="border-l-2 border-zinc-800 pl-4 space-y-3">
                {[...order.timeline].reverse().map((event: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#d4af37]" />
                    <p className="text-xs text-zinc-200 font-medium">{event.status}</p>
                    {event.note && <p className="text-[11px] text-zinc-500 mt-0.5">{event.note}</p>}
                    <p className="text-[10px] text-zinc-600 mt-0.5">{fmtDate(event.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Guest: single order search ────────────────────────────────────────────
function GuestSearch() {
  const searchParams = useSearchParams();
  const qOrderId = searchParams?.get('orderId') || '';
  const [searchId, setSearchId] = useState(qOrderId);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = useCallback(async (id?: string) => {
    const oid = (id ?? searchId).trim();
    if (!oid) return;
    setLoading(true); setSearched(true);
    try {
      const res = await fetch(`${API}/api/orders/track?orderId=${encodeURIComponent(oid)}`);
      const data = await res.json();
      if (data.success && data.data) setOrder(data.data);
      else { setOrder(null); toast.error(data.message || 'No order found.'); }
    } catch { toast.error('Could not reach server.'); }
    finally { setLoading(false); }
  }, [searchId]);

  useEffect(() => { if (qOrderId) handleTrack(qOrderId); }, [qOrderId]);

  return (
    <div className="space-y-8">
      <form onSubmit={e => { e.preventDefault(); handleTrack(); }} className="flex max-w-md mx-auto gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Order ID (e.g. NA-84920)"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-3 text-xs text-zinc-100 uppercase placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
        <button type="submit" disabled={loading}
          className="bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-5 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
        </button>
      </form>

      {order && (
        <OrderCard order={order} email={order.customer?.email || ''} onCancelled={() => setOrder(null)} />
      )}
      {searched && !loading && !order && (
        <div className="text-center py-10 bg-zinc-950/40 rounded-xl border border-zinc-800 text-xs text-zinc-500">
          No order found for "{searchId}". Please check the ID in your confirmation email.
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-zinc-600">
          <Link href="/admin" className="text-[#d4af37] hover:underline">Sign in</Link> to see all your orders in one place.
        </p>
      </div>
    </div>
  );
}

// ── Authenticated: full My Orders dashboard ───────────────────────────────
function MyOrders({ user }: { user: any }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders/my-orders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) setOrders(data.data);
      else toast.error(data.message || 'Failed to load orders.');
    } catch { toast.error('Could not reach server.'); }
    finally { setLoading(false); }
  }, [user.email]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancelled = (orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.order_id === orderId ? { ...o, order_status: 'Cancelled by Customer' } : o
    ));
  };

  const filtered = orders.filter(o => {
    if (filter === 'active')    return !isCancelled(o.order_status) && o.order_status !== 'Delivered';
    if (filter === 'delivered') return o.order_status === 'Delivered';
    if (filter === 'cancelled') return isCancelled(o.order_status);
    return true;
  });

  const counts = {
    all: orders.length,
    active: orders.filter(o => !isCancelled(o.order_status) && o.order_status !== 'Delivered').length,
    delivered: orders.filter(o => o.order_status === 'Delivered').length,
    cancelled: orders.filter(o => isCancelled(o.order_status)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-editorial text-2xl text-zinc-100">My Orders</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {user.firstName}'s order history · {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={fetchOrders} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#d4af37] transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'delivered', 'cancelled'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all border ${
              filter === f
                ? 'bg-[#d4af37] text-black border-[#d4af37]'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}>
            {f} <span className="ml-1 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading your orders…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-zinc-800 space-y-4">
          <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto stroke-1" />
          <p className="text-zinc-400 text-sm">
            {filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`}
          </p>
          {filter === 'all' && (
            <Link href="/shop"
              className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-6 py-2.5 rounded-full text-xs uppercase tracking-widest transition-all">
              Browse Store <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard
              key={order.order_id}
              order={order}
              email={user.email}
              onCancelled={handleCancelled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────
function TrackOrderContent() {
  const { user, isGuest, isLoading: authLoading } = useAuth();

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">
          {isGuest ? 'Live Status' : 'Order History'}
        </span>
        <h1 className="font-editorial text-4xl text-zinc-100 font-light">
          {isGuest ? 'Track Your Order' : 'Manage Your Orders'}
        </h1>
        {isGuest && (
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2">
            Enter your Order ID to view live crafting and shipment progress.
          </p>
        )}
      </div>

      {authLoading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : isGuest ? (
        <GuestSearch />
      ) : (
        <MyOrders user={user!} />
      )}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center text-zinc-400 font-editorial text-xl">
          Loading…
        </div>
      }>
        <TrackOrderContent />
      </Suspense>
      <Footer />
    </div>
  );
}
