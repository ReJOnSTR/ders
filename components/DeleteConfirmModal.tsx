'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  itemCount?: number;
  theme?: 'light' | 'dark';
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemCount,
  theme = 'light',
}: DeleteConfirmModalProps) {
  const isDark = theme === 'dark';
  const isMultiple = (itemCount || 1) > 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`relative z-10 w-full max-w-md rounded-2xl border shadow-2xl p-5 overflow-hidden ${
          isDark
            ? 'bg-[#1e222d] border-[#313748] text-[#f0f2f5]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold">
              {title || (isMultiple ? `${itemCount} Belgeyi Sil` : 'Belgeyi Sil')}
            </h3>
            <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isMultiple ? (
                <>
                  Seçili <span className="font-semibold text-rose-600 dark:text-rose-400">{itemCount} adet belgeyi</span> kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </>
              ) : itemName ? (
                <>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">"{itemName}"</span> başlıklı belgeyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </>
              ) : (
                'Bu belgeyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 pt-3 border-t flex items-center justify-end gap-2 border-slate-100 dark:border-[#2c3242]">
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? 'border-[#383f50] bg-[#242936] text-slate-200 hover:bg-[#2c3242]'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isMultiple ? `${itemCount} Belgeyi Sil` : 'Evet, Sil'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
