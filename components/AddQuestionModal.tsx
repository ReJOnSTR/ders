'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Scissors,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Type,
  BookOpen,
  CheckSquare,
  AlignLeft,
  FormInput,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  QuestionPresentationFormat,
  QuestionType,
  DocumentType,
} from '@/types/studio';
import MathText from '@/components/MathText';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (
    format: QuestionPresentationFormat | 'lecture_block',
    subType?: QuestionType
  ) => void;
  onOpenCropTool: () => void;
  theme?: 'light' | 'dark';
  docType?: DocumentType;
}

export default function AddQuestionModal({
  isOpen,
  onClose,
  onSelectFormat,
  onOpenCropTool,
  theme = 'light',
  docType = 'test',
}: AddQuestionModalProps) {
  const isDark = theme === 'dark';
  const [selectedFormat, setSelectedFormat] = useState<QuestionPresentationFormat | 'lecture_block'>('image_hybrid');
  const [hybridSubType, setHybridSubType] = useState<QuestionType>('multiple_choice');
  const [textSubType, setTextSubType] = useState<QuestionType>('multiple_choice');

  if (!isOpen) return null;

  const handleConfirmAdd = () => {
    if (selectedFormat === 'image_hybrid') {
      onSelectFormat('image_hybrid', hybridSubType);
    } else if (selectedFormat === 'text_only') {
      onSelectFormat('text_only', textSubType);
    } else {
      onSelectFormat(selectedFormat);
    }
    onClose();
  };

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
        className={`fixed inset-0 backdrop-blur-xs cursor-pointer ${
          isDark ? 'bg-black/75' : 'bg-slate-900/45'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Sağ Duvara Bağlı Geniş & İnce Çekmece Masası (CropToolModal ile aynı ölçü ve tasarım) */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[860px] md:w-[1000px] lg:w-[1160px] xl:w-[1300px] max-w-[98vw] h-full h-screen border-l shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#1a1c23] border-[#2c303c] text-[#f0f2f5]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* ================= MODAL TOP HEADER (Compact h-12) ================= */}
        <div
          className={`h-12 shrink-0 border-b px-3 sm:px-4 flex items-center justify-between z-10 transition-colors ${
            isDark ? 'border-[#2c303c] bg-[#20232c]' : 'border-slate-200 bg-white'
          }`}
        >
          {/* Left: Title & Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white font-bold text-xs shrink-0 shadow-2xs">
              <Plus className="h-4 w-4 stroke-[3]" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <h3 className={`text-xs sm:text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Yeni Soru &amp; İçerik Ekleme Masası
              </h3>
              <span className="text-[11px] text-slate-400 hidden lg:inline">
                · 4 Soru Formatı &amp; Föy Blokları
              </span>
            </div>
          </div>

          {/* Right: PDF Kırpıcı Kısayolu + Kapat */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCropTool();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all shadow-2xs cursor-pointer ${
                isDark
                  ? 'border-purple-900/70 bg-purple-950/40 text-purple-300 hover:bg-purple-950/60'
                  : 'border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
              title="PDF dosyasından soru kırpma motorunu aç"
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>PDF&apos;den Soru Kırp &amp; Ekle</span>
            </button>

            <button
              onClick={onClose}
              className={`h-7.5 w-7.5 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:bg-[#2c313f] hover:text-white'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="Kapat (ESC)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Subheader Banner */}
        <div
          className={`px-4 sm:px-6 py-2.5 border-b text-xs flex items-center justify-between gap-3 ${
            isDark
              ? 'bg-[#1e212b] border-[#2c303c] text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse shrink-0" />
            <span>
              Eklemek istediğiniz soru formatını seçin. Seçtiğiniz formata özel ince ve geniş düzenleme editörü otomatik açılacaktır.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            Belge Türü: <strong className="text-sky-500">{docType.toUpperCase()}</strong>
          </span>
        </div>

        {/* ================= MODAL BODY: Format Seçenekleri Grid ================= */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${
            isDark ? 'bg-[#14161c]' : 'bg-slate-50/70'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FORMAT 1: GÖRSEL + SORU TİPLERİ */}
            <div
              onClick={() => setSelectedFormat('image_hybrid')}
              className={`rounded-2xl border p-4 transition-all cursor-pointer relative flex flex-col justify-between group ${
                selectedFormat === 'image_hybrid'
                  ? isDark
                    ? 'border-sky-500 bg-[#1c2233] ring-2 ring-sky-500/40 shadow-lg'
                    : 'border-sky-600 bg-white ring-2 ring-sky-600/20 shadow-md'
                  : isDark
                  ? 'border-[#2c303c] bg-[#1a1c23] hover:border-slate-600 hover:bg-[#20232c]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Görsel + Soru Tipleri</span>
                        {selectedFormat === 'image_hybrid' && (
                          <CheckCircle2 className="h-4 w-4 text-sky-500" />
                        )}
                      </h4>
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                        1. Format · Hibrit Model
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-sky-950/40 text-sky-300 border-sky-800/80' : 'bg-sky-50 text-sky-800 border-sky-200'
                  }`}>
                    En Çok Tercih Edilen
                  </span>
                </div>

                <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Geometri şekli, grafik, tablo veya deney şeması üst alanda yer alır. Altına soru kökü ve seçenekler form olarak eklenir.
                </p>

                {/* Mini Preview Graphic */}
                <div className={`p-2.5 rounded-xl border mb-3 text-[10px] space-y-1.5 font-mono ${
                  isDark ? 'bg-[#15171e] border-[#292e3b]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="h-10 rounded-lg bg-sky-500/10 border border-dashed border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold gap-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>[ Şekil / Grafik / Tablo Görseli ]</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Soru Kökü Metni...</span>
                    <span>10 Puan</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center font-bold text-[9px]">
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">A) ...</div>
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">B) ...</div>
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">C) ...</div>
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">D) ...</div>
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">E) ...</div>
                  </div>
                </div>

                {/* Subtype Selection Chips */}
                <div className="space-y-1.5 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Görsel Altı Soru Türü:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { type: 'multiple_choice' as QuestionType, label: 'Çoktan Seçmeli (5 Şık)', icon: CheckSquare },
                      { type: 'open_ended' as QuestionType, label: 'Açık Uçlu (Klasik)', icon: AlignLeft },
                      { type: 'true_false' as QuestionType, label: 'Doğru / Yanlış', icon: CheckSquare },
                      { type: 'fill_blank' as QuestionType, label: 'Boşluk Doldurma', icon: FormInput },
                    ].map((st) => {
                      const Icon = st.icon;
                      const isSel = hybridSubType === st.type;
                      return (
                        <button
                          key={st.type}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFormat('image_hybrid');
                            setHybridSubType(st.type);
                          }}
                          className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-sky-600 text-white border-sky-600 shadow-2xs font-bold'
                              : isDark
                              ? 'border-[#303644] bg-[#222530] text-slate-300 hover:bg-[#2b3040]'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFormat('image_hybrid', hybridSubType);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Görsel + Soru Olarak Ekle</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* FORMAT 2: SADECE GÖRSEL SORU (KUPÜR) */}
            <div
              onClick={() => setSelectedFormat('image_only')}
              className={`rounded-2xl border p-4 transition-all cursor-pointer relative flex flex-col justify-between group ${
                selectedFormat === 'image_only'
                  ? isDark
                    ? 'border-purple-500 bg-[#221c2e] ring-2 ring-purple-500/40 shadow-lg'
                    : 'border-purple-600 bg-white ring-2 ring-purple-600/20 shadow-md'
                  : isDark
                  ? 'border-[#2c303c] bg-[#1a1c23] hover:border-slate-600 hover:bg-[#20232c]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Sadece Görsel Soru</span>
                        {selectedFormat === 'image_only' && (
                          <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        )}
                      </h4>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                        2. Format · Kırpılmış Kupür
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-purple-950/40 text-purple-300 border-purple-800/80' : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}>
                    Hızlı Baskı
                  </span>
                </div>

                <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Soru metni ve şıklar doğrudan kırpılan görselin içindedir. Form doldurmadan hızlı optik cevap anahtarı belirlenir.
                </p>

                {/* Mini Preview Graphic */}
                <div className={`p-2.5 rounded-xl border mb-3 text-[10px] space-y-1.5 font-mono ${
                  isDark ? 'bg-[#15171e] border-[#292e3b]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="h-14 rounded-lg bg-purple-500/10 border border-purple-500/30 p-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-purple-600 dark:text-purple-300 font-bold text-[10px]">
                      <span>[ PDF Kırpılmış Soru Metni &amp; Şıkları ]</span>
                      <span>1. Soru</span>
                    </div>
                    <div className="text-[9px] text-slate-400 line-clamp-1 font-sans">
                      A) ... B) ... C) ... D) ... E) ... (Görsel İçinde)
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-0.5">
                    <span>Hızlı Optik Cevap:</span>
                    <div className="flex gap-1 font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white">A</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">B</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">C</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">D</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">E</span>
                    </div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border text-[11px] mb-3 ${
                  isDark ? 'bg-[#1b1c26] border-[#303548] text-slate-300' : 'bg-purple-50/60 border-purple-100 text-purple-950'
                }`}>
                  <div className="font-bold flex items-center gap-1 text-purple-600 dark:text-purple-400 mb-0.5">
                    <Scissors className="h-3 w-3" />
                    <span>Daksil &amp; Temiz Baskı Özelliği</span>
                  </div>
                  <span>İstenmeyen eski soru numaralarını veya yayınevi logolarını temizleyip doğrudan kağıda basabilirsiniz.</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFormat('image_only');
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Sadece Görsel Kupür Olarak Ekle</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* FORMAT 3: GÖRSELDEN METNE (OCR) */}
            <div
              onClick={() => setSelectedFormat('image_ocr')}
              className={`rounded-2xl border p-4 transition-all cursor-pointer relative flex flex-col justify-between group ${
                selectedFormat === 'image_ocr'
                  ? isDark
                    ? 'border-amber-500 bg-[#26211c] ring-2 ring-amber-500/40 shadow-lg'
                    : 'border-amber-600 bg-white ring-2 ring-amber-600/20 shadow-md'
                  : isDark
                  ? 'border-[#2c303c] bg-[#1a1c23] hover:border-slate-600 hover:bg-[#20232c]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Görselden Metne (OCR)</span>
                        {selectedFormat === 'image_ocr' && (
                          <CheckCircle2 className="h-4 w-4 text-amber-500" />
                        )}
                      </h4>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        3. Format · Dijital Ayrıştırıcı
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800/80' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    Akıllı OCR
                  </span>
                </div>

                <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Görseldeki soru kökü ve şıkları metin olarak ayıklar, formülleri düzenlenebilir LaTeX/KaTeX dijital metnine çevirir.
                </p>

                {/* Mini Preview Graphic */}
                <div className={`p-2.5 rounded-xl border mb-3 text-[10px] space-y-1.5 font-mono ${
                  isDark ? 'bg-[#15171e] border-[#292e3b]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 rounded bg-amber-500/10 border border-dashed border-amber-500/30 p-1 flex items-center justify-center text-center text-[9px] text-amber-600 dark:text-amber-400">
                      Kaynak Soru Görseli
                    </div>
                    <div className="h-12 rounded bg-emerald-500/10 border border-emerald-500/30 p-1.5 flex flex-col justify-between text-[9px] text-emerald-700 dark:text-emerald-300">
                      <span className="font-bold">⚡ Ayrıştırılan KaTeX</span>
                      <span className="truncate">$f(x) = ax^2 + bx$</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 text-center">
                    Tek tıkla kopyalama &amp; saf metne dönüştürme araçları dahildir.
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border text-[11px] mb-3 ${
                  isDark ? 'bg-[#221f1d] border-[#38332a] text-slate-300' : 'bg-amber-50/60 border-amber-100 text-amber-950'
                }`}>
                  <div className="font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                    Dijital Soru Arşivi Oluşturun
                  </div>
                  <span>Görselleri sadece referans olarak kullanıp soruları tamamen dijitalleştirerek yeniden düzenleyebilirsiniz.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFormat('image_ocr');
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>OCR Dönüştürücü ile Ekle</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* FORMAT 4: SADECE METİNSEL SORU */}
            <div
              onClick={() => setSelectedFormat('text_only')}
              className={`rounded-2xl border p-4 transition-all cursor-pointer relative flex flex-col justify-between group ${
                selectedFormat === 'text_only'
                  ? isDark
                    ? 'border-emerald-500 bg-[#19241f] ring-2 ring-emerald-500/40 shadow-lg'
                    : 'border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-md'
                  : isDark
                  ? 'border-[#2c303c] bg-[#1a1c23] hover:border-slate-600 hover:bg-[#20232c]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Type className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Sadece Metinsel Soru</span>
                        {selectedFormat === 'text_only' && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        4. Format · Saf Metin &amp; KaTeX
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    Görselsiz Klasik
                  </span>
                </div>

                <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Görsel olmadan temiz ve ferah metin alanı; LaTeX formülleri, öncüller (I., II., III.), soru kökü ve seçenekler.
                </p>

                {/* Mini Preview Graphic */}
                <div className={`p-2.5 rounded-xl border mb-3 text-[10px] space-y-1.5 font-mono ${
                  isDark ? 'bg-[#15171e] border-[#292e3b]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-sans text-[11px] leading-snug">
                    <MathText content="Buna göre $\lim_{x \to 0} \frac{\sin x}{x}$ limitinin değeri kaçtır?" />
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center font-bold text-[9px]">
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">A) 0</div>
                    <div className="py-0.5 rounded bg-emerald-600 text-white">B) 1</div>
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">C) 2</div>
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">D) -1</div>
                    <div className="py-0.5 rounded bg-black/5 dark:bg-white/5">E) ∞</div>
                  </div>
                </div>

                {/* Subtype Selection Chips */}
                <div className="space-y-1.5 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Soru Türü Seçimi:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { type: 'multiple_choice' as QuestionType, label: 'Çoktan Seçmeli (5 Şık)', icon: CheckSquare },
                      { type: 'open_ended' as QuestionType, label: 'Açık Uçlu (Klasik)', icon: AlignLeft },
                      { type: 'true_false' as QuestionType, label: 'Doğru / Yanlış', icon: CheckSquare },
                      { type: 'fill_blank' as QuestionType, label: 'Boşluk Doldurma', icon: FormInput },
                    ].map((st) => {
                      const Icon = st.icon;
                      const isSel = textSubType === st.type;
                      return (
                        <button
                          key={st.type}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFormat('text_only');
                            setTextSubType(st.type);
                          }}
                          className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                              : isDark
                              ? 'border-[#303644] bg-[#222530] text-slate-300 hover:bg-[#2b3040]'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFormat('text_only', textSubType);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Metinsel Soru Olarak Ekle</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 5. SEÇENEK: KONU / NOT BLOĞU (FÖY BLOĞU) */}
          <div
            onClick={() => setSelectedFormat('lecture_block')}
            className={`rounded-2xl border p-4 transition-all cursor-pointer relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
              selectedFormat === 'lecture_block'
                ? isDark
                  ? 'border-amber-500 bg-[#28211a] ring-2 ring-amber-500/40 shadow-lg'
                  : 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/20 shadow-md'
                : isDark
                ? 'border-[#2c303c] bg-[#1a1c23] hover:border-slate-600 hover:bg-[#20232c]'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Konu / Not Bloğu (Ders Anlatım Föyü)
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800/80' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    Föy Bloğu
                  </span>
                  {selectedFormat === 'lecture_block' && (
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <p className={`text-xs leading-relaxed max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Soru numarası almaz. Ders anlatım föyleri için formül kutuları, önemli kurallar, dikkat uyarıları, örnek çözümler veya konu özetleri eklemek için kullanılır.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectFormat('lecture_block');
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <span>+ Konu Bloğu Ekle</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ================= MODAL FOOTER BAR (h-14) ================= */}
        <div
          className={`h-14 shrink-0 border-t px-4 sm:px-6 flex items-center justify-between transition-colors ${
            isDark ? 'border-[#2c303c] bg-[#20232c]' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Seçili Format:</span>
            <span className="font-bold text-sky-500 uppercase text-[11px]">
              {selectedFormat === 'image_hybrid'
                ? '1. Görsel + Soru Tipleri'
                : selectedFormat === 'image_only'
                ? '2. Sadece Görsel Soru (Kupür)'
                : selectedFormat === 'image_ocr'
                ? '3. Görselden Metne (OCR)'
                : selectedFormat === 'text_only'
                ? '4. Sadece Metinsel Soru'
                : 'Konu / Not Bloğu'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'border-[#383f4f] bg-[#242833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              İptal
            </button>

            <button
              type="button"
              onClick={handleConfirmAdd}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold bg-sky-600 hover:bg-sky-500 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
            >
              <span>Seçilen Formatı Ekle &amp; Düzenle</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
