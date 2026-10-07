'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { QuestionItem, QuestionType, QuestionDifficulty } from '@/types/studio';
import { MEB_OUTCOMES, COURSE_LIST, GRADE_LIST } from '@/data/mebOutcomes';
import CustomSelect from '@/components/CustomSelect';
import {
  Database,
  Search,
  Filter,
  Plus,
  Scissors,
  Check,
  CheckSquare,
  Sparkles,
  BookOpen,
  HelpCircle,
  Trash2,
  Edit3
} from 'lucide-react';

interface QuestionPoolDrawerProps {
  poolQuestions: QuestionItem[];
  documentQuestions: QuestionItem[];
  onAddQuestionToDoc: (q: QuestionItem) => void;
  onAddMultipleToDoc: (questions: QuestionItem[]) => void;
  onAddNewToPool: (q: QuestionItem) => void;
  onOpenCropModal: () => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export default function QuestionPoolDrawer({
  poolQuestions,
  documentQuestions,
  onAddQuestionToDoc,
  onAddMultipleToDoc,
  onAddNewToPool,
  onOpenCropModal,
  onClose,
  theme = 'light',
}: QuestionPoolDrawerProps) {
  const isDark = theme === 'dark';
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('Tümü');
  const [selectedGrade, setSelectedGrade] = useState<string>('Tümü');
  const [selectedType, setSelectedType] = useState<string>('Tümü');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // New Question Form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newType, setNewType] = useState<QuestionType>('multiple_choice');
  const [newText, setNewText] = useState('');
  const [newSubText, setNewSubText] = useState('');
  const [newCourse, setNewCourse] = useState('Matematik');
  const [newGrade, setNewGrade] = useState('9. Sınıf');
  const [newDifficulty, setNewDifficulty] = useState<QuestionDifficulty>('Orta');
  const [newPoints, setNewPoints] = useState(10);
  const [newOutcomeCode, setNewOutcomeCode] = useState('MAT.9.3.1');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('A');
  const [newSolution, setNewSolution] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>([
    'A) ',
    'B) ',
    'C) ',
    'D) ',
    'E) '
  ]);

  // Insert math symbol into text
  const insertSymbol = (sym: string) => {
    setNewText((prev) => prev + sym);
  };

  // Filtered list
  const filtered = useMemo(() => {
    return poolQuestions.filter((q) => {
      const matchSearch =
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.subText && q.subText.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.mebOutcomeCode && q.mebOutcomeCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCourse = selectedCourse === 'Tümü' || q.courseName === selectedCourse;
      const matchGrade = selectedGrade === 'Tümü' || q.gradeLevel === selectedGrade;
      const matchType = selectedType === 'Tümü' || q.type === selectedType;

      return matchSearch && matchCourse && matchGrade && matchType;
    });
  }, [poolQuestions, searchTerm, selectedCourse, selectedGrade, selectedType]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAllFiltered = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((q) => q.id)));
    }
  };

  const addSelectedToDoc = () => {
    const toAdd = poolQuestions.filter((q) => selectedIds.has(q.id));
    onAddMultipleToDoc(toAdd);
    setSelectedIds(new Set());
  };

  // Check if question is already in document
  const isInDoc = (id: string) => documentQuestions.some((q) => q.id === id);

  const handleCreateQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const matched = MEB_OUTCOMES.find((o) => o.code === newOutcomeCode);

    const created: QuestionItem = {
      id: 'custom-' + Date.now(),
      type: newType,
      courseName: newCourse,
      gradeLevel: newGrade,
      difficulty: newDifficulty,
      points: Number(newPoints) || 10,
      text: newText,
      subText: newSubText || undefined,
      options: newType === 'multiple_choice' ? newOptions : [],
      correctAnswer: newCorrectAnswer,
      solutionExplanation: newSolution || undefined,
      mebOutcomeCode: matched?.code || newOutcomeCode,
      mebOutcomeText: matched?.description || undefined,
      linesForAnswer: newType === 'open_ended' ? 5 : undefined
    };

    onAddNewToPool(created);
    onAddQuestionToDoc(created);
    setIsCreatingNew(false);
    // Reset form
    setNewText('');
    setNewSubText('');
    setNewSolution('');
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

      {/* 2. Sağ Duvara Bağlı Geniş Soru Havuzu Penceresi */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[720px] md:w-[840px] lg:w-[940px] max-w-[96vw] h-full h-screen border-l shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#1e212a] border-[#2c303c] text-[#f0f2f5]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className={`flex items-center justify-between border-b px-3.5 sm:px-6 py-3 sm:py-4 transition-colors ${
          isDark ? 'border-[#2c303c] bg-[#242732]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl font-bold text-sm sm:text-base shadow-xs shrink-0 ${
              isDark ? 'bg-[#323846] text-[#f0f2f5] border border-[#41495b]' : 'bg-sky-600 text-white'
            }`}>
              <Database className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f0f2f5]' : 'text-slate-900'}`}>Ortak Soru Havuzu &amp; MEB Kazanımları</h3>
              <p className={`text-[10px] sm:text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                1279 MEB kazanımı, hazır sorular ve arşiviniz
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-xl p-1.5 sm:p-2 transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:bg-[#2d323f] hover:text-white' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Action Shortcuts Bar */}
        <div className={`flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b px-3.5 sm:px-6 py-2.5 sm:py-3 transition-colors ${
          isDark ? 'border-[#2c303c] bg-[#22252e]' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsCreatingNew((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
              <span>Yeni Soru Yaz</span>
            </button>

            <button
              onClick={onOpenCropModal}
              className={`flex items-center gap-1.5 rounded-xl border px-3 sm:px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                isDark
                  ? 'border-[#383f4f] bg-[#252833] hover:bg-[#2c313f] text-[#d6dae4] hover:text-white'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Scissors className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
              <span className="hidden sm:inline">PDF/Görselden Kırp</span>
              <span className="sm:hidden">Kırp</span>
            </button>
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={addSelectedToDoc}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-500 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
              <span>Seçilen {selectedIds.size} Soruyu Ekle</span>
            </button>
          )}
        </div>

        {/* New Question Form Drawer if open */}
        {isCreatingNew && (
          <div className="border-b border-stone-300 bg-stone-50 p-5 overflow-y-auto max-h-[60vh] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Yeni Soru / Blok Oluştur
              </h4>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="text-xs text-stone-500 hover:underline"
              >
                Vazgeç
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-3 text-xs">
              {/* Type, Course, Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Soru Türü</label>
                  <CustomSelect
                    value={newType}
                    onChange={(val) => setNewType(val as any)}
                    options={[
                      { value: 'multiple_choice', label: 'Çoktan Seçmeli (A-E)' },
                      { value: 'open_ended', label: 'Klasik Açık Uçlu (Yazılı)' },
                      { value: 'true_false', label: 'Doğru / Yanlış' },
                      { value: 'fill_blank', label: 'Boşluk Doldurma' },
                      { value: 'lecture_block', label: 'Konu Föyü Bilgi Bloğu' },
                    ]}
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Ders</label>
                  <CustomSelect
                    value={newCourse}
                    onChange={(val) => setNewCourse(val)}
                    options={COURSE_LIST.map((c) => ({ value: c, label: c }))}
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Sınıf</label>
                  <CustomSelect
                    value={newGrade}
                    onChange={(val) => setNewGrade(val)}
                    options={GRADE_LIST.map((g) => ({ value: g, label: g }))}
                  />
                </div>
              </div>

              {/* Math symbols bar */}
              <div className="flex items-center gap-1 flex-wrap bg-white p-1.5 rounded border border-stone-200">
                <span className="text-stone-400 text-[10px] mr-1">Matematik Sembolleri:</span>
                {['√', '²', '³', 'π', '∑', '∫', '≤', '≥', '≠', '±', '∞', '·', '∆', '∈', '⊂', '∩', '∪'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => insertSymbol(sym)}
                    className="h-6 w-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-xs flex items-center justify-center"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Question Text */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Soru Metni / Kökü</label>
                <textarea
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Soru metnini yazınız..."
                  className="w-full rounded border border-stone-300 bg-white p-2 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                />
              </div>

              {/* Subtext / Öncüller */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Öncüller / Parça (İsteğe bağlı)</label>
                <textarea
                  rows={2}
                  value={newSubText}
                  onChange={(e) => setNewSubText(e.target.value)}
                  placeholder="I. ..., II. ..., III. ..."
                  className="w-full rounded border border-stone-300 bg-white p-2 text-stone-900"
                />
              </div>

              {/* Options if Multiple Choice */}
              {newType === 'multiple_choice' && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 block">Şıklar ve Doğru Cevap</label>
                  {['A', 'B', 'C', 'D', 'E'].map((letter, idx) => (
                    <div key={letter} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCorrectAnswer(letter)}
                        className={`h-7 w-7 rounded font-bold transition-colors ${
                          newCorrectAnswer === letter
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                        }`}
                        title="Doğru cevap olarak işaretle"
                      >
                        {letter}
                      </button>
                      <input
                        type="text"
                        value={newOptions[idx]?.replace(/^[A-E]\)\s*/, '') || ''}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[idx] = `${letter}) ${e.target.value}`;
                          setNewOptions(updated);
                        }}
                        placeholder={`${letter} seçeneği...`}
                        className="flex-1 rounded border border-stone-300 bg-white px-2 py-1 text-stone-900"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Correct answer and Points */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Doğru Cevap</label>
                  <input
                    type="text"
                    value={newCorrectAnswer}
                    onChange={(e) => setNewCorrectAnswer(e.target.value)}
                    placeholder="örn: B veya 15"
                    className="w-full rounded border border-stone-300 bg-white p-1.5 text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Soru Puanı (Yazılı için)</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full rounded border border-stone-300 bg-white p-1.5 text-stone-900"
                  />
                </div>
              </div>

              {/* MEB Outcome */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1">MEB Kazanım Kodu</label>
                <CustomSelect
                  value={newOutcomeCode}
                  onChange={(val) => setNewOutcomeCode(val)}
                  options={MEB_OUTCOMES.map((o) => ({
                    value: o.code,
                    label: `${o.code} — ${o.topic}`,
                    badge: o.code,
                  }))}
                />
              </div>

              {/* Solution */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Çözüm Açıklaması (Öğretmen Föyü için)</label>
                <textarea
                  rows={2}
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  placeholder="Detaylı çözüm basamakları..."
                  className="w-full rounded border border-stone-300 bg-white p-2 text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isDark
                      ? 'border-[#383f4f] bg-[#242833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Havuza ve Belgeye Ekle
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="border-b border-stone-200 bg-stone-50 px-3.5 sm:px-6 py-2.5 sm:py-3 space-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sorularda, kazanım kodlarında veya konularda ara..."
              className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 py-1.5 text-xs text-stone-900 focus:border-blue-900 focus:outline-hidden"
            />
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <CustomSelect
              value={selectedCourse}
              onChange={(val) => setSelectedCourse(val)}
              options={[
                { value: 'Tümü', label: 'Tüm Dersler' },
                ...COURSE_LIST.map((c) => ({ value: c, label: c })),
              ]}
              theme={theme}
              size="sm"
            />

            <CustomSelect
              value={selectedGrade}
              onChange={(val) => setSelectedGrade(val)}
              options={[
                { value: 'Tümü', label: 'Tüm Sınıflar' },
                ...GRADE_LIST.map((g) => ({ value: g, label: g })),
              ]}
              theme={theme}
              size="sm"
            />

            <CustomSelect
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              options={[
                { value: 'Tümü', label: 'Tüm Soru Tipleri' },
                { value: 'multiple_choice', label: 'Çoktan Seçmeli' },
                { value: 'open_ended', label: 'Klasik Açık Uçlu' },
                { value: 'true_false', label: 'Doğru / Yanlış' },
                { value: 'fill_blank', label: 'Boşluk Doldurma' },
                { value: 'lecture_block', label: 'Konu Föyü Bloğu' },
              ]}
              theme={theme}
              size="sm"
            />
          </div>

          {/* Select all bar */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
            <button
              onClick={selectAllFiltered}
              className="font-medium text-blue-900 hover:underline flex items-center gap-1"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              {selectedIds.size === filtered.length && filtered.length > 0
                ? 'Seçimi Temizle'
                : `Filtrelenen ${filtered.length} Soruyu Seç`}
            </button>
            <span>Toplam {poolQuestions.length} soru havuzda</span>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Arama kriterlerine uygun soru bulunamadı. Yeni soru ekleyebilir veya filtrenizi değiştirebilirsiniz.
            </div>
          ) : (
            filtered.map((q) => {
              const inDoc = isInDoc(q.id);
              const isSelected = selectedIds.has(q.id);
              return (
                <div
                  key={q.id}
                  className={`relative rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/40 ring-1 ring-blue-900/30'
                      : inDoc
                      ? 'border-stone-200 bg-stone-50/80 opacity-90'
                      : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(q.id)}
                        className="h-4 w-4 rounded border-stone-300 text-blue-900 focus:ring-blue-900"
                      />
                      {q.mebOutcomeCode && (
                        <span className="text-[11px] font-bold text-blue-950 bg-blue-100/70 px-2 py-0.5 rounded">
                          {q.mebOutcomeCode}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-stone-700">
                        {q.courseName} · {q.gradeLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500 font-medium">
                        {q.points || 10} Puan
                      </span>
                      {inDoc ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Belgede Ekli
                        </span>
                      ) : (
                        <button
                          onClick={() => onAddQuestionToDoc(q)}
                          className="flex items-center gap-1 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                        >
                          <Plus className="h-3 w-3 stroke-[2.5]" />
                          Belgeye Ekle
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Image if any */}
                  {q.imageUrl && (
                    <div className="mt-2.5 max-h-36 overflow-hidden rounded border border-stone-200 bg-stone-50 p-1 flex justify-center">
                      <img
                        src={q.imageUrl}
                        alt="Soru Görseli"
                        className="max-h-32 object-contain"
                      />
                    </div>
                  )}

                  {/* Subtext */}
                  {q.subText && (
                    <div className="mt-2 text-xs text-stone-600 bg-stone-50 p-2 rounded border border-stone-150 font-serif whitespace-pre-line">
                      {q.subText}
                    </div>
                  )}

                  {/* Text */}
                  <p className="mt-2 text-xs font-medium text-stone-900 leading-relaxed whitespace-pre-line">
                    {q.text}
                  </p>

                  {/* Options */}
                  {q.options && q.options.length > 0 && q.type === 'multiple_choice' && (
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-stone-600 font-mono">
                      {q.options.map((opt, i) => (
                        <div key={i} className="truncate">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer info: Correct Answer */}
                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-500">
                    <div>
                      Doğru Cevap:{' '}
                      <span className="font-bold text-stone-800">{q.correctAnswer}</span>
                    </div>
                    {q.mebOutcomeText && (
                      <div className="truncate max-w-[280px]" title={q.mebOutcomeText}>
                        {q.mebOutcomeText}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between border-t px-6 py-3.5 transition-colors ${
          isDark ? 'border-[#2c303c] bg-[#242732]' : 'border-slate-200 bg-slate-50'
        }`}>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {documentQuestions.length} soru belgenizde bulunuyor
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] px-5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
