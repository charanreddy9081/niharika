'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Search, Package, Palette, Truck, CheckCircle2, MapPin, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const qOrderId = searchParams?.get('orderId') || '';

  const [searchId, setSearchId] = useState(qOrderId);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders/track?orderId=' + encodeURIComponent(searchId.trim()));
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setOrder(null);
        toast.error(data.message || 'No order found with that ID.');
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      toast.error('Could not connect to tracking service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qOrderId) {
      setSearchId(qOrderId);
      handleTrack();
    }
  }, [qOrderId]);

  const copyTracking = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast.success('Tracking number copied to clipboard!');
    }
  };

  const steps = [
    { label: 'Order Placed', icon: Package },
    { label: 'Crafting in Studio', icon: Palette },
    { label: 'Dispatched', icon: Truck },
    { label: 'Out for Delivery', icon: MapPin },
    { label: 'Delivered', icon: CheckCircle2 }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Ordered': return 0;
      case 'Crafting in Studio': return 1;
      case 'Dispatched': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = order ? getStepIndex(order.order_status) : 0;

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Live Status</span>
        <h1 className="font-editorial text-4xl text-zinc-100 font-light">Track Your Handcrafted Artwork</h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-2">
          Enter your Order ID (e.g. NA-84920) or email address to view live crafting and shipment progress.
        </p>
      </div>

      <form onSubmit={handleTrack} className="flex max-w-md mx-auto gap-2 mb-12">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Enter Order ID (e.g. NA-84920)..."
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-3 text-xs text-zinc-100 uppercase placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors"
        >
          {loading ? '...' : 'Track'}
        </button>
      </form>

      {order ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-zinc-800">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold block">Order Reference</span>
              <h3 className="font-editorial text-2xl text-zinc-100 font-mono">{order.order_id}</h3>
              <span className="text-xs text-zinc-400">Placed by {order.customer?.first_name} {order.customer?.last_name}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-mono">{order.courier_partner}: {order.tracking_number}</span>
              <button onClick={copyTracking} className="text-zinc-400 hover:text-[#d4af37] p-1" title="Copy tracking number">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="py-4">
            <div className="grid grid-cols-5 gap-2 text-center">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={idx} className="flex flex-col items-center space-y-2">
                    <div className={'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ' + (isCurrent ? 'bg-[#d4af37] text-black border-[#f3e5ab] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : isCompleted ? 'bg-zinc-800 text-[#d4af37] border-[#d4af37]' : 'bg-zinc-950 text-zinc-600 border-zinc-800')}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={'text-[10px] uppercase tracking-wider font-medium ' + (isCompleted ? 'text-zinc-200' : 'text-zinc-600')}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-800">
            <div>
              <h4 className="font-editorial text-lg text-zinc-200 mb-3">Ordered Artworks</h4>
              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                    <div>
                      <strong className="text-zinc-200 block font-editorial text-sm">{item.name}</strong>
                      <span className="text-zinc-500 text-[10px]">{item.selected_size || 'Standard Frame'}</span>
                    </div>
                    <span className="text-[#f3e5ab] font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-editorial text-lg text-zinc-200 mb-3">Studio Event Log</h4>
              <div className="space-y-3 border-l border-zinc-800 pl-4 text-xs">
                {order.timeline?.map((event: any, idx: number) => (
                  <div key={idx} className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#d4af37]" />
                    <strong className="text-zinc-200 block">{event.status}</strong>
                    <p className="text-zinc-400 text-[11px]">{event.note}</p>
                    <span className="text-[10px] text-zinc-600 block">{new Date(event.timestamp).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : searched && !loading ? (
        <div className="text-center py-12 bg-zinc-950/40 rounded-xl border border-zinc-800 p-6 space-y-2">
          <p className="text-zinc-400 text-xs">No active order found for &quot;{searchId}&quot;.</p>
          <p className="text-zinc-500 text-[11px]">Please verify your order number in your confirmation email or contact our studio.</p>
        </div>
      ) : null}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />
      <Suspense fallback={<div className="p-20 text-center text-zinc-400 font-editorial text-xl">Loading Order Tracker...</div>}>
        <TrackOrderContent />
      </Suspense>
      <Footer />
    </div>
  );
}