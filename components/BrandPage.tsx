'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Home,
  Check,
  Upload,
  Trash2,
  CheckCircle2,
  Printer,
  Type,
  Palette,
  Building2,
  Rows,
  Sparkles,
  Square,
  CircleDot,
  Bookmark,
  PenTool,
  BookOpen,
  GraduationCap,
  Flame,
  Atom,
  Award,
  Sliders,
  SlidersHorizontal,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FilePlus2,
  Copy,
  Plus,
  Minus,
  Ruler,
  X,
  Layers,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  Key,
  UserCheck,
  Contact,
} from 'lucide-react';
import { BrandSettings, DocumentSettings, DocumentType, QuestionItem, FormatBlueprint } from '@/types/studio';
import { INITIAL_FORMAT_BLUEPRINTS } from '@/data/initialFormatBlueprints';

export interface BrandPageProps {
  settings: BrandSettings;
  onChange: (updated: BrandSettings) => void;
  docSettings: DocumentSettings;
  onDocSettingsChange: (updated: DocumentSettings) => void;
  docType: DocumentType;
  onDocTypeChange: (type: DocumentType) => void;
  questions?: QuestionItem[];
  onOpenEditor: () => void;
  onOpenHome: () => void;
  theme?: 'light' | 'dark';
  blueprints?: FormatBlueprint[];
  onSaveBlueprint?: (updatedBlueprint: FormatBlueprint) => void;
  onCreateDocumentFromBlueprint?: (blueprint: FormatBlueprint) => void;
  onResetBlueprintToDefault?: (blueprintId: string) => void;
  onAddNewBlueprint?: (newBlueprint: FormatBlueprint) => void;
  onDeleteBlueprint?: (blueprintId: string) => void;
  initialSelectedFormatId?: string;
}

// 12 Seçkin Türk Yayınevi ve Resmî Sınav Başlık Mizanpajı
export const PUBLISHER_HEADER_ARCHITECTURES = [
  {
    id: 'gradient-banner' as const,
    title: 'Model 1: Yeni Nesil Canlı Gradyan Üst Bant',
    badge: 'Bilgi Sarmal / Orijinal Ekolü',
    desc: 'Sayfanın en üstünde tam genişlikte zengin renk geçişli şerit, beyaz konu başlığı, sınıf rozeti ve ışık hareleri.',
    previewBg: 'linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)',
    recommendedDefaults: {
      primaryColor: '#0284c7',
      secondaryColor: '#1e3a8a',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'dots-answer' as const,
      questionBadgeStyle: 'square' as const,
      optionStyle: 'circle' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'trapezoid-modern' as const,
    title: 'Model 2: Açılı / Eğimli Geometrik Kesim Bant',
    badge: 'Hız ve Renk / Limit Ekolü',
    desc: 'Sol tarafta 15° açılı kesik renkli TEST 01 bloğu, sağa uzanan kontrast çizgi, nokta desenleri ve seviye göstergesi.',
    previewBg: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    recommendedDefaults: {
      primaryColor: '#ea580c',
      secondaryColor: '#dc2626',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'dots-answer' as const,
      questionBadgeStyle: 'hexagon' as const,
      optionStyle: 'circle-fill' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'fasikul-band' as const,
    title: 'Model 3: İki Renkli Bölüm & Fasikül Bandı',
    badge: 'Çap / Palme Fasikül Ekolü',
    desc: 'Sol taraf koyu zeminli bölüm/ders künyesi, sağ taraf açık pastel renkli konu ve kazanım bandı.',
    previewBg: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
    recommendedDefaults: {
      primaryColor: '#0f766e',
      secondaryColor: '#14b8a6',
      pageFrameStyle: 'corner-accents' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'minimal-line' as const,
      questionBadgeStyle: 'pill' as const,
      optionStyle: 'soft-card' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'framed-rosette' as const,
    title: 'Model 4: Çerçeveli, Dişli Madalyon & Yönerge Kılavuzlu',
    badge: 'Kurumsal Deneme / Bursluluk Ekolü',
    desc: 'Sayfa çevresinde renkli çerçeve, dişli madalyon "A KİTAPÇIĞI", ortada sınav başlığı ve oval sınav yönerge bandı.',
    previewBg: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
    recommendedDefaults: {
      primaryColor: '#ea580c',
      secondaryColor: '#9a3412',
      pageFrameStyle: 'full-border' as const,
      spineDividerStyle: 'badge-text' as const,
      spineText: '◄ Okula Kabul ve Bursluluk Sınavı ►',
      footerStyle: 'circle-badge' as const,
      rosetteStyle: 'scalloped' as const,
      questionBadgeStyle: 'square' as const,
      optionStyle: 'circle' as const,
      showInstructionBox: false,
      instructionBoxText: '',
    },
  },
  {
    id: 'wave-organic' as const,
    title: 'Model 5: Dalgalı & Organik Sıvı Kesim Bandı',
    badge: 'Okyanus / Nitelik Ekolü',
    desc: 'Üstte organik asimetrik eğri kesimli renkli bant, yüzen ders rozeti ve modern kapsül test bilgisi.',
    previewBg: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
    recommendedDefaults: {
      primaryColor: '#0284c7',
      secondaryColor: '#059669',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'dots-answer' as const,
      questionBadgeStyle: 'circle' as const,
      optionStyle: 'circle' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'brush-accent' as const,
    title: 'Model 6: Pastel Fırça / Kapsül Rozetli Föy',
    badge: 'Modern LGS / TYT Çalışma Föyü',
    desc: 'Sol tarafta yumuşak pastel fırça dokulu ders rozeti, ortada büyük ve net konu başlığı, sağda yayınevi künyesi.',
    previewBg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    recommendedDefaults: {
      primaryColor: '#0284c7',
      secondaryColor: '#38bdf8',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'minimal-line' as const,
      questionBadgeStyle: 'circle' as const,
      optionStyle: 'circle' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'double-line-capsule' as const,
    title: 'Model 7: Çift Çizgili Kapsül Rozet & Cetvel Ayracı',
    badge: 'Apotemi / Aydın Ekolü',
    desc: 'İki paralel ince çizgi arasında renkli hap konu rozeti ve zarif tipografik dizgi.',
    previewBg: 'linear-gradient(135deg, #581c87 0%, #3b82f6 100%)',
    recommendedDefaults: {
      primaryColor: '#581c87',
      secondaryColor: '#3b82f6',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'double' as const,
      footerStyle: 'barcode-isbn' as const,
      questionBadgeStyle: 'circle' as const,
      optionStyle: 'circle' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'retro-institution' as const,
    title: 'Model 8: Kolej & Kurumsal Şerit Çift Damgalı',
    badge: 'Kültür / Uğur VIP Ekolü',
    desc: 'Sol köşede kare kitapçık damgası, ortada kurum ve sınav adı, sağ köşede süre kapsülü ve çift alt bordür.',
    previewBg: 'linear-gradient(135deg, #1e3a8a 0%, #047857 100%)',
    recommendedDefaults: {
      primaryColor: '#1e3a8a',
      secondaryColor: '#047857',
      pageFrameStyle: 'top-bottom-bars' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'minimal-line' as const,
      questionBadgeStyle: 'square' as const,
      optionStyle: 'circle' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'slim-ruler' as const,
    title: 'Model 9: Zümrüt Minimalist İnce Cetvel Bandı',
    badge: 'Karekök / Çözüm Ekolü',
    desc: 'Hassas milimetrik cetvel deseni, yüksek bilgi yoğunluğu ve kompakt zarafet.',
    previewBg: 'linear-gradient(135deg, #0f766e 0%, #1e293b 100%)',
    recommendedDefaults: {
      primaryColor: '#0f766e',
      secondaryColor: '#1e293b',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'minimal-line' as const,
      questionBadgeStyle: 'simple' as const,
      optionStyle: 'circle' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'toder-ozdebir' as const,
    title: 'Model 10: Türkiye Geneli Deneme & Çift Kutulu',
    badge: 'TÖDER / Özdebir Ekolü',
    desc: 'Ağır kontrastlı çift kutulu resmî deneme başlığı, sol blok deneme kodu, sağ kutu kitapçık damgası.',
    previewBg: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
    recommendedDefaults: {
      primaryColor: '#0f172a',
      secondaryColor: '#334155',
      pageFrameStyle: 'full-border' as const,
      spineDividerStyle: 'badge-text' as const,
      spineText: '◄ TÜRKİYE GENELİ DENEME SINAVI ►',
      footerStyle: 'osym-turn-page' as const,
      questionBadgeStyle: 'square' as const,
      optionStyle: 'bold-letter' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'oval-capsule' as const,
    title: 'Model 11: Oval Kapsül Rozetli & Kavisli Ayraç',
    badge: 'Oval & Yumuşak Kavis Ekolü',
    desc: 'Tamamen köşesiz, oval hap/kapsül rozetli başlık alanı, yumuşak kavisli kenarlık ve dalgalı alt çizgi ayracı.',
    previewBg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    recommendedDefaults: {
      primaryColor: '#0284c7',
      secondaryColor: '#06b6d4',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'minimal-line' as const,
      questionBadgeStyle: 'pill' as const,
      optionStyle: 'circle-fill' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'curved-arch' as const,
    title: 'Model 12: Kavisli Üst Kemer & Yay Çizgili Başlık',
    badge: 'Kavisli Kubbe & Yay Ekolü',
    desc: 'Üstten zarif oval kemer kavisli renk bloğu, kavisli yay alt ayracı ve dairesel kitapçık madalyonu.',
    previewBg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    recommendedDefaults: {
      primaryColor: '#4f46e5',
      secondaryColor: '#7c3aed',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'circle-badge' as const,
      questionBadgeStyle: 'circle' as const,
      optionStyle: 'circle' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'wavy-ribbon' as const,
    title: 'Model 13: Akıcı Dalgalı Bant & Eğri Çizgi',
    badge: 'Akıcı Dalga & Yumuşak Çizgi',
    desc: 'S-kavisli akıcı çift dalga deseni, köşeleri yumuşatılmış oval bilgi pencereleri ve dalga ayracı.',
    previewBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    recommendedDefaults: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'solid' as const,
      footerStyle: 'minimal-line' as const,
      questionBadgeStyle: 'pill' as const,
      optionStyle: 'soft-card' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'pill-modern' as const,
    title: 'Model 14: Çift Oval Kapsül & Dairesel Madalyon',
    badge: 'Modern Kapsül & Dairesel Ayraç',
    desc: 'Sağ ve sol uçları tam oval (pill) çift kapsül blok, ortada dairesel kitapçık ve kavisli noktalı bağlayıcı çizgi.',
    previewBg: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
    recommendedDefaults: {
      primaryColor: '#be185d',
      secondaryColor: '#ec4899',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'badge-text' as const,
      spineText: '◄ AKADEMİK GELİŞİM TESTİ ►',
      footerStyle: 'barcode-isbn' as const,
      questionBadgeStyle: 'circle' as const,
      optionStyle: 'circle-fill' as const,
      showInstructionBox: false,
    },
  },
  {
    id: 'minimalist' as const,
    title: 'Model 15: ÖSYM Resmî TYT / AYT Kitapçık Formatı',
    badge: 'ÖSYM Resmî Sınav Ekolü',
    desc: 'Çift paralel siyah ofset çizgisi, "T.C. ÖSYM", kare çerçeveli kitapçık harfi, resmi sınav başlığı ve net sayfa düzeni.',
    previewBg: '#0f172a',
    recommendedDefaults: {
      primaryColor: '#0f172a',
      secondaryColor: '#334155',
      pageFrameStyle: 'none' as const,
      spineDividerStyle: 'dashed' as const,
      footerStyle: 'osym-turn-page' as const,
      questionBadgeStyle: 'simple' as const,
      optionStyle: 'bold-letter' as const,
      showInstructionBox: false,
    },
  },
];

// Not & Formül Bloğu Tasarım Modelleri
export const LECTURE_BOX_STYLES = [
  {
    id: 'highlight-bar' as const,
    label: 'Vurgulu Sol Şerit (Klasik)',
    desc: 'Sol kenarda kalın renkli şerit, hafif pastel zemin, klasik soru bankası & föy tarzı.',
  },
  {
    id: 'formula-frame' as const,
    label: 'Formül Çerçevesi (Matematik)',
    desc: 'Teknik çift çizgi / kesikli çerçeve, ortalanmış f(x) formül rozeti.',
  },
  {
    id: 'tip-badge' as const,
    label: 'Oval Kapsül Başlıklı (Fasikül)',
    desc: 'Oval hap şeklinde yuvarlak başlık rozeti, yumuşak köşeli modern not kartı.',
  },
  {
    id: 'curved-accent' as const,
    label: 'Kavisli Üst Şerit (Renkli Föy)',
    desc: 'Üstte renkli gradyan başlık şeridi, altta ferah beyaz içerik alanı.',
  },
  {
    id: 'clean-card' as const,
    label: 'Minimalist Temiz Kart (Sade)',
    desc: 'Dikkat dağıtmayan zarif ince çerçeve, başlık altı ince çizgi.',
  },
];

// Türkiye Yayınevleri Koleksiyonu (8 Özgün Yayın Rengi)
export const PUBLISHER_COLOR_PALETTES = [
  {
    id: 'bilgi-sarmal',
    name: 'Bilgi Sarmal & Çap (Kobalt Mavi - Lacivert)',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)',
    primary: '#0284c7',
    secondary: '#1e3a8a',
    desc: 'Matematik ve fen soru bankalarının ikonik rengi',
  },
  {
    id: '3d-orijinal',
    name: '3D & Orijinal (Ateş Turuncusu - Kırmızı)',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
    primary: '#ea580c',
    secondary: '#dc2626',
    desc: 'Yeni nesil dinamik test ve fasiküllerin vazgeçilmezi',
  },
  {
    id: 'palme-cap',
    name: 'Palme & Aydın (Zümrüt Yeşil - Turkuaz)',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
    primary: '#0f766e',
    secondary: '#059669',
    desc: 'Biyoloji, geometri ve fen bilimleri yayınları',
  },
  {
    id: 'limit-vip',
    name: 'Limit & Metin (Mürdüm - Asil Mor)',
    gradient: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)',
    primary: '#581c87',
    secondary: '#9333ea',
    desc: 'Türkçe, edebiyat ve VIP deneme sınavları',
  },
  {
    id: 'hiz-renk',
    name: 'Hız ve Renk (Güneş Sarısı - Koyu Grafit)',
    gradient: 'linear-gradient(135deg, #d97706 0%, #1e293b 100%)',
    primary: '#d97706',
    secondary: '#1e293b',
    desc: 'Zamanla yarışan basamaklı test serisi',
  },
  {
    id: 'meb-bordo',
    name: 'MEB Bakanlık (Resmî Bordo - Vişne)',
    gradient: 'linear-gradient(135deg, #991b1b 0%, #881337 100%)',
    primary: '#991b1b',
    secondary: '#881337',
    desc: 'Resmî MEB ortak yazılı ve kazanım kavrama föyleri',
  },
  {
    id: 'osym-siyah',
    name: 'ÖSYM Mat Siyah (Ofset Füme - Antrasit)',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    primary: '#0f172a',
    secondary: '#334155',
    desc: 'ÖSYM TYT / AYT ve MSÜ gerçek sınav kitapçığı ofseti',
  },
  {
    id: 'paraf-lacivert',
    name: 'Paraf & Okyanus (Kraliyet Laciverti - Altın)',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #b45309 100%)',
    primary: '#1e3a8a',
    secondary: '#b45309',
    desc: 'Akademik soru bankası ve kurumsal denemeler',
  },
];

export const TOOL_CATEGORIES = [
  { id: 'headers' as const, label: 'Başlıklar', sub: '12 Model', icon: Type },
  { id: 'badges_options' as const, label: 'Soru & Şık', sub: 'Rozet & Şık', icon: CircleDot },
  { id: 'frame_spine' as const, label: 'Çerçeve & Dikey', sub: 'Bordür & Ayrıcı', icon: Square },
  { id: 'instruction_rosette' as const, label: 'Not & Form Bloğu', sub: 'Ders Notu & Sınav Formu', icon: Bookmark },
  { id: 'colors' as const, label: 'Renk & Kâğıt', sub: 'Palet & Doku', icon: Palette },
  { id: 'footer' as const, label: 'Alt Bilgi & Cevap', sub: 'Cevap Anahtarı & No', icon: Rows },
  { id: 'answers_boxes' as const, label: 'Cevap Satırları', sub: 'Çizgili & Kareli', icon: PenTool },
  { id: 'identity' as const, label: 'Logo & Künye', sub: 'Öğrenci Künyesi & Logo', icon: Building2 },
  { id: 'format_layout' as const, label: 'Ölçü & Düzen', sub: 'Punto & Aralık', icon: Sliders },
];

export default function BrandPage({
  settings: brand,
  onChange: onBrandChange,
  docSettings,
  onDocSettingsChange,
  docType,
  onDocTypeChange,
  questions = [],
  onOpenEditor,
  onOpenHome,
  theme = 'light',
  blueprints = INITIAL_FORMAT_BLUEPRINTS,
  onSaveBlueprint,
  onCreateDocumentFromBlueprint,
  onResetBlueprintToDefault,
  onAddNewBlueprint,
  onDeleteBlueprint,
  initialSelectedFormatId,
}: BrandPageProps) {
  // Active Format Blueprint Selection
  const [selectedFormatId, setSelectedFormatId] = useState<string>(() => {
    if (initialSelectedFormatId) return initialSelectedFormatId;
    const match = blueprints.find((b) => b.docType === docType);
    return match ? match.id : blueprints[0]?.id || 'written';
  });

  const [formatSaveToast, setFormatSaveToast] = useState<string | null>(null);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const formatDropdownRef = useRef<HTMLDivElement>(null);
  const [isNewFormatModalOpen, setIsNewFormatModalOpen] = useState(false);
  const [newFormatTitle, setNewFormatTitle] = useState('');
  const [newFormatDocType, setNewFormatDocType] = useState<DocumentType>('written');
  const [newFormatDescription, setNewFormatDescription] = useState('');

  // Close format dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target as Node)) {
        setIsFormatDropdownOpen(false);
      }
    }
    if (isFormatDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFormatDropdownOpen]);

  // Active blueprint object
  const activeBlueprint =
    blueprints.find((b) => b.id === selectedFormatId) ||
    blueprints[0] ||
    INITIAL_FORMAT_BLUEPRINTS[0];

  // Navigation tabs for publisher layout tools
  const [activeTab, setActiveTab] = useState<
    'headers' | 'badges_options' | 'frame_spine' | 'instruction_rosette' | 'colors' | 'footer' | 'answers_boxes' | 'identity' | 'format_layout'
  >('headers');
  const [previewPrintMode] = useState<'color' | 'monochrome'>('color');
  const [isToolsSidebarOpen, setIsToolsSidebarOpen] = useState<boolean>(true);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  useEffect(() => {
    const updateSize = () => setIsDesktop(window.innerWidth >= 1024);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  const [openEndedLines, setOpenEndedLines] = useState<number>(
    () => docSettings.openEndedLines || brand.openEndedLines || 4
  );
  const [defaultQuestionPoints, setDefaultQuestionPoints] = useState<number>(
    () => docSettings.defaultQuestionPoints || brand.defaultQuestionPoints || 10
  );

  const handleUpdateOpenEndedLines = (newLines: number) => {
    const val = Math.max(1, Math.min(16, newLines));
    setOpenEndedLines(val);
    onDocSettingsChange({ ...docSettings, openEndedLines: val });
    updateBrand({ openEndedLines: val });
  };

  const handleUpdateDefaultQuestionPoints = (newPts: number) => {
    const val = Math.max(1, Math.min(100, newPts));
    setDefaultQuestionPoints(val);
    onDocSettingsChange({ ...docSettings, defaultQuestionPoints: val });
    updateBrand({ defaultQuestionPoints: val });
  };
  const [saveToast, setSaveToast] = useState(false);

  // Physical paper dimension standards to prevent ANY aspect ratio distortion
  const paperFormat = docSettings.paperFormat || 'A4';
  const orientation = docSettings.orientation || 'portrait';

  // Standard paper dimensions in pixels (at 96 DPI: A4 is 794 x 1123, matching 210mm x 297mm exactly)
  const standardPageSize = useMemo(() => {
    if (paperFormat === 'A3') {
      return orientation === 'landscape' ? { w: 1587, h: 1123 } : { w: 1123, h: 1587 };
    }
    if (paperFormat === 'B5') {
      return { w: 665, h: 945 };
    }
    if (paperFormat === 'Letter') {
      return orientation === 'landscape' ? { w: 1056, h: 816 } : { w: 816, h: 1056 };
    }
    // Default A4
    return orientation === 'landscape' ? { w: 1123, h: 794 } : { w: 794, h: 1123 };
  }, [paperFormat, orientation]);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 700 });

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Strict, fixed physical aspect ratio scale that fits container perfectly without page or container scrolling
  const previewScale = useMemo(() => {
    const padX = 28; // safe side padding
    const padY = 28; // safe vertical padding
    const availW = Math.max(120, containerDimensions.width - padX);
    const availH = Math.max(120, containerDimensions.height - padY);
    return Math.min(availW / standardPageSize.w, availH / standardPageSize.h);
  }, [containerDimensions, standardPageSize]);

  const scaledPageSize = useMemo(() => ({
    w: Math.round(standardPageSize.w * previewScale),
    h: Math.round(standardPageSize.h * previewScale),
  }), [standardPageSize, previewScale]);

  const paperAspectRatio = useMemo(() => {
    if (paperFormat === 'A3') return orientation === 'landscape' ? '420 / 297' : '297 / 420';
    if (paperFormat === 'A4') return orientation === 'landscape' ? '297 / 210' : '210 / 297';
    if (paperFormat === 'B5') return '176 / 250';
    if (paperFormat === 'Letter') return orientation === 'landscape' ? '279.4 / 215.9' : '215.9 / 279.4';
    return '210 / 297';
  }, [paperFormat, orientation]);

  // Synchronized header text fallbacks that persist across all 12 models
  const previewTitle = docSettings.title || activeBlueprint?.sampleTitle || 'TÜRKÇE DERSİ 1. DÖNEM YAZILI SINAVI';
  const previewTestBand = brand.testBandTitle || docSettings.termInfo || activeBlueprint?.sampleCourse || 'KAZANIM KAVRAMA TESTİ';
  const previewCourse = docSettings.courseName || activeBlueprint?.sampleCourse || 'TÜRKÇE';
  const previewGrade = docSettings.gradeLevel || activeBlueprint?.sampleGrade || '8. SINIF';

  const isDark = theme === 'dark';

  // Filter valid questions excluding lecture blocks
  const realQuestions = useMemo(() => {
    return (questions || []).filter((q) => q.type !== 'lecture_block');
  }, [questions]);

  // Determine dynamic question count for optic form and answer key
  const effectiveQuestionCount = useMemo(() => {
    if (docSettings.opticFormQuestionCount && docSettings.opticFormQuestionCount > 0) {
      return docSettings.opticFormQuestionCount;
    }
    if (brand.opticFormQuestionCount && brand.opticFormQuestionCount > 0) {
      return brand.opticFormQuestionCount;
    }
    if (realQuestions.length > 0) {
      return realQuestions.length;
    }
    if (docSettings.questionsPerPage && docSettings.questionsPerPage > 0) {
      return docSettings.questionsPerPage;
    }
    return 10;
  }, [docSettings.opticFormQuestionCount, brand.opticFormQuestionCount, realQuestions.length, docSettings.questionsPerPage]);

  // Determine dynamic options count (4 or 5 options)
  const effectiveOptionCount = useMemo(() => {
    if (docSettings.opticFormOptionCount) return docSettings.opticFormOptionCount;
    if (brand.opticFormOptionCount) return brand.opticFormOptionCount;
    if (realQuestions.length > 0) {
      const has5 = realQuestions.some((q) => (q.options?.length || 0) >= 5 || q.correctAnswer === 'E');
      return has5 ? 5 : 4;
    }
    return 5;
  }, [docSettings.opticFormOptionCount, brand.opticFormOptionCount, realQuestions]);

  const activeOptionsList = useMemo(() => {
    return ['A', 'B', 'C', 'D', 'E'].slice(0, effectiveOptionCount);
  }, [effectiveOptionCount]);

  // Generate dynamic answer keys for answer key preview
  const effectiveAnswerKeys = useMemo(() => {
    const keys: Array<{ q: number; a: string }> = [];
    const defaultAnswers = ['A', 'C', 'B', 'D', 'E', 'A', 'B', 'D', 'C', 'A', 'D', 'B', 'C', 'E', 'A', 'B', 'C', 'D', 'E', 'A', 'B', 'C', 'D', 'E'];
    for (let i = 1; i <= effectiveQuestionCount; i++) {
      const matchedQ = realQuestions[i - 1];
      const ans = matchedQ?.correctAnswer || defaultAnswers[(i - 1) % defaultAnswers.length];
      keys.push({ q: i, a: ans });
    }
    return keys;
  }, [effectiveQuestionCount, realQuestions]);

  const updateBrand = (partial: Partial<BrandSettings>) => {
    onBrandChange({ ...brand, ...partial });
  };

  const handleSelectFormat = (formatId: string) => {
    setSelectedFormatId(formatId);
    const targetBp = blueprints.find((b) => b.id === formatId);
    if (targetBp) {
      onBrandChange({ ...targetBp.brand });
      onDocSettingsChange({
        ...docSettings,
        ...targetBp.settings,
        title: targetBp.sampleTitle || docSettings.title,
        courseName: targetBp.sampleCourse || docSettings.courseName,
        gradeLevel: targetBp.sampleGrade || docSettings.gradeLevel,
      });
      onDocTypeChange(targetBp.docType);
    }
  };

  const handleSaveActiveFormatBlueprint = () => {
    const targetBp = blueprints.find((b) => b.id === selectedFormatId) || activeBlueprint;
    const updatedBp: FormatBlueprint = {
      ...targetBp,
      brand: { ...brand },
      settings: {
        ...targetBp.settings,
        columnCount: docSettings.columnCount,
        paperFormat: docSettings.paperFormat,
        orientation: docSettings.orientation,
        answerKeyStyle: brand.answerKeyStyle || docSettings.answerKeyStyle,
        showOpticForm: docSettings.showOpticForm,
        showAnswerKey: docSettings.showAnswerKey,
        showOutcomes: docSettings.showOutcomes,
        durationMinutes: docSettings.durationMinutes,
      },
      updatedAt: new Date().toISOString(),
    };
    if (onSaveBlueprint) {
      onSaveBlueprint(updatedBp);
    }
    setFormatSaveToast(`"${targetBp.title}" Tasarımı Kaydedildi!`);
    setTimeout(() => setFormatSaveToast(null), 3500);
  };

  const handleCreateDocumentFromActiveFormat = () => {
    const targetBp = blueprints.find((b) => b.id === selectedFormatId) || activeBlueprint;
    const currentBp: FormatBlueprint = {
      ...targetBp,
      brand: { ...brand },
      settings: {
        ...targetBp.settings,
        columnCount: docSettings.columnCount,
        paperFormat: docSettings.paperFormat,
        orientation: docSettings.orientation,
        answerKeyStyle: brand.answerKeyStyle || docSettings.answerKeyStyle,
        showOpticForm: docSettings.showOpticForm,
        showAnswerKey: docSettings.showAnswerKey,
        showOutcomes: docSettings.showOutcomes,
        durationMinutes: docSettings.durationMinutes,
      },
    };
    if (onCreateDocumentFromBlueprint) {
      onCreateDocumentFromBlueprint(currentBp);
    } else {
      onOpenEditor();
    }
  };

  const handleResetActiveFormat = () => {
    if (onResetBlueprintToDefault) {
      onResetBlueprintToDefault(selectedFormatId);
    }
    const defaultBp = INITIAL_FORMAT_BLUEPRINTS.find((b) => b.id === selectedFormatId);
    if (defaultBp) {
      onBrandChange({ ...defaultBp.brand });
      onDocSettingsChange({ ...docSettings, ...defaultBp.settings });
      setFormatSaveToast(`"${defaultBp.title}" Varsayılan Tasarıma Sıfırlandı!`);
      setTimeout(() => setFormatSaveToast(null), 3000);
    }
  };

  const handleDuplicateActiveFormat = () => {
    const targetBp = blueprints.find((b) => b.id === selectedFormatId) || activeBlueprint;
    const newId = `custom-format-${Date.now()}`;
    const newBp: FormatBlueprint = {
      ...targetBp,
      id: newId,
      title: `${targetBp.title} (Özel Kopya)`,
      isCustom: true,
      brand: { ...brand },
      settings: { ...targetBp.settings, ...docSettings },
      updatedAt: new Date().toISOString(),
    };
    if (onAddNewBlueprint) {
      onAddNewBlueprint(newBp);
    }
    setSelectedFormatId(newId);
    setFormatSaveToast(`Yeni Format Şablonu Oluşturuldu!`);
    setTimeout(() => setFormatSaveToast(null), 3000);
  };

  const handleSelectHeaderArchitecture = (model: typeof PUBLISHER_HEADER_ARCHITECTURES[0]) => {
    updateBrand({
      headerStyle: model.id,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleApplyPalette = (palette: typeof PUBLISHER_COLOR_PALETTES[0]) => {
    updateBrand({
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateBrand({
            logoType: 'custom',
            customLogoUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndGoToEditor = () => {
    handleSaveActiveFormatBlueprint();
    setSaveToast(true);
    setTimeout(() => {
      onOpenEditor();
    }, 250);
  };

  // Preview effective color calculations
  const isMono = previewPrintMode === 'monochrome' || brand.printColorMode === 'monochrome';
  const effectivePrimary = isMono ? '#1e293b' : brand.primaryColor || '#0284c7';
  const effectiveSecondary = isMono ? '#475569' : brand.secondaryColor || '#1e3a8a';

  const headerGradientStyle = `linear-gradient(135deg, ${effectivePrimary} 0%, ${effectiveSecondary} 100%)`;
  const previewDurationText = docSettings.durationMinutes && brand.showDuration !== false
    ? `${docSettings.durationMinutes} Dk`
    : '';

  // Paper Tone Background
  const paperToneBg =
    brand.paperTone === 'cream'
      ? '#fbf8ed' // Enzo / Holmen Krem Roman & Test Kâğıdı
      : brand.paperTone === 'cool'
      ? '#f3f4f6' // Açık Gri Ofset Gazete Kâğıdı
      : '#ffffff'; // 1. Hamur Beyaz Kâğıt

  // Get 2-letter monogram for institute
  const getPreviewMonogram = (name?: string) => {
    if (!name) return 'TS';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Render modular logo/emblem in preview
  // Render real custom logo in preview (No fake armas or placeholders)
  const renderPreviewLogo = (options?: { size?: 'sm' | 'md' | 'lg'; onDarkBg?: boolean }) => {
    if (brand.showLogo === false || !brand.customLogoUrl) return null;

    const onDark = options?.onDarkBg ?? false;
    const size = options?.size ?? 'md';

    const sizeClass =
      size === 'sm'
        ? 'h-7 w-7 min-w-[28px]'
        : size === 'lg'
        ? 'h-10 w-10 min-w-[40px]'
        : 'h-8 w-8 min-w-[32px]';

    return (
      <div
        className={`${sizeClass} rounded-xs p-0.5 flex items-center justify-center shrink-0 border ${
          onDark
            ? 'bg-white/95 border-white/40 shadow-2xs'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.customLogoUrl}
          alt={brand.instituteName || 'Kurum Logosu'}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  };

  // Render Configurable Page Number in preview (Centered directly in footer row)
  const renderPreviewPageNumber = (pageNumber: number = 1, totalPages: number = 3) => {
    const style =
      brand.pageNumberStyle ||
      (brand.footerStyle === 'circle-badge' ? 'circle-badge' : 'centered-hyphen');

    if (style === 'none') return null;

    if (style === 'circle-badge') {
      return (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white font-black text-[11px] leading-none select-none shadow-xs text-center shrink-0 tabular-nums"
          style={{ backgroundColor: effectivePrimary }}
        >
          <span className="inline-block leading-none text-center select-none">{pageNumber}</span>
        </span>
      );
    }

    if (style === 'circle-outline') {
      return (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 font-black text-[11px] leading-none bg-white select-none shadow-xs text-center shrink-0 tabular-nums"
          style={{ borderColor: effectivePrimary, color: effectivePrimary }}
        >
          <span className="inline-block leading-none text-center select-none">{pageNumber}</span>
        </span>
      );
    }

    if (style === 'pill-capsule') {
      return (
        <div
          className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border select-none bg-white shadow-2xs leading-none"
          style={{ borderColor: effectivePrimary, color: effectivePrimary }}
        >
          Sayfa {pageNumber}
        </div>
      );
    }

    if (style === 'bracket-boxed') {
      return (
        <div className="px-2 py-0.5 border border-slate-300 bg-white font-mono font-bold text-[9px] text-slate-800 rounded-xs select-none shadow-2xs leading-none">
          [ {pageNumber} ]
        </div>
      );
    }

    if (style === 'fraction-slash') {
      return (
        <span className="bg-transparent px-1 font-mono font-bold text-slate-800 text-[10px] whitespace-nowrap select-none leading-none">
          Sayfa {pageNumber} / {totalPages}
        </span>
      );
    }

    if (style === 'double-dash-total') {
      return (
        <span className="bg-transparent px-1 font-mono font-bold text-slate-800 text-[10px] whitespace-nowrap select-none leading-none">
          — {pageNumber} / {totalPages} —
        </span>
      );
    }

    if (style === 'minimal-num') {
      return (
        <span className="bg-transparent px-1 font-black text-slate-900 text-xs select-none leading-none">
          {pageNumber}
        </span>
      );
    }

    // Default: 'centered-hyphen' (- 1 -)
    return (
      <span className="bg-transparent px-1 font-mono font-bold text-slate-800 text-[10px] whitespace-nowrap select-none leading-none">
        - {pageNumber} -
      </span>
    );
  };

  // Render header separator line in Brand preview
  const renderPreviewHeaderSeparator = (fallback?: string) => {
    const activeLineStyle = brand.subtitleStyle || fallback || 'oval-capsule-line';
    if (activeLineStyle === 'clean') return null;

    if (activeLineStyle === 'curved-arch-line') {
      return (
        <div className="w-full flex items-center justify-center px-4 py-0.5 my-1">
          <svg className="w-full max-w-[320px] h-2.5" viewBox="0 0 100 12" fill="none">
            <path d="M5 10 Q 50 -2 95 10" stroke={effectivePrimary} strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="50" cy="4" r="2.5" fill={effectivePrimary} />
          </svg>
        </div>
      );
    }

    if (activeLineStyle === 'wavy-line') {
      return (
        <div className="w-full flex items-center justify-center px-4 py-0.5 my-1">
          <svg className="w-full max-w-[320px] h-2.5" viewBox="0 0 100 10" fill="none">
            <path d="M5 5 Q 25 0 50 5 T 95 5" stroke={effectivePrimary} strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    if (activeLineStyle === 'double-pill') {
      return (
        <div className="flex flex-col items-center gap-0.5 px-4 py-0.5 my-1">
          <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: `${effectivePrimary}30` }} />
          <div className="w-1/2 h-0.5 rounded-full" style={{ backgroundColor: effectivePrimary }} />
        </div>
      );
    }

    if (activeLineStyle === 'circle-medallion-line') {
      return (
        <div className="flex items-center justify-center gap-2 px-4 py-0.5 my-1">
          <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
          <div
            className="w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold shadow-2xs shrink-0"
            style={{ borderColor: effectivePrimary, color: effectivePrimary, backgroundColor: `${effectivePrimary}10` }}
          >
            ✦
          </div>
          <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
        </div>
      );
    }

    if (activeLineStyle === 'center-lines') {
      return (
        <div className="flex items-center justify-center gap-2 px-4 py-0.5 my-1">
          <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-700" />
          <span className="text-[7px] tracking-widest text-slate-400 font-bold shrink-0">● ● ●</span>
          <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-700" />
        </div>
      );
    }

    // Default: 'oval-capsule-line'
    return (
      <div className="flex items-center justify-center gap-1.5 px-4 pt-0.5 my-1">
        <div
          className="h-0.5 flex-1 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${effectivePrimary})` }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: effectivePrimary }}
        />
        <div
          className="h-0.5 flex-1 rounded-full"
          style={{ background: `linear-gradient(90deg, ${effectivePrimary}, transparent)` }}
        />
      </div>
    );
  };

  // Render modular custom note / notice banner in preview
  const renderPreviewSubBanner = () => {
    const bannerStyle = brand.instructionBoxStyle || 'classic-border';
    return (
      <>
        {renderPreviewHeaderSeparator()}
        {brand.showInstructionBox && brand.instructionBoxText?.trim() && (
          bannerStyle === 'modern-pill' ? (
            <div
              className="px-4 py-1 text-center text-[8.5px] font-bold mt-1 rounded-full select-none break-words shadow-2xs border"
              style={{
                borderColor: `${effectivePrimary}50`,
                backgroundColor: `${effectivePrimary}12`,
                color: effectivePrimary,
              }}
            >
              ✦ {brand.instructionBoxText.trim()} ✦
            </div>
          ) : bannerStyle === 'highlight-callout' ? (
            <div
              className="border-l-4 px-3 py-1 text-left text-[8.5px] font-semibold mt-1 select-none break-words shadow-2xs"
              style={{
                borderLeftColor: effectivePrimary,
                borderColor: `${effectivePrimary}30`,
                backgroundColor: `${effectivePrimary}08`,
                color: '#1e293b',
              }}
            >
              <strong style={{ color: effectivePrimary }}>ÖNEMLİ DUYURU:</strong> {brand.instructionBoxText.trim()}
            </div>
          ) : bannerStyle === 'subtle-fill' ? (
            <div
              className="px-3 py-1 text-center text-[8.5px] font-bold mt-1 rounded select-none break-words text-white shadow-2xs"
              style={{
                backgroundColor: effectivePrimary,
              }}
            >
              {brand.instructionBoxText.trim()}
            </div>
          ) : (
            <div
              className="border px-4 py-1.5 text-center text-[8.5px] font-semibold mt-1 rounded-xs select-none break-words"
              style={{
                borderColor: `${effectivePrimary}40`,
                backgroundColor: `${effectivePrimary}08`,
                color: '#1e293b',
              }}
            >
              {brand.instructionBoxText.trim()}
            </div>
          )
        )}
      </>
    );
  };

  // Render modular student information row in preview with selected style
  const renderPreviewStudentInfo = () => {
    // Show student info if enabled OR if active format is 'written' OR if user is in 'instruction_rosette' or 'identity' tab
    const shouldShow =
      brand.showStudentInfo !== false ||
      brand.headerStyle === 'classic-meb' ||
      activeTab === 'instruction_rosette' ||
      activeTab === 'identity' ||
      activeBlueprint?.docType === 'written' ||
      docType === 'written';

    if (!shouldShow) return null;
    const style = brand.studentInfoStyle || 'classic-dotted';

    if (style === 'table-boxes') {
      return (
        <div
          className="text-[8.5px] select-none w-full mt-1.5 flex divide-x rounded-none shadow-2xs border"
          style={{ borderColor: `${effectivePrimary}50`, backgroundColor: `${effectivePrimary}05` }}
        >
          <div
            className="flex-[2] p-1 font-bold flex items-center justify-between"
            style={{ backgroundColor: `${effectivePrimary}14`, color: effectivePrimary, borderColor: `${effectivePrimary}35` }}
          >
            <span>Adı ve Soyadı:</span>
            <span className="opacity-50 font-normal">...................................</span>
          </div>
          <div
            className="flex-1 p-1 flex items-center justify-between"
            style={{ backgroundColor: `${effectivePrimary}08`, borderColor: `${effectivePrimary}35` }}
          >
            <span className="font-bold" style={{ color: effectivePrimary }}>Sınıf/Şube:</span>
            <span className="opacity-50 font-normal" style={{ color: effectivePrimary }}>.....</span>
          </div>
          <div
            className="flex-1 p-1 flex items-center justify-between"
            style={{ backgroundColor: `${effectivePrimary}08`, borderColor: `${effectivePrimary}35` }}
          >
            <span className="font-bold" style={{ color: effectivePrimary }}>Okul No:</span>
            <span className="opacity-50 font-normal" style={{ color: effectivePrimary }}>.....</span>
          </div>
          <div
            className="w-16 p-1 text-center font-black flex items-center justify-center text-white"
            style={{ backgroundColor: effectivePrimary, borderColor: `${effectivePrimary}50` }}
          >
            <span>NOT: [ &nbsp; ]</span>
          </div>
        </div>
      );
    }

    if (style === 'badge-capsule') {
      return (
        <div className="flex items-center gap-1.5 text-[8px] select-none w-full mt-1.5 flex-wrap">
          <div className="flex items-center rounded-none border overflow-hidden shadow-2xs flex-[2] min-w-[130px]" style={{ borderColor: `${effectivePrimary}60` }}>
            <span className="px-1.5 py-0.5 text-white font-bold text-[7.5px]" style={{ backgroundColor: effectivePrimary }}>ÖĞRENCİ</span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 flex-1 truncate" style={{ borderColor: `${effectivePrimary}40` }}>Ad Soyad .........................</span>
          </div>
          <div className="flex items-center rounded-none border overflow-hidden shadow-2xs flex-1 min-w-[65px]" style={{ borderColor: `${effectivePrimary}60` }}>
            <span className="px-1.5 py-0.5 text-white font-bold text-[7.5px]" style={{ backgroundColor: effectivePrimary }}>SINIF</span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-800 flex-1 font-bold" style={{ color: effectivePrimary }}>.....</span>
          </div>
          <div className="flex items-center rounded-none border overflow-hidden shadow-2xs flex-1 min-w-[60px]" style={{ borderColor: `${effectivePrimary}60` }}>
            <span className="px-1.5 py-0.5 text-white font-bold text-[7.5px]" style={{ backgroundColor: effectivePrimary }}>NO</span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-800 flex-1 font-bold" style={{ color: effectivePrimary }}>.....</span>
          </div>
          <div className="flex items-center rounded-none border overflow-hidden shadow-2xs shrink-0" style={{ borderColor: `${effectivePrimary}60` }}>
            <span className="px-1.5 py-0.5 text-white font-bold text-[7.5px]" style={{ backgroundColor: effectivePrimary }}>PUAN</span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-800 font-black font-mono" style={{ color: effectivePrimary }}>[ &nbsp; ]</span>
          </div>
        </div>
      );
    }

    if (style === 'corner-compact') {
      return (
        <div
          className="rounded-none border p-1 text-[8px] select-none w-full mt-1 flex items-center justify-between shadow-2xs"
          style={{ borderColor: `${effectivePrimary}45`, backgroundColor: `${effectivePrimary}08` }}
        >
          <div className="flex items-center gap-3">
            <span><strong style={{ color: effectivePrimary }}>Adı Soyadı:</strong> ....................................</span>
            <span><strong style={{ color: effectivePrimary }}>Sınıf:</strong> .....</span>
            <span><strong style={{ color: effectivePrimary }}>No:</strong> .....</span>
          </div>
          <div
            className="font-bold px-2 py-0.5 rounded-none border shadow-2xs"
            style={{ backgroundColor: `${effectivePrimary}20`, color: effectivePrimary, borderColor: `${effectivePrimary}50` }}
          >
            Puan: [ &nbsp; ]
          </div>
        </div>
      );
    }

    if (style === 'clean-underline') {
      return (
        <div className="py-1 text-[8.5px] select-none w-full mt-1 border-b pb-1" style={{ borderColor: effectivePrimary }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-[2] flex items-center gap-1">
              <span className="font-bold" style={{ color: effectivePrimary }}>Öğrenci:</span>
              <span className="border-b border-solid flex-1 inline-block h-1" style={{ borderColor: `${effectivePrimary}80` }} />
            </div>
            <div className="flex-1 flex items-center gap-1">
              <span className="font-bold" style={{ color: effectivePrimary }}>Sınıf:</span>
              <span className="border-b border-solid flex-1 inline-block h-1" style={{ borderColor: `${effectivePrimary}80` }} />
            </div>
            <div className="flex-1 flex items-center gap-1">
              <span className="font-bold" style={{ color: effectivePrimary }}>No:</span>
              <span className="border-b border-solid flex-1 inline-block h-1" style={{ borderColor: `${effectivePrimary}80` }} />
            </div>
            <div className="shrink-0 flex items-center gap-1 font-bold">
              <span style={{ color: effectivePrimary }}>Puan:</span>
              <span
                className="border rounded-none px-1.5"
                style={{ borderColor: effectivePrimary, color: effectivePrimary, backgroundColor: `${effectivePrimary}12` }}
              >
                [ &nbsp; ]
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'official-meb') {
      return (
        <div
          className="text-slate-900 dark:text-slate-100 text-[8px] select-none w-full mt-1.5 rounded-none shadow-2xs divide-y border"
          style={{ borderColor: effectivePrimary, backgroundColor: `${effectivePrimary}05` }}
        >
          <div
            className="px-2 py-0.5 flex items-center justify-between gap-2 font-bold text-white shadow-2xs"
            style={{ backgroundColor: effectivePrimary }}
          >
            <span className="truncate tracking-wide">T.C. MİLLÎ EĞİTİM BAKANLIĞI ORTAK YAZILI SINAV PROTOKOLÜ</span>
            <span className="shrink-0 font-mono text-[7px] bg-white/20 px-1 py-0.2 rounded-xs">SENARYO-1</span>
          </div>
          <div className="p-1 grid grid-cols-12 gap-1.5 items-center">
            <div className="col-span-5 flex items-center gap-1">
              <span className="font-bold" style={{ color: effectivePrimary }}>Öğrenci:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${effectivePrimary}80` }} />
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <span className="font-bold" style={{ color: effectivePrimary }}>Şube:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${effectivePrimary}80` }} />
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <span className="font-bold" style={{ color: effectivePrimary }}>No:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${effectivePrimary}80` }} />
            </div>
            <div className="col-span-3 flex items-center justify-end gap-1 font-bold">
              <span style={{ color: effectivePrimary }}>NOTU:</span>
              <span
                className="border px-1.5 py-0.2 font-mono text-[8.5px] shadow-2xs"
                style={{ borderColor: effectivePrimary, color: effectivePrimary, backgroundColor: `${effectivePrimary}15` }}
              >
                [ &nbsp;&nbsp; ]
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Default: classic-dotted
    return (
      <div
        className="rounded-none border p-1.5 text-[9px] select-none w-full mt-1.5 shadow-2xs"
        style={{ borderColor: `${effectivePrimary}45`, backgroundColor: `${effectivePrimary}08` }}
      >
        <div className="grid grid-cols-4 gap-2">
          <div className="flex items-center gap-1">
            <span className="font-bold shrink-0" style={{ color: effectivePrimary }}>Adı Soyadı:</span>
            <span className="border-b border-dotted flex-1 inline-block h-2" style={{ borderColor: `${effectivePrimary}80` }} />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold shrink-0" style={{ color: effectivePrimary }}>Sınıf/Şube:</span>
            <span className="border-b border-dotted flex-1 inline-block h-2" style={{ borderColor: `${effectivePrimary}80` }} />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold shrink-0" style={{ color: effectivePrimary }}>Okul No:</span>
            <span className="border-b border-dotted flex-1 inline-block h-2" style={{ borderColor: `${effectivePrimary}80` }} />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold shrink-0" style={{ color: effectivePrimary }}>Puan:</span>
            <span className="border-b border-dotted flex-1 inline-block h-2" style={{ borderColor: `${effectivePrimary}80` }} />
          </div>
        </div>
      </div>
    );
  };

  // Render format-specific lecture / note / formula block in live preview
  const renderPreviewLectureBlockSample = (extraClass = '') => {
    const lectureStyle = brand.lectureBoxStyle || 'highlight-bar';
    const isTwoCol = docSettings.columnCount === 2;
    const colSpan = isTwoCol ? 'col-span-2' : 'w-full';

    if (lectureStyle === 'formula-frame') {
      return (
        <div
          className={`${colSpan} ${extraClass} rounded-lg border-2 border-dashed p-2.5 my-1 bg-stone-50/70 dark:bg-slate-800/60 transition-all select-none`}
          style={{ borderColor: `${effectivePrimary}70` }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className="font-mono font-bold text-[8px] px-2 py-0.5 rounded text-white tracking-wider shadow-2xs flex items-center gap-1"
              style={{ backgroundColor: effectivePrimary }}
            >
              <span>📐</span> f(x) FORMÜL &amp; TEOREM
            </span>
            <span className="text-[7.5px] font-bold text-slate-400">
              Kazanım Formülü
            </span>
          </div>
          <div
            className="text-[9.5px] font-mono text-center my-1 font-extrabold tracking-wide py-1 rounded bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
            style={{ color: effectivePrimary }}
          >
            v = &lambda; &middot; f &nbsp;&nbsp;|&nbsp;&nbsp; a&sup2; + b&sup2; = c&sup2; &nbsp;&nbsp;|&nbsp;&nbsp; f(x) = ax + b
          </div>
          <p className="text-[8.5px] text-slate-600 dark:text-slate-300 leading-snug">
            <strong>Önemli Kural:</strong> Doğrusal dalgalarda yayılma hızı ortama, frekans ise dalga kaynağına bağlıdır.
          </p>
        </div>
      );
    }

    if (lectureStyle === 'tip-badge') {
      return (
        <div
          className={`${colSpan} ${extraClass} rounded-xl border p-2.5 my-1 bg-white dark:bg-[#1a1d26] shadow-2xs transition-all select-none`}
          style={{ borderColor: `${effectivePrimary}45` }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-white font-bold text-[8px] shadow-2xs"
              style={{ backgroundColor: effectivePrimary }}
            >
              <span>💡</span> İPUCU &amp; HATIRLATMA
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
              Fasikül Notu
            </span>
          </div>
          <p className="text-[8.5px] text-slate-700 dark:text-slate-300 leading-snug font-medium mt-1">
            İki bilinmeyenli denklem sistemlerinde yok etme metodu uygulanırken katsayıların mutlak değerce eşit ve zıt işaretli olması işlem kolaylığı sağlar.
          </p>
        </div>
      );
    }

    if (lectureStyle === 'curved-accent') {
      return (
        <div
          className={`${colSpan} ${extraClass} rounded-lg border overflow-hidden my-1 bg-white dark:bg-[#1a1d26] shadow-2xs transition-all select-none`}
          style={{ borderColor: `${effectivePrimary}40` }}
        >
          <div
            className="px-2.5 py-1 text-white font-black text-[8px] flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${effectivePrimary}, ${effectiveSecondary || effectivePrimary})`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span>⚡</span>
              <span className="tracking-wide">KAZANIM ÖZETİ &amp; KURAL BİLGİSİ</span>
            </div>
            <span className="text-[7px] font-bold opacity-85 px-1.5 py-0.2 rounded-full bg-white/20">
              MODÜL 01
            </span>
          </div>
          <div className="p-2 text-[8.5px] text-slate-700 dark:text-slate-300 leading-snug">
            Cümlede anlam ilişkilerinde sebep-sonuç ile amaç-sonuç cümlelerini ayırt etmek için eylemin hangi maksatla yapıldığı kontrol edilir.
          </div>
        </div>
      );
    }

    if (lectureStyle === 'clean-card') {
      return (
        <div
          className={`${colSpan} ${extraClass} rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 my-1 bg-white dark:bg-[#1a1d26] transition-all select-none`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1 mb-1">
            <span className="font-bold text-[8.5px] text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>📌</span> Özet &amp; Tanım
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase">Kavram</span>
          </div>
          <p className="text-[8.5px] text-slate-600 dark:text-slate-300 leading-snug">
            Her elemanı yalnız bir elemanla eşleyen ve açıkta eleman bırakmayan bağıntıya fonksiyon denir.
          </p>
        </div>
      );
    }

    // Default: 'highlight-bar' (Vurgulu Sol Şerit)
    return (
      <div
        className={`${colSpan} ${extraClass} rounded-md border border-l-4 p-2.5 my-1 bg-slate-50 dark:bg-slate-800 shadow-2xs transition-all select-none`}
        style={{
          borderLeftColor: effectivePrimary,
          borderColor: `${effectivePrimary}35`,
          backgroundColor: `${effectivePrimary}08`,
        }}
      >
        <div className="flex items-center justify-between mb-0.5">
          <div className="font-bold flex items-center gap-1.5 text-[9px]" style={{ color: effectivePrimary }}>
            <BookOpen className="h-3 w-3 shrink-0" />
            <span>KAZANIM BİLGİ NOTU &amp; FORMÜL</span>
          </div>
          <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
            Ders Notu
          </span>
        </div>
        <p className="text-[8.5px] text-slate-700 dark:text-slate-300 leading-snug font-medium mt-0.5">
          Doğrusal dalgalarda yayılma hızı: <strong>v = &lambda; &middot; f</strong> bağıntısıyla hesaplanır. Frekans kaynağa, hız ise ortama bağlıdır.
        </p>
      </div>
    );
  };

  // Render miniature visual diagram for publisher header models in the sidebar tools
  const renderMiniHeaderDiagram = (modelId: string) => {
    const p = effectivePrimary || '#0284c7';
    const s = effectiveSecondary || '#0369a1';
    switch (modelId) {
      case 'oval-capsule':
        return (
          <div className="w-full h-8 rounded-full border p-1 flex items-center justify-between select-none pointer-events-none bg-white dark:bg-[#1a1d26] px-2 shadow-2xs" style={{ borderColor: p }}>
            <div className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-black text-white shrink-0" style={{ backgroundColor: p }}>
              A
            </div>
            <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0 px-1">
              <div className="w-12 h-1 rounded-full" style={{ backgroundColor: p }} />
              <div className="w-8 h-0.5 rounded-full bg-slate-400" />
            </div>
            <div className="w-4 h-2 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: `${p}60` }}>
              <div className="w-2 h-0.5 rounded-full" style={{ backgroundColor: p }} />
            </div>
          </div>
        );
      case 'curved-arch':
        return (
          <div className="w-full h-8 rounded-t-[14px] rounded-b-xs p-1 flex flex-col justify-between select-none pointer-events-none text-white shadow-2xs overflow-hidden" style={{ background: `linear-gradient(180deg, ${p}, ${s})` }}>
            <div className="flex items-center justify-between px-1">
              <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
              <div className="w-12 h-1 rounded-full bg-white" />
              <div className="w-3 h-2 rounded-full bg-white/20 text-[6px] flex items-center justify-center font-bold">A</div>
            </div>
            <div className="w-full h-0.5 rounded-full bg-white/40" />
          </div>
        );
      case 'wavy-ribbon':
        return (
          <div className="w-full h-8 rounded-2xl p-1 flex items-center justify-between select-none pointer-events-none text-white shadow-2xs overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${p}, ${s})` }}>
            <div className="w-3 h-3 rounded-full bg-white/25 flex items-center justify-center text-[6px] font-bold">★</div>
            <div className="flex flex-col items-center gap-0.5 z-10">
              <div className="w-14 h-1 rounded-full bg-white" />
              <div className="w-9 h-0.5 rounded-full bg-white/80" />
            </div>
            <div className="w-4 h-3 rounded-full bg-white/25 flex items-center justify-center text-[6px] font-bold">A</div>
          </div>
        );
      case 'pill-modern':
        return (
          <div className="w-full h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d26] p-0.5 flex items-center justify-between select-none pointer-events-none px-1.5 shadow-2xs">
            <div className="h-4 px-1 rounded-full text-white text-[6px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: p }}>
              TEST
            </div>
            <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0 px-1">
              <div className="w-12 h-1 rounded-full" style={{ backgroundColor: p }} />
              <div className="w-8 h-0.5 rounded-full bg-slate-400" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full border text-[6px] font-black flex items-center justify-center shrink-0" style={{ borderColor: p, color: p }}>
              A
            </div>
          </div>
        );
      case 'modern-center':
        return (
          <div className="w-full h-8 rounded p-1 flex flex-col items-center justify-center gap-0.5 select-none pointer-events-none" style={{ backgroundColor: p }}>
            <div className="w-16 h-1 rounded-xs bg-white" />
            <div className="flex items-center gap-1">
              <div className="w-8 h-0.5 rounded-xs bg-white/70" />
              <div className="w-4 h-1 rounded-full bg-amber-300" />
            </div>
          </div>
        );
      case 'fasikul-band':
        return (
          <div className="w-full h-8 rounded overflow-hidden flex select-none pointer-events-none border border-black/5">
            <div className="w-1/3 h-full p-0.5 flex flex-col justify-center items-center gap-0.5" style={{ backgroundColor: p }}>
              <div className="w-5 h-1 rounded-xs bg-white" />
              <div className="w-3 h-0.5 rounded-xs bg-white/70" />
            </div>
            <div className="w-2/3 h-full p-0.5 flex flex-col justify-center gap-0.5 bg-slate-50 dark:bg-slate-800" style={{ borderLeft: `2px solid ${s}` }}>
              <div className="w-14 h-1 rounded-xs" style={{ backgroundColor: s }} />
              <div className="w-8 h-0.5 rounded-xs bg-slate-400" />
            </div>
          </div>
        );
      case 'framed-rosette':
        return (
          <div className="w-full h-8 rounded border p-1 flex items-center justify-between select-none pointer-events-none bg-white dark:bg-[#1a1d26]" style={{ borderColor: p }}>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
              <div className="w-14 h-1 rounded-xs" style={{ backgroundColor: p }} />
              <div className="w-9 h-0.5 rounded-xs bg-slate-400" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-white shrink-0 shadow-2xs" style={{ backgroundColor: p }}>
              A
            </div>
          </div>
        );
      case 'wave-organic':
        return (
          <div className="w-full h-8 rounded overflow-hidden relative p-1 flex items-center justify-between text-white select-none pointer-events-none" style={{ background: `linear-gradient(135deg, ${p}, ${s})` }}>
            <div className="flex flex-col gap-0.5 z-10">
              <div className="w-14 h-1 rounded-xs bg-white" />
              <div className="w-9 h-0.5 rounded-xs bg-white/80" />
            </div>
            <div className="absolute right-0 bottom-0 w-10 h-4 bg-white/20 rounded-tl-full" />
          </div>
        );
      case 'brush-accent':
        return (
          <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d26] p-1 flex items-center gap-1.5 select-none pointer-events-none">
            <div className="px-1 py-0.5 rounded text-[6px] font-black text-white shrink-0" style={{ backgroundColor: p }}>FÖY</div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="w-14 h-1 rounded-xs bg-slate-800 dark:bg-white" />
              <div className="w-9 h-0.5 rounded-xs bg-slate-400" />
            </div>
          </div>
        );
      case 'split-corporate':
        return (
          <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d26] flex select-none pointer-events-none">
            <div className="w-2 h-full shrink-0" style={{ backgroundColor: p }} />
            <div className="flex flex-col justify-center gap-0.5 p-1 flex-1 min-w-0">
              <div className="w-14 h-1 rounded-xs bg-slate-800 dark:bg-white" />
              <div className="w-10 h-0.5 rounded-xs bg-slate-400" />
            </div>
          </div>
        );
      case 'minimalist':
        return (
          <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d26] p-1 flex flex-col justify-between select-none pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="w-14 h-1 rounded-xs bg-slate-800 dark:bg-white" />
              <div className="w-4 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
            <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: p }} />
          </div>
        );
      case 'dark-hightech':
        return (
          <div className="w-full h-8 rounded bg-[#1e293b] p-1 flex flex-col justify-between border-b-2 select-none pointer-events-none" style={{ borderBottomColor: p }}>
            <div className="flex items-center justify-between">
              <div className="w-14 h-1 rounded-xs bg-white" />
              <div className="w-3 h-1 rounded-full" style={{ backgroundColor: p }} />
            </div>
            <div className="w-8 h-0.5 rounded-xs bg-slate-400" />
          </div>
        );
      case 'curved-modern':
        return (
          <div className="w-full h-8 rounded p-0.5 flex items-center justify-center select-none pointer-events-none bg-slate-50 dark:bg-[#1a1d26] border border-slate-200 dark:border-slate-700">
            <div className="w-full h-6 rounded-full flex items-center justify-center gap-1 px-2" style={{ backgroundColor: `${p}15`, border: `1px solid ${p}40` }}>
              <div className="w-12 h-1 rounded-xs" style={{ backgroundColor: p }} />
              <div className="w-4 h-1 rounded-full" style={{ backgroundColor: p }} />
            </div>
          </div>
        );
      case 'gradient-banner':
        return (
          <div className="w-full h-8 rounded p-1 flex items-center justify-between text-white select-none pointer-events-none shadow-2xs" style={{ background: `linear-gradient(90deg, ${p}, ${s})` }}>
            <div className="flex flex-col gap-0.5">
              <div className="w-14 h-1 rounded-xs bg-white" />
              <div className="w-8 h-0.5 rounded-xs bg-white/70" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[7px]">★</div>
          </div>
        );
      case 'bordered-stamp':
      default:
        return (
          <div className="w-full h-8 rounded border border-dashed p-1 flex items-center justify-center flex-col gap-0.5 select-none pointer-events-none bg-white dark:bg-[#1a1d26]" style={{ borderColor: `${p}60` }}>
            <div className="w-14 h-1 rounded-xs" style={{ backgroundColor: p }} />
            <div className="w-9 h-0.5 rounded-xs bg-slate-400" />
          </div>
        );
    }
  };

  // Render question badge in live paper preview
  const renderPreviewQuestionBadge = (num: number) => {
    if (brand.questionBadgeStyle === 'square') {
      return (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-none text-white font-mono text-[10px] font-black shrink-0 mt-0.5 shadow-2xs"
          style={{ backgroundColor: effectivePrimary }}
        >
          {num}
        </span>
      );
    }
    if (brand.questionBadgeStyle === 'circle') {
      return (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-mono font-black shrink-0 mt-0.5"
          style={{ borderColor: effectivePrimary, color: effectivePrimary }}
        >
          {num}
        </span>
      );
    }
    if (brand.questionBadgeStyle === 'hexagon') {
      return (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-none font-mono text-white text-[10px] font-black shrink-0 mt-0.5 rotate-3"
          style={{ backgroundColor: effectivePrimary }}
        >
          {num}
        </span>
      );
    }
    if (brand.questionBadgeStyle === 'pill') {
      return (
        <span
          className="inline-flex items-center rounded-none overflow-hidden text-[9px] font-black shrink-0 mt-0.5 shadow-2xs"
          style={{ border: `1px solid ${effectivePrimary}` }}
        >
          <span className="px-1 text-white" style={{ backgroundColor: effectivePrimary }}>S</span>
          <span className="px-1 bg-white" style={{ color: effectivePrimary }}>{num}</span>
        </span>
      );
    }
    return (
      <span className="text-xs font-black shrink-0 mt-0.5" style={{ color: effectivePrimary }}>
        {num}.
      </span>
    );
  };

  // Render question points badge in live paper preview
  const renderPreviewQuestionPoints = (points: number = 10) => {
    if (brand.showQuestionPoints === false) return null;
    const format = brand.pointsTextFormat || 'short-p';
    const pointText = format === 'full-puan' ? `${points} Puan` : format === 'num-only' ? `${points}` : `${points}p`;
    const style = brand.questionPointsStyle || 'capsule-pill';
    const bg = effectivePrimary;

    switch (style) {
      case 'capsule-pill':
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[8.5px] font-bold font-mono shrink-0 border"
            style={{ backgroundColor: `${bg}14`, color: bg, borderColor: `${bg}40` }}
          >
            ({pointText})
          </span>
        );
      case 'soft-badge':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[8.5px] font-bold font-mono shrink-0 border border-slate-200 bg-slate-50 text-slate-700">
            [{pointText}]
          </span>
        );
      case 'circle-tag':
        return (
          <span
            className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[8px] font-black font-mono shrink-0 border-2"
            style={{ borderColor: bg, color: bg, backgroundColor: 'white' }}
          >
            {pointText}
          </span>
        );
      case 'bold-framed':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-xs text-[8.5px] font-black font-mono uppercase border-2 border-stone-900 bg-stone-100 text-stone-900 shadow-2xs">
            {pointText}
          </span>
        );
      case 'bracket-mono':
        return (
          <span className="text-[9px] font-bold font-mono text-stone-700 shrink-0">
            [{pointText}]
          </span>
        );
      case 'banner-tag':
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.2 rounded-xs text-[8px] font-bold font-mono text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: bg }}
          >
            {pointText}
          </span>
        );
      case 'ribbon-corner':
        return (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-xs text-[8.5px] font-black font-mono shrink-0 border"
            style={{ borderColor: `${bg}60`, backgroundColor: `${bg}10`, color: bg }}
          >
            <span className="text-[7.5px] opacity-70">★</span>
            {pointText}
          </span>
        );
      case 'minimal-parenthesis':
      default:
        return (
          <span className="text-[9px] font-bold text-stone-500 font-mono shrink-0">
            ({pointText})
          </span>
        );
    }
  };

  // Render options in live paper preview
  const renderPreviewOptions = (opts: string[]) => {
    return (
      <div className="mt-1.5 pl-1 flex flex-col gap-1 font-semibold text-[9.5px] sm:text-[10px] text-slate-700">
        {opts.map((optStr) => {
          const letterMatch = optStr.match(/^([A-E])\)\s*(.*)$/);
          const letter = letterMatch ? letterMatch[1] : optStr.slice(0, 1);
          const text = letterMatch ? letterMatch[2] : optStr.slice(2).trim();

          return (
            <div key={letter} className="flex items-start gap-1.5 min-w-0">
              {brand.optionStyle === 'circle' && (
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[7.5px] font-bold shrink-0 mt-0.5"
                  style={{ borderColor: effectivePrimary, color: effectivePrimary }}
                >
                  {letter}
                </span>
              )}
              {brand.optionStyle === 'circle-fill' && (
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-white text-[7.5px] font-bold shrink-0 mt-0.5 shadow-2xs"
                  style={{ backgroundColor: effectivePrimary }}
                >
                  {letter}
                </span>
              )}
              {brand.optionStyle === 'square' && (
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-none border text-[7.5px] font-bold shrink-0 mt-0.5"
                  style={{ borderColor: effectivePrimary, color: effectivePrimary }}
                >
                  {letter}
                </span>
              )}
              {brand.optionStyle === 'bold-letter' && (
                <span className="font-bold text-slate-900 w-3 shrink-0 mt-0.5 text-[9px]">
                  {letter})
                </span>
              )}
              {brand.optionStyle === 'soft-card' && (
                <span
                  className="px-1 py-0.2 rounded-none text-[7.5px] font-bold mr-0.5 shrink-0 mt-0.5"
                  style={{ backgroundColor: `${effectivePrimary}15`, color: effectivePrimary }}
                >
                  {letter}
                </span>
              )}
              <span className="flex-1 min-w-0 leading-tight text-[9.5px] break-words">{text}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Dynamic Modular Optical Answer Form (Dairesel Baloncuklar, Ara Çizgilere Uyumlu, Sütun Sıralı)
  const renderPreviewOpticForm = () => {
    if (!docSettings.showOpticForm) return null;

    const totalQ = effectiveQuestionCount;
    // Sequential column distribution (2 columns for <= 12 questions, 4 columns for > 12 questions)
    const numCols = totalQ <= 12 ? 2 : 4;
    const questionsPerCol = Math.ceil(totalQ / numCols);

    const columns: Array<Array<{ num: number }>> = [];
    for (let c = 0; c < numCols; c++) {
      const colItems: Array<{ num: number }> = [];
      const startNum = c * questionsPerCol + 1;
      const endNum = Math.min((c + 1) * questionsPerCol, totalQ);
      for (let n = startNum; n <= endNum; n++) {
        colItems.push({ num: n });
      }
      if (colItems.length > 0) {
        columns.push(colItems);
      }
    }

    return (
      <div
        className="w-full shrink-0 mt-2 mb-1.5 rounded-lg border overflow-hidden shadow-2xs select-none bg-white text-slate-800"
        style={{
          borderColor: `${effectivePrimary}45`,
        }}
      >
        {/* Optic Header Bar with Calibration Timing Marks */}
        <div
          className="px-2.5 py-1 border-b flex items-center justify-between text-[8px] font-mono"
          style={{
            borderColor: `${effectivePrimary}25`,
            backgroundColor: `${effectivePrimary}08`,
          }}
        >
          <div className="flex items-center gap-1.5 font-bold" style={{ color: effectivePrimary }}>
            <span className="w-2 h-2 bg-slate-900 inline-block shrink-0" />
            <span className="tracking-wider uppercase">Cevap Optik Kodlama Alanı</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="text-[7.5px] hidden sm:inline">Daireleri dışa taşırmadan kurşun kalemle doldurunuz</span>
            <span
              className="px-1.5 py-0.2 rounded font-bold text-white text-[7.5px]"
              style={{ backgroundColor: effectivePrimary }}
            >
              Kitapçık: {docSettings.bookletType || 'A'}
            </span>
            <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[7.5px] border" style={{ borderColor: `${effectivePrimary}40`, color: effectivePrimary }}>
              {totalQ} Soru &middot; {activeOptionsList.length} Şık
            </span>
            <span className="w-2 h-2 bg-slate-900 inline-block shrink-0" />
          </div>
        </div>

        {/* Optical Form Grid with crisp vertical dividing lines ("ara çizgiler") */}
        <div
          className={`grid divide-x divide-slate-200 dark:divide-slate-300 p-2 gap-x-2 ${
            columns.length === 2 ? 'grid-cols-2' : 'grid-cols-4'
          }`}
        >
          {columns.map((colGroup, colIdx) => (
            <div
              key={colIdx}
              className={`space-y-1 ${colIdx > 0 ? 'pl-2' : 'pr-1'}`}
            >
              {colGroup.map(({ num }) => (
                <div key={num} className="flex items-center justify-between gap-1 px-1">
                  <span
                    className="w-4 text-right font-mono font-bold text-[8px] shrink-0"
                    style={{ color: effectivePrimary }}
                  >
                    {num}
                  </span>
                  <div className="flex items-center gap-1">
                    {activeOptionsList.map((opt) => (
                      <span
                        key={opt}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-slate-400 bg-white text-slate-700 font-bold text-[7px] sm:text-[7.5px] flex items-center justify-center aspect-square select-none leading-none shadow-2xs transition-colors hover:border-slate-800"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Timing Alignment Calibration Bar */}
        <div
          className="px-2 py-0.5 border-t flex items-center justify-between text-[7px] font-mono text-slate-400"
          style={{ borderColor: `${effectivePrimary}15`, backgroundColor: `${effectivePrimary}04` }}
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-slate-800 inline-block" />
            <span className="w-1.5 h-1.5 bg-slate-800 inline-block" />
            <span className="w-1.5 h-1.5 bg-slate-800 inline-block" />
          </div>
          <span>■ OPTİK OKUYUCU KALİBRASYON ŞERİDİ ■</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-slate-800 inline-block" />
            <span className="w-1.5 h-1.5 bg-slate-800 inline-block" />
            <span className="w-1.5 h-1.5 bg-slate-800 inline-block" />
          </div>
        </div>
      </div>
    );
  };

  // Modular Answer Key component supporting all 6 design models (Dynamic to question count & answers)
  const renderPreviewAnswerKey = () => {
    if (docSettings.showAnswerKey === false) return null;
    const keyStyle = brand.answerKeyStyle || docSettings.answerKeyStyle || 'bottom-strip';

    if (keyStyle === 'boxed-grid') {
      // Chunk keys into rows of 10 or 12 for clean wrapped table
      const chunkSize = 12;
      const chunks: Array<typeof effectiveAnswerKeys> = [];
      for (let i = 0; i < effectiveAnswerKeys.length; i += chunkSize) {
        chunks.push(effectiveAnswerKeys.slice(i, i + chunkSize));
      }

      return (
        <div className="w-full mt-auto pt-2 shrink-0 select-none">
          <div
            className="p-1.5 rounded-none border shadow-2xs space-y-1.5"
            style={{ borderColor: `${effectivePrimary}50`, backgroundColor: `${effectivePrimary}05` }}
          >
            <div
              className="flex items-center justify-between text-[7.5px] font-bold pb-0.5 border-b"
              style={{ borderColor: `${effectivePrimary}30`, color: effectivePrimary }}
            >
              <span className="uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: effectivePrimary }} />
                CEVAP ANAHTARI &middot; ({docSettings.bookletType || 'A'} KİTAPÇIĞI)
              </span>
              <span className="font-mono font-bold" style={{ color: effectivePrimary }}>{effectiveAnswerKeys.length} Soru</span>
            </div>
            {chunks.map((rowKeys, rIdx) => (
              <div
                key={rIdx}
                className="flex divide-x border text-center text-[7.5px] rounded-none overflow-hidden"
                style={{ borderColor: `${effectivePrimary}50` }}
              >
                {rowKeys.map((item) => (
                  <div key={item.q} className="flex-1 flex flex-col">
                    <span
                      className="py-0.5 font-bold border-b text-[8px]"
                      style={{
                        backgroundColor: `${effectivePrimary}14`,
                        color: effectivePrimary,
                        borderColor: `${effectivePrimary}35`,
                      }}
                    >
                      {item.q}
                    </span>
                    <span
                      className="py-0.5 font-black text-white text-[8.5px]"
                      style={{ backgroundColor: effectivePrimary }}
                    >
                      {item.a}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (keyStyle === 'compact-inline') {
      return (
        <div className="w-full mt-auto pt-2 shrink-0 select-none">
          <div
            className="py-1.5 px-2.5 rounded-md border flex items-center justify-between flex-wrap gap-1 shadow-2xs"
            style={{ borderColor: `${effectivePrimary}40`, backgroundColor: `${effectivePrimary}08` }}
          >
            <span
              className="text-[7.5px] font-extrabold uppercase tracking-wider flex items-center gap-1"
              style={{ color: effectivePrimary }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: effectivePrimary }} />
              Cevaplar ({docSettings.bookletType || 'A'} - {effectiveAnswerKeys.length} Soru):
            </span>
            <div className="flex items-center flex-wrap gap-1 font-mono text-[7.5px]">
              {effectiveAnswerKeys.map((item) => (
                <span
                  key={item.q}
                  className="px-1.5 py-0.5 rounded-full border bg-white dark:bg-slate-900 font-bold shadow-2xs"
                  style={{ borderColor: `${effectivePrimary}50` }}
                >
                  <strong className="font-bold mr-0.5" style={{ color: effectivePrimary }}>{item.q}.</strong>
                  <span className="font-black" style={{ color: effectivePrimary }}>{item.a}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (keyStyle === 'optic-bubbles') {
      return (
        <div className="w-full mt-auto pt-2 shrink-0 select-none">
          <div
            className="p-1.5 rounded-md border flex flex-col gap-1 font-mono text-[7px] shadow-2xs"
            style={{ borderColor: `${effectivePrimary}40`, backgroundColor: `${effectivePrimary}08` }}
          >
            <div className="flex items-center justify-between border-b pb-0.5" style={{ borderColor: `${effectivePrimary}25` }}>
              <span className="font-bold uppercase flex items-center gap-1" style={{ color: effectivePrimary }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: effectivePrimary }} />
                Optik Kodlama Cevap Anahtarı ({docSettings.bookletType || 'A'}):
              </span>
              <span className="font-bold" style={{ color: effectivePrimary }}>{effectiveAnswerKeys.length} Soru</span>
            </div>
            <div className="flex items-center flex-wrap gap-2 pt-0.5">
              {effectiveAnswerKeys.map((item) => (
                <div key={item.q} className="flex items-center gap-0.5 bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="font-bold text-[7.5px] mr-0.5" style={{ color: effectivePrimary }}>{item.q}</span>
                  {activeOptionsList.map((opt) => (
                    <span
                      key={opt}
                      className={`w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold ${
                        item.a === opt
                          ? 'text-white'
                          : 'border'
                      }`}
                      style={
                        item.a === opt
                          ? { backgroundColor: effectivePrimary }
                          : { borderColor: `${effectivePrimary}50`, color: effectivePrimary }
                      }
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (keyStyle === 'table-bordered') {
      const chunkSize = 12;
      const chunks: Array<typeof effectiveAnswerKeys> = [];
      for (let i = 0; i < effectiveAnswerKeys.length; i += chunkSize) {
        chunks.push(effectiveAnswerKeys.slice(i, i + chunkSize));
      }

      return (
        <div className="w-full mt-auto pt-2 shrink-0 select-none">
          <div
            className="border bg-white dark:bg-slate-900 shadow-2xs overflow-hidden"
            style={{ borderColor: `${effectivePrimary}60` }}
          >
            <div
              className="p-1 border-b flex items-center justify-between text-[7.5px]"
              style={{ backgroundColor: `${effectivePrimary}16`, borderColor: `${effectivePrimary}35` }}
            >
              <span className="font-bold uppercase tracking-wider" style={{ color: effectivePrimary }}>
                Resmî Sınav Komisyonu Cevap Matrisi ({docSettings.bookletType || 'A'})
              </span>
              <span className="font-bold font-mono" style={{ color: effectivePrimary }}>{effectiveAnswerKeys.length} Soru</span>
            </div>
            {chunks.map((rowKeys, rIdx) => (
              <div key={rIdx} className={rIdx > 0 ? 'border-t' : ''} style={{ borderColor: `${effectivePrimary}35` }}>
                <div
                  className="flex divide-x text-center text-[7.5px] border-b font-bold"
                  style={{
                    backgroundColor: `${effectivePrimary}10`,
                    borderColor: `${effectivePrimary}35`,
                  }}
                >
                  <div className="w-8 py-0.5 shrink-0" style={{ color: effectivePrimary }}>Soru</div>
                  {rowKeys.map((k) => (
                    <div key={k.q} className="flex-1 py-0.5" style={{ color: effectivePrimary }}>{k.q}</div>
                  ))}
                </div>
                <div
                  className="flex divide-x text-center text-[8px] font-black"
                  style={{ borderColor: `${effectivePrimary}35` }}
                >
                  <div className="w-8 py-0.5 font-bold shrink-0" style={{ color: effectivePrimary, backgroundColor: `${effectivePrimary}12` }}>Cevap</div>
                  {rowKeys.map((k) => (
                    <div key={k.q} className="flex-1 py-0.5" style={{ color: effectivePrimary }}>{k.a}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (keyStyle === 'split-columns') {
      const half = Math.ceil(effectiveAnswerKeys.length / 2);
      const col1 = effectiveAnswerKeys.slice(0, half);
      const col2 = effectiveAnswerKeys.slice(half);

      return (
        <div className="w-full mt-auto pt-2 shrink-0 select-none">
          <div className="grid grid-cols-2 gap-2 text-[7.5px] font-mono">
            <div
              className="p-1.5 rounded border flex flex-col gap-1 shadow-2xs"
              style={{ borderColor: `${effectivePrimary}40`, backgroundColor: `${effectivePrimary}08` }}
            >
              <div className="font-bold border-b pb-0.5 flex justify-between" style={{ color: effectivePrimary, borderColor: `${effectivePrimary}25` }}>
                <span>1. Bölüm (1-{col1.length})</span>
                <span>Kitapçık {docSettings.bookletType || 'A'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {col1.map((item) => (
                  <span key={item.q} className="border bg-white dark:bg-slate-900 px-1 py-0.2 rounded shadow-2xs font-semibold" style={{ borderColor: `${effectivePrimary}40` }}>
                    <span className="font-bold mr-0.5" style={{ color: effectivePrimary }}>{item.q}.</span>
                    <span>{item.a}</span>
                  </span>
                ))}
              </div>
            </div>
            <div
              className="p-1.5 rounded border flex flex-col gap-1 shadow-2xs"
              style={{ borderColor: `${effectivePrimary}40`, backgroundColor: `${effectivePrimary}08` }}
            >
              <div className="font-bold border-b pb-0.5 flex justify-between" style={{ color: effectivePrimary, borderColor: `${effectivePrimary}25` }}>
                <span>2. Bölüm ({half + 1}-{effectiveAnswerKeys.length})</span>
                <span>Kitapçık {docSettings.bookletType || 'A'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {col2.map((item) => (
                  <span key={item.q} className="border bg-white dark:bg-slate-900 px-1 py-0.2 rounded shadow-2xs font-semibold" style={{ borderColor: `${effectivePrimary}40` }}>
                    <span className="font-bold mr-0.5" style={{ color: effectivePrimary }}>{item.q}.</span>
                    <span>{item.a}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default: bottom-strip
    return (
      <div className="w-full mt-auto pt-2 shrink-0 select-none">
        <div
          className="py-1 px-2.5 rounded border text-[7.5px] font-mono font-bold flex items-center justify-between flex-wrap gap-1 shadow-2xs"
          style={{ borderColor: `${effectivePrimary}45`, backgroundColor: `${effectivePrimary}08` }}
        >
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: effectivePrimary }} />
            <span style={{ color: effectivePrimary }}>CEVAP ANAHTARI ({docSettings.bookletType || 'A'} - {effectiveAnswerKeys.length} Soru):</span>
          </span>
          <span className="tracking-wide flex flex-wrap items-center gap-1 font-bold">
            {effectiveAnswerKeys.map((item, idx) => (
              <span key={item.q} className="inline-flex items-center">
                <span style={{ color: effectivePrimary }}>{item.q}-</span>
                <span className="text-slate-900 dark:text-slate-100">{item.a}</span>
                {idx < effectiveAnswerKeys.length - 1 && (
                  <span className="mx-1" style={{ color: `${effectivePrimary}60` }}>&middot;</span>
                )}
              </span>
            ))}
          </span>
        </div>
      </div>
    );
  };

  // Render format-tailored content in live preview without squeezing
  const renderPreviewFormatQuestions = () => {
    const currentType = activeBlueprint?.docType || docType || 'written';
    const isTwoCol = docSettings.columnCount === 2;

    const leftColPadding =
      brand.spineDividerStyle === 'badge-text'
        ? 'pr-4 sm:pr-5'
        : brand.spineDividerStyle !== 'none'
        ? 'pr-3 sm:pr-3.5'
        : 'pr-0.5';

    const rightColPadding =
      brand.spineDividerStyle === 'badge-text'
        ? 'pl-4 sm:pl-5'
        : brand.spineDividerStyle !== 'none'
        ? 'pl-3 sm:pl-3.5'
        : 'pl-0.5';

    // If real questions exist in project, dynamically render them in preview!
    if (realQuestions.length > 0) {
      const qItem1 = realQuestions[0];
      const qItem2 = realQuestions[1];

      const renderSingleDynamicQuestion = (q: typeof realQuestions[0], num: number, extraClass = '') => {
        const isMultiple = q.type === 'multiple_choice' || (q.options && q.options.length > 0);
        const qPoints = q.points !== undefined && q.points > 0 ? q.points : defaultQuestionPoints;
        const qLines = q.linesForAnswer || openEndedLines || 4;
        const textFontSize =
          docSettings.fontSizeScale === 'compact'
            ? 'text-[9.5px]'
            : docSettings.fontSizeScale === 'large'
            ? 'text-[12px]'
            : 'text-[10.5px]';

        return (
          <div key={q.id || num} className={`${extraClass} space-y-1.5 pl-0.5`}>
            <div className="flex items-start gap-1.5">
              {renderPreviewQuestionBadge(num)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {q.mebOutcomeText || q.courseName || (isMultiple ? 'Çoktan Seçmeli Soru' : 'Açık Uçlu Soru')}
                  </span>
                  <span className="text-[8.5px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300/40 shrink-0">
                    [{qPoints} Puan]
                  </span>
                </div>
                <p className={`font-bold text-slate-900 dark:text-slate-100 ${textFontSize} leading-snug mt-0.5`}>
                  {q.text}
                </p>
              </div>
            </div>

            {isMultiple && q.options && q.options.length > 0 && (
              renderPreviewOptions(q.options)
            )}

            {!isMultiple && (
              <div className="pt-1 pl-3">
                <div className="text-[7.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Çözüm ve Yanıt Alanı ({qLines} Satır):
                </div>
                {brand.answerAreaStyle === 'lined' && (
                  <div className="space-y-1.5 py-0.5">
                    {Array.from({ length: qLines }).map((_, li) => (
                      <div key={li} className="border-b border-dashed border-slate-300 w-full" />
                    ))}
                  </div>
                )}
                {brand.answerAreaStyle === 'grid' && (
                  <div
                    className="w-full rounded-none border border-slate-300 bg-white"
                    style={{
                      height: `${Math.max(28, qLines * 9)}px`,
                      backgroundImage: 'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
                      backgroundSize: '8px 8px',
                    }}
                  />
                )}
                {brand.answerAreaStyle === 'dotted' && (
                  <div className="space-y-1.5 py-0.5">
                    {Array.from({ length: qLines }).map((_, li) => (
                      <div key={li} className="border-b border-dotted border-slate-400 w-full" />
                    ))}
                  </div>
                )}
                {brand.answerAreaStyle === 'clean-box' && (
                  <div
                    className="w-full rounded-none border border-slate-300 bg-white"
                    style={{ height: `${Math.max(28, qLines * 9)}px` }}
                  />
                )}
              </div>
            )}
          </div>
        );
      };

      const lectureNode =
        activeTab === 'instruction_rosette' || currentType === 'lecture'
          ? renderPreviewLectureBlockSample('w-full mb-2')
          : null;

      const q1Node = renderSingleDynamicQuestion(qItem1, 1, 'w-full');
      const q2Node = qItem2
        ? renderSingleDynamicQuestion(qItem2, 2, 'w-full pt-2 border-t border-slate-200 dark:border-slate-700')
        : null;

      return isTwoCol ? (
        <>
          <div className={`${leftColPadding} space-y-2.5 flex-1 min-w-0`}>
            {lectureNode}
            {q1Node}
          </div>
          <div className={`${rightColPadding} space-y-2.5 flex-1 min-w-0`}>
            {q2Node}
          </div>
        </>
      ) : (
        <div className="space-y-3 px-1">
          {lectureNode}
          {q1Node}
          {q2Node}
        </div>
      );
    }

    if (currentType === 'written') {
      const writtenFontSize =
        docSettings.fontSizeScale === 'compact'
          ? 'text-[9.5px]'
          : docSettings.fontSizeScale === 'large'
          ? 'text-[12px]'
          : 'text-[10.5px]';

      const lectureNode = renderPreviewLectureBlockSample('w-full mb-2');

      const q1 = (
        <div className="w-full space-y-1.5 pl-0.5">
          <div className="flex items-start gap-1.5">
            {renderPreviewQuestionBadge(1)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  Kazanım Senaryosu &middot; Açık Uçlu
                </span>
                <span className="text-[8.5px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300/40 shrink-0">
                  [{defaultQuestionPoints} Puan]
                </span>
              </div>
              <p className={`font-bold text-slate-900 ${writtenFontSize} leading-snug mt-0.5`}>
                Birinci dereceden iki bilinmeyenli 2x + 3y = 18 ve x - y = 4 denklem sisteminin çözüm kümesini işlem basamaklarını göstererek bulunuz.
              </p>
            </div>
          </div>

          {/* Açık Uçlu Çözüm Alanı */}
          <div className="pt-1 pl-3">
            <div className="text-[7.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Çözüm ve Yanıt Alanı ({openEndedLines} Satır):
            </div>
            {brand.answerAreaStyle === 'lined' && (
              <div className="space-y-1.5 py-0.5">
                {Array.from({ length: openEndedLines }).map((_, li) => (
                  <div key={li} className="border-b border-dashed border-slate-300 w-full" />
                ))}
              </div>
            )}
            {brand.answerAreaStyle === 'grid' && (
              <div
                className="w-full rounded-none border border-slate-300 bg-white"
                style={{
                  height: `${Math.max(28, openEndedLines * 9)}px`,
                  backgroundImage: 'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
                  backgroundSize: '8px 8px',
                }}
              />
            )}
            {brand.answerAreaStyle === 'dotted' && (
              <div className="space-y-1.5 py-0.5">
                {Array.from({ length: openEndedLines }).map((_, li) => (
                  <div key={li} className="border-b border-dotted border-slate-400 w-full" />
                ))}
              </div>
            )}
            {brand.answerAreaStyle === 'clean-box' && (
              <div
                className="w-full rounded-none border border-slate-300 bg-white"
                style={{ height: `${Math.max(28, openEndedLines * 9)}px` }}
              />
            )}
          </div>
        </div>
      );

      const q2 = (
        <div className="w-full space-y-1.5">
          <div className="flex items-start gap-1.5">
            {renderPreviewQuestionBadge(2)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  Çoktan Seçmeli Analiz Sorusu
                </span>
                <span className="text-[8.5px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 shrink-0">
                  [{defaultQuestionPoints} Puan]
                </span>
              </div>
              <p className={`font-bold text-slate-900 ${writtenFontSize} leading-snug mt-0.5`}>
                Aşağıdaki ifadelerden hangisi fonksiyon olma koşulunu kesinlikle sağlar?
              </p>
            </div>
          </div>
          {renderPreviewOptions(['A) Tanım kümesinde açıkta eleman kalmamalıdır.', 'B) Değer kümesindeki her eleman eşleşmelidir.', 'C) Bire bir olmak zorundadır.', 'D) Örten olmak zorundadır.'])}
        </div>
      );

      return isTwoCol ? (
        <>
          <div className={`${leftColPadding} space-y-2.5 flex-1 min-w-0`}>
            {lectureNode}
            {q1}
          </div>
          <div className={`${rightColPadding} space-y-2.5 flex-1 min-w-0`}>
            {q2}
          </div>
        </>
      ) : (
        <div className="space-y-3 px-1">
          {lectureNode}
          {q1}
          {q2}
        </div>
      );
    }

    if (currentType === 'lecture') {
      const summaryBox = renderPreviewLectureBlockSample('w-full mb-2');

      const example1 = (
        <div className="w-full space-y-1.5 pl-0.5">
          <div className="flex items-start gap-1.5">
            <span
              className="px-1.5 py-0.2 text-[8px] font-black rounded-xs text-white uppercase shrink-0 mt-0.5"
              style={{ backgroundColor: effectivePrimary }}
            >
              ÖRNEK 1
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-[10.5px] leading-snug">
                Periyodu 0,2 saniye olan dalga kaynağının hızı 20 cm/s ise dalga boyu kaç cm&apos;dir?
              </p>
              <div className="mt-1 p-1.5 rounded bg-slate-100/90 text-[9.5px] text-slate-700 font-mono">
                <strong>Çözüm:</strong> &lambda; = v &middot; T = 20 &middot; 0,2 = 4 cm.
              </div>
            </div>
          </div>
        </div>
      );

      const practiceQ = (
        <div className="w-full space-y-1.5">
          <div className="flex items-start gap-1.5">
            {renderPreviewQuestionBadge(1)}
            <div className="flex-1 min-w-0">
              <span className="text-[8.5px] font-bold block uppercase" style={{ color: effectivePrimary }}>Sıra Sizde / Pekiştirme Sorusu</span>
              <p className="font-bold text-slate-900 text-[10.5px] leading-snug mt-0.5">
                Aynı ortamda f_K / f_L = 2 olduğuna göre dalga boyları oranı &lambda;_K / &lambda;_L kaçtır?
              </p>
            </div>
          </div>
          {renderPreviewOptions(['A) 1/4', 'B) 1/2', 'C) 1', 'D) 2', 'E) 4'])}
        </div>
      );

      return isTwoCol ? (
        <>
          <div className={`${leftColPadding} space-y-2.5 flex-1 min-w-0`}>
            {summaryBox}
            {example1}
          </div>
          <div className={`${rightColPadding} space-y-2.5 flex-1 min-w-0`}>
            {practiceQ}
          </div>
        </>
      ) : (
        <div className="space-y-3 px-1">
          {summaryBox}
          {example1}
          {practiceQ}
        </div>
      );
    }

    if (currentType === 'exam') {
      const lectureNode =
        activeTab === 'instruction_rosette'
          ? renderPreviewLectureBlockSample('w-full mb-2')
          : null;

      const q1 = (
        <div className="w-full space-y-1.5 pl-0.5">
          <div className="flex items-start gap-1.5">
            {renderPreviewQuestionBadge(1)}
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-snug text-[10px] text-slate-800">
                Yazar, çocukluk yıllarında edindiği deneyimleri aktardığı romanında bireyin toplumla kurduğu bağı sorguluyor.
              </p>
              <p className="font-bold mt-0.5 text-slate-900 text-[10.5px] leading-snug">
                Bu parçadaki altı çizili ifadenin cümleye kattığı anlam aşağıdakilerden hangisidir?
              </p>
            </div>
          </div>
          {renderPreviewOptions(['A) Kendi gözlemlerine dayanmıştır.', 'B) Geleceğe dair umutları vardır.', 'C) Olayları nesnel dille aktarmıştır.', 'D) Hayal gücünden yararlanmıştır.'])}
        </div>
      );

      const q2 = (
        <div className="w-full space-y-1.5">
          <div className="flex items-start gap-1.5">
            {renderPreviewQuestionBadge(2)}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-[10.5px] leading-snug">
                İki basamaklı ab doğal sayısı rakamları toplamının 7 katına eşitse a + b kaçtır?
              </p>
            </div>
          </div>
          {renderPreviewOptions(['A) 6', 'B) 8', 'C) 9', 'D) 12', 'E) 15'])}
        </div>
      );

      return isTwoCol ? (
        <>
          <div className={`${leftColPadding} space-y-2.5 flex-1 min-w-0`}>
            {lectureNode}
            {q1}
          </div>
          <div className={`${rightColPadding} space-y-2.5 flex-1 min-w-0`}>
            {q2}
          </div>
        </>
      ) : (
        <div className="space-y-3 px-1">
          {lectureNode}
          {q1}
          {q2}
        </div>
      );
    }

    // Default: Test & Soru Bankası
    const defaultLectureNode =
      activeTab === 'instruction_rosette'
        ? renderPreviewLectureBlockSample('w-full mb-2')
        : null;

    const defaultQ1 = (
      <div className="w-full space-y-1.5 pl-0.5">
        <div className="flex items-start gap-1.5">
          {renderPreviewQuestionBadge(1)}
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-snug text-[10px] text-slate-800">
              Yazar, küçük yaşlarda dinlediği masallardan etkilenerek kaleme aldığı kitabında doğayı korumanın önemini anlatıyor.
            </p>
            <p className="font-bold mt-0.5 text-slate-900 text-[10.5px] leading-snug">
              Bu parçada aşağıdaki sözcüklerden hangisi zarf-fiil görevinde <u>kullanılmıştır</u>?
            </p>
          </div>
        </div>
        {renderPreviewOptions(['A) dinlediği', 'B) etkilenerek', 'C) korumanın', 'D) düşündüren'])}
      </div>
    );

    const defaultQ2 = (
      <div className="w-full space-y-1.5">
        <div className="flex items-start gap-1.5">
          {renderPreviewQuestionBadge(2)}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-[10.5px] leading-snug">
              Aşağıdaki cümlelerin hangisinde fiilimsinin üç türüne de örnek yer almaktadır?
            </p>
          </div>
        </div>
        {renderPreviewOptions([
          'A) Erkenden kalkıp pencereyi açınca kuşları dinledi.',
          'B) Okuduğu kitabı bitirmek için sessizce masaya oturdu.',
          'C) Gülerek gelen çocuk, düşen kalemini aldı.',
        ])}
      </div>
    );

    return isTwoCol ? (
      <>
        <div className={`${leftColPadding} space-y-2.5 flex-1 min-w-0`}>
          {defaultLectureNode}
          {defaultQ1}
        </div>
        <div className={`${rightColPadding} space-y-2.5 flex-1 min-w-0`}>
          {defaultQ2}
        </div>
      </>
    ) : (
      <div className="space-y-3 px-1">
        {defaultLectureNode}
        {defaultQ1}
        {defaultQ2}
      </div>
    );
  };

  return (
    <div
      className={`flex-1 h-full min-h-0 flex flex-col overflow-hidden select-none font-sans transition-colors ${
        isDark ? 'bg-[#181a20] text-[#e5e8ef]' : 'bg-[#f4f5f8] text-slate-900'
      }`}
    >
      {/* 1. MINIMAL & COMPACT UNIFIED COMMAND BAR */}
      <header
        className={`shrink-0 z-40 border-b px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2.5 backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#1e212b]/95 border-[#2c303c]'
            : 'bg-white/95 border-slate-200/90 shadow-2xs'
        }`}
      >
        {/* Left: Navigation + Format Switcher */}
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-visible relative">
          <button
            type="button"
            onClick={onOpenHome}
            className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              isDark
                ? 'border-[#383f4f] bg-[#242833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-2xs'
            }`}
            title="Ana Sayfa"
            aria-label="Ana Sayfa"
          >
            <Home className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#343a49] shrink-0 mx-0.5" />

          {/* Format Açılır Menüsü (Dropdown) */}
          <div className="relative shrink-0" ref={formatDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFormatDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isFormatDropdownOpen
                  ? 'border-stone-400 dark:border-stone-500 ring-2 ring-stone-400/20 bg-stone-100 dark:bg-[#2c313f] text-stone-900 dark:text-stone-100'
                  : isDark
                  ? 'border-[#383f4f] bg-[#242833] text-[#d6dae4] hover:bg-[#2c313f] hover:text-white'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900'
              }`}
              title="Tasarım formatını değiştirmek için tıklayın"
            >
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Format:
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: activeBlueprint.brand?.primaryColor || '#1e293b' }}
              />
              {(() => {
                const ActiveIcon =
                  activeBlueprint.docType === 'written'
                    ? GraduationCap
                    : activeBlueprint.docType === 'test'
                    ? FileText
                    : activeBlueprint.docType === 'lecture'
                    ? BookOpen
                    : activeBlueprint.docType === 'exam'
                    ? Award
                    : activeBlueprint.docType === 'question_bank'
                    ? Layers
                    : Sparkles;
                return <ActiveIcon className="h-3.5 w-3.5 text-stone-700 dark:text-stone-300 shrink-0" />;
              })()}
              <span className="font-bold truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px]">
                {activeBlueprint.title}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  isFormatDropdownOpen ? 'rotate-180 text-stone-700 dark:text-stone-300' : ''
                }`}
              />
            </button>

            {/* Backdrop overlay for reliable outside click */}
            {isFormatDropdownOpen && (
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsFormatDropdownOpen(false)}
              />
            )}

            {/* Açılır Menü Paneli */}
            {isFormatDropdownOpen && (
              <div
                className={`absolute left-0 mt-1.5 w-72 sm:w-80 rounded-xl border shadow-2xl z-50 overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-[#1e212b] border-[#343a49] text-[#e5e8ef]'
                    : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
                }`}
              >
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-[#2c303c] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Tasarım Formatı Seç</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-[#2b303c] text-slate-500 dark:text-slate-400">
                        {blueprints.length}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-400 mt-0.5">
                      Her format için bağımsız sayfa & soru tasarımı
                    </p>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                  {blueprints.map((bp) => {
                    const isSelected = bp.id === selectedFormatId;
                    const ItemIcon =
                      bp.docType === 'written'
                        ? GraduationCap
                        : bp.docType === 'test'
                        ? FileText
                        : bp.docType === 'lecture'
                        ? BookOpen
                        : bp.docType === 'exam'
                        ? Award
                        : bp.docType === 'question_bank'
                        ? Layers
                        : Sparkles;
                    return (
                      <div
                        key={bp.id}
                        className={`group flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-[#252936] text-stone-900 dark:text-white font-bold border border-stone-300 dark:border-[#383f50]'
                            : isDark
                            ? 'hover:bg-[#252934] text-slate-300 hover:text-white border border-transparent'
                            : 'hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 border border-transparent'
                        }`}
                        onClick={() => {
                          handleSelectFormat(bp.id);
                          setIsFormatDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: `${bp.brand?.primaryColor || '#1e293b'}15`,
                              color: bp.brand?.primaryColor || '#1e293b',
                            }}
                          >
                            <ItemIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs truncate">{bp.title}</span>
                              {bp.isCustom && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                                  Özel
                                </span>
                              )}
                            </div>
                            <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block truncate">
                              {bp.description ||
                                (bp.docType === 'written'
                                  ? 'Ortak Yazılı Sınav Formatı'
                                  : bp.docType === 'test'
                                  ? 'Kazanım & Yaprak Test Formatı'
                                  : bp.docType === 'lecture'
                                  ? 'Ders & Konu Anlatım Föyü'
                                  : bp.docType === 'exam'
                                  ? 'Kurumsal Deneme Sınavı'
                                  : 'Soru Bankası & Fasikül')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: bp.brand?.primaryColor || '#1e293b' }}
                            title="Format Ana Rengi"
                          />
                          {isSelected && (
                            <Check className="h-4 w-4 text-stone-900 dark:text-white stroke-[2.5]" />
                          )}
                          {bp.isCustom && onDeleteBlueprint && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteBlueprint(bp.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-500/10 transition-colors ml-1 cursor-pointer"
                              title="Bu özel formatı sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-[#2c303c] bg-slate-50/50 dark:bg-[#1a1c23]/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormatDropdownOpen(false);
                      setIsNewFormatModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#252936] border border-dashed border-stone-300 dark:border-stone-700 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>+ Yeni Format Şablonu Oluştur</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Format Actions & Save to Document */}
        <div className="flex items-center gap-1.5 shrink-0">
          {formatSaveToast && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="max-w-[150px] truncate">{formatSaveToast}</span>
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSaveActiveFormatBlueprint}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-stone-100 hover:bg-white text-stone-900 shadow-xs'
                  : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
              }`}
              title="Bu format için yaptığınız tasarımı kaydedin"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Formatı Kaydet</span>
            </button>

            <button
              type="button"
              onClick={handleResetActiveFormat}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'border-[#343a49] bg-[#252934] text-[#cbd1de] hover:bg-[#2b303e] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
              title="Bu formatı orijinal varsayılanına sıfırla"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDuplicateActiveFormat}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'border-[#343a49] bg-[#252934] text-[#cbd1de] hover:bg-[#2b303e] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
              title="Bu format şablonundan bir kopya oluştur"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#343a49] shrink-0 mx-0.5" />

          <button
            type="button"
            onClick={onOpenEditor}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              isDark
                ? 'border-[#383e4e] bg-[#232733] hover:bg-[#2b3140] text-stone-200'
                : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-700 shadow-2xs'
            }`}
            title="Soru düzenleyiciye dön"
          >
            <span>Soru Editörüne Dön</span>
          </button>
        </div>
      </header>

      {/* 2. Main Page Grid - Strictly Screen-Fit without page scrolling */}
      <main className="flex-1 min-h-0 w-full max-w-[1750px] mx-auto px-2 sm:px-4 py-2 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3.5 items-stretch h-full min-h-0">
          {/* LEFT: Tasarım Araçları Studio Sidebar (Unified Motion Animated Sidebar) */}
          <motion.aside
            initial={false}
            animate={{
              width: isToolsSidebarOpen ? (isDesktop ? 510 : '100%') : 64,
            }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 34,
              mass: 0.8,
            }}
            className="shrink-0 flex rounded-2xl border bg-white dark:bg-[#1a1d26] border-slate-200/90 dark:border-[#2b303d] shadow-sm overflow-hidden h-full min-h-0 z-20"
          >
            {/* PRIMARY TOOL RAIL (64px width - always accessible & responsive) */}
            <div className="w-16 shrink-0 flex flex-col items-center justify-between py-2.5 border-r bg-slate-50/80 dark:bg-[#151720] border-slate-200/80 dark:border-[#272b37] z-10 select-none">
              <div className="flex flex-col items-center gap-1 w-full px-1">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 py-1 text-center">
                  Araçlar
                </div>
                {TOOL_CATEGORIES.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        if (!isToolsSidebarOpen) {
                          setIsToolsSidebarOpen(true);
                        }
                      }}
                      className={`group relative w-12 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'text-white'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-[#222634]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                      title={`${tab.label} · ${tab.sub}`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeTabRailIndicator"
                          className="absolute inset-0 bg-stone-900 dark:bg-[#2d3240] rounded-xl -z-10 shadow-xs ring-1 ring-black/10 dark:ring-white/10"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <Icon
                        className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                          isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}
                      />
                      <span className="text-[8.5px] font-bold tracking-tight mt-0.5 line-clamp-1 max-w-[44px] text-center leading-none">
                        {tab.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom of Rail: Collapse / Expand trigger */}
              <div className="pt-2 w-full px-1 border-t border-slate-200/60 dark:border-[#272b37] flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setIsToolsSidebarOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#222634] transition-colors cursor-pointer"
                  title={isToolsSidebarOpen ? 'Tasarım Panelini Kapat / Daralt' : 'Tasarım Panelini Aç'}
                >
                  <motion.div
                    animate={{ rotate: isToolsSidebarOpen ? 0 : 180 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </motion.div>
                </button>
              </div>
            </div>

            {/* SECONDARY TOOL INSPECTOR (Active Tool Options with Smooth Slide / Fade) */}
            <AnimatePresence initial={false}>
              {isToolsSidebarOpen && (
                <motion.div
                  key="inspector-panel"
                  initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.8 }}
                  className="flex-1 min-w-[380px] sm:min-w-[420px] flex flex-col h-full bg-white dark:bg-[#1a1d26] overflow-hidden"
                >
                  {/* Inspector Header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-[#272b37] flex items-center justify-between gap-2 shrink-0 bg-white/60 dark:bg-[#1a1d26]/60 backdrop-blur-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {(() => {
                        const activeCategory = TOOL_CATEGORIES.find((t) => t.id === activeTab) || TOOL_CATEGORIES[0];
                        const ActiveIcon = activeCategory.icon;
                        return (
                          <>
                            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#252936] text-stone-800 dark:text-stone-200 flex items-center justify-center shrink-0 border border-stone-200/80 dark:border-[#383f50]">
                              <ActiveIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {activeCategory.label}
                              </h2>
                              <p className="text-[10px] text-slate-400 truncate">
                                {activeCategory.sub}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsToolsSidebarOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#242936] transition-colors cursor-pointer shrink-0"
                      title="Paneli Kapat"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Inspector Scrollable Body with smooth tab fade transition */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
              {/* TAB 1: BAŞLIK MİZANPAJLARI (12 Seçkin Model) */}
              {activeTab === 'headers' && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <Type className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Yayınevi ve Sınav Başlık Mizanpajları
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Türkiye&apos;nin önde gelen soru bankaları, modüler fasikülleri, bursluluk denemeleri ve resmî sınavlarından 12 özgün başlık modeli.
                    </p>
                  </div>

                  {/* 1. BAŞLIK METİNLERİ VE BİLGİLERİ (Doğrudan Başlık Üzerine Yansıyan Canlı Metinler) */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2d3240] bg-slate-50/70 dark:bg-[#1a1d26]/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3240] pb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Type className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" />
                        Başlık Metinleri ve Bilgileri (Canlı Düzenleme)
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Sağdaki sayfada anında değişir
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Sınav / Belge Ana Başlığı:
                        </label>
                        <input
                          type="text"
                          value={docSettings.title || ''}
                          onChange={(e) => onDocSettingsChange({ ...docSettings, title: e.target.value })}
                          placeholder="örn: 1. DÖNEM 1. ORTAK YAZILI SINAVI veya TYT DENEME"
                          className="w-full rounded-lg border border-slate-300 dark:border-[#343a49] bg-white dark:bg-[#1f232c] px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-stone-500 dark:focus:border-stone-400 transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Alt Başlık / Konu / Test Türü:
                          </label>
                          <input
                            type="text"
                            value={brand.testBandTitle || docSettings.termInfo || ''}
                            onChange={(e) => {
                              updateBrand({ testBandTitle: e.target.value });
                              onDocSettingsChange({ ...docSettings, termInfo: e.target.value });
                            }}
                            placeholder="örn: KAZANIM KAVRAMA TESTİ"
                            className="w-full rounded-lg border border-slate-300 dark:border-[#343a49] bg-white dark:bg-[#1f232c] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-stone-500 dark:focus:border-stone-400 shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Ders &amp; Sınıf Seviyesi:
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={docSettings.courseName || ''}
                              onChange={(e) => onDocSettingsChange({ ...docSettings, courseName: e.target.value })}
                              placeholder="Ders (TÜRKÇE)"
                              className="w-1/2 rounded-lg border border-slate-300 dark:border-[#343a49] bg-white dark:bg-[#1f232c] px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-stone-500 dark:focus:border-stone-400 shadow-2xs"
                            />
                            <input
                              type="text"
                              value={docSettings.gradeLevel || ''}
                              onChange={(e) => onDocSettingsChange({ ...docSettings, gradeLevel: e.target.value })}
                              placeholder="Sınıf (8. SINIF)"
                              className="w-1/2 rounded-lg border border-slate-300 dark:border-[#343a49] bg-white dark:bg-[#1f232c] px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-stone-500 dark:focus:border-stone-400 shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Kurum / Yayın Adı <span className="font-normal text-slate-400 dark:text-slate-500">(İsteğe Bağlı)</span>:
                          </label>
                          <input
                            type="text"
                            value={brand.instituteName || ''}
                            onChange={(e) => updateBrand({ instituteName: e.target.value })}
                            placeholder="İsteğe bağlı (boş bırakabilirsiniz)"
                            className="w-full rounded-lg border border-slate-300 dark:border-[#343a49] bg-white dark:bg-[#1f232c] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-stone-500 dark:focus:border-stone-400 shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Alt Birim / Zümre / Şube:
                          </label>
                          <input
                            type="text"
                            value={brand.subTitle || brand.branch || ''}
                            onChange={(e) => updateBrand({ subTitle: e.target.value, branch: e.target.value })}
                            placeholder="örn: Zümre Başkanlığı / Türkçe Bölümü"
                            className="w-full rounded-lg border border-slate-300 dark:border-[#343a49] bg-white dark:bg-[#1f232c] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-stone-500 dark:focus:border-stone-400 shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="pt-0.5">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Öğretmen / Yazar / Hazırlayan:
                        </label>
                        <input
                          type="text"
                          value={brand.teacherName || ''}
                          onChange={(e) => updateBrand({ teacherName: e.target.value })}
                          placeholder="örn: Türkçe Zümresi / Ad Soyad"
                          className="w-full rounded-lg border border-slate-300 dark:border-[#343a49] bg-white dark:bg-[#1f232c] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-stone-500 dark:focus:border-stone-400 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. BAŞLIK MİZANPAJ MODELLERİ */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      2. Yayınevi Başlık Tasarım Modeli Seçin:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PUBLISHER_HEADER_ARCHITECTURES.map((model) => {
                      const isSelected = brand.headerStyle === model.id;
                      return (
                        <div
                          key={model.id}
                          onClick={() => handleSelectHeaderArchitecture(model)}
                          className={`rounded-xl border p-2 transition-all cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                              : isDark
                              ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                              : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                          }`}
                        >
                          <div className="space-y-1.5">
                            {/* Visual Miniature Layout Diagram */}
                            {renderMiniHeaderDiagram(model.id)}

                            <div className="flex items-center justify-between gap-1 pt-1">
                              <h3 className="text-[11px] font-bold text-slate-900 dark:text-[#f0f2f5] truncate">
                                {model.title.replace(/^Model\s+\d+:\s*/, '')}
                              </h3>
                              {isSelected && (
                                <span className="h-4 w-4 rounded-full bg-stone-900 text-white dark:bg-white dark:text-stone-900 flex items-center justify-center shrink-0">
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 dark:text-[#8d96a7] block truncate">
                              {model.badge}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>

                  {/* Başlık Alanları Aç / Kapat & Hızlı Düzenleme (Tüm Modellerde Ortak) */}
                  <div className="pt-4 border-t border-slate-200 dark:border-[#2c313d] space-y-2.5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Tüm Başlıklarda Ortak İçerik &amp; Alan Kontrolleri
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-[#949dae]">
                        Aşağıdaki alanların tümü 12 başlık modelinin tamamında eksiksiz ve standart olarak bulunur. İstemediğiniz alanları tek tıkla gizleyebilir veya kaldırabilirsiniz.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        {
                          key: 'showLogo' as const,
                          label: 'Kurumsal Logo',
                          desc: 'Başlıkta logo alanı',
                          active: brand.showLogo !== false,
                        },
                        {
                          key: 'showCourseGrade' as const,
                          label: 'Ders & Sınıf',
                          desc: 'Ders ve kademe rozeti',
                          active: brand.showCourseGrade !== false,
                        },
                        {
                          key: 'showTeacherInfo' as const,
                          label: 'Öğretmen / Zümre',
                          desc: 'Yazar veya zümre adı',
                          active: brand.showTeacherInfo !== false,
                        },
                        {
                          key: 'showDuration' as const,
                          label: 'Sınav Süresi',
                          desc: 'Dakika süresi rozeti',
                          active: brand.showDuration !== false,
                        },
                        {
                          key: 'showTestNumberBadge' as const,
                          label: 'Kitapçık & Test No',
                          desc: 'A / B kitapçık damgası',
                          active: brand.showTestNumberBadge !== false,
                        },
                        {
                          key: 'showInstructionBox' as const,
                          label: 'Kılavuz / Yönerge Bandı',
                          desc: 'Başlık altı açıklama kutusu',
                          active: Boolean(brand.showInstructionBox),
                        },
                        {
                          key: 'showStudentInfo' as const,
                          label: 'Öğrenci Bilgi Alanı',
                          desc: 'Ad, Soyad, No, Puan satırı',
                          active: Boolean(brand.showStudentInfo),
                        },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => updateBrand({ [item.key]: !item.active })}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            item.active
                              ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#2c3140] text-stone-900 dark:text-white shadow-2xs'
                              : isDark
                              ? 'border-[#343a49] bg-[#222530] opacity-60 hover:opacity-100 hover:border-stone-500'
                              : 'border-slate-200 bg-slate-50 opacity-60 hover:opacity-100 hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5] truncate">
                              {item.label}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                item.active ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {item.active ? 'Açık' : 'Kapalı'}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 line-clamp-1">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Başlık Altı Ayraç & Çizgi Biçimi (Oval, Kavisli, Dalgalı, Çift Çizgi) */}
                  <div className="pt-4 border-t border-slate-200 dark:border-[#2c313d] space-y-2.5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        3. Başlık Altı Ayraç &amp; Çizgi Biçimi (Oval, Kavisli, Dalgalı, Çift Çizgi)
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-[#949dae]">
                        Başlık ile sorular arasına yerleşen ayraç çizgisini oval, kavisli kemer, dalgalı ya da minimalist olarak belirleyin.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {[
                        {
                          id: 'oval-capsule-line' as const,
                          label: 'Oval Kapsül & Gradyan',
                          desc: 'Ortada oval nokta, iki yana süzülen renk',
                          preview: (
                            <div className="flex items-center justify-center gap-1.5 w-full py-1">
                              <div className="h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${effectivePrimary})` }} />
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: effectivePrimary }} />
                              <div className="h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${effectivePrimary}, transparent)` }} />
                            </div>
                          ),
                        },
                        {
                          id: 'curved-arch-line' as const,
                          label: 'Kavisli Yay / Kemer',
                          desc: 'Zarif kavisli kubbe yay çizgisi',
                          preview: (
                            <svg className="w-full h-3 my-0.5" viewBox="0 0 100 12" fill="none">
                              <path d="M5 10 Q 50 -2 95 10" stroke={effectivePrimary} strokeWidth="1.75" strokeLinecap="round" />
                              <circle cx="50" cy="4" r="2" fill={effectivePrimary} />
                            </svg>
                          ),
                        },
                        {
                          id: 'wavy-line' as const,
                          label: 'Akıcı Dalga Çizgisi',
                          desc: 'S-kavisli organik dalga motifi',
                          preview: (
                            <svg className="w-full h-3 my-0.5" viewBox="0 0 100 10" fill="none">
                              <path d="M5 5 Q 25 0 50 5 T 95 5" stroke={effectivePrimary} strokeWidth="1.75" strokeLinecap="round" />
                            </svg>
                          ),
                        },
                        {
                          id: 'double-pill' as const,
                          label: 'Çift Kapsül Çizgi',
                          desc: 'İki kademeli yumuşak yuvarlak çizgi',
                          preview: (
                            <div className="flex flex-col items-center gap-0.5 w-full py-0.5">
                              <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: `${effectivePrimary}40` }} />
                              <div className="w-2/3 h-0.5 rounded-full" style={{ backgroundColor: effectivePrimary }} />
                            </div>
                          ),
                        },
                        {
                          id: 'circle-medallion-line' as const,
                          label: 'Dairesel Madalyon Rozet',
                          desc: 'Ortada yıldız damgası ve ince çizgi',
                          preview: (
                            <div className="flex items-center justify-center gap-1.5 w-full py-0.5">
                              <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                              <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold" style={{ borderColor: effectivePrimary, color: effectivePrimary }}>✦</div>
                              <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                            </div>
                          ),
                        },
                        {
                          id: 'center-lines' as const,
                          label: 'Klasik Üç Noktalı',
                          desc: 'Merkezden iki yana açılan ofset çizgi',
                          preview: (
                            <div className="flex items-center justify-center gap-2 w-full py-0.5">
                              <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-700" />
                              <span className="text-[7px] font-bold text-slate-400">● ● ●</span>
                              <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-700" />
                            </div>
                          ),
                        },
                        {
                          id: 'clean' as const,
                          label: 'Sade (Çizgisiz)',
                          desc: 'Ferah minimalist boşluk',
                          preview: (
                            <div className="flex items-center justify-center w-full py-1 text-[8px] text-slate-400 italic">
                              (Çizgisiz Sade)
                            </div>
                          ),
                        },
                      ].map((lineItem) => {
                        const isSelected = (brand.subtitleStyle || 'oval-capsule-line') === lineItem.id;
                        return (
                          <button
                            key={lineItem.id}
                            type="button"
                            onClick={() => updateBrand({ subtitleStyle: lineItem.id })}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full flex items-center justify-center py-1">
                              {lineItem.preview}
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[11px] font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">
                                {lineItem.label}
                              </span>
                              {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                            </div>
                            <span className="text-[9px] text-slate-500 dark:text-[#8d96a7] block truncate">
                              {lineItem.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SORU ROZETİ & ŞIK TASARIMLARI */}
              {activeTab === 'badges_options' && (
                <div className="space-y-6 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <CircleDot className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Soru Numarası Rozeti &amp; Şık Tasarımları
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Başlık tasarımınızla uyumlu soru numaralandırma rozetleri ve seçenek şık tipleri.
                    </p>
                  </div>

                  {/* 1. Soru Rozeti Stili */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      1. Soru Numarası Rozet Modeli
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: 'square' as const,
                          label: 'Kare Kutu',
                          preview: (
                            <div className="flex items-center gap-1.5 py-1 px-1 w-full">
                              <span className="w-4 h-4 rounded-none text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-2xs" style={{ backgroundColor: effectivePrimary }}>1</span>
                              <div className="h-1 flex-1 rounded-xs bg-slate-300 dark:bg-slate-600" />
                            </div>
                          ),
                        },
                        {
                          id: 'circle' as const,
                          label: 'Daire Halka',
                          preview: (
                            <div className="flex items-center gap-1.5 py-1 px-1 w-full">
                              <span className="w-4 h-4 rounded-full border-2 text-[9px] font-black flex items-center justify-center shrink-0" style={{ borderColor: effectivePrimary, color: effectivePrimary }}>1</span>
                              <div className="h-1 flex-1 rounded-xs bg-slate-300 dark:bg-slate-600" />
                            </div>
                          ),
                        },
                        {
                          id: 'hexagon' as const,
                          label: 'Altıgen Rozet',
                          preview: (
                            <div className="flex items-center gap-1.5 py-1 px-1 w-full">
                              <span className="w-4 h-4 rounded-xs text-white text-[9px] font-black flex items-center justify-center shrink-0 rotate-6" style={{ backgroundColor: effectivePrimary }}>1</span>
                              <div className="h-1 flex-1 rounded-xs bg-slate-300 dark:bg-slate-600" />
                            </div>
                          ),
                        },
                        {
                          id: 'pill' as const,
                          label: 'İki Tonlu Kapsül',
                          preview: (
                            <div className="flex items-center gap-1.5 py-1 px-1 w-full">
                              <span className="inline-flex rounded-xs overflow-hidden text-[8px] font-bold shrink-0 border" style={{ borderColor: effectivePrimary }}>
                                <span className="px-0.5 text-white" style={{ backgroundColor: effectivePrimary }}>S</span>
                                <span className="px-0.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">01</span>
                              </span>
                              <div className="h-1 flex-1 rounded-xs bg-slate-300 dark:bg-slate-600" />
                            </div>
                          ),
                        },
                        {
                          id: 'simple' as const,
                          label: 'ÖSYM Yalın (1.)',
                          preview: (
                            <div className="flex items-center gap-1.5 py-1 px-1 w-full">
                              <span className="text-[11px] font-black shrink-0" style={{ color: effectivePrimary }}>1.</span>
                              <div className="h-1 flex-1 rounded-xs bg-slate-300 dark:bg-slate-600" />
                            </div>
                          ),
                        },
                      ].map((item) => {
                        const isSelected = (brand.questionBadgeStyle || 'square') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ questionBadgeStyle: item.id })}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full flex items-center justify-center bg-slate-50/80 dark:bg-slate-800/40 rounded p-1 border border-slate-100 dark:border-slate-700/60">
                              {item.preview}
                            </div>
                            <div className="flex items-center justify-between w-full px-0.5">
                              <span className="text-xs font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">{item.label}</span>
                              {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Şık Tasarımı (A, B, C, D, E) */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#2e323e]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      2. Çoktan Seçmeli Şık Tasarımı (A, B, C, D, E)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: 'circle' as const,
                          label: 'Daire Çember',
                          preview: (
                            <div className="flex items-center justify-center gap-1 py-1">
                              {['A', 'B', 'C', 'D'].map((l) => (
                                <span key={l} className="w-4 h-4 rounded-full border text-[8px] font-bold flex items-center justify-center" style={{ borderColor: effectivePrimary, color: effectivePrimary }}>{l}</span>
                              ))}
                            </div>
                          ),
                        },
                        {
                          id: 'circle-fill' as const,
                          label: 'Dolu Daire',
                          preview: (
                            <div className="flex items-center justify-center gap-1 py-1">
                              {['A', 'B', 'C', 'D'].map((l) => (
                                <span key={l} className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center shadow-2xs" style={{ backgroundColor: effectivePrimary }}>{l}</span>
                              ))}
                            </div>
                          ),
                        },
                        {
                          id: 'square' as const,
                          label: 'Kare Kutu',
                          preview: (
                            <div className="flex items-center justify-center gap-1 py-1">
                              {['A', 'B', 'C', 'D'].map((l) => (
                                <span key={l} className="w-4 h-4 rounded-none border text-[8px] font-bold flex items-center justify-center" style={{ borderColor: effectivePrimary, color: effectivePrimary }}>{l}</span>
                              ))}
                            </div>
                          ),
                        },
                        {
                          id: 'bold-letter' as const,
                          label: 'ÖSYM Kalın Harf',
                          preview: (
                            <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                              <span>A)</span><span>B)</span><span>C)</span><span>D)</span>
                            </div>
                          ),
                        },
                        {
                          id: 'soft-card' as const,
                          label: 'Yumuşak Kapsül',
                          preview: (
                            <div className="flex items-center justify-center gap-1 py-1">
                              {['A', 'B', 'C', 'D'].map((l) => (
                                <span key={l} className="px-1 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: `${effectivePrimary}20`, color: effectivePrimary }}>{l}</span>
                              ))}
                            </div>
                          ),
                        },
                      ].map((item) => {
                        const isSelected = (brand.optionStyle || 'circle') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ optionStyle: item.id })}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full flex items-center justify-center bg-slate-50/80 dark:bg-slate-800/40 rounded p-1 border border-slate-100 dark:border-slate-700/60">
                              {item.preview}
                            </div>
                            <div className="flex items-center justify-between w-full px-0.5">
                              <span className="text-xs font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">{item.label}</span>
                              {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SAYFA ÇERÇEVESİ & DİKEY SÜTUN ROZETİ */}
              {activeTab === 'frame_spine' && (
                <div className="space-y-5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <Square className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Sayfa Dış Çerçevesi &amp; Orta Dikey Rozet
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Sayfayı çevreleyen kurumsal bordürler ve çift sütun arasındaki dikey metin rozeti.
                    </p>
                  </div>

                  {/* 1. Dış Sayfa Çerçevesi */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      1. Sayfa Dış Çerçevesi
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: 'none' as const,
                          label: 'Çerçevesiz',
                          preview: (
                            <div className="w-7 h-9 rounded-none border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center">
                              <div className="w-4 h-5 border border-dashed border-slate-200 dark:border-slate-700" />
                            </div>
                          ),
                        },
                        {
                          id: 'full-border' as const,
                          label: 'Tam Kenarlık',
                          preview: (
                            <div className="w-7 h-9 rounded-none bg-white dark:bg-slate-800 flex items-center justify-center p-0.5 border-2" style={{ borderColor: effectivePrimary }}>
                              <div className="w-full h-full border border-slate-200 dark:border-slate-700" />
                            </div>
                          ),
                        },
                        {
                          id: 'corner-accents' as const,
                          label: 'Köşe Vurguları',
                          preview: (
                            <div className="w-7 h-9 rounded-none bg-white dark:bg-slate-800 relative p-0.5 border border-slate-200 dark:border-slate-700">
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l" style={{ borderColor: effectivePrimary }} />
                              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r" style={{ borderColor: effectivePrimary }} />
                              <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l" style={{ borderColor: effectivePrimary }} />
                              <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r" style={{ borderColor: effectivePrimary }} />
                            </div>
                          ),
                        },
                        {
                          id: 'top-bottom-bars' as const,
                          label: 'Üst-Alt Şerit',
                          preview: (
                            <div className="w-7 h-9 rounded-none bg-white dark:bg-slate-800 flex flex-col justify-between border-x border-slate-200 dark:border-slate-700 border-t-2 border-b-2" style={{ borderTopColor: effectivePrimary, borderBottomColor: effectivePrimary }}>
                              <div className="w-full h-full border border-dashed border-slate-200 dark:border-slate-700" />
                            </div>
                          ),
                        },
                      ].map((item) => {
                        const isSelected = (brand.pageFrameStyle || 'none') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ pageFrameStyle: item.id })}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full flex items-center justify-center py-1">
                              {item.preview}
                            </div>
                            <div className="flex items-center justify-between w-full px-0.5">
                              <span className="text-xs font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">{item.label}</span>
                              {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Orta Sütun Ayırıcı & Dikey Metin Rozeti */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#2e323e]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      2. Orta Sütun Ayırıcı &amp; Dikey Rozet Bandı
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        {
                          id: 'none' as const,
                          label: 'Çizgisiz Boşluk',
                          preview: (
                            <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-2 text-[6px] text-slate-400">
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                              <div className="w-2" />
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                            </div>
                          ),
                        },
                        {
                          id: 'solid' as const,
                          label: 'Düz Çizgi',
                          preview: (
                            <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-2 relative">
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                              <div className="h-full w-px" style={{ backgroundColor: effectivePrimary }} />
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                            </div>
                          ),
                        },
                        {
                          id: 'dashed' as const,
                          label: 'Kesikli Çizgi',
                          preview: (
                            <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-2 relative">
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                              <div className="h-full border-l border-dashed border-slate-400" />
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                            </div>
                          ),
                        },
                        {
                          id: 'double' as const,
                          label: 'Çift Çizgi',
                          preview: (
                            <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-2 relative">
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                              <div className="h-full border-l-2 border-double border-slate-500" />
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                            </div>
                          ),
                        },
                        {
                          id: 'badge-text' as const,
                          label: 'Dikey Rozet',
                          preview: (
                            <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-2 relative">
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                              <div className="h-full w-px relative flex items-center justify-center" style={{ backgroundColor: effectivePrimary }}>
                                <span className="px-1 py-0.2 rounded text-[5px] font-bold text-white whitespace-nowrap rotate-90" style={{ backgroundColor: effectivePrimary }}>ROZET</span>
                              </div>
                              <div className="w-4 h-4 rounded-xs bg-slate-100 dark:bg-slate-700" />
                            </div>
                          ),
                        },
                      ].map((item) => {
                        const isSelected = (brand.spineDividerStyle || 'solid') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ spineDividerStyle: item.id })}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full flex items-center justify-center py-0.5">
                              {item.preview}
                            </div>
                            <div className="flex items-center justify-between w-full px-0.5">
                              <span className="text-[11px] font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">{item.label}</span>
                              {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Dikey Rozet Metni */}
                    {brand.spineDividerStyle === 'badge-text' && (
                      <div className="pt-2 animate-in fade-in-50">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                          Dikey Çizgi Üstü Rozet Metni:
                        </span>
                        <input
                          type="text"
                          value={brand.spineText || '◄ TÜRKÇE SORU BANKASI · KAZANIM ODAKLI ►'}
                          onChange={(e) => updateBrand({ spineText: e.target.value })}
                          placeholder="örn: ◄ TÜRKÇE SORU BANKASI ►"
                          className={`w-full rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            isDark ? 'border-[#343a49] bg-[#181a20] text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ÖZEL NOT BANDI & KİTAPÇIK ROZETİ */}
              {activeTab === 'instruction_rosette' && (
                <div className="space-y-5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <Bookmark className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Not &amp; Form Bloğu Tasarımı (Ders Notu, Formül &amp; Sınav Formu)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Konu anlatım föy ders notları, formül kutuları, öğrenci sınav not &amp; bilgi formları ve kitapçık damgası seçenekleri.
                    </p>
                  </div>

                  {/* 1. Özel Not / Duyuru Kutusu */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        1. Başlık Altı Özel Not / Duyuru Bandı (İsteğe Bağlı)
                      </label>
                      <input
                        type="checkbox"
                        checked={Boolean(brand.showInstructionBox)}
                        onChange={(e) => updateBrand({ showInstructionBox: e.target.checked })}
                        className="h-4 w-4 rounded accent-stone-800 dark:accent-stone-200 cursor-pointer"
                      />
                    </div>

                    {brand.showInstructionBox && (
                      <div className="space-y-2.5 animate-in fade-in-50">
                        <input
                          type="text"
                          value={brand.instructionBoxText || ''}
                          onChange={(e) => updateBrand({ instructionBoxText: e.target.value })}
                          placeholder="Örn: Başarılar dileriz... veya 1. Dönem Ortak Sınavı"
                          className={`w-full rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            isDark ? 'border-[#343a49] bg-[#181a20] text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
                          }`}
                        />

                        {/* Duyuru Bandı Tasarım Şablonları */}
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                            Duyuru Bandı Tasarım Şablonu:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              {
                                id: 'classic-border' as const,
                                label: 'İnce Çerçeveli',
                                preview: (
                                  <div className="w-full py-1 px-1 rounded text-[7px] text-center border font-semibold" style={{ borderColor: `${effectivePrimary}50`, backgroundColor: `${effectivePrimary}08`, color: effectivePrimary }}>
                                    Duyuru Metni
                                  </div>
                                ),
                              },
                              {
                                id: 'modern-pill' as const,
                                label: 'Oval Kapsül',
                                preview: (
                                  <div className="w-full py-1 px-1 rounded-full text-[7px] text-center border font-bold" style={{ borderColor: `${effectivePrimary}50`, backgroundColor: `${effectivePrimary}15`, color: effectivePrimary }}>
                                    ✦ Duyuru ✦
                                  </div>
                                ),
                              },
                              {
                                id: 'highlight-callout' as const,
                                label: 'Sol Vurgulu',
                                preview: (
                                  <div className="w-full py-1 px-1 text-[7px] text-left border-l-2 font-bold" style={{ borderLeftColor: effectivePrimary, backgroundColor: `${effectivePrimary}10`, color: effectivePrimary }}>
                                    ! Duyuru
                                  </div>
                                ),
                              },
                              {
                                id: 'subtle-fill' as const,
                                label: 'Dolgun Renkli',
                                preview: (
                                  <div className="w-full py-1 px-1 rounded text-[7px] text-center font-bold text-white" style={{ backgroundColor: effectivePrimary }}>
                                    Duyuru Metni
                                  </div>
                                ),
                              },
                            ].map((bStyle) => {
                              const isSelected = (brand.instructionBoxStyle || 'classic-border') === bStyle.id;
                              return (
                                <button
                                  key={bStyle.id}
                                  type="button"
                                  onClick={() => updateBrand({ instructionBoxStyle: bStyle.id })}
                                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                                    isSelected
                                      ? 'border-stone-900 dark:border-stone-100 bg-stone-100 dark:bg-[#282d3b] ring-1 ring-stone-900/15 text-stone-900 dark:text-white'
                                      : isDark
                                      ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                      : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80'
                                  }`}
                                >
                                  <div className="w-full flex items-center justify-center">
                                    {bStyle.preview}
                                  </div>
                                  <span className="text-[10px] font-bold truncate block text-slate-900 dark:text-[#f0f2f5]">{bStyle.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Kitapçık Rozet Biçimi */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#2e323e]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      2. Kitapçık Damgası Stili (A / B)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: 'scalloped' as const,
                          label: 'Dişli Madalyon',
                          preview: (
                            <div className="w-6 h-6 rounded-xs flex items-center justify-center text-[9px] font-black text-white shadow-2xs rotate-45" style={{ backgroundColor: effectivePrimary }}>
                              <span className="-rotate-45">A</span>
                            </div>
                          ),
                        },
                        {
                          id: 'circle' as const,
                          label: 'Halka Çember',
                          preview: (
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black" style={{ borderColor: effectivePrimary, color: effectivePrimary }}>
                              A
                            </div>
                          ),
                        },
                        {
                          id: 'square' as const,
                          label: 'Kare Kutu',
                          preview: (
                            <div className="w-6 h-6 rounded-none flex items-center justify-center text-[9px] font-black text-white shadow-2xs" style={{ backgroundColor: effectivePrimary }}>
                              A
                            </div>
                          ),
                        },
                        {
                          id: 'ribbon' as const,
                          label: 'Köşe Bayrağı',
                          preview: (
                            <div className="relative flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-2xs z-10" style={{ backgroundColor: effectivePrimary }}>A</div>
                              <div className="w-3 h-2 flex justify-between -mt-0.5">
                                <div className="w-1 h-full rotate-12" style={{ backgroundColor: effectivePrimary }} />
                                <div className="w-1 h-full -rotate-12" style={{ backgroundColor: effectivePrimary }} />
                              </div>
                            </div>
                          ),
                        },
                      ].map((item) => {
                        const isSelected = (brand.rosetteStyle || 'circle') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ rosetteStyle: item.id })}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full flex items-center justify-center py-1">
                              {item.preview}
                            </div>
                            <div className="flex items-center justify-between w-full px-0.5">
                              <span className="text-[11px] font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">{item.label}</span>
                              {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Konu Anlatım, Ders Notu & Formül Bloğu Tasarım Modelleri */}
                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-[#2e323e]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        3. Konu Anlatım, Ders Notu &amp; Formül Bloğu Tasarımı
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">5 Farklı Föy / Not Şablonu</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#949dae]">
                      Sorular arasına eklenen föy ders notları, formül/teorem kutuları ve önemli bilgi bloklarının görsel mimarisi.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          id: 'highlight-bar' as const,
                          label: 'Vurgulu Sol Şerit (Klasik)',
                          desc: 'Sol kenarda kalın renkli şerit, hafif pastel zemin, klasik soru bankası & föy tarzı.',
                          preview: (
                            <div className="w-full rounded border border-l-4 p-2 text-[8.5px] bg-slate-50 dark:bg-slate-800" style={{ borderLeftColor: effectivePrimary, borderColor: `${effectivePrimary}40` }}>
                              <div className="font-bold flex items-center gap-1 text-[9px]" style={{ color: effectivePrimary }}>
                                <span>📌</span> Önemli Bilgi / Not
                              </div>
                              <div className="text-[8px] text-slate-500 dark:text-slate-400 mt-0.5">Klasik sol şeritli föy kutusu...</div>
                            </div>
                          ),
                        },
                        {
                          id: 'formula-frame' as const,
                          label: 'Formül Çerçevesi (Matematik)',
                          desc: 'Teknik çift çizgi / kesikli çerçeve, ortalanmış f(x) formül rozeti.',
                          preview: (
                            <div className="w-full rounded-lg border-2 border-dashed p-2 text-[8.5px] bg-slate-50/70 dark:bg-slate-800/60" style={{ borderColor: `${effectivePrimary}70` }}>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-[8px] px-1.5 py-0.2 rounded text-white" style={{ backgroundColor: effectivePrimary }}>f(x) FORMÜL</span>
                                <span className="text-[7.5px] font-bold text-slate-400">Teorem</span>
                              </div>
                              <div className="text-[8px] font-mono text-center my-0.5 font-bold" style={{ color: effectivePrimary }}>a² + b² = c²</div>
                            </div>
                          ),
                        },
                        {
                          id: 'tip-badge' as const,
                          label: 'Oval Kapsül Başlıklı (Fasikül)',
                          desc: 'Oval hap şeklinde yuvarlak başlık rozeti, yumuşak köşeli modern not kartı.',
                          preview: (
                            <div className="w-full rounded-xl border p-2 text-[8.5px] bg-white dark:bg-[#1a1d26] shadow-2xs" style={{ borderColor: `${effectivePrimary}40` }}>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white font-bold text-[7.5px]" style={{ backgroundColor: effectivePrimary }}>
                                <span>💡</span> İpucu &amp; Not
                              </div>
                              <div className="text-[8px] text-slate-500 dark:text-slate-400 mt-0.5">Oval hap başlıklı modern fasikül kartı...</div>
                            </div>
                          ),
                        },
                        {
                          id: 'curved-accent' as const,
                          label: 'Kavisli Üst Şerit (Renkli Föy)',
                          desc: 'Üstte renkli gradyan başlık şeridi, altta ferah beyaz içerik alanı.',
                          preview: (
                            <div className="w-full rounded-lg border overflow-hidden text-[8.5px] bg-white dark:bg-[#1a1d26] shadow-2xs" style={{ borderColor: `${effectivePrimary}40` }}>
                              <div className="px-2 py-0.5 text-white font-black text-[8px] flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${effectivePrimary}, ${effectiveSecondary || effectivePrimary})` }}>
                                <span>⚡ HATIRLATMA</span>
                                <span className="text-[7px] opacity-80">Föy 01</span>
                              </div>
                              <div className="p-1 text-[8px] text-slate-600 dark:text-slate-300">Kavisli üst şeritli renkli modül...</div>
                            </div>
                          ),
                        },
                        {
                          id: 'clean-card' as const,
                          label: 'Minimalist Temiz Kart (Sade)',
                          desc: 'Dikkat dağıtmayan zarif ince çerçeve, başlık altı ince çizgi.',
                          preview: (
                            <div className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-[8.5px] bg-white dark:bg-[#1a1d26]">
                              <div className="font-bold border-b border-slate-200 dark:border-slate-700 pb-0.5 text-[8.5px] text-slate-800 dark:text-slate-200">
                                Özet / Kural
                              </div>
                              <div className="text-[8px] text-slate-500 dark:text-slate-400 mt-0.5">Sade, minimalist zarif çerçeve...</div>
                            </div>
                          ),
                        },
                      ].map((boxItem) => {
                        const isSelected = (brand.lectureBoxStyle || 'highlight-bar') === boxItem.id;
                        return (
                          <button
                            key={boxItem.id}
                            type="button"
                            onClick={() => updateBrand({ lectureBoxStyle: boxItem.id })}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full">
                              {boxItem.preview}
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[11px] font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">
                                {boxItem.label}
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                            </div>
                            <span className="text-[9px] text-slate-500 dark:text-[#8d96a7] block leading-tight">
                              {boxItem.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Sınav Not & Öğrenci Bilgi Formu Bloğu Tasarımı */}
                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-[#2e323e]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        4. Sınav Not &amp; Öğrenci Bilgi Formu Bloğu Tasarımı
                      </label>
                      <input
                        type="checkbox"
                        checked={Boolean(brand.showStudentInfo)}
                        onChange={(e) => updateBrand({ showStudentInfo: e.target.checked })}
                        className="h-4 w-4 rounded accent-stone-800 dark:accent-stone-200 cursor-pointer"
                        title="Öğrenci Not Bilgi Bloğunu Aç / Kapat"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#949dae]">
                      Sayfanın üstünde yer alan Ad-Soyad, Sınıf, No, Puan ve Not kutusu alanının görsel yerleşim tarzı.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          id: 'classic-dotted' as const,
                          label: 'Noktalı Klasik Çizgi',
                          desc: 'Geleneksel noktalı satırlar, ferah ve az yer kaplayan yerleşim.',
                          preview: (
                            <div className="p-1 rounded-none border border-dashed text-[7.5px] space-y-0.5" style={{ borderColor: `${effectivePrimary}60` }}>
                              <div className="flex justify-between">
                                <span><strong style={{ color: effectivePrimary }}>Ad Soyad:</strong> .................</span>
                                <span><strong style={{ color: effectivePrimary }}>No:</strong> ....</span>
                              </div>
                              <div className="flex justify-between">
                                <span><strong style={{ color: effectivePrimary }}>Sınıf/Şube:</strong> ....</span>
                                <span className="font-bold border px-1" style={{ borderColor: effectivePrimary, color: effectivePrimary }}>Puan: [ &nbsp; ]</span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          id: 'table-boxes' as const,
                          label: 'Modern Tablo Kutuları',
                          desc: 'Bölmeli kutucuklar, net çerçeveli kurumsal sınav düzeni.',
                          preview: (
                            <div className="flex border text-[7.5px] rounded-none divide-x overflow-hidden" style={{ borderColor: `${effectivePrimary}70` }}>
                              <div className="flex-1 p-0.5 font-bold" style={{ backgroundColor: `${effectivePrimary}15`, color: effectivePrimary }}>Adı Soyadı: .....</div>
                              <div className="w-12 p-0.5" style={{ color: effectivePrimary }}>No: ...</div>
                              <div className="w-14 p-0.5 text-center font-bold text-white" style={{ backgroundColor: effectivePrimary }}>NOT: [ &nbsp; ]</div>
                            </div>
                          ),
                        },
                        {
                          id: 'badge-capsule' as const,
                          label: 'Oval Kapsül Rozetler',
                          desc: 'Köşesiz oval bilgi hapları, modern fasikül ve yeni nesil deneme tarzı.',
                          preview: (
                            <div className="flex items-center gap-1 text-[7px] flex-wrap">
                              <span className="px-1.5 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: effectivePrimary }}>Ad Soyad: ........</span>
                              <span className="px-1.5 py-0.5 rounded-full border" style={{ borderColor: effectivePrimary, color: effectivePrimary }}>No: ....</span>
                              <span className="px-1.5 py-0.5 rounded-full font-bold text-white" style={{ backgroundColor: effectivePrimary }}>Puan: [ ]</span>
                            </div>
                          ),
                        },
                        {
                          id: 'corner-compact' as const,
                          label: 'Köşe Kompakt Mini Not',
                          desc: 'Sağ üst köşede kare puan kutusu, sol tarafta kompakt tek satır.',
                          preview: (
                            <div className="flex items-center justify-between p-1 rounded border text-[7.5px]" style={{ borderColor: `${effectivePrimary}40` }}>
                              <span><strong>Öğrenci:</strong> ........... &nbsp; <strong>No:</strong> ...</span>
                              <span className="font-bold px-1 rounded text-white" style={{ backgroundColor: effectivePrimary }}>Puan: [ ]</span>
                            </div>
                          ),
                        },
                        {
                          id: 'clean-underline' as const,
                          label: 'Altı Çizgili Minimalist',
                          desc: 'Zarif ince alt çizgiler, sade ve profesyonel ÖSYM formatı.',
                          preview: (
                            <div className="flex items-center justify-between text-[7.5px] border-b pb-0.5" style={{ borderColor: effectivePrimary }}>
                              <span>Öğrenci: _________</span>
                              <span>No: _____</span>
                              <span className="font-bold border px-1" style={{ borderColor: effectivePrimary, color: effectivePrimary }}>Puan: [ ]</span>
                            </div>
                          ),
                        },
                        {
                          id: 'official-meb' as const,
                          label: 'Resmî MEB Ortak Sınav',
                          desc: 'Protokol başlıklı resmî ortak yazılı not şablonu.',
                          preview: (
                            <div className="border text-[7px] rounded overflow-hidden" style={{ borderColor: effectivePrimary }}>
                              <div className="px-1 font-bold text-white truncate" style={{ backgroundColor: effectivePrimary }}>MEB ORTAK SINAV PROTOKOLÜ</div>
                              <div className="p-0.5 flex justify-between">
                                <span>Öğrenci: ........</span>
                                <span>No: ...</span>
                                <span className="font-bold" style={{ color: effectivePrimary }}>Not: [ ]</span>
                              </div>
                            </div>
                          ),
                        },
                      ].map((infoItem) => {
                        const isSelected = (brand.studentInfoStyle || 'classic-dotted') === infoItem.id;
                        return (
                          <button
                            key={infoItem.id}
                            type="button"
                            onClick={() => updateBrand({ studentInfoStyle: infoItem.id, showStudentInfo: true })}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full">
                              {infoItem.preview}
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[11px] font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">
                                {infoItem.label}
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                            </div>
                            <span className="text-[9px] text-slate-500 dark:text-[#8d96a7] block leading-tight">
                              {infoItem.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: YAYINEVİ RENKLERİ & KÂĞIT TONU */}
              {activeTab === 'colors' && (
                <div className="space-y-5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Türkiye Yayınevleri Renk Koleksiyonu
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Başlık, soru rozetleri, çerçeve ve alt bilgiye anında uygulanan uyumlu renk paletleri veya özel hex rengi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PUBLISHER_COLOR_PALETTES.map((pal) => {
                      const isSelected = brand.primaryColor.toLowerCase() === pal.primary.toLowerCase();
                      return (
                        <div
                          key={pal.id}
                          onClick={() => handleApplyPalette(pal)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                              : isDark
                              ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                              : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                          }`}
                        >
                          <div
                            className="h-6 w-full rounded mb-1.5 shadow-xs"
                            style={{ background: pal.gradient }}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold block text-slate-900 dark:text-[#f0f2f5]">
                              {pal.name}
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {pal.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Özel Renk Seçiciler */}
                  <div className="pt-2 border-t border-slate-200 dark:border-[#2e323e] grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Ana Vurgu Rengi:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={brand.primaryColor || '#0284c7'}
                          onChange={(e) => updateBrand({ primaryColor: e.target.value })}
                          className="h-8 w-10 rounded border border-slate-300 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold">{brand.primaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        İkincil / Gradyan Rengi:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={brand.secondaryColor || '#1e3a8a'}
                          onChange={(e) => updateBrand({ secondaryColor: e.target.value })}
                          className="h-8 w-10 rounded border border-slate-300 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold">{brand.secondaryColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kâğıt Dokusu & Rengi */}
                  <div className="pt-2 border-t border-slate-200 dark:border-[#2e323e] space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Baskı Kâğıt Tonu
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'white' as const, label: '1. Hamur Beyaz', desc: 'Net beyaz test kâğıdı' },
                        { id: 'cream' as const, label: 'Enzo / Krem Kitap', desc: 'Göz yormayan kitap kâğıdı' },
                        { id: 'cool' as const, label: 'Açık Gri Ofset', desc: 'Deneme sınavı & gazete' },
                      ].map((item) => {
                        const isSelected = (brand.paperTone || 'white') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ paperTone: item.id })}
                            className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <span className="text-xs font-bold block text-slate-900 dark:text-[#f0f2f5]">{item.label}</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SAYFA NUMARASI & ALT BİLGİ */}
              {activeTab === 'footer' && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <Rows className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Sayfa Numarası &amp; Alt Bilgi Tasarımı
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Sayfa numarası görünümünü bağımsız olarak seçin. Alt kısımda telefon veya cevap anahtarı kalabalığı olmadan temiz ve kurumsal mizanpaj.
                    </p>
                  </div>

                  {/* 1. SAYFA NUMARASI TASARIMI (Ayrı Bağımsız Seçici) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Sayfa Numarası Tasarımı (Ortalı)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: 'centered-hyphen' as const,
                          label: 'Tireli Minimalist',
                          preview: '- 1 -',
                          desc: 'Sade ve klasik',
                        },
                        {
                          id: 'fraction-slash' as const,
                          label: 'Tam Format (Kesirli)',
                          preview: 'Sayfa 1 / 3',
                          desc: 'Sayfa ve toplam adet',
                        },
                        {
                          id: 'double-dash-total' as const,
                          label: 'Çift Tire Kitap Ekolü',
                          preview: '— 1 / 3 —',
                          desc: 'Yayınevi soru bankası',
                        },
                        {
                          id: 'circle-badge' as const,
                          label: 'Renkli Daire Rozet',
                          preview: '● 1',
                          desc: 'Kusursuz ortalı renkli dolu rozet',
                        },
                        {
                          id: 'circle-outline' as const,
                          label: 'Renkli Halka Rozet',
                          preview: '○ 1',
                          desc: 'Kusursuz ortalı halka çerçeve rozet',
                        },
                        {
                          id: 'pill-capsule' as const,
                          label: 'Oval Kapsül Rozet',
                          preview: 'Sayfa 1',
                          desc: 'Pastel zeminli oval hap',
                        },
                        {
                          id: 'bracket-boxed' as const,
                          label: 'Köşeli Parantez Kutu',
                          preview: '[ 1 ]',
                          desc: 'Teknik ve net kutucuk',
                        },
                        {
                          id: 'minimal-num' as const,
                          label: 'Sade Tek Rakam',
                          preview: '1',
                          desc: 'ÖSYM ve resmî sınav sade',
                        },
                        {
                          id: 'none' as const,
                          label: 'Numarasız (Gizli)',
                          preview: '∅',
                          desc: 'Sayfa numarası basılmaz',
                        },
                      ].map((item) => {
                        const currentStyle =
                          brand.pageNumberStyle ||
                          (brand.footerStyle === 'circle-badge' ? 'circle-badge' : 'centered-hyphen');
                        const isSelected = currentStyle === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ pageNumberStyle: item.id })}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                                {item.label}
                              </span>
                              {isSelected && (
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              )}
                            </div>
                            <div
                              className="py-1 px-2 rounded text-center font-mono font-bold text-xs mb-1"
                              style={{
                                backgroundColor: isSelected ? `${effectivePrimary}18` : isDark ? '#1a1d24' : '#f1f5f9',
                                color: isSelected ? effectivePrimary : undefined,
                              }}
                            >
                              {item.preview}
                            </div>
                            <span className="text-[9px] text-slate-500 block">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. ALT ÇİZGİ & KENARLIK */}
                  <div className="pt-2 border-t border-slate-200 dark:border-[#2e323e] space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Alt Çizgi &amp; Çerçeve Stili
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: 'minimal-line' as const,
                          label: 'İnce Zarif Çizgi',
                          desc: 'Sade ve şık alt sınır',
                          preview: (
                            <div className="w-full h-6 rounded bg-slate-50 dark:bg-slate-800/60 p-1 flex flex-col justify-end border border-slate-100 dark:border-slate-700/60">
                              <div className="w-full h-px" style={{ backgroundColor: `${effectivePrimary}80` }} />
                              <div className="flex justify-between items-center text-[5px] text-slate-400 font-mono mt-0.5 px-0.5">
                                <span>Kurum</span>
                                <span>- 1 -</span>
                                <span>A</span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          id: 'circle-badge' as const,
                          label: 'Renkli Vurgulu Çizgi',
                          desc: 'Kurumsal renkte kalın çizgi',
                          preview: (
                            <div className="w-full h-6 rounded bg-slate-50 dark:bg-slate-800/60 p-1 flex flex-col justify-end border border-slate-100 dark:border-slate-700/60">
                              <div className="w-full h-[2px]" style={{ backgroundColor: effectivePrimary }} />
                              <div className="flex justify-between items-center text-[5px] font-mono mt-0.5 px-0.5">
                                <span className="text-slate-400">Kurum</span>
                                <span className="w-2.5 h-2.5 rounded-full text-white flex items-center justify-center text-[4.5px]" style={{ backgroundColor: effectivePrimary }}>1</span>
                                <span className="text-slate-400">A</span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          id: 'osym-turn-page' as const,
                          label: 'ÖSYM Resmî Sınav',
                          desc: 'Siyah kalın sınav çizgisi',
                          preview: (
                            <div className="w-full h-6 rounded bg-slate-50 dark:bg-slate-800/60 p-1 flex flex-col justify-end border border-slate-100 dark:border-slate-700/60">
                              <div className="w-full h-[1.5px] bg-slate-900 dark:bg-white" />
                              <div className="flex justify-between items-center text-[4.5px] text-slate-600 dark:text-slate-300 font-mono mt-0.5 px-0.5">
                                <span>TYT / AYT</span>
                                <span>1</span>
                                <span>Diğer Sayfaya Geçiniz →</span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          id: 'barcode-isbn' as const,
                          label: 'Yayın Telif & Barkod',
                          desc: 'Yayınevi yayın künyesi',
                          preview: (
                            <div className="w-full h-6 rounded bg-slate-50 dark:bg-slate-800/60 p-1 flex flex-col justify-end border border-slate-100 dark:border-slate-700/60">
                              <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
                              <div className="flex justify-between items-center text-[4.5px] text-slate-400 font-mono mt-0.5 px-0.5">
                                <span className="tracking-tighter">||| | ||| ||</span>
                                <span>ISBN</span>
                                <span>© Telif</span>
                              </div>
                            </div>
                          ),
                        },
                      ].map((item) => {
                        const isSelected = (brand.footerStyle || 'minimal-line') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ footerStyle: item.id })}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full">
                              {item.preview}
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">
                                {item.label}
                              </span>
                              {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                            </div>
                            <span className="text-[9px] text-slate-500 block">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. SAĞ KÖŞE ALT BİLGİ METNİ (İsteğe Bağlı) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-[#2e323e] space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Sağ Köşe Notu / Metni (İsteğe Bağlı)
                    </label>
                    <input
                      type="text"
                      value={brand.footerRightText || ''}
                      onChange={(e) => updateBrand({ footerRightText: e.target.value })}
                      placeholder="Örn: A Kitapçığı veya Başarılar Dileriz"
                      className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold ${
                        isDark ? 'border-[#343a49] bg-[#181a20] text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'
                      }`}
                    />
                    <p className="text-[10px] text-slate-500">
                      Boş bırakıldığında otomatik olarak kitapçık kodu gösterilir; isterseniz özel bir açıklama veya başarı dileği yazabilirsiniz.
                    </p>
                  </div>

                  {/* 4. CEVAP ANAHTARI TASARIMLARI (6 Şablon / Model) */}
                  <div className="pt-3 border-t border-slate-200 dark:border-[#2e323e] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5] block">
                          Cevap Anahtarını Sayfada Göster
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Sayfa altında veya test bitiminde cevap kontrol bloğu yerleştirir
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDocSettingsChange({ ...docSettings, showAnswerKey: !docSettings.showAnswerKey })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          docSettings.showAnswerKey !== false
                            ? 'text-white shadow-2xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                        style={docSettings.showAnswerKey !== false ? { backgroundColor: effectivePrimary } : undefined}
                      >
                        {docSettings.showAnswerKey !== false ? '✓ Açık' : '✕ Gizli'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Cevap Anahtarı Tasarım Modelleri
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-[#949dae]">
                        Aşağıdaki 6 şablondan birini seçerek cevap anahtarınızın mizanpaj ve görünümünü belirleyin.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: 'bottom-strip' as const,
                          label: 'Hassas Tek Satır Şerit',
                          desc: '1-A · 2-B · 3-C formatında zarif alt şerit',
                          preview: (
                            <div
                              className="w-full h-8 rounded border p-1 flex items-center justify-between text-[7px] font-mono px-2 shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}45`, backgroundColor: `${effectivePrimary}08` }}
                            >
                              <span className="font-bold flex items-center gap-1" style={{ color: effectivePrimary }}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: effectivePrimary }} />
                                CEVAP:
                              </span>
                              <span className="font-bold flex items-center gap-1">
                                <span style={{ color: effectivePrimary }}>1-</span><strong>A</strong> &middot;
                                <span style={{ color: effectivePrimary }}>2-</span><strong>C</strong> &middot;
                                <span style={{ color: effectivePrimary }}>3-</span><strong>B</strong> &middot;
                                <span style={{ color: effectivePrimary }}>4-</span><strong>D</strong>
                              </span>
                            </div>
                          ),
                        },
                        {
                          id: 'boxed-grid' as const,
                          label: 'Kutucuklu Matris Tablo',
                          desc: 'Soru No üstte, cevap altta ızgara tablo',
                          preview: (
                            <div
                              className="w-full h-8 rounded border p-0.5 flex flex-col justify-center text-[6.5px] font-mono shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}45`, backgroundColor: `${effectivePrimary}05` }}
                            >
                              <div
                                className="flex divide-x text-center border-b font-bold"
                                style={{ borderColor: `${effectivePrimary}35`, backgroundColor: `${effectivePrimary}14` }}
                              >
                                <span className="flex-1" style={{ color: effectivePrimary }}>1</span>
                                <span className="flex-1" style={{ color: effectivePrimary }}>2</span>
                                <span className="flex-1" style={{ color: effectivePrimary }}>3</span>
                                <span className="flex-1" style={{ color: effectivePrimary }}>4</span>
                              </div>
                              <div
                                className="flex divide-x text-center font-bold"
                                style={{ borderColor: `${effectivePrimary}35` }}
                              >
                                <span className="flex-1 font-black text-white" style={{ backgroundColor: effectivePrimary }}>A</span>
                                <span className="flex-1 font-black text-white" style={{ backgroundColor: effectivePrimary }}>C</span>
                                <span className="flex-1 font-black text-white" style={{ backgroundColor: effectivePrimary }}>B</span>
                                <span className="flex-1 font-black text-white" style={{ backgroundColor: effectivePrimary }}>D</span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          id: 'compact-inline' as const,
                          label: 'Renkli Kapsül & Hap Rozet',
                          desc: 'Modern yuvarlatılmış hap etiketler',
                          preview: (
                            <div
                              className="w-full h-8 rounded border p-1 flex items-center justify-center gap-1 text-[6.5px] font-mono shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}40`, backgroundColor: `${effectivePrimary}08` }}
                            >
                              <span className="px-1.5 py-0.5 rounded-full border bg-white dark:bg-slate-900 font-bold shadow-2xs" style={{ borderColor: `${effectivePrimary}50` }}>
                                <strong className="font-bold mr-0.5" style={{ color: effectivePrimary }}>1:</strong><span>A</span>
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full border bg-white dark:bg-slate-900 font-bold shadow-2xs" style={{ borderColor: `${effectivePrimary}50` }}>
                                <strong className="font-bold mr-0.5" style={{ color: effectivePrimary }}>2:</strong><span>C</span>
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full border bg-white dark:bg-slate-900 font-bold shadow-2xs" style={{ borderColor: `${effectivePrimary}50` }}>
                                <strong className="font-bold mr-0.5" style={{ color: effectivePrimary }}>3:</strong><span>B</span>
                              </span>
                            </div>
                          ),
                        },
                        {
                          id: 'optic-bubbles' as const,
                          label: 'Mini Optik Baloncuklar',
                          desc: 'Optik kodlama baloncuğu simülasyonu',
                          preview: (
                            <div
                              className="w-full h-8 rounded border p-1 flex items-center justify-center gap-2 text-[6px] font-mono shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}40`, backgroundColor: `${effectivePrimary}08` }}
                            >
                              <div className="flex items-center gap-0.5">
                                <span className="font-bold" style={{ color: effectivePrimary }}>1</span>
                                <span className="w-2.5 h-2.5 rounded-full text-white flex items-center justify-center text-[5px] font-bold" style={{ backgroundColor: effectivePrimary }}>A</span>
                                <span className="w-2.5 h-2.5 rounded-full border flex items-center justify-center text-[5px]" style={{ borderColor: `${effectivePrimary}50`, color: effectivePrimary }}>B</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <span className="font-bold" style={{ color: effectivePrimary }}>2</span>
                                <span className="w-2.5 h-2.5 rounded-full border flex items-center justify-center text-[5px]" style={{ borderColor: `${effectivePrimary}50`, color: effectivePrimary }}>A</span>
                                <span className="w-2.5 h-2.5 rounded-full text-white flex items-center justify-center text-[5px] font-bold" style={{ backgroundColor: effectivePrimary }}>B</span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          id: 'table-bordered' as const,
                          label: 'Resmî Sınav Kare Matrisi',
                          desc: 'Resmi komisyon formatlı sınav tablosu',
                          preview: (
                            <div
                              className="w-full h-8 border bg-white dark:bg-slate-900 flex flex-col justify-center text-[6px] font-mono shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}60` }}
                            >
                              <div
                                className="flex divide-x border-b text-center font-bold"
                                style={{ backgroundColor: `${effectivePrimary}16`, borderColor: `${effectivePrimary}35` }}
                              >
                                <span className="w-7" style={{ color: effectivePrimary }}>Soru</span>
                                <span className="flex-1" style={{ color: effectivePrimary }}>1</span>
                                <span className="flex-1" style={{ color: effectivePrimary }}>2</span>
                                <span className="flex-1" style={{ color: effectivePrimary }}>3</span>
                              </div>
                              <div
                                className="flex divide-x text-center font-bold"
                                style={{ borderColor: `${effectivePrimary}35` }}
                              >
                                <span className="w-7 font-bold" style={{ color: effectivePrimary, backgroundColor: `${effectivePrimary}10` }}>Cevap</span>
                                <span className="flex-1 font-black" style={{ color: effectivePrimary }}>A</span>
                                <span className="flex-1 font-black" style={{ color: effectivePrimary }}>C</span>
                                <span className="flex-1 font-black" style={{ color: effectivePrimary }}>B</span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          id: 'split-columns' as const,
                          label: 'İki Sütunlu Kompakt Blok',
                          desc: 'Sayfa altına dengeli dağıtılmış bloklar',
                          preview: (
                            <div
                              className="w-full h-8 rounded border p-1 grid grid-cols-2 gap-1 text-[6px] font-mono shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}40`, backgroundColor: `${effectivePrimary}08` }}
                            >
                              <div className="border bg-white dark:bg-slate-900 rounded-xs px-1 flex items-center justify-between" style={{ borderColor: `${effectivePrimary}40` }}>
                                <span className="font-bold" style={{ color: effectivePrimary }}>1.A</span>
                                <span className="font-bold" style={{ color: effectivePrimary }}>2.B</span>
                              </div>
                              <div className="border bg-white dark:bg-slate-900 rounded-xs px-1 flex items-center justify-between" style={{ borderColor: `${effectivePrimary}40` }}>
                                <span className="font-bold" style={{ color: effectivePrimary }}>3.C</span>
                                <span className="font-bold" style={{ color: effectivePrimary }}>4.D</span>
                              </div>
                            </div>
                          ),
                        },
                      ].map((item) => {
                        const isSelected = (brand.answerKeyStyle || 'bottom-strip') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              updateBrand({ answerKeyStyle: item.id });
                              if (docSettings.showAnswerKey === false) {
                                onDocSettingsChange({ ...docSettings, showAnswerKey: true, answerKeyStyle: item.id });
                              } else {
                                onDocSettingsChange({ ...docSettings, answerKeyStyle: item.id });
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full">
                              {item.preview}
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold block truncate text-slate-900 dark:text-[#f0f2f5]">
                                {item.label}
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                            </div>
                            <span className="text-[9.5px] text-slate-500 block leading-tight">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. ÖĞRENCİ CEVAP OPTİK FORMU & DİNAMİK SORU SAYISI AYARLARI */}
                  <div className="pt-3 border-t border-slate-200 dark:border-[#2e323e] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5] block">
                          Öğrenci Cevap Optik Formu
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Sayfa altında dairesel baloncuklu resmî sınav optik kodlama alanı
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDocSettingsChange({ ...docSettings, showOpticForm: !docSettings.showOpticForm })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          docSettings.showOpticForm
                            ? 'text-white shadow-2xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                        style={docSettings.showOpticForm ? { backgroundColor: effectivePrimary } : undefined}
                      >
                        {docSettings.showOpticForm ? '✓ Açık' : '✕ Gizli'}
                      </button>
                    </div>

                    {/* Soru Sayısı ve Şık Sayısı Seçici (Dinamik) */}
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-[#2e323e] bg-slate-50 dark:bg-[#1a1d26] space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Optik Form &amp; Cevap Anahtarı Soru Sayısı:
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { value: 0, label: realQuestions.length > 0 ? `Otomatik (${realQuestions.length})` : 'Oto (10)' },
                            { value: 5, label: '5 Soru' },
                            { value: 10, label: '10 Soru' },
                            { value: 15, label: '15 Soru' },
                            { value: 20, label: '20 Soru' },
                            { value: 25, label: '25 Soru' },
                            { value: 30, label: '30 Soru' },
                            { value: 40, label: '40 Soru' },
                          ].map((item) => {
                            const currentVal = docSettings.opticFormQuestionCount || 0;
                            const isSelected = currentVal === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                  onDocSettingsChange({
                                    ...docSettings,
                                    opticFormQuestionCount: item.value,
                                  });
                                  updateBrand({ opticFormQuestionCount: item.value });
                                }}
                                className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'text-white border-transparent shadow-2xs'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                                }`}
                                style={isSelected ? { backgroundColor: effectivePrimary } : undefined}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Şık Sayısı:
                          </label>
                          <div className="flex gap-1.5">
                            {[
                              { val: 4, label: '4 Şık (A-D)' },
                              { val: 5, label: '5 Şık (A-E)' },
                            ].map((o) => {
                              const isSelected = effectiveOptionCount === o.val;
                              return (
                                <button
                                  key={o.val}
                                  type="button"
                                  onClick={() => {
                                    onDocSettingsChange({
                                      ...docSettings,
                                      opticFormOptionCount: o.val as 4 | 5,
                                    });
                                    updateBrand({ opticFormOptionCount: o.val as 4 | 5 });
                                  }}
                                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold border text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'text-white border-transparent shadow-2xs'
                                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                  style={isSelected ? { backgroundColor: effectivePrimary } : undefined}
                                >
                                  {o.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Kitapçık Türü:
                          </label>
                          <div className="flex gap-1">
                            {(['A', 'B', 'C', 'D'] as const).map((bk) => {
                              const isSelected = (docSettings.bookletType || 'A') === bk;
                              return (
                                <button
                                  key={bk}
                                  type="button"
                                  onClick={() => onDocSettingsChange({ ...docSettings, bookletType: bk })}
                                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold border text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'text-white border-transparent shadow-2xs'
                                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                  style={isSelected ? { backgroundColor: effectivePrimary } : undefined}
                                >
                                  {bk}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: CEVAP ÇİZGİLERİ */}
              {activeTab === 'answers_boxes' && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <PenTool className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Açık Uçlu Soru Cevap Satırları
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Yazılı sınavlardaki açık uçlu cevap alanı dokusu.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        id: 'lined' as const,
                        label: 'MEB Çizgili',
                        preview: (
                          <div className="w-full h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex flex-col justify-between">
                            <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                            <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                            <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                          </div>
                        ),
                      },
                      {
                        id: 'grid' as const,
                        label: 'Kareli Grid',
                        preview: (
                          <div
                            className="w-full h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            style={{
                              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                              backgroundSize: '6px 6px',
                            }}
                          />
                        ),
                      },
                      {
                        id: 'dotted' as const,
                        label: 'Noktalı Kılavuz',
                        preview: (
                          <div className="w-full h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex flex-col justify-between">
                            <div className="border-b border-dotted border-slate-400 w-full" />
                            <div className="border-b border-dotted border-slate-400 w-full" />
                            <div className="border-b border-dotted border-slate-400 w-full" />
                          </div>
                        ),
                      },
                      {
                        id: 'clean-box' as const,
                        label: 'Temiz Çerçeve',
                        preview: (
                          <div className="w-full h-7 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center text-[7px] text-slate-400 font-medium">
                            Boş Yanıt Alanı
                          </div>
                        ),
                      },
                    ].map((item) => {
                      const isSelected = (brand.answerAreaStyle || 'lined') === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateBrand({ answerAreaStyle: item.id })}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                            isSelected
                              ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-2xs'
                              : isDark
                              ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                              : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                          }`}
                        >
                          <div className="w-full flex items-center justify-center py-0.5">
                            {item.preview}
                          </div>
                          <div className="flex items-center justify-between w-full px-0.5">
                            <span className="text-[11px] font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">{item.label}</span>
                            {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 8: KURUMSAL LOGO & MODÜLER BAŞLIK */}
              {activeTab === 'identity' && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Kurumsal Logo &amp; Modüler Başlık
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Kendi gerçek logonuzu yükleyin. Logo yüklenmediğinde veya kapatıldığında hiçbir yapay arma veya simge gösterilmez; başlıklar doğal tipografiyle hizalanır.
                    </p>
                  </div>

                  {/* 1. Logo Alanı Aç / Kapat */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-[#343a49] bg-slate-50 dark:bg-[#252934] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5] block">
                        Başlıklarda Logo Göster
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {brand.showLogo !== false
                          ? 'Aktif: Yüklenen logonuz başlık alanlarında tasarıma uyumlu biçimde gösterilir.'
                          : 'Kapalı: Logo alanı tamamen gizlenir, başlık metinleri alanı doğal olarak doldurur.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateBrand({ showLogo: brand.showLogo === false ? true : false })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        brand.showLogo !== false
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {brand.showLogo !== false ? '✓ Açık' : '✕ Gizli'}
                    </button>
                  </div>

                  {/* 2. Gerçek Logo Yükleme & Yönetim (Armasız) */}
                  {brand.showLogo !== false && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Kurumsal Logo Dosyası
                      </label>

                      {brand.customLogoUrl ? (
                        <div
                          className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${
                            isDark ? 'bg-[#252934] border-[#343a49]' : 'bg-white border-slate-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-md border border-slate-200 bg-white p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={brand.customLogoUrl}
                                alt="Kurumsal Logo"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                                  {brand.instituteName || 'Kurumsal Logo'}
                                </span>
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                                  Aktif
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                12 başlık şablonuna ve filigrana otomatik ölçeklenerek uygulanır.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#383f4f] bg-white dark:bg-[#1f232c] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                              Değiştir
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => updateBrand({ customLogoUrl: undefined, logoType: undefined })}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Logoyu Kaldır"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label
                            className={`rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                              isDark
                                ? 'border-[#383f4f] hover:border-stone-500 bg-[#222631]/60 hover:bg-[#252a36]'
                                : 'border-slate-300 hover:border-stone-500 bg-slate-50 hover:bg-slate-100/70'
                            }`}
                          >
                            <div className="h-10 w-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center mb-2">
                              <Upload className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                              Kurumsal Logonuzu Buraya Yükleyin
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1 max-w-xs">
                              PNG, SVG veya JPG (Şeffaf arka planlı logolar tüm yayınevi modellerine kusursuz oturur)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>

                          <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 text-[11px] text-stone-800 dark:text-stone-300">
                            💡 <strong>Önemli:</strong> Henüz logo yüklemediğinizde başlıklarda hiçbir sahte arma, yapay simge veya boş kutu gösterilmez; başlık metinleri ve rozetler doğal mizanpajda temizce hizalanır.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. ÖĞRENCİ KÜNYE TASARIMLARI (6 Şablon / Model) */}
                  <div className="pt-3 border-t border-slate-200 dark:border-[#2e323e] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5] block">
                          Öğrenci Bilgi Alanı (Künye)
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Başlık altında öğrencinin Ad-Soyad, Sınıf, No ve Not bilgilerini gösterir
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateBrand({ showStudentInfo: brand.showStudentInfo === false ? true : false })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          brand.showStudentInfo !== false
                            ? 'text-white shadow-2xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                        style={brand.showStudentInfo !== false ? { backgroundColor: effectivePrimary } : undefined}
                      >
                        {brand.showStudentInfo !== false ? '✓ Açık' : '✕ Gizli'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Öğrenci Künye Tasarım Modelleri
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-[#949dae]">
                        Aşağıdaki 6 şablondan birini seçerek öğrenci kimlik satırınızın formatını belirleyin.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: 'classic-dotted' as const,
                          label: 'MEB Klasik Noktalı Çizgi',
                          desc: 'Adı Soyadı, Sınıfı, No geleneksel noktalı kılavuz',
                          preview: (
                            <div
                              className="w-full h-8 rounded border p-1 flex items-center justify-between text-[6.5px] shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}45`, backgroundColor: `${effectivePrimary}08` }}
                            >
                              <span className="flex items-center gap-0.5"><strong style={{ color: effectivePrimary }}>Ad Soyad:</strong> <span className="border-b border-dotted w-10 inline-block h-1.5" style={{ borderColor: `${effectivePrimary}80` }} /></span>
                              <span className="flex items-center gap-0.5"><strong style={{ color: effectivePrimary }}>Sınıf:</strong> <span className="border-b border-dotted w-4 inline-block h-1.5" style={{ borderColor: `${effectivePrimary}80` }} /></span>
                              <span className="border px-1 py-0.2 rounded-xs font-bold" style={{ borderColor: effectivePrimary, color: effectivePrimary, backgroundColor: `${effectivePrimary}15` }}>Puan: [ ]</span>
                            </div>
                          ),
                        },
                        {
                          id: 'table-boxes' as const,
                          label: 'Resmî Bölmeli Tablo & Not',
                          desc: 'Kurumsal sınavlara uygun bölmeli hücreler & not kutusu',
                          preview: (
                            <div
                              className="w-full h-8 border flex divide-x text-[6.5px] shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}50`, backgroundColor: `${effectivePrimary}05` }}
                            >
                              <div className="flex-1 p-0.5 font-bold truncate" style={{ backgroundColor: `${effectivePrimary}14`, color: effectivePrimary, borderColor: `${effectivePrimary}40` }}>Adı Soyadı: ...</div>
                              <div className="w-12 p-0.5 truncate font-bold" style={{ backgroundColor: `${effectivePrimary}08`, color: effectivePrimary, borderColor: `${effectivePrimary}40` }}>No: .....</div>
                              <div className="w-10 p-0.5 font-bold text-center text-white" style={{ backgroundColor: effectivePrimary, borderColor: `${effectivePrimary}40` }}>NOT: [ ]</div>
                            </div>
                          ),
                        },
                        {
                          id: 'badge-capsule' as const,
                          label: 'Modern Kapsül & Rozetli',
                          desc: 'Renkli etiket hapları ve şık mini kutular',
                          preview: (
                            <div
                              className="w-full h-8 rounded border p-1 flex items-center gap-1 text-[6px] shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}45`, backgroundColor: `${effectivePrimary}08` }}
                            >
                              <span className="px-1 py-0.5 rounded text-white font-bold" style={{ backgroundColor: effectivePrimary }}>ÖĞRENCİ</span>
                              <span className="border px-1 py-0.5 bg-white dark:bg-slate-900 rounded-xs flex-1 truncate font-bold" style={{ borderColor: `${effectivePrimary}40`, color: effectivePrimary }}>Ad Soyad .....</span>
                              <span className="border px-1 py-0.5 rounded-xs font-bold text-white" style={{ backgroundColor: effectivePrimary, borderColor: effectivePrimary }}>[ NOT ]</span>
                            </div>
                          ),
                        },
                        {
                          id: 'corner-compact' as const,
                          label: 'Köşe Kompakt & Puan Rozeti',
                          desc: 'Tek satırda az yer kaplayan zarif yatay künye',
                          preview: (
                            <div
                              className="w-full h-8 rounded border p-1 flex items-center justify-between text-[6.5px] shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}45`, backgroundColor: `${effectivePrimary}08` }}
                            >
                              <span><strong style={{ color: effectivePrimary }}>Adı Soyadı:</strong> .................</span>
                              <span className="px-1 py-0.2 rounded-xs font-bold border shadow-2xs" style={{ backgroundColor: `${effectivePrimary}18`, color: effectivePrimary, borderColor: `${effectivePrimary}50` }}>Puan: [ ]</span>
                            </div>
                          ),
                        },
                        {
                          id: 'clean-underline' as const,
                          label: 'Minimalist Düz Çizgili',
                          desc: 'Kitap & fasiküllere uygun ince alt çizgili künye',
                          preview: (
                            <div
                              className="w-full h-8 rounded border bg-white dark:bg-slate-900 p-1 flex items-center justify-between gap-1 text-[6.5px] shadow-2xs"
                              style={{ borderColor: `${effectivePrimary}35` }}
                            >
                              <span className="border-b flex-1 truncate pb-0.5" style={{ borderColor: effectivePrimary }}><strong style={{ color: effectivePrimary }}>Adı:</strong> .......</span>
                              <span className="border-b w-10 pb-0.5" style={{ borderColor: effectivePrimary, color: effectivePrimary }}><strong>Sınıf:</strong> ..</span>
                              <span className="border px-1 font-bold" style={{ borderColor: effectivePrimary, color: effectivePrimary, backgroundColor: `${effectivePrimary}10` }}>[ &nbsp; ]</span>
                            </div>
                          ),
                        },
                        {
                          id: 'official-meb' as const,
                          label: 'MEB Senaryolu Protokol',
                          desc: 'Resmi yazılı sınav protokol kutusu ve senaryo bilgisi',
                          preview: (
                            <div
                              className="w-full h-8 border bg-white dark:bg-slate-900 flex flex-col justify-between text-[5.5px] shadow-2xs"
                              style={{ borderColor: effectivePrimary }}
                            >
                              <div className="px-1 py-0.2 font-bold truncate text-white" style={{ backgroundColor: effectivePrimary }}>T.C. MEB ORTAK SINAV PROTOKOLÜ</div>
                              <div className="px-1 py-0.2 flex justify-between items-center" style={{ backgroundColor: `${effectivePrimary}08` }}>
                                <span><strong style={{ color: effectivePrimary }}>Öğrenci:</strong> .....</span>
                                <span style={{ color: effectivePrimary }}><strong>No:</strong> ...</span>
                                <span className="font-bold border px-1" style={{ borderColor: effectivePrimary, color: effectivePrimary, backgroundColor: `${effectivePrimary}15` }}>Not: [ ]</span>
                              </div>
                            </div>
                          ),
                        },
                      ].map((item) => {
                        const isSelected = (brand.studentInfoStyle || 'classic-dotted') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateBrand({ studentInfoStyle: item.id, showStudentInfo: true })}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 text-stone-900 dark:text-white shadow-xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full">
                              {item.preview}
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold block truncate text-slate-900 dark:text-[#f0f2f5]">
                                {item.label}
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                            </div>
                            <span className="text-[9.5px] text-slate-500 block leading-tight">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Modüler Başlık Parçaları (Aç / Kapat) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-[#2e323e] space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Modüler Başlık Parçaları (Çıkart / Ekle)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          key: 'showStudentInfo' as const,
                          label: 'Öğrenci Bilgi Alanı',
                          desc: 'Adı Soyadı, Sınıfı, No, Puan satırı',
                          active: brand.showStudentInfo === true,
                        },
                        {
                          key: 'showTestNumberBadge' as const,
                          label: 'Sınav / Test No & Kitapçık',
                          desc: 'TEST 01, A Kitapçığı rozeti',
                          active: brand.showTestNumberBadge !== false,
                        },
                        {
                          key: 'showCourseGrade' as const,
                          label: 'Ders & Sınıf Seviyesi',
                          desc: 'TYT · MATEMATİK, 9. Sınıf rozeti',
                          active: brand.showCourseGrade !== false,
                        },
                        {
                          key: 'showTeacherInfo' as const,
                          label: 'Yazar & Zümre Künyesi',
                          desc: 'Kurum adı, yazar zümresi ve öğretmen',
                          active: brand.showTeacherInfo !== false,
                        },
                        {
                          key: 'showDuration' as const,
                          label: 'Sınav Süresi (Dk)',
                          desc: 'Başlıkta sınav süresi bilgisi',
                          active: brand.showDuration !== false,
                        },
                        {
                          key: 'showInstructionBox' as const,
                          label: 'Özel Not / Alt Duyuru Bandı',
                          desc: 'Başlık altına isteğe bağlı özel duyuru veya motivasyon notu bandı ekler',
                          active: Boolean(brand.showInstructionBox),
                        },
                      ].map((mod) => (
                        <div
                          key={mod.key}
                          onClick={() => updateBrand({ [mod.key]: !mod.active })}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                            mod.active
                              ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] text-stone-900 dark:text-white shadow-2xs'
                              : isDark
                              ? 'border-[#343a49] bg-[#252934] opacity-70 hover:opacity-100 hover:border-stone-500'
                              : 'border-slate-200 bg-slate-50 opacity-70 hover:opacity-100 hover:border-stone-400'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5] block">
                              {mod.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {mod.desc}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded ${
                              mod.active ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {mod.active ? 'Açık' : 'Kapalı'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Metin Bilgileri */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-[#2e323e]">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Kurum / Yayınevi Adı <span className="font-normal text-slate-400">(İsteğe Bağlı)</span>:
                      </label>
                      <input
                        type="text"
                        value={brand.instituteName || ''}
                        onChange={(e) => updateBrand({ instituteName: e.target.value })}
                        placeholder="İsteğe bağlı (boş bırakabilirsiniz)"
                        className={`w-full rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                          isDark ? 'border-[#343a49] bg-[#181a20] text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Zümre / Alt Başlık / Slogan:
                      </label>
                      <input
                        type="text"
                        value={brand.branch}
                        onChange={(e) => updateBrand({ branch: e.target.value })}
                        placeholder="örn: TEST HAZIRLAMANIN AKILLI YOLU"
                        className={`w-full rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                          isDark ? 'border-[#343a49] bg-[#181a20] text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: FORMAT DÜZENİ, ÖLÇÜLER & PUANLAMA */}
              {activeTab === 'format_layout' && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f2f5] flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                      Format, Ölçü ve Sayfa Düzeni
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#949dae]">
                      Yazı boyutu, soru aralıkları, satır sayısı, puan, süre ve sütun ölçülerini soru düzenleyicisi hassasiyetinde ayarlayın.
                    </p>
                  </div>

                  {/* 1. YAZI TİPİ & BOYUTU (PUNTO ÖLÇÜSÜ) */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2e323e] bg-slate-50/60 dark:bg-[#1a1c23]/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Type className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                        <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                          Soru Metni Yazı Boyutu (Punto)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                        {docSettings.fontSizeScale === 'compact' ? '10 pt (Kompakt)' : docSettings.fontSizeScale === 'large' ? '12.5 pt (Geniş)' : '11 pt (Standart MEB)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'compact' as const, label: 'Kompakt', pt: '10 pt', note: 'Yoğun testler için' },
                        { id: 'normal' as const, label: 'Standart', pt: '11 pt', note: 'MEB & Yayınevi standardı' },
                        { id: 'large' as const, label: 'Geniş', pt: '12.5 pt', note: 'Ferah & okunaklı' },
                      ].map((item) => {
                        const isSelected = (docSettings.fontSizeScale || 'normal') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onDocSettingsChange({ ...docSettings, fontSizeScale: item.id })}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">{item.label}</span>
                              <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-400">{item.pt}</span>
                            </div>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">{item.note}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Yazı Tipi Font Ailesi */}
                    <div className="pt-2 border-t border-slate-200 dark:border-[#2e323e]">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                        Tipografi / Font Ailesi
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'sans' as const, name: 'Sans-Serif', desc: 'Modern & Net (Inter)', font: 'font-sans' },
                          { id: 'serif' as const, name: 'Serif', desc: 'Resmî Kitap (Times)', font: 'font-serif' },
                          { id: 'mono' as const, name: 'Monospace', desc: 'Teknik / Kod', font: 'font-mono' },
                        ].map((f) => {
                          const isSelected = (brand.fontFamily || 'sans') === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => updateBrand({ fontFamily: f.id })}
                              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                                  : isDark
                                  ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                  : 'border-slate-200 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                              }`}
                            >
                              <span className={`text-xs font-bold block ${f.font}`}>{f.name}</span>
                              <span className="text-[9px] text-slate-500 block mt-0.5">{f.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2. AÇIK UÇLU SATIR SAYISI */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2e323e] bg-slate-50/60 dark:bg-[#1a1c23]/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PenTool className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                        <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                          Açık Uçlu Soru Cevap Satır Sayısı
                        </span>
                      </div>
                      <div className="flex items-center border border-slate-200 dark:border-[#343a49] rounded-lg bg-white dark:bg-[#252934] p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateOpenEndedLines(openEndedLines - 1)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#2b303d] text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="1 Satır Azalt"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-mono font-bold px-2 text-slate-800 dark:text-slate-200 min-w-[50px] text-center">
                          {openEndedLines} Satır
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateOpenEndedLines(openEndedLines + 1)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#2b303d] text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="1 Satır Artır"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold text-slate-400">Hızlı Seçim:</span>
                      {[2, 4, 6, 8, 10].map((lines) => (
                        <button
                          key={lines}
                          type="button"
                          onClick={() => {
                            handleUpdateOpenEndedLines(lines);
                            updateBrand({ answerAreaStyle: brand.answerAreaStyle || 'lined' });
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            openEndedLines === lines
                              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                              : isDark
                              ? 'bg-[#252934] text-slate-300 hover:bg-[#2b303e]'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lines} Satır
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-[#949dae]">
                      Klasik ve yazılı sınavlarda açık uçlu soruların altına öğrencinin el yazısıyla çözüm yapması için bırakılan standart kılavuz satır adedi.
                    </p>
                  </div>

                  {/* 3. VARSAYILAN SORU PUANI */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2e323e] bg-slate-50/60 dark:bg-[#1a1c23]/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                        <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                          Varsayılan Soru Puanı
                        </span>
                      </div>
                      <div className="flex items-center border border-slate-200 dark:border-[#343a49] rounded-lg bg-white dark:bg-[#252934] p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateDefaultQuestionPoints(defaultQuestionPoints - 5)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#2b303d] text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="5 Puan Azalt"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-mono font-bold px-2 text-slate-800 dark:text-slate-200 min-w-[55px] text-center">
                          {defaultQuestionPoints} Puan
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateDefaultQuestionPoints(defaultQuestionPoints + 5)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#2b303d] text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="5 Puan Artır"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold text-slate-400">Puan Değeri:</span>
                      {[5, 10, 15, 20, 25].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => handleUpdateDefaultQuestionPoints(pts)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            defaultQuestionPoints === pts
                              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                              : isDark
                              ? 'bg-[#252934] text-slate-300 hover:bg-[#2b303e]'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {pts} Puan
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-[#949dae]">
                      Soru başına önerilen standart puan değeri. Soru kartları üzerinden her soruya özel puan verilebilir.
                    </p>
                  </div>

                  {/* 3b. SORU BOŞLUĞU & ARALIK ÖLÇÜSÜ */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2e323e] bg-slate-50/60 dark:bg-[#1a1c23]/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <SlidersHorizontal className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                        <span className="text-xs font-bold text-slate-900 dark:text-[#f0f2f5]">
                          Soru Boşluğu &amp; Aralık Ölçüsü
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                        {docSettings.questionSpacing === 'compact' ? 'Kompakt (Sık)' : docSettings.questionSpacing === 'relaxed' ? 'Ferah (Geniş)' : 'Standart (MEB)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'compact' as const, label: 'Kompakt', note: 'Yoğun soru sığdırma' },
                        { id: 'normal' as const, label: 'Standart', note: 'Dengeli mizanpaj' },
                        { id: 'relaxed' as const, label: 'Ferah', note: 'Geniş aralık' },
                      ].map((sp) => {
                        const isSelected = (docSettings.questionSpacing || 'normal') === sp.id;
                        return (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => {
                              onDocSettingsChange({ ...docSettings, questionSpacing: sp.id });
                              updateBrand({ questionSpacing: sp.id });
                            }}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs font-bold'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936] text-[#cbd1de]'
                                : 'border-slate-200 bg-white hover:border-stone-400 hover:bg-stone-50/80 text-slate-700 shadow-2xs'
                            }`}
                          >
                            <span className="text-xs block font-bold text-slate-900 dark:text-[#f0f2f5]">{sp.label}</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">{sp.note}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. SÜTUN VE SAYFA MİZANPAJI */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-[#d6dae4]">
                      Sütun Yapısı (Sayfa İçi Düzen)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          count: 1 as const,
                          title: 'Tek Sütun (Geniş)',
                          desc: 'Ders föyleri ve açık uçlu yazılılar',
                          preview: (
                            <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex flex-col justify-between">
                              <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-xs w-full" />
                              <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-xs w-5/6" />
                              <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-xs w-4/6" />
                            </div>
                          ),
                        },
                        {
                          count: 2 as const,
                          title: 'Çift Sütun (Standart)',
                          desc: 'Yaprak test, soru bankası ve sınavlar',
                          preview: (
                            <div className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex items-center justify-between gap-1 relative">
                              <div className="flex-1 flex flex-col justify-between h-full py-0.5">
                                <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-xs w-full" />
                                <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-xs w-4/5" />
                              </div>
                              <div className="h-full w-px bg-slate-300 dark:bg-slate-600" />
                              <div className="flex-1 flex flex-col justify-between h-full py-0.5">
                                <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-xs w-full" />
                                <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-xs w-4/5" />
                              </div>
                            </div>
                          ),
                        },
                      ].map((col) => {
                        const isSelected = (docSettings.columnCount || 2) === col.count;
                        return (
                          <button
                            key={col.count}
                            type="button"
                            onClick={() => onDocSettingsChange({ ...docSettings, columnCount: col.count })}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                                : isDark
                                ? 'border-[#323746] bg-[#20232d] hover:border-stone-500 hover:bg-[#252936]'
                                : 'border-slate-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="w-full">
                              {col.preview}
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold block text-slate-900 dark:text-[#f0f2f5]">
                                  {col.title}
                                </span>
                                {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                              </div>
                              <span className="text-[9.5px] text-slate-500 dark:text-[#949dae] block mt-0.5">
                                {col.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. KÂĞIT FORMATI & SAYFA BAŞI SORU */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-[#d6dae4] block mb-1">
                        Kâğıt Formatı
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          {
                            id: 'A4' as const,
                            name: 'A4',
                            note: '210×297',
                            preview: <div className="w-4 h-5 border border-slate-400 dark:border-slate-500 rounded-none bg-white dark:bg-slate-700 shadow-2xs" />,
                          },
                          {
                            id: 'A3' as const,
                            name: 'A3',
                            note: 'Katlamalı',
                            preview: <div className="w-5 h-6 border border-slate-400 dark:border-slate-500 rounded-none bg-white dark:bg-slate-700 shadow-2xs" />,
                          },
                          {
                            id: 'B5' as const,
                            name: 'B5',
                            note: 'Kitap',
                            preview: <div className="w-3.5 h-4.5 border border-slate-400 dark:border-slate-500 rounded-none bg-white dark:bg-slate-700 shadow-2xs" />,
                          },
                        ].map((paper) => {
                          const isSelected = (docSettings.paperFormat || 'A4') === paper.id;
                          return (
                            <button
                              key={paper.id}
                              type="button"
                              onClick={() => onDocSettingsChange({ ...docSettings, paperFormat: paper.id })}
                              className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                                isSelected
                                  ? 'border-stone-900 dark:border-stone-100 bg-stone-100/90 dark:bg-[#282d3b] text-stone-900 dark:text-white font-bold ring-1 ring-stone-900/15 dark:ring-stone-100/25 shadow-xs'
                                  : isDark
                                  ? 'border-[#323746] bg-[#20232d] text-[#cbd1de] hover:border-stone-500 hover:bg-[#252936]'
                                  : 'border-slate-200/90 bg-white text-slate-700 hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                              }`}
                            >
                              <div className="h-6 flex items-center justify-center">
                                {paper.preview}
                              </div>
                              <span className="text-xs font-bold block">{paper.name}</span>
                              <span className="text-[9px] text-slate-400 block">{paper.note}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-[#d6dae4] block mb-1">
                        Sayfa Başına Soru Sayısı
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {[0, 2, 3, 4, 6, 8].map((qCount) => (
                          <button
                            key={qCount}
                            type="button"
                            onClick={() => onDocSettingsChange({ ...docSettings, questionsPerPage: qCount })}
                            className={`px-2 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              (docSettings.questionsPerPage || 0) === qCount
                                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-2xs'
                                : isDark
                                ? 'bg-[#252934] text-[#cbd1de] border-[#343a49] hover:bg-[#2b303e]'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {qCount === 0 ? '⚡ Otomatik' : `${qCount} Soru`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 6. SINAV SÜRESİ */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-[#d6dae4]">
                        Sınav / Çalışma Süresi (Dakika)
                      </label>
                      <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                        {docSettings.durationMinutes || 40} Dakika
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[30, 40, 45, 60, 80, 90, 135].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => onDocSettingsChange({ ...docSettings, durationMinutes: dur })}
                          className={`flex-1 min-w-[45px] py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            docSettings.durationMinutes === dur
                              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-2xs'
                              : isDark
                              ? 'bg-[#252934] text-[#cbd1de] border-[#343a49] hover:bg-[#2b303e]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {dur} Dk
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. FORMAT BİLEŞEN TOGGLES */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#2e323e]">
                    <label className="text-xs font-bold text-slate-800 dark:text-[#d6dae4]">
                      Format Özel Blokları &amp; Gösterimler
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          key: 'showOpticForm',
                          label: 'Öğrenci Optik Form Şeridi',
                          desc: 'Sayfa altında veya kapağında test cevap kodlama alanı',
                          active: docSettings.showOpticForm ?? false,
                          toggle: () => onDocSettingsChange({ ...docSettings, showOpticForm: !docSettings.showOpticForm }),
                          preview: (
                            <div className="flex items-center gap-0.5 px-1 py-0.5 border border-slate-300 dark:border-slate-600 rounded-xs bg-slate-50 dark:bg-slate-800">
                              <span className="text-[5.5px] font-bold text-slate-500">1</span>
                              {['A', 'B', 'C', 'D'].map((o) => (
                                <span key={o} className="w-2 h-2 rounded-full border border-slate-400 text-[4px] flex items-center justify-center">{o}</span>
                              ))}
                            </div>
                          ),
                        },
                        {
                          key: 'showAnswerKey',
                          label: 'Alt Cevap Anahtarı Şeridi',
                          desc: 'Sayfa alt bilgisinde hızlı cevap kontrol şeridi',
                          active: docSettings.showAnswerKey ?? false,
                          toggle: () => onDocSettingsChange({ ...docSettings, showAnswerKey: !docSettings.showAnswerKey }),
                          preview: (
                            <div className="flex items-center gap-1 text-[6px] font-mono border border-slate-300 dark:border-slate-600 px-1 py-0.2 rounded-xs">
                              <span>1.A</span>
                              <span>2.C</span>
                              <span>3.B</span>
                            </div>
                          ),
                        },
                        {
                          key: 'showStudentInfo',
                          label: 'Öğrenci Künyesi (Ad-Soyad, Sınıf, No)',
                          desc: 'Başlık altında sınav öğrenci bilgi satırı',
                          active: brand.showStudentInfo !== false,
                          toggle: () => updateBrand({ showStudentInfo: brand.showStudentInfo === false ? true : false }),
                          preview: (
                            <div className="text-[6px] text-slate-500 border-b border-dashed border-slate-400 px-1">
                              Ad-Soyad: ........... No: .....
                            </div>
                          ),
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          onClick={item.toggle}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                            item.active
                              ? isDark
                                ? 'bg-stone-800/80 border-stone-600'
                                : 'bg-stone-100 border-stone-300'
                              : isDark
                              ? 'bg-[#252934] border-[#343a49]'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold block text-slate-900 dark:text-[#f0f2f5] truncate">
                                {item.label}
                              </span>
                              <div className="shrink-0 hidden sm:block">
                                {item.preview}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-[#949dae] block mt-0.5 truncate">
                              {item.desc}
                            </span>
                          </div>
                          <div
                            className={`h-5 w-9 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                              item.active ? 'bg-stone-900 dark:bg-stone-100 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                            }`}
                          >
                            <span className={`h-4 w-4 rounded-full shadow-xs ${item.active ? 'bg-white dark:bg-stone-900' : 'bg-white'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.aside>

          {/* RIGHT: REAL PHYSICAL PAPER SHEET PREVIEW (Strict Standard Dimensions, Fixed Center Fit, No Scrolling) */}
          <div
            ref={previewContainerRef}
            className="relative flex-1 min-w-0 flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-100/80 dark:bg-[#12141a] border border-slate-200/70 dark:border-[#242733] h-full min-h-0 overflow-hidden select-none"
          >
            {/* Exactly Dimensioned Artboard Shell: Exactly matches scaled sheet dimensions with zero overflow */}
            <div
              className="relative shrink-0 flex items-center justify-center select-text shadow-[0_20px_50px_-12px_rgba(27,36,50,0.22),0_0_0_1px_rgba(27,36,50,0.08)] dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)]"
              style={{
                width: `${scaledPageSize.w}px`,
                height: `${scaledPageSize.h}px`,
              }}
            >
              {/* REALISTIC PHYSICAL PAPER SHEET (Strictly Standard Dimensions, Sharp 90° Corners) */}
              <div
                className="page-sheet-container select-text transition-all flex flex-col justify-between rounded-none shrink-0"
                style={{
                  width: `${standardPageSize.w}px`,
                  height: `${standardPageSize.h}px`,
                  minHeight: `${standardPageSize.h}px`,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  backgroundColor: paperToneBg,
                  color: '#0f172a',
                  borderRadius: '0px', // Strictly Sharp 90° Corners - No Oval
                  // Physical paper border & Frame style
                  border:
                    brand.pageFrameStyle === 'full-border'
                      ? `3px solid ${effectivePrimary}`
                      : '1px solid #cbd5e1',
                  borderTop:
                    brand.pageFrameStyle === 'top-bottom-bars'
                      ? `4px solid ${effectivePrimary}`
                      : brand.pageFrameStyle === 'full-border'
                      ? `3px solid ${effectivePrimary}`
                      : '1px solid #cbd5e1',
                  borderBottom:
                    brand.pageFrameStyle === 'top-bottom-bars'
                      ? `4px solid ${effectivePrimary}`
                      : brand.pageFrameStyle === 'full-border'
                      ? `3px solid ${effectivePrimary}`
                      : '1px solid #cbd5e1',
                  padding:
                    brand.headerStyle === 'gradient-banner' || brand.headerStyle === 'wave-organic'
                      ? '0px 0px 14px 0px'
                      : '16px 20px',
                  fontFamily:
                    brand.fontFamily === 'serif'
                      ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
                      : brand.fontFamily === 'mono'
                      ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                      : 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
              {/* Köşe L-Vurguları (Corner Accents) */}
              {brand.pageFrameStyle === 'corner-accents' && (
                <>
                  <div
                    className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 pointer-events-none"
                    style={{ borderColor: effectivePrimary }}
                  />
                  <div
                    className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 pointer-events-none"
                    style={{ borderColor: effectivePrimary }}
                  />
                  <div
                    className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 pointer-events-none"
                    style={{ borderColor: effectivePrimary }}
                  />
                  <div
                    className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 pointer-events-none"
                    style={{ borderColor: effectivePrimary }}
                  />
                </>
              )}

              {/* 1. BAŞLIK BÖLÜMÜ (12 SEÇKİN MODEL) */}

              {/* MODEL 1: CANLI GRADYAN ÜST BANT (Bilgi Sarmal / Orijinal) */}
              {brand.headerStyle === 'gradient-banner' && (
                <div className="space-y-1">
                  <div
                    className="p-3.5 sm:p-4 text-white relative shadow-xs flex items-center justify-between overflow-hidden"
                    style={{ background: headerGradientStyle }}
                  >
                    <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute right-24 -bottom-10 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

                    {/* Left: Logo & Institute & Course/Grade */}
                    <div className="flex items-center gap-2.5 relative z-10 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo({ onDarkBg: true })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200 block leading-tight mt-0.5">
                            {docSettings.courseName || 'TÜRKÇE'} · {docSettings.gradeLevel || 'LGS'}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-white/80 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Center: Topic Title & Test Band */}
                    <div className="text-center relative z-10 px-2 flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-black tracking-tight uppercase break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'KAZANIM KAVRAMA TESTİ'}
                      </span>
                    </div>

                    {/* Right: Teacher / Duration / Booklet */}
                    <div className="text-right relative z-10 flex items-center justify-end gap-2 flex-1 min-w-0 pl-2">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <div className="text-right min-w-0">
                          <span className="text-[9px] font-bold text-white block break-words leading-tight">
                            {brand.teacherName || brand.branch}
                          </span>
                        </div>
                      )}
                      {previewDurationText && (
                        <span className="text-[9px] font-bold text-white/90 bg-black/20 px-2 py-0.5 rounded-xs shrink-0 whitespace-nowrap">
                          {previewDurationText}
                        </span>
                      )}
                      {brand.showTestNumberBadge !== false && (
                        <span className="text-[10px] font-mono font-black bg-white/20 px-2.5 py-1 rounded-xs text-white shadow-2xs whitespace-nowrap shrink-0">
                          {docSettings.bookletType || 'A'}
                        </span>
                      )}
                    </div>
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 2: AÇILI / EĞİMLİ GEOMETRİK KESİM (Hız ve Renk / Limit) */}
              {brand.headerStyle === 'trapezoid-modern' && (
                <div className="space-y-1 pb-2">
                  <div className="flex items-center justify-between border-b-2 pb-2.5 gap-2" style={{ borderColor: effectivePrimary }}>
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo()}
                      {brand.showTestNumberBadge !== false && (
                        <div
                          className="px-3 py-1.5 text-white font-black text-xs tracking-wider shadow-xs relative shrink-0"
                          style={{
                            backgroundColor: effectivePrimary,
                            clipPath: 'polygon(0 0, 88% 0, 100% 100%, 0% 100%)',
                            paddingRight: '16px',
                          }}
                        >
                          {docSettings.bookletType || 'A'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[9px] font-black uppercase text-slate-900 block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block leading-tight mt-0.5">
                            {docSettings.courseName || 'MATEMATİK'} · {docSettings.gradeLevel || 'TYT-AYT'}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-slate-400 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center flex-1 min-w-0 px-2">
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'KAZANIM TESTİ'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-right justify-end flex-1 min-w-0 pl-2">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <span className="text-[9px] font-medium text-slate-600 block break-words leading-tight">
                          {brand.teacherName || brand.branch}
                        </span>
                      )}
                      {previewDurationText && (
                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-200 shrink-0 whitespace-nowrap">
                          {previewDurationText}
                        </span>
                      )}
                    </div>
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 3: İKİ RENKLİ FASİKÜL & BÖLÜM BANDI (Çap / Palme) */}
              {brand.headerStyle === 'fasikul-band' && (
                <div className="space-y-1 pb-2">
                  <div className="flex rounded-none overflow-hidden shadow-2xs border border-slate-200">
                    <div
                      className="w-[42%] min-w-0 px-3 py-2 text-white flex items-center gap-2"
                      style={{ backgroundColor: effectivePrimary }}
                    >
                      {renderPreviewLogo({ onDarkBg: true, size: 'sm' })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-200 block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight mt-0.5">
                            {docSettings.courseName || 'FİZİK'} · {docSettings.gradeLevel || '11. SINIF'}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-white/80 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="w-[58%] min-w-0 px-3 py-2 flex items-center justify-between gap-2"
                      style={{ backgroundColor: `${effectivePrimary}15` }}
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-black uppercase tracking-tight break-words leading-tight" style={{ color: effectivePrimary }}>
                          {docSettings.title || previewTitle}
                        </h3>
                        <span className="text-[8px] font-semibold text-slate-600 block break-words leading-tight mt-0.5">
                          {brand.testBandTitle || docSettings.termInfo || 'Kazanım Modülü'} {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) ? `· ${brand.teacherName || brand.branch}` : ''} {previewDurationText ? `· Süre: ${previewDurationText}` : ''}
                        </span>
                      </div>
                      {brand.showTestNumberBadge !== false && (
                        <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-none bg-white shadow-2xs shrink-0 whitespace-nowrap" style={{ color: effectivePrimary }}>
                          {docSettings.bookletType || 'A'}
                        </span>
                      )}
                    </div>
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 4: ÇERÇEVELİ, DİŞLİ MADALYON & YÖNERGE KUTULU (Bursluluk / Deneme) */}
              {brand.headerStyle === 'framed-rosette' && (
                <div className="space-y-2 pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo()}
                      {brand.showTestNumberBadge !== false && (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-none text-white font-black text-xs shrink-0 shadow-2xs"
                          style={{ backgroundColor: effectivePrimary }}
                        >
                          {docSettings.bookletType || 'A'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[9px] font-black uppercase text-slate-900 block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span className="text-[8px] font-bold text-slate-600 block break-words leading-tight mt-0.5">
                            {docSettings.courseName || 'TÜRKÇE'} · {docSettings.gradeLevel || '8. SINIF'}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-slate-400 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center flex-1 min-w-0 px-2">
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'BURSLULUK TESTİ'}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 flex-1 min-w-0 pl-2 text-right">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <span className="text-[8px] font-medium text-slate-500 block break-words leading-tight">
                          {brand.teacherName || brand.branch}
                        </span>
                      )}
                      {previewDurationText && (
                        <span
                          className="px-2.5 py-1 text-[9px] font-black uppercase text-white shadow-2xs inline-block shrink-0 whitespace-nowrap"
                          style={{ backgroundColor: effectivePrimary }}
                        >
                          SÜRE: {previewDurationText}
                        </span>
                      )}
                    </div>
                  </div>

                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 5: DALGALI & ORGANİK SIVI KESİM (Okyanus / Nitelik) */}
              {brand.headerStyle === 'wave-organic' && (
                <div className="space-y-1">
                  <div
                    className="p-3.5 sm:p-4 text-white relative shadow-xs flex items-center justify-between overflow-hidden"
                    style={{
                      background: headerGradientStyle,
                      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), 65% 100%, 0 calc(100% - 6px))',
                      paddingBottom: '22px',
                    }}
                  >
                    <div className="flex items-center gap-2.5 relative z-10 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo({ onDarkBg: true })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-200 block leading-tight mt-0.5">
                            {docSettings.courseName || 'FİZİK'} · {docSettings.gradeLevel || 'YKS / LGS'}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-white/80 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center relative z-10 px-2 flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-black tracking-tight uppercase break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[9px] font-medium text-white/90 uppercase tracking-widest block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'YENİ NESİL GELİŞİM TESTİ'}
                      </span>
                    </div>

                    <div className="text-right relative z-10 flex items-center gap-2 flex-1 min-w-0 pl-2 justify-end">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <span className="text-[8px] font-medium text-white/80 block break-words leading-tight">
                          {brand.teacherName || brand.branch}
                        </span>
                      )}
                      {previewDurationText && (
                        <span className="text-[9px] font-bold text-white/90 bg-black/20 px-2 py-0.5 rounded-none whitespace-nowrap shrink-0">
                          {previewDurationText}
                        </span>
                      )}
                      {brand.showTestNumberBadge !== false && (
                        <span className="text-[9px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-none text-white whitespace-nowrap shadow-2xs shrink-0">
                          {docSettings.bookletType || 'A'}
                        </span>
                      )}
                    </div>
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 6: PASTEL FIRÇA / KAPSÜL ROZET */}
              {brand.headerStyle === 'brush-accent' && (
                <div className="pb-3 border-b border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo()}
                      <div
                        className="px-3 py-1.5 flex items-center gap-2 shadow-2xs min-w-0 flex-1"
                        style={{ backgroundColor: `${effectivePrimary}18` }}
                      >
                        <div className="min-w-0 flex-1">
                          {brand.instituteName?.trim() && (
                            <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight" style={{ color: effectivePrimary }}>
                              {brand.instituteName}
                            </span>
                          )}
                          {brand.showCourseGrade !== false && (
                            <span className="text-[8px] font-bold uppercase tracking-wider block leading-tight mt-0.5" style={{ color: effectivePrimary }}>
                              {docSettings.courseName || 'TÜRKÇE'} · {docSettings.gradeLevel || 'LGS'}
                            </span>
                          )}
                          {(brand.subTitle || brand.branch) && (
                            <span className="text-[8px] text-stone-500 block break-words leading-tight mt-0.5">
                              {brand.subTitle || brand.branch}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-center flex-1 min-w-0 px-2">
                      <h3 className="text-xs sm:text-sm font-black tracking-tight uppercase text-slate-900 break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'KAZANIM PEKİŞTİRME FÖYÜ'}
                      </span>
                    </div>

                    <div className="text-right flex-1 min-w-0 pl-2 flex items-center gap-2 justify-end">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <span className="text-[9px] font-medium text-slate-600 block break-words leading-tight">
                          {brand.teacherName || brand.branch}
                        </span>
                      )}
                      {previewDurationText && (
                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0 whitespace-nowrap">
                          {previewDurationText}
                        </span>
                      )}
                      {brand.showTestNumberBadge !== false && (
                        <span
                          className="px-2 py-0.5 text-white font-mono font-bold text-[9px] shadow-2xs inline-block shrink-0 whitespace-nowrap"
                          style={{ backgroundColor: effectivePrimary }}
                        >
                          {docSettings.bookletType || 'A'}
                        </span>
                      )}
                    </div>
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 7: ÇİFT ÇİZGİLİ KAPSÜL ROZET (Apotemi / Karekök / Aydın) */}
              {brand.headerStyle === 'double-line-capsule' && (
                <div className="space-y-1 pb-2">
                  <div className="border-t border-b py-2 flex items-center justify-between gap-2" style={{ borderColor: effectivePrimary }}>
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo({ size: 'sm' })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[9px] font-black uppercase text-slate-900 block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span
                            className="px-2 py-0.5 text-white font-black text-[9px] uppercase shadow-2xs inline-block mt-0.5"
                            style={{ backgroundColor: effectivePrimary }}
                          >
                            {docSettings.courseName || 'MATEMATİK'} · {docSettings.gradeLevel || 'AYT'}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-slate-400 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center flex-1 min-w-0 px-2">
                      <h3 className="text-xs font-black uppercase text-slate-900 break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[8px] font-bold text-slate-500 uppercase block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'MODÜL TESTİ'}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-2 justify-end flex-1 min-w-0 pl-2">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <span className="text-[8px] font-medium text-slate-500 block break-words leading-tight">
                          {brand.teacherName || brand.branch}
                        </span>
                      )}
                      {previewDurationText && (
                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200 shrink-0 whitespace-nowrap">
                          {previewDurationText}
                        </span>
                      )}
                      {brand.showTestNumberBadge !== false && (
                        <span className="text-[9px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 shrink-0 whitespace-nowrap">
                          {docSettings.bookletType || 'A'}
                        </span>
                      )}
                    </div>
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 8: KOLEJ & KURUMSAL ŞERİT ÇİFT DAMGALI (Kültür / Uğur) */}
              {brand.headerStyle === 'retro-institution' && (
                <div className="pb-2.5 border-b-2 border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo()}
                      {brand.showTestNumberBadge !== false && (
                        <div
                          className="h-8 w-8 flex items-center justify-center font-black text-white text-xs shadow-xs shrink-0"
                          style={{ backgroundColor: effectivePrimary }}
                        >
                          {docSettings.bookletType || 'A'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-xs font-black uppercase tracking-tight text-slate-900 block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600 block leading-tight mt-0.5">
                            {docSettings.courseName} · {docSettings.gradeLevel}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-slate-400 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center flex-1 min-w-0 px-2">
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[8px] font-semibold text-slate-600 block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'SEVİYE TESPİT'}
                      </span>
                    </div>

                    <div className="text-right flex-1 min-w-0 pl-2 flex items-center justify-end gap-2">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <span className="text-[8px] font-medium text-slate-500 block break-words leading-tight">
                          {brand.teacherName || brand.branch}
                        </span>
                      )}
                      {previewDurationText && (
                        <span
                          className="text-[9px] font-mono font-bold text-white px-2 py-0.5 shadow-2xs inline-block shrink-0 whitespace-nowrap"
                          style={{ backgroundColor: effectivePrimary }}
                        >
                          SÜRE: {previewDurationText}
                        </span>
                      )}
                    </div>
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 9: ZÜMRÜT MİNİMALİST İNCE CETVEL (Karekök / Çözüm) */}
              {brand.headerStyle === 'slim-ruler' && (
                <div className="space-y-1 pb-1">
                  <div className="flex items-center justify-between pb-1.5 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo({ size: 'sm' })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[9px] font-black uppercase text-slate-900 block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight mt-0.5" style={{ color: effectivePrimary }}>
                            {docSettings.courseName || 'MATEMATİK'} · {docSettings.gradeLevel || 'TYT'}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-slate-400 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center flex-1 min-w-0 px-2">
                      <h3 className="text-xs font-black uppercase text-slate-900 break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[8px] font-bold text-slate-500 uppercase block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'KAZANIM TESTİ'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-slate-600 justify-end flex-1 min-w-0 pl-2 text-right">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <span className="text-[8px] font-medium text-slate-500 block break-words leading-tight">
                          {brand.teacherName || brand.branch}
                        </span>
                      )}
                      {previewDurationText && (
                        <span className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 shrink-0 whitespace-nowrap">
                          {previewDurationText}
                        </span>
                      )}
                      {brand.showTestNumberBadge !== false && (
                        <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 font-black shrink-0 whitespace-nowrap">
                          {docSettings.bookletType || 'A'}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Ruler Scale Pattern */}
                  <div
                    className="h-1.5 w-full border-t border-b"
                    style={{
                      borderColor: effectivePrimary,
                      backgroundImage: `repeating-linear-gradient(90deg, ${effectivePrimary}, ${effectivePrimary} 1px, transparent 1px, transparent 6px)`,
                    }}
                  />
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 10: TÜRKİYE GENELİ DENEME & ÇİFT KUTULU (TÖDER / Özdebir) */}
              {brand.headerStyle === 'toder-ozdebir' && (
                <div className="pb-2 space-y-1">
                  <div className="border-2 border-slate-900 p-2 flex items-center justify-between bg-slate-50 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      {renderPreviewLogo()}
                      <div className="bg-slate-900 text-white font-mono font-black text-xs px-2 py-1 shrink-0">
                        DENEME
                      </div>
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[9px] font-black uppercase text-slate-900 block break-words leading-tight">
                            {brand.instituteName}
                          </span>
                        )}
                        {brand.showCourseGrade !== false && (
                          <span className="text-[8px] font-bold uppercase text-slate-600 block break-words leading-tight mt-0.5">
                            {docSettings.courseName} · {docSettings.gradeLevel}
                          </span>
                        )}
                        {(brand.subTitle || brand.branch) && (
                          <span className="text-[8px] text-slate-400 block break-words leading-tight mt-0.5">
                            {brand.subTitle || brand.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center px-2 flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 break-words leading-tight">
                        {docSettings.title || previewTitle}
                      </h3>
                      <span className="text-[8px] font-bold text-slate-600 block mt-0.5 break-words">
                        {brand.testBandTitle || docSettings.termInfo || 'TÜRKİYE GENELİ'} {previewDurationText ? `· SÜRE: ${previewDurationText}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 justify-end flex-1 min-w-0 pl-2 text-right">
                      {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) && (
                        <span className="text-[8px] font-medium text-slate-500 block break-words leading-tight">
                          {brand.teacherName || brand.branch}
                        </span>
                      )}
                      {brand.showTestNumberBadge !== false && (
                        <div className="border-2 border-slate-900 bg-white px-2.5 py-1 text-center shrink-0">
                          <span className="text-[7px] uppercase font-bold text-slate-500 block leading-none">KİTAPÇIK</span>
                          <span className="text-xs font-mono font-black text-slate-900 leading-none">{docSettings.bookletType || 'A'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 11: OVAL KAPSÜL ROZETLİ & KAVİSLİ AYRAÇ */}
              {brand.headerStyle === 'oval-capsule' && (
                <div className="pb-2 text-center space-y-2">
                  <div
                    className="rounded-full px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs border transition-all"
                    style={{
                      backgroundColor: `${effectivePrimary}0a`,
                      borderColor: `${effectivePrimary}40`,
                    }}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                      {renderPreviewLogo({ size: 'sm' })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span
                            className="text-[9px] font-black uppercase tracking-wider block truncate"
                            style={{ color: effectivePrimary }}
                          >
                            {brand.instituteName}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 block truncate">
                          {docSettings.courseName} · {docSettings.gradeLevel}
                        </span>
                      </div>
                    </div>

                    <div className="text-center px-2 flex-[1.6] min-w-0">
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                        {docSettings.title || previewTitle}
                      </h3>
                      {(brand.testBandTitle || docSettings.termInfo) && (
                        <span
                          className="inline-block mt-0.5 px-3 py-0.5 rounded-full text-[9px] font-bold text-white shadow-2xs truncate max-w-full"
                          style={{ backgroundColor: effectivePrimary }}
                        >
                          {brand.testBandTitle || docSettings.termInfo}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0">
                      {previewDurationText && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
                          {previewDurationText}
                        </span>
                      )}
                      {brand.showTestNumberBadge !== false && (
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-black text-white shadow-xs shrink-0"
                          style={{ backgroundColor: effectivePrimary }}
                        >
                          {docSettings.bookletType || 'A'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kavisli Yay / Oval Çizgi Ayracı */}
                  <div className="flex items-center justify-center gap-2 px-6 pt-0.5">
                    <div
                      className="h-0.5 flex-1 rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${effectivePrimary}70, ${effectivePrimary})` }}
                    />
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: effectivePrimary }}
                    />
                    <div
                      className="h-0.5 flex-1 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${effectivePrimary}, ${effectivePrimary}70, transparent)` }}
                    />
                  </div>

                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 12: KAVİSLİ ÜST KEMER & YAY ÇİZGİLİ BAŞLIK */}
              {brand.headerStyle === 'curved-arch' && (
                <div className="pb-2 text-center space-y-2">
                  <div
                    className="rounded-t-[28px] rounded-b-xl p-3.5 sm:p-4 text-white relative shadow-xs flex items-center justify-between overflow-hidden gap-3"
                    style={{ background: `linear-gradient(145deg, ${effectivePrimary} 0%, ${effectiveSecondary || effectivePrimary} 100%)` }}
                  >
                    <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-white/15 pointer-events-none" />
                    <div className="absolute right-0 bottom-0 w-32 h-16 rounded-tl-[40px] bg-white/10 pointer-events-none" />

                    <div className="flex items-center gap-2.5 relative z-10 flex-1 min-w-0 text-left">
                      {renderPreviewLogo({ onDarkBg: true, size: 'sm' })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-200 block truncate">
                            {brand.instituteName}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-white/90 block truncate">
                          {docSettings.courseName} · {docSettings.gradeLevel}
                        </span>
                      </div>
                    </div>

                    <div className="text-center relative z-10 px-2 flex-[1.6] min-w-0">
                      <h3 className="text-xs sm:text-base font-black tracking-tight uppercase truncate drop-shadow-xs">
                        {docSettings.title || previewTitle}
                      </h3>
                      {(brand.testBandTitle || docSettings.termInfo) && (
                        <span className="inline-block mt-0.5 px-3 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white backdrop-blur-xs shadow-2xs truncate max-w-full">
                          {brand.testBandTitle || docSettings.termInfo}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 relative z-10 flex-1 min-w-0">
                      {previewDurationText && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/25 text-white whitespace-nowrap">
                          {previewDurationText}
                        </span>
                      )}
                      {brand.showTestNumberBadge !== false && (
                        <div className="w-8 h-8 rounded-full bg-white text-slate-900 font-mono font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                          {docSettings.bookletType || 'A'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center pt-0.5 px-4">
                    <svg className="w-full h-3" viewBox="0 0 400 12" preserveAspectRatio="none" fill="none">
                      <path
                        d="M 0,6 Q 200,12 400,6"
                        stroke={effectivePrimary}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="200" cy="9" r="3" fill={effectivePrimary} />
                    </svg>
                  </div>

                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 13: AKICI DALGALI BANT & EĞRİ ÇİZGİ */}
              {brand.headerStyle === 'wavy-ribbon' && (
                <div className="pb-2 text-center space-y-2">
                  <div
                    className="rounded-2xl p-3 sm:p-3.5 text-white relative shadow-xs flex items-center justify-between overflow-hidden gap-3"
                    style={{ background: `linear-gradient(120deg, ${effectivePrimary} 0%, ${effectiveSecondary || effectivePrimary} 100%)` }}
                  >
                    <div className="flex items-center gap-2.5 relative z-10 flex-1 min-w-0 text-left">
                      {renderPreviewLogo({ onDarkBg: true, size: 'sm' })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[9px] font-bold uppercase text-white/80 block truncate">
                            {brand.instituteName}
                          </span>
                        )}
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white truncate">
                          {docSettings.title || previewTitle}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10 shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-white/20 text-white backdrop-blur-xs">
                        {docSettings.courseName} · {docSettings.gradeLevel}
                      </span>
                      {brand.showTestNumberBadge !== false && (
                        <div className="px-2.5 py-1 rounded-full bg-white text-slate-900 font-mono font-black text-xs shadow-2xs">
                          {docSettings.bookletType || 'A'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-center pt-0.5 px-2">
                    <svg className="w-full h-3" viewBox="0 0 600 10" preserveAspectRatio="none" fill="none">
                      <path
                        d="M 0,5 C 150,0 150,10 300,5 C 450,0 450,10 600,5"
                        stroke={effectivePrimary}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 14: ÇİFT OVAL KAPSÜL & DAİRESEL MADALYON */}
              {brand.headerStyle === 'pill-modern' && (
                <div className="pb-2 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="rounded-full px-3.5 py-1.5 flex items-center gap-2.5 border shadow-2xs flex-1 min-w-0"
                      style={{
                        borderColor: `${effectivePrimary}40`,
                        backgroundColor: `${effectivePrimary}0a`,
                      }}
                    >
                      {renderPreviewLogo({ size: 'sm' })}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() && (
                          <span className="text-[8.5px] font-black uppercase text-slate-500 block truncate">
                            {brand.instituteName}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {docSettings.courseName} · {docSettings.gradeLevel}
                        </span>
                      </div>
                    </div>

                    {brand.showTestNumberBadge !== false && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-black text-white shadow-xs shrink-0 border-2 border-white ring-1"
                        style={{
                          backgroundColor: effectivePrimary,
                        }}
                      >
                        {docSettings.bookletType || 'A'}
                      </div>
                    )}

                    <div
                      className="rounded-full px-3.5 py-1.5 flex items-center justify-end gap-2 border shadow-2xs flex-1 min-w-0 text-right"
                      style={{
                        borderColor: `${effectivePrimary}40`,
                        backgroundColor: `${effectivePrimary}0a`,
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[11px] font-black uppercase text-slate-900 dark:text-white truncate">
                          {docSettings.title || previewTitle}
                        </h3>
                        <span className="text-[8.5px] font-semibold text-slate-500 block truncate">
                          {brand.testBandTitle || docSettings.termInfo || 'KAZANIM KAVRAMA TESTİ'}
                        </span>
                      </div>
                      {previewDurationText && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shrink-0">
                          {previewDurationText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4">
                    <div className="h-0.5 flex-1 rounded-full" style={{ backgroundColor: `${effectivePrimary}40` }} />
                    <span className="text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      ● SINAV KİTAPÇIĞI ●
                    </span>
                    <div className="h-0.5 flex-1 rounded-full" style={{ backgroundColor: `${effectivePrimary}40` }} />
                  </div>

                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* MODEL 12: ÖSYM RESMÎ TYT / AYT */}
              {brand.headerStyle === 'minimalist' && (
                <div className="pb-2 border-b-2 border-slate-900 space-y-1.5">
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
                      {renderPreviewLogo()}
                      <div className="min-w-0 flex-1">
                        {brand.instituteName?.trim() ? (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 block break-words">
                            {brand.instituteName} {(brand.subTitle || brand.branch) ? `· ${brand.subTitle || brand.branch}` : ''}
                          </span>
                        ) : null}
                        <h3 className="text-sm font-black text-slate-900 uppercase break-words leading-tight mt-0.5">
                          {docSettings.title || previewTitle}
                        </h3>
                        <p className="text-[9px] text-slate-500 font-semibold mt-0.5 break-words">
                          {brand.testBandTitle || docSettings.termInfo || 'TYT DENEME'}
                          {brand.showCourseGrade !== false ? ` · ${docSettings.courseName} (${docSettings.gradeLevel})` : ''}
                          {brand.showTeacherInfo !== false && (brand.teacherName || brand.branch) ? ` · ${brand.teacherName || brand.branch}` : ''}
                          {previewDurationText ? ` · Süre: ${previewDurationText}` : ''}
                        </p>
                      </div>
                    </div>
                    {brand.showTestNumberBadge !== false && (
                      <div className="border-2 border-slate-900 px-3 py-1 text-center font-mono font-black text-xs shrink-0">
                        {docSettings.bookletType || 'A'}
                      </div>
                    )}
                  </div>
                  {renderPreviewSubBanner()}
                  {renderPreviewStudentInfo()}
                </div>
              )}

              {/* 2. SORULAR GÖVDESİ & DİNAMİK ALT CEVAP ANAHTARI */}
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                {/* Sorular Grid / Akışı ve Orta Çizgi */}
                <div
                  className={`text-[10px] text-slate-800 relative flex-1 min-h-0 ${
                    brand.headerStyle === 'gradient-banner' || brand.headerStyle === 'wave-organic'
                      ? 'px-3 sm:px-4 pt-2'
                      : 'pt-1.5'
                  } ${
                    docSettings.columnCount === 2
                      ? `grid grid-cols-2 items-start ${
                          brand.spineDividerStyle === 'badge-text'
                            ? 'gap-8 sm:gap-10'
                            : brand.spineDividerStyle !== 'none'
                            ? docSettings.questionSpacing === 'compact'
                              ? 'gap-5'
                              : docSettings.questionSpacing === 'relaxed'
                              ? 'gap-8'
                              : 'gap-6 sm:gap-7'
                            : docSettings.questionSpacing === 'compact'
                            ? 'gap-3'
                            : docSettings.questionSpacing === 'relaxed'
                            ? 'gap-6'
                            : 'gap-4 sm:gap-5'
                        }`
                      : `flex flex-col ${
                          docSettings.questionSpacing === 'compact'
                            ? 'space-y-1.5'
                            : docSettings.questionSpacing === 'relaxed'
                            ? 'space-y-5'
                            : 'space-y-3'
                        }`
                  }`}
                >
                  {/* ORTA SÜTUN DİKEY ÇİZGİSİ & DİKEY METİN ROZETİ (YALNIZCA SORULAR ALANINDA - KÜNYEYE VEYA CEVAP ANAHTARINA ASLA TAŞMAZ) */}
                  {brand.spineDividerStyle !== 'none' && docSettings.columnCount === 2 && (
                    <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-0 pointer-events-none z-10">
                      <div
                        className="h-full"
                        style={{
                          borderLeft:
                            brand.spineDividerStyle === 'dashed'
                              ? '1px dashed #cbd5e1'
                              : brand.spineDividerStyle === 'double'
                              ? '3px double #94a3b8'
                              : `1px solid ${brand.spineDividerStyle === 'badge-text' ? effectivePrimary : `${effectivePrimary}40`}`,
                        }}
                      />
                      {brand.spineDividerStyle === 'badge-text' && (
                        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap z-20">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[7.5px] font-black tracking-wider text-white shadow-xs rotate-90 inline-block border border-white/40"
                            style={{ backgroundColor: effectivePrimary }}
                          >
                            {brand.spineText || '◄ TÜRKÇE SORU BANKASI ►'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DİNAMİK FORMAT ÖNİZLEME SORULARI & ALANLARI */}
                  {renderPreviewFormatQuestions()}
                </div>

                {/* DİNAMİK CEVAP OPTİK FORMU (Öğrenci Optik Kodlama Şeridi) */}
                {renderPreviewOpticForm()}

                {/* DİNAMİK CEVAP ANAHTARI (SAYFANIN EN ALTINDA, mt-auto İLE YAPIŞIK, ORTA ÇİZGİDEN TAMAMEN BAĞIMSIZ) */}
                {renderPreviewAnswerKey()}
              </div>

              {/* 3. UYUMLU ALT BİLGİ & CEVAP ANAHTARI ŞERİDİ */}
              <div
                className={`relative z-10 py-1.5 flex items-center justify-between text-[9px] font-bold text-slate-800 min-h-[32px] ${
                  brand.headerStyle === 'gradient-banner' || brand.headerStyle === 'wave-organic'
                    ? 'px-4'
                    : ''
                }`}
                style={{
                  borderTop:
                    brand.footerStyle === 'circle-badge'
                      ? `3px solid ${effectivePrimary}`
                      : brand.footerStyle === 'minimal-line'
                      ? `2px solid ${effectivePrimary}40`
                      : '1px solid #e2e8f0',
                }}
              >
                {/* Left: Institute Name only (NO tel, NO phone spam) */}
                <div className="flex-1 basis-0 flex items-center justify-start min-w-0 pr-2">
                  <span className="font-bold text-slate-800 truncate">
                    {brand.instituteName?.trim() || ''}
                  </span>
                </div>

                {/* Center: EXACTLY CENTERED CONFIGURABLE PAGE NUMBER */}
                <div className="shrink-0 flex items-center justify-center px-2">
                  {renderPreviewPageNumber(1, 3)}
                </div>

                {/* Right: Custom User Note or Clean Booklet badge */}
                <div className="flex-1 basis-0 flex items-center justify-end min-w-0 pl-2">
                  {brand.footerRightText ? (
                    <span className="text-[9px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      {brand.footerRightText}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-700 bg-black/5 px-2 py-0.5 rounded-xs whitespace-nowrap">
                      A Kitapçığı
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* MODAL: YENİ FORMAT TASARIMI OLUŞTUR */}
      {isNewFormatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
              isDark ? 'bg-[#1f222b] border-[#2c313d] text-[#f0f2f5]' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#2b303d]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Yeni Format Tasarımı Ekle</h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#949dae]">
                    Özel ders, etüt veya zümrenize özel oluşturma şablonu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFormatModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Format Başlığı</label>
                <input
                  type="text"
                  value={newFormatTitle}
                  onChange={(e) => setNewFormatTitle(e.target.value)}
                  placeholder="örn: 10. Sınıf Haftalık Matematik Ödevi"
                  className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-hidden ${
                    isDark ? 'bg-[#252934] border-[#343a49] focus:border-stone-500' : 'bg-slate-50 border-slate-200 focus:border-stone-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Temel Belge Türü</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { type: 'written' as const, label: 'Yazılı Sınav' },
                    { type: 'test' as const, label: 'Yaprak Test' },
                    { type: 'lecture' as const, label: 'Konu Föyü' },
                    { type: 'exam' as const, label: 'Deneme' },
                    { type: 'question_bank' as const, label: 'Soru Bankası' },
                  ].map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setNewFormatDocType(t.type)}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        newFormatDocType === t.type
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-2xs'
                          : isDark
                          ? 'bg-[#252934] text-[#cbd1de] border-[#343a49] hover:bg-[#2c3240]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Açıklama (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={newFormatDescription}
                  onChange={(e) => setNewFormatDescription(e.target.value)}
                  placeholder="örn: Her cuma dağıtılan 10 soruluk ödev fasikülü"
                  className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-hidden ${
                    isDark ? 'bg-[#252934] border-[#343a49] focus:border-stone-500' : 'bg-slate-50 border-slate-200 focus:border-stone-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#2b303d]">
              <button
                type="button"
                onClick={() => setIsNewFormatModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={!newFormatTitle.trim()}
                onClick={() => {
                  if (!newFormatTitle.trim()) return;
                  const newId = `custom-format-${Date.now()}`;
                  const newBp: FormatBlueprint = {
                    id: newId,
                    title: newFormatTitle.trim(),
                    docType: newFormatDocType,
                    description: newFormatDescription.trim() || `${newFormatTitle.trim()} için özel şablon tasarımı`,
                    isCustom: true,
                    brand: { ...brand },
                    settings: { ...docSettings },
                    updatedAt: new Date().toISOString(),
                  };
                  if (onAddNewBlueprint) onAddNewBlueprint(newBp);
                  setSelectedFormatId(newId);
                  setIsNewFormatModalOpen(false);
                  setNewFormatTitle('');
                  setNewFormatDescription('');
                  setFormatSaveToast(`"${newBp.title}" Formatı Eklendi!`);
                  setTimeout(() => setFormatSaveToast(null), 3000);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Formatı Oluştur &amp; Tasarla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
