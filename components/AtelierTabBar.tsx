'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DocumentSettings, DocumentType, QuestionItem } from '@/types/studio';
import CustomSelect from '@/components/CustomSelect';
import {
  FileText,
  GraduationCap,
  BookOpen,
  Award,
  Layers,
  Columns2,
  SquareCheck,
  SlidersHorizontal,
  ChevronDown,
  Check
} from 'lucide-react';

interface AtelierTabBarProps {
  docType: DocumentType;
  onDocTypeChange: (type: DocumentType) => void;
  settings: DocumentSettings;
  onSettingsChange: (settings: DocumentSettings) => void;
  questions: QuestionItem[];
  onAutoBalancePoints?: () => void;
  onGenerateBookletB: () => void;
  isSettingsDrawerOpen: boolean;
  onToggleSettingsDrawer: () => void;
}

const ATELIER_LIST: { type: DocumentType; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { type: 'test', label: 'Yaprak Test', icon: FileText, desc: 'Çift sütunlu test & A/B kitapçığı' },
  { type: 'written', label: 'Yazılı Sınav', icon: GraduationCap, desc: 'MEB açık uçlu senaryolar & öğrenci künyesi' },
  { type: 'lecture', label: 'Konu Föyü', icon: BookOpen, desc: 'Formül, özet, çözümlü örnek ve alıştırma' },
  { type: 'exam', label: 'Deneme Sınavı', icon: Award, desc: 'LGS / TYT / AYT kapak & optik form' },
  { type: 'question_bank', label: 'Soru Bankası', icon: Layers, desc: 'Fasikül & yoğun çift sütun mizanpajı' },
];

export default function AtelierTabBar({
  docType,
  onDocTypeChange,
  settings,
  onSettingsChange,
  questions,
  onAutoBalancePoints,
  onGenerateBookletB,
  isSettingsDrawerOpen,
  onToggleSettingsDrawer,
}: AtelierTabBarProps) {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isQuickToolsMenuOpen, setIsQuickToolsMenuOpen] = useState(false);

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsQuickToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const update = (partial: Partial<DocumentSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const currentAtelier = ATELIER_LIST.find((a) => a.type === docType) || ATELIER_LIST[0];
  const CurrentIcon = currentAtelier.icon;

  return (
    <div className="no-print relative border-b border-stone-200/90 bg-white px-3 sm:px-5 py-2 shadow-2xs z-20">
      <div className="flex items-center justify-between gap-2">
        {/* LEFT: Document Type Selection */}
        {/* Mobile / Tablet Compact Dropdown (< lg) */}
        <div className="relative lg:hidden" ref={typeDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsTypeDropdownOpen((prev) => !prev);
              setIsQuickToolsMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-900 shadow-2xs hover:bg-stone-100 transition-colors"
          >
            <CurrentIcon className="h-4 w-4 text-stone-700" />
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{currentAtelier.label}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Type Dropdown Popover */}
          {isTypeDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Belge Formatı Değiştir
              </div>
              {ATELIER_LIST.map((item) => {
                const Icon = item.icon;
                const isActive = docType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      onDocTypeChange(item.type);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`flex items-start gap-2.5 w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-stone-900 text-white font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.label}</span>
                        {isActive && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <p className={`text-[10px] truncate ${isActive ? 'text-stone-300' : 'text-stone-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Tabs (>= lg) */}
        <div className="hidden lg:flex items-center gap-1.5">
          {ATELIER_LIST.map((item) => {
            const Icon = item.icon;
            const isActive = docType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => onDocTypeChange(item.type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                }`}
                title={item.desc}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT: Layout & Document Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Paper & Orientation Selector (Always visible, compact) */}
          <CustomSelect
            value={`${settings.paperFormat || 'A4'}-${settings.orientation || 'portrait'}`}
            onChange={(val) => {
              const [pFormat, orient] = val.split('-') as [any, any];
              update({ paperFormat: pFormat, orientation: orient });
            }}
            options={[
              { value: 'A4-portrait', label: 'A4 Dikey', icon: FileText },
              { value: 'A4-landscape', label: 'A4 Yatay', icon: FileText },
              { value: 'A3-portrait', label: 'A3 Dikey', icon: FileText },
              { value: 'A3-landscape', label: 'A3 Yatay', icon: FileText },
              { value: 'B5-portrait', label: 'B5 Kitap', icon: FileText },
              { value: 'Letter-portrait', label: 'Letter', icon: FileText },
            ]}
            className="w-32 sm:w-36 shrink-0"
            size="sm"
          />

          {/* Quick Tools Collapsible Menu for Small Screens (< lg) */}
          <div className="relative lg:hidden" ref={toolsMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsQuickToolsMenuOpen((prev) => !prev);
                setIsTypeDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition-all shadow-2xs ${
                isQuickToolsMenuOpen
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span>Mizanpaj</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isQuickToolsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Tools Dropdown Card */}
            {isQuickToolsMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2.5">
                  <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                    Hızlı Mizanpaj Menüsü
                  </span>
                  <span className="text-[10px] text-stone-400">Tek dokunuşla ayarla</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Sütun Düzeni */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 font-medium">Sütun Düzeni:</span>
                    <div className="flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 font-bold">
                      <button
                        type="button"
                        onClick={() => update({ columnCount: 1 })}
                        className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                          settings.columnCount === 1 ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                        }`}
                      >
                        1 Sütun
                      </button>
                      <button
                        type="button"
                        onClick={() => update({ columnCount: 2 })}
                        className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                          settings.columnCount === 2 ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                        }`}
                      >
                        2 Sütun
                      </button>
                    </div>
                  </div>

                  {/* Optik Form */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 font-medium">Optik Cevap Formu:</span>
                    <button
                      type="button"
                      onClick={() => update({ showOpticForm: !settings.showOpticForm })}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border text-[11px] transition-all ${
                        settings.showOpticForm
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      <SquareCheck className="h-3 w-3 text-blue-700" />
                      <span>{settings.showOpticForm ? 'Açık' : 'Kapalı'}</span>
                    </button>
                  </div>

                  {/* Sayfalama (Sayfa Başına Soru) */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <span className="text-stone-600 font-medium">Sayfa Başına Soru:</span>
                    <CustomSelect
                      value={String(settings.questionsPerPage || 0)}
                      onChange={(val) => update({ questionsPerPage: Number(val) })}
                      options={[
                        { value: '0', label: 'Otomatik' },
                        { value: '2', label: '2 Soru' },
                        { value: '3', label: '3 Soru' },
                        { value: '4', label: '4 Soru' },
                        { value: '5', label: '5 Soru' },
                        { value: '6', label: '6 Soru' },
                        { value: '8', label: '8 Soru' },
                        { value: '10', label: '10 Soru' },
                      ]}
                      className="w-32"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Direct Tool Buttons (>= lg) */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {/* Sayfa Başına Soru Seçici */}
            <CustomSelect
              value={String(settings.questionsPerPage || 0)}
              onChange={(val) => update({ questionsPerPage: Number(val) })}
              options={[
                { value: '0', label: 'Otomatik Akış', badge: 'Oto' },
                { value: '2', label: '2 Soru / Sayfa' },
                { value: '3', label: '3 Soru / Sayfa' },
                { value: '4', label: '4 Soru / Sayfa' },
                { value: '5', label: '5 Soru / Sayfa' },
                { value: '6', label: '6 Soru / Sayfa' },
                { value: '8', label: '8 Soru / Sayfa' },
                { value: '10', label: '10 Soru / Sayfa' },
              ]}
              className="w-36 shrink-0"
              size="sm"
            />

            {/* Sütun Düzeni: 2 Sütun vs 1 Sütun */}
            <button
              type="button"
              onClick={() => update({ columnCount: settings.columnCount === 2 ? 1 : 2 })}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all shrink-0"
              title="Mizanpaj sütun sayısı"
            >
              <Columns2 className="h-3.5 w-3.5 text-stone-500" />
              <span>{settings.columnCount === 2 ? '2 Sütun' : '1 Sütun'}</span>
            </button>

            {/* Optik Form */}
            <button
              type="button"
              onClick={() => update({ showOpticForm: !settings.showOpticForm })}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                settings.showOpticForm
                  ? 'bg-blue-50 text-blue-900 border-blue-200'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <SquareCheck className="h-3.5 w-3.5 text-blue-800" />
              <span>Optik</span>
            </button>
          </div>

          {/* Belge Ayarları Paneli Aç/Kapa Butonu */}
          <button
            type="button"
            onClick={onToggleSettingsDrawer}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
              isSettingsDrawerOpen
                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 shadow-2xs'
            }`}
            title="Belge ve Mizanpaj Ayarları Menüsü"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ayarlar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
