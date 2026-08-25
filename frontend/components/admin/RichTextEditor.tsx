'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, List, ListOrdered, Quote, Minus,
  Undo, Redo, Link2, Image as ImageIcon, Code, Heading2, Heading3
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const ToolBtn = ({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      active
        ? 'bg-[#e8c872]/20 text-[#e8c872]'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
    }`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder = 'Write here…', minHeight = 200 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#e8c872] underline' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg my-4' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none px-4 py-3 text-zinc-200 leading-relaxed',
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-emerald-900/80 rounded-xl overflow-hidden bg-[#050f0b] focus-within:border-[#e8c872] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-emerald-900/60 bg-[#071610]">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          <Code className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-4 bg-emerald-900/60 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-4 bg-emerald-900/60 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-4 bg-emerald-900/60 mx-1" />
        <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Add link">
          <Link2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={addImage} active={false} title="Add image by URL">
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-4 bg-emerald-900/60 mx-1 ml-auto" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
