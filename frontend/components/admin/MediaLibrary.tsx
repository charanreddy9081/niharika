'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Copy, Trash2, Image as ImageIcon, RefreshCw, X, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface MediaItem {
  name: string;
  url: string;
  size: number;
  created_at: string;
}

interface Props {
  onSelect?: (url: string) => void; // if passed, shows as a picker modal
  onClose?: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MediaLibrary({ onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = () => localStorage.getItem('niharikartist_admin_token') || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/media`, {
        headers: { Authorization: 'Bearer ' + token() },
      }).then(r => r.json());
      if (r.success) setItems(r.data);
      else toast.error(r.message || 'Failed to load media');
    } catch { toast.error('Could not reach server'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    let successCount = 0;
    for (const file of files) {
      try {
        const reader = new FileReader();
        const base64: string = await new Promise(resolve => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const r = await fetch(`${API}/api/admin/media/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() },
          body: JSON.stringify({ fileName: file.name, fileData: base64, contentType: file.type }),
        }).then(r => r.json());
        if (r.success) successCount++;
        else toast.error(`${file.name}: ${r.message}`);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded!`);
      load();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    toast.success('URL copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteMedia = async (name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const r = await fetch(`${API}/api/admin/media/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token() },
      }).then(r => r.json());
      if (r.success) { toast.success('Deleted.'); load(); }
      else toast.error(r.message);
    } catch { toast.error('Delete failed.'); }
  };

  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  const isPicker = !!onSelect;

  return (
    <div className={isPicker ? 'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-10 overflow-y-auto' : ''}>
      <div className={`${isPicker ? 'w-full max-w-4xl bg-[#0a0f0c] border border-zinc-800 rounded-2xl shadow-2xl' : ''} space-y-5`}>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-1">
          <div>
            <h3 className="font-display text-xl text-zinc-100">Media Library</h3>
            <p className="text-xs text-[#a3b8af]">{items.length} files · Upload images and copy URLs</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="p-2 bg-[#0a2319] border border-emerald-900 hover:border-[#e8c872]/50 rounded-lg text-[#a3b8af] hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-[#e8c872] hover:bg-[#d4b055] disabled:opacity-60 text-black font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
            {isPicker && onClose && (
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-zinc-800">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative px-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files…"
            className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] transition-colors placeholder-zinc-700"
          />
        </div>

        {/* If picker: confirm selection */}
        {isPicker && selected && (
          <div className="mx-1 bg-[#0a2319] border border-[#e8c872]/30 rounded-xl p-3 flex items-center gap-3">
            <img src={selected} alt="selected" className="w-12 h-12 object-cover rounded-lg border border-[#e8c872]/20" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-300 truncate">{selected}</p>
            </div>
            <button
              onClick={() => { onSelect!(selected); onClose?.(); }}
              className="flex items-center gap-1.5 bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Use This
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading media…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto stroke-1" />
            <p className="text-zinc-500 text-sm">{search ? `No files matching "${search}"` : 'No media uploaded yet.'}</p>
            <button onClick={() => fileRef.current?.click()} className="text-[#e8c872] text-xs hover:underline">Upload your first image →</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-1 pb-2">
            {filtered.map(item => (
              <div
                key={item.name}
                onClick={() => isPicker && setSelected(item.url)}
                className={`group relative bg-zinc-900 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                  isPicker && selected === item.url
                    ? 'border-[#e8c872] ring-2 ring-[#e8c872]/30'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="aspect-square">
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  <div className="w-full p-2 space-y-1">
                    <p className="text-[10px] text-zinc-300 truncate font-mono">{item.name}</p>
                    <p className="text-[10px] text-zinc-500">{formatSize(item.size)}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={e => { e.stopPropagation(); copyUrl(item.url); }}
                        className="flex-1 flex items-center justify-center gap-1 bg-[#e8c872]/90 hover:bg-[#e8c872] text-black text-[10px] font-semibold py-1 rounded transition-colors"
                      >
                        {copied === item.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteMedia(item.name); }}
                        className="p-1 bg-red-900/80 hover:bg-red-700 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-300" />
                      </button>
                    </div>
                  </div>
                </div>
                {isPicker && selected === item.url && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#e8c872] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
