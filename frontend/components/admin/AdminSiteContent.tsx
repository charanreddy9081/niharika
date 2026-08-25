'use client';

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { invalidateContentCache } from '../../hooks/useSiteContent';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ContentRow {
  id: string;
  section: string;
  content_key: string;
  content_value: string;
  content_type: string;
}

// Human-readable labels for each content key
const LABELS: Record<string, string> = {
  // nav
  announcement_ribbon: 'Announcement Ribbon',
  link_artist: 'Nav: The Artist',
  link_gallery: 'Nav: Gallery',
  link_store: 'Nav: Store',
  link_journal: 'Nav: Journal',
  link_commissions: 'Nav: Commissions',
  link_order_status: 'Nav: Order Status',
  // footer
  brand_tagline: 'Brand Tagline',
  brand_description: 'Brand Description',
  quality_badge: 'Quality Badge',
  copyright: 'Copyright Text',
  guarantee_1_title: 'Guarantee 1 Title',
  guarantee_1_desc: 'Guarantee 1 Description',
  guarantee_2_title: 'Guarantee 2 Title',
  guarantee_2_desc: 'Guarantee 2 Description',
  guarantee_3_title: 'Guarantee 3 Title',
  guarantee_3_desc: 'Guarantee 3 Description',
  guarantee_4_title: 'Guarantee 4 Title',
  guarantee_4_desc: 'Guarantee 4 Description',
  // home
  hero_label: 'Hero Badge Label',
  hero_title_line1: 'Hero Title Line 1',
  hero_title_line2: 'Hero Title Line 2 (Script)',
  hero_description: 'Hero Description',
  hero_btn_primary: 'Hero Primary Button',
  hero_btn_secondary: 'Hero Secondary Button',
  hero_testimonial: 'Hero Testimonial Quote',
  manifesto_label: 'Manifesto Section Label',
  manifesto_title: 'Manifesto Title',
  manifesto_body1: 'Manifesto Body 1',
  manifesto_body2: 'Manifesto Body 2',
  manifesto_quote: 'Manifesto Quote',
  manifesto_quote_author: 'Manifesto Quote Author',
  featured_label: 'Featured Section Label',
  featured_title: 'Featured Section Title',
  pillars_label: 'Pillars Section Label',
  pillars_title: 'Pillars Section Title',
  pillars_step1_title: 'Step 1 Title (e.g. Charcoal Draft)',
  pillars_step1_desc:  'Step 1 Description',
  pillars_step2_title: 'Step 2 Title (e.g. Archival Glazes)',
  pillars_step2_desc:  'Step 2 Description',
  pillars_step3_title: 'Step 3 Title (e.g. Teakwood Framing)',
  pillars_step3_desc:  'Step 3 Description',
  pillars_step4_title: 'Step 4 Title (e.g. Gold Wax Seal)',
  pillars_step4_desc:  'Step 4 Description',
  // artist (shares some keys with home — labels apply by key name)
  origin_label: 'Origin Section Label',
  origin_title: 'Origin Title (Every Brushstroke...)',
  origin_body1: 'Origin Body Paragraph 1',
  origin_body2: 'Origin Body Paragraph 2',
  origin_stat: 'Stats / Rating Text',
  pillar1_title: 'Pillar 1 Title',
  pillar1_desc: 'Pillar 1 Description',
  pillar2_title: 'Pillar 2 Title',
  pillar2_desc: 'Pillar 2 Description',
  pillar3_title: 'Pillar 3 Title',
  pillar3_desc: 'Pillar 3 Description',
  craft_label: 'Craft Section Label',
  craft_title: 'Craft Title',
  craft_body1: 'Craft Body 1',
  craft_body2: 'Craft Body 2',
  cta_title: 'CTA Title',
  cta_description: 'CTA Description',
  cta_btn_primary: 'CTA Primary Button',
  cta_btn_secondary: 'CTA Secondary Button',
  // gallery / shop / community / contact
  page_label: 'Page Label / Badge',
  page_title: 'Page Title',
  page_subtitle: 'Page Subtitle',
  page_title_script: 'Page Title Script Word',
  carousel_label: 'Featured Carousel — Badge Label',
  carousel_title: 'Featured Carousel — Main Title',
  carousel_subtitle: 'Featured Carousel — Subtitle',
  story1_title: 'Story 1 Title',
  story1_author: 'Story 1 Author',
  story1_excerpt: 'Story 1 Excerpt',
  story2_title: 'Story 2 Title',
  story2_author: 'Story 2 Author',
  story2_excerpt: 'Story 2 Excerpt',
  story3_title: 'Story 3 Title',
  story3_author: 'Story 3 Author',
  story3_excerpt: 'Story 3 Excerpt',
  cta_btn: 'CTA Button',
  panel_title: 'Contact Panel Title',
  email: 'Contact Email',
  phone: 'Contact Phone',
  address: 'Address',
  schedule_title: 'Schedule Title',
  schedule_desc: 'Schedule Description',
  success_title: 'Success Title',
  success_desc: 'Success Description',
  submit_btn: 'Submit Button',
};

const SECTION_LABELS: Record<string, string> = {
  nav: '🔗 Navigation',
  footer: '🦶 Footer',
  home: '🏠 Home Page',
  artist: '🎨 Artist / About Page',
  gallery: '🖼️ Gallery Page',
  shop: '🛍️ Store / Shop Page',
  community: '💬 Journal / Community Page',
  contact: '📩 Commissions / Contact Page',
};

const isLongText = (key: string, value: string) =>
  value.length > 80 || key.includes('body') || key.includes('desc') || key.includes('excerpt') || key.includes('description');

export default function AdminSiteContent() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({}); // id -> new value
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    artist: true, nav: true, footer: false, home: false,
    gallery: false, shop: false, community: false, contact: false,
  });

  const token = () => localStorage.getItem('niharikartist_admin_token') || '';

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/content`, {
        headers: { 'Authorization': 'Bearer ' + token() }
      });
      const data = await res.json();
      if (data.success) setRows(data.rows || []);
    } catch {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContent(); }, []);

  const getValue = (row: ContentRow) =>
    edited[row.id] !== undefined ? edited[row.id] : row.content_value;

  const handleChange = (row: ContentRow, value: string) => {
    setEdited(prev => ({ ...prev, [row.id]: value }));
  };

  const hasChanges = Object.keys(edited).length > 0;

  const handleSaveAll = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const updates = Object.entries(edited).map(([id, value]) => {
        const row = rows.find(r => r.id === id);
        return { section: row!.section, content_key: row!.content_key, content_value: value, content_type: row!.content_type };
      });

      const res = await fetch(`${API}/api/admin/content/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ updates })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Invalidate frontend cache so pages pick up new content
      invalidateContentCache();

      toast.success(`${Object.keys(edited).length} content items saved!`);
      setEdited({});
      loadContent();
    } catch (err: any) {
      toast.error(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // Group rows by section
  const grouped = rows.reduce<Record<string, ContentRow[]>>((acc, row) => {
    if (!acc[row.section]) acc[row.section] = [];
    acc[row.section].push(row);
    return acc;
  }, {});

  const sectionOrder = ['nav', 'footer', 'home', 'artist', 'gallery', 'shop', 'community', 'contact'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <RefreshCw className="w-5 h-5 text-[#e8c872] animate-spin" />
        <span className="text-zinc-400 text-sm">Loading content editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-display text-2xl text-zinc-100">Website Content Manager</h3>
          <p className="text-xs text-[#a3b8af] mt-0.5">Edit any text across the website without touching source code. Changes take effect on next page load.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadContent} className="p-2 bg-[#0a2319] border border-emerald-900 hover:border-[#e8c872]/50 rounded-lg text-[#a3b8af] hover:text-white transition-colors" title="Reload">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleSaveAll} disabled={!hasChanges || saving}
            className="bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-90 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider btn-magnetic flex items-center gap-2 shadow-lg">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : `Save Changes${hasChanges ? ` (${Object.keys(edited).length})` : ''}`}</span>
          </button>
        </div>
      </div>

      {/* Unsaved changes notice */}
      {hasChanges && (
        <div className="bg-amber-950/50 border border-amber-700/60 rounded-xl px-4 py-3 text-xs text-amber-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{Object.keys(edited).length} unsaved change{Object.keys(edited).length !== 1 ? 's' : ''}. Click <strong>Save Changes</strong> to publish.</span>
        </div>
      )}

      {/* Sections */}
      {sectionOrder.map(section => {
        const sectionRows = grouped[section];
        if (!sectionRows || sectionRows.length === 0) return null;
        const isOpen = openSections[section] !== false;

        return (
          <div key={section} className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-xl">
            {/* Section Header */}
            <button
              onClick={() => setOpenSections(prev => ({ ...prev, [section]: !isOpen }))}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#0d2a1f]/50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg text-zinc-100">{SECTION_LABELS[section] || section}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
                  {sectionRows.length} fields
                </span>
                {sectionRows.some(r => edited[r.id] !== undefined) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-700/50 uppercase tracking-wider">
                    unsaved
                  </span>
                )}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {/* Fields */}
            {isOpen && (
              <div className="border-t border-emerald-950 divide-y divide-emerald-950/60">
                {sectionRows.map(row => {
                  const currentValue = getValue(row);
                  const isDirty = edited[row.id] !== undefined;
                  const label = LABELS[row.content_key] || row.content_key.replace(/_/g, ' ');
                  const longText = isLongText(row.content_key, currentValue);

                  return (
                    <div key={row.id} className={`px-6 py-4 ${isDirty ? 'bg-amber-950/10' : ''}`}>
                      <div className="flex items-start gap-2 mb-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-[#a3b8af] font-semibold flex-1">{label}</label>
                        <span className="text-[9px] text-emerald-800 font-mono">{row.content_key}</span>
                        {isDirty && <span className="text-[9px] text-amber-400 uppercase tracking-wider">• edited</span>}
                      </div>
                      {longText ? (
                        <textarea
                          rows={Math.min(6, Math.ceil(currentValue.length / 80))}
                          value={currentValue}
                          onChange={e => handleChange(row, e.target.value)}
                          className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] transition-colors resize-y font-sans leading-relaxed"
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={e => handleChange(row, e.target.value)}
                          className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] transition-colors"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
