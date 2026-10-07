'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Upload,
  Trash2,
  Image as ImageIcon,
  Scissors,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  CheckSquare,
  AlignLeft,
  FormInput,
  BookOpen,
  Sparkles,
  RotateCw,
  CheckCircle2,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Columns2,
  Eye,
  FileText,
} from 'lucide-react';
import {
  QuestionItem,
  QuestionType,
  QuestionDifficulty,
  DocumentType,
  QuestionPresentationFormat,
  BrandSettings,
} from '@/types/studio';
import MathText from '@/components/MathText';
import MathSymbolPickerModal from '@/components/MathSymbolPickerModal';
import { MEB_OUTCOMES } from '@/data/mebOutcomes';

interface QuestionEditorModalProps {
  question: QuestionItem;
  index: number;
  questionNumber?: number;
  totalQuestions: number;
  docType: DocumentType;
  brand?: BrandSettings;
  onSave: (updatedQuestion: QuestionItem) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onNavigate?: (newIndex: number) => void;
  onOpenCropTool?: () => void;
  theme?: 'light' | 'dark';
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'multiple_choice', label: 'Çoktan Seçmeli', icon: CheckSquare },
  { type: 'open_ended', label: 'Açık Uçlu (Klasik)', icon: AlignLeft },
  { type: 'true_false', label: 'Doğru / Yanlış', icon: CheckSquare },
  { type: 'fill_blank', label: 'Boşluk Doldurma', icon: FormInput },
  { type: 'lecture_block', label: 'Konu / Not Bloğu', icon: BookOpen },
];

export const PRESENTATION_FORMATS: {
  id: QuestionPresentationFormat;
  title: string;
  badge: string;
  shortDesc: string;
}[] = [
  { id: 'image_hybrid', title: 'Görsel + Soru', badge: '1. Format', shortDesc: 'Görsel altında soru' },
  { id: 'image_only', title: 'Kupür Soru', badge: '2. Format', shortDesc: 'Soru/şıklar görselde' },
  { id: 'image_ocr', title: 'OCR Metin', badge: '3. Format', shortDesc: 'Görselden metne' },
  { id: 'text_only', title: 'Saf Metin', badge: '4. Format', shortDesc: 'Görselsiz soru' },
];

const BLOCK_STYLES: { id: QuestionItem['blockType']; label: string; desc: string }[] = [
  { id: 'summary', label: 'Özet / Bilgi Notu', desc: 'Genel açıklama ve önemli noktalar' },
  { id: 'formula', label: 'Formül & Tanım Kutusu', desc: 'Matematiksel tanım veya denklem' },
  { id: 'example', label: 'Örnek Çözüm', desc: 'Model problem ve çözüm adımları' },
  { id: 'warning', label: 'Dikkat / Uyarı', desc: 'Sık yapılan hatalar ve ipuçları' },
  { id: 'practice', label: 'Uygulama / Alıştırma', desc: 'Etkinlik ve uygulama sorusu' },
  { id: 'heading', label: 'Büyük Konu Başlığı', desc: 'Ünite ve konu ayrımı' },
];

// Özel Tasarımsal Soru Tipi Açılır Menüsü
function CustomQuestionTypeDropdown({
  value,
  onChange,
  isDark,
}: {
  value: QuestionType;
  onChange: (val: QuestionType) => void;
  isDark: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeMeta = QUESTION_TYPES.find((t) => t.type === value) || QUESTION_TYPES[0];
  const ActiveIcon = activeMeta.icon;

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs select-none ${
          isOpen
            ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-500/10 text-sky-400'
            : isDark
            ? 'bg-[#151720] border-[#383f52] text-sky-400 hover:border-slate-500 hover:text-white'
            : 'bg-white border-slate-300 text-sky-700 hover:border-slate-400 hover:text-slate-900'
        }`}
      >
        <ActiveIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate max-w-[120px] sm:max-w-none">{activeMeta.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute left-0 mt-1.5 w-56 rounded-xl border shadow-xl z-50 p-1 overflow-hidden select-none ${
              isDark ? 'bg-[#1e222d] border-[#333a4c]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="space-y-0.5">
              {QUESTION_TYPES.map((t) => {
                const isSelected = t.type === value;
                const Icon = t.icon;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => {
                      onChange(t.type);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-[#282d3c] hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span>{t.label}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Özel Tasarımsal Blok Tarzı Açılır Menüsü
function CustomBlockTypeDropdown({
  value,
  onChange,
  isDark,
}: {
  value: QuestionItem['blockType'];
  onChange: (val: QuestionItem['blockType']) => void;
  isDark: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const active = BLOCK_STYLES.find((b) => b.id === value) || BLOCK_STYLES[0];

  return (
    <div ref={dropdownRef} className="relative text-left w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-2xs select-none gap-2 ${
          isOpen
            ? 'ring-2 ring-sky-500 border-sky-500'
            : isDark
            ? 'bg-[#14161f] border-[#343a4a] text-slate-200 hover:border-slate-500'
            : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
        }`}
      >
        <span className="truncate">{active.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute left-0 mt-1.5 w-full rounded-xl border shadow-xl z-50 p-1 overflow-hidden select-none ${
              isDark ? 'bg-[#1e222d] border-[#333a4c]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="space-y-0.5">
              {BLOCK_STYLES.map((b) => {
                const isSelected = b.id === value;
                return (
                  <button
                    key={b.id || 'summary'}
                    type="button"
                    onClick={() => {
                      onChange(b.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-[#282d3c] hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{b.label}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                        {b.desc}
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Özel Tasarımsal Zorluk Seviyesi Açılır Menüsü
const DIFFICULTY_LEVELS: {
  id: QuestionDifficulty;
  label: string;
  dotColor: string;
  desc: string;
}[] = [
  {
    id: 'Kolay',
    label: 'Kolay Seviye',
    dotColor: 'bg-emerald-500',
    desc: 'Temel kavram & kavrama düzeyi',
  },
  {
    id: 'Orta',
    label: 'Orta Seviye',
    dotColor: 'bg-amber-500',
    desc: 'Standart müfredat & LGS/YKS',
  },
  {
    id: 'Zor',
    label: 'Zor Seviye',
    dotColor: 'bg-rose-500',
    desc: 'Yeni nesil analiz & sentez',
  },
];

function CustomDifficultyDropdown({
  value = 'Orta',
  onChange,
  isDark,
  dropUp = true,
}: {
  value?: QuestionDifficulty;
  onChange: (val: QuestionDifficulty) => void;
  isDark: boolean;
  dropUp?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const active = DIFFICULTY_LEVELS.find((d) => d.id === value) || DIFFICULTY_LEVELS[1];

  return (
    <div ref={dropdownRef} className="relative text-left w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-2xs select-none gap-2 ${
          isOpen
            ? 'ring-2 ring-sky-500 border-sky-500'
            : isDark
            ? 'bg-[#14161f] border-[#343a4a] text-slate-200 hover:border-slate-500'
            : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${active.dotColor}`} />
          <span className="truncate font-bold">{active.label}</span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute left-0 ${
              dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            } w-full min-w-[210px] rounded-xl border shadow-xl z-50 p-1 overflow-hidden select-none ${
              isDark ? 'bg-[#1e222d] border-[#333a4c]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="space-y-0.5">
              {DIFFICULTY_LEVELS.map((d) => {
                const isSelected = d.id === value;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      onChange(d.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-[#282d3c] hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.dotColor}`} />
                      <div>
                        <div className="font-bold">{d.label}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                          {d.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Özel Tasarımsal Sunum Formatı Açılır Menüsü
function CustomPresentationFormatDropdown({
  value,
  onChange,
  isDark,
}: {
  value?: QuestionPresentationFormat;
  onChange: (val: QuestionPresentationFormat) => void;
  isDark: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const active = PRESENTATION_FORMATS.find((f) => f.id === value) || PRESENTATION_FORMATS[0];

  return (
    <div ref={dropdownRef} className="relative text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs select-none ${
          isOpen
            ? 'ring-2 ring-sky-500 border-sky-500'
            : isDark
            ? 'bg-[#151720] border-[#383f52] text-slate-200 hover:border-slate-500'
            : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
        }`}
      >
        <span className="text-[11px] font-bold text-sky-500">{active.badge}:</span>
        <span className="truncate">{active.title}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-60 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute right-0 mt-1.5 w-60 rounded-xl border shadow-xl z-50 p-1 overflow-hidden select-none ${
              isDark ? 'bg-[#1e222d] border-[#333a4c]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="space-y-0.5">
              {PRESENTATION_FORMATS.map((f) => {
                const isSelected = f.id === value;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onChange(f.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-[#282d3c] hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {f.badge}
                        </span>
                        <span>{f.title}</span>
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                        {f.shortDesc}
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Özel Tasarımsal MEB Kazanımı Açılır Menüsü (Arama Filtreli)
function CustomMebOutcomeDropdown({
  selectedCode,
  onChange,
  isDark,
  dropUp = true,
}: {
  selectedCode?: string;
  onChange: (code: string, description: string) => void;
  isDark: boolean;
  dropUp?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeOutcome = MEB_OUTCOMES.find((o) => o.code === selectedCode);

  const filteredOutcomes = useMemo(() => {
    if (!searchQuery.trim()) return MEB_OUTCOMES;
    const q = searchQuery.toLowerCase();
    return MEB_OUTCOMES.filter(
      (o) =>
        o.code.toLowerCase().includes(q) ||
        o.topic.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div ref={dropdownRef} className="relative text-left w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-2xs select-none gap-2 ${
          isOpen
            ? 'ring-2 ring-sky-500 border-sky-500'
            : isDark
            ? 'bg-[#14161f] border-[#343a4a] text-slate-200 hover:border-slate-500'
            : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
        }`}
      >
        <span className="truncate">
          {activeOutcome ? `${activeOutcome.code} - ${activeOutcome.description}` : 'Kazanım Seçiniz...'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute left-0 right-0 sm:left-auto sm:right-0 ${
              dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            } w-full sm:w-[420px] max-w-[92vw] rounded-xl border shadow-2xl z-50 p-2 overflow-hidden select-none ${
              isDark ? 'bg-[#1e222d] border-[#333a4c]' : 'bg-white border-slate-200'
            }`}
          >
            {/* Arama Girişi */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kazanım veya konu ara..."
                className={`w-full h-8 pl-8 pr-2.5 text-xs rounded-lg border outline-hidden transition-all ${
                  isDark
                    ? 'bg-[#141620] border-[#383f52] text-white focus:border-sky-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600'
                }`}
              />
            </div>

            {/* Liste */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
              {/* Boşalt seçeneği */}
              <button
                type="button"
                onClick={() => {
                  onChange('', '');
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer flex items-center justify-between ${
                  !selectedCode
                    ? 'bg-slate-200 dark:bg-slate-700 font-bold'
                    : isDark ? 'text-slate-400 hover:bg-[#282d3c]' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>(Kazanım Seçilmedi)</span>
                {!selectedCode && <Check className="h-3 w-3" />}
              </button>

              {filteredOutcomes.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  Eşleşen kazanım bulunamadı.
                </div>
              ) : (
                filteredOutcomes.map((o) => {
                  const isSelected = o.code === selectedCode;
                  return (
                    <button
                      key={o.code}
                      type="button"
                      onClick={() => {
                        onChange(o.code, o.description);
                        setIsOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg text-xs transition-colors text-left cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-sky-600 text-white font-bold'
                          : isDark
                          ? 'text-slate-300 hover:bg-[#282d3c] hover:text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : isDark
                                ? 'bg-sky-950/80 text-sky-300 border border-sky-800'
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {o.code}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              isSelected ? 'text-sky-100' : 'text-slate-400'
                            }`}
                          >
                            {o.topic}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-snug line-clamp-2 ${isSelected ? 'text-white' : ''}`}>
                          {o.description}
                        </p>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.5] mt-1" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Canlı Sınav Kâğıdı Önizleme Bileşeni
function LiveQuestionPaperPreview({
  formData,
  questionNumber,
  docType,
  showAnswerInPreview,
  onToggleAnswer,
  isDark,
  brand,
}: {
  formData: QuestionItem;
  questionNumber: number;
  docType: DocumentType;
  showAnswerInPreview: boolean;
  onToggleAnswer: () => void;
  isDark: boolean;
  brand?: BrandSettings;
}) {
  const currentType = formData.type || 'multiple_choice';
  const primaryBg = brand?.primaryColor || '#0284c7';

  // Rozet stilini belirleme
  const renderBadge = (num: number) => {
    const badgeStyle = brand?.questionBadgeStyle || 'square';
    switch (badgeStyle) {
      case 'circle':
        return (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black"
            style={{ borderColor: primaryBg, color: primaryBg }}
          >
            {num}
          </span>
        );
      case 'hexagon':
        return (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-white text-[10px] font-black rotate-3 shadow-2xs"
            style={{ backgroundColor: primaryBg }}
          >
            {num}
          </span>
        );
      case 'pill':
        return (
          <span
            className="inline-flex items-center rounded-full overflow-hidden text-[9px] font-black shrink-0 shadow-2xs"
            style={{ border: `1px solid ${primaryBg}` }}
          >
            <span className="px-1 text-white" style={{ backgroundColor: primaryBg }}>S</span>
            <span className="px-1 bg-white" style={{ color: primaryBg }}>{num}</span>
          </span>
        );
      case 'simple':
        return (
          <span
            className="text-xs font-black tracking-tight"
            style={{ color: primaryBg }}
          >
            {num}.
          </span>
        );
      case 'badge':
        return (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white shadow-2xs"
            style={{ backgroundColor: primaryBg }}
          >
            {num}
          </span>
        );
      case 'square':
      default:
        return (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-mono font-black text-white shadow-2xs"
            style={{ backgroundColor: primaryBg }}
          >
            {num}
          </span>
        );
    }
  };

  // Puan Rozetini Belirleme
  const renderPointsBadge = (points: number = 10) => {
    if (brand?.showQuestionPoints === false) return null;
    const isVisible = docType === 'written' || brand?.showQuestionPoints === true;
    if (!isVisible) return null;

    const bg = primaryBg;
    const format = brand?.pointsTextFormat || 'short-p';
    const pointText = format === 'full-puan' ? `${points} Puan` : format === 'num-only' ? `${points}` : `${points}p`;
    const style = brand?.questionPointsStyle || 'capsule-pill';

    switch (style) {
      case 'capsule-pill':
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shrink-0 shadow-2xs border transition-all"
            style={{
              backgroundColor: `${bg}14`,
              color: bg,
              borderColor: `${bg}40`,
            }}
          >
            ({pointText})
          </span>
        );
      case 'soft-badge':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono shrink-0 border border-slate-200 bg-slate-50 text-slate-700">
            [{pointText}]
          </span>
        );
      case 'circle-tag':
        return (
          <span
            className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[8.5px] font-black font-mono shrink-0 border-2"
            style={{
              borderColor: bg,
              color: bg,
              backgroundColor: 'white',
            }}
          >
            {pointText}
          </span>
        );
      case 'bold-framed':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[9px] font-black font-mono uppercase shrink-0 border-2 border-stone-900 bg-stone-100 text-stone-900 shadow-2xs">
            {pointText}
          </span>
        );
      case 'bracket-mono':
        return (
          <span className="text-[10px] font-bold font-mono text-stone-700 shrink-0">
            [{pointText}]
          </span>
        );
      case 'banner-tag':
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[8.5px] font-bold font-mono text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: bg }}
          >
            {pointText}
          </span>
        );
      case 'ribbon-corner':
        return (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs text-[9px] font-black font-mono shrink-0 border"
            style={{
              borderColor: `${bg}60`,
              backgroundColor: `${bg}10`,
              color: bg,
            }}
          >
            <span className="text-[8px] opacity-70">★</span>
            {pointText}
          </span>
        );
      case 'hexagon-tag':
        return (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-xs text-[8.5px] font-black font-mono shrink-0 border shadow-2xs"
            style={{
              backgroundColor: `${bg}16`,
              color: bg,
              borderColor: `${bg}45`,
            }}
          >
            <span className="text-[7.5px]">⬡</span>
            {pointText}
          </span>
        );
      case 'stamp-badge':
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.2 rounded-xs text-[8px] font-black font-mono uppercase shrink-0 border-2 tracking-wider"
            style={{
              borderColor: bg,
              color: bg,
              backgroundColor: `${bg}08`,
            }}
          >
            PUAN: {pointText}
          </span>
        );
      case 'minimal-parenthesis':
      default:
        return (
          <span className="text-[10px] font-bold text-stone-500 font-mono shrink-0">
            ({pointText})
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5 select-text">
      {/* Üst Önizleme Araç Çubuğu */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <FileText className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Sınav Kâğıdı Canlı Önizlemesi</span>
          </div>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Canlı
          </span>
        </div>

        {/* Öğretmen / Öğrenci Görünüm Butonu */}
        <button
          type="button"
          onClick={onToggleAnswer}
          className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
            showAnswerInPreview
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20'
              : isDark
              ? 'bg-[#1e222d] border-[#333a4c] text-slate-300 hover:text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900'
          }`}
          title="Doğru cevap vurgusunu göster veya gizle"
        >
          {showAnswerInPreview ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Cevap Anahtarı: Açık</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Öğrenci Görünümü</span>
            </>
          )}
        </button>
      </div>

      {/* Sınav Kâğıdı Sayfası (Gerçek Kâğıt Hissi) */}
      <div className="relative bg-white text-slate-900 rounded-2xl shadow-lg border border-slate-200/90 p-5 sm:p-7 space-y-4 font-sans min-h-[300px]">
        {/* Kâğıt Üst Dekoratif Şerit */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${primaryBg}, #6366f1, #10b981)` }}
        />

        {currentType !== 'lecture_block' ? (
          <>
            {/* Soru Başlığı (Numara Rozeti + Puan) */}
            <div className="flex items-start gap-3">
              {/* Soru Numarası Rozeti & Puan */}
              <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                {renderBadge(questionNumber)}
                {renderPointsBadge(formData.points || (docType === 'written' ? 10 : 5))}
              </div>

              {/* Soru İçeriği */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Soru Görseli (Varsa) */}
                {formData.imageUrl && formData.presentationFormat !== 'text_only' && (
                  <div
                    className={`flex ${
                      formData.imageAlignment === 'center'
                        ? 'justify-center'
                        : formData.imageAlignment === 'right'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      style={{
                        maxWidth: `${formData.imageWidthPercent || 100}%`,
                      }}
                      className="overflow-hidden rounded-lg border border-slate-200/80 p-1 bg-white inline-block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.imageUrl}
                        alt="Soru Görseli Önizleme"
                        style={{
                          transform: `rotate(${formData.imageRotation || 0}deg)`,
                          filter: formData.imageGrayscale
                            ? 'grayscale(100%) contrast(130%)'
                            : 'none',
                        }}
                        className={`max-h-72 object-contain ${
                          formData.imageWidthPercent === 100 ? 'w-full' : 'max-w-full'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Öncüller (I, II, III gibi) */}
                {formData.subText && (
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 font-serif leading-relaxed whitespace-pre-line break-words">
                    <MathText content={formData.subText} />
                  </div>
                )}

                {/* Soru Kökü / Metni */}
                {formData.text ? (
                  <div className="text-sm font-semibold text-slate-900 leading-relaxed break-words whitespace-pre-line">
                    <MathText content={formData.text} />
                  </div>
                ) : (
                  !formData.imageUrl && (
                    <div className="text-xs text-slate-400 italic">
                      (Soru metni henüz yazılmadı...)
                    </div>
                  )
                )}

                {/* Çoktan Seçmeli Şıklar */}
                {currentType === 'multiple_choice' && (
                  formData.optionsInImage ? (
                    <div className="space-y-2 pt-1">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                        Şıklar soru görseli içerisinde yer almaktadır (Kupür Modu).
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-slate-500 font-bold">Cevap Anahtarı:</span>
                        {['A', 'B', 'C', 'D', 'E'].map((letter) => {
                          const isCorrect = (formData.correctAnswer || 'A') === letter;
                          return (
                            <span
                              key={letter}
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-colors ${
                                showAnswerInPreview && isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-white border-slate-300 text-slate-700'
                              }`}
                            >
                              {letter}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      {(formData.options && formData.options.length >= 2
                        ? formData.options
                        : ['A) ', 'B) ', 'C) ', 'D) ', 'E) ']
                      ).map((opt, optIdx) => {
                        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                        const letter = letters[optIdx] || `O${optIdx + 1}`;
                        const isCorrect = (formData.correctAnswer || 'A') === letter;
                        const cleanText = opt.replace(/^[A-F]\)\s*/, '');
                        const optStyle = brand?.optionStyle || 'bold-letter';

                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-xl text-xs flex items-start gap-2.5 transition-all select-text ${
                              showAnswerInPreview && isCorrect
                                ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold'
                                : 'bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 text-slate-800'
                            }`}
                          >
                            {/* Harf İkonu / Rozeti */}
                            {optStyle === 'circle' && (
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border mt-0.5 ${
                                  showAnswerInPreview && isCorrect
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'border-slate-400 text-slate-700 bg-white'
                                }`}
                                style={!isCorrect ? { borderColor: primaryBg, color: primaryBg } : undefined}
                              >
                                {letter}
                              </span>
                            )}
                            {optStyle === 'circle-fill' && (
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 text-white mt-0.5"
                                style={{ backgroundColor: showAnswerInPreview && isCorrect ? '#059669' : primaryBg }}
                              >
                                {letter}
                              </span>
                            )}
                            {optStyle === 'square' && (
                              <span
                                className={`w-5 h-5 rounded-xs flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border mt-0.5 ${
                                  showAnswerInPreview && isCorrect
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'border-slate-400 text-slate-700 bg-white'
                                }`}
                                style={!isCorrect ? { borderColor: primaryBg, color: primaryBg } : undefined}
                              >
                                {letter}
                              </span>
                            )}
                            {optStyle === 'soft-card' && (
                              <span
                                className="px-1.5 py-0.5 rounded-xs text-[10px] font-bold shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: showAnswerInPreview && isCorrect ? '#d1fae5' : `${primaryBg}18`,
                                  color: showAnswerInPreview && isCorrect ? '#065f46' : primaryBg,
                                }}
                              >
                                {letter}
                              </span>
                            )}
                            {(optStyle === 'bold-letter' || !['circle', 'circle-fill', 'square', 'soft-card'].includes(optStyle)) && (
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                                  showAnswerInPreview && isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {letter}
                              </span>
                            )}

                            <div className="flex-1 min-w-0 pt-0.5">
                              {cleanText ? (
                                <MathText content={cleanText} />
                              ) : (
                                <span className="text-slate-400 italic font-normal">
                                  ({letter} seçeneği metni)
                                </span>
                              )}
                            </div>
                            {showAnswerInPreview && isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                                <Check className="h-3 w-3 stroke-[3]" />
                                Doğru
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Açık Uçlu Çözüm Satırları */}
                {currentType === 'open_ended' && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Öğrenci Yanıt Alanı ({formData.linesForAnswer || 4} Satır):</span>
                    </div>
                    <div className="space-y-3.5 py-2">
                      {Array.from({ length: formData.linesForAnswer || 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="border-b border-dashed border-slate-300 w-full h-4"
                        />
                      ))}
                    </div>

                    {/* Öğretmen Çözüm Anahtarı */}
                    {showAnswerInPreview && formData.solutionExplanation && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <span className="font-bold block text-emerald-800">
                          Öğretmen Çözüm Anahtarı / Model Yanıt:
                        </span>
                        <div className="leading-relaxed">
                          <MathText content={formData.solutionExplanation} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Doğru / Yanlış (True / False) */}
                {currentType === 'true_false' && (
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold select-text">
                    {(() => {
                      const isTrue = formData.correctAnswer === 'Doğru' || formData.correctAnswer === 'D';
                      const isFalse = formData.correctAnswer === 'Yanlış' || formData.correctAnswer === 'Y';
                      return (
                        <>
                          <div
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all ${
                              showAnswerInPreview && isTrue
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-400 ring-2 ring-emerald-500/20 font-extrabold shadow-2xs'
                                : 'bg-slate-50 border-slate-300 text-slate-800'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-slate-400 bg-white flex items-center justify-center text-[10px] font-mono shrink-0">
                              {showAnswerInPreview && isTrue ? '✓' : ''}
                            </span>
                            <span>( D ) DOĞRU</span>
                          </div>

                          <div
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all ${
                              showAnswerInPreview && isFalse
                                ? 'bg-rose-100 text-rose-950 border-rose-400 ring-2 ring-rose-500/20 font-extrabold shadow-2xs'
                                : 'bg-slate-50 border-slate-300 text-slate-800'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-slate-400 bg-white flex items-center justify-center text-[10px] font-mono shrink-0">
                              {showAnswerInPreview && isFalse ? '✓' : ''}
                            </span>
                            <span>( Y ) YANLIŞ</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Boşluk Doldurma (Fill in the blank) */}
                {currentType === 'fill_blank' && (
                  <div className="pt-2 flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Cevap Alanı:</span>
                    <div className="border-b-2 border-slate-400 border-dashed w-48 inline-block h-4" />
                    {showAnswerInPreview && formData.correctAnswer && (
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                        [ {formData.correctAnswer} ]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Konu / Not Bloğu Önizlemesi (6 Farklı Blok Tarzı ile Tam Uyumlu) */
          (() => {
            const blockStyles: Record<
              string,
              { bg: string; border: string; borderLeft: string; icon: string; titleCol: string; badge: string }
            > = {
              formula: { bg: 'bg-blue-50/70', border: 'border-blue-200', borderLeft: 'border-l-blue-600', icon: '📐', titleCol: 'text-blue-900', badge: 'FORMÜL & TANIM' },
              example: { bg: 'bg-emerald-50/70', border: 'border-emerald-200', borderLeft: 'border-l-emerald-600', icon: '💡', titleCol: 'text-emerald-900', badge: 'ÖRNEK ÇÖZÜM' },
              warning: { bg: 'bg-amber-50/70', border: 'border-amber-200', borderLeft: 'border-l-amber-600', icon: '⚠️', titleCol: 'text-amber-900', badge: 'DİKKAT / UYARI' },
              practice: { bg: 'bg-purple-50/70', border: 'border-purple-200', borderLeft: 'border-l-purple-600', icon: '✍️', titleCol: 'text-purple-900', badge: 'UYGULAMA / ALIŞTIRMA' },
              summary: { bg: 'bg-stone-50', border: 'border-stone-300', borderLeft: 'border-l-stone-700', icon: '📌', titleCol: 'text-stone-900', badge: 'ÖZET BİLGİ' },
              heading: { bg: 'bg-stone-100', border: 'border-stone-300', borderLeft: 'border-l-stone-800', icon: '📖', titleCol: 'text-stone-900', badge: 'KONU BAŞLIĞI' }
            };
            const style = blockStyles[formData.blockType || 'summary'] || blockStyles.summary;

            return (
              <div className={`p-4 rounded-xl border border-l-4 ${style.bg} ${style.border} ${style.borderLeft} space-y-3 transition-all shadow-2xs`}>
                <div className="flex items-center gap-2 pb-1.5 border-b border-black/10">
                  <span className="text-base shrink-0">{style.icon}</span>
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 ${style.titleCol}`}>
                      {style.badge}
                    </span>
                    <span className={`font-black text-sm ${style.titleCol} truncate`}>
                      {formData.blockTitle || 'Konu / Bilgi Bloğu'}
                    </span>
                  </div>
                </div>

                {/* Blok Görseli Varsa */}
                {formData.imageUrl && (
                  <div className="overflow-hidden rounded-lg border border-slate-200 p-1 bg-white inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imageUrl}
                      alt="Blok Görseli"
                      className="max-h-56 object-contain"
                    />
                  </div>
                )}

                {/* Blok Metni */}
                {formData.text ? (
                  <div className="text-xs text-stone-900 leading-relaxed font-sans whitespace-pre-line break-words">
                    <MathText content={formData.text} />
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 italic">
                    (Blok metni henüz yazılmadı...)
                  </div>
                )}

                {/* Örnek Soru Çözümü (Varsa) */}
                {formData.solutionExplanation && (
                  <div className="mt-2.5 pt-2 border-t border-black/10 bg-white/70 p-2.5 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <span>✓</span> Örnek Çözüm & Model Açıklama:
                    </span>
                    <div className="text-slate-800 leading-relaxed">
                      <MathText content={formData.solutionExplanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* Alt Bilgi Kartı (Zorluk, MEB Kazanımı) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            {formData.difficulty && (
              <span
                className={`px-2 py-0.5 rounded-md font-bold ${
                  formData.difficulty === 'Kolay'
                    ? 'bg-emerald-100 text-emerald-800'
                    : formData.difficulty === 'Zor'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {formData.difficulty} Seviye
              </span>
            )}
            <span className="font-semibold text-slate-400">
              {docType === 'written' ? 'Yazılı Sınav Formatı' : 'Test / Deneme Formatı'}
            </span>
          </div>

          {formData.mebOutcomeCode && (
            <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 truncate max-w-xs">
              <span>🎯</span>
              <span className="truncate">{formData.mebOutcomeCode}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuestionEditorModal({
  question,
  index,
  questionNumber,
  totalQuestions,
  docType,
  brand,
  onSave,
  onRemove,
  onClose,
  onNavigate,
  onOpenCropTool,
  theme = 'light',
}: QuestionEditorModalProps) {
  const isDark = theme === 'dark';

  const DEFAULT_OPTIONS = ['A) ', 'B) ', 'C) ', 'D) ', 'E) '];

  const normalizeQuestion = (q: QuestionItem): QuestionItem => {
    const item = { ...q };
    if (item.type === 'multiple_choice' || !item.type) {
      if (!item.options || item.options.length < 2) {
        item.options = [...DEFAULT_OPTIONS];
      }
      if (!item.correctAnswer || !['A', 'B', 'C', 'D', 'E', 'F'].includes(item.correctAnswer)) {
        item.correctAnswer = 'A';
      }
    } else if (item.type === 'true_false') {
      if (item.correctAnswer === 'D' || item.correctAnswer === 'True' || item.correctAnswer === 'true' || item.correctAnswer === 'Doğru') {
        item.correctAnswer = 'Doğru';
      } else if (item.correctAnswer === 'Y' || item.correctAnswer === 'False' || item.correctAnswer === 'false' || item.correctAnswer === 'Yanlış') {
        item.correctAnswer = 'Yanlış';
      } else {
        item.correctAnswer = 'Doğru';
      }
    } else if (item.type === 'open_ended') {
      if (!item.linesForAnswer) {
        item.linesForAnswer = 4;
      }
    } else if (item.type === 'lecture_block') {
      if (!item.blockTitle) {
        item.blockTitle = 'Önemli Hatırlatma / Kural';
      }
      if (!item.blockType) {
        item.blockType = 'summary';
      }
    }
    return item;
  };

  // Local form state
  const [formData, setFormData] = useState<QuestionItem>(() => normalizeQuestion(question));
  const [prevQuestionId, setPrevQuestionId] = useState(question.id);
  const [showSubText, setShowSubText] = useState(Boolean(question.subText));
  const [isMathPickerOpen, setIsMathPickerOpen] = useState(false);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Drawer width (Daha büyüyebilir sağ bar: Normal Yan Yana Genişlik veya Tam Ekran)
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnswerInPreview, setShowAnswerInPreview] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if question prop changes via navigation
  if (question.id !== prevQuestionId) {
    setPrevQuestionId(question.id);
    setFormData(normalizeQuestion(question));
    setShowSubText(Boolean(question.subText));
    setShowImageSettings(false);
    setDeleteConfirm(false);
  }

  // Keyboard shortcut listener (ESC to close, Ctrl+Enter to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onSave(formData);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, onClose, onSave]);

  const updateField = <K extends keyof QuestionItem>(key: K, value: QuestionItem[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle question type change with automatic field normalization
  const handleTypeChange = (newType: QuestionType) => {
    setFormData((prev) => {
      const next: QuestionItem = { ...prev, type: newType };
      if (newType === 'multiple_choice') {
        if (!next.options || next.options.length < 2) {
          next.options = [...DEFAULT_OPTIONS];
        }
        if (!next.correctAnswer || !['A', 'B', 'C', 'D', 'E', 'F'].includes(next.correctAnswer)) {
          next.correctAnswer = 'A';
        }
        if (next.presentationFormat !== 'image_only') {
          next.optionsInImage = false;
        }
      } else if (newType === 'true_false') {
        if (next.correctAnswer === 'D' || next.correctAnswer === 'True' || next.correctAnswer === 'true' || next.correctAnswer === 'Doğru') {
          next.correctAnswer = 'Doğru';
        } else if (next.correctAnswer === 'Y' || next.correctAnswer === 'False' || next.correctAnswer === 'false' || next.correctAnswer === 'Yanlış') {
          next.correctAnswer = 'Yanlış';
        } else {
          next.correctAnswer = 'Doğru';
        }
      } else if (newType === 'open_ended') {
        if (!next.linesForAnswer) {
          next.linesForAnswer = 4;
        }
      } else if (newType === 'lecture_block') {
        if (!next.blockTitle) {
          next.blockTitle = 'Önemli Hatırlatma / Kural';
        }
        if (!next.blockType) {
          next.blockType = 'summary';
        }
      }
      return next;
    });
  };

  // Option text change for multiple choice
  const handleOptionChange = (optIdx: number, newRawText: string) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const letter = letters[optIdx] || `O${optIdx + 1}`;
    const cleanText = newRawText.replace(/^[A-F]\)\s*/, '');
    const fullOption = `${letter}) ${cleanText}`;

    const current = formData.options && formData.options.length >= 2
      ? [...formData.options]
      : [...DEFAULT_OPTIONS];

    while (current.length <= optIdx) {
      const idx = current.length;
      current.push(`${letters[idx] || `O${idx + 1}`}) `);
    }
    current[optIdx] = fullOption;
    updateField('options', current);
  };

  // Add new option
  const handleAddOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const current = formData.options && formData.options.length >= 2
      ? [...formData.options]
      : [...DEFAULT_OPTIONS];
    if (current.length >= 6) return;
    const nextLetter = letters[current.length];
    updateField('options', [...current, `${nextLetter}) `]);
  };

  // Remove option
  const handleRemoveOption = (optIdx: number) => {
    const currentOptions = formData.options && formData.options.length >= 2
      ? [...formData.options]
      : [...DEFAULT_OPTIONS];
    if (currentOptions.length <= 2) return;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    const filtered = currentOptions.filter((_, i) => i !== optIdx);
    const reIndexed = filtered.map((opt, i) => {
      const rawText = opt.replace(/^[A-F]\)\s*/, '');
      return `${letters[i]}) ${rawText}`;
    });

    updateField('options', reIndexed);

    const removedLetter = letters[optIdx];
    if (formData.correctAnswer === removedLetter) {
      updateField('correctAnswer', 'A');
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateField('imageUrl', dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Insert KaTeX formula snippet
  const handleInsertMath = (snippet: string) => {
    const textarea = textareaRef.current;
    const toInsert = `$${snippet}$`;
    if (!textarea) {
      updateField('text', (formData.text || '') + ' ' + toInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const oldVal = textarea.value;
    const newVal = oldVal.substring(0, start) + toInsert + oldVal.substring(end);
    updateField('text', newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + toInsert.length, start + toInsert.length);
    }, 50);
  };

  const handleSaveAndClose = () => {
    onSave(formData);
    onClose();
  };

  const handleSaveAndNext = () => {
    onSave(formData);
    if (onNavigate && index < totalQuestions - 1) {
      onNavigate(index + 1);
    } else {
      onClose();
    }
  };

  const currentType = formData.type || 'multiple_choice';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 overflow-hidden no-print select-none"
    >
      {/* Karartılmış Arka Plan (Tıklanınca kaydet & kapat) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`fixed inset-0 backdrop-blur-xs transition-opacity cursor-pointer ${
          isDark ? 'bg-black/60' : 'bg-slate-900/35'
        }`}
        onClick={handleSaveAndClose}
        aria-hidden="true"
      />

      {/* Sağdan Açılır Slide-over Panel (Büyüyebilir ve Canlı Önizlemeli Genişlik) */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className={`fixed inset-y-0 right-0 z-50 flex flex-col ${
          isExpanded
            ? 'w-full max-w-[100vw]'
            : 'w-full lg:w-[1240px] xl:w-[1380px] 2xl:w-[1500px] max-w-[98vw]'
        } h-full h-screen border-l shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-[#1a1c24] border-[#2f3544] text-[#f0f2f5]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* ================= 1. BAŞLIK ÇUBUĞU (h-14, sade ve düzenli) ================= */}
        <div
          className={`h-14 px-3 sm:px-5 border-b flex items-center justify-between shrink-0 select-none gap-2 ${
            isDark ? 'border-[#2d3342] bg-[#202430]' : 'border-slate-200 bg-slate-50/90'
          }`}
        >
          {/* Sol: Soru Başlığı & Soru Tipi Seçici */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm sm:text-base font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formData.type === 'lecture_block'
                  ? (formData.blockTitle || 'Konu / Not Bloğu')
                  : `${questionNumber ? `${questionNumber}. Soru` : `${index + 1}. Soru`}`}
              </span>
            </div>

            {/* Soru Tipi Seçici (Özel Tasarımsal Açılır Menü) */}
            <CustomQuestionTypeDropdown
              value={formData.type}
              onChange={handleTypeChange}
              isDark={isDark}
            />
          </div>

          {/* Orta / Sağ: Büyüt/Küçült Butonu & Soru Gezgini & Kapat */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Genişlet / Tam Ekran Toggle Butonu (Daha Büyüyebilir Sağ Bar) */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isExpanded
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                  : isDark
                  ? 'border-[#333a4c] bg-[#14161f] text-slate-400 hover:text-white hover:border-slate-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              title={
                isExpanded
                  ? 'Normal Boyuta Küçült'
                  : 'Tam Ekran Genişliğine Büyüt'
              }
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            {onNavigate && totalQuestions > 1 && (
              <div
                className={`flex items-center gap-0.5 p-0.5 rounded-lg border text-xs font-mono font-bold ${
                  isDark ? 'bg-[#151720] border-[#343a4a] text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onNavigate(index - 1)}
                  disabled={index === 0}
                  className={`p-1 rounded transition-colors disabled:opacity-25 cursor-pointer ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                  title="Önceki Soru"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-1.5 text-[11px]">
                  {index + 1} / {totalQuestions}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(index + 1)}
                  disabled={index === totalQuestions - 1}
                  className={`p-1 rounded transition-colors disabled:opacity-25 cursor-pointer ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                  title="Sonraki Soru"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveAndClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="Kapat (ESC)"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* ================= 2. İÇERİK: HER ZAMAN YAN YANA (DÜZENLEME FORMU + CANLI ÖNİZLEME) ================= */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* Sol Panel: Düzenleme Formu (%50 Genişlik) */}
          <div className="w-full md:w-1/2 overflow-y-auto p-4 sm:p-5 space-y-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#2f3544]">
              {/* Gizli Dosya Girişi */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

          {/* ----------------- BÖLÜM 1: SORU METNİ ----------------- */}
          {currentType !== 'lecture_block' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Soru Metni / Soru Kökü
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMathPickerOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    title="Matematik sembolü veya formül ekle"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Formül Ekle ({'$\\sqrt{x}$'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSubText((prev) => !prev)}
                    className={`text-[11px] font-semibold transition-colors cursor-pointer ${
                      showSubText
                        ? 'text-amber-600 dark:text-amber-400'
                        : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {showSubText ? '✓ Öncül Alanı Açık' : '+ Öncül / Metin (I, II, III)'}
                  </button>
                </div>
              </div>

              {/* Öncüller Alanı (I., II., III. gibi) */}
              {showSubText && (
                <div className="space-y-1">
                  <textarea
                    rows={2}
                    value={formData.subText || ''}
                    onChange={(e) => updateField('subText', e.target.value)}
                    placeholder="Öncülleri veya parça metnini buraya yazın (Örn: I. x > 0&#10;II. y < 0&#10;III. x + y = 5)"
                    className={`w-full p-2.5 text-xs rounded-xl border font-sans outline-hidden transition-all resize-y ${
                      isDark
                        ? 'bg-[#151720] border-[#383f50] text-amber-200 placeholder-slate-500 focus:border-amber-500'
                        : 'bg-amber-50/50 border-amber-200 text-amber-950 placeholder-slate-400 focus:border-amber-500'
                    }`}
                  />
                </div>
              )}

              {/* Ana Soru Metni Textarea */}
              <textarea
                ref={textareaRef}
                rows={4}
                value={formData.text || ''}
                onChange={(e) => updateField('text', e.target.value)}
                placeholder="Soru metnini buraya yazınız... Matematik formülleri için $x^2 + y^2$ formatını kullanabilirsiniz."
                className={`w-full p-3 text-xs sm:text-sm rounded-xl border font-sans outline-hidden transition-all resize-y leading-relaxed ${
                  isDark
                    ? 'bg-[#14161f] border-[#343a4a] text-white placeholder-slate-500 focus:border-sky-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600'
                }`}
              />

              {/* KaTeX Canlı Önizleme (Varsa) */}
              {formData.text && (formData.text.includes('$') || (formData.subText && formData.subText.includes('$'))) && (
                <div
                  className={`p-2.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    isDark ? 'bg-[#171a24] border-sky-900/40 text-sky-200' : 'bg-sky-50/70 border-sky-200 text-sky-950'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                    Canlı Matematik Önizlemesi:
                  </span>
                  {formData.subText && (
                    <div className="italic mb-1">
                      <MathText content={formData.subText} />
                    </div>
                  )}
                  <MathText content={formData.text} />
                </div>
              )}
            </div>
          ) : (
            /* Konu / Not Bloğu İçeriği */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Blok Başlığı
                  </label>
                  <input
                    type="text"
                    value={formData.blockTitle || ''}
                    onChange={(e) => updateField('blockTitle', e.target.value)}
                    placeholder="Örn: Önemli Hatırlatma / Kural"
                    className={`w-full h-9 px-3 text-xs rounded-xl border outline-hidden ${
                      isDark ? 'bg-[#14161f] border-[#343a4a] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Blok Tarzı
                  </label>
                  <CustomBlockTypeDropdown
                    value={formData.blockType || 'summary'}
                    onChange={(val) => updateField('blockType', val)}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Blok Metni & Formüller
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMathPickerOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    title="Matematik sembolü ekle"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Formül Ekle</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={formData.text || ''}
                  onChange={(e) => updateField('text', e.target.value)}
                  placeholder="Not metnini ve kuralları buraya yazınız... Matematik formülleri için $x^2 + y^2$ formatını kullanabilirsiniz."
                  className={`w-full p-3 text-xs sm:text-sm rounded-xl border outline-hidden resize-y ${
                    isDark ? 'bg-[#14161f] border-[#343a4a] text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Örnek Çözüm & Model Yanıt (Örnek veya Alıştırma Bloğu İçin) */}
              {(formData.blockType === 'example' || formData.blockType === 'practice') && (
                <div className="space-y-1">
                  <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Örnek Çözüm & Model Açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={formData.solutionExplanation || ''}
                    onChange={(e) => updateField('solutionExplanation', e.target.value)}
                    placeholder="Örnek sorunun adım adım model çözümünü buraya yazınız..."
                    className={`w-full p-2.5 text-xs rounded-xl border outline-hidden resize-y ${
                      isDark ? 'bg-[#14161f] border-[#343a4a] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              )}
            </div>
          )}

          {/* ----------------- BÖLÜM 2: SORU GÖRSELİ (Kompakt ve Temiz) ----------------- */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <ImageIcon className="h-3.5 w-3.5 text-sky-500" />
                <span>Soru Görseli</span>
              </span>

              {formData.imageUrl && (
                <div className="flex flex-wrap items-center gap-2">
                  <CustomPresentationFormatDropdown
                    value={
                      formData.presentationFormat ||
                      (formData.optionsInImage ? 'image_only' : 'image_hybrid')
                    }
                    onChange={(val) => {
                      updateField('presentationFormat', val);
                      if (val === 'image_only') {
                        updateField('optionsInImage', true);
                      }
                    }}
                    isDark={isDark}
                  />

                  <button
                    type="button"
                    onClick={() => setShowImageSettings((prev) => !prev)}
                    className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                      showImageSettings ? 'text-sky-500' : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>{showImageSettings ? 'Ayarları Gizle' : 'Boyut & Baskı Ayarı'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('imageUrl', undefined)}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Görseli Kaldır</span>
                  </button>
                </div>
              )}
            </div>

            {formData.imageUrl ? (
              <div
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center gap-3 ${
                  isDark ? 'bg-[#151720] border-[#313747]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Görsel Önizleme Küçük Thumbnail */}
                <div className="relative shrink-0 w-28 h-20 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-white flex items-center justify-center p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Soru Görseli"
                    style={{
                      transform: `rotate(${formData.imageRotation || 0}deg)`,
                      filter: formData.imageGrayscale ? 'grayscale(100%) contrast(140%)' : 'none',
                    }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Aksiyon Butonları & Hızlı Ayarlar */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Upload className="h-3 w-3" />
                      <span>Farklı Görsel Yükle</span>
                    </button>

                    {onOpenCropTool && (
                      <button
                        type="button"
                        onClick={() => {
                          onSave(formData);
                          onClose();
                          onOpenCropTool();
                        }}
                        className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          isDark
                            ? 'border-orange-900/60 bg-orange-950/30 text-orange-300 hover:bg-orange-950/50'
                            : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100'
                        }`}
                        title="PDF masasından bu soru için yeni alan kırp"
                      >
                        <Scissors className="h-3 w-3" />
                        <span>PDF&apos;den Kırp</span>
                      </button>
                    )}
                  </div>

                  {/* Genişlik & Baskı Seçenekleri (Açılır) */}
                  {showImageSettings && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">Genişlik:</span>
                        {[100, 80, 60, 40].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              updateField('imageNaturalSize', false);
                              updateField('imageWidthPercent', pct);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                              !formData.imageNaturalSize && (formData.imageWidthPercent || 100) === pct
                                ? 'bg-sky-600 text-white border-sky-600'
                                : isDark
                                ? 'border-slate-700 bg-slate-800 text-slate-300'
                                : 'border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            %{pct}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => updateField('imageRotation', ((formData.imageRotation || 0) + 90) % 360)}
                        className="px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCw className="h-3 w-3" />
                        <span>Döndür ({formData.imageRotation || 0}°)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateField('imageGrayscale', !formData.imageGrayscale)}
                        className={`px-2 py-0.5 rounded border text-[10px] font-semibold cursor-pointer ${
                          formData.imageGrayscale
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                            : ''
                        }`}
                      >
                        {formData.imageGrayscale ? '✓ S/B Baskı Modu' : 'S/B Baskı'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Görsel Yokken Sade Buton */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`py-2 px-3 rounded-xl border border-dashed text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isDark
                      ? 'border-[#383f50] bg-[#151720] text-slate-300 hover:border-sky-500 hover:text-white'
                      : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-sky-500 hover:bg-white'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Bilgisayardan Görsel Ekle</span>
                </button>

                {onOpenCropTool && (
                  <button
                    type="button"
                    onClick={() => {
                      onSave(formData);
                      onClose();
                      onOpenCropTool();
                    }}
                    className={`py-2 px-3 rounded-xl border border-dashed text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark
                        ? 'border-orange-900/60 bg-orange-950/20 text-orange-300 hover:bg-orange-950/40'
                        : 'border-orange-200 bg-orange-50/50 text-orange-800 hover:bg-orange-100'
                    }`}
                  >
                    <Scissors className="h-3.5 w-3.5 text-orange-500" />
                    <span>PDF&apos;den Soru Kırp</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ----------------- BÖLÜM 3: SEÇENEKLER VE DOĞRU CEVAP ----------------- */}
          {currentType === 'multiple_choice' && (
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Seçenekler ve Doğru Cevap
                </label>

                {/* Şıklar Görselde Mi? (Kırpılmış sorular için optik anahtar modu) */}
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.optionsInImage)}
                    onChange={(e) => updateField('optionsInImage', e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>Şıklar görselin içinde (Yalnızca cevap anahtarı)</span>
                </label>
              </div>

              {formData.optionsInImage ? (
                /* Sadece Cevap Anahtarı Harfleri */
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block">Doğru Cevabı Seçiniz:</span>
                  <div className="flex flex-wrap gap-2">
                    {['A', 'B', 'C', 'D', 'E'].map((letter) => {
                      const isCorrect = formData.correctAnswer === letter;
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => updateField('correctAnswer', letter)}
                          className={`h-9 w-12 rounded-xl font-mono text-sm font-black transition-all cursor-pointer border ${
                            isCorrect
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : isDark
                              ? 'bg-[#151720] border-[#383f50] text-slate-300 hover:bg-[#202430]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Normal A, B, C, D, E Şık Düzenleme Satırları */
                <div className="space-y-2">
                  {(formData.options || ['A) ', 'B) ', 'C) ', 'D) ', 'E) ']).map((opt, optIdx) => {
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                    const letter = letters[optIdx] || `O${optIdx + 1}`;
                    const isCorrect = formData.correctAnswer === letter;
                    const cleanText = opt.replace(/^[A-F]\)\s*/, '');

                    return (
                      <div key={optIdx} className="flex items-center gap-2 group">
                        {/* Doğru Cevap Seçim Butonu (Harf Yuvarlağı) */}
                        <button
                          type="button"
                          onClick={() => updateField('correctAnswer', letter)}
                          className={`h-8 w-8 rounded-xl font-mono text-xs font-black shrink-0 transition-all cursor-pointer border flex items-center justify-center ${
                            isCorrect
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-105'
                              : isDark
                              ? 'bg-[#151720] border-[#383f50] text-slate-400 hover:border-emerald-500 hover:text-emerald-400'
                              : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                          }`}
                          title={`Doğru cevap olarak [${letter}] seç`}
                        >
                          {isCorrect ? <Check className="h-4 w-4 stroke-[3]" /> : letter}
                        </button>

                        {/* Şık Metni Girişi */}
                        <input
                          type="text"
                          value={cleanText}
                          onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                          placeholder={`${letter} seçeneği metni...`}
                          className={`flex-1 h-8 px-3 text-xs rounded-xl border outline-hidden transition-all ${
                            isCorrect
                              ? isDark
                                ? 'bg-emerald-950/20 border-emerald-700/60 text-white focus:border-emerald-500'
                                : 'bg-emerald-50/50 border-emerald-300 text-slate-900 focus:border-emerald-600'
                              : isDark
                              ? 'bg-[#14161f] border-[#343a4a] text-white focus:border-sky-500'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-sky-600'
                          }`}
                        />

                        {/* Şıkkı Sil (En az 2 şık kalmalı) */}
                        {(formData.options || []).length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer opacity-40 group-hover:opacity-100"
                            title="Seçeneği Kaldır"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {(formData.options || []).length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Yeni Seçenek Ekle (F şıkkına kadar)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Açık Uçlu (Klasik) Soru Alanları */}
          {currentType === 'open_ended' && (
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className={`block text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Öğretmen Çözüm Anahtarı / Beklenen Yanıt
                  </label>
                  <textarea
                    rows={2}
                    value={formData.solutionExplanation || ''}
                    onChange={(e) => updateField('solutionExplanation', e.target.value)}
                    placeholder="Sınav çözüm kağıdında yer alacak model çözümü yazınız..."
                    className={`w-full p-2.5 text-xs rounded-xl border outline-hidden resize-y ${
                      isDark ? 'bg-[#14161f] border-[#343a4a] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Çözüm Satırı Sayısı
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={formData.linesForAnswer || 4}
                    onChange={(e) => updateField('linesForAnswer', parseInt(e.target.value, 10) || 4)}
                    className={`w-full h-9 px-3 text-xs rounded-xl border outline-hidden ${
                      isDark ? 'bg-[#14161f] border-[#343a4a] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400">Yazılı kağıdında öğrenciye ayrılacak çizgi adedi.</span>
                </div>
              </div>
            </div>
          )}

          {/* Doğru / Yanlış Soru Alanları */}
          {currentType === 'true_false' && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className={`block text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Doğru Cevabı Belirleyin
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {formData.correctAnswer === 'Doğru' || formData.correctAnswer === 'D' ? 'Seçili: DOĞRU' : 'Seçili: YANLIŞ'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => updateField('correctAnswer', 'Doğru')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    formData.correctAnswer === 'Doğru' || formData.correctAnswer === 'D'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                      : isDark
                      ? 'bg-[#151720] border-[#383f50] text-slate-300 hover:border-emerald-500 hover:text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-slate-900'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-mono shrink-0">
                    {formData.correctAnswer === 'Doğru' || formData.correctAnswer === 'D' ? '✓' : 'D'}
                  </span>
                  <span>( D ) DOĞRU</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('correctAnswer', 'Yanlış')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    formData.correctAnswer === 'Yanlış' || formData.correctAnswer === 'Y'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/20'
                      : isDark
                      ? 'bg-[#151720] border-[#383f50] text-slate-300 hover:border-rose-500 hover:text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-rose-500 hover:text-slate-900'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-mono shrink-0">
                    {formData.correctAnswer === 'Yanlış' || formData.correctAnswer === 'Y' ? '✓' : 'Y'}
                  </span>
                  <span>( Y ) YANLIŞ</span>
                </button>
              </div>
            </div>
          )}

          {/* Boşluk Doldurma Soru Alanları */}
          {currentType === 'fill_blank' && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className={`block text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Boşluğa Gelecek Doğru Yanıt
              </label>
              <input
                type="text"
                value={formData.correctAnswer || ''}
                onChange={(e) => updateField('correctAnswer', e.target.value)}
                placeholder="Örn: hipotenüs / 180 / fotosentez"
                className={`w-full h-9 px-3 text-xs rounded-xl border outline-hidden ${
                  isDark ? 'bg-[#14161f] border-[#343a4a] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          )}

          {/* ----------------- BÖLÜM 4: PUAN, ZORLUK & MEB KAZANIMI (Kompakt Tek Satır) ----------------- */}
          {currentType !== 'lecture_block' && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Puan (3 Kolon) */}
              <div className="sm:col-span-3 space-y-1">
                <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Soru Puanı
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.points || 10}
                    onChange={(e) => updateField('points', parseInt(e.target.value, 10) || 10)}
                    className={`w-full h-9 px-3 text-xs font-bold font-mono rounded-xl border outline-hidden ${
                      isDark ? 'bg-[#14161f] border-[#343a4a] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <span className="text-xs text-slate-400 font-semibold">Puan</span>
                </div>
              </div>

              {/* Zorluk (4 Kolon) */}
              <div className="sm:col-span-4 space-y-1">
                <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Zorluk Derecesi
                </label>
                <CustomDifficultyDropdown
                  value={formData.difficulty || 'Orta'}
                  onChange={(val) => updateField('difficulty', val)}
                  isDark={isDark}
                  dropUp={true}
                />
              </div>

              {/* MEB Kazanımı (5 Kolon) */}
              <div className="sm:col-span-5 space-y-1">
                <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  MEB Kazanımı
                </label>
                <CustomMebOutcomeDropdown
                  selectedCode={formData.mebOutcomeCode}
                  onChange={(code, desc) => {
                    updateField('mebOutcomeCode', code);
                    updateField('mebOutcomeText', desc);
                  }}
                  isDark={isDark}
                  dropUp={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sağ Panel: Canlı Sınav Kâğıdı Önizlemesi (Her Zaman Yan Yana) */}
        <div className="w-full md:w-1/2 overflow-y-auto p-4 sm:p-6 bg-slate-100/80 dark:bg-[#12141c]">
          <LiveQuestionPaperPreview
            formData={formData}
            questionNumber={questionNumber || index + 1}
            docType={docType}
            showAnswerInPreview={showAnswerInPreview}
            onToggleAnswer={() => setShowAnswerInPreview((prev) => !prev)}
            isDark={isDark}
            brand={brand}
          />
        </div>
      </div>

        {/* ================= 3. ALT AKSİYON ÇUBUĞU (h-14, belirgin butonlar) ================= */}
        <div
          className={`h-14 px-4 sm:px-5 border-t flex items-center justify-between shrink-0 select-none ${
            isDark ? 'border-[#2d3342] bg-[#202430]' : 'border-slate-200 bg-slate-50/90'
          }`}
        >
          {/* Sol: Soruyu Sil */}
          <div>
            {deleteConfirm ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-rose-500 font-bold">Silinsin mi?</span>
                <button
                  type="button"
                  onClick={() => onRemove(question.id)}
                  className="px-2 py-1 rounded bg-rose-600 text-white text-xs font-bold cursor-pointer hover:bg-rose-500"
                >
                  Evet, Sil
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="px-2 py-1 rounded border text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Soruyu Sil</span>
              </button>
            )}
          </div>

          {/* Sağ: İptal, Kaydet ve Sonraki, Kaydet */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Vazgeç
            </button>

            {onNavigate && index < totalQuestions - 1 && (
              <button
                type="button"
                onClick={handleSaveAndNext}
                className={`hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-sky-800 bg-sky-950/40 text-sky-300 hover:bg-sky-900/40'
                    : 'border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100'
                }`}
              >
                <span>Kaydet &amp; Sonraki</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Matematik Formül Seçici Modalı */}
      {isMathPickerOpen && (
        <MathSymbolPickerModal
          isOpen={isMathPickerOpen}
          onClose={() => setIsMathPickerOpen(false)}
          onInsert={handleInsertMath}
          theme={theme}
        />
      )}
    </motion.div>
  );
}
