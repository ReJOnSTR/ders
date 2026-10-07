'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  FileDown,
  Menu,
  X,
  Home,
  Presentation,
  ChevronDown,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { DocumentSettings, BrandSettings, DocumentType } from '@/types/studio';

export type StudioTab = 'home' | 'editor' | 'pool' | 'crop' | 'brand';

interface StudioNavProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  questionCount: number;
  totalPoints: number;
  docTitle: string;
  onDocTitleChange: (newTitle: string) => void;
  onOpenSmartBoard: () => void;
  onPrint: () => void;
  onExportPdfDirect?: (mode: 'student' | 'teacher' | 'color' | 'monochrome' | 'direct') => void;
  docType?: DocumentType;
  onDocTypeChange?: (type: DocumentType) => void;
  settings: DocumentSettings;
  onSettingsChange: (settings: DocumentSettings) => void;
  brand?: BrandSettings;
  onBrandChange?: (brand: BrandSettings) => void;
  onAutoBalancePoints: () => void;
  onGenerateBookletB: () => void;
  theme?: 'light' | 'dark';
}

export default function StudioNav({
  activeTab,
  onTabChange,
  questionCount,
  totalPoints,
  docTitle,
  onOpenSmartBoard,
  onPrint,
  onExportPdfDirect,
  settings,
  onSettingsChange,
  brand,
  onBrandChange,
  theme = 'light',
}: StudioNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const pdfDropdownRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(e.target as Node)) {
        setIsPdfDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleExportPdf = (mode: 'student' | 'teacher' | 'color' | 'monochrome' | 'direct') => {
    setIsPdfDropdownOpen(false);

    if (onExportPdfDirect) {
      // Direct high-quality PDF generation & instant file download
      onExportPdfDirect(mode);
      return;
    }

    // Fallback if direct download not available
    if (mode === 'student') {
      onSettingsChange({ ...settings, isTeacherVersion: false });
    } else if (mode === 'teacher') {
      onSettingsChange({ ...settings, isTeacherVersion: true });
    } else if (mode === 'color') {
      if (onBrandChange && brand) onBrandChange({ ...brand, printColorMode: 'color' });
    } else if (mode === 'monochrome') {
      if (onBrandChange && brand) onBrandChange({ ...brand, printColorMode: 'monochrome' });
    }

    setTimeout(() => {
      onPrint();
    }, 70);
  };

  return (
    <header
      className={`no-print relative h-13 shrink-0 border-b px-3 sm:px-5 flex items-center justify-between z-30 transition-colors select-none backdrop-blur-md ${
        isDark
          ? 'bg-[#20232c]/95 border-[#2c303c] text-[#f0f2f5]'
          : 'bg-white/95 border-slate-200/90 text-slate-900'
      }`}
    >
      {/* 1. Left: Ana Sayfa Butonu + Sadece Belge Başlığı Metni */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Ana Sayfa Butonu */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex items-center gap-1.5 h-8.5 rounded-xl px-2.5 sm:px-3 border transition-all shadow-2xs cursor-pointer shrink-0 ${
            isDark
              ? 'border-[#383f4f] bg-[#242833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900'
          }`}
          title="Ana Sayfaya Dön"
          aria-label="Ana Sayfaya Dön"
        >
          <Home className="h-4 w-4 text-slate-500 dark:text-[#a0a8b7]" />
          <span className="hidden sm:inline text-xs font-semibold">Ana Sayfa</span>
        </button>

        {/* Belge Başlığı (Yalnızca Metin) */}
        <div className="pl-2.5 border-l border-slate-200 dark:border-[#2d323f] min-w-0">
          <span
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#f0f2f5] truncate block max-w-[180px] sm:max-w-[280px] md:max-w-[420px] lg:max-w-[580px]"
            title={docTitle}
          >
            {docTitle}
          </span>
        </div>
      </div>

      {/* 2. Right: Slayt + Yazdır + PDF İndir Butonları */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Slayt Modu Butonu */}
        <button
          type="button"
          onClick={onOpenSmartBoard}
          className={`flex items-center gap-1.5 h-8.5 rounded-xl px-2.5 sm:px-3 text-xs font-semibold border transition-all shadow-2xs cursor-pointer shrink-0 ${
            isDark
              ? 'border-[#383f4f] bg-[#242833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900'
          }`}
          title="Slayt Modu (Tam Ekran Sunum)"
          aria-label="Slayt Modu"
        >
          <Presentation className="h-3.5 w-3.5 text-slate-500 dark:text-[#a0a8b7]" />
          <span className="hidden sm:inline">Slayt</span>
        </button>

        {/* Yazdır Butonu */}
        <button
          type="button"
          onClick={onPrint}
          className={`flex items-center gap-1.5 h-8.5 rounded-xl px-2.5 sm:px-3 text-xs font-semibold border transition-all shadow-2xs cursor-pointer ${
            isDark
              ? 'border-[#383f4f] bg-[#242833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900'
          }`}
          title="Doğrudan Yazdırma Ekranını Aç (Ctrl+P / Command+P)"
        >
          <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-[#a0a8b7]" />
          <span className="hidden sm:inline">Yazdır</span>
        </button>

        {/* 2. AYRI BUTON: PDF İndir (Seçenekli Açılır Menü) */}
        <div className="relative" ref={pdfDropdownRef}>
          <button
            type="button"
            onClick={() => setIsPdfDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 h-8.5 rounded-xl px-3 sm:px-3.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
            title="PDF İndirme ve Dışa Aktarma Seçenekleri"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>PDF İndir</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isPdfDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* PDF Seçenekleri Dropdown Menüsü */}
          {isPdfDropdownOpen && (
            <div
              className={`absolute right-0 top-10 z-50 w-80 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-100 ${
                isDark
                  ? 'bg-[#22252e] border-[#323746] text-[#f0f2f5]'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-[#2b303d] mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                  Doğrudan PDF İndirme Motoru
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#949dae]">
                  Tarayıcı yazdırma diyaloğu olmadan doğrudan .pdf indirir
                </span>
              </div>

              {/* Hızlı İndir (Mevcut Görünüm) */}
              <button
                type="button"
                onClick={() => handleExportPdf('direct')}
                className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left bg-sky-50/70 hover:bg-sky-100/80 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 border border-sky-200/60 dark:border-sky-800/60 transition-colors cursor-pointer mb-1.5"
              >
                <div className="p-1.5 rounded-lg bg-sky-600 text-white shrink-0 mt-0.5 shadow-xs">
                  <FileDown className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                    <span>Hızlı PDF İndir (.pdf)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-600 text-white font-mono">
                      Önerilen
                    </span>
                  </div>
                  <div className="text-[10px] text-sky-800/80 dark:text-sky-300/80 leading-snug">
                    Sayfaları yüksek çözünürlükte derleyip dosyayı anında indirir
                  </div>
                </div>
              </button>

              {/* Seçenek 1: Öğrenci Sınavı (Boş PDF) */}
              <button
                type="button"
                onClick={() => handleExportPdf('student')}
                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-[#2b303e]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                  <EyeOff className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                    Öğrenci Sınavı (Boş PDF)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#949dae] leading-snug">
                    Cevapsız, öğrenci çalışma boşluklu temiz sınav çıktısı
                  </div>
                </div>
              </button>

              {/* Seçenek 2: Öğretmen Sürümü (Çözümlü & Cevaplı PDF) */}
              <button
                type="button"
                onClick={() => handleExportPdf('teacher')}
                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-[#2b303e]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                    Öğretmen Sürümü (Çözümlü PDF)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#949dae] leading-snug">
                    Doğru cevaplar ve detaylı açıklamalar vurgulanır
                  </div>
                </div>
              </button>

              {/* Seçenek 3: Renkli Yayınevi PDF */}
              <button
                type="button"
                onClick={() => handleExportPdf('color')}
                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-[#2b303e]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                    Renkli Baskı (Yüksek Kalite PDF)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#949dae] leading-snug">
                    Yayınevi kalitesinde canlı renkli çıktılar için
                  </div>
                </div>
              </button>

              {/* Seçenek 4: Fotokopi / Gri Tonlama PDF */}
              <button
                type="button"
                onClick={() => handleExportPdf('monochrome')}
                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-[#2b303e]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                    Fotokopi / Gri Tonlama PDF
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#949dae] leading-snug">
                    Riso ve seri fotokopi için net siyah-beyaz çıktı
                  </div>
                </div>
              </button>

              {/* Ayrıcı: Klasik Tarayıcı Yazdırması */}
              <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-[#2b303d]">
                <button
                  type="button"
                  onClick={() => {
                    setIsPdfDropdownOpen(false);
                    onPrint();
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer text-xs font-semibold ${
                    isDark ? 'hover:bg-[#2b303e] text-slate-300' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Printer className="h-3.5 w-3.5 text-slate-400" />
                    <span>Yazıcıdan Yazdır (Ctrl+P)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Fiziksel Baskı</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle (< md) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((o) => !o)}
          className={`md:hidden p-1.5 rounded-xl border shrink-0 cursor-pointer ${
            isDark
              ? 'border-[#333846] bg-[#262a34] text-[#d6dae4] hover:bg-[#2d3240]'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
          aria-label="Menü"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer Menu (< md) */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-13 z-30 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`md:hidden absolute top-13 left-0 right-0 border-b shadow-2xl p-4 flex flex-col gap-3 z-40 animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto ${
              isDark ? 'bg-[#22252f] border-[#2f3442] text-[#f0f2f5]' : 'bg-white border-slate-200'
            }`}
          >
            {/* Yazdırma ve PDF İndirme Butonları */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Yazdırma ve PDF İşlemleri
              </span>
              <button
                type="button"
                onClick={() => {
                  onPrint();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#333846] bg-[#262a34] text-[#d6dae4] hover:bg-[#2d3240]'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Printer className="h-4 w-4" />
                <span>Doğrudan Yazdır</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleExportPdf('student');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold bg-sky-600 text-white shadow-xs"
              >
                <FileDown className="h-4 w-4" />
                <span>Öğrenci Sınavı PDF İndir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleExportPdf('teacher');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs"
              >
                <Eye className="h-4 w-4" />
                <span>Öğretmen Çözümlü PDF İndir</span>
              </button>
            </div>

            {/* Slayt Modu */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#2d323f]">
              <button
                type="button"
                onClick={() => {
                  onOpenSmartBoard();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#373c49] hover:bg-[#414757] text-[#f0f2f5] border-[#4b5264]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <Presentation className="h-4 w-4" />
                <span>Slayt Modunu Başlat (Tam Ekran)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
