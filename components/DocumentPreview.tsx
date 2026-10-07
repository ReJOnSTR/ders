'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  DocumentSettings,
  BrandSettings,
  DocumentType,
  QuestionItem
} from '@/types/studio';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Edit2,
  Check,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  PlusCircle,
  Scissors,
  SplitSquareVertical,
  FileText,
  Printer,
  AlertCircle,
  X,
  BookOpen,
  GraduationCap,
  Flame,
  Atom,
  Award,
  Building2,
  School,
  Shuffle,
  Plus,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';

interface DocumentPreviewProps {
  docType: DocumentType;
  settings: DocumentSettings;
  brand: BrandSettings;
  questions: QuestionItem[];
  onReorderQuestion: (fromIndex: number, toIndex: number) => void;
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestionPoints: (id: string, newPoints: number) => void;
  onUpdateQuestionText?: (id: string, newText: string) => void;
  onDuplicateQuestion?: (q: QuestionItem) => void;
  onQuickAddQuestion?: (afterIndex: number) => void;
  onTogglePageBreak?: (questionIndex: number) => void;
  onOpenSmartBoard: () => void;
  onEditQuestionModal?: (index: number) => void;
  theme?: 'light' | 'dark';
}

export default function DocumentPreview({
  docType,
  settings,
  brand,
  questions,
  onReorderQuestion,
  onRemoveQuestion,
  onUpdateQuestionText,
  onDuplicateQuestion,
  onQuickAddQuestion,
  onTogglePageBreak,
  onEditQuestionModal,
  theme = 'light',
}: DocumentPreviewProps) {
  const isDark = theme === 'dark';
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isZoomFabHovered, setIsZoomFabHovered] = useState(false);
  const [isZoomFabClicked, setIsZoomFabClicked] = useState(false);
  const zoomFabRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomFabRef.current && !zoomFabRef.current.contains(e.target as Node)) {
        setIsZoomFabClicked(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showZoomMenu = isZoomFabHovered || isZoomFabClicked;
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const handleStartEdit = (q: QuestionItem) => {
    setEditingQuestionId(q.id);
    setEditingText(q.text);
  };

  const handleSaveEdit = (id: string) => {
    if (onUpdateQuestionText && editingText.trim()) {
      onUpdateQuestionText(id, editingText.trim());
    }
    setEditingQuestionId(null);
  };

  const handleFitToWidth = () => {
    if (typeof window === 'undefined') return;
    const availableWidth = containerRef.current
      ? containerRef.current.clientWidth - 48
      : window.innerWidth - 64;
    const paperPx =
      paperFormat === 'A3'
        ? orientation === 'landscape'
          ? 1587
          : 1122
        : paperFormat === 'A4'
        ? orientation === 'landscape'
          ? 1122
          : 794
        : paperFormat === 'B5'
        ? 665
        : 794;
    const calculatedScale = Math.min(100, Math.max(35, Math.floor((availableWidth / paperPx) * 100)));
    setZoomLevel(calculatedScale);
  };

  // Determine Paper Dimension Classes
  const paperFormat = settings.paperFormat || 'A4';
  const orientation = settings.orientation || 'portrait';

  const paperWidthMm = useMemo(() => {
    if (paperFormat === 'A3') return orientation === 'landscape' ? '420mm' : '297mm';
    if (paperFormat === 'A4') return orientation === 'landscape' ? '297mm' : '210mm';
    if (paperFormat === 'B5') return '176mm';
    if (paperFormat === 'Letter') return orientation === 'landscape' ? '279.4mm' : '215.9mm';
    return '210mm';
  }, [paperFormat, orientation]);

  const paperClass = useMemo(() => {
    if (paperFormat === 'A3') return orientation === 'landscape' ? 'paper-dim-A3-landscape' : 'paper-dim-A3-portrait';
    if (paperFormat === 'A4') return orientation === 'landscape' ? 'paper-dim-A4-landscape' : 'paper-dim-A4-portrait';
    if (paperFormat === 'B5') return 'paper-dim-B5-portrait';
    if (paperFormat === 'Letter') return orientation === 'landscape' ? 'paper-dim-Letter-landscape' : 'paper-dim-Letter-portrait';
    return 'paper-dim-A4-portrait';
  }, [paperFormat, orientation]);

  const paperWidthClass = useMemo(() => {
    if (paperFormat === 'A3') return orientation === 'landscape' ? 'max-w-[420mm]' : 'max-w-[297mm]';
    if (paperFormat === 'A4') return orientation === 'landscape' ? 'max-w-[297mm]' : 'max-w-[210mm]';
    if (paperFormat === 'B5') return 'max-w-[176mm]';
    if (paperFormat === 'Letter') return orientation === 'landscape' ? 'max-w-[279.4mm]' : 'max-w-[215.9mm]';
    return 'max-w-[210mm]';
  }, [paperFormat, orientation]);

  // Intelligent physical height budgeting system to ensure NO page ever exceeds its paper format
  interface PageColumnData {
    left: QuestionItem[];
    right: QuestionItem[];
    all: QuestionItem[];
  }

  const { pages, needsDedicatedAttachmentPage } = useMemo(() => {
    if (questions.length === 0) return { pages: [{ left: [], right: [], all: [] }], needsDedicatedAttachmentPage: false };

    const manualBreaks = new Set(settings.manualPageBreaks || []);
    const explicitPerPage = settings.questionsPerPage || 0;

    // Physical Paper usable heights (in mm)
    const paperHeights: Record<string, number> = {
      'A4-portrait': 297,
      'A4-landscape': 210,
      'A3-portrait': 420,
      'A3-landscape': 297,
      'B5-portrait': 250,
      'Letter-portrait': 279.4,
      'Letter-landscape': 215.9,
    };
    const key = `${paperFormat}-${orientation}`;
    const rawHeight = paperHeights[key] || 297;

    // Fixed vertical overheads (in mm)
    const paddingHeight = 26; // 13mm top + 13mm bottom padding
    const footerHeight = 14;

    // Header heights (mm) - realistically estimated based on modular header components
    let page1HeaderHeight = 40;
    if (docType === 'written') {
      page1HeaderHeight = 52;
    } else if (docType === 'lecture') {
      page1HeaderHeight = 44;
    } else {
      page1HeaderHeight = 40;
    }
    if (brand.showInstructionBox && brand.instructionBoxText?.trim()) page1HeaderHeight += 16;
    if (brand.showStudentInfo) page1HeaderHeight += 24;
    if (brand.subTitle) page1HeaderHeight += 6;
    if (brand.customLogoUrl) page1HeaderHeight += 6;

    const runningHeaderHeight = 16;

    // Available usable column height for questions (ample cushion so content NEVER collides or gets squeezed)
    const page1UsableH = Math.max(50, (rawHeight - paddingHeight - page1HeaderHeight - footerHeight) * 0.88);
    const nextPageUsableH = Math.max(50, (rawHeight - paddingHeight - runningHeaderHeight - footerHeight) * 0.90);

    // Font scale adjustment
    const fontMultiplier =
      settings.fontSizeScale === 'compact' ? 1.15 : settings.fontSizeScale === 'large' ? 0.88 : 1.0;

    const isTwoCol = settings.columnCount === 2 && docType !== 'lecture';
    const page1ColBudget = page1UsableH * fontMultiplier;
    const nextPageColBudget = nextPageUsableH * fontMultiplier;

    // Realistic Height estimator for a single question or note block (in mm)
    const getQHeight = (q: QuestionItem) => {
      let h = 18; // base badge + margins + breathing room

      if (q.type === 'lecture_block') {
        const text = q.text || '';
        const lines = text ? text.split('\n').reduce((acc, line) => {
          return acc + Math.max(1, Math.ceil(line.length / (isTwoCol ? 32 : 72)));
        }, 0) : 1;
        h = 24 + lines * 5.2;
        if (settings.isTeacherVersion && q.solutionExplanation && q.blockType !== 'formula' && q.blockType !== 'summary') {
          const solLines = Math.max(1, Math.ceil(q.solutionExplanation.length / (isTwoCol ? 32 : 70)));
          h += solLines * 4.6 + 12;
        }
        return h + 6;
      }

      // Question statement text length (accounting for newlines properly)
      const text = q.text || '';
      const textLines = text ? text.split('\n').reduce((acc, line) => {
        return acc + Math.max(1, Math.ceil(line.length / (isTwoCol ? 32 : 72)));
      }, 0) : 1;
      h += textLines * 5.0;

      // Subtext (Öncüller, ön bilgi vs.)
      if (q.subText) {
        const subLines = q.subText.split('\n').reduce((acc, line) => {
          return acc + Math.max(1, Math.ceil(line.length / (isTwoCol ? 30 : 68)));
        }, 0);
        h += subLines * 4.8 + 8;
      }

      // Image
      if (q.imageUrl && q.presentationFormat !== 'text_only') {
        const isImgOnly = q.presentationFormat === 'image_only' || q.isImageOnly || (!q.text && !!q.imageUrl);
        h += isImgOnly ? 68 : 38;
      }

      // Options
      if (q.type === 'multiple_choice' && q.options?.length && !q.optionsInImage) {
        const allVeryShort = q.options.every((opt) => opt.replace(/^[A-E]\)\s*/i, '').trim().length <= 5);
        if (isTwoCol) {
          const rows = allVeryShort ? Math.ceil(q.options.length / 2) : q.options.length;
          h += rows * 6.5 + 4;
        } else {
          const rows = allVeryShort ? 1 : Math.ceil(q.options.length / 2);
          h += rows * 6.8 + 4;
        }
      } else if (q.type === 'open_ended') {
        const lines = Math.min(8, Math.max(2, q.linesForAnswer || 4));
        h += lines * 5.5 + 10;
      } else if (q.type === 'true_false' || q.type === 'fill_blank') {
        h += 16;
      }

      // Teacher Solution
      if (settings.isTeacherVersion && q.solutionExplanation) {
        const solLines = Math.max(1, Math.ceil(q.solutionExplanation.length / (isTwoCol ? 30 : 68)));
        h += solLines * 4.6 + 14;
      }

      return h + 6;
    };

    const result: PageColumnData[] = [];
    let curLeft: QuestionItem[] = [];
    let curRight: QuestionItem[] = [];
    let curLeftH = 0;
    let curRightH = 0;
    let onRight = false;

    const finishPage = () => {
      result.push({
        left: curLeft,
        right: curRight,
        all: [...curLeft, ...curRight],
      });
      curLeft = [];
      curRight = [];
      curLeftH = 0;
      curRightH = 0;
      onRight = false;
    };

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qH = getQHeight(q);
      const isManualBreak = manualBreaks.has(i);
      const totalOnCurPage = curLeft.length + curRight.length;
      const exceedsExplicitCap = explicitPerPage > 0 && totalOnCurPage >= explicitPerPage;

      if (isManualBreak || exceedsExplicitCap) {
        if (totalOnCurPage > 0) {
          finishPage();
        }
      }

      const activeBudget = (result.length === 0) ? page1ColBudget : nextPageColBudget;

      if (isTwoCol) {
        if (!onRight) {
          if (curLeft.length === 0 || curLeftH + qH <= activeBudget) {
            curLeft.push(q);
            curLeftH += qH;
          } else {
            // Left column filled, move to right column
            onRight = true;
            if (curRight.length === 0 || curRightH + qH <= activeBudget) {
              curRight.push(q);
              curRightH += qH;
            } else {
              // Both full, next page
              finishPage();
              curLeft.push(q);
              curLeftH += qH;
            }
          }
        } else {
          // Already on right column
          if (curRight.length === 0 || curRightH + qH <= activeBudget) {
            curRight.push(q);
            curRightH += qH;
          } else {
            // Page full, next page
            finishPage();
            curLeft.push(q);
            curLeftH += qH;
          }
        }
      } else {
        // Single column
        if (curLeft.length === 0 || curLeftH + qH <= activeBudget) {
          curLeft.push(q);
          curLeftH += qH;
        } else {
          finishPage();
          curLeft.push(q);
          curLeftH += qH;
        }
      }
    }

    if (curLeft.length > 0 || curRight.length > 0) {
      finishPage();
    }

    // Check if attachments (Optic Form & Answer Key) fit on the final question page
    const hasAttachments = (settings.showOpticForm || settings.showAnswerKey) && questions.length > 0;
    let needsDedicatedAttachment = false;

    if (hasAttachments && result.length > 0) {
      const lastPage = result[result.length - 1];
      const isFirst = result.length === 1;
      const budget = isFirst ? page1ColBudget : nextPageColBudget;
      const maxColH = isTwoCol
        ? Math.max(
            lastPage.left.reduce((a, q) => a + getQHeight(q), 0),
            lastPage.right.reduce((a, q) => a + getQHeight(q), 0)
          )
        : lastPage.all.reduce((a, q) => a + getQHeight(q), 0);
      const attachmentsH = (settings.showOpticForm ? 44 : 0) + (settings.showAnswerKey ? 24 : 0);

      if (maxColH + attachmentsH > budget) {
        needsDedicatedAttachment = true;
      }
    }

    return { pages: result, needsDedicatedAttachmentPage: needsDedicatedAttachment };
  }, [
    questions,
    settings.questionsPerPage,
    settings.manualPageBreaks,
    settings.columnCount,
    settings.fontSizeScale,
    settings.isTeacherVersion,
    settings.showOpticForm,
    settings.showAnswerKey,
    paperFormat,
    orientation,
    docType,
    brand.showInstructionBox,
    brand.instructionBoxText,
    brand.showStudentInfo,
    brand.subTitle,
    brand.customLogoUrl
  ]);

  const totalPages = pages.length + (needsDedicatedAttachmentPage ? 1 : 0);

  // Get 2-letter monogram for institute
  const getMonogram = (name?: string) => {
    if (!name) return 'TS';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Render Modular Brand Logo (Custom uploaded corporate logo only - no fake armas)
  const renderLogo = (options?: { size?: 'sm' | 'md' | 'lg'; onDarkBg?: boolean }) => {
    if (brand.showLogo === false || !brand.customLogoUrl) return null;

    const onDark = options?.onDarkBg ?? false;
    const size = options?.size ?? 'md';

    const sizeClass =
      size === 'sm'
        ? 'h-8 w-8 min-w-[32px] text-xs'
        : size === 'lg'
        ? 'h-11 w-11 min-w-[44px] text-base'
        : 'h-9 w-9 min-w-[36px] text-sm';

    return (
      <div
        className={`${sizeClass} rounded-xs p-0.5 flex items-center justify-center shrink-0 border ${
          onDark
            ? 'bg-white/95 border-white/40 shadow-2xs'
            : 'bg-white border-stone-200 shadow-2xs'
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

  // Render Configurable Page Number Design (Centered directly on footer boundary)
  const renderPageNumber = (pageNumber: number, totalPages: number) => {
    const isMono = brand.printColorMode === 'monochrome';
    const primaryBg = isMono ? '#1f2937' : brand.primaryColor || '#0284c7';

    // Style determined by pageNumberStyle or fallback from footerStyle
    const style =
      brand.pageNumberStyle ||
      (brand.footerStyle === 'circle-badge' ? 'circle-badge' : 'centered-hyphen');

    if (style === 'none') return null;

    if (style === 'circle-badge') {
      return (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white font-black text-[11px] leading-none select-none shadow-xs text-center shrink-0 tabular-nums"
          style={{ backgroundColor: primaryBg }}
          title={`Sayfa ${pageNumber}`}
        >
          <span className="inline-block leading-none text-center select-none">{pageNumber}</span>
        </span>
      );
    }

    if (style === 'circle-outline') {
      return (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 font-black text-[11px] leading-none bg-white select-none shadow-xs text-center shrink-0 tabular-nums"
          style={{ borderColor: primaryBg, color: primaryBg }}
          title={`Sayfa ${pageNumber}`}
        >
          <span className="inline-block leading-none text-center select-none">{pageNumber}</span>
        </span>
      );
    }

    if (style === 'pill-capsule') {
      return (
        <div
          className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border select-none bg-white shadow-2xs leading-none"
          style={{ borderColor: primaryBg, color: primaryBg }}
        >
          Sayfa {pageNumber}
        </div>
      );
    }

    if (style === 'bracket-boxed') {
      return (
        <div className="px-2 py-0.5 border border-stone-300 bg-white font-mono font-bold text-[9px] text-stone-900 rounded-xs select-none shadow-2xs leading-none">
          [ {pageNumber} ]
        </div>
      );
    }

    if (style === 'fraction-slash') {
      return (
        <div className="bg-transparent px-1 font-mono font-bold text-stone-800 text-[10px] whitespace-nowrap select-none leading-none">
          Sayfa {pageNumber} / {totalPages}
        </div>
      );
    }

    if (style === 'double-dash-total') {
      return (
        <div className="bg-transparent px-1 font-mono font-bold text-stone-800 text-[10px] whitespace-nowrap select-none leading-none">
          — {pageNumber} / {totalPages} —
        </div>
      );
    }

    if (style === 'minimal-num') {
      return (
        <div className="bg-transparent px-1 font-black text-stone-900 text-xs select-none leading-none">
          {pageNumber}
        </div>
      );
    }

    // Default: 'centered-hyphen' (- 1 -)
    return (
      <div className="bg-transparent px-1 font-mono font-bold text-stone-800 text-[10px] whitespace-nowrap select-none leading-none">
        - {pageNumber} -
      </div>
    );
  };

  // Render Modular Student Information Area
  const renderStudentInfoArea = (compact = false) => {
    if (!brand.showStudentInfo && docType !== 'written') return null;

    const style = brand.studentInfoStyle || 'classic-dotted';
    const isMono = brand.printColorMode === 'monochrome';
    const primaryBg = isMono ? '#1f2937' : brand.primaryColor || '#0284c7';

    if (style === 'table-boxes') {
      return (
        <div
          className={`border text-[9px] select-none w-full flex divide-x rounded-none shadow-2xs ${
            compact ? 'mt-1' : 'mt-2'
          }`}
          style={{ borderColor: `${primaryBg}50`, backgroundColor: `${primaryBg}05` }}
        >
          <div
            className="flex-[2] p-1 font-bold flex items-center justify-between"
            style={{ backgroundColor: `${primaryBg}14`, color: primaryBg, borderColor: `${primaryBg}35` }}
          >
            <span>Adı ve Soyadı:</span>
            <span className="opacity-50 font-normal">...................................</span>
          </div>
          <div
            className="flex-1 p-1 flex items-center justify-between"
            style={{ backgroundColor: `${primaryBg}08`, borderColor: `${primaryBg}35` }}
          >
            <span className="font-bold" style={{ color: primaryBg }}>Sınıf/Şube:</span>
            <span className="opacity-50 font-normal" style={{ color: primaryBg }}>.....</span>
          </div>
          <div
            className="flex-1 p-1 flex items-center justify-between"
            style={{ backgroundColor: `${primaryBg}08`, borderColor: `${primaryBg}35` }}
          >
            <span className="font-bold" style={{ color: primaryBg }}>Okul No:</span>
            <span className="opacity-50 font-normal" style={{ color: primaryBg }}>.....</span>
          </div>
          <div
            className="w-16 p-1 text-center font-black flex items-center justify-center text-white"
            style={{ color: '#ffffff', backgroundColor: primaryBg, borderColor: `${primaryBg}50` }}
          >
            <span>NOT: [ &nbsp; ]</span>
          </div>
        </div>
      );
    }

    if (style === 'badge-capsule') {
      return (
        <div
          className={`flex items-center gap-1.5 text-[8.5px] select-none w-full flex-wrap ${
            compact ? 'mt-1' : 'mt-2'
          }`}
        >
          <div
            className="flex items-center rounded-none border overflow-hidden shadow-2xs flex-[2] min-w-[130px]"
            style={{ borderColor: `${primaryBg}60` }}
          >
            <span className="px-1.5 py-0.5 text-white font-bold text-[8px]" style={{ backgroundColor: primaryBg }}>ÖĞRENCİ</span>
            <span className="px-2 py-0.5 bg-white text-stone-500 flex-1 truncate" style={{ borderColor: `${primaryBg}40` }}>Ad Soyad .........................</span>
          </div>
          <div
            className="flex items-center rounded-none border overflow-hidden shadow-2xs flex-1 min-w-[65px]"
            style={{ borderColor: `${primaryBg}60` }}
          >
            <span className="px-1.5 py-0.5 text-white font-bold text-[8px]" style={{ backgroundColor: primaryBg }}>SINIF</span>
            <span className="px-2 py-0.5 bg-white flex-1 font-bold" style={{ color: primaryBg }}>.....</span>
          </div>
          <div
            className="flex items-center rounded-none border overflow-hidden shadow-2xs flex-1 min-w-[60px]"
            style={{ borderColor: `${primaryBg}60` }}
          >
            <span className="px-1.5 py-0.5 text-white font-bold text-[8px]" style={{ backgroundColor: primaryBg }}>NO</span>
            <span className="px-2 py-0.5 bg-white flex-1 font-bold" style={{ color: primaryBg }}>.....</span>
          </div>
          <div
            className="flex items-center rounded-none border overflow-hidden shadow-2xs shrink-0"
            style={{ borderColor: `${primaryBg}60` }}
          >
            <span className="px-1.5 py-0.5 text-white font-bold text-[8px]" style={{ backgroundColor: primaryBg }}>PUAN</span>
            <span className="px-2 py-0.5 bg-white font-black font-mono" style={{ color: primaryBg }}>[ &nbsp; ]</span>
          </div>
        </div>
      );
    }

    if (style === 'corner-compact') {
      return (
        <div
          className={`rounded-none border p-1 text-[8.5px] select-none w-full flex items-center justify-between shadow-2xs ${
            compact ? 'mt-1' : 'mt-2'
          }`}
          style={{ borderColor: `${primaryBg}45`, backgroundColor: `${primaryBg}08` }}
        >
          <div className="flex items-center gap-3">
            <span><strong style={{ color: primaryBg }}>Adı Soyadı:</strong> ....................................</span>
            <span><strong style={{ color: primaryBg }}>Sınıf:</strong> .....</span>
            <span><strong style={{ color: primaryBg }}>No:</strong> .....</span>
          </div>
          <div
            className="font-bold px-2 py-0.5 rounded-none border shadow-2xs"
            style={{ backgroundColor: `${primaryBg}18`, color: primaryBg, borderColor: `${primaryBg}50` }}
          >
            Puan: [ &nbsp; ]
          </div>
        </div>
      );
    }

    if (style === 'clean-underline') {
      return (
        <div
          className={`py-1 text-[9px] select-none w-full border-b pb-1 ${
            compact ? 'mt-1' : 'mt-2'
          }`}
          style={{ borderColor: primaryBg }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-[2] flex items-center gap-1">
              <span className="font-bold" style={{ color: primaryBg }}>Öğrenci:</span>
              <span className="border-b border-solid flex-1 inline-block h-1" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="flex-1 flex items-center gap-1">
              <span className="font-bold" style={{ color: primaryBg }}>Sınıf:</span>
              <span className="border-b border-solid flex-1 inline-block h-1" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="flex-1 flex items-center gap-1">
              <span className="font-bold" style={{ color: primaryBg }}>No:</span>
              <span className="border-b border-solid flex-1 inline-block h-1" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="shrink-0 flex items-center gap-1 font-bold">
              <span style={{ color: primaryBg }}>Puan:</span>
              <span
                className="border rounded-none px-1.5"
                style={{ borderColor: primaryBg, color: primaryBg, backgroundColor: `${primaryBg}12` }}
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
          className={`text-stone-900 text-[8.5px] select-none w-full rounded-none shadow-2xs divide-y border ${
            compact ? 'mt-1' : 'mt-2'
          }`}
          style={{ borderColor: primaryBg, backgroundColor: `${primaryBg}05` }}
        >
          <div
            className="px-2 py-0.5 flex items-center justify-between gap-2 font-bold text-white shadow-2xs"
            style={{ backgroundColor: primaryBg }}
          >
            <span className="truncate">T.C. MİLLÎ EĞİTİM BAKANLIĞI ORTAK YAZILI SINAV PROTOKOLÜ</span>
            <span className="shrink-0 font-mono text-[7.5px] bg-white/20 px-1 py-0.2 rounded-xs">SENARYO-1</span>
          </div>
          <div className="p-1.5 grid grid-cols-12 gap-1.5 items-center">
            <div className="col-span-5 flex items-center gap-1">
              <span className="font-bold" style={{ color: primaryBg }}>Öğrenci:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <span className="font-bold" style={{ color: primaryBg }}>Şube:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <span className="font-bold" style={{ color: primaryBg }}>No:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="col-span-3 flex items-center justify-end gap-1 font-bold">
              <span style={{ color: primaryBg }}>NOTU:</span>
              <span
                className="border px-1.5 py-0.2 font-mono text-[9px] shadow-2xs"
                style={{ borderColor: primaryBg, color: primaryBg, backgroundColor: `${primaryBg}15` }}
              >
                [ &nbsp;&nbsp; ]
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'score-table-matrix') {
      const sampleQuestionCount = Math.min(10, Math.max(5, questions.length || 5));
      return (
        <div
          className={`border text-[8px] select-none w-full rounded-none shadow-2xs divide-y ${
            compact ? 'mt-1' : 'mt-2'
          }`}
          style={{ borderColor: primaryBg, backgroundColor: `${primaryBg}04` }}
        >
          {/* Üst Satır: Öğrenci Bilgileri */}
          <div className="p-1.5 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5 flex items-center gap-1">
              <span className="font-bold text-[8.5px]" style={{ color: primaryBg }}>Adı Soyadı:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="col-span-3 flex items-center gap-1">
              <span className="font-bold text-[8.5px]" style={{ color: primaryBg }}>Sınıf/Şube:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="col-span-4 flex items-center gap-1">
              <span className="font-bold text-[8.5px]" style={{ color: primaryBg }}>Okul No:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
          </div>
          {/* Alt Satır: Soru Puan Dağılım Tablosu */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="text-[7.5px] font-bold text-white divide-x divide-white/20" style={{ backgroundColor: primaryBg }}>
                  <th className="py-0.5 px-1 w-14 font-black">SORU NO</th>
                  {Array.from({ length: sampleQuestionCount }).map((_, idx) => (
                    <th key={idx} className="py-0.5 px-1 font-mono">{idx + 1}</th>
                  ))}
                  <th className="py-0.5 px-1.5 font-black bg-black/25">TOPLAM</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-[8px] font-mono divide-x divide-stone-300/70" style={{ backgroundColor: `${primaryBg}08` }}>
                  <td className="py-0.5 px-1 font-bold text-[7.5px]" style={{ color: primaryBg }}>PUAN</td>
                  {Array.from({ length: sampleQuestionCount }).map((_, idx) => (
                    <td key={idx} className="py-0.5 px-1 text-stone-400">....</td>
                  ))}
                  <td className="py-0.5 px-1.5 font-bold font-mono text-[9px]" style={{ color: primaryBg }}>/ 100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (style === 'stamp-evaluation') {
      return (
        <div
          className={`border text-[8.5px] select-none w-full flex items-center justify-between p-1.5 rounded-none shadow-2xs gap-2 ${
            compact ? 'mt-1' : 'mt-2'
          }`}
          style={{ borderColor: `${primaryBg}60`, backgroundColor: `${primaryBg}05` }}
        >
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1 col-span-2">
              <span className="font-bold" style={{ color: primaryBg }}>Adı Soyadı:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold" style={{ color: primaryBg }}>Sınıf:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <span className="font-bold" style={{ color: primaryBg }}>Okul No:</span>
              <span className="border-b border-dotted flex-1 h-2" style={{ borderColor: `${primaryBg}80` }} />
            </div>
            <div className="flex items-center gap-1 text-[7.5px] text-stone-500">
              <span>Tarih: ____/____/20__</span>
            </div>
          </div>
          {/* Resmî Değerlendirme Kaşesi */}
          <div
            className="w-28 shrink-0 border-2 border-dashed p-1 text-center rounded-none shadow-2xs"
            style={{ borderColor: primaryBg, backgroundColor: `${primaryBg}10` }}
          >
            <div className="text-[7px] font-black uppercase tracking-wider" style={{ color: primaryBg }}>
              DEĞERLENDİRME NOTU
            </div>
            <div className="text-[12px] font-mono font-black my-0.5" style={{ color: primaryBg }}>
              [ &nbsp;&nbsp;&nbsp;&nbsp; ]
            </div>
            <div className="text-[6.5px] font-bold text-stone-500">Öğretmen İmzası</div>
          </div>
        </div>
      );
    }

    // Default: classic-dotted
    return (
      <div
        className={`rounded-none border p-2 text-[10px] select-none shadow-2xs ${
          compact ? 'w-full sm:w-64' : 'w-full mt-2'
        }`}
        style={{ borderColor: `${primaryBg}45`, backgroundColor: `${primaryBg}08` }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-1">
            <span className="font-bold shrink-0" style={{ color: primaryBg }}>Adı Soyadı:</span>
            <span className="border-b border-dotted flex-1 min-w-[50px] inline-block h-3" style={{ borderColor: `${primaryBg}80` }} />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold shrink-0" style={{ color: primaryBg }}>Sınıf/Şube:</span>
            <span className="border-b border-dotted flex-1 min-w-[30px] inline-block h-3" style={{ borderColor: `${primaryBg}80` }} />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold shrink-0" style={{ color: primaryBg }}>Okul No:</span>
            <span className="border-b border-dotted flex-1 min-w-[30px] inline-block h-3" style={{ borderColor: `${primaryBg}80` }} />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold shrink-0" style={{ color: primaryBg }}>Puan:</span>
            <span className="border-b border-dotted flex-1 min-w-[25px] inline-block h-3" style={{ borderColor: `${primaryBg}80` }} />
          </div>
        </div>
      </div>
    );
  };

  // Render Question Number Badge
  const renderQuestionBadge = (num: number) => {
    const isMono = brand.printColorMode === 'monochrome';
    const bg = isMono ? '#1f2937' : brand.primaryColor;

    switch (brand.questionBadgeStyle) {
      case 'circle':
        return (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black"
            style={{ borderColor: bg, color: bg }}
          >
            {num}
          </span>
        );
      case 'square':
        return (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-mono font-black text-white shadow-2xs"
            style={{ backgroundColor: bg }}
          >
            {num}
          </span>
        );
      case 'hexagon':
        return (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-white text-[10px] font-black rotate-3 shadow-2xs"
            style={{ backgroundColor: bg }}
          >
            {num}
          </span>
        );
      case 'pill':
        return (
          <span
            className="inline-flex items-center rounded-full overflow-hidden text-[9px] font-black shrink-0 shadow-2xs"
            style={{ border: `1px solid ${bg}` }}
          >
            <span className="px-1 text-white" style={{ backgroundColor: bg }}>S</span>
            <span className="px-1 bg-white" style={{ color: bg }}>{num}</span>
          </span>
        );
      case 'simple':
        return (
          <span
            className="text-xs font-black tracking-tight"
            style={{ color: bg }}
          >
            {num}.
          </span>
        );
      case 'badge':
      default:
        return (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white shadow-2xs"
            style={{ backgroundColor: bg }}
          >
            {num}
          </span>
        );
    }
  };

  // Render Question Points Badge
  const renderQuestionPoints = (points: number = 10, currentDocType: DocumentType) => {
    if (brand.showQuestionPoints === false) return null;
    const isVisible = currentDocType === 'written' || brand.showQuestionPoints === true;
    if (!isVisible) return null;

    const isMono = brand.printColorMode === 'monochrome';
    const bg = isMono ? '#1f2937' : brand.primaryColor || '#0284c7';
    const format = brand.pointsTextFormat || 'short-p';
    const pointText = format === 'full-puan' ? `${points} Puan` : format === 'num-only' ? `${points}` : `${points}p`;
    const style = brand.questionPointsStyle || 'capsule-pill';

    switch (style) {
      case 'capsule-pill':
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shrink-0 shadow-2xs border transition-all"
            style={{
              backgroundColor: isMono ? '#f3f4f6' : `${bg}14`,
              color: isMono ? '#111827' : bg,
              borderColor: isMono ? '#d1d5db' : `${bg}40`,
            }}
          >
            ({pointText})
          </span>
        );
      case 'soft-badge':
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono shrink-0 border"
            style={{
              backgroundColor: isMono ? '#f3f4f6' : '#f8fafc',
              color: isMono ? '#374151' : '#334155',
              borderColor: isMono ? '#d1d5db' : '#cbd5e1',
            }}
          >
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
              backgroundColor: isMono ? '#f3f4f6' : `${bg}16`,
              color: isMono ? '#111827' : bg,
              borderColor: isMono ? '#d1d5db' : `${bg}45`,
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
              borderColor: isMono ? '#111827' : bg,
              color: isMono ? '#111827' : bg,
              backgroundColor: isMono ? '#f9fafb' : `${bg}08`,
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

  // Render Full Header on Page 1
  const renderPage1Header = () => {
    const isMono = brand.printColorMode === 'monochrome';
    const primaryBg = isMono ? '#111827' : brand.primaryColor;
    const secondaryBg = isMono ? '#374151' : brand.secondaryColor || brand.primaryColor;
    const borderCol = isMono ? '#374151' : brand.primaryColor;
    const headerGradient = `linear-gradient(135deg, ${primaryBg} 0%, ${secondaryBg} 100%)`;

    // Helper: student info block under header if written or requested
    const studentInfoBlock = renderStudentInfoArea();

    // Helper: modular custom note / announcement box & Teacher Version Banner for all models
    const teacherBanner = settings.isTeacherVersion ? (
      <div className="my-1.5 py-1 px-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 text-[10px] font-bold flex items-center justify-between shadow-2xs">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>ÖĞRETMEN NÜSHASI — DOĞRU CEVAPLAR VE ÇÖZÜMLER VURGULANMIŞTIR</span>
        </span>
        <span className="font-mono text-emerald-800 text-[10px] uppercase font-black shrink-0">
          {settings.bookletType || 'A'} KİTAPÇIĞI
        </span>
      </div>
    ) : null;

    const instructionBox = (
      <>
        {teacherBanner}
        {brand.showInstructionBox && brand.instructionBoxText?.trim() ? (
          <div
            className="border px-4 py-1.5 text-center text-[9px] font-semibold mt-2 rounded-xs select-none break-words"
            style={{
              borderColor: `${primaryBg}40`,
              backgroundColor: `${primaryBg}08`,
              color: '#1e293b',
            }}
          >
            {brand.instructionBoxText.trim()}
          </div>
        ) : null}
      </>
    );

    // Common data variables
    const testBand = brand.testBandTitle || settings.termInfo || 'KAZANIM KAVRAMA TESTİ';
    const institute = brand.instituteName?.trim() || '';
    const subTitleText = brand.subTitle || brand.branch || '';
    const teacherText = brand.teacherName
      ? `${brand.teacherName}${brand.branch ? ` · ${brand.branch}` : ''}`
      : brand.branch || '';
    const durationText = settings.durationMinutes && brand.showDuration !== false
      ? `${settings.durationMinutes} Dk`
      : '';

    // Reusable configurable header separator line (oval, curved, wavy, pill, medallion, center-lines, clean)
    const renderHeaderSeparatorLine = (fallback?: string) => {
      const activeLineStyle = brand.subtitleStyle || fallback || 'oval-capsule-line';
      if (activeLineStyle === 'clean') return null;

      if (activeLineStyle === 'curved-arch-line') {
        return (
          <div className="w-full flex items-center justify-center px-4 py-0.5 my-1">
            <svg className="w-full max-w-[450px] h-3" viewBox="0 0 400 12" fill="none">
              <path d="M10 10 Q 200 -2 390 10" stroke={primaryBg} strokeWidth="1.75" strokeLinecap="round" />
              <circle cx="200" cy="4" r="3" fill={primaryBg} />
            </svg>
          </div>
        );
      }

      if (activeLineStyle === 'wavy-line') {
        return (
          <div className="w-full flex items-center justify-center px-4 py-0.5 my-1">
            <svg className="w-full max-w-[450px] h-3" viewBox="0 0 400 12" fill="none">
              <path d="M10 6 Q 100 0 200 6 T 390 6" stroke={primaryBg} strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
        );
      }

      if (activeLineStyle === 'double-pill') {
        return (
          <div className="flex flex-col items-center gap-0.5 px-6 py-0.5 my-1">
            <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: `${primaryBg}30` }} />
            <div className="w-1/2 h-0.5 rounded-full" style={{ backgroundColor: primaryBg }} />
          </div>
        );
      }

      if (activeLineStyle === 'circle-medallion-line') {
        return (
          <div className="flex items-center justify-center gap-2 px-6 py-0.5 my-1">
            <div className="h-px flex-1 bg-stone-300 dark:bg-stone-600" />
            <div
              className="w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold shadow-2xs shrink-0"
              style={{ borderColor: primaryBg, color: primaryBg, backgroundColor: `${primaryBg}10` }}
            >
              ✦
            </div>
            <div className="h-px flex-1 bg-stone-300 dark:bg-stone-600" />
          </div>
        );
      }

      if (activeLineStyle === 'center-lines') {
        return (
          <div className="flex items-center justify-center gap-2.5 px-6 py-0.5 my-1">
            <div className="h-0.5 flex-1 bg-stone-300 dark:bg-stone-600" />
            <span className="text-[8px] tracking-widest text-stone-400 font-bold shrink-0">● ● ●</span>
            <div className="h-0.5 flex-1 bg-stone-300 dark:bg-stone-600" />
          </div>
        );
      }

      // Default: 'oval-capsule-line'
      return (
        <div className="flex items-center justify-center gap-2 px-6 pt-0.5 my-1">
          <div
            className="h-0.5 flex-1 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${primaryBg}70, ${primaryBg})` }}
          />
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: primaryBg }}
          />
          <div
            className="h-0.5 flex-1 rounded-full"
            style={{ background: `linear-gradient(90deg, ${primaryBg}, ${primaryBg}70, transparent)` }}
          />
        </div>
      );
    };

    // MODEL 1: CANLI GRADYAN ÜST BANT (Bilgi Sarmal / Orijinal)
    if (brand.headerStyle === 'gradient-banner') {
      return (
        <div className="mb-5">
          <div
            className="-mx-6 -mt-5 sm:-mx-10 sm:-mt-7 p-3.5 sm:p-4 text-white relative shadow-xs flex items-center justify-between overflow-hidden gap-3"
            style={{ background: headerGradient }}
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

            {/* Left: Logo & Institute & Title */}
            <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
              {renderLogo({ onDarkBg: true })}
              <div className="min-w-0 flex-1">
                {institute && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 block truncate">
                    {institute}
                  </span>
                )}
                <h1 className="text-sm sm:text-base font-black tracking-tight uppercase truncate">
                  {settings.title}
                </h1>
                <span className="text-[10px] font-bold text-white/90 block mt-0.5 truncate">
                  {settings.courseName} · {settings.gradeLevel} {testBand ? `· ${testBand}` : ''}
                </span>
              </div>
            </div>

            {/* Right: Booklet & Duration only */}
            <div className="text-right relative z-10 flex items-center justify-end gap-2 shrink-0">
              {durationText && (
                <span className="text-[10px] font-bold text-white/90 bg-black/25 px-2.5 py-1 rounded-xs whitespace-nowrap">
                  {durationText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <span className="text-xs font-mono font-black bg-white/20 px-3 py-1 rounded-xs text-white shadow-2xs whitespace-nowrap">
                  {settings.bookletType || 'A'}
                </span>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 2: AÇILI / EĞİMLİ GEOMETRİK KESİM (Hız ve Renk / Limit)
    if (brand.headerStyle === 'trapezoid-modern') {
      return (
        <div className="mb-5 space-y-1 pb-2">
          <div className="flex items-center justify-between border-b-2 pb-2.5 gap-3" style={{ borderColor: borderCol }}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {renderLogo()}
              <div className="min-w-0 flex-1">
                {institute && (
                  <span className="text-[10px] font-black uppercase text-stone-500 block truncate">
                    {institute}
                  </span>
                )}
                <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-stone-900 truncate">
                  {settings.title}
                </h1>
                <span className="text-[10px] font-bold text-stone-600 block mt-0.5 truncate">
                  {settings.courseName} · {settings.gradeLevel}
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
              {durationText && (
                <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  {durationText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <div
                  className="px-3 py-1 text-white font-black text-xs tracking-wider shadow-xs"
                  style={{ backgroundColor: primaryBg }}
                >
                  {settings.bookletType || 'A'}
                </div>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 3: İKİ RENKLİ FASİKÜL & BÖLÜM BANDI (Çap / Palme)
    if (brand.headerStyle === 'fasikul-band') {
      return (
        <div className="mb-5 space-y-1.5 pb-2">
          <div className="flex rounded-none overflow-hidden shadow-2xs border border-stone-200">
            <div
              className="w-[42%] min-w-0 px-3 py-2 text-white flex items-center gap-2"
              style={{ backgroundColor: primaryBg }}
            >
              {renderLogo({ onDarkBg: true, size: 'sm' })}
              <div className="min-w-0 flex-1">
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-200 block break-words leading-tight">
                  {institute}
                </span>
                {brand.showCourseGrade !== false && (
                  <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight mt-0.5">
                    {settings.courseName} · {settings.gradeLevel}
                  </span>
                )}
                {subTitleText && (
                  <span className="text-[8px] text-white/80 block break-words leading-tight mt-0.5">
                    {subTitleText}
                  </span>
                )}
              </div>
            </div>
            <div
              className="w-[58%] min-w-0 px-3 py-2 flex items-center justify-between gap-2"
              style={{ backgroundColor: `${primaryBg}15` }}
            >
              <div className="min-w-0 flex-1">
                <h1 className="text-xs font-black uppercase tracking-tight break-words leading-tight" style={{ color: primaryBg }}>
                  {settings.title}
                </h1>
                <span className="text-[8px] font-semibold text-stone-600 block break-words leading-tight mt-0.5">
                  {testBand} {brand.showTeacherInfo !== false && teacherText ? `· ${teacherText}` : ''} {durationText ? `· Süre: ${durationText}` : ''}
                </span>
              </div>
              {brand.showTestNumberBadge !== false && (
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-none bg-white shadow-2xs shrink-0 whitespace-nowrap" style={{ color: primaryBg }}>
                  {settings.bookletType || 'A'}
                </span>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 4: ÇERÇEVELİ, DİŞLİ MADALYON & YÖNERGE KUTULU (Bursluluk / Deneme)
    if (brand.headerStyle === 'framed-rosette') {
      return (
        <div className="mb-5 space-y-2 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
              {renderLogo()}
              {brand.showTestNumberBadge !== false && (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-none text-white font-black text-xs shrink-0 shadow-2xs"
                  style={{ backgroundColor: primaryBg }}
                >
                  {settings.bookletType || 'A'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase text-stone-900 block break-words leading-tight">
                  {institute}
                </span>
                {brand.showCourseGrade !== false && (
                  <span className="text-[8px] font-bold text-stone-600 block break-words leading-tight mt-0.5">
                    {settings.courseName} · {settings.gradeLevel}
                  </span>
                )}
                {subTitleText && (
                  <span className="text-[8px] text-stone-400 block break-words leading-tight mt-0.5">
                    {subTitleText}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center flex-1 min-w-0 px-2">
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-stone-900 break-words leading-tight">
                {settings.title}
              </h1>
              <span className="text-[8px] font-bold text-stone-500 uppercase tracking-wider block mt-0.5 break-words">
                {testBand}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 flex-1 min-w-0 pl-2 text-right">
              {brand.showTeacherInfo !== false && teacherText && (
                <span className="text-[8px] font-medium text-stone-500 block break-words leading-tight">
                  {teacherText}
                </span>
              )}
              {durationText && (
                <span
                  className="px-2.5 py-1 rounded-none text-[9px] font-black uppercase text-white shadow-2xs inline-block shrink-0 whitespace-nowrap"
                  style={{ backgroundColor: primaryBg }}
                >
                  SÜRE: {durationText}
                </span>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 5: DALGALI & ORGANİK SIVI KESİM (Okyanus / Nitelik)
    if (brand.headerStyle === 'wave-organic') {
      return (
        <div className="mb-5">
          <div
            className="-mx-6 -mt-5 sm:-mx-10 sm:-mt-7 p-3.5 sm:p-4 text-white relative shadow-xs flex items-center justify-between overflow-hidden"
            style={{
              background: headerGradient,
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), 65% 100%, 0 calc(100% - 6px))',
              paddingBottom: '22px',
            }}
          >
            <div className="flex items-center gap-2.5 relative z-10 flex-1 min-w-0 pr-2">
              {renderLogo({ onDarkBg: true })}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight">
                  {institute}
                </span>
                {brand.showCourseGrade !== false && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-200 block leading-tight mt-0.5">
                    {settings.courseName} · {settings.gradeLevel}
                  </span>
                )}
                {subTitleText && (
                  <span className="text-[8px] text-white/80 block break-words leading-tight mt-0.5">
                    {subTitleText}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center relative z-10 px-2 flex-1 min-w-0">
              <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase break-words leading-tight">
                {settings.title}
              </h1>
              <span className="text-[9px] font-medium text-white/90 uppercase tracking-widest block mt-0.5 break-words">
                {testBand}
              </span>
            </div>

            <div className="text-right relative z-10 flex items-center gap-2 flex-1 min-w-0 pl-2 justify-end">
              {brand.showTeacherInfo !== false && teacherText && (
                <span className="text-[8px] font-medium text-white/90 block break-words leading-tight">
                  {teacherText}
                </span>
              )}
              {durationText && (
                <span className="text-[9px] font-bold text-white/90 bg-black/20 px-2 py-0.5 rounded-none whitespace-nowrap shrink-0">
                  {durationText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <span className="text-[9px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-none text-white whitespace-nowrap shadow-2xs shrink-0">
                  {settings.bookletType || 'A'}
                </span>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 6: PASTEL FIRÇA / KAPSÜL ROZET (Modern LGS / TYT Föyü)
    if (brand.headerStyle === 'brush-accent') {
      return (
        <div className="mb-5 pb-3 border-b border-stone-200 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
              {renderLogo()}
              <div
                className="px-3 py-1.5 flex items-center gap-2 shadow-2xs min-w-0 flex-1"
                style={{ backgroundColor: `${primaryBg}18` }}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight" style={{ color: primaryBg }}>
                    {institute}
                  </span>
                  {brand.showCourseGrade !== false && (
                    <span className="text-[8px] font-bold uppercase tracking-wider block leading-tight mt-0.5" style={{ color: primaryBg }}>
                      {settings.courseName} · {settings.gradeLevel}
                    </span>
                  )}
                  {subTitleText && (
                    <span className="text-[8px] text-stone-500 block break-words leading-tight mt-0.5">
                      {subTitleText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center flex-1 min-w-0 px-2">
              <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase text-stone-900 break-words leading-tight">
                {settings.title}
              </h1>
              <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest block mt-0.5 break-words">
                {testBand}
              </span>
            </div>

            <div className="text-right flex-1 min-w-0 pl-2 flex items-center gap-2 justify-end">
              {brand.showTeacherInfo !== false && teacherText && (
                <span className="text-[9px] font-medium text-stone-600 block break-words leading-tight">
                  {teacherText}
                </span>
              )}
              {durationText && (
                <span className="text-[9px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 shrink-0 whitespace-nowrap">
                  {durationText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <span
                  className="px-2 py-0.5 text-white font-mono font-bold text-[9px] shadow-2xs inline-block shrink-0 whitespace-nowrap"
                  style={{ backgroundColor: primaryBg }}
                >
                  {settings.bookletType || 'A'}
                </span>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 7: ÇİFT ÇİZGİLİ KAPSÜL ROZET (Apotemi / Karekök / Aydın)
    if (brand.headerStyle === 'double-line-capsule') {
      return (
        <div className="mb-5 space-y-1 pb-2">
          <div className="border-t border-b py-2 flex items-center justify-between gap-2" style={{ borderColor: borderCol }}>
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
              {renderLogo({ size: 'sm' })}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase text-stone-900 block break-words leading-tight">
                  {institute}
                </span>
                {brand.showCourseGrade !== false && (
                  <span
                    className="px-2 py-0.5 text-white font-black text-[9px] uppercase shadow-2xs inline-block mt-0.5"
                    style={{ backgroundColor: primaryBg }}
                  >
                    {settings.courseName} · {settings.gradeLevel}
                  </span>
                )}
                {subTitleText && (
                  <span className="text-[8px] text-stone-400 block break-words leading-tight mt-0.5">
                    {subTitleText}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center flex-1 min-w-0 px-2">
              <h1 className="text-xs font-black uppercase text-stone-900 break-words leading-tight">
                {settings.title}
              </h1>
              <span className="text-[8px] font-bold text-stone-500 uppercase block mt-0.5 break-words">
                {testBand}
              </span>
            </div>

            <div className="text-right flex items-center gap-2 justify-end flex-1 min-w-0 pl-2">
              {brand.showTeacherInfo !== false && teacherText && (
                <span className="text-[8px] font-medium text-stone-500 block break-words leading-tight">
                  {teacherText}
                </span>
              )}
              {durationText && (
                <span className="text-[9px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 border border-stone-200 shrink-0 whitespace-nowrap">
                  {durationText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <span className="text-[9px] font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 border border-stone-300 shrink-0 whitespace-nowrap">
                  {settings.bookletType || 'A'}
                </span>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 8: KOLEJ & KURUMSAL ŞERİT ÇİFT DAMGALI (Kültür / Uğur)
    if (brand.headerStyle === 'retro-institution') {
      return (
        <div className="mb-5 pb-2.5 border-b-2 border-stone-800 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
              {renderLogo()}
              {brand.showTestNumberBadge !== false && (
                <div
                  className="h-8 w-8 flex items-center justify-center font-black text-white text-xs shadow-xs shrink-0"
                  style={{ backgroundColor: primaryBg }}
                >
                  {settings.bookletType || 'A'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black uppercase tracking-tight text-stone-900 block break-words leading-tight">
                  {institute}
                </span>
                {brand.showCourseGrade !== false && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-stone-600 block leading-tight mt-0.5">
                    {settings.courseName} · {settings.gradeLevel}
                  </span>
                )}
                {subTitleText && (
                  <span className="text-[8px] text-stone-400 block break-words leading-tight mt-0.5">
                    {subTitleText}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center flex-1 min-w-0 px-2">
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-stone-900 break-words leading-tight">
                {settings.title}
              </h1>
              <span className="text-[8px] font-semibold text-stone-600 block mt-0.5 break-words">
                {testBand}
              </span>
            </div>

            <div className="text-right flex-1 min-w-0 pl-2 flex items-center justify-end gap-2">
              {brand.showTeacherInfo !== false && teacherText && (
                <span className="text-[8px] font-medium text-stone-500 block break-words leading-tight">
                  {teacherText}
                </span>
              )}
              {durationText && (
                <span
                  className="text-[9px] font-mono font-bold text-white px-2 py-0.5 shadow-2xs inline-block shrink-0 whitespace-nowrap"
                  style={{ backgroundColor: primaryBg }}
                >
                  SÜRE: {durationText}
                </span>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 9: ZÜMRÜT MİNİMALİST İNCE CETVEL (Karekök / Çözüm)
    if (brand.headerStyle === 'slim-ruler') {
      return (
        <div className="mb-5 space-y-1 pb-1">
          <div className="flex items-center justify-between pb-1.5 gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
              {renderLogo({ size: 'sm' })}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase text-stone-900 block break-words leading-tight">
                  {institute}
                </span>
                {brand.showCourseGrade !== false && (
                  <span className="text-xs font-black uppercase tracking-tight block break-words leading-tight mt-0.5" style={{ color: primaryBg }}>
                    {settings.courseName} · {settings.gradeLevel}
                  </span>
                )}
                {subTitleText && (
                  <span className="text-[8px] text-stone-400 block break-words leading-tight mt-0.5">
                    {subTitleText}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center flex-1 min-w-0 px-2">
              <h1 className="text-xs font-black uppercase text-stone-900 break-words leading-tight">
                {settings.title}
              </h1>
              <span className="text-[8px] font-bold text-stone-500 uppercase block mt-0.5 break-words">
                {testBand}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-stone-600 justify-end flex-1 min-w-0 pl-2 text-right">
              {brand.showTeacherInfo !== false && teacherText && (
                <span className="text-[8px] font-medium text-stone-500 block break-words leading-tight">
                  {teacherText}
                </span>
              )}
              {durationText && (
                <span className="bg-stone-100 border border-stone-300 px-1.5 py-0.5 shrink-0 whitespace-nowrap">
                  {durationText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <span className="bg-stone-100 border border-stone-300 px-2 py-0.5 font-black shrink-0 whitespace-nowrap">
                  {settings.bookletType || 'A'}
                </span>
              )}
            </div>
          </div>
          {/* Ruler Scale Pattern */}
          <div
            className="h-1.5 w-full border-t border-b"
            style={{
              borderColor: borderCol,
              backgroundImage: `repeating-linear-gradient(90deg, ${borderCol}, ${borderCol} 1px, transparent 1px, transparent 6px)`,
            }}
          />
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 10: TÜRKİYE GENELİ DENEME & ÇİFT KUTULU (TÖDER / Özdebir)
    if (brand.headerStyle === 'toder-ozdebir') {
      return (
        <div className="mb-5 pb-2 space-y-1">
          <div className="border-2 border-stone-900 p-2 flex items-center justify-between bg-stone-50 gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
              {renderLogo()}
              <div className="bg-stone-900 text-white font-mono font-black text-xs px-2 py-1 shrink-0">
                DENEME
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase text-stone-900 block break-words leading-tight">
                  {institute}
                </span>
                {brand.showCourseGrade !== false && (
                  <span className="text-[8px] font-bold uppercase text-stone-600 block break-words leading-tight mt-0.5">
                    {settings.courseName} · {settings.gradeLevel}
                  </span>
                )}
                {subTitleText && (
                  <span className="text-[8px] text-stone-400 block break-words leading-tight mt-0.5">
                    {subTitleText}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center px-2 flex-1 min-w-0">
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-stone-900 break-words leading-tight">
                {settings.title}
              </h1>
              <span className="text-[8px] font-bold text-stone-600 block mt-0.5 break-words">
                {testBand} {durationText ? `· SÜRE: ${durationText}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 justify-end flex-1 min-w-0 pl-2 text-right">
              {brand.showTeacherInfo !== false && teacherText && (
                <span className="text-[8px] font-medium text-stone-500 block break-words leading-tight">
                  {teacherText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <div className="border-2 border-stone-900 bg-white px-2.5 py-1 text-center shrink-0">
                  <span className="text-[7px] uppercase font-bold text-stone-500 block leading-none">KİTAPÇIK</span>
                  <span className="text-xs font-mono font-black text-stone-900 leading-none">{settings.bookletType || 'A'}</span>
                </div>
              )}
            </div>
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL: OVAL KAPSÜL ROZETLİ & KAVİSLİ AYRAÇ
    if (brand.headerStyle === 'oval-capsule') {
      return (
        <div className="mb-5 pb-2 text-center space-y-2">
          <div
            className="rounded-full px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs border transition-all"
            style={{
              backgroundColor: `${primaryBg}0a`,
              borderColor: `${primaryBg}40`,
            }}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
              {renderLogo({ size: 'sm' })}
              <div className="min-w-0 flex-1">
                {institute && (
                  <span
                    className="text-[9px] font-black uppercase tracking-wider block truncate"
                    style={{ color: primaryBg }}
                  >
                    {institute}
                  </span>
                )}
                <span className="text-[10px] font-bold text-stone-700 block truncate">
                  {settings.courseName} · {settings.gradeLevel}
                </span>
              </div>
            </div>

            <div className="text-center px-2 flex-[1.6] min-w-0">
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-stone-900 truncate">
                {settings.title}
              </h1>
              {testBand && (
                <span
                  className="inline-block mt-0.5 px-3 py-0.5 rounded-full text-[9px] font-bold text-white shadow-2xs truncate max-w-full"
                  style={{ backgroundColor: primaryBg }}
                >
                  {testBand}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0">
              {durationText && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-stone-700 border border-stone-200 shrink-0 shadow-2xs">
                  {durationText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-black text-white shadow-xs shrink-0"
                  style={{ backgroundColor: primaryBg }}
                >
                  {settings.bookletType || 'A'}
                </span>
              )}
            </div>
          </div>

          {/* Kavisli Yay / Oval Çizgi Ayracı */}
          {renderHeaderSeparatorLine('oval-capsule-line')}

          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL: KAVİSLİ ÜST KEMER & YAY ÇİZGİLİ BAŞLIK
    if (brand.headerStyle === 'curved-arch') {
      return (
        <div className="mb-5 pb-2 text-center space-y-2">
          <div
            className="rounded-t-[28px] rounded-b-xl p-3.5 sm:p-4 text-white relative shadow-xs flex items-center justify-between overflow-hidden gap-3"
            style={{ background: `linear-gradient(145deg, ${primaryBg} 0%, ${secondaryBg} 100%)` }}
          >
            <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-white/15 pointer-events-none" />
            <div className="absolute right-0 bottom-0 w-32 h-16 rounded-tl-[40px] bg-white/10 pointer-events-none" />

            <div className="flex items-center gap-2.5 relative z-10 flex-1 min-w-0 text-left">
              {renderLogo({ onDarkBg: true, size: 'sm' })}
              <div className="min-w-0 flex-1">
                {institute && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-200 block truncate">
                    {institute}
                  </span>
                )}
                <span className="text-[10px] font-bold text-white/90 block truncate">
                  {settings.courseName} · {settings.gradeLevel}
                </span>
              </div>
            </div>

            <div className="text-center relative z-10 px-2 flex-[1.6] min-w-0">
              <h1 className="text-xs sm:text-base font-black tracking-tight uppercase truncate drop-shadow-xs">
                {settings.title}
              </h1>
              {testBand && (
                <span className="inline-block mt-0.5 px-3 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white backdrop-blur-xs shadow-2xs truncate max-w-full">
                  {testBand}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 relative z-10 flex-1 min-w-0">
              {durationText && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/25 text-white whitespace-nowrap">
                  {durationText}
                </span>
              )}
              {brand.showTestNumberBadge !== false && (
                <div className="w-8 h-8 rounded-full bg-white text-stone-900 font-mono font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {settings.bookletType || 'A'}
                </div>
              )}
            </div>
          </div>

          {renderHeaderSeparatorLine('curved-arch-line')}

          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL: AKICI DALGALI BANT & EĞRİ ÇİZGİ
    if (brand.headerStyle === 'wavy-ribbon') {
      return (
        <div className="mb-5 pb-2 text-center space-y-2">
          <div
            className="rounded-2xl p-3 sm:p-3.5 text-white relative shadow-xs flex items-center justify-between overflow-hidden gap-3"
            style={{ background: `linear-gradient(120deg, ${primaryBg} 0%, ${secondaryBg} 100%)` }}
          >
            <div className="flex items-center gap-2.5 relative z-10 flex-1 min-w-0 text-left">
              {renderLogo({ onDarkBg: true, size: 'sm' })}
              <div className="min-w-0 flex-1">
                {institute && (
                  <span className="text-[9px] font-bold uppercase text-white/80 block truncate">
                    {institute}
                  </span>
                )}
                <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white truncate">
                  {settings.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10 shrink-0">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-white/20 text-white backdrop-blur-xs">
                {settings.courseName} · {settings.gradeLevel}
              </span>
              {brand.showTestNumberBadge !== false && (
                <div className="px-2.5 py-1 rounded-full bg-white text-stone-900 font-mono font-black text-xs shadow-2xs">
                  {settings.bookletType || 'A'}
                </div>
              )}
            </div>
          </div>

          {renderHeaderSeparatorLine('wavy-line')}

          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL: ÇİFT OVAL KAPSÜL & DAİRESEL MADALYON
    if (brand.headerStyle === 'pill-modern') {
      return (
        <div className="mb-5 pb-2 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div
              className="rounded-full px-3.5 py-1.5 flex items-center gap-2.5 border shadow-2xs flex-1 min-w-0"
              style={{
                borderColor: `${primaryBg}40`,
                backgroundColor: `${primaryBg}0a`,
              }}
            >
              {renderLogo({ size: 'sm' })}
              <div className="min-w-0 flex-1">
                {institute && (
                  <span className="text-[8.5px] font-black uppercase text-stone-500 block truncate">
                    {institute}
                  </span>
                )}
                <span className="text-[10px] font-bold text-stone-800 block truncate">
                  {settings.courseName} · {settings.gradeLevel}
                </span>
              </div>
            </div>

            {brand.showTestNumberBadge !== false && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-black text-white shadow-xs shrink-0 border-2 border-white ring-1"
                style={{
                  backgroundColor: primaryBg,
                }}
              >
                {settings.bookletType || 'A'}
              </div>
            )}

            <div
              className="rounded-full px-3.5 py-1.5 flex items-center justify-end gap-2 border shadow-2xs flex-1 min-w-0 text-right"
              style={{
                borderColor: `${primaryBg}40`,
                backgroundColor: `${primaryBg}0a`,
              }}
            >
              <div className="min-w-0 flex-1">
                <h1 className="text-[11px] font-black uppercase text-stone-900 truncate">
                  {settings.title}
                </h1>
                <span className="text-[8.5px] font-semibold text-stone-500 block truncate">
                  {testBand || 'KAZANIM KAVRAMA TESTİ'}
                </span>
              </div>
              {durationText && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-stone-700 border border-stone-200 shrink-0">
                  {durationText}
                </span>
              )}
            </div>
          </div>

          {renderHeaderSeparatorLine('double-pill')}

          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 11: MEB RESMÎ SENARYOLU ORTAK YAZILI (Geriye dönük uyumluluk)
    if (brand.headerStyle === 'classic-meb') {
      return (
        <div
          className="mb-5 py-2.5 text-center space-y-1.5"
          style={{ borderTop: `2px solid ${borderCol}`, borderBottom: `2px solid ${borderCol}` }}
        >
          <div className="flex items-center justify-center gap-2.5">
            {renderLogo({ size: 'sm' })}
            <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase break-words" style={{ color: primaryBg }}>
              {institute}
            </h1>
          </div>
          {subTitleText && (
            <div className="text-[10px] text-stone-600 font-bold break-words">
              ── {subTitleText} ──
            </div>
          )}
          <p className="text-[10px] font-bold text-stone-700 tracking-wide uppercase break-words">
            {settings.academicYear} EĞİTİM ÖĞRETİM YILI {settings.termInfo ? `· ${settings.termInfo.toUpperCase()}` : ''}
          </p>
          <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase break-words text-stone-900 mt-0.5">
            {settings.title || '1. DÖNEM 1. ORTAK YAZILI SINAVI'}
          </h2>
          {testBand && (
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-stone-600">
              {testBand}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-stone-700 pt-0.5">
            {brand.showCourseGrade !== false && (
              <>
                <span className="bg-stone-100 px-2 py-0.5 border border-stone-200">DERS: {settings.courseName}</span>
                <span className="bg-stone-100 px-2 py-0.5 border border-stone-200">SINIF: {settings.gradeLevel}</span>
              </>
            )}
            {brand.showTeacherInfo !== false && teacherText && (
              <span className="bg-stone-100 px-2 py-0.5 border border-stone-200">ÖĞRETMEN: {teacherText}</span>
            )}
            {durationText && (
              <span className="bg-stone-100 px-2 py-0.5 border border-stone-200">SÜRE: {durationText}</span>
            )}
            {brand.showTestNumberBadge !== false && (
              <span className="bg-stone-100 px-2 py-0.5 border border-stone-200">KİTAPÇIK: {settings.bookletType || 'A'}</span>
            )}
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // MODEL 12: ÖSYM RESMÎ SİYAH-BEYAZ TYT / AYT KİTAPÇIĞI
    if (brand.headerStyle === 'minimalist') {
      return (
        <div className="mb-5 pb-2 border-b-2 border-stone-900 space-y-1.5">
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
              {renderLogo()}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600 block break-words">
                  {institute} {subTitleText ? `· ${subTitleText}` : ''}
                </span>
                <h1 className="text-sm font-black text-stone-900 uppercase break-words leading-tight mt-0.5">
                  {settings.title}
                </h1>
                <p className="text-[9px] text-stone-500 font-semibold mt-0.5 break-words">
                  {testBand}
                  {brand.showCourseGrade !== false ? ` · ${settings.courseName} (${settings.gradeLevel})` : ''}
                  {brand.showTeacherInfo !== false && teacherText ? ` · ${teacherText}` : ''}
                  {durationText ? ` · Süre: ${durationText}` : ''}
                </p>
              </div>
            </div>
            {brand.showTestNumberBadge !== false && (
              <div className="border-2 border-stone-900 px-3 py-1 text-center font-mono font-black text-xs shrink-0">
                {settings.bookletType || 'A'}
              </div>
            )}
          </div>
          {instructionBox}
          {studentInfoBlock}
        </div>
      );
    }

    // Default / Written Fallback with Clean Non-overlapping Header
    if (docType === 'written') {
      return (
        <div className="mb-5 pb-3 border-b-2" style={{ borderColor: borderCol }}>
          <div className="flex items-center justify-between gap-4">
            {/* Left: Clean Identity & Exam Title (NO cluttered repetitive boxes) */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {renderLogo()}
              <div className="min-w-0 flex-1">
                {brand.instituteName?.trim() && (
                  <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 truncate">
                    {brand.instituteName}
                  </h2>
                )}
                <h1 className="text-sm sm:text-base font-black tracking-tight text-stone-900 mt-0.5 truncate">
                  {settings.title}
                </h1>
                <p className="text-[11px] font-semibold text-stone-600 mt-0.5 truncate">
                  {settings.courseName} · {settings.gradeLevel} · {settings.termInfo} · Kitapçık: {settings.bookletType}
                </p>
              </div>
            </div>

            {/* Right: Clean Student Info Box */}
            <div className="w-64 sm:w-72 shrink-0 rounded border border-stone-300 bg-stone-50/70 p-2 text-xs">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                <div>
                  <span className="font-bold text-stone-700">Ad Soyad:</span>{' '}
                  <span className="border-b border-dotted border-stone-400 inline-block w-16"></span>
                </div>
                <div>
                  <span className="font-bold text-stone-700">Sınıf/Şube:</span>{' '}
                  <span className="border-b border-dotted border-stone-400 inline-block w-12"></span>
                </div>
                <div>
                  <span className="font-bold text-stone-700">Okul No:</span>{' '}
                  <span className="border-b border-dotted border-stone-400 inline-block w-16"></span>
                </div>
                <div>
                  <span className="font-bold text-stone-700">Puan:</span>{' '}
                  <span className="border-b border-dotted border-stone-400 inline-block w-12"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (docType === 'lecture') {
      return (
        <div
          className="mb-6 rounded-none p-4 sm:p-5 text-white shadow-xs relative overflow-hidden"
          style={{ backgroundColor: primaryBg }}
        >
          <div className="flex items-center justify-between relative z-10 gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-none bg-white/15 p-2 backdrop-blur-xs">
                {renderLogo({ onDarkBg: true })}
              </div>
              <div>
                {brand.instituteName?.trim() && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    {brand.instituteName}
                  </span>
                )}
                <h1 className="text-lg sm:text-xl font-black tracking-tight">{settings.title}</h1>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  {settings.courseName} · {settings.gradeLevel} · {settings.subTitle}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block rounded-none bg-amber-400 text-stone-950 font-black px-2.5 py-1 text-xs shadow-xs">
                FÖY 01
              </span>
              <p className="text-[10px] text-white/70 mt-1 hidden sm:block">Öğrenci: ........................</p>
            </div>
          </div>
        </div>
      );
    }

    if (docType === 'exam') {
      return (
        <div className="mb-6 border-b-2 border-stone-800 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {renderLogo()}
              <div>
                {brand.instituteName?.trim() && (
                  <h1 className="text-sm font-black uppercase tracking-wider text-stone-900">
                    {brand.instituteName}
                  </h1>
                )}
                <p className="text-xs font-bold text-stone-700">{settings.title}</p>
                <p className="text-[11px] text-stone-500">{settings.gradeLevel} · {settings.termInfo}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="border border-stone-800 rounded-lg p-1.5 sm:p-2 text-center text-xs min-w-20 sm:min-w-28 bg-stone-50">
                <span className="block text-[9px] sm:text-[10px] text-stone-500 uppercase font-semibold">Süre</span>
                <span className="font-bold text-stone-900">{settings.durationMinutes} Dk</span>
              </div>
              <div
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-base sm:text-lg font-black text-white shadow-xs"
                style={{ backgroundColor: primaryBg }}
              >
                {settings.bookletType}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Yaprak Test / Soru Bankası
    return (
      <div className="mb-5 sm:mb-6 border-b-2 pb-3.5" style={{ borderColor: borderCol }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {renderLogo()}
            <div>
              <div className="flex items-center gap-1.5">
                {brand.instituteName?.trim() ? (
                  <>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                      {brand.instituteName}
                    </span>
                    <span className="text-stone-300 text-xs">/</span>
                  </>
                ) : null}
                <span className="text-xs font-bold text-stone-600">{settings.courseName}</span>
              </div>
              <h1 className="text-sm font-black tracking-tight text-stone-900 mt-0.5">
                {settings.title}
              </h1>
              <p className="text-[11px] text-stone-500 font-medium">
                {settings.gradeLevel} · {settings.termInfo} · {questions.length} Soru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="text-right text-[11px] hidden sm:block">
              <span className="font-bold text-stone-800 block">{brand.teacherName}</span>
              <span className="text-stone-500">{brand.branch}</span>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white shadow-2xs"
              style={{ backgroundColor: primaryBg }}
              title="Kitapçık Türü"
            >
              {settings.bookletType}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Running Mini-Header on Page 2, 3, etc.
  const renderRunningHeader = (pageNumber: number) => {
    return (
      <div className="mb-5 border-b border-stone-300 pb-2 flex items-center justify-between text-[10px] text-stone-600 font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          {brand.instituteName?.trim() ? (
            <>
              <span>{brand.instituteName}</span>
              <span className="text-stone-300">·</span>
            </>
          ) : null}
          <span className="text-stone-900 font-bold">{settings.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            Kitapçık {settings.bookletType}
          </span>
          <span className="font-bold text-stone-900">
            Sayfa {pageNumber} / {totalPages}
          </span>
        </div>
      </div>
    );
  };

  // Render Footer for each page
  const renderPageFooter = (pageNumber: number) => {
    const isMono = brand.printColorMode === 'monochrome';
    const primaryBg = isMono ? '#1f2937' : brand.primaryColor;

    return (
      <div
        className="mt-auto py-1.5 border-t-2 border-stone-800 flex items-center justify-between text-[10px] text-stone-700 font-bold min-h-[32px]"
        style={{
          borderColor:
            brand.footerStyle === 'circle-badge'
              ? primaryBg
              : brand.footerStyle === 'minimal-line'
              ? `${primaryBg}40`
              : undefined,
        }}
      >
        {/* Left: Clean Institute / Publisher Name only (NO tel / phone, NO contact clutter) */}
        <div className="flex-1 basis-0 flex items-center justify-start min-w-0 pr-2">
          <span className="font-black text-stone-900 truncate">
            {brand.instituteName?.trim() || ''}
          </span>
        </div>

        {/* Center: EXACTLY CENTERED CONFIGURABLE PAGE NUMBER (Aligned with footer row) */}
        <div className="shrink-0 flex items-center justify-center px-2">
          {renderPageNumber(pageNumber, totalPages)}
        </div>

        {/* Right: Custom User Note or Clean Booklet Code (NO directive choices / NO clutter) */}
        <div className="flex-1 basis-0 flex items-center justify-end min-w-0 pl-2">
          {brand.footerRightText ? (
            <span className="font-medium text-[9px] text-stone-700 whitespace-nowrap truncate">
              {brand.footerRightText}
            </span>
          ) : settings.bookletType ? (
            <span className="font-mono text-[9px] font-bold text-stone-700 bg-black/5 px-2 py-0.5 rounded-xs whitespace-nowrap">
              {settings.bookletType} Kitapçığı
            </span>
          ) : (
            <span className="text-stone-400 font-medium text-[9px] whitespace-nowrap">
              Başarılar
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render a Single Question or Lecture Block
  const renderQuestion = (q: QuestionItem, globalIndex: number) => {
    const isEditing = editingQuestionId === q.id;
    const manualBreaks = new Set(settings.manualPageBreaks || []);
    const isBreakAfter = manualBreaks.has(globalIndex);
    const primaryBg = brand.primaryColor || '#0284c7';
    const secondaryBg = brand.secondaryColor || '#0369a1';

    // Calculate sequential question number (ignoring lecture / note blocks)
    let questionNumber = 0;
    for (let i = 0; i <= globalIndex; i++) {
      if (questions[i]?.type !== 'lecture_block') {
        questionNumber++;
      }
    }

    // If lecture block
    if (q.type === 'lecture_block') {
      const blockStyles: Record<string, { bg: string; border: string; borderLeft: string; icon: string; titleCol: string }> = {
        formula: { bg: 'bg-blue-50/60', border: 'border-blue-200', borderLeft: 'border-l-blue-600', icon: '📐', titleCol: 'text-blue-900' },
        example: { bg: 'bg-emerald-50/60', border: 'border-emerald-200', borderLeft: 'border-l-emerald-600', icon: '💡', titleCol: 'text-emerald-900' },
        warning: { bg: 'bg-amber-50/60', border: 'border-amber-200', borderLeft: 'border-l-amber-600', icon: '⚠️', titleCol: 'text-amber-900' },
        practice: { bg: 'bg-purple-50/60', border: 'border-purple-200', borderLeft: 'border-l-purple-600', icon: '✍️', titleCol: 'text-purple-900' },
        summary: { bg: 'bg-stone-50', border: 'border-stone-200', borderLeft: 'border-l-stone-700', icon: '📌', titleCol: 'text-stone-900' },
        heading: { bg: 'bg-stone-100', border: 'border-stone-300', borderLeft: 'border-l-stone-800', icon: '📖', titleCol: 'text-stone-900' }
      };

      const style = blockStyles[q.blockType || 'summary'] || blockStyles.summary;
      const lectureStyle = brand.lectureBoxStyle || 'highlight-bar';

      let containerClass = `relative rounded-lg border border-l-4 p-3 mb-2.5 ${style.bg} ${style.border} ${style.borderLeft} transition-all`;
      if (lectureStyle === 'formula-frame') {
        containerClass = `relative rounded-xl border-2 border-dashed p-3 mb-2.5 bg-stone-50/70 border-stone-400 transition-all`;
      } else if (lectureStyle === 'tip-badge') {
        containerClass = `relative rounded-2xl border p-3.5 mb-2.5 bg-white shadow-2xs ${style.border} transition-all`;
      } else if (lectureStyle === 'curved-accent') {
        containerClass = `relative rounded-xl border overflow-hidden mb-2.5 bg-white shadow-2xs ${style.border} transition-all`;
      } else if (lectureStyle === 'clean-card') {
        containerClass = `relative rounded-xl border border-stone-300 p-3 mb-2.5 bg-white transition-all`;
      }

      return (
        <div key={q.id} className="relative group avoid-page-break">
          <div className={containerClass}>
            {/* Quick inline controls (hidden on print) */}
            <div className="no-print absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 p-1 rounded-lg shadow-sm border border-stone-200 z-10">
              <button
                type="button"
                onClick={() => onReorderQuestion(globalIndex, globalIndex - 1)}
                disabled={globalIndex === 0}
                className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                title="Yukarı Taşı"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onReorderQuestion(globalIndex, globalIndex + 1)}
                disabled={globalIndex === questions.length - 1}
                className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                title="Aşağı Taşı"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {onDuplicateQuestion && (
                <button
                  type="button"
                  onClick={() => onDuplicateQuestion(q)}
                  className="p-1 text-stone-500 hover:text-stone-900"
                  title="Bloğu Çoğalt"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}
              {onEditQuestionModal && (
                <button
                  type="button"
                  onClick={() => onEditQuestionModal(globalIndex)}
                  className="p-1 text-stone-600 hover:text-stone-950 hover:bg-stone-200/80 rounded"
                  title="Bloğu Düzenle (Sağ Pencerede Aç)"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}
              {onTogglePageBreak && (
                <button
                  type="button"
                  onClick={() => onTogglePageBreak(globalIndex)}
                  className={`p-1 rounded ${isBreakAfter ? 'bg-amber-100 text-amber-900' : 'text-stone-500 hover:text-stone-900'}`}
                  title={isBreakAfter ? 'Sayfa sonunu kaldır' : 'Buradan sonra yeni sayfaya geç'}
                >
                  <SplitSquareVertical className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemoveQuestion(q.id)}
                className="p-1 text-stone-500 hover:text-rose-600"
                title="Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {lectureStyle === 'curved-accent' ? (
              <div
                className="px-3 py-1.5 text-white font-bold text-[10px] flex items-center justify-between -mx-3 -mt-3 mb-2.5"
                style={{ background: `linear-gradient(135deg, ${primaryBg}, ${secondaryBg || primaryBg})` }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs shrink-0">{style.icon}</span>
                  <span className="truncate uppercase tracking-wider">{q.blockTitle || 'Önemli Bilgi / Not'}</span>
                </div>
              </div>
            ) : lectureStyle === 'tip-badge' ? (
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-stone-200/60">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-white font-bold text-[9px] shadow-2xs"
                  style={{ backgroundColor: primaryBg }}
                >
                  <span className="text-xs">{style.icon}</span>
                  <span className="uppercase tracking-wider">{q.blockTitle || 'Önemli Bilgi'}</span>
                </div>
              </div>
            ) : lectureStyle === 'formula-frame' ? (
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-dashed border-stone-300">
                <div className="flex items-center gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded-md font-mono font-bold text-[9px] text-white"
                    style={{ backgroundColor: primaryBg }}
                  >
                    f(x) FORMÜL
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${style.titleCol}`}>
                    {q.blockTitle || 'Matematik & Teorem Notu'}
                  </span>
                </div>
                <span className="text-xs">{style.icon}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-stone-200/70">
                <span className="text-sm shrink-0">{style.icon}</span>
                <span className={`text-[11px] font-black uppercase tracking-wider ${style.titleCol} leading-tight`}>
                  {q.blockTitle || 'Önemli Bilgi'}
                </span>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900 focus:outline-hidden"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(q.id)}
                  className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            ) : (
              <div
                onClick={() => handleStartEdit(q)}
                className="text-[11px] text-stone-800 leading-relaxed font-sans whitespace-pre-line break-words cursor-pointer hover:bg-black/5 p-1 rounded transition-colors"
                title="Düzenlemek için tıkla"
              >
                {q.text}
              </div>
            )}

            {/* Teacher Solution if visible - only show for example and practice blocks, not boilerplate rules */}
            {settings.isTeacherVersion && q.solutionExplanation && q.blockType !== 'formula' && q.blockType !== 'summary' && !q.solutionExplanation.includes('Konu anlatım özetidir') && (
              <div className="mt-2 pt-1.5 border-t border-emerald-200 bg-emerald-50/70 p-2 rounded text-[10px] text-emerald-950 font-medium break-words">
                <span className="font-bold text-emerald-800">Çözüm / Açıklama: </span>
                {q.solutionExplanation}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Standard Question
    return (
      <div key={q.id} className="relative group avoid-page-break">
        <div
          className="relative mb-2.5 text-stone-900 transition-all rounded-lg p-1 sm:p-1.5 hover:bg-stone-50/60"
        >
          {/* Quick inline controls (hidden on print) */}
          <div className="no-print absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-sm border border-stone-200 z-10">
            <button
              type="button"
              onClick={() => onReorderQuestion(globalIndex, globalIndex - 1)}
              disabled={globalIndex === 0}
              className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
              title="Yukarı Taşı"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onReorderQuestion(globalIndex, globalIndex + 1)}
              disabled={globalIndex === questions.length - 1}
              className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
              title="Aşağı Taşı"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {onEditQuestionModal && (
              <button
                type="button"
                onClick={() => onEditQuestionModal(globalIndex)}
                className="p-1 text-stone-600 hover:text-stone-950 hover:bg-stone-200/80 rounded"
                title="Soruyu Düzenle (Pencerede Aç)"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {onDuplicateQuestion && (
              <button
                type="button"
                onClick={() => onDuplicateQuestion(q)}
                className="p-1 text-stone-500 hover:text-stone-900"
                title="Soruyu Kopyala / Çoğalt"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
            {onTogglePageBreak && (
              <button
                type="button"
                onClick={() => onTogglePageBreak(globalIndex)}
                className={`p-1 rounded ${isBreakAfter ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                title={isBreakAfter ? 'Sayfa sonunu kaldır' : 'Buradan sonra yeni sayfaya geç'}
              >
                <SplitSquareVertical className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemoveQuestion(q.id)}
              className="p-1 text-stone-500 hover:text-rose-600"
              title="Sil"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Question Header row: Badge + Points inline */}
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
              {renderQuestionBadge(questionNumber)}
              {renderQuestionPoints(q.points || (docType === 'written' ? 10 : 5), docType)}
            </div>

            <div className="flex-1 min-w-0">

              {/* Question Image (from crop or upload) */}
              {q.imageUrl && q.presentationFormat !== 'text_only' && (() => {
                const alignClass = q.imageAlignment === 'center'
                  ? 'justify-center'
                  : q.imageAlignment === 'right'
                  ? 'justify-end'
                  : 'justify-start';

                const containerWidthStyle = q.imageWidthPercent && q.imageWidthPercent < 100
                  ? { maxWidth: `${q.imageWidthPercent}%`, width: '100%' }
                  : q.imageNaturalSize
                  ? { maxWidth: '100%', width: 'auto' }
                  : { maxWidth: `${q.imageWidthPercent || 100}%`, width: 'auto' };

                const isFullWidth = q.imageWidthPercent === 100 && !q.imageNaturalSize;

                return (
                  <div className={`mb-2 w-full flex ${alignClass} select-none`}>
                    <div
                      className="overflow-hidden flex border-0 border-none outline-none"
                      style={containerWidthStyle}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.imageUrl}
                        alt="Soru Görseli"
                        className={`h-auto ${isFullWidth ? 'w-full' : 'max-w-full w-auto'} ${
                          q.isImageOnly ? 'max-h-[600px]' : 'max-h-56'
                        } object-contain transition-all border-0 border-none outline-none ring-0 shadow-none rounded-none`}
                        style={{
                          filter: q.imageGrayscale ? 'grayscale(100%) contrast(125%)' : undefined,
                          transform: q.imageRotation ? `rotate(${q.imageRotation}deg)` : undefined,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Subtext (Öncüller vs.) */}
              {q.subText && (
                <div className="mb-1.5 text-xs text-stone-700 font-serif leading-relaxed whitespace-pre-line break-words bg-stone-50/70 p-2 rounded border border-stone-200/60 select-text">
                  {q.subText}
                </div>
              )}

              {/* Inline Editable Question Statement */}
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900 focus:outline-hidden"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(q.id)}
                      className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      Kaydet
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingQuestionId(null)}
                      className="px-2 py-1 rounded text-stone-500 text-[11px]"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : q.text && (q.presentationFormat !== 'image_only' || !q.isImageOnly) ? (
                <div
                  onClick={() => handleStartEdit(q)}
                  className="text-xs font-semibold leading-relaxed text-stone-900 whitespace-pre-line break-words cursor-pointer hover:bg-stone-100/80 p-0.5 rounded transition-colors select-text"
                  title="Metni düzenlemek için tıkla"
                >
                  {q.text}
                </div>
              ) : null}

              {/* Multiple Choice Options (Kopyalanabilir Metin Şıkları) */}
              {q.type === 'multiple_choice' && !q.optionsInImage && q.options && q.options.length > 0 && (() => {
                const isTwoColumnPage = settings.columnCount === 2;
                const isVeryShort = q.options.every((opt) => opt.replace(/^[A-E]\)\s*/i, '').trim().length <= 4);
                const optionsLayoutClass = isTwoColumnPage
                  ? isVeryShort
                    ? 'mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs select-text'
                    : 'mt-2 flex flex-col gap-1 text-xs select-text'
                  : isVeryShort
                  ? 'mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs select-text'
                  : 'mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs select-text';

                return (
                  <div className={optionsLayoutClass}>
                    {q.options.map((opt, i) => {
                      const letter = opt.trim().charAt(0);
                      const isCorrect = settings.isTeacherVersion && letter === q.correctAnswer;
                      const optText = opt.replace(/^[A-E]\)\s*/, '');
                      const primaryBg = brand.primaryColor || '#0284c7';

                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-1.5 p-0.5 rounded-xs transition-colors select-text ${
                            isCorrect
                              ? 'bg-emerald-100/70 text-emerald-950 font-bold border border-emerald-300 px-1.5 py-0.5'
                              : 'text-stone-800'
                          }`}
                        >
                          {brand.optionStyle === 'circle' && (
                            <span
                              className="flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold shrink-0 mt-0.5"
                              style={{ borderColor: primaryBg, color: primaryBg }}
                            >
                              {letter}
                            </span>
                          )}
                          {brand.optionStyle === 'circle-fill' && (
                            <span
                              className="flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] font-bold shrink-0 mt-0.5 shadow-2xs"
                              style={{ backgroundColor: primaryBg }}
                            >
                              {letter}
                            </span>
                          )}
                          {brand.optionStyle === 'square' && (
                            <span
                              className="flex h-4 w-4 items-center justify-center rounded-xs border text-[9px] font-bold shrink-0 mt-0.5"
                              style={{ borderColor: primaryBg, color: primaryBg }}
                            >
                              {letter}
                            </span>
                          )}
                          {brand.optionStyle === 'soft-card' && (
                            <span
                              className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold shrink-0 mt-0.5 mr-0.5"
                              style={{ backgroundColor: `${primaryBg}18`, color: primaryBg }}
                            >
                              {letter}
                            </span>
                          )}
                          {(brand.optionStyle === 'bold-letter' || !brand.optionStyle) && (
                            <span className="font-bold shrink-0 w-4 text-stone-900 mt-0.5">{letter})</span>
                          )}
                          <span className="flex-1 min-w-0 break-words leading-relaxed text-[11px] sm:text-xs">
                            {optText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Open Ended Lines for Student Writing */}
              {q.type === 'open_ended' && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="text-[9px] uppercase font-bold tracking-wider text-stone-500">
                    Çözüm ve Yanıt Alanı ({brand.answerAreaStyle || 'lined'}):
                  </div>
                  {brand.answerAreaStyle === 'grid' ? (
                    <div
                      className="w-full rounded-xs border border-stone-300 bg-white"
                      style={{
                        height: `${Math.max(40, (q.linesForAnswer || settings.openEndedLines || 4) * 16)}px`,
                        backgroundImage: 'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
                        backgroundSize: '8px 8px',
                      }}
                    />
                  ) : brand.answerAreaStyle === 'clean-box' ? (
                    <div
                      className="w-full rounded-xs border border-stone-300 bg-white"
                      style={{ height: `${Math.max(40, (q.linesForAnswer || settings.openEndedLines || 4) * 16)}px` }}
                    />
                  ) : brand.answerAreaStyle === 'dotted' ? (
                    <div className="space-y-2 py-1">
                      {Array.from({ length: Math.min(12, q.linesForAnswer || settings.openEndedLines || 4) }).map((_, lineIdx) => (
                        <div
                          key={lineIdx}
                          className="h-4 border-b border-stone-300 border-dotted w-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 py-1">
                      {Array.from({ length: Math.min(12, q.linesForAnswer || settings.openEndedLines || 4) }).map((_, lineIdx) => (
                        <div
                          key={lineIdx}
                          className="h-4 border-b border-stone-300/80 border-dashed w-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* True / False (Doğru / Yanlış) Seçenek Alanı */}
              {q.type === 'true_false' && (
                <div className="mt-2.5 flex items-center gap-3 text-xs select-text">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold transition-colors ${
                      settings.isTeacherVersion && q.correctAnswer === 'Doğru'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-1 ring-emerald-400 font-extrabold shadow-2xs'
                        : 'border-stone-300 bg-stone-50/80 text-stone-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center text-[10px] font-mono">
                      {settings.isTeacherVersion && q.correctAnswer === 'Doğru' ? '✓' : ''}
                    </span>
                    <span>( D ) DOĞRU</span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold transition-colors ${
                      settings.isTeacherVersion && q.correctAnswer === 'Yanlış'
                        ? 'bg-rose-100 text-rose-900 border-rose-400 ring-1 ring-rose-400 font-extrabold shadow-2xs'
                        : 'border-stone-300 bg-stone-50/80 text-stone-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center text-[10px] font-mono">
                      {settings.isTeacherVersion && q.correctAnswer === 'Yanlış' ? '✓' : ''}
                    </span>
                    <span>( Y ) YANLIŞ</span>
                  </div>
                </div>
              )}

              {/* Boşluk Doldurma (Fill Blank) Alanı */}
              {q.type === 'fill_blank' && (
                <div className="mt-2.5 flex items-center gap-2 text-xs select-text">
                  <span className="text-stone-500 font-medium">Cevap Alanı:</span>
                  <div className="border-b-2 border-stone-400 border-dashed w-48 inline-block h-4" />
                  {settings.isTeacherVersion && q.correctAnswer && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      [ {q.correctAnswer} ]
                    </span>
                  )}
                </div>
              )}

              {/* Teacher Solution Box if Teacher Version */}
              {settings.isTeacherVersion && (q.solutionExplanation || q.correctAnswer) && (
                <div className="mt-2.5 rounded-lg border border-emerald-300 bg-emerald-50/90 p-2.5 text-xs text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Öğretmen Çözümü &amp; Doğru Cevap: {q.correctAnswer || ''}</span>
                  </div>
                  {q.solutionExplanation && (
                    <div className="leading-relaxed whitespace-pre-line text-[11px] text-emerald-900 border-t border-emerald-200/80 pt-1.5 mt-1 font-sans">
                      {q.solutionExplanation}
                    </div>
                  )}
                </div>
              )}

              {/* Visual Page Break Marker if active */}
              {isBreakAfter && (
                <div className="no-print mt-3 flex items-center gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50/90 px-3 py-1.5 text-[11px] font-bold text-amber-900">
                  <SplitSquareVertical className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>✂️ Manuel Sayfa Sonu — Sonraki soru {paperFormat} yeni sayfada başlar</span>
                  {onTogglePageBreak && (
                    <button
                      type="button"
                      onClick={() => onTogglePageBreak(globalIndex)}
                      className="ml-auto text-[10px] text-amber-800 underline hover:text-amber-950 font-semibold"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render High-Precision Optical Answer Form (Dairesel Baloncuklar, Ara Çizgilere Uyumlu, Sıralı)
  const renderOpticForm = () => {
    if (!questions || questions.length === 0) return null;
    const isMono = brand.printColorMode === 'monochrome';
    const primaryBg = isMono ? '#000000' : brand.primaryColor || '#1e293b';

    // Distribute questions sequentially across columns:
    const totalQ = settings.opticFormQuestionCount && settings.opticFormQuestionCount > 0
      ? settings.opticFormQuestionCount
      : questions.length;

    const optionCount = settings.opticFormOptionCount || (questions.some((q) => (q.options?.length || 0) >= 5 || q.correctAnswer === 'E') ? 5 : 4);
    const optionsList = ['A', 'B', 'C', 'D', 'E'].slice(0, optionCount);

    const numCols = totalQ <= 12 ? 2 : 4;
    const questionsPerCol = Math.ceil(totalQ / numCols);

    // Sequential vertical ordering:
    const columns: Array<Array<{ qId: string; num: number }>> = [];
    for (let c = 0; c < numCols; c++) {
      const startIdx = c * questionsPerCol;
      const endIdx = Math.min(startIdx + questionsPerCol, totalQ);
      const colItems = [];
      for (let i = startIdx; i < endIdx; i++) {
        const qRef = questions[i] || { id: `auto-opt-q-${i + 1}` };
        colItems.push({ qId: qRef.id, num: i + 1 });
      }
      if (colItems.length > 0) {
        columns.push(colItems);
      }
    }

    return (
      <div
        className="avoid-page-break mt-4 rounded-xl border p-3.5 shadow-2xs bg-white text-slate-800"
        style={{
          borderColor: isMono ? '#334155' : `${primaryBg}45`,
        }}
      >
        {/* Optic Header Bar with Calibration Timing Marks */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 mb-2.5 gap-1.5"
          style={{
            borderColor: isMono ? '#cbd5e1' : `${primaryBg}25`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-black inline-block shrink-0" />
            <span
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: isMono ? '#0f172a' : primaryBg }}
            >
              CEVAP OPTİK FORMU — KİTAPÇIK {settings.bookletType || 'A'}
            </span>
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
              style={{ borderColor: isMono ? '#94a3b8' : `${primaryBg}40`, color: isMono ? '#0f172a' : primaryBg }}
            >
              {totalQ} Soru &middot; {optionsList.length} Şık
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-stone-500 font-medium">
            <span>Kurşun kalem ile daireyi dışa taşırmadan kodlayınız.</span>
            <span className="w-2.5 h-2.5 bg-black inline-block shrink-0" />
          </div>
        </div>

        {/* Optical Grid with crisp vertical dividing lines ("ara çizgiler") */}
        <div
          className={`grid gap-2 text-xs font-mono divide-x ${
            columns.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
          }`}
          style={{ borderColor: isMono ? '#e2e8f0' : `${primaryBg}20` }}
        >
          {columns.map((colGroup, colIdx) => (
            <div
              key={colIdx}
              className={`space-y-1.5 ${colIdx > 0 ? 'pl-2 sm:pl-3' : 'pr-1'} ${colIdx < columns.length - 1 ? 'pr-2' : ''}`}
            >
              {colGroup.map(({ qId, num }) => (
                <div key={qId} className="flex items-center justify-between gap-1.5">
                  <span
                    className="w-5 text-right font-bold font-mono text-[10px]"
                    style={{ color: isMono ? '#0f172a' : primaryBg }}
                  >
                    {num}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {optionsList.map((opt) => (
                      <span
                        key={opt}
                        className="flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full border border-stone-400 text-[9px] sm:text-[10px] font-bold text-stone-700 bg-white aspect-square select-none leading-none hover:border-black transition-colors"
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

        {/* Bottom Optical Timing Calibration Marks */}
        <div
          className="mt-2.5 pt-1.5 border-t flex items-center justify-between text-[8px] font-mono text-stone-400"
          style={{ borderColor: isMono ? '#e2e8f0' : `${primaryBg}15` }}
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-black inline-block" />
            <span className="w-2 h-2 bg-black inline-block" />
            <span className="w-2 h-2 bg-black inline-block" />
          </div>
          <span>■ OPTİK FORM KALİBRASYON ŞERİDİ ■</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-black inline-block" />
            <span className="w-2 h-2 bg-black inline-block" />
            <span className="w-2 h-2 bg-black inline-block" />
          </div>
        </div>
      </div>
    );
  };

  // Render Answer Key Table supporting all 6 design models
  const renderAnswerKey = () => {
    const keyStyle = brand.answerKeyStyle || settings.answerKeyStyle || 'boxed-grid';
    const isMono = brand.printColorMode === 'monochrome';
    const primaryBg = isMono ? '#1f2937' : brand.primaryColor || '#0284c7';

    if (keyStyle === 'bottom-strip') {
      return (
        <div
          className="avoid-page-break mt-4 py-1.5 px-3 rounded border text-[10px] font-mono font-bold flex items-center justify-between select-none shadow-2xs"
          style={{ borderColor: `${primaryBg}45`, backgroundColor: `${primaryBg}08` }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: primaryBg }} />
            <span style={{ color: primaryBg }}>CEVAP ANAHTARI ({settings.bookletType} KİTAPÇIĞI):</span>
          </span>
          <span className="tracking-wide flex items-center gap-1 font-bold">
            {questions.map((q, idx) => (
              <span key={q.id || idx} className="inline-flex items-center">
                <span style={{ color: primaryBg }}>{idx + 1}-</span>
                <span className="text-stone-900">{q.correctAnswer || '-'}</span>
                {idx < questions.length - 1 && (
                  <span className="mx-1" style={{ color: `${primaryBg}60` }}>&middot;</span>
                )}
              </span>
            ))}
          </span>
        </div>
      );
    }

    if (keyStyle === 'compact-inline') {
      return (
        <div
          className="avoid-page-break mt-4 p-2.5 rounded-xl border select-none shadow-2xs"
          style={{ borderColor: `${primaryBg}40`, backgroundColor: `${primaryBg}08` }}
        >
          <div className="flex items-center justify-between border-b pb-1 mb-2" style={{ borderColor: `${primaryBg}25` }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: primaryBg }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: primaryBg }} />
              Cevap Anahtarı ({settings.bookletType} Kitapçığı)
            </span>
            <span className="text-[10px] font-mono font-bold" style={{ color: primaryBg }}>
              {questions.length} Soru
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            {questions.map((q, idx) => (
              <span
                key={q.id}
                className="px-2 py-0.5 rounded-full border bg-white font-bold text-stone-800 shadow-2xs"
                style={{ borderColor: `${primaryBg}50` }}
              >
                <strong className="font-bold mr-1" style={{ color: primaryBg }}>{idx + 1}.</strong>
                <span className="font-black" style={{ color: primaryBg }}>{q.correctAnswer || '-'}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (keyStyle === 'optic-bubbles') {
      return (
        <div
          className="avoid-page-break mt-4 p-2.5 rounded-xl border select-none shadow-2xs"
          style={{ borderColor: `${primaryBg}40`, backgroundColor: `${primaryBg}08` }}
        >
          <div className="flex items-center justify-between border-b pb-1 mb-2" style={{ borderColor: `${primaryBg}25` }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: primaryBg }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: primaryBg }} />
              Optik Kodlama Cevap Anahtarı ({settings.bookletType} Kitapçığı)
            </span>
            <span className="text-[10px] font-mono font-bold" style={{ color: primaryBg }}>
              {questions.length} Soru
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            {questions.map((q, idx) => {
              const options = q.options?.length ? q.options.map((_, i) => String.fromCharCode(65 + i)) : ['A', 'B', 'C', 'D'];
              return (
                <div key={q.id} className="flex items-center gap-1 border bg-white px-2 py-1 rounded shadow-2xs" style={{ borderColor: `${primaryBg}40` }}>
                  <span className="font-bold mr-0.5" style={{ color: primaryBg }}>{idx + 1}</span>
                  {options.map((opt) => (
                    <span
                      key={opt}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        q.correctAnswer === opt
                          ? 'text-white'
                          : 'border'
                      }`}
                      style={
                        q.correctAnswer === opt
                          ? { backgroundColor: primaryBg }
                          : { borderColor: `${primaryBg}45`, color: primaryBg }
                      }
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (keyStyle === 'table-bordered') {
      return (
        <div
          className="avoid-page-break mt-4 border bg-white select-none shadow-2xs"
          style={{ borderColor: `${primaryBg}60` }}
        >
          <div
            className="p-1.5 border-b flex items-center justify-between"
            style={{ backgroundColor: `${primaryBg}16`, borderColor: `${primaryBg}40` }}
          >
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: primaryBg }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: primaryBg }} />
              Resmî Sınav Komisyonu Cevap Matrisi ({settings.bookletType} Kitapçığı)
            </span>
            <span className="text-[10px] font-mono font-bold" style={{ color: primaryBg }}>{questions.length} Soru</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <tbody>
                <tr className="border-b font-bold" style={{ backgroundColor: `${primaryBg}10`, borderColor: `${primaryBg}35` }}>
                  <td className="px-2 py-1 border-r w-16" style={{ borderColor: `${primaryBg}35`, color: primaryBg }}>Soru</td>
                  {questions.map((_, idx) => (
                    <td key={idx} className="px-2 py-1 border-r min-w-[28px]" style={{ borderColor: `${primaryBg}35`, color: primaryBg }}>{idx + 1}</td>
                  ))}
                </tr>
                <tr className="font-black text-stone-900">
                  <td className="px-2 py-1 border-r font-bold" style={{ borderColor: `${primaryBg}35`, color: primaryBg, backgroundColor: `${primaryBg}14` }}>Cevap</td>
                  {questions.map((q, idx) => (
                    <td key={idx} className="px-2 py-1 border-r min-w-[28px]" style={{ borderColor: `${primaryBg}35`, color: primaryBg }}>
                      {q.correctAnswer || '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (keyStyle === 'split-columns') {
      const half = Math.ceil(questions.length / 2);
      const col1 = questions.slice(0, half);
      const col2 = questions.slice(half);

      return (
        <div className="avoid-page-break mt-4 grid grid-cols-2 gap-3 text-xs font-mono select-none">
          <div className="p-2 rounded border shadow-2xs" style={{ borderColor: `${primaryBg}40`, backgroundColor: `${primaryBg}08` }}>
            <div className="font-bold border-b pb-1 mb-1.5 text-[11px]" style={{ color: primaryBg, borderColor: `${primaryBg}25` }}>
              1. Bölüm (1-{col1.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {col1.map((q, idx) => (
                <span key={q.id} className="border bg-white px-1.5 py-0.5 rounded shadow-2xs" style={{ borderColor: `${primaryBg}40` }}>
                  <span className="mr-1 font-bold" style={{ color: primaryBg }}>{idx + 1}.</span>
                  <span className="font-bold" style={{ color: primaryBg }}>{q.correctAnswer || '-'}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="p-2 rounded border shadow-2xs" style={{ borderColor: `${primaryBg}40`, backgroundColor: `${primaryBg}08` }}>
            <div className="font-bold border-b pb-1 mb-1.5 text-[11px]" style={{ color: primaryBg, borderColor: `${primaryBg}25` }}>
              2. Bölüm ({half + 1}-{questions.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {col2.map((q, idx) => (
                <span key={q.id} className="border bg-white px-1.5 py-0.5 rounded shadow-2xs" style={{ borderColor: `${primaryBg}40` }}>
                  <span className="mr-1 font-bold" style={{ color: primaryBg }}>{half + idx + 1}.</span>
                  <span className="font-bold" style={{ color: primaryBg }}>{q.correctAnswer || '-'}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default: boxed-grid
    return (
      <div
        className="avoid-page-break mt-4 rounded-xl border p-3.5 shadow-2xs"
        style={{ borderColor: `${primaryBg}50`, backgroundColor: `${primaryBg}05` }}
      >
        <div className="flex items-center justify-between border-b pb-1.5 mb-2.5" style={{ borderColor: `${primaryBg}25` }}>
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: primaryBg }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: primaryBg }} />
            Cevap Anahtarı ({settings.bookletType} Kitapçığı)
          </span>
          <span className="text-[10px] font-mono font-bold" style={{ color: primaryBg }}>
            {questions.length} Soru
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-center border rounded overflow-hidden shadow-2xs"
              style={{ borderColor: `${primaryBg}50` }}
            >
              <span
                className="px-1.5 py-0.5 font-bold text-[11px] border-r"
                style={{ backgroundColor: `${primaryBg}14`, color: primaryBg, borderColor: `${primaryBg}35` }}
              >
                {idx + 1}
              </span>
              <span
                className="text-white px-2 py-0.5 font-black text-[11px]"
                style={{ backgroundColor: primaryBg }}
              >
                {q.correctAnswer || '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const isTwoCol = settings.columnCount === 2 && docType !== 'lecture';

  return (
    <div className="relative flex flex-1 overflow-hidden min-w-0 h-full w-full">
      {/* Injected Dynamic Print Page Size CSS to ensure 1:1 Preview-to-Print Match */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: ${paperFormat === 'Letter' ? 'letter' : paperFormat} ${orientation};
                margin: 0;
              }
            }
          `
        }}
      />

      {/* Morphing Expanding Pill FAB (Bound strictly to preview section bounds) */}
      <div
        ref={zoomFabRef}
        onMouseEnter={() => setIsZoomFabHovered(true)}
        onMouseLeave={() => setIsZoomFabHovered(false)}
        onClick={() => {
          if (!showZoomMenu) setIsZoomFabClicked(true);
        }}
        className={`no-print absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center shadow-2xl backdrop-blur-md rounded-full transition-all duration-300 ease-out select-none ${
          isDark
            ? 'bg-[#252833]/95 text-[#f0f2f5] border border-[#383f50] shadow-black/40'
            : 'bg-white/95 text-stone-800 border border-stone-200/90 shadow-stone-900/10'
        } ${
          showZoomMenu
            ? isDark
              ? 'h-11 px-3 py-1 ring-4 ring-black/40'
              : 'h-11 px-3 py-1 ring-4 ring-stone-900/5'
            : isDark
              ? 'h-11 w-11 justify-center cursor-pointer hover:bg-[#2c313e] hover:scale-105'
              : 'h-11 w-11 justify-center cursor-pointer hover:bg-stone-50 hover:scale-105'
        }`}
        title={showZoomMenu ? undefined : "Yakınlaştırma ve Çıktı Kontrolleri"}
      >
        {!showZoomMenu ? (
          /* Collapsed Circle State: Clean minimal icon only */
          <div className="flex items-center justify-center">
            <ZoomIn className={`h-5 w-5 ${isDark ? 'text-[#cbd1de]' : 'text-stone-700'}`} />
          </div>
        ) : (
          /* Expanded Unified Capsule State: The exact same circle has elongated into a pill */
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold whitespace-nowrap animate-in fade-in duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel((z) => Math.max(z - 10, 35));
              }}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-[#333846] text-[#cbd1de] hover:text-[#f0f2f5]'
                  : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
              title="Uzaklaştır"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <span
              className={`w-9 text-center font-mono text-xs font-bold ${
                isDark ? 'text-[#f0f2f5]' : 'text-stone-900'
              }`}
            >
              {zoomLevel}%
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel((z) => Math.min(z + 10, 140));
              }}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-[#333846] text-[#cbd1de] hover:text-[#f0f2f5]'
                  : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
              title="Yakınlaştır"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFitToWidth();
              }}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#373c49] hover:bg-[#414757] text-[#f0f2f5] border border-[#4b5264]'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200/80'
              }`}
              title="Kâğıdı ekrana sığdır"
            >
              Sığdır
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel(100);
              }}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-[#333846] text-[#9ba4b4] hover:text-[#f0f2f5]'
                  : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
              }`}
              title="Orijinal %100 Boyuta Dön"
            >
              %100
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomFabClicked(false);
                setIsZoomFabHovered(false);
              }}
              className={`p-1 rounded-full transition-colors ml-0.5 cursor-pointer ${
                isDark
                  ? 'text-[#838c9e] hover:text-[#f0f2f5] hover:bg-[#333846]'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title="Menüyü küçült"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Scrollable Canvas Container (Soft dark artboard desk so white A4 paper does not glare) */}
      <div
        ref={containerRef}
        className={`relative flex flex-1 flex-col items-center p-3 sm:p-8 overflow-auto w-full h-full min-w-0 transition-colors ${
          isDark ? 'bg-[#22252d]' : 'bg-[#eef1f6]'
        }`}
      >

      {/* Multi-Page Container Wrapper with Proportional Zoom */}
      <div
        className="document-zoom-wrapper flex flex-col items-center gap-6 pb-16 transition-all duration-150 origin-top"
        style={{
          zoom: zoomLevel !== 100 ? `${zoomLevel}%` : undefined,
        }}
      >
        {pages.map((pageData, pageIndex) => {
          const pageNumber = pageIndex + 1;
          const isFirstPage = pageIndex === 0;
          const isLastQuestionPage = pageIndex === pages.length - 1;
          const pageQuestions = pageData.all;

          // Split questions into two columns for this specific page if 2-column mode
          const leftCol = isTwoCol ? pageData.left : pageData.all;
          const rightCol = isTwoCol ? pageData.right : [];

          return (
            <div
              key={pageIndex}
              className="flex flex-col items-center shrink-0"
              style={{ width: paperWidthMm }}
            >
              {/* Page Number Ribbon (On Screen only) */}
              <div className="no-print mb-2 flex items-center justify-between w-full px-1 text-[11px] text-stone-500 dark:text-[#9ba2b0] font-semibold select-none flex-wrap gap-2">
                <div className="flex items-center gap-2 font-bold text-stone-700 dark:text-[#d3d8e2] flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-stone-500 dark:text-sky-400" />
                    Sayfa {pageNumber} / {totalPages} — {paperFormat} ({orientation === 'portrait' ? 'Dikey' : 'Yatay'})
                  </span>
                </div>
                <span className="text-stone-400 dark:text-[#888f9e] font-medium text-[10px]">
                  {pageQuestions.length} Soru bu sayfada
                </span>
              </div>

              {/* Physical Paper Sheet (Exact print media page) */}
              <div
                className={`page-sheet-container ${paperClass} relative px-6 py-5 sm:px-10 sm:py-7 shadow-[0_15px_35px_-10px_rgba(27,36,50,0.12),0_0_0_1px_rgba(27,36,50,0.06)] dark:shadow-[0_18px_45px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] rounded-none border border-stone-300 text-stone-900 selection:bg-stone-200 flex flex-col justify-between overflow-hidden shrink-0`}
                style={{
                  borderRadius: 0,
                  backgroundColor:
                    brand.paperTone === 'cream'
                      ? '#fbf8ed'
                      : brand.paperTone === 'cool'
                      ? '#f3f4f6'
                      : '#ffffff',
                  border:
                    brand.pageFrameStyle === 'full-border'
                      ? `3.5px solid ${brand.primaryColor || '#0284c7'}`
                      : undefined,
                  borderTop:
                    brand.pageFrameStyle === 'top-bottom-bars'
                      ? `4px solid ${brand.primaryColor || '#0284c7'}`
                      : undefined,
                  borderBottom:
                    brand.pageFrameStyle === 'top-bottom-bars'
                      ? `4px solid ${brand.primaryColor || '#0284c7'}`
                      : undefined,
                }}
              >
                {/* Corner Accents if selected */}
                {brand.pageFrameStyle === 'corner-accents' && (
                  <>
                    <div
                      className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 pointer-events-none"
                      style={{ borderColor: brand.primaryColor || '#0284c7' }}
                    />
                    <div
                      className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 pointer-events-none"
                      style={{ borderColor: brand.primaryColor || '#0284c7' }}
                    />
                    <div
                      className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 pointer-events-none"
                      style={{ borderColor: brand.primaryColor || '#0284c7' }}
                    />
                    <div
                      className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 pointer-events-none"
                      style={{ borderColor: brand.primaryColor || '#0284c7' }}
                    />
                  </>
                )}

                {/* Watermark if enabled */}
                {brand.showWatermark && (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
                    style={{ opacity: brand.watermarkOpacity || 0.04 }}
                  >
                    <span className="rotate-[-35deg] text-4xl sm:text-7xl font-black uppercase tracking-widest text-stone-900 text-center leading-tight">
                      {brand.watermarkText || (brand.instituteName?.trim() ? brand.instituteName : '')}
                    </span>
                  </div>
                )}

                {/* Header: Page 1 gets Full Exam/School Header; subsequent pages get Running Mini-Header */}
                {isFirstPage ? renderPage1Header() : renderRunningHeader(pageNumber)}

                {/* Questions for this page */}
                <div className="flex-1 min-h-0 flex flex-col justify-start">
                  {pageQuestions.length === 0 ? (
                    <div className="py-24 text-center text-xs text-stone-400">
                      Bu sayfada soru bulunmuyor.
                    </div>
                  ) : isTwoCol ? (
                    <div
                      className={`grid grid-cols-2 relative flex-1 ${
                        brand.spineDividerStyle === 'badge-text'
                          ? 'gap-8 sm:gap-10'
                          : brand.spineDividerStyle !== 'none'
                          ? 'gap-6 sm:gap-8'
                          : 'gap-4 sm:gap-6'
                      }`}
                    >
                      {/* Middle Column Divider Line & Spine Badge */}
                      {brand.spineDividerStyle !== 'none' && (
                        <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-0 pointer-events-none z-10">
                          <div
                            className="h-full"
                            style={{
                              borderLeft:
                                brand.spineDividerStyle === 'dashed'
                                  ? '1px dashed #cbd5e1'
                                  : brand.spineDividerStyle === 'double'
                                  ? '3px double #94a3b8'
                                  : `1px solid ${
                                      brand.spineDividerStyle === 'badge-text'
                                        ? (brand.printColorMode === 'monochrome' ? '#1f2937' : brand.primaryColor || '#0284c7')
                                        : (brand.printColorMode === 'monochrome' ? '#cbd5e1' : `${brand.primaryColor || '#0284c7'}40`)
                                    }`,
                            }}
                          />
                          {brand.spineDividerStyle === 'badge-text' && (
                            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap z-20">
                              <span
                                className="px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-wider text-white shadow-xs rotate-90 inline-block border border-white/40"
                                style={{
                                  backgroundColor:
                                    brand.printColorMode === 'monochrome'
                                      ? '#1f2937'
                                      : brand.primaryColor || '#0284c7',
                                }}
                              >
                                {brand.spineText || '◄ KAZANIM TESTİ ►'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Left Column */}
                      <div
                        className={`space-y-3.5 flex-1 min-w-0 ${
                          brand.spineDividerStyle === 'badge-text'
                            ? 'pr-4 sm:pr-5'
                            : brand.spineDividerStyle !== 'none'
                            ? 'pr-3 sm:pr-3.5'
                            : 'pr-0.5'
                        }`}
                      >
                        {leftCol.map((q) =>
                          renderQuestion(
                            q,
                            questions.findIndex((item) => item.id === q.id)
                          )
                        )}
                      </div>

                      {/* Right Column */}
                      <div
                        className={`space-y-3.5 flex-1 min-w-0 ${
                          brand.spineDividerStyle === 'badge-text'
                            ? 'pl-4 sm:pl-5'
                            : brand.spineDividerStyle !== 'none'
                            ? 'pl-3 sm:pl-3.5'
                            : 'pl-0.5'
                        }`}
                      >
                        {rightCol.map((q) =>
                          renderQuestion(
                            q,
                            questions.findIndex((item) => item.id === q.id)
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5 flex-1 min-w-0">
                      {pageQuestions.map((q) =>
                        renderQuestion(
                          q,
                          questions.findIndex((item) => item.id === q.id)
                        )
                      )}
                    </div>
                  )}

                  {/* If last question page and attachments fit on this page, render them dynamically at the bottom */}
                  {isLastQuestionPage && !needsDedicatedAttachmentPage && (
                    <div className="shrink-0 mt-auto pt-3 space-y-3">
                      {settings.showOpticForm && questions.length > 0 && renderOpticForm()}
                      {settings.showAnswerKey && questions.length > 0 && renderAnswerKey()}
                    </div>
                  )}
                </div>

                {/* Page Footer */}
                {renderPageFooter(pageNumber)}
              </div>
            </div>
          );
        })}

        {/* Dedicated Final Attachments Page (Optic Form & Answer Key) when question pages are full */}
        {needsDedicatedAttachmentPage && (
          <div className="flex flex-col items-center shrink-0" style={{ width: paperWidthMm }}>
            <div className="no-print mb-2 flex items-center justify-between w-full px-1 text-[11px] text-stone-500 font-semibold select-none">
              <span className="flex items-center gap-1.5 font-bold text-stone-700">
                <FileText className="h-3.5 w-3.5 text-stone-500" />
                Sayfa {totalPages} / {totalPages} — {paperFormat} ({orientation === 'portrait' ? 'Dikey' : 'Yatay'})
              </span>
              <span className="text-stone-400 font-medium">Optik Cevap Formu & Çözüm Matrisi</span>
            </div>

            <div
              className={`page-sheet-container ${paperClass} relative bg-white px-6 py-5 sm:px-10 sm:py-7 shadow-[0_20px_45px_-15px_rgba(27,36,50,0.14),0_0_0_1px_rgba(27,36,50,0.06)] rounded-xs border border-stone-200 text-stone-900 selection:bg-stone-200 flex flex-col justify-between overflow-hidden shrink-0`}
            >
              {renderRunningHeader(totalPages)}

              <div className="space-y-4 flex-1 min-h-0 py-3 flex flex-col justify-center">
                {settings.showOpticForm && renderOpticForm()}
                {settings.showAnswerKey && renderAnswerKey()}
              </div>

              {renderPageFooter(totalPages)}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
