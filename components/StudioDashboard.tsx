'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  GraduationCap,
  BookOpen,
  Award,
  Layers,
  Plus,
  Search,
  Printer,
  Copy,
  Trash2,
  Edit3,
  Sparkles,
  ChevronRight,
  BookMarked,
  FilePlus2,
  X,
  Sun,
  Moon,
  Palette,
  Sliders,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { SavedDocument, DocumentType, FormatBlueprint } from '@/types/studio';
import { INITIAL_FORMAT_BLUEPRINTS } from '@/data/initialFormatBlueprints';

interface StudioDashboardProps {
  documents: SavedDocument[];
  onOpenDocument: (docId: string) => void;
  onCreateNewDocument: (params: {
    docType: DocumentType;
    title: string;
    courseName: string;
    gradeLevel: string;
    paperFormat: 'A4' | 'A3' | 'B5' | 'Letter';
    withSampleQuestions: boolean;
  }) => void;
  onDuplicateDocument: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onPrintDocument: (doc: SavedDocument) => void;
  onDuplicateMultipleDocuments?: (docIds: string[]) => void;
  onDeleteMultipleDocuments?: (docIds: string[]) => void;
  onPrintMultipleDocuments?: (docs: SavedDocument[]) => void;
  onOpenPool?: () => void;
  onOpenCrop?: () => void;
  onOpenBrand: (blueprintId?: string) => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  blueprints?: FormatBlueprint[];
  onCreateFromBlueprint?: (blueprint: FormatBlueprint) => void;
}

const ATELIER_FORMATS: {
  type: DocumentType;
  label: string;
  tag: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeLight: string;
  badgeDark: string;
}[] = [
  {
    type: 'written',
    label: 'Ortak Yazılı Sınav',
    tag: 'MEB Resmî Sınav',
    desc: 'Açık uçlu senaryolar, öğrenci künyesi ve çizgili cevap alanı sınav formatı.',
    icon: GraduationCap,
    badgeLight: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    badgeDark: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
  },
  {
    type: 'test',
    label: 'Yaprak Test',
    tag: 'Çift Sütun · A/B',
    desc: 'Kompakt iki sütunlu test, tarama fasikülü ve otomatik şık karıştırma.',
    icon: FileText,
    badgeLight: 'bg-sky-50 text-sky-800 border-sky-200/80',
    badgeDark: 'bg-sky-950/40 text-sky-300 border-sky-800/60',
  },
  {
    type: 'lecture',
    label: 'Ders & Konu Föyü',
    tag: 'Formül & Çözüm',
    desc: 'Formül blokları, özet kutuları ve çözümlü öğretmen örnekleri.',
    icon: BookOpen,
    badgeLight: 'bg-blue-50 text-blue-800 border-blue-200/80',
    badgeDark: 'bg-blue-950/40 text-blue-300 border-blue-800/60',
  },
  {
    type: 'exam',
    label: 'Kurumsal Deneme',
    tag: 'Optik Formlu',
    desc: 'Resmi sınav kapağı, öğrenci optik formu ve cevap anahtarı.',
    icon: Award,
    badgeLight: 'bg-purple-50 text-purple-800 border-purple-200/80',
    badgeDark: 'bg-purple-950/40 text-purple-300 border-purple-800/60',
  },
  {
    type: 'question_bank',
    label: 'Soru Bankası',
    tag: 'Yoğun Arşiv',
    desc: 'Kompakt yazı boyutu, sıfır alan israfı ve yüksek soru yoğunluğu.',
    icon: Layers,
    badgeLight: 'bg-slate-100 text-slate-800 border-slate-200',
    badgeDark: 'bg-[#2b303c] text-[#cbd1de] border-[#383f4f]',
  },
];

export default function StudioDashboard({
  documents,
  onOpenDocument,
  onCreateNewDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onPrintDocument,
  onDuplicateMultipleDocuments,
  onDeleteMultipleDocuments,
  onPrintMultipleDocuments,
  onOpenBrand,
  theme = 'light',
  onThemeChange,
  blueprints = INITIAL_FORMAT_BLUEPRINTS,
  onCreateFromBlueprint,
}: StudioDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple';
    docId?: string;
    docTitle?: string;
    count?: number;
  }>({
    isOpen: false,
    type: 'single',
  });

  const isDark = theme === 'dark';

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.subTitle && doc.subTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedTypeFilter === 'all' || doc.docType === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, selectedTypeFilter]);

  // Batch Selection Helpers
  const isAllSelected =
    filteredDocuments.length > 0 &&
    filteredDocuments.every((d) => selectedDocIds.has(d.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(filteredDocuments.map((d) => d.id)));
    }
  };

  const handleToggleSelectDoc = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedDocIds(new Set());
  };

  // Batch action handlers
  const handleBatchDuplicate = () => {
    const ids = Array.from(selectedDocIds);
    if (ids.length === 0) return;
    if (onDuplicateMultipleDocuments) {
      onDuplicateMultipleDocuments(ids);
    } else {
      ids.forEach((id) => onDuplicateDocument(id));
    }
    handleClearSelection();
  };

  const handleTriggerBatchDelete = () => {
    if (selectedDocIds.size === 0) return;
    setDeleteModalConfig({
      isOpen: true,
      type: 'multiple',
      count: selectedDocIds.size,
    });
  };

  const handleTriggerSingleDelete = (docId: string, docTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteModalConfig({
      isOpen: true,
      type: 'single',
      docId,
      docTitle,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModalConfig.type === 'single' && deleteModalConfig.docId) {
      onDeleteDocument(deleteModalConfig.docId);
      setSelectedDocIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteModalConfig.docId!);
        return next;
      });
    } else if (deleteModalConfig.type === 'multiple') {
      const ids = Array.from(selectedDocIds);
      if (typeof onDeleteMultipleDocuments === 'function') {
        onDeleteMultipleDocuments(ids);
      } else if (typeof onDeleteDocument === 'function') {
        ids.forEach((id) => onDeleteDocument(id));
      }
      handleClearSelection();
    }
    setDeleteModalConfig({ isOpen: false, type: 'single' });
  };

  const handleBatchPrint = () => {
    const selectedDocs = documents.filter((d) => selectedDocIds.has(d.id));
    if (selectedDocs.length === 0) return;
    if (typeof onPrintMultipleDocuments === 'function') {
      onPrintMultipleDocuments(selectedDocs);
    } else if (typeof onPrintDocument === 'function') {
      selectedDocs.forEach((doc) => onPrintDocument(doc));
    }
  };

  // 1. Direct Blank Document Creation (Zero Modals)
  const handleDirectCreateBlank = () => {
    onCreateNewDocument({
      docType: 'written',
      title: 'Yeni Sınav Belgesi',
      courseName: 'Genel',
      gradeLevel: 'Tüm Kademeler',
      paperFormat: 'A4',
      withSampleQuestions: false,
    });
  };

  // 2. Direct Format Creation (Zero Modals)
  const handleDirectCreateFormat = (docType: DocumentType) => {
    let title = 'Yeni Sınav';
    let courseName = 'Matematik';
    let gradeLevel = '9. Sınıf';

    if (docType === 'written') {
      title = '9. Sınıf Matematik — 1. Dönem 1. Ortak Yazılı Sınavı';
      courseName = 'Matematik';
      gradeLevel = '9. Sınıf';
    } else if (docType === 'test') {
      title = 'TYT Türkçe — Paragraf Tarama Testi';
      courseName = 'Türkçe';
      gradeLevel = 'TYT / YKS';
    } else if (docType === 'lecture') {
      title = '10. Sınıf Fizik — Konu Anlatım ve Alıştırma Föyü';
      courseName = 'Fizik';
      gradeLevel = '10. Sınıf';
    } else if (docType === 'exam') {
      title = '8. Sınıf LGS — Matematik Kurumsal Deneme Sınavı';
      courseName = 'Matematik';
      gradeLevel = '8. Sınıf / LGS';
    } else {
      title = 'Soru Bankası Fasikül Testi';
      courseName = 'Matematik';
      gradeLevel = '9. Sınıf';
    }

    onCreateNewDocument({
      docType,
      title,
      courseName,
      gradeLevel,
      paperFormat: 'A4',
      withSampleQuestions: true,
    });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Bugün';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Yakın zamanda';
    }
  };

  return (
    <div
      className={`flex-1 overflow-y-auto select-none pb-16 transition-colors ${
        isDark ? 'bg-[#1a1c23] text-[#e5e8ef]' : 'bg-[#f8f9fb] text-slate-900'
      }`}
    >
      {/* 1. Header Bar: Brand Logo & Sliding Theme Switcher */}
      <header
        className={`sticky top-0 z-20 border-b px-4 sm:px-8 py-3 flex items-center justify-between backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#20232c]/95 border-[#2c303c]'
            : 'bg-white/95 border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold shadow-2xs ${
              isDark
                ? 'bg-[#2b303c] text-[#f0f2f5] border border-[#383f4f]'
                : 'bg-slate-900 text-white'
            }`}
          >
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-[#f0f2f5]">
              Sınav &amp; Test Yayın Atölyesi
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-[#949dae]">
              MEB Ortak Yazılı, Yaprak Test, Föy ve Deneme Tasarımcısı
            </p>
          </div>
        </div>

        {/* Header Right Tools: Sliding Theme Toggle + Marka & Logo */}
        <div className="flex items-center gap-2.5">
          {/* KAYDIRMALI TEMA BUTONU */}
          <div
            className={`relative flex items-center h-8.5 w-[148px] rounded-xl p-1 select-none transition-all duration-200 border ${
              isDark
                ? 'bg-[#252833] border-[#323744]'
                : 'bg-slate-100 border-slate-200'
            }`}
            title={`Arayüz Teması: ${isDark ? 'Koyu' : 'Açık'}`}
          >
            {/* Kayar Arka Plan Hapı */}
            <div
              className={`absolute top-1 bottom-1 w-[68px] rounded-lg transition-all duration-250 ease-out shadow-xs pointer-events-none ${
                isDark
                  ? 'left-[74px] bg-[#373c4a] border border-[#484f61]'
                  : 'left-1 bg-white border border-slate-200/90'
              }`}
            />

            {/* Açık Butonu */}
            <button
              type="button"
              onClick={() => onThemeChange?.('light')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                !isDark
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Açık Temaya Geç"
            >
              <Sun
                className={`h-3.5 w-3.5 ${
                  !isDark ? 'text-slate-900 stroke-[2.2]' : 'text-slate-400'
                }`}
              />
              <span className="text-[11px]">Açık</span>
            </button>

            {/* Koyu Butonu */}
            <button
              type="button"
              onClick={() => onThemeChange?.('dark')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'text-[#f0f2f5] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Koyu Temaya Geç"
            >
              <Moon
                className={`h-3.5 w-3.5 ${
                  isDark ? 'text-sky-300 stroke-[2.2]' : 'text-slate-400'
                }`}
              />
              <span className="text-[11px]">Koyu</span>
            </button>
          </div>

          {/* Marka & Logo Butonu */}
          <button
            type="button"
            onClick={() => onOpenBrand()}
            className={`flex items-center gap-1.5 h-8.5 px-3 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              isDark
                ? 'border-[#383f4f] bg-[#242833] hover:bg-[#2c313f] text-[#d6dae4] hover:text-white'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900'
            }`}
            title="Kurumsal Marka ve Logo Ayarları Sayfası"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            <span>Marka &amp; Logo</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Zarif ve Minimal Hero Banner - Hızlı Boş Belge Başlatma */}
        <section
          className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark
              ? 'bg-[#22252e] border-[#2e323e] text-[#f0f2f5]'
              : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isDark
                    ? 'bg-[#2b303c] text-sky-300 border border-[#383f4f]'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <FilePlus2 className="h-3 w-3" />
                <span>Sıfırdan Başla</span>
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#f0f2f5]">
                Yeni Boş Belge Oluştur
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#949dae]">
              A4 çalışma masasını açar; form doldurmadan doğrudan soru eklemeye başlayabilirsiniz.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDirectCreateBlank}
            className="flex items-center justify-center gap-1.5 h-9.5 px-4.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.98] shadow-xs transition-all cursor-pointer shrink-0"
            title="Tertemiz boş bir A4 belgesi açar"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Yeni Boş Belge Aç</span>
          </button>
        </section>

        {/* 2. Kayıtlı Belgelerim Bölümü */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-[#2c303c]">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-[#f0f2f5]">
                Kayıtlı Belgelerim
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                  isDark
                    ? 'bg-[#2b303c] text-[#cbd1de]'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {filteredDocuments.length}
              </span>
            </div>

            {/* Arama ve Filtreleme */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[190px] sm:min-w-[220px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Belge ara..."
                  className={`w-full rounded-xl border pl-8 pr-7 py-1.5 text-xs placeholder:text-slate-400 focus:outline-hidden ${
                    isDark
                      ? 'border-[#323744] bg-[#22252e] text-[#f0f2f5] focus:border-[#4b5264]'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-slate-800'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Format Filter Pills for Fast Access */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {[
              { id: 'all', label: 'Tümü', count: documents.length },
              { id: 'written', label: 'Yazılı Sınav', count: documents.filter((d) => d.docType === 'written').length },
              { id: 'test', label: 'Yaprak Test', count: documents.filter((d) => d.docType === 'test').length },
              { id: 'lecture', label: 'Ders Föyü', count: documents.filter((d) => d.docType === 'lecture').length },
              { id: 'exam', label: 'Deneme', count: documents.filter((d) => d.docType === 'exam').length },
              { id: 'question_bank', label: 'Soru Bankası', count: documents.filter((d) => d.docType === 'question_bank').length },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedTypeFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedTypeFilter === cat.id
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : isDark
                    ? 'bg-[#22252e] text-[#cbd1de] hover:bg-[#2b303c] border border-[#2e323e]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedTypeFilter === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Toplu Belge Seçim Kontrol Çubuğu */}
          {filteredDocuments.length > 0 && (
            <div className="flex items-center justify-between gap-2 pt-1 pb-0.5 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                    isAllSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                      : isDark
                      ? 'border-[#2f3442] bg-[#22252e] text-slate-300 hover:bg-[#2b303e]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  title={isAllSelected ? 'Tüm seçimleri kaldır' : 'Listedeki tüm belgeleri seç'}
                >
                  <span
                    className={`flex items-center justify-center h-3.5 w-3.5 rounded border text-[10px] ${
                      isAllSelected
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : selectedDocIds.size > 0
                        ? 'bg-sky-100 border-sky-500 text-sky-700 dark:bg-sky-900 dark:text-sky-200'
                        : isDark
                        ? 'border-slate-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {isAllSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    {!isAllSelected && selectedDocIds.size > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                    )}
                  </span>
                  <span>
                    {isAllSelected
                      ? 'Tümünü Kaldır'
                      : selectedDocIds.size > 0
                      ? `${selectedDocIds.size} / ${filteredDocuments.length} Seçili`
                      : 'Tümünü Seç'}
                  </span>
                </button>

                {selectedDocIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer text-[11px]"
                  >
                    Seçimi Temizle
                  </button>
                )}
              </div>

              {selectedDocIds.size > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hidden sm:inline">
                    {selectedDocIds.size} belge üzerinde işlem yapılıyor
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Belgeler Listesi */}
          {filteredDocuments.length === 0 ? (
            <div
              className={`rounded-xl border border-dashed p-8 text-center space-y-2.5 ${
                isDark ? 'border-[#303442] bg-[#1f222a]' : 'border-slate-300 bg-white'
              }`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-[#2b303c] text-slate-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                  Aramanıza uygun kayıtlı belge bulunamadı
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#949dae] mt-0.5">
                  Farklı bir arama yapabilir veya yukarıdaki butondan yeni bir belge oluşturabilirsiniz.
                </p>
              </div>
              {(searchQuery || selectedTypeFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTypeFilter('all');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
                >
                  Filtreleri Sıfırla
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDocuments.map((doc) => {
                const atelier =
                  ATELIER_FORMATS.find((a) => a.type === doc.docType) || ATELIER_FORMATS[0];
                const Icon = atelier.icon;
                const totalPoints = (doc.questions || []).reduce(
                  (sum, q) => sum + (q.points || 0),
                  0
                );
                const isSelected = selectedDocIds.has(doc.id);

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (selectedDocIds.size > 0) {
                        handleToggleSelectDoc(doc.id);
                      }
                    }}
                    className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between relative cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-sky-500 border-sky-500/80 bg-sky-50/30 dark:bg-sky-950/30 shadow-sm'
                        : isDark
                        ? 'border-[#2e323e] bg-[#22252e] hover:border-[#3e4454]'
                        : 'border-slate-200/90 bg-white hover:border-slate-400 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Üst Satır: Checkbox + Rozet + Tarih */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Seçim Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleSelectDoc(doc.id, e)}
                            className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-colors cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : isDark
                                ? 'border-[#444b5d] hover:border-[#606a84] bg-[#1a1c24]'
                                : 'border-slate-300 hover:border-slate-400 bg-white'
                            }`}
                            title={isSelected ? 'Seçimi kaldır' : 'Belgeyi seç'}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </button>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border truncate ${
                              isDark ? atelier.badgeDark : atelier.badgeLight
                            }`}
                          >
                            <Icon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{atelier.label}</span>
                          </span>
                        </div>

                        <span className="text-[10px] font-medium text-slate-400 dark:text-[#838c9e] shrink-0">
                          {formatDate(doc.updatedAt || doc.createdAt)}
                        </span>
                      </div>

                      {/* Başlık */}
                      <h3
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDocument(doc.id);
                        }}
                        className="text-xs sm:text-sm font-bold line-clamp-1 hover:text-blue-600 dark:hover:text-sky-300 cursor-pointer transition-colors text-slate-900 dark:text-[#f0f2f5]"
                        title={doc.title}
                      >
                        {doc.title}
                      </h3>

                      {doc.subTitle && (
                        <p className="text-[11px] text-slate-500 dark:text-[#949dae] line-clamp-1 mt-0.5">
                          {doc.subTitle}
                        </p>
                      )}

                      {/* Etiketler / Bilgiler */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium my-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-[#2a2f3c] dark:text-[#d6dae4] border border-slate-200/60 dark:border-[#353b4b]">
                          {doc.courseName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-[#2a2f3c] dark:text-[#d6dae4] border border-slate-200/60 dark:border-[#353b4b]">
                          {doc.gradeLevel}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-[#2a2f3c] dark:text-[#d6dae4] font-mono border border-slate-200/60 dark:border-[#353b4b]">
                          {doc.settings?.paperFormat || 'A4'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-[#2a2f3c] dark:text-[#d6dae4] border border-slate-200/60 dark:border-[#353b4b]">
                          {doc.questions?.length || 0} Soru
                        </span>
                        {doc.docType === 'written' && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-[#2b303c] dark:text-[#d3d8e2] font-bold border border-slate-300 dark:border-[#3a4151]">
                            {totalPoints} Puan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Alt Aksiyon Butonları */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-[#2b2f3b] flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'Kayıtlı'}
                      </span>

                      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDocument(doc.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-[#f0f2f5] hover:bg-slate-100 dark:hover:bg-[#2c313e] transition-colors cursor-pointer"
                          title="Belgeyi Düzenle"
                          aria-label="Düzenle"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onPrintDocument(doc)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-[#f0f2f5] hover:bg-slate-100 dark:hover:bg-[#2c313e] transition-colors cursor-pointer"
                          title="Yazdır"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateDocument(doc.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-[#f0f2f5] hover:bg-slate-100 dark:hover:bg-[#2c313e] transition-colors cursor-pointer"
                          title="Çoğalt"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleTriggerSingleDelete(doc.id, doc.title, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating / Sticky Bottom Batch Action Bar */}
      <AnimatePresence>
        {selectedDocIds.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 bg-white/95 dark:bg-[#1f232d]/95 border-slate-300 dark:border-[#333a4c] text-slate-900 dark:text-[#f0f2f5]"
          >
            <div className="flex items-center gap-2 shrink-0">
              <span className="h-6 px-2 rounded-md bg-sky-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                {selectedDocIds.size}
              </span>
              <span className="text-xs font-bold hidden sm:inline">
                Belge Seçildi
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Toplu Yazdır */}
              <button
                type="button"
                onClick={handleBatchPrint}
                className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer border-slate-300 dark:border-[#383f50] bg-white dark:bg-[#282d3b] hover:bg-slate-50 dark:hover:bg-[#32394a]"
                title="Seçili belgeleri yazdır / PDF olarak aç"
              >
                <Printer className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden xs:inline">Toplu Yazdır</span>
              </button>

              {/* Toplu Kopyala / Çoğalt */}
              <button
                type="button"
                onClick={handleBatchDuplicate}
                className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer border-slate-300 dark:border-[#383f50] bg-white dark:bg-[#282d3b] hover:bg-slate-50 dark:hover:bg-[#32394a]"
                title="Seçili belgelerin kopyasını oluştur"
              >
                <Copy className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden xs:inline">Toplu Çoğalt</span>
              </button>

              {/* Toplu Sil */}
              <button
                type="button"
                onClick={handleTriggerBatchDelete}
                className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-xs transition-colors cursor-pointer"
                title="Seçili tüm belgeleri sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Toplu Sil</span>
              </button>

              {/* Seçimi Kapat */}
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2b303c] transition-colors cursor-pointer ml-1"
                title="Seçimi temizle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Genel Silme Onay Penceresi (Tekil veya Toplu) */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, type: 'single' })}
        onConfirm={handleConfirmDelete}
        title={deleteModalConfig.type === 'multiple' ? `${deleteModalConfig.count} Belgeyi Sil` : 'Belgeyi Sil'}
        itemName={deleteModalConfig.docTitle}
        itemCount={deleteModalConfig.count}
        theme={theme}
      />
    </div>
  );
}
