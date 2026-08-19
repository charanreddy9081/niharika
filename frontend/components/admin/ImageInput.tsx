'use client';

/**
 * Reusable image input component.
 * Lets admin choose between uploading from their system OR entering a URL.
 * Used in AdminArtistImages and AdminJournal modals.
 */

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Link as LinkIcon } from 'lucide-react';

const inputCls = 'w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors';

export interface FileData {
  base64: string;
  fileName: string;
  fileType: string;
  previewUrl: string;
}

interface Props {
  /** Current image URL (used in URL mode) */
  urlValue: string;
  onUrlChange: (url: string) => void;

  /** Called when a file is selected from system */
  onFileSelected: (file: FileData | null) => void;

  /** Currently selected file (null = no file) */
  selectedFile: FileData | null;

  label?: string;
  required?: boolean;
}

export default function ImageInput({ urlValue, onUrlChange, onFileSelected, selectedFile, label = 'Image', required = false }: Props) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { onFileSelected(null); return; }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, or WebP images are allowed.'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB.'); return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onFileSelected({
        base64,
        fileName: file.name,
        fileType: file.type,
        previewUrl: URL.createObjectURL(file),
      });
    };
    reader.readAsDataURL(file);
  };

  const previewSrc = mode === 'file' ? selectedFile?.previewUrl : urlValue;

  return (
    <div className="space-y-2">
      <label className="block text-[#a3b8af] text-[10px] uppercase tracking-wider">
        {label}{required && ' *'}
      </label>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-[#050f0b] border border-emerald-900/60 rounded-xl w-fit">
        <button type="button" onClick={() => setMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-medium transition-all ${mode === 'file' ? 'bg-[#e8c872] text-black' : 'text-[#a3b8af] hover:text-white'}`}>
          <Upload className="w-3 h-3" /> Upload from System
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-medium transition-all ${mode === 'url' ? 'bg-[#e8c872] text-black' : 'text-[#a3b8af] hover:text-white'}`}>
          <LinkIcon className="w-3 h-3" /> Enter URL
        </button>
      </div>

      {/* File mode */}
      {mode === 'file' && (
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-emerald-900/80 hover:border-[#e8c872]/60 rounded-xl py-6 flex flex-col items-center gap-2 transition-colors">
            {selectedFile?.previewUrl ? (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden">
                <Image src={selectedFile.previewUrl} alt="Preview" fill className="object-cover" />
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

      {/* URL mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <input
            type="text"
            value={urlValue}
            onChange={e => onUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg  or  /images/product_1_1.jpg"
            className={inputCls}
          />
          {urlValue && (
            <div className="relative w-24 h-20 rounded-lg overflow-hidden border border-emerald-900/60">
              <Image src={urlValue} alt="Preview" fill className="object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
