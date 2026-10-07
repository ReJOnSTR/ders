'use client';

import React from 'react';
import {
  Pencil,
  Trash2,
  Copy,
  SplitSquareVertical,
  AlignLeft,
  CheckSquare,
  FormInput,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { QuestionItem, QuestionType, DocumentType } from '@/types/studio';

interface SidebarQuestionEditorProps {
  question: QuestionItem;
  index: number;
  questionNumber?: number;
  isSelected?: boolean;
  onOpenEditModal: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onTogglePageBreak: () => void;
  hasPageBreak: boolean;
  docType: DocumentType;
  theme?: 'light' | 'dark';
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'multiple_choice', label: 'Çoktan Seçmeli', icon: CheckSquare },
  { type: 'open_ended', label: 'Açık Uçlu', icon: AlignLeft },
  { type: 'true_false', label: 'Doğru / Yanlış', icon: CheckSquare },
  { type: 'fill_blank', label: 'Boşluk Doldurma', icon: FormInput },
  { type: 'lecture_block', label: 'Konu / Not Bloğu', icon: BookOpen },
];

export default function SidebarQuestionEditor({
  question,
  index,
  questionNumber,
  isSelected = false,
  onOpenEditModal,
  onRemove,
  onDuplicate,
  onTogglePageBreak,
  hasPageBreak,
  docType,
  theme = 'light',
}: SidebarQuestionEditorProps) {
  const isDark = theme === 'dark';
  const isBlock = question.type === 'lecture_block';
  const currentTypeMeta = QUESTION_TYPES.find((t) => t.type === question.type) || QUESTION_TYPES[0];
  const TypeIcon = currentTypeMeta.icon;

  return (
    <div
      onClick={onOpenEditModal}
      className={`group relative rounded-2xl border transition-all duration-150 p-3.5 sm:p-4 cursor-pointer select-none space-y-2.5 overflow-hidden min-w-0 ${
        isSelected
          ? isDark
            ? 'border-[#4d5568] bg-[#272b36] ring-2 ring-[#4d5568]/20 shadow-md text-[#f0f2f5]'
            : 'border-stone-800 bg-stone-50/80 ring-2 ring-stone-900/10 shadow-xs text-slate-900'
          : isDark
          ? 'border-[#2d323f] bg-[#22252e] hover:border-[#3e4454] hover:bg-[#262a34] text-[#e2e5ec]'
          : 'border-slate-200/90 bg-white hover:border-stone-300 hover:shadow-xs text-slate-900'
      }`}
    >
      {/* 1. Top Row: Question Number or Block Badge + Type Badge + Points + Action Buttons */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {/* Question Number Badge OR Lecture Block Badge */}
          {isBlock ? (
            <span
              className={`inline-flex max-w-[155px] sm:max-w-[185px] h-6 px-2 items-center rounded-lg font-bold text-xs shadow-2xs gap-1.5 shrink min-w-0 overflow-hidden ${
                isDark
                  ? 'bg-amber-950/40 text-amber-300 border border-amber-800/80'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
              title={question.blockTitle || 'Konu / Not Bloğu'}
            >
              <BookOpen className="h-3 w-3 shrink-0" />
              <span className="truncate">{question.blockTitle || 'Konu / Not Bloğu'}</span>
            </span>
          ) : (
            <span
              className={`flex h-6 px-2 items-center justify-center rounded-lg font-mono text-xs font-bold shadow-2xs shrink-0 ${
                isDark
                  ? 'bg-[#323846] text-[#f0f2f5] border border-[#41495b]'
                  : 'bg-stone-100 text-stone-900 border border-stone-200'
              }`}
            >
              {questionNumber ? `${questionNumber}. Soru` : `${index + 1}. Soru`}
            </span>
          )}

          {/* Question Type Pill (for questions only) */}
          {!isBlock && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 ${
                isDark
                  ? 'bg-[#2a2f3c] text-[#d3d8e2] border-[#363c4c]'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <TypeIcon className={`h-3 w-3 ${isDark ? 'text-[#9ba2b0]' : 'text-slate-500'}`} />
              <span>{currentTypeMeta.label}</span>
            </span>
          )}

          {/* Points Pill (only for questions) */}
          {!isBlock && (
            docType === 'written' ? (
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border shrink-0 ${
                  isDark
                    ? 'bg-[#2e3444] text-[#d3d8e2] border-[#3e4659]'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                {question.points || 10} Puan
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                  isDark
                    ? 'bg-[#2a2f3c] text-[#9ba2b0]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {question.points || 5}p
              </span>
            )
          )}

          {/* Soru Sunum Formatı Göstergesi */}
          {(() => {
            const fmt =
              question.presentationFormat ||
              (question.isImageOnly ? 'image_only' : question.imageUrl ? 'image_hybrid' : 'text_only');

            if (fmt === 'image_only') {
              return (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    isDark
                      ? 'bg-purple-950/40 text-purple-300 border-purple-800/80'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                  title="Sadece Görsel Soru (Kupür)"
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Sadece Görsel</span>
                </span>
              );
            }
            if (fmt === 'image_ocr') {
              return (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    isDark
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/80'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                  title="Görselden Metne (Ayrıştırılmış & Kopyalanabilir)"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Görselden Metne</span>
                </span>
              );
            }
            if (fmt === 'image_hybrid') {
              return (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    isDark
                      ? 'bg-sky-950/40 text-sky-300 border-sky-800/80'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}
                  title="Görsel + Soru Tipleri (Hibrit)"
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Görsel + Soru</span>
                </span>
              );
            }
            return null;
          })()}
        </div>

        {/* Action Buttons Toolbar */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Düzenle Button */}
          <button
            type="button"
            onClick={onOpenEditModal}
            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-[#f0f2f5] hover:bg-[#2d323f]'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Soruyu Düzenle (Pencereyi Aç)"
            aria-label="Soruyu Düzenle"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Sayfa Sonu */}
          <button
            type="button"
            onClick={onTogglePageBreak}
            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              hasPageBreak
                ? 'text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 font-bold shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-[#f0f2f5] hover:bg-[#2d323f]'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={hasPageBreak ? 'Sayfa sonunu kaldır' : 'Bu sorudan sonra yeni sayfaya geç (Sayfa Sonu)'}
          >
            <SplitSquareVertical className="h-3.5 w-3.5" />
          </button>

          {/* Çoğalt */}
          <button
            type="button"
            onClick={onDuplicate}
            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-[#f0f2f5] hover:bg-[#2d323f]'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Soruyu Çoğalt"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Sil */}
          <button
            type="button"
            onClick={onRemove}
            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title="Belgeden Çıkar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Middle Row: Soru Görseli (Eğer Varsa) + Soru Metni */}
      <div className="space-y-2">
        {question.imageUrl && (
          <div
            className={`rounded-xl border p-1.5 flex items-center justify-start max-h-24 overflow-hidden ${
              isDark ? 'border-[#2e323e] bg-[#1a1c23]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.imageUrl}
              alt="Soru Görseli"
              className="max-h-20 object-contain rounded"
            />
          </div>
        )}

        <p
          className={`text-xs font-medium leading-relaxed line-clamp-3 ${
            isDark ? 'text-[#e2e5ec]' : 'text-slate-800'
          }`}
        >
          {question.type === 'lecture_block'
            ? `[FÖY] ${question.blockTitle || question.text}`
            : question.text || (question.imageUrl ? '(Görsel soru yüklenmiş, kök metin girilmemiş)' : 'Soru metni girilmemiş')}
        </p>
      </div>

      {/* 3. Bottom Row: Cevap, Zorluk & Kazanım Kodları */}
      <div
        className={`flex flex-wrap items-center gap-2 pt-1 border-t text-[10px] ${
          isDark ? 'border-[#2b2f3b]' : 'border-slate-100'
        }`}
      >
        {question.correctAnswer && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold border ${
              isDark
                ? 'bg-[#272b36] text-[#d3d8e2] border-[#353b4b]'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <span>Cevap:</span>
            <strong className={isDark ? 'text-emerald-400 font-black' : 'text-emerald-700 font-black'}>
              {question.correctAnswer}
            </strong>
          </span>
        )}

        {question.difficulty && (
          <span
            className={`px-2 py-0.5 rounded-md font-semibold border ${
              isDark
                ? 'text-[#a0a8b7] bg-[#252833] border-[#333846]'
                : 'text-slate-600 bg-slate-50 border-slate-200'
            }`}
          >
            {question.difficulty === 'Kolay' ? '🟢 Kolay' : question.difficulty === 'Zor' ? '🔴 Zor' : '🟡 Orta'}
          </span>
        )}

        {question.mebOutcomeCode && (
          <span
            className={`truncate max-w-[150px] font-mono text-[10px] ${
              isDark ? 'text-[#838c9e]' : 'text-slate-400'
            }`}
          >
            {question.mebOutcomeCode}
          </span>
        )}
      </div>
    </div>
  );
}
