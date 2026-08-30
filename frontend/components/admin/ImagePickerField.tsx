'use client';

import React, { useState, useRef } from 'react';
import { Upload, Images, X, Loader2 } from 'lucide-react';
import MediaLibrary from './MediaLibrary';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ImagePickerFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export default function ImagePickerField({ label, value, onChange, placeholder }: ImagePickerFieldProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = () => localStorage.getItem('niharikartist_admin_token') || '';

  const inp = 'flex-1 bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] transition-colors placeholder-emerald-900';
  const lbl = 'text-[10px] uppercase tracking-wider text-[#a3b8af] block mb-1.5 font-semibold';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
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
      if (r.success) onChange(r.url);
      else alert('Upload failed: ' + r.message);
    } catch { alert('Upload failed.'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <>
      <div>
        <label className={lbl}>{label}</label>
        <div className="flex gap-2 items-center">
          <input
            className={inp}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || 'https://… or /images/…'}
          />
          {/* Upload from device */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title="Upload from device"
            className="flex-shrink-0 p-2.5 bg-[#0a2319] border border-emerald-900/60 hover:border-[#e8c872]/50 rounded-xl text-[#a3b8af] hover:text-[#e8c872] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          </button>
          {/* Pick from media library */}
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            title="Pick from Media Library"
            className="flex-shrink-0 p-2.5 bg-[#0a2319] border border-emerald-900/60 hover:border-[#e8c872]/50 rounded-xl text-[#a3b8af] hover:text-[#e8c872] transition-colors"
          >
            <Images className="w-4 h-4" />
          </button>
          {/* Clear */}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="Clear image"
              className="flex-shrink-0 p-2.5 bg-red-950/40 border border-red-900/40 hover:border-red-600 rounded-xl text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        {/* Preview */}
        {value && (
          <div className="mt-2 relative">
            <img
              src={value}
              className="w-full h-32 object-cover rounded-xl border border-emerald-900/50"
              alt="preview"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>

      {/* Media Library picker modal */}
      {showLibrary && (
        <MediaLibrary
          onSelect={url => { onChange(url); setShowLibrary(false); }}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </>
  );
}
