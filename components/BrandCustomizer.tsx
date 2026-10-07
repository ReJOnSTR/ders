'use client';

import React from 'react';
import { BrandSettings } from '@/types/studio';
import { Palette, Type, Stamp, Sparkles, Building2, User, Phone, Check, Upload, Image as ImageIcon, Award } from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';

interface BrandCustomizerProps {
  settings: BrandSettings;
  onChange: (updated: BrandSettings) => void;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Klasik Lacivert', hex: '#1e3a8a', class: 'bg-blue-900' },
  { name: 'Zümrüt Yeşili', hex: '#065f46', class: 'bg-emerald-900' },
  { name: 'Bordo / Şarap', hex: '#881337', class: 'bg-rose-900' },
  { name: 'Gece Mavisi / Antrasit', hex: '#0f172a', class: 'bg-slate-900' },
  { name: 'Antik Amber / Turuncu', hex: '#c2410c', class: 'bg-amber-800' },
  { name: 'Kraliyet Moru', hex: '#581c87', class: 'bg-purple-900' },
];

export default function BrandCustomizer({ settings, onChange, onClose }: BrandCustomizerProps) {
  const update = (partial: Partial<BrandSettings>) => {
    onChange({ ...settings, ...partial });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          update({
            logoType: 'custom',
            customLogoUrl: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs no-print">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-white font-bold text-base shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Marka Kimliği & Yayınevi Tasarımı</h3>
              <p className="text-xs text-stone-500">Logo, kurumsal renk, başlık şablonu ve alt bilgi ayarları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* 1. Kurum & Eğitmen Bilgileri */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <Building2 className="h-4 w-4 text-blue-900" />
              Kurum ve İletişim Bilgileri
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Kurum / Okul / Yayın Adı <span className="text-stone-400 font-normal">(İsteğe Bağlı)</span>
                </label>
                <input
                  type="text"
                  value={settings.instituteName}
                  onChange={(e) => update({ instituteName: e.target.value })}
                  placeholder="İsteğe bağlı (boş bırakılabilir)"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-blue-900 focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Öğretmen / Zümre Adı</label>
                <input
                  type="text"
                  value={settings.teacherName}
                  onChange={(e) => update({ teacherName: e.target.value })}
                  placeholder="örn: Selim Kara — Matematik Öğretmeni"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-blue-900 focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Zümre / Alt Başlık</label>
                <input
                  type="text"
                  value={settings.branch}
                  onChange={(e) => update({ branch: e.target.value })}
                  placeholder="örn: Matematik Zümresi & Ölçme Değerlendirme"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-blue-900 focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Yayın / Test Serisi Bilgisi</label>
                <input
                  type="text"
                  value={settings.testBandTitle || ''}
                  onChange={(e) => update({ testBandTitle: e.target.value })}
                  placeholder="örn: Kazanım Odaklı Soru Bankası"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-blue-900 focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>
          </div>

          {/* 2. Logo Yükleme & Yönetim */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <ImageIcon className="h-4 w-4 text-blue-900" />
              Kurumsal Logo
            </h4>

            {settings.customLogoUrl ? (
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.customLogoUrl}
                  alt="Kurumsal Logo"
                  className="h-12 w-12 object-contain rounded-lg border border-stone-300 bg-white p-1"
                />
                <div className="text-xs text-stone-600 flex-1">
                  <div className="font-bold text-stone-900">Kurumsal Logonuz Aktif</div>
                  <div className="text-[11px] text-stone-500">Tüm 12 başlık modeline ve filigrana otomatik ölçeklenir.</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer">
                    Değiştir
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => update({ logoType: undefined, customLogoUrl: undefined })}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-stone-300 hover:border-blue-900 cursor-pointer text-center transition-all bg-stone-50/60 hover:bg-blue-50/20"
              >
                <Upload className="h-6 w-6 mb-1 text-stone-500" />
                <span className="text-xs font-bold text-stone-900">Kurumsal Logo Yükleyin</span>
                <span className="text-[11px] text-stone-500 mt-0.5">PNG, SVG veya JPG (Şeffaf zeminli önerilir)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 3. Kurumsal Renk Paleti */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <Palette className="h-4 w-4 text-blue-900" />
              Kurumsal Vurgu Rengi
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = settings.primaryColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => update({ primaryColor: preset.hex })}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-stone-800 bg-stone-100/80 ring-2 ring-stone-800/10'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full shrink-0 shadow-xs border border-black/10"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-xs font-medium text-stone-800 truncate">{preset.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 ml-auto text-stone-800 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Başlık Şablonu & Rozet Stili & Puan Tasarımı */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <Type className="h-4 w-4 text-blue-900" />
              Dizgi, Rozet & Puan Tasarımı
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Başlık Tasarım Şablonu</label>
                <CustomSelect
                  value={settings.headerStyle || 'modern-publisher'}
                  onChange={(val) => update({ headerStyle: val as any })}
                  options={[
                    { value: 'modern-publisher', label: 'Modern Yayınevi (Kutulu & Logolu)' },
                    { value: 'classic-meb', label: 'Klasik MEB / Resmî Okul Formatı' },
                    { value: 'minimalist', label: 'Minimalist Çizgili (Sade Yayınevi)' },
                    { value: 'academic', label: 'Akademik Prestij (Çift Bordürlü)' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Soru Numarası Rozet Stili</label>
                <CustomSelect
                  value={settings.questionBadgeStyle || 'badge'}
                  onChange={(val) => update({ questionBadgeStyle: val as any })}
                  options={[
                    { value: 'badge', label: 'Madalyon Rozet (Renkli Dolgulu)' },
                    { value: 'circle', label: 'Halka Çember (İnce Bordür)' },
                    { value: 'square', label: 'Klasik Kare Kutu' },
                    { value: 'simple', label: 'Sade Kalın Rakam (1., 2.)' },
                    { value: 'hexagon', label: 'Altıgen / Köşeli Rozet' },
                    { value: 'pill', label: 'Kapsül Soru Hapı (S 1)' },
                  ]}
                />
              </div>

              {/* Soru Puanı Tasarım Stili */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-600" />
                  <span>Soru Puanı Tasarım Stili</span>
                </label>
                <CustomSelect
                  value={settings.questionPointsStyle || 'capsule-pill'}
                  onChange={(val) => update({ questionPointsStyle: val as any })}
                  options={[
                    { value: 'capsule-pill', label: 'Renkli Kapsül Hap — (10p)' },
                    { value: 'soft-badge', label: 'Yumuşak Rozet Kart — [10p]' },
                    { value: 'circle-tag', label: 'Dairesel Madalyon — 10p' },
                    { value: 'bold-framed', label: 'Kalın Çerçeveli Kutu — 10 PUAN' },
                    { value: 'bracket-mono', label: 'Köşeli Ayraç (Daktilo) — [10p]' },
                    { value: 'minimal-parenthesis', label: 'Sade Parantez (Klasik) — (10p)' },
                    { value: 'banner-tag', label: 'Renkli Dolgulu Şerit — 10p' },
                    { value: 'ribbon-corner', label: 'Yıldızlı Çift Renk — ★ 10p' },
                    { value: 'hexagon-tag', label: 'Altıgen Rozet — ⬡ 10p' },
                    { value: 'stamp-badge', label: 'Resmî Sınav Kaşesi — PUAN: 10' },
                  ]}
                />
              </div>

              {/* Soru Puanı Metin Formatı */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Puan Yazım Formatı</label>
                <CustomSelect
                  value={settings.pointsTextFormat || 'short-p'}
                  onChange={(val) => update({ pointsTextFormat: val as any })}
                  options={[
                    { value: 'short-p', label: 'Kısa İfade — 10p' },
                    { value: 'full-puan', label: 'Tam İfade — 10 Puan' },
                    { value: 'num-only', label: 'Sadece Rakam — 10' },
                  ]}
                />
              </div>
            </div>

            {/* Puan ve Rozet Canlı Küçük Önizlemesi */}
            <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/80 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Canlı Numara & Puan Önizlemesi:
              </span>
              <div className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-stone-200/70 shadow-2xs">
                {/* Numara */}
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-mono font-black text-white shadow-2xs"
                  style={{ backgroundColor: settings.primaryColor || '#1e3a8a' }}
                >
                  1
                </span>
                {/* Puan Rozeti Önizlemesi */}
                {(() => {
                  const format = settings.pointsTextFormat || 'short-p';
                  const pointText = format === 'full-puan' ? '10 Puan' : format === 'num-only' ? '10' : '10p';
                  const style = settings.questionPointsStyle || 'capsule-pill';
                  const bg = settings.primaryColor || '#1e3a8a';

                  switch (style) {
                    case 'capsule-pill':
                      return (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border"
                          style={{ backgroundColor: `${bg}14`, color: bg, borderColor: `${bg}40` }}
                        >
                          ({pointText})
                        </span>
                      );
                    case 'soft-badge':
                      return (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono border border-slate-200 bg-slate-50 text-slate-700">
                          [{pointText}]
                        </span>
                      );
                    case 'circle-tag':
                      return (
                        <span
                          className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[8.5px] font-black font-mono border-2"
                          style={{ borderColor: bg, color: bg, backgroundColor: 'white' }}
                        >
                          {pointText}
                        </span>
                      );
                    case 'bold-framed':
                      return (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[9px] font-black font-mono uppercase border-2 border-stone-900 bg-stone-100 text-stone-900 shadow-2xs">
                          {pointText}
                        </span>
                      );
                    case 'bracket-mono':
                      return (
                        <span className="text-[10px] font-bold font-mono text-stone-700">
                          [{pointText}]
                        </span>
                      );
                    case 'banner-tag':
                      return (
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[8.5px] font-bold font-mono text-white shadow-2xs"
                          style={{ backgroundColor: bg }}
                        >
                          {pointText}
                        </span>
                      );
                    case 'ribbon-corner':
                      return (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs text-[9px] font-black font-mono border"
                          style={{ borderColor: `${bg}60`, backgroundColor: `${bg}10`, color: bg }}
                        >
                          <span className="text-[8px] opacity-70">★</span>
                          {pointText}
                        </span>
                      );
                    case 'hexagon-tag':
                      return (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs text-[8.5px] font-black font-mono border"
                          style={{ borderColor: `${bg}45`, backgroundColor: `${bg}15`, color: bg }}
                        >
                          <span className="text-[7.5px]">⬡</span>
                          {pointText}
                        </span>
                      );
                    case 'stamp-badge':
                      return (
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[8px] font-black font-mono border-2"
                          style={{ borderColor: bg, color: bg, backgroundColor: `${bg}08` }}
                        >
                          PUAN: {pointText}
                        </span>
                      );
                    case 'minimal-parenthesis':
                    default:
                      return (
                        <span className="text-[10px] font-bold text-stone-500 font-mono">
                          ({pointText})
                        </span>
                      );
                  }
                })()}
                <span className="text-xs text-stone-600 font-medium truncate">
                  Örnek Soru Metni ve Çözüm Adımları...
                </span>
              </div>

              {/* Görünürlük Kutusu */}
              <label className="flex items-center gap-2 pt-1 text-xs text-stone-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showQuestionPoints !== false}
                  onChange={(e) => update({ showQuestionPoints: e.target.checked })}
                  className="rounded border-stone-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                />
                <span>Sorularda Puan Bilgisini Göster (Yazılı &amp; Test)</span>
              </label>
            </div>
          </div>

          {/* 5. Filigran & Baskı Modu */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <Stamp className="h-4 w-4 text-blue-900" />
              Filigran ve Çıktı Modu
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50">
                <input
                  type="checkbox"
                  id="showWatermark"
                  checked={settings.showWatermark}
                  onChange={(e) => update({ showWatermark: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-blue-900 focus:ring-blue-900"
                />
                <div className="text-xs">
                  <label htmlFor="showWatermark" className="font-semibold text-stone-800 cursor-pointer">
                    Sayfa Arkası Filigran (Watermark)
                  </label>
                  <p className="text-stone-500 mt-0.5">Kurum adını veya logosunu silik şekilde sayfaya yerleştirir.</p>
                  {settings.showWatermark && (
                    <input
                      type="text"
                      value={settings.watermarkText}
                      onChange={(e) => update({ watermarkText: e.target.value })}
                      placeholder="Filigran metni"
                      className="mt-2 w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-900"
                    />
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs">
                <span className="font-semibold text-stone-800 block mb-1">Baskı / Fotokopi Modu</span>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => update({ printColorMode: 'color' })}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                      settings.printColorMode === 'color'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Renkli Yayınevi
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ printColorMode: 'monochrome' })}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                      settings.printColorMode === 'monochrome'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Siyah-Beyaz Fotokopi
                  </button>
                </div>
                <p className="text-stone-500 mt-1.5 text-[11px]">
                  {settings.printColorMode === 'monochrome'
                    ? 'Tüm renkli kutular ve başlıklar gri tonlama fotokopi dostu tona çevrilir.'
                    : 'Yayınevi kalitesinde canlı kurumsal renkler uygulanır.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3.5">
          <span className="text-xs text-stone-500">Değişiklikler anında canlı önizlemeye yansır.</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
