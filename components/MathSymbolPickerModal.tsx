'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Search, Sparkles } from 'lucide-react';
import katex from 'katex';

interface MathSymbolPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
  theme?: 'light' | 'dark';
}

interface SymbolItem {
  label: string;
  latex: string;
  category: 'algebra' | 'sets_func' | 'geo_trig' | 'advanced' | 'logic';
}

const SYMBOLS: SymbolItem[] = [
  // Cebir & Aritmetik
  { label: 'Kesir', latex: '\\frac{a}{b}', category: 'algebra' },
  { label: 'Kare Kök', latex: '\\sqrt{x}', category: 'algebra' },
  { label: 'Dereceli Kök', latex: '\\sqrt[n]{x}', category: 'algebra' },
  { label: 'Üs (Kuvvet)', latex: 'x^{2}', category: 'algebra' },
  { label: 'Alt İndis', latex: 'x_{1}', category: 'algebra' },
  { label: 'Artı Eksi', latex: '\\pm', category: 'algebra' },
  { label: 'Çarpma', latex: '\\cdot', category: 'algebra' },
  { label: 'Çarpı', latex: '\\times', category: 'algebra' },
  { label: 'Bölme', latex: '\\div', category: 'algebra' },
  { label: 'Eşit Değil', latex: '\\neq', category: 'algebra' },
  { label: 'Yaklaşık', latex: '\\approx', category: 'algebra' },
  { label: 'Küçük Eşit', latex: '\\le', category: 'algebra' },
  { label: 'Büyük Eşit', latex: '\\ge', category: 'algebra' },

  // Fonksiyon & Kümeler
  { label: 'Fonksiyon Tanımı', latex: 'f(x) = ', category: 'sets_func' },
  { label: 'Bileşke', latex: '(f \\circ g)(x)', category: 'sets_func' },
  { label: 'Elemanıdır', latex: '\\in', category: 'sets_func' },
  { label: 'Elemanı Değildir', latex: '\\notin', category: 'sets_func' },
  { label: 'Alt Küme', latex: '\\subset', category: 'sets_func' },
  { label: 'Birleşim', latex: '\\cup', category: 'sets_func' },
  { label: 'Kesişim', latex: '\\cap', category: 'sets_func' },
  { label: 'Boş Küme', latex: '\\emptyset', category: 'sets_func' },
  { label: 'Reel Sayılar', latex: '\\mathbb{R}', category: 'sets_func' },
  { label: 'Doğal Sayılar', latex: '\\mathbb{N}', category: 'sets_func' },
  { label: 'Tam Sayılar', latex: '\\mathbb{Z}', category: 'sets_func' },

  // Geometri & Trigonometri
  { label: 'Pi Sayısı', latex: '\\pi', category: 'geo_trig' },
  { label: 'Derece', latex: '45^{\\circ}', category: 'geo_trig' },
  { label: 'Alfa Açısı', latex: '\\alpha', category: 'geo_trig' },
  { label: 'Beta Açısı', latex: '\\beta', category: 'geo_trig' },
  { label: 'Teta Açısı', latex: '\\theta', category: 'geo_trig' },
  { label: 'Üçgen / Delta', latex: '\\Delta', category: 'geo_trig' },
  { label: 'Açı İşareti', latex: 'm(\\widehat{ABC})', category: 'geo_trig' },
  { label: 'Diklik', latex: '\\perp', category: 'geo_trig' },
  { label: 'Paralellik', latex: '\\parallel', category: 'geo_trig' },
  { label: 'Sinüs', latex: '\\sin(x)', category: 'geo_trig' },
  { label: 'Kosinüs', latex: '\\cos(x)', category: 'geo_trig' },
  { label: 'Tanjant', latex: '\\tan(x)', category: 'geo_trig' },

  // İleri Matematik
  { label: 'Limit', latex: '\\lim_{x \\to 0}', category: 'advanced' },
  { label: 'Türev', latex: '\\frac{df}{dx}', category: 'advanced' },
  { label: 'Belirsiz İntegral', latex: '\\int f(x)\\,dx', category: 'advanced' },
  { label: 'Belirli İntegral', latex: '\\int_{a}^{b} f(x)\\,dx', category: 'advanced' },
  { label: 'Toplam Sembolü', latex: '\\sum_{i=1}^{n}', category: 'advanced' },
  { label: 'Sonsuz', latex: '\\infty', category: 'advanced' },
  { label: 'Mutlak Değer', latex: '|x - 3|', category: 'advanced' },

  // Mantık
  { label: 'Ve (Mantık)', latex: 'p \\land q', category: 'logic' },
  { label: 'Veya (Mantık)', latex: 'p \\lor q', category: 'logic' },
  { label: 'İse (Koşullu)', latex: 'p \\implies q', category: 'logic' },
  { label: 'Ancak ve Ancak', latex: 'p \\iff q', category: 'logic' },
  { label: 'Denklik', latex: '\\equiv', category: 'logic' },
  { label: 'Her (Tümel)', latex: '\\forall', category: 'logic' },
  { label: 'Bazı (Varlıksal)', latex: '\\exists', category: 'logic' },
];

export default function MathSymbolPickerModal({
  isOpen,
  onClose,
  onInsert,
  theme = 'light',
}: MathSymbolPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const filteredSymbols = SYMBOLS.filter((item) => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latex.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSelect = (latex: string) => {
    const snippet = `$${latex}$`;
    onInsert(snippet);
    setCopiedSnippet(latex);
    setTimeout(() => {
      setCopiedSnippet(null);
      onClose();
    }, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* 1. Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Sağ Duvara Bağlı Sembol Paleti Penceresi */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] md:w-[580px] max-w-[92vw] h-full h-screen border-l shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDark ? 'bg-[#1e212a] border-[#2c303c] text-[#f0f2f5]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: isDark ? '#2e3342' : '#e2e8f0' }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-bold text-xs">
              {'$\\sqrt{x}$'}
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>LaTeX Matematik &amp; Fen Sembol Paleti</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Eklemek istediğiniz formülü seçtiğinizde imleç konumuna yerleştirilir
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-3 border-b space-y-2" style={{ borderColor: isDark ? '#2e3342' : '#f1f5f9' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sembol veya formül ara (örn: kesir, kök, türev, pi)..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-hidden ${
                isDark ? 'bg-[#181a20] border-[#363c4c] text-white focus:border-sky-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-sky-600'
              }`}
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'algebra', label: 'Cebir & Kök' },
              { id: 'sets_func', label: 'Fonksiyon & Küme' },
              { id: 'geo_trig', label: 'Geometri & Trigonometri' },
              { id: 'advanced', label: 'Türev & İntegral' },
              { id: 'logic', label: 'Mantık' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : isDark
                    ? 'bg-[#282d38] text-slate-300 hover:bg-[#323846]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Symbols Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 min-h-[260px]">
          {filteredSymbols.map((item, idx) => {
            let renderedHtml = item.latex;
            try {
              renderedHtml = katex.renderToString(item.latex, {
                displayMode: false,
                throwOnError: false,
              });
            } catch {
              // fallback
            }

            const isJustCopied = copiedSnippet === item.latex;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item.latex)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group ${
                  isJustCopied
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                    : isDark
                    ? 'border-[#2d323f] bg-[#1a1c23] hover:border-sky-500/50 hover:bg-[#222632]'
                    : 'border-slate-200 bg-slate-50/60 hover:border-sky-400 hover:bg-white shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 truncate">
                    {item.label}
                  </span>
                  {isJustCopied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-mono opacity-0 group-hover:opacity-100 text-sky-600 transition-opacity">
                      Ekle +
                    </span>
                  )}
                </div>

                <div className="h-9 flex items-center justify-center bg-white dark:bg-[#12141a] rounded-lg border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm overflow-hidden px-1">
                  <span dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                </div>

                <div className="text-[9px] font-mono text-slate-400 truncate">
                  ${item.latex}$
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2 border-t text-[11px] text-slate-500 flex items-center justify-between" style={{ borderColor: isDark ? '#2e3342' : '#f1f5f9' }}>
          <span>İpucu: Soru metnine doğrudan <code>$x^2$</code> yazarak da formül oluşturabilirsiniz.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-bold border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
