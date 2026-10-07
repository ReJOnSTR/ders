'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentSettings, BrandSettings, DocumentType, QuestionItem } from '@/types/studio';
import { COURSE_LIST, GRADE_LIST } from '@/data/mebOutcomes';
import CustomSelect from '@/components/CustomSelect';
import {
  Sliders,
  X,
  ChevronDown,
  FileText,
  Layout,
  Award,
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
  Stamp,
  Printer,
  Scissors,
  Shuffle,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';

interface DocumentSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DocumentSettings;
  onSettingsChange: (settings: DocumentSettings) => void;
  brand: BrandSettings;
  onBrandChange: (brand: BrandSettings) => void;
  docType: DocumentType;
  onDocTypeChange?: (type: DocumentType) => void;
  questions?: QuestionItem[];
  availableBooklets?: string[];
  onAddBooklet?: () => void;
  onRemoveBooklet?: (code: string) => void;
  onReshuffleBooklet?: (code: string) => void;
  onOpenBookletMatrix?: () => void;
  onGenerateBookletB?: () => void;
  onAutoBalancePoints?: () => void;
  theme?: 'light' | 'dark';
}

const FORMAT_OPTIONS: { type: DocumentType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'written', label: 'Ortak Yazılı Sınav', icon: GraduationCap },
  { type: 'test', label: 'Yaprak Test', icon: FileText },
  { type: 'lecture', label: 'Konu & Ders Föyü', icon: BookOpen },
  { type: 'exam', label: 'Deneme Sınavı', icon: Award },
  { type: 'question_bank', label: 'Soru Bankası', icon: Layout },
];

export default function DocumentSettingsDrawer({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  brand,
  onBrandChange,
  docType,
  onDocTypeChange,
  questions = [],
  availableBooklets = ['A', 'B'],
  onAddBooklet,
  onRemoveBooklet,
  onReshuffleBooklet,
  onOpenBookletMatrix,
  onGenerateBookletB,
  onAutoBalancePoints,
  theme = 'light',
}: DocumentSettingsDrawerProps) {
  const isDark = theme === 'dark';

  // State for collapsible accordion sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    header: false,
    layout: true,
    exam: true,
    watermark: false,
    print: false,
  });

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const isWrittenExam = docType === 'written';

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenSections({
      header: true,
      layout: true,
      exam: true,
      watermark: true,
      print: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      header: false,
      layout: false,
      exam: false,
      watermark: false,
      print: false,
    });
  };

  const updateSettings = (partial: Partial<DocumentSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const updateBrand = (partial: Partial<BrandSettings>) => {
    onBrandChange({ ...brand, ...partial });
  };

  const allOpen = Object.values(openSections).every(Boolean);

  // Common styling classes based on theme
  const inputBgClass = isDark
    ? 'border-[#383f50] bg-[#1c1e26] text-[#f0f2f5] placeholder-[#6b7385] focus:border-[#525b70]'
    : 'border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:border-stone-900';

  const labelClass = isDark ? 'text-[#d6dae4]' : 'text-stone-700';
  const helperTextClass = isDark ? 'text-[#949dae]' : 'text-stone-500';

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          {/* Backdrop overlay for mobile (< md) */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="no-print fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Right Settings Sidebar: Pushes page content on desktop, overlay on mobile */}
          <motion.aside
            key="settings-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className={`no-print fixed md:relative inset-y-0 right-0 z-50 md:z-10 max-w-[88vw] flex flex-col border-l shadow-2xl md:shadow-xs select-none h-full overflow-hidden shrink-0 transition-colors ${
              isDark
                ? 'bg-[#1a1c23] border-[#2c303c] text-[#f0f2f5]'
                : 'bg-white border-stone-200/90 text-stone-900'
            }`}
          >
            <div className="w-[400px] max-w-[88vw] h-full flex flex-col shrink-0">
              {/* Drawer Header */}
              <div
                className={`flex items-center justify-between border-b px-4 sm:px-5 py-3 shrink-0 transition-colors ${
                  isDark
                    ? 'bg-[#20232c] border-[#2c303c]'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-2xs"
                  >
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <h3
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'text-[#f0f2f5]' : 'text-stone-900'
                      }`}
                    >
                      Belge &amp; Sınav Ayarları
                    </h3>
                    <p className={`text-[10px] ${helperTextClass}`}>
                      Kâğıt formu, sınav modu, mizanpaj ve baskı
                    </p>
                  </div>
                </div>
              </div>

              {/* Drawer Body: Format Selector + Collapsible Accordion Sections */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-xs">
                {/* Format Switcher */}
                {onDocTypeChange && (
                  <div
                    className={`rounded-2xl border p-3 shadow-2xs space-y-2 transition-colors ${
                      isDark
                        ? 'bg-[#22252e] border-[#2e323e]'
                        : 'bg-stone-50/90 border-stone-200/90'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        isDark ? 'text-[#949dae]' : 'text-stone-500'
                      }`}
                    >
                      Belge Formatını Değiştir
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FORMAT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = docType === opt.type;
                        return (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => onDocTypeChange(opt.type)}
                            className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-sky-600 text-white shadow-xs border-transparent'
                                : isDark
                                ? 'bg-[#252833] text-[#d6dae4] border border-[#383f4f] hover:bg-[#2c313f] hover:text-white'
                                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                            }`}
                          >
                            <Icon
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive
                                  ? 'text-white'
                                  : isDark ? 'text-[#838c9e]' : 'text-stone-500'
                              }`}
                            />
                            <span className="truncate">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section 1: Belge Başlığı ve Künye */}
                <div
                  className={`rounded-xl border overflow-hidden shadow-2xs transition-colors ${
                    isDark
                      ? 'border-[#2e323e] bg-[#22252e]'
                      : 'border-stone-200/90 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection('header')}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#252833] hover:bg-[#2b2f3d]'
                        : 'bg-stone-50/70 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-sky-500" />
                      <span className={`font-bold ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                        Başlık ve Bilgiler
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium max-w-[120px] truncate ${helperTextClass}`}>
                        {settings.gradeLevel} · {settings.courseName}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isDark ? 'text-[#949dae]' : 'text-stone-400'
                        } ${openSections.header ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {openSections.header && (
                    <div
                      className={`p-3.5 space-y-3 border-t animate-in fade-in-50 duration-150 ${
                        isDark ? 'border-[#2b2f3b] bg-[#22252e]' : 'border-stone-100 bg-white'
                      }`}
                    >
                      <div>
                        <span className={`${labelClass} font-semibold block mb-1`}>
                          Belge Ana Başlığı
                        </span>
                        <input
                          type="text"
                          value={settings.title}
                          onChange={(e) => updateSettings({ title: e.target.value })}
                          className={`w-full rounded-lg border px-3 py-1.5 focus:outline-hidden transition-colors ${inputBgClass}`}
                          placeholder="örn: 9. Sınıf Matematik — 1. Dönem 1. Yazılı"
                        />
                      </div>

                      <div>
                        <span className={`${labelClass} font-semibold block mb-1`}>
                          Alt Başlık / Konu
                        </span>
                        <input
                          type="text"
                          value={settings.subTitle}
                          onChange={(e) => updateSettings({ subTitle: e.target.value })}
                          className={`w-full rounded-lg border px-3 py-1.5 focus:outline-hidden transition-colors ${inputBgClass}`}
                          placeholder="örn: Fonksiyonlar ve Kümeler"
                        />
                      </div>

                      <div>
                        <span className={`${labelClass} font-semibold block mb-1`}>
                          Dönem / Sınav Künyesi
                        </span>
                        <input
                          type="text"
                          value={settings.termInfo}
                          onChange={(e) => updateSettings({ termInfo: e.target.value })}
                          className={`w-full rounded-lg border px-3 py-1.5 focus:outline-hidden transition-colors ${inputBgClass}`}
                          placeholder="örn: 2026-2027 Eğitim Öğretim Yılı"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className={`${labelClass} font-semibold block mb-1`}>
                            Ders
                          </span>
                          <CustomSelect
                            value={settings.courseName}
                            onChange={(val) => updateSettings({ courseName: val })}
                            options={COURSE_LIST.map((c) => ({ value: c, label: c }))}
                            theme={theme}
                            size="sm"
                          />
                        </div>

                        <div>
                          <span className={`${labelClass} font-semibold block mb-1`}>
                            Sınıf Seviyesi
                          </span>
                          <CustomSelect
                            value={settings.gradeLevel}
                            onChange={(val) => updateSettings({ gradeLevel: val })}
                            options={GRADE_LIST.map((g) => ({ value: g, label: g }))}
                            theme={theme}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div>
                        <span className={`${labelClass} font-semibold block mb-1`}>
                          Sınav Süresi
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="10"
                            max="240"
                            step="5"
                            value={settings.durationMinutes}
                            onChange={(e) => updateSettings({ durationMinutes: Number(e.target.value) })}
                            className={`w-24 rounded-lg border px-3 py-1.5 font-bold transition-colors ${inputBgClass}`}
                          />
                          <span className={`${helperTextClass} font-medium`}>
                            Dakika
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Kâğıt, Sayfa ve Mizanpaj */}
                <div
                  className={`rounded-xl border overflow-hidden shadow-2xs transition-colors ${
                    isDark
                      ? 'border-[#2e323e] bg-[#22252e]'
                      : 'border-stone-200/90 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection('layout')}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#252833] hover:bg-[#2b2f3d]'
                        : 'bg-stone-50/70 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layout className="h-4 w-4 text-emerald-500" />
                      <span className={`font-bold ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                        Kâğıt, Sayfa ve Mizanpaj
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isDark
                            ? 'bg-[#2e3444] text-[#cbd1de]'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {settings.paperFormat || 'A4'} ·{' '}
                        {settings.orientation === 'landscape' ? 'Yatay' : 'Dikey'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isDark ? 'text-[#949dae]' : 'text-stone-400'
                        } ${openSections.layout ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {openSections.layout && (
                    <div
                      className={`p-3.5 space-y-3 border-t animate-in fade-in-50 duration-150 ${
                        isDark ? 'border-[#2b2f3b] bg-[#22252e]' : 'border-stone-100 bg-white'
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className={`${labelClass} font-semibold block mb-1`}>
                            Kâğıt Formu
                          </span>
                          <CustomSelect
                            value={settings.paperFormat || 'A4'}
                            onChange={(val) => updateSettings({ paperFormat: val as any })}
                            options={[
                              { value: 'A4', label: 'A4 (210×297 mm)' },
                              { value: 'A3', label: 'A3 (297×420 mm)' },
                              { value: 'B5', label: 'B5 (176×250 mm)' },
                              { value: 'Letter', label: 'Letter (216×279 mm)' },
                            ]}
                            theme={theme}
                            size="sm"
                          />
                        </div>

                        <div>
                          <span className={`${labelClass} font-semibold block mb-1`}>
                            Yönlendirme
                          </span>
                          <CustomSelect
                            value={settings.orientation || 'portrait'}
                            onChange={(val) => updateSettings({ orientation: val as any })}
                            options={[
                              { value: 'portrait', label: 'Dikey (Portrait)' },
                              { value: 'landscape', label: 'Yatay (Landscape)' },
                            ]}
                            theme={theme}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className={`${labelClass} font-semibold block mb-1`}>
                            Sayfa Başı Soru
                          </span>
                          <CustomSelect
                            value={String(settings.questionsPerPage || 0)}
                            onChange={(val) => updateSettings({ questionsPerPage: Number(val) })}
                            options={[
                              { value: '0', label: '⚡ Otomatik Akış' },
                              { value: '2', label: '2 Soru / Sayfa' },
                              { value: '3', label: '3 Soru / Sayfa' },
                              { value: '4', label: '4 Soru / Sayfa' },
                              { value: '5', label: '5 Soru / Sayfa' },
                              { value: '6', label: '6 Soru / Sayfa' },
                              { value: '8', label: '8 Soru / Sayfa' },
                              { value: '10', label: '10 Soru / Sayfa' },
                            ]}
                            theme={theme}
                            size="sm"
                          />
                        </div>

                        <div>
                          <span className={`${labelClass} font-semibold block mb-1`}>
                            Yazı Yoğunluğu
                          </span>
                          <CustomSelect
                            value={settings.fontSizeScale || 'normal'}
                            onChange={(val) => updateSettings({ fontSizeScale: val as any })}
                            options={[
                              { value: 'compact', label: 'Kompakt (Sıkışık)' },
                              { value: 'normal', label: 'Standart (MEB)' },
                              { value: 'large', label: 'Geniş (Rahat)' },
                            ]}
                            theme={theme}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div>
                        <span className={`${labelClass} font-semibold block mb-1`}>
                          Sütun Düzeni
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => updateSettings({ columnCount: 1 })}
                            className={`py-2 px-2 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer min-w-0 truncate ${
                              settings.columnCount === 1
                                ? 'bg-sky-600 text-white shadow-xs border-transparent'
                                : isDark
                                ? 'border-[#383f4f] bg-[#252833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            1 Sütun (Geniş)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSettings({ columnCount: 2 })}
                            className={`py-2 px-2 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer min-w-0 truncate ${
                              settings.columnCount === 2
                                ? 'bg-sky-600 text-white shadow-xs border-transparent'
                                : isDark
                                ? 'border-[#383f4f] bg-[#252833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            2 Sütun (Standart)
                          </button>
                        </div>
                      </div>

                      {/* Soru Boşluğu & Aralık Ölçüsü */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`${labelClass} font-semibold block`}>
                            Soru Boşluğu &amp; Aralık Ölçüsü
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">
                            {settings.questionSpacing === 'compact' ? 'Kompakt' : settings.questionSpacing === 'relaxed' ? 'Geniş' : 'Standart'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'compact' as const, label: 'Kompakt' },
                            { id: 'normal' as const, label: 'Standart' },
                            { id: 'relaxed' as const, label: 'Geniş' },
                          ].map((sp) => {
                            const isSelected = (settings.questionSpacing || 'normal') === sp.id;
                            return (
                              <button
                                key={sp.id}
                                type="button"
                                onClick={() => updateSettings({ questionSpacing: sp.id })}
                                className={`py-1.5 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer min-w-0 truncate ${
                                  isSelected
                                    ? 'bg-sky-600 text-white shadow-xs border-transparent'
                                    : isDark
                                    ? 'border-[#383f4f] bg-[#252833] text-[#d6dae4] hover:bg-[#2c313f]'
                                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                                }`}
                              >
                                {sp.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Manuel Sayfa Sonları Yönetimi */}
                      <div
                        className={`rounded-lg p-2.5 border text-[11px] transition-colors ${
                          isDark
                            ? 'bg-[#1e2129] border-[#2e3340] text-[#cbd1de]'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between font-semibold mb-1 ${
                            isDark ? 'text-[#e5e8ef]' : 'text-stone-800'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Scissors className="h-3.5 w-3.5 text-sky-500" />
                            Manuel Sayfa Sonları (Page Break):
                          </span>
                          <span
                            className={`font-mono px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isDark
                                ? 'bg-[#2a2f3c] text-[#d6dae4]'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {(settings.manualPageBreaks || []).length} Adet
                          </span>
                        </div>
                        <p className={`text-[10px] mb-2 leading-relaxed ${helperTextClass}`}>
                          Soruların altındaki ✂️ butonuna tıklayarak istediğiniz sorudan hemen sonra yeni bir kâğıda geçebilirsiniz.
                        </p>
                        {(settings.manualPageBreaks || []).length > 0 && (
                          <button
                            type="button"
                            onClick={() => updateSettings({ manualPageBreaks: [] })}
                            className={`w-full py-1 text-center font-bold border rounded-lg transition-colors cursor-pointer ${
                              isDark
                                ? 'text-rose-300 border-rose-900/60 bg-rose-950/40 hover:bg-rose-950/70'
                                : 'text-rose-700 hover:text-rose-900 border-rose-200 bg-white hover:bg-rose-50'
                            }`}
                          >
                            Tüm Manuel Sayfa Sonlarını Kaldır
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Sınav & Kitapçık Modu */}
                <div
                  className={`rounded-xl border overflow-hidden shadow-2xs transition-colors ${
                    isDark
                      ? 'border-[#2e323e] bg-[#22252e]'
                      : 'border-stone-200/90 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection('exam')}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#252833] hover:bg-[#2b2f3d]'
                        : 'bg-stone-50/70 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shuffle className="h-4 w-4 text-sky-500" />
                      <span className={`font-bold ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                        Sınav &amp; Kitapçık Modu
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate max-w-[130px] ${
                          isDark
                            ? 'bg-[#2e3444] text-[#cbd1de]'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {settings.bookletType || 'A'} · {settings.isTeacherVersion ? 'Öğretmen' : 'Öğrenci'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isDark ? 'text-[#949dae]' : 'text-stone-400'
                        } ${openSections.exam ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {openSections.exam && (
                    <div
                      className={`p-3.5 space-y-4 border-t animate-in fade-in-50 duration-150 ${
                        isDark ? 'border-[#2b2f3b] bg-[#22252e]' : 'border-stone-100 bg-white'
                      }`}
                    >
                      {/* 1. Sürüm Modu: Öğrenci Sınavı vs Öğretmen Çözümlü */}
                      <div>
                        <span className={`${labelClass} font-bold block mb-1.5 text-xs`}>
                          Sınav Sürümü &amp; Görünüm Modu:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-[#191c24] border border-stone-200 dark:border-[#2e3444]">
                          <button
                            type="button"
                            onClick={() => updateSettings({ isTeacherVersion: false })}
                            className={`h-9 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-0 ${
                              !settings.isTeacherVersion
                                ? 'bg-sky-600 text-white shadow-xs font-bold'
                                : isDark
                                ? 'text-[#a0a8b8] hover:text-white hover:bg-white/5'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
                            }`}
                            title="Öğrenci Sınavı: Cevapsız, temiz sınav çıktısı"
                          >
                            <EyeOff className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Öğrenci Sınavı</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateSettings({ isTeacherVersion: true })}
                            className={`h-9 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-0 ${
                              settings.isTeacherVersion
                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                : isDark
                                ? 'text-[#a0a8b8] hover:text-white hover:bg-white/5'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
                            }`}
                            title="Öğretmen Sürümü: Doğru cevaplar ve çözümler vurgulanır"
                          >
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Öğretmen (Çözümlü)</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Çoklu Kitapçık Modu (A, B, C, D... ve Karıştırma) */}
                      <div
                        className={`pt-3 border-t space-y-2.5 ${
                          isDark ? 'border-[#2b2f3b]' : 'border-stone-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`${labelClass} font-bold text-xs truncate`}>
                            Kitapçıklar ({availableBooklets.length} Adet):
                          </span>
                          {onAddBooklet && availableBooklets.length < 6 && (
                            <button
                              type="button"
                              onClick={onAddBooklet}
                              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Plus className="h-3.5 w-3.5 shrink-0" />
                              <span>+ Kitapçık Ekle</span>
                            </button>
                          )}
                        </div>

                        {/* Kitapçık Seçim Rozetleri - 2 Sütunlu Asla Taşmayan Düzen */}
                        <div className="grid grid-cols-2 gap-2">
                          {availableBooklets.map((code) => {
                            const isActive = (settings.bookletType || 'A') === code;
                            return (
                              <button
                                key={code}
                                type="button"
                                onClick={() => updateSettings({ bookletType: code as any })}
                                className={`h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-1.5 transition-all cursor-pointer min-w-0 ${
                                  isActive
                                    ? 'bg-sky-600 text-white shadow-xs border-transparent'
                                    : isDark
                                    ? 'border-[#383f4f] bg-[#252833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                      isActive
                                        ? 'bg-white/20 text-white'
                                        : isDark
                                        ? 'bg-[#1c202a] text-sky-400'
                                        : 'bg-sky-50 text-sky-700'
                                    }`}
                                  >
                                    {code}
                                  </span>
                                  <span className="truncate">{code} Kitapçığı</span>
                                </div>
                                <span className="text-[10px] font-mono opacity-80 font-normal shrink-0">
                                  {code === 'A' ? 'Asıl' : 'Karışık'}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Aktif Kitapçık Aksiyonları (Yeniden Karıştır, Sil, vb.) */}
                        {(settings.bookletType || 'A') !== 'A' ? (
                          <div
                            className={`p-2.5 rounded-xl border text-xs flex flex-col gap-2 ${
                              isDark ? 'bg-[#1c202a] border-[#2e3444]' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-sky-600 dark:text-sky-400 block truncate">
                                  {settings.bookletType} Kitapçığı Aktif
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  Sorular ve şıklar otomatik karıştırılmıştır
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {onReshuffleBooklet && (
                                  <button
                                    type="button"
                                    onClick={() => onReshuffleBooklet(settings.bookletType || 'B')}
                                    className={`h-7 px-2 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                                      isDark
                                        ? 'border-[#383f4f] bg-[#242833] text-slate-200 hover:bg-[#2c313f]'
                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                                    title="Bu kitapçığın soru sırasını ve şıklarını yeniden karıştır"
                                  >
                                    <Shuffle className="h-3 w-3 text-sky-500 shrink-0" />
                                    <span className="whitespace-nowrap">Karıştır</span>
                                  </button>
                                )}

                                {onRemoveBooklet && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveBooklet(settings.bookletType || 'B')}
                                    className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                      isDark
                                        ? 'border-rose-900/60 text-rose-400 hover:bg-rose-950/50'
                                        : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                    }`}
                                    title="Bu kitapçığı kaldır"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className={`text-[10px] leading-relaxed ${isDark ? 'text-[#838c9e]' : 'text-stone-400'}`}>
                            A Kitapçığı asıl sınav belgesidir. Yeni kitapçık eklediğinizde sorular ve çoktan seçmeli şıklar otomatik olarak karıştırılır ve cevap anahtarı senkronize edilir.
                          </p>
                        )}

                        {/* Tüm Kitapçıklar Cevap Matrisi Butonu */}
                        {onOpenBookletMatrix && availableBooklets.length > 1 && (
                          <button
                            type="button"
                            onClick={onOpenBookletMatrix}
                            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              isDark
                                ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                                : 'border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100'
                            }`}
                          >
                            <Layers className="h-4 w-4" />
                            <span>Tüm Kitapçıkların Cevap Anahtarları (Matris)</span>
                          </button>
                        )}
                      </div>

                      {/* 3. Sınav Puanı ve Değerlendirme */}
                      <div
                        className={`pt-2 border-t space-y-2.5 ${
                          isDark ? 'border-[#2b2f3b]' : 'border-stone-100'
                        }`}
                      >
                        <span className={`${labelClass} font-bold block text-xs`}>
                          Puanlama &amp; Değerlendirme:
                        </span>

                        {isWrittenExam && (
                          <div
                            className={`rounded-xl p-2.5 border space-y-1.5 transition-colors ${
                              isDark
                                ? 'bg-[#1e2129] border-[#2e3340]'
                                : 'bg-stone-50 border-stone-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-semibold ${isDark ? 'text-[#d6dae4]' : 'text-stone-700'}`}>
                                Yazılı Toplam Puanı:
                              </span>
                              <span
                                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                  isDark
                                    ? 'bg-slate-800 text-slate-200 border-slate-700'
                                    : 'bg-white text-stone-800 border-stone-200'
                                }`}
                              >
                                <span>{totalPoints} Puan</span>
                              </span>
                            </div>
                            <p className={`text-[10px] ${isDark ? 'text-[#838c9e]' : 'text-stone-500'}`}>
                              Her sorunun puan değeri soru kartı üzerinden özgürce ayarlanabilir.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 4. Sınav Formları & Ekleri */}
                      <div
                        className={`pt-2 border-t space-y-2 ${
                          isDark ? 'border-[#2b2f3b]' : 'border-stone-100'
                        }`}
                      >
                        <span className={`${labelClass} font-bold block text-xs`}>
                          Sınav Formları &amp; Ekler:
                        </span>

                        <label className={`flex items-center gap-2.5 cursor-pointer ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                          <input
                            type="checkbox"
                            checked={settings.showOpticForm}
                            onChange={(e) => updateSettings({ showOpticForm: e.target.checked })}
                            className={`h-4 w-4 rounded cursor-pointer transition-colors ${
                              isDark
                                ? 'border-[#383f4f] bg-[#1c1e26] accent-[#4b5264]'
                                : 'border-stone-300 text-stone-900 accent-stone-900'
                            }`}
                          />
                          <div>
                            <span className="font-semibold block">Optik Kodlama Alanı</span>
                            <span className={`text-[10px] block ${helperTextClass}`}>
                              Öğrencinin işaretlemesi için optik cevap formu kutucukları
                            </span>
                          </div>
                        </label>

                        <label className={`flex items-center gap-2.5 cursor-pointer ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                          <input
                            type="checkbox"
                            checked={settings.showAnswerKey}
                            onChange={(e) => updateSettings({ showAnswerKey: e.target.checked })}
                            className={`h-4 w-4 rounded cursor-pointer transition-colors ${
                              isDark
                                ? 'border-[#383f4f] bg-[#1c1e26] accent-[#4b5264]'
                                : 'border-stone-300 text-stone-900 accent-stone-900'
                            }`}
                          />
                          <div>
                            <span className="font-semibold block">Cevap Anahtarı Tablosunu Göster</span>
                            <span className={`text-[10px] block ${helperTextClass}`}>
                              Son sayfanın altında kompakt cevap anahtarı matrisi
                            </span>
                          </div>
                        </label>

                        <label className={`flex items-center gap-2.5 cursor-pointer ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                          <input
                            type="checkbox"
                            checked={settings.showOutcomes}
                            onChange={(e) => updateSettings({ showOutcomes: e.target.checked })}
                            className={`h-4 w-4 rounded cursor-pointer transition-colors ${
                              isDark
                                ? 'border-[#383f4f] bg-[#1c1e26] accent-[#4b5264]'
                                : 'border-stone-300 text-stone-900 accent-stone-900'
                            }`}
                          />
                          <div>
                            <span className="font-semibold block">MEB Kazanım Kodlarını Göster</span>
                            <span className={`text-[10px] block ${helperTextClass}`}>
                              örn: MAT.9.3.1 soru numarasının yanında yer alır
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Filigran (Watermark) */}
                <div
                  className={`rounded-xl border overflow-hidden shadow-2xs transition-colors ${
                    isDark
                      ? 'border-[#2e323e] bg-[#22252e]'
                      : 'border-stone-200/90 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection('watermark')}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#252833] hover:bg-[#2b2f3d]'
                        : 'bg-stone-50/70 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Stamp className="h-4 w-4 text-sky-500" />
                      <span className={`font-bold ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                        Filigran (Watermark)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${helperTextClass}`}>
                        {brand.showWatermark ? 'Açık' : 'Kapalı'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isDark ? 'text-[#949dae]' : 'text-stone-400'
                        } ${openSections.watermark ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {openSections.watermark && (
                    <div
                      className={`p-3.5 space-y-3 border-t animate-in fade-in-50 duration-150 ${
                        isDark ? 'border-[#2b2f3b] bg-[#22252e]' : 'border-stone-100 bg-white'
                      }`}
                    >
                      <label className={`flex items-center justify-between cursor-pointer ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                        <span className="font-semibold">
                          Filigranı Etkinleştir
                        </span>
                        <input
                          type="checkbox"
                          checked={brand.showWatermark}
                          onChange={(e) => updateBrand({ showWatermark: e.target.checked })}
                          className={`h-4 w-4 rounded cursor-pointer transition-colors ${
                            isDark
                              ? 'border-[#383f4f] bg-[#1c1e26] accent-[#4b5264]'
                              : 'border-stone-300 text-stone-900 accent-stone-900'
                          }`}
                        />
                      </label>

                      {brand.showWatermark && (
                        <div
                          className={`space-y-2.5 p-3 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-[#1e2129] border-[#2e3340]'
                              : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div>
                            <span className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-[#cbd1de]' : 'text-stone-600'}`}>
                              Filigran Metni:
                            </span>
                            <input
                              type="text"
                              value={brand.watermarkText}
                              onChange={(e) => updateBrand({ watermarkText: e.target.value })}
                              className={`w-full rounded-lg border px-2.5 py-1.5 font-bold transition-colors ${inputBgClass}`}
                              placeholder="örn: ANADOLU LİSESİ"
                            />
                          </div>

                          <div>
                            <div className={`flex justify-between text-[11px] mb-1 ${helperTextClass}`}>
                              <span>Saydamlık Oranı:</span>
                              <span className="font-mono font-bold">
                                {Math.round((brand.watermarkOpacity || 0.04) * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.02"
                              max="0.15"
                              step="0.01"
                              value={brand.watermarkOpacity || 0.04}
                              onChange={(e) => updateBrand({ watermarkOpacity: Number(e.target.value) })}
                              className={`w-full cursor-pointer ${isDark ? 'accent-sky-400' : 'accent-stone-700'}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 5: Baskı & Fotokopi Çıktı Modu */}
                <div
                  className={`rounded-xl border overflow-hidden shadow-2xs transition-colors ${
                    isDark
                      ? 'border-[#2e323e] bg-[#22252e]'
                      : 'border-stone-200/90 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection('print')}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#252833] hover:bg-[#2b2f3d]'
                        : 'bg-stone-50/70 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Printer className="h-4 w-4 text-rose-500" />
                      <span className={`font-bold ${isDark ? 'text-[#e5e8ef]' : 'text-stone-800'}`}>
                        Fotokopi &amp; Çıktı Modu
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${helperTextClass}`}>
                        {brand.printColorMode === 'monochrome' ? 'Gri Ton' : 'Renkli'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isDark ? 'text-[#949dae]' : 'text-stone-400'
                        } ${openSections.print ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {openSections.print && (
                    <div
                      className={`p-3.5 space-y-2 border-t animate-in fade-in-50 duration-150 ${
                        isDark ? 'border-[#2b2f3b] bg-[#22252e]' : 'border-stone-100 bg-white'
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateBrand({ printColorMode: 'color' })}
                          className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                            brand.printColorMode === 'color'
                              ? 'bg-sky-600 text-white border-transparent shadow-xs'
                              : isDark
                              ? 'border-[#383f4f] bg-[#252833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          Renkli Yayınevi
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBrand({ printColorMode: 'monochrome' })}
                          className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                            brand.printColorMode === 'monochrome'
                              ? 'bg-sky-600 text-white border-transparent shadow-xs'
                              : isDark
                              ? 'border-[#383f4f] bg-[#252833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          Gri Fotokopi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className={`border-t p-3.5 flex items-center justify-between shrink-0 transition-colors ${
                  isDark
                    ? 'bg-[#20232c] border-[#2c303c]'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <span className={`text-[10px] font-medium ${isDark ? 'text-[#838c9e]' : 'text-stone-400'}`}>
                  Değişiklikler anında uygulanır
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
                >
                  Tamam
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
