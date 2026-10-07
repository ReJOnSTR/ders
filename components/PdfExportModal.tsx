'use client';

import React from 'react';
import { motion } from 'motion/react';
import { FileDown, CheckCircle2, AlertCircle, Loader2, Sparkles, X, Printer } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  progress: {
    current: number;
    total: number;
    percent: number;
    message: string;
  };
  isCompleted: boolean;
  error?: string | null;
  onClose: () => void;
  onFallbackPrint?: () => void;
  theme?: 'light' | 'dark';
}

export default function PdfExportModal({
  isOpen,
  progress,
  isCompleted,
  error,
  onClose,
  onFallbackPrint,
  theme = 'light',
}: PdfExportModalProps) {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-hidden no-print select-none"
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

      {/* 2. Sağ Duvara Bağlı PDF İndirme Penceresi */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[500px] md:w-[560px] max-w-[94vw] h-full h-screen border-l shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#1e212a] border-[#2c303c] text-[#f0f2f5]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`flex items-center justify-between border-b px-5 py-4 transition-colors ${
            isDark ? 'border-[#2c303c] bg-[#242732]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                error
                  ? 'bg-rose-500/10 text-rose-500'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-sky-500/10 text-sky-500'
              }`}
            >
              {error ? (
                <AlertCircle className="h-5 w-5" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                <span>{error ? 'PDF Oluşturulamadı' : isCompleted ? 'PDF Başarıyla İndirildi!' : 'PDF Hazırlanıyor'}</span>
                {!error && !isCompleted && <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />}
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Vektörel baskı çözünürlüğünde A4 sayfası üretimi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-[#2d323f]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#181a20] border-[#2c303c]' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs ${isDark ? 'text-[#949dae]' : 'text-slate-600'}`}>
              {error
                ? 'Sayfalar taranırken bir hata ile karşılaşıldı. Tarayıcınızın yazdırma penceresini alternatif olarak kullanabilirsiniz.'
                : isCompleted
                ? 'Tüm sayfalar yüksek çözünürlüklü vektörel formatta PDF olarak kaydedildi ve indirme başlatıldı.'
                : 'Sayfa içerikleri, sorular ve şekiller tam piksel netliğinde işleniyor. Lütfen bekleyin...'}
            </p>
          </div>

          {/* Progress Bar & Status */}
          {!error && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={`truncate pr-2 ${isDark ? 'text-[#b8bfc9]' : 'text-slate-700'}`}>
                  {progress.message || 'Sayfalar işleniyor...'}
                </span>
                <span className="text-sky-600 dark:text-sky-400 font-mono font-bold shrink-0">
                  %{progress.percent}
                </span>
              </div>

              <div className={`h-3 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#2b2f3c]' : 'bg-slate-100'}`}>
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isCompleted ? 'bg-emerald-500' : 'bg-sky-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, progress.percent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-[#8890a0]">
                <span>1:1 Önizleme Birebir Çıktı</span>
                {progress.total > 0 && (
                  <span className="font-mono font-semibold">
                    {progress.current} / {progress.total} Sayfa
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error message if any */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>Hata Detayı</span>
              </div>
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isDark ? 'border-[#2c303c] bg-[#242732]' : 'border-slate-200 bg-slate-50'
        }`}>
          {error && onFallbackPrint && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onFallbackPrint();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Yazdırma İle Aç</span>
            </button>
          )}

          <div className="ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all cursor-pointer"
            >
              {isCompleted ? 'Tamam, Kapat' : 'Kapat'}
            </button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
