'use client';

import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Check, Copy, Shuffle, Layers } from 'lucide-react';
import { BookletMatrixRow } from '@/lib/bookletManager';

interface BookletMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  matrixRows: BookletMatrixRow[];
  bookletCodes: string[];
  docTitle?: string;
  theme?: 'light' | 'dark';
}

export default function BookletMatrixModal({
  isOpen,
  onClose,
  matrixRows,
  bookletCodes,
  docTitle = 'Sınav Belgesi',
  theme = 'light',
}: BookletMatrixModalProps) {
  const isDark = theme === 'dark';
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    let text = `${docTitle} - Kitapçık Karşılaştırmalı Cevap Anahtarı\n\n`;
    text += `Soru\t` + bookletCodes.map((c) => `${c} Kitapçığı`).join('\t') + '\n';

    matrixRows.forEach((row) => {
      const parts = bookletCodes.map((c) => {
        const entry = row.bookletEntries[c];
        return entry ? `${entry.questionNumber}. [${entry.correctAnswer}]` : '—';
      });
      text += `${row.masterIndex}\t${parts.join('\t')}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 no-print select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`relative z-10 w-full max-w-3xl max-h-[88vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-[#1e222d] border-[#313748] text-[#f0f2f5]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`h-14 px-5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-[#313748] bg-[#242936]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-sky-600/20 text-sky-500 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">Tüm Kitapçıklar Cevap Anahtarı</h3>
              <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {bookletCodes.join(', ')} Kitapçıkları Eşleştirme &amp; Karşılaştırma Matrisi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyText}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#383f50] bg-[#2a2f3e] hover:bg-[#343b4e] text-slate-200'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
              }`}
              title="Metin olarak kopyala"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#383f50] bg-[#2a2f3e] hover:bg-[#343b4e] text-slate-200'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
              }`}
              title="Yazdır"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Yazdır</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto p-4 sm:p-5">
          <div className="space-y-4">
            {/* Quick Answer Key Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {bookletCodes.map((code) => (
                <div
                  key={code}
                  className={`p-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#181a22] border-[#2c3242]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-md bg-sky-600 text-white font-black text-[11px] flex items-center justify-center font-mono">
                        {code}
                      </span>
                      <span>{code} Kitapçığı</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {code === 'A' ? 'Orijinal' : 'Karışık'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                    {matrixRows.map((row) => {
                      const entry = row.bookletEntries[code];
                      return (
                        <span
                          key={row.masterIndex}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            isDark
                              ? 'bg-[#242936] border-[#363e52] text-sky-300'
                              : 'bg-white border-slate-300 text-sky-800 shadow-2xs'
                          }`}
                        >
                          {entry ? `${entry.questionNumber}-${entry.correctAnswer}` : '—'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Side-by-Side Question Matching Table */}
            <div
              className={`rounded-xl border overflow-hidden ${
                isDark ? 'border-[#313748]' : 'border-slate-200'
              }`}
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className={`border-b font-bold ${
                      isDark ? 'bg-[#252a38] border-[#313748] text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <th className="p-2.5 w-12 text-center">#</th>
                    <th className="p-2.5">Orijinal Soru Konusu</th>
                    {bookletCodes.map((code) => (
                      <th key={code} className="p-2.5 text-center font-black text-sky-600 dark:text-sky-400">
                        {code} Kitapçığı
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#292f3f]">
                  {matrixRows.map((row) => (
                    <tr
                      key={row.masterIndex}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2.5 text-center font-mono font-bold text-slate-400">
                        {row.masterIndex}
                      </td>
                      <td className="p-2.5 max-w-[200px] truncate text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        {row.questionText}
                      </td>
                      {bookletCodes.map((code) => {
                        const entry = row.bookletEntries[code];
                        return (
                          <td key={code} className="p-2.5 text-center font-mono font-bold">
                            {entry ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                                  isDark ? 'bg-sky-950/60 text-sky-300 border border-sky-800/80' : 'bg-sky-50 text-sky-800 border border-sky-200'
                                }`}
                              >
                                <span>Soru {entry.questionNumber}</span>
                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                  [{entry.correctAnswer}]
                                </span>
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
