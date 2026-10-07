'use client';

import React from 'react';
import { DocumentSettings, DocumentType, BookletType, QuestionItem } from '@/types/studio';
import CustomSelect from '@/components/CustomSelect';
import {
  FileText,
  GraduationCap,
  BookOpen,
  Award,
  Layers,
  Shuffle,
  Eye,
  EyeOff,
  Columns2,
  SquareCheck,
} from 'lucide-react';

interface DocumentSettingsBarProps {
  docType: DocumentType;
  onDocTypeChange: (type: DocumentType) => void;
  settings: DocumentSettings;
  onSettingsChange: (settings: DocumentSettings) => void;
  questions: QuestionItem[];
  onAutoBalancePoints?: () => void;
  onGenerateBookletB: () => void;
}

const ATELIER_OPTIONS: { type: DocumentType; label: string; icon: any; desc: string }[] = [
  { type: 'test', label: 'Yaprak Test', icon: FileText, desc: 'Çift sütun, optik cevap ve A/B kitapçığı' },
  { type: 'written', label: 'Yazılı Sınav', icon: GraduationCap, desc: 'MEB açık uçlu senaryolar & öğrenci künyesi' },
  { type: 'lecture', label: 'Konu Föyü', icon: BookOpen, desc: 'Formül, özet, çözümlü örnek ve sıra sizde blokları' },
  { type: 'exam', label: 'Deneme Sınavı', icon: Award, desc: 'LGS / TYT / AYT kapak ve optik formlu' },
  { type: 'question_bank', label: 'Soru Bankası', icon: Layers, desc: 'Fasikül ve yoğun çift sütun mizanpajı' },
];

export default function DocumentSettingsBar({
  docType,
  onDocTypeChange,
  settings,
  onSettingsChange,
  questions,
  onAutoBalancePoints,
  onGenerateBookletB,
}: DocumentSettingsBarProps) {
  const update = (partial: Partial<DocumentSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  return (
    <div className="border-b border-stone-200 bg-white shadow-2xs no-print">
      {/* 1. Atölye Seçici Sekmeleri (5 Atölye) */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-stone-200 px-6 py-2 bg-stone-50/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 mr-2 shrink-0">
          Atölye:
        </span>
        {ATELIER_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isActive = docType === item.type;
          return (
            <button
              key={item.type}
              onClick={() => onDocTypeChange(item.type)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
              title={item.desc}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Belge Hızlı Ayarlar & Durum Barı */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-xs">
        {/* Left: Metadata Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={settings.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Belge Başlığı"
            className="rounded-lg border border-stone-300 px-2.5 py-1 font-bold text-stone-900 focus:border-blue-900 focus:outline-hidden text-xs w-56 sm:w-64"
          />

          <input
            type="text"
            value={settings.termInfo}
            onChange={(e) => update({ termInfo: e.target.value })}
            placeholder="Dönem / Sınav Bilgisi"
            className="rounded-lg border border-stone-300 px-2.5 py-1 text-stone-700 focus:border-blue-900 focus:outline-hidden text-xs w-44"
          />

          <CustomSelect
            value={settings.gradeLevel || '8. Sınıf (LGS)'}
            onChange={(val) => update({ gradeLevel: val })}
            options={[
              { value: '5. Sınıf', label: '5. Sınıf' },
              { value: '6. Sınıf', label: '6. Sınıf' },
              { value: '7. Sınıf', label: '7. Sınıf' },
              { value: '8. Sınıf (LGS)', label: '8. Sınıf (LGS)', badge: 'LGS' },
              { value: '9. Sınıf', label: '9. Sınıf' },
              { value: '10. Sınıf', label: '10. Sınıf' },
              { value: '11. Sınıf', label: '11. Sınıf' },
              { value: '12. Sınıf', label: '12. Sınıf' },
              { value: 'TYT / AYT (YKS)', label: 'TYT / AYT (YKS)', badge: 'YKS' },
            ]}
            className="w-40"
            size="sm"
          />
        </div>

        {/* Right: Quick Document Options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* A / B Kitapçığı Seçici */}
          <div className="flex items-center rounded-lg border border-stone-300 bg-stone-100 p-0.5">
            <button
              type="button"
              onClick={() => update({ bookletType: 'A' })}
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-colors ${
                settings.bookletType === 'A'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              A Kitapçığı
            </button>
            <button
              type="button"
              onClick={() => {
                update({ bookletType: 'B' });
                onGenerateBookletB();
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold transition-colors ${
                settings.bookletType === 'B'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="B Kitapçığı: Soruları ve şıkları otomatik karıştırır, cevap anahtarını yeniden hesaplar"
            >
              <Shuffle className="h-3 w-3" />
              B Kitapçığı
            </button>
          </div>

          {/* Öğretmen / Öğrenci Sürümü */}
          <button
            type="button"
            onClick={() => update({ isTeacherVersion: !settings.isTeacherVersion })}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
              settings.isTeacherVersion
                ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
            }`}
            title="Öğretmen sürümü doğru cevapları ve çözümleri kâğıt üzerinde gösterir"
          >
            {settings.isTeacherVersion ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {settings.isTeacherVersion ? 'Öğretmen Sürümü (Çözümlü)' : 'Öğrenci Sürümü (Sınav)'}
          </button>

          {/* Optik Form Aç/Kapa */}
          <button
            type="button"
            onClick={() => update({ showOpticForm: !settings.showOpticForm })}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
              settings.showOpticForm
                ? 'border-blue-900 bg-blue-50 text-blue-900'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <SquareCheck className="h-3.5 w-3.5" />
            Optik Form {settings.showOpticForm ? 'Açık' : 'Kapalı'}
          </button>

          {/* Sütun Düzeni: 1 veya 2 Sütun */}
          <button
            type="button"
            onClick={() => update({ columnCount: settings.columnCount === 2 ? 1 : 2 })}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100"
            title="Sütun mizanpajını değiştir"
          >
            <Columns2 className="h-3.5 w-3.5" />
            {settings.columnCount === 2 ? '2 Sütunlu (Yayınevi)' : 'Tek Sütun'}
          </button>
        </div>
      </div>
    </div>
  );
}
