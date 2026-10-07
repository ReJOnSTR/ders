export type DocumentType = 'test' | 'written' | 'lecture' | 'exam' | 'question_bank';

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'open_ended' | 'lecture_block';

export type QuestionPresentationFormat =
  | 'image_hybrid' // 1. Görsel + Soru Tipleri (Görsel üstte, altında tüm soru tipleri)
  | 'image_only' // 2. Sadece Görsel Soru (Kırpılmış kupür, soru/şıklar görselde)
  | 'image_ocr' // 3. Görselden Metne (Görsel içeriğini kopyalama ve metne ayrıştırma)
  | 'text_only'; // 4. Sadece Metinsel Soru (Görselsiz saf metin ve formüller)

export type BookletType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | string;

export type QuestionDifficulty = 'Kolay' | 'Orta' | 'Zor';

export interface QuestionItem {
  id: string;
  type: QuestionType;
  text: string;
  subText?: string; // Öncüller (I., II., III.) veya parça metni
  options: string[]; // ['A) ...', 'B) ...', 'C) ...', 'D) ...', 'E) ...']
  correctAnswer: string; // 'A', 'B', 'C', 'D', 'E', 'Doğru', 'Yanlış' or answer text
  solutionExplanation?: string; // Öğretmen çözümü
  points: number; // Soru puanı (özellikle yazılı sınav için)
  mebOutcomeCode?: string; // örn: MAT.9.2.1
  mebOutcomeText?: string; // örn: Fonksiyonun tanım kümesini bulur
  difficulty: QuestionDifficulty;
  courseName: string; // örn: Matematik, Fizik, Türkçe
  gradeLevel: string; // örn: "9. Sınıf", "TYT / YKS", "8. Sınıf / LGS"
  imageUrl?: string; // soru görseli veya kırpılan soru resmi
  imageWidthPercent?: number; // Görsel genişliği yüzdesi (%25 - %100, veya tanımsızsa doğal boyut)
  imageBorder?: boolean; // Görsel etrafında çerçeve çizgisi (varsayılan: false - çizgisiz)
  imageAlignment?: 'left' | 'center' | 'right'; // Görsel hizalaması (varsayılan: left)
  imageNaturalSize?: boolean; // Doğal boyutta orantılı göster (genişletme yapma)
  imageGrayscale?: boolean; // Siyah-beyaz yüksek kontrast baskı modu
  imageRotation?: number; // 0, 90, 180, 270 derece döndürme
  linesForAnswer?: number; // Açık uçlu sorularda öğrenci için bırakılacak çizgili satır sayısı (örn: 4, 6)
  // Soru Sunum Formatı (4 Format)
  presentationFormat?: QuestionPresentationFormat;
  // Sadece Görsel / Kırpılmış Soru Modu Alanları
  isImageOnly?: boolean; // Soru metni olmadan doğrudan görselle soru oluşturma modu
  optionsInImage?: boolean; // Şıklar görselin içinde mi yer alıyor (true: şık metinlerini gizle, sadece cevap anahtarı; false: kopyalanabilir şıklar)
  copyableOptions?: boolean; // Şıkların kopyalanabilir metin olarak yer alması
  // Konu Föyü için blok tipi
  blockType?: 'heading' | 'summary' | 'formula' | 'example' | 'warning' | 'practice';
  blockTitle?: string;
}

export interface BrandSettings {
  instituteName: string;
  subTitle: string;
  teacherName: string;
  branch: string;
  footerContact: string;
  primaryColor: string; // hex
  secondaryColor?: string; // hex for gradients, badges, accents
  fontFamily: 'sans' | 'serif' | 'mono';
  headerStyle:
    | 'gradient-banner'
    | 'brush-accent'
    | 'framed-rosette'
    | 'trapezoid-modern'
    | 'fasikul-band'
    | 'classic-meb'
    | 'minimalist'
    | 'oval-capsule'
    | 'curved-arch'
    | 'wavy-ribbon'
    | 'pill-modern'
    | 'double-line-capsule'
    | 'wave-organic'
    | 'retro-institution'
    | 'slim-ruler'
    | 'toder-ozdebir'
    | 'modern-publisher'
    | 'academic'
    | 'banner-gradient'
    | 'ribbon-tag';
  subtitleStyle?:
    | 'pill'
    | 'center-lines'
    | 'left-bar'
    | 'dark-strip'
    | 'clean'
    | 'oval-capsule-line'
    | 'curved-arch-line'
    | 'wavy-line'
    | 'double-pill'
    | 'circle-medallion-line';
  boxStyle?: 'rounded' | 'sharp' | 'bordered' | 'card' | 'minimal';
  answerAreaStyle?: 'lined' | 'dotted' | 'grid' | 'clean-box';
  optionStyle?: 'circle' | 'circle-fill' | 'square' | 'capsule' | 'bold-letter' | 'soft-card';
  paperTone?: 'white' | 'cream' | 'cool';
  questionBadgeStyle: 'square' | 'circle' | 'badge' | 'simple' | 'hexagon' | 'pill';
  questionPointsStyle?:
    | 'capsule-pill'
    | 'soft-badge'
    | 'circle-tag'
    | 'bold-framed'
    | 'bracket-mono'
    | 'minimal-parenthesis'
    | 'banner-tag'
    | 'ribbon-corner'
    | 'hexagon-tag'
    | 'stamp-badge';
  showQuestionPoints?: boolean;
  pointsTextFormat?: 'short-p' | 'full-puan' | 'num-only';
  defaultQuestionPoints?: number;
  pageFrameStyle?: 'none' | 'full-border' | 'corner-accents' | 'top-bottom-bars';
  spineDividerStyle?: 'solid' | 'dashed' | 'badge-text' | 'double' | 'none';
  spineText?: string;
  footerStyle?: 'dots-answer' | 'circle-badge' | 'minimal-line' | 'osym-turn-page' | 'barcode-isbn';
  pageNumberStyle?:
    | 'centered-hyphen'
    | 'circle-badge'
    | 'circle-outline'
    | 'pill-capsule'
    | 'fraction-slash'
    | 'bracket-boxed'
    | 'minimal-num'
    | 'double-dash-total'
    | 'none';
  instructionBoxText?: string;
  showInstructionBox?: boolean;
  instructionBoxStyle?: 'classic-border' | 'modern-pill' | 'highlight-callout' | 'subtle-fill';
  rosetteStyle?: 'scalloped' | 'square' | 'circle' | 'ribbon' | 'none';
  lectureBoxStyle?: 'highlight-bar' | 'formula-frame' | 'tip-badge' | 'clean-card' | 'curved-accent';
  gradientTheme?: 'warm-sunset' | 'deep-ocean' | 'royal-purple' | 'emerald-teal' | 'coral-rose';
  publishingSchool?: 'osym_exam' | 'meb_written' | 'yeni_nesil_banka' | 'fasikul_foy' | 'kurumsal_deneme';
  footerRightText?: string;
  columnDividerStyle?: 'dashed' | 'solid' | 'none';
  testBandTitle?: string;
  showLogo?: boolean;
  showStudentInfo?: boolean;
  studentInfoStyle?:
    | 'classic-dotted'
    | 'table-boxes'
    | 'badge-capsule'
    | 'corner-compact'
    | 'clean-underline'
    | 'official-meb'
    | 'score-table-matrix'
    | 'stamp-evaluation';
  answerKeyStyle?: 'bottom-strip' | 'boxed-grid' | 'compact-inline' | 'optic-bubbles' | 'table-bordered' | 'split-columns';
  opticFormQuestionCount?: number; // 0 for auto/questions.length, or explicit 5, 10, 15, 20, 25, 30, 40
  opticFormOptionCount?: 4 | 5; // 4 (A-D) or 5 (A-E)
  showTestNumberBadge?: boolean;
  showTopicBadge?: boolean;
  showTeacherInfo?: boolean;
  showCourseGrade?: boolean;
  showDuration?: boolean;
  showWatermark: boolean;
  watermarkText: string;
  watermarkOpacity: number; // 0.03 to 0.15
  logoType: 'preset-book' | 'preset-owl' | 'preset-torch' | 'preset-atom' | 'preset-laurel' | 'custom' | 'initials';
  customLogoUrl?: string;
  printColorMode: 'color' | 'monochrome';
  openEndedLines?: number;
  defaultQuestionPoints?: number;
  questionSpacing?: 'compact' | 'normal' | 'relaxed';
}

export interface DocumentSettings {
  title: string;
  subTitle: string;
  courseName: string;
  gradeLevel: string;
  academicYear: string;
  termInfo: string; // örn: "1. Dönem 1. Ortak Yazılı Sınavı"
  durationMinutes: number;
  bookletType: BookletType;
  columnCount: 1 | 2;
  paperFormat: 'A4' | 'A3' | 'B5' | 'Letter';
  orientation: 'portrait' | 'landscape';
  questionsPerPage: number; // 0 for auto, or 2, 3, 4, 5, 6, 8, 10
  manualPageBreaks?: number[]; // list of question indexes after which page breaks
  fontSizeScale?: 'compact' | 'normal' | 'large';
  openEndedLines?: number;
  defaultQuestionPoints?: number;
  questionSpacing?: 'compact' | 'normal' | 'relaxed';
  showOpticForm: boolean;
  opticFormPosition: 'bottom' | 'separate_page' | 'none';
  opticFormQuestionCount?: number; // 0 for auto, or explicit 5, 10, 15, 20, 25, 30, 40
  opticFormOptionCount?: 4 | 5; // 4 (A-D) or 5 (A-E)
  showAnswerKey: boolean;
  answerKeyStyle?: 'bottom-strip' | 'boxed-grid' | 'compact-inline' | 'optic-bubbles' | 'table-bordered' | 'split-columns';
  showOutcomes: boolean;
  showPointsTable?: boolean;
  isTeacherVersion: boolean; // Doğru cevap ve çözümleri göster
}

export interface MebOutcome {
  code: string;
  course: string;
  grade: string;
  topic: string;
  description: string;
}

export interface SavedDocument {
  id: string;
  title: string;
  subTitle?: string;
  docType: DocumentType;
  courseName: string;
  gradeLevel: string;
  settings: DocumentSettings;
  brand: BrandSettings;
  questions: QuestionItem[];
  updatedAt: string; // ISO date string or formatted date
  createdAt: string;
}

export interface FormatBlueprint {
  id: string; // e.g. 'written', 'test', 'lecture', 'exam', 'question_bank' or custom ID
  title: string; // e.g. 'MEB Resmî Ortak Yazılı Sınavı', 'Kazanım Odaklı Yaprak Test'
  docType: DocumentType;
  description: string;
  brand: BrandSettings;
  settings: Partial<DocumentSettings>;
  sampleTitle?: string;
  sampleCourse?: string;
  sampleGrade?: string;
  isCustom?: boolean;
  updatedAt?: string;
}
