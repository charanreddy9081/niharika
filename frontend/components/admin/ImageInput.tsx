'use client';

/**
 * Reusable image input — Upload from System OR Enter URL.
 * Uses plain <img> for previews so any URL works without next.config whitelist.
 */

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';

const inputCls = 'w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors';

export interface FileData {
  base64: string;
  fileName: string;
  fileType: string;
  previewUrl: string;
}

interface Props {
  urlValue: string;
  onUrlChange: (url: string) => void;
  onFileSelected: (file: FileData | null) => void;
  selectedFile: FileData | null;
  label?: string;
  required?: boolean;
}

export default function ImageInput({
  urlValue, onUrlChange, onFileSelected, selectedFile,
  label = 'Image', required = false
}: Props) {
  const [mode, setMode] = useState<'file' | 'url'>('url');
  const [imgError, setImgError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { onFileSelected(null); return; }
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, or WebP images are allowed.'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onFileSelected({ base64, fileName: file.name, fileType: file.type, previewUrl: URL.createObjectURL(file) });
    };
    reader.readAsDataURL(file);
  };

  // Reset img error when URL changes
  const handleUrlChange = (v: string) => {
    setImgError(false);
    onUrlChange(v);
  };

  const previewSrc = mode === 'file' ? selectedFile?.previewUrl : urlValue;

  return (
    <div className="space-y-2">
      <label className="block text-[#a3b8af] text-[10px] uppercase tracking-wider">
        {label}{required && ' *'}
      </label>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-[#050f0b] border border-emerald-900/60 rounded-xl w-fit">
        <button type="button" onClick={() => { setMode('url'); onFileSelected(null); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-medium transition-all ${mode === 'url' ? 'bg-[#e8c872] text-black' : 'text-[#a3b8af] hover:text-white'}`}>
          <LinkIcon className="w-3 h-3" /> Enter URL
        </button>
        <button type="button" onClick={() => { setMode('file'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-medium transition-all ${mode === 'file' ? 'bg-[#e8c872] text-black' : 'text-[#a3b8af] hover:text-white'}`}>
          <Upload className="w-3 h-3" /> Upload File
        </button>
      </div>

      {/* URL mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <input
            type="text"
            value={urlValue}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="Paste any image URL — https://example.com/image.jpg"
            className={inputCls}
          />
          <p className="text-[10px] text-[#627a70]">Paste a direct image link from Google, ibb.co, Imgur, or any image host.</p>
          {/* Preview — plain img tag works for ANY URL */}
          {urlValue && !imgError && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-emerald-900/60 bg-[#050f0b]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlValue}
                alt="Preview"
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          {urlValue && imgError && (
            <div className="flex items-center gap-2 text-[11px] text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-xl px-3 py-2">
              <X className="w-3 h-3 flex-shrink-0" />
              <span>Cannot preview this URL — it may still work on the site if it&apos;s a valid direct image link. Make sure it ends in .jpg / .png / .webp</span>
            </div>
          )}
        </div>
      )}

      {/* File upload mode */}
      {mode === 'file' && (
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-emerald-900/80 hover:border-[#e8c872]/60 rounded-xl py-6 flex flex-col items-center gap-2 transition-colors">
            {selectedFile?.previewUrl ? (
              <div className="w-full h-32 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedFile.previewUrl} alt="Preview" className="max-h-28 max-w-full object-contain rounded-lg" />
              </div>
            ) : (
              <>
                <Upload className="w-7 h-7 text-emerald-700" />
                <span className="text-[#a3b8af] text-xs">Click to select image (JPEG / PNG / WebP, max 10MB)</span>
              </>
            )}
            {selectedFile?.fileName && (
              <span className="text-[10px] text-emerald-400">{selectedFile.fileName}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
