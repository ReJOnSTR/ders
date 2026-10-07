'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DocumentType,
  DocumentSettings,
  BrandSettings,
  QuestionItem,
  SavedDocument,
  FormatBlueprint,
  QuestionPresentationFormat,
  QuestionType,
} from '@/types/studio';
import { INITIAL_QUESTIONS } from '@/data/sampleQuestions';
import { INITIAL_DOCUMENTS } from '@/data/initialDocuments';
import { INITIAL_FORMAT_BLUEPRINTS } from '@/data/initialFormatBlueprints';
import StudioNav, { StudioTab } from '@/components/StudioNav';
import StudioDashboard from '@/components/StudioDashboard';
import DocumentSettingsDrawer from '@/components/DocumentSettingsDrawer';
import DocumentPreview from '@/components/DocumentPreview';
import QuestionPoolDrawer from '@/components/QuestionPoolDrawer';
import CropToolModal from '@/components/CropToolModal';
import SmartBoardModal from '@/components/SmartBoardModal';
import BrandPage from '@/components/BrandPage';
import SidebarQuestionEditor from '@/components/SidebarQuestionEditor';
import QuestionEditorModal from '@/components/QuestionEditorModal';
import AddQuestionModal from '@/components/AddQuestionModal';
import PdfExportModal from '@/components/PdfExportModal';
import BookletMatrixModal from '@/components/BookletMatrixModal';
import {
  generateBookletQuestions,
  getNextBookletLetter,
  getBookletMatrix,
} from '@/lib/bookletManager';
import { generateAndDownloadPdf } from '@/lib/pdfExporter';
import {
  Plus,
  Trash2,
  Layers,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Copy,
  SplitSquareVertical,
  X,
  PanelLeft,
  SlidersHorizontal,
} from 'lucide-react';

const STORAGE_KEY = 'sinav_studio_project_v2';

const DEFAULT_BRAND: BrandSettings = {
  instituteName: 'ÖZEL BİLİM KOLEJİ',
  subTitle: 'Ölçme ve Değerlendirme Zümresi',
  teacherName: 'Uzm. Öğr. Selim Kara',
  branch: 'Matematik Bölümü',
  footerContact: 'Tel: 0850 123 45 67 · www.okulunuz.k12.tr',
  primaryColor: '#1e3a8a',
  fontFamily: 'sans',
  headerStyle: 'modern-publisher',
  questionBadgeStyle: 'badge',
  questionPointsStyle: 'capsule-pill',
  showQuestionPoints: true,
  pointsTextFormat: 'short-p',
  showWatermark: false,
  watermarkText: '',
  watermarkOpacity: 0.04,
  logoType: 'preset-book',
  showStudentInfo: true,
  studentInfoStyle: 'table-boxes',
  answerKeyStyle: 'bottom-strip',
  printColorMode: 'color',
  openEndedLines: 4,
  defaultQuestionPoints: 10,
  questionSpacing: 'normal'
};

const DEFAULT_SETTINGS: DocumentSettings = {
  title: '9. Sınıf Matematik — 1. Dönem 1. Ortak Yazılı Sınavı',
  subTitle: 'Denklem ve Eşitsizlikler & Kümeler',
  courseName: 'Matematik',
  gradeLevel: '9. Sınıf',
  academicYear: '2026-2027',
  termInfo: '1. Dönem 1. Ortak Yazılı Sınavı',
  durationMinutes: 40,
  bookletType: 'A',
  columnCount: 2,
  paperFormat: 'A4',
  orientation: 'portrait',
  questionsPerPage: 0,
  manualPageBreaks: [],
  fontSizeScale: 'normal',
  openEndedLines: 4,
  defaultQuestionPoints: 10,
  questionSpacing: 'normal',
  showOpticForm: true,
  opticFormPosition: 'bottom',
  showAnswerKey: true,
  showOutcomes: true,
  showPointsTable: false,
  isTeacherVersion: false
};

export default function StudioPage() {
  // Saved documents library
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>(() => INITIAL_DOCUMENTS);
  const [activeDocId, setActiveDocId] = useState<string>('doc-written-1');

  // Primary Navigation Tab (Starts on 'home' dashboard)
  const [activeTab, setActiveTab] = useState<StudioTab>('home');
  const [previousTab, setPreviousTab] = useState<'home' | 'editor'>('home');

  // Document Type (5 Atölye)
  const [docType, setDocType] = useState<DocumentType>('written');

  // Brand Settings
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);

  // Document Settings
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_SETTINGS);

  // Active Questions in Document (Master / Booklet A)
  const [questions, setQuestions] = useState<QuestionItem[]>(() => INITIAL_QUESTIONS.slice(0, 6));

  // Multi-Booklet Architecture (A, B, C, D... with deterministic question & option shuffling)
  const [availableBooklets, setAvailableBooklets] = useState<string[]>(['A', 'B']);
  const [bookletSeeds, setBookletSeeds] = useState<Record<string, number>>({ B: 1 });
  const [isBookletMatrixOpen, setIsBookletMatrixOpen] = useState(false);

  // Active Booklet Displayed Questions (A is pristine master; B, C, D... are deterministic shuffles)
  const displayedQuestions = React.useMemo(() => {
    const activeCode = settings.bookletType || 'A';
    if (activeCode === 'A') return questions;
    return generateBookletQuestions(questions, activeCode, bookletSeeds[activeCode] || 1);
  }, [questions, settings.bookletType, bookletSeeds]);

  // Central Question Pool
  const [poolQuestions, setPoolQuestions] = useState<QuestionItem[]>(() => INITIAL_QUESTIONS);

  // Format Blueprints (Ortak Yazılı, Yaprak Test, Ders Föyü, Deneme Sınavı, Soru Bankası vb.)
  const [formatBlueprints, setFormatBlueprints] = useState<FormatBlueprint[]>(() => INITIAL_FORMAT_BLUEPRINTS);
  const [targetBlueprintIdForBrand, setTargetBlueprintIdForBrand] = useState<string | undefined>(undefined);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isSmartBoardOpen, setIsSmartBoardOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Direct PDF Export Modal state
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({
    current: 0,
    total: 0,
    percent: 0,
    message: '',
  });
  const [isPdfCompleted, setIsPdfCompleted] = useState(false);
  const [pdfExportError, setPdfExportError] = useState<string | null>(null);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('sinav_studio_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  };

  // Ref to track if initial localStorage load is complete
  const isLoadedRef = React.useRef(false);

  // Restore from LocalStorage safely on mount without hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedTheme = localStorage.getItem('sinav_studio_theme') as 'light' | 'dark' | null;
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
          if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          }
        }

        const savedDocsStr = localStorage.getItem(STORAGE_KEY + '_library');
        if (savedDocsStr) {
          const parsedDocs = JSON.parse(savedDocsStr);
          if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
            setSavedDocuments(parsedDocs);
          }
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.activeDocId) setActiveDocId(parsed.activeDocId);
          if (parsed.docType) setDocType(parsed.docType);
          if (parsed.brand) setBrand(parsed.brand);
          if (parsed.settings) setSettings(parsed.settings);
          if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            setQuestions(parsed.questions);
          }
          if (Array.isArray(parsed.poolQuestions) && parsed.poolQuestions.length > 0) {
            setPoolQuestions(parsed.poolQuestions);
          }
        }

        const savedBlueprintsStr = localStorage.getItem('studio_format_blueprints');
        if (savedBlueprintsStr) {
          const parsedBp = JSON.parse(savedBlueprintsStr);
          if (Array.isArray(parsedBp) && parsedBp.length > 0) {
            setFormatBlueprints(parsedBp);
          }
        }
      } catch (e) {
        console.error('LocalStorage load error', e);
      } finally {
        isLoadedRef.current = true;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save to LocalStorage on changes (only after initial load has finished)
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY + '_library', JSON.stringify(savedDocuments));
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeDocId,
          docType,
          settings,
          brand,
          questions,
          poolQuestions,
        })
      );
    } catch {
      // quota or private mode
    }
  }, [savedDocuments, activeDocId, docType, settings, brand, questions, poolQuestions]);

  // Save Format Blueprints to LocalStorage
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem('studio_format_blueprints', JSON.stringify(formatBlueprints));
    } catch {
      // quota or private mode
    }
  }, [formatBlueprints]);

  // Keep active document synchronized with savedDocuments library
  useEffect(() => {
    if (!isLoadedRef.current || !activeDocId) return;
    setSavedDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? {
              ...d,
              docType,
              settings,
              brand,
              questions,
              title: settings.title || d.title,
              subTitle: settings.subTitle || d.subTitle,
              courseName: settings.courseName || d.courseName,
              gradeLevel: settings.gradeLevel || d.gradeLevel,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );
  }, [docType, settings, brand, questions, activeDocId]);

  // Document Library Handlers
  const handleOpenDocument = (docId: string) => {
    const doc = savedDocuments.find((d) => d.id === docId);
    if (doc) {
      setActiveDocId(doc.id);
      setDocType(doc.docType);
      setSettings(doc.settings);
      setBrand(doc.brand);
      setQuestions(doc.questions || []);
      setPreviousTab('editor');
      setActiveTab('editor');
    }
  };

  const handleCreateNewDocument = (params: {
    docType: DocumentType;
    title: string;
    courseName: string;
    gradeLevel: string;
    paperFormat: 'A4' | 'A3' | 'B5' | 'Letter';
    withSampleQuestions: boolean;
  }) => {
    const newId = `doc-${Date.now()}`;
    const initialQs = params.withSampleQuestions
      ? INITIAL_QUESTIONS.filter((q) => {
          if (params.docType === 'test') return q.type === 'multiple_choice';
          if (params.docType === 'lecture') return q.type === 'lecture_block' || q.type === 'open_ended';
          return true;
        }).slice(0, 6)
      : [];

    // Find saved format blueprint for this docType if exists
    const matchingBp = formatBlueprints.find((b) => b.docType === params.docType);
    const selectedBrand: BrandSettings = matchingBp ? { ...matchingBp.brand } : DEFAULT_BRAND;
    const blueprintDocSettings = matchingBp ? matchingBp.settings : {};

    const newDocSettings: DocumentSettings = {
      ...DEFAULT_SETTINGS,
      ...blueprintDocSettings,
      title: params.title,
      subTitle: `${params.courseName} — ${params.gradeLevel}`,
      courseName: params.courseName,
      gradeLevel: params.gradeLevel,
      paperFormat: params.paperFormat,
      orientation: 'portrait',
      columnCount: matchingBp?.settings?.columnCount ?? (params.docType === 'written' ? 1 : 2),
      showPointsTable: false,
      showOpticForm: matchingBp?.settings?.showOpticForm ?? (params.docType === 'exam'),
      showAnswerKey: matchingBp?.settings?.showAnswerKey ?? (params.docType === 'test' || params.docType === 'exam'),
      isTeacherVersion: false,
    };

    const newDoc: SavedDocument = {
      id: newId,
      title: params.title,
      subTitle: `${params.courseName} · ${params.gradeLevel}`,
      docType: params.docType,
      courseName: params.courseName,
      gradeLevel: params.gradeLevel,
      settings: newDocSettings,
      brand: selectedBrand,
      questions: initialQs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newId);
    setDocType(params.docType);
    setSettings(newDocSettings);
    setBrand(selectedBrand);
    setQuestions(initialQs);
    setPreviousTab('editor');
    setActiveTab('editor');
  };

  // Direct Document Creation from a Saved Format Blueprint
  const handleCreateDocumentFromBlueprint = (bp: FormatBlueprint) => {
    const newId = `doc-${Date.now()}`;
    const initialQs = INITIAL_QUESTIONS.filter((q) => {
      if (bp.docType === 'test') return q.type === 'multiple_choice';
      if (bp.docType === 'lecture') return q.type === 'lecture_block' || q.type === 'open_ended';
      return true;
    }).slice(0, 6);

    const docTitle = bp.sampleTitle || `${bp.title} — 1. Dönem`;
    const docCourse = bp.sampleCourse || 'Matematik';
    const docGrade = bp.sampleGrade || '9. Sınıf';

    const newDocSettings: DocumentSettings = {
      ...DEFAULT_SETTINGS,
      ...bp.settings,
      title: docTitle,
      subTitle: `${docCourse} — ${docGrade}`,
      courseName: docCourse,
      gradeLevel: docGrade,
      isTeacherVersion: false,
    };

    const newDoc: SavedDocument = {
      id: newId,
      title: docTitle,
      subTitle: `${docCourse} · ${docGrade}`,
      docType: bp.docType,
      courseName: docCourse,
      gradeLevel: docGrade,
      settings: newDocSettings,
      brand: { ...bp.brand },
      questions: initialQs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newId);
    setDocType(bp.docType);
    setSettings(newDocSettings);
    setBrand({ ...bp.brand });
    setQuestions(initialQs);
    setPreviousTab('editor');
    setActiveTab('editor');
  };

  // Format Blueprint Customization Handlers
  const handleSaveBlueprint = (updatedBp: FormatBlueprint) => {
    setFormatBlueprints((prev) => {
      const exists = prev.some((b) => b.id === updatedBp.id);
      if (exists) {
        return prev.map((b) => (b.id === updatedBp.id ? updatedBp : b));
      }
      return [...prev, updatedBp];
    });

    // If currently active doc in editor matches this blueprint's docType, synchronize brand & settings
    if (docType === updatedBp.docType) {
      setBrand(updatedBp.brand);
      setSettings((prev) => ({
        ...prev,
        ...updatedBp.settings,
      }));
    }
  };

  const handleResetBlueprintToDefault = (blueprintId: string) => {
    const defaultBp = INITIAL_FORMAT_BLUEPRINTS.find((b) => b.id === blueprintId);
    if (defaultBp) {
      setFormatBlueprints((prev) =>
        prev.map((b) => (b.id === blueprintId ? { ...defaultBp } : b))
      );
      if (docType === defaultBp.docType) {
        setBrand({ ...defaultBp.brand });
        setSettings((prev) => ({ ...prev, ...defaultBp.settings }));
      }
    }
  };

  const handleAddNewBlueprint = (newBp: FormatBlueprint) => {
    setFormatBlueprints((prev) => [...prev, newBp]);
  };

  const handleDeleteBlueprint = (blueprintId: string) => {
    setFormatBlueprints((prev) => prev.filter((b) => b.id !== blueprintId));
  };

  const handleDuplicateDocument = (docId: string) => {
    const doc = savedDocuments.find((d) => d.id === docId);
    if (!doc) return;
    const dupId = `doc-${Date.now()}`;
    const dupDoc: SavedDocument = {
      ...doc,
      id: dupId,
      title: `${doc.title} (Kopya)`,
      settings: {
        ...doc.settings,
        title: `${doc.settings.title} (Kopya)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSavedDocuments((prev) => [dupDoc, ...prev]);
  };

  const handleDeleteDocument = (docId: string) => {
    const nextList = savedDocuments.filter((d) => d.id !== docId);
    setSavedDocuments(nextList);
    if (activeDocId === docId && nextList.length > 0) {
      handleOpenDocument(nextList[0].id);
    }
  };

  const handleDuplicateMultipleDocuments = (docIds: string[]) => {
    const newDocs: SavedDocument[] = [];
    docIds.forEach((id, idx) => {
      const doc = savedDocuments.find((d) => d.id === id);
      if (doc) {
        const dupId = `doc-${Date.now()}-${idx}`;
        newDocs.push({
          ...doc,
          id: dupId,
          title: `${doc.title} (Kopya)`,
          settings: {
            ...doc.settings,
            title: `${doc.settings.title} (Kopya)`,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
    if (newDocs.length > 0) {
      setSavedDocuments((prev) => [...newDocs, ...prev]);
    }
  };

  const handleDeleteMultipleDocuments = (docIds: string[]) => {
    const idSet = new Set(docIds);
    const nextList = savedDocuments.filter((d) => !idSet.has(d.id));
    setSavedDocuments(nextList);
    if (idSet.has(activeDocId) && nextList.length > 0) {
      handleOpenDocument(nextList[0].id);
    }
  };

  const handlePrintMultipleDocuments = (docs: SavedDocument[]) => {
    if (docs.length === 0) return;
    handleOpenDocument(docs[0].id);
    setTimeout(() => {
      handleExportPdfDirect('direct');
    }, 450);
  };

  const handlePrintDocumentFromDashboard = (doc: SavedDocument) => {
    handleOpenDocument(doc.id);
    setTimeout(() => {
      handleExportPdfDirect('direct');
    }, 450);
  };

  // Direct High-Resolution Vector/Canvas PDF Download
  const handleExportPdfDirect = async (
    mode: 'student' | 'teacher' | 'color' | 'monochrome' | 'direct' = 'direct'
  ) => {
    // If currently on home or other tab, ensure editor is active to mount sheets
    if (activeTab === 'home') {
      setActiveTab('editor');
    }

    if (mode === 'student') {
      setSettings((prev) => ({ ...prev, isTeacherVersion: false }));
    } else if (mode === 'teacher') {
      setSettings((prev) => ({ ...prev, isTeacherVersion: true }));
    } else if (mode === 'color') {
      setBrand((prev) => ({ ...prev, printColorMode: 'color' }));
    } else if (mode === 'monochrome') {
      setBrand((prev) => ({ ...prev, printColorMode: 'monochrome' }));
    }

    setIsPdfExportModalOpen(true);
    setIsPdfCompleted(false);
    setPdfExportError(null);
    setPdfProgress({
      current: 0,
      total: 0,
      percent: 5,
      message: 'Sayfa katmanları taranıyor...',
    });

    // Give React 300ms to re-render DOM with changes
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      await generateAndDownloadPdf({
        docTitle: settings.title || 'Sinav-Kagidi',
        paperFormat: settings.paperFormat || 'A4',
        orientation: settings.orientation || 'portrait',
        onProgress: (prog) => {
          setPdfProgress(prog);
        },
      });
      setIsPdfCompleted(true);
    } catch (err: unknown) {
      console.error('PDF export error:', err);
      const msg =
        err instanceof Error ? err.message : 'PDF oluşturulurken bir hata oluştu.';
      setPdfExportError(msg);
    }
  };

  // Handle switching document type with intelligent defaults
  const handleDocTypeChange = (newType: DocumentType) => {
    setDocType(newType);
    if (newType === 'written') {
      setSettings((prev) => ({
        ...prev,
        title: `${prev.gradeLevel} ${prev.courseName} — 1. Dönem 1. Ortak Yazılı Sınavı`,
        termInfo: '1. Dönem 1. Ortak Yazılı',
        columnCount: 2,
        showPointsTable: false,
        showOpticForm: false
      }));
    } else if (newType === 'lecture') {
      setSettings((prev) => ({
        ...prev,
        title: `${prev.courseName} Konu Anlatım Föyü 01`,
        subTitle: 'Konu Özeti, Formüller ve Sıra Sizde',
        columnCount: 1,
        showOpticForm: false,
        showAnswerKey: false
      }));
      const lectureSample = INITIAL_QUESTIONS.filter((q) => q.type === 'lecture_block');
      if (lectureSample.length > 0 && !questions.some((q) => q.type === 'lecture_block')) {
        setQuestions((prev) => [...lectureSample, ...prev]);
      }
    } else if (newType === 'test') {
      setSettings((prev) => ({
        ...prev,
        title: `${prev.courseName} Yaprak Test 01`,
        termInfo: 'Konu Tarama Testi',
        columnCount: 2,
        showOpticForm: true,
        showAnswerKey: true
      }));
    } else if (newType === 'exam') {
      setSettings((prev) => ({
        ...prev,
        title: `Kurumsal Deneme Sınavı — 01 (${settings.gradeLevel})`,
        termInfo: 'Genel Değerlendirme Denemesi',
        durationMinutes: 120,
        columnCount: 2,
        showOpticForm: true,
        showAnswerKey: true
      }));
    } else if (newType === 'question_bank') {
      setSettings((prev) => ({
        ...prev,
        title: `${prev.courseName} Soru Bankası Fasikülü`,
        termInfo: 'Ünite Değerlendirme Testleri',
        columnCount: 2,
        showOpticForm: false,
        showAnswerKey: true
      }));
    }
  };

  // Reorder question in document
  const handleReorderQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setQuestions(updated);
  };

  // Remove question from document
  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Update points for a question
  const handleUpdatePoints = (id: string, newPoints: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, points: newPoints } : q))
    );
  };

  // Inline update text for a question
  const handleUpdateQuestionText = (id: string, newText: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text: newText } : q))
    );
  };

  // Comprehensive update for a question from sidebar editor
  const handleUpdateQuestion = (id: string, updates: Partial<QuestionItem>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  // Duplicate a question
  const handleDuplicateQuestion = (q: QuestionItem) => {
    const clone: QuestionItem = {
      ...q,
      id: `clone-${q.id}-${questions.length + 1}`,
      text: q.text + ' (Kopya)'
    };
    const index = questions.findIndex((item) => item.id === q.id);
    if (index !== -1) {
      const updated = [...questions];
      updated.splice(index + 1, 0, clone);
      setQuestions(updated);
    } else {
      setQuestions((prev) => [...prev, clone]);
    }
  };

  // Quick insert question at specific position
  const handleQuickAddQuestion = (afterIndex: number) => {
    const blank: QuestionItem = {
      id: `custom-q-${questions.length + 1}`,
      type: 'multiple_choice',
      courseName: settings.courseName,
      gradeLevel: settings.gradeLevel,
      difficulty: 'Orta',
      points: 10,
      text: 'Yeni soru metnini buraya yazınız...',
      options: ['A) Seçenek 1', 'B) Seçenek 2', 'C) Seçenek 3', 'D) Seçenek 4', 'E) Seçenek 5'],
      correctAnswer: 'A'
    };
    const updated = [...questions];
    updated.splice(afterIndex + 1, 0, blank);
    setQuestions(updated);
  };

  // Toggle manual page break after a question index
  const handleTogglePageBreak = (questionIndex: number) => {
    setSettings((prev) => {
      const currentBreaks = new Set(prev.manualPageBreaks || []);
      if (currentBreaks.has(questionIndex)) {
        currentBreaks.delete(questionIndex);
      } else {
        currentBreaks.add(questionIndex);
      }
      return {
        ...prev,
        manualPageBreaks: Array.from(currentBreaks).sort((a, b) => a - b)
      };
    });
  };

  // Add question to document
  const handleAddQuestionToDoc = (q: QuestionItem) => {
    setQuestions((prev) => [...prev, q]);
  };

  // Add multiple questions to document
  const handleAddMultipleToDoc = (items: QuestionItem[]) => {
    setQuestions((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const fresh = items.filter((item) => !existingIds.has(item.id));
      return [...prev, ...fresh];
    });
  };

  // Add new question to pool
  const handleAddNewToPool = (q: QuestionItem) => {
    setPoolQuestions((prev) => [q, ...prev]);
  };

  // Auto-balance points to 100 for written exam
  const handleAutoBalancePoints = () => {
    if (questions.length === 0) return;
    const basePoints = Math.floor(100 / questions.length);
    const remainder = 100 % questions.length;

    const updated = questions.map((q, idx) => ({
      ...q,
      points: idx < remainder ? basePoints + 1 : basePoints
    }));
    setQuestions(updated);
  };

  // Multi-Booklet Handlers
  const handleAddBooklet = () => {
    const nextLetter = getNextBookletLetter(availableBooklets);
    if (!nextLetter) return;
    setAvailableBooklets((prev) => [...prev, nextLetter]);
    setBookletSeeds((prev) => ({ ...prev, [nextLetter]: 1 }));
    setSettings((prev) => ({ ...prev, bookletType: nextLetter }));
  };

  const handleRemoveBooklet = (code: string) => {
    if (code === 'A') return; // Cannot delete master booklet A
    setAvailableBooklets((prev) => prev.filter((b) => b !== code));
    if (settings.bookletType === code) {
      setSettings((prev) => ({ ...prev, bookletType: 'A' }));
    }
  };

  const handleReshuffleBooklet = (code: string) => {
    if (code === 'A') return;
    setBookletSeeds((prev) => ({
      ...prev,
      [code]: (prev[code] || 1) + 1,
    }));
  };

  // Generate or activate Booklet B
  const handleGenerateBookletB = () => {
    if (!availableBooklets.includes('B')) {
      setAvailableBooklets((prev) => [...prev, 'B']);
    }
    handleReshuffleBooklet('B');
    setSettings((prev) => ({ ...prev, bookletType: 'B' }));
  };

  // Reset to default sample
  const handleResetToTemplate = () => {
    setQuestions(INITIAL_QUESTIONS.slice(0, 6));
    setBrand(DEFAULT_BRAND);
    setSettings(DEFAULT_SETTINGS);
    setDocType('written');
  };

  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  // Directly create and append a new question with chosen presentation format & subtype
  const handleSelectAddFormat = (
    format: QuestionPresentationFormat | 'lecture_block',
    subType: QuestionType = 'multiple_choice'
  ) => {
    const nextNumber = questions.length + 1;
    let newQ: QuestionItem;

    if (format === 'lecture_block') {
      newQ = {
        id: `q-${Date.now()}`,
        type: 'lecture_block',
        courseName: settings.courseName,
        gradeLevel: settings.gradeLevel,
        difficulty: 'Kolay',
        points: 0,
        blockType: 'formula',
        blockTitle: 'ÖNEMLİ KURAL & FORMÜL BİLGİSİ',
        text: 'Bu alana konu özetini, kural tanımını veya formül detaylarını yazabilirsiniz.',
        options: [],
        correctAnswer: '',
      };
    } else if (format === 'image_only') {
      newQ = {
        id: `q-${Date.now()}`,
        type: 'multiple_choice',
        courseName: settings.courseName,
        gradeLevel: settings.gradeLevel,
        difficulty: 'Orta',
        points: docType === 'written' ? 10 : 5,
        text: '',
        options: [
          'A) Seçenek A',
          'B) Seçenek B',
          'C) Seçenek C',
          'D) Seçenek D',
          'E) Seçenek E',
        ],
        correctAnswer: 'A',
        presentationFormat: 'image_only',
        isImageOnly: true,
        optionsInImage: true,
        copyableOptions: true,
        imageWidthPercent: 100,
      };
    } else if (format === 'image_ocr') {
      newQ = {
        id: `q-${Date.now()}`,
        type: 'multiple_choice',
        courseName: settings.courseName,
        gradeLevel: settings.gradeLevel,
        difficulty: 'Orta',
        points: docType === 'written' ? 10 : 5,
        text: '',
        options: [
          'A) Yalnız I',
          'B) Yalnız II',
          'C) I ve II',
          'D) II ve III',
          'E) I, II ve III',
        ],
        correctAnswer: 'C',
        presentationFormat: 'image_ocr',
        isImageOnly: false,
        optionsInImage: false,
      };
    } else if (format === 'image_hybrid') {
      const qType = subType || 'multiple_choice';
      newQ = {
        id: `q-${Date.now()}`,
        type: qType,
        courseName: settings.courseName,
        gradeLevel: settings.gradeLevel,
        difficulty: 'Orta',
        points: docType === 'written' ? 10 : 5,
        text: 'Yukarıdaki görselde verilen bilgilere göre doğru seçeneği işaretleyiniz.',
        options:
          qType === 'multiple_choice'
            ? [
                'A) Birinci seçenek metni',
                'B) İkinci seçenek metni',
                'C) Üçüncü seçenek metni',
                'D) Dördüncü seçenek metni',
                'E) Beşinci seçenek metni',
              ]
            : qType === 'true_false'
            ? ['(D) Doğru', '(Y) Yanlış']
            : [],
        correctAnswer: qType === 'true_false' ? 'Doğru' : 'A',
        linesForAnswer: qType === 'open_ended' ? 4 : undefined,
        presentationFormat: 'image_hybrid',
        isImageOnly: false,
        optionsInImage: false,
        imageWidthPercent: 80,
      };
    } else {
      // text_only
      const qType = subType || 'multiple_choice';
      newQ = {
        id: `q-${Date.now()}`,
        type: qType,
        courseName: settings.courseName,
        gradeLevel: settings.gradeLevel,
        difficulty: 'Orta',
        points: docType === 'written' ? 10 : 5,
        text:
          qType === 'open_ended'
            ? `Soru ${nextNumber}: Problemin çözüm aşamalarını göstererek sonucunu bulunuz.`
            : qType === 'true_false'
            ? `Soru ${nextNumber}: Aşağıdaki ifadenin doğru (D) veya yanlış (Y) olduğunu belirtiniz.`
            : qType === 'fill_blank'
            ? `Soru ${nextNumber}: Tanımda noktalı alana ................... terimi yazılmalıdır.`
            : `Soru ${nextNumber}: Aşağıdaki ifadelerden hangisi doğrudur?`,
        options:
          qType === 'multiple_choice'
            ? [
                'A) Birinci seçenek metni',
                'B) İkinci seçenek metni',
                'C) Üçüncü seçenek metni',
                'D) Dördüncü seçenek metni',
                'E) Beşinci seçenek metni',
              ]
            : qType === 'true_false'
            ? ['(D) Doğru', '(Y) Yanlış']
            : [],
        correctAnswer:
          qType === 'true_false'
            ? 'Doğru'
            : qType === 'open_ended'
            ? 'Öğretmen çözüm ve puanlama anahtarı'
            : qType === 'fill_blank'
            ? 'Terim'
            : 'A',
        linesForAnswer: qType === 'open_ended' ? 4 : undefined,
        presentationFormat: 'text_only',
        isImageOnly: false,
        optionsInImage: false,
      };
    }

    setQuestions((prev) => {
      const next = [...prev, newQ];
      setEditingQuestionIndex(next.length - 1);
      return next;
    });
  };

  const totalPoints = questions.reduce(
    (sum, q) => sum + (q.type !== 'lecture_block' ? (q.points || 0) : 0),
    0
  );

  // Compute question counting excluding lecture blocks
  const realQuestionsCount = questions.filter((q) => q.type !== 'lecture_block').length;
  const lectureBlocksCount = questions.filter((q) => q.type === 'lecture_block').length;

  let qCount = 0;
  const questionNumberMap = questions.map((q) => {
    if (q.type !== 'lecture_block') {
      qCount++;
      return qCount;
    }
    return 0;
  });

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden font-sans antialiased transition-colors ${
        theme === 'dark' ? 'dark bg-[#1a1c23] text-[#e5e8ef]' : 'bg-[#f8f9fb] text-slate-900'
      }`}
    >
      {activeTab === 'home' ? (
        <StudioDashboard
          documents={savedDocuments}
          onOpenDocument={handleOpenDocument}
          onCreateNewDocument={handleCreateNewDocument}
          onDuplicateDocument={handleDuplicateDocument}
          onDeleteDocument={handleDeleteDocument}
          onPrintDocument={handlePrintDocumentFromDashboard}
          onDuplicateMultipleDocuments={handleDuplicateMultipleDocuments}
          onDeleteMultipleDocuments={handleDeleteMultipleDocuments}
          onPrintMultipleDocuments={handlePrintMultipleDocuments}
          onOpenBrand={(blueprintId?: string) => {
            setTargetBlueprintIdForBrand(blueprintId);
            if (blueprintId) {
              const bp = formatBlueprints.find((b) => b.id === blueprintId);
              if (bp) {
                setBrand({ ...bp.brand });
                setSettings((prev) => ({
                  ...prev,
                  ...bp.settings,
                  title: bp.sampleTitle || prev.title,
                  courseName: bp.sampleCourse || prev.courseName,
                  gradeLevel: bp.sampleGrade || prev.gradeLevel,
                }));
                setDocType(bp.docType);
              }
            }
            setPreviousTab('home');
            setActiveTab('brand');
          }}
          theme={theme}
          onThemeChange={handleThemeChange}
          blueprints={formatBlueprints}
          onCreateFromBlueprint={handleCreateDocumentFromBlueprint}
        />
      ) : activeTab === 'brand' ? (
        <BrandPage
          key={targetBlueprintIdForBrand || 'brand'}
          settings={brand}
          onChange={setBrand}
          docSettings={settings}
          onDocSettingsChange={setSettings}
          docType={docType}
          onDocTypeChange={handleDocTypeChange}
          questions={questions}
          onOpenEditor={() => setActiveTab('editor')}
          onOpenHome={() => setActiveTab('home')}
          theme={theme}
          blueprints={formatBlueprints}
          onSaveBlueprint={handleSaveBlueprint}
          onCreateDocumentFromBlueprint={handleCreateDocumentFromBlueprint}
          onResetBlueprintToDefault={handleResetBlueprintToDefault}
          onAddNewBlueprint={handleAddNewBlueprint}
          onDeleteBlueprint={handleDeleteBlueprint}
          initialSelectedFormatId={targetBlueprintIdForBrand}
        />
      ) : (
        <>
          {/* 1. Sleek Modern Unified Header with Professional Menus */}
          <StudioNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === 'home') setPreviousTab('home');
              else if (tab === 'editor') setPreviousTab('editor');
              setActiveTab(tab);
            }}
            questionCount={questions.length}
            totalPoints={totalPoints}
            docTitle={settings.title}
            onDocTitleChange={(title) => setSettings((s) => ({ ...s, title }))}
            onOpenSmartBoard={() => setIsSmartBoardOpen(true)}
            onPrint={() => window.print()}
            onExportPdfDirect={handleExportPdfDirect}
            docType={docType}
            onDocTypeChange={handleDocTypeChange}
            settings={settings}
            onSettingsChange={setSettings}
            brand={brand}
            onBrandChange={setBrand}
            onAutoBalancePoints={handleAutoBalancePoints}
            onGenerateBookletB={handleGenerateBookletB}
            theme={theme}
          />

          {/* 2. Primary Workspace Body */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Studio Content: Left Questions List + Center A4 Sheet + Right Settings */}
            <div className="relative flex flex-1 overflow-hidden">
              {/* Sol Duvara Bağlı Soru Listesi Butonu (Ekran Ortasında) */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className={`no-print fixed md:absolute top-1/2 -translate-y-1/2 z-40 flex items-center justify-center h-12 w-9 rounded-r-xl border border-l-0 border-slate-300 dark:border-[#383f4f] bg-white/95 dark:bg-[#242833]/95 backdrop-blur-md shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-[#2c313f] dark:hover:text-white text-slate-700 dark:text-[#d6dae4] transition-all duration-300 ease-in-out cursor-pointer ${
                  isSidebarOpen ? 'left-[390px] max-md:left-0' : 'left-0'
                }`}
                title={isSidebarOpen ? 'Soru listesi panelini kapat' : 'Soru listesi panelini aç'}
                aria-label="Soru Listesi"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <PanelLeft className="h-5 w-5" />
                )}
              </button>

              {/* Sağ Duvara Bağlı Belge Ayarları Butonu (Ekran Ortasında) */}
              <button
                type="button"
                onClick={() => setIsSettingsDrawerOpen((prev) => !prev)}
                className={`no-print fixed md:absolute top-1/2 -translate-y-1/2 z-40 flex items-center justify-center h-12 w-9 rounded-l-xl border border-r-0 border-slate-300 dark:border-[#383f4f] bg-white/95 dark:bg-[#242833]/95 backdrop-blur-md shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-[#2c313f] dark:hover:text-white text-slate-700 dark:text-[#d6dae4] transition-all duration-300 ease-in-out cursor-pointer ${
                  isSettingsDrawerOpen ? 'right-[400px] max-md:right-0' : 'right-0'
                }`}
                title={isSettingsDrawerOpen ? 'Ayarlar panelini kapat' : 'Belge ayarları panelini aç'}
                aria-label="Belge Ayarları"
              >
                {isSettingsDrawerOpen ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <SlidersHorizontal className="h-5 w-5" />
                )}
              </button>

              {/* Collapsible Left Questions Sidebar with Smooth Spring Animation */}
              <AnimatePresence initial={false}>
                {isSidebarOpen && (
                  <>
                    {/* Mobile Backdrop for Questions Sidebar */}
                    <motion.div
                      key="sidebar-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="no-print fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
                      onClick={() => setIsSidebarOpen(false)}
                      aria-hidden="true"
                    />

                    <motion.aside
                      key="questions-sidebar"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 390, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                      className={`no-print fixed md:relative inset-y-0 left-0 z-50 md:z-10 max-w-[90vw] flex flex-col border-r shadow-2xl md:shadow-xs select-none h-full overflow-hidden shrink-0 transition-colors ${
                        theme === 'dark'
                          ? 'border-[#2c303c] bg-[#20232c] text-[#f0f2f5]'
                          : 'border-slate-200 bg-white text-slate-900'
                      }`}
                    >
                      <div className="w-[390px] h-full flex flex-col shrink-0">
                        <div
                          className={`flex items-center justify-between border-b px-4 py-3 transition-colors ${
                            theme === 'dark'
                              ? 'border-[#2c303c] bg-[#242732]'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Layers className={`h-4 w-4 ${theme === 'dark' ? 'text-sky-400' : 'text-sky-600'}`} />
                            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                              {lectureBlocksCount > 0
                                ? `İçerik & Sorular (${realQuestionsCount} Soru, ${lectureBlocksCount} Blok)`
                                : `Sorularım (${realQuestionsCount})`}
                            </h3>
                          </div>
                          <span className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {totalPoints} Puan
                          </span>
                        </div>

            {/* Question list with spacious comfortable styling */}
            <div
              className={`flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3 transition-colors ${
                theme === 'dark' ? 'bg-[#1a1c23]' : 'bg-[#f8f9fb]'
              }`}
            >
              {questions.length === 0 ? (
                <div className="py-12 px-4 text-center text-xs text-slate-400 space-y-2">
                  <p>Belgenizde soru veya içerik bloğu bulunmuyor.</p>
                  <p className="text-[11px] text-slate-400">Aşağıdaki butonu kullanarak hemen ekleyin.</p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <React.Fragment key={q.id}>
                    <SidebarQuestionEditor
                      question={q}
                      index={idx}
                      questionNumber={questionNumberMap[idx]}
                      isSelected={editingQuestionIndex === idx}
                      onOpenEditModal={() => setEditingQuestionIndex(idx)}
                      onRemove={() => handleRemoveQuestion(q.id)}
                      onDuplicate={() => handleDuplicateQuestion(q)}
                      onTogglePageBreak={() => handleTogglePageBreak(idx)}
                      hasPageBreak={Boolean(settings.manualPageBreaks?.includes(idx))}
                      docType={docType}
                      theme={theme}
                    />

                    {/* Page Break Indicator in Sidebar */}
                    {settings.manualPageBreaks?.includes(idx) && (
                      <div
                        className={`flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-dashed ${
                          theme === 'dark'
                            ? 'bg-[#1f2636] text-sky-300 border-sky-800/80'
                            : 'bg-sky-50 text-sky-900 border-sky-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <SplitSquareVertical className="h-3 w-3 text-sky-700 dark:text-sky-400" />
                          <span>Sayfa Sonu ({settings.paperFormat || 'A4'} Yeni Sayfa)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePageBreak(idx)}
                          className={`text-[9px] underline font-semibold cursor-pointer ${
                            theme === 'dark'
                              ? 'text-sky-400 hover:text-sky-200'
                              : 'text-sky-700 hover:text-sky-950'
                          }`}
                        >
                          Kaldır
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>

            {/* Question Creation Actions in sidebar */}
            <div
              className={`border-t p-3 space-y-2 transition-colors ${
                theme === 'dark' ? 'border-[#2c303c] bg-[#242732]' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab('crop')}
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-[#383f4f] bg-[#242833] hover:bg-[#2c313f] text-[#d6dae4] hover:text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                }`}
                title="PDF veya görselden soru kırp ve daksille"
              >
                <Scissors className={`h-4 w-4 ${theme === 'dark' ? 'text-sky-400' : 'text-sky-600'}`} />
                <span>PDF&apos;den Soru Kırp &amp; Ekle</span>
              </button>

              {/* BİRİNCİL AKSİYON: Her temada tutarlı, belirgin gök mavisi buton */}
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Yeni Soru veya Konu/Not Bloğu Ekle</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectAddFormat('text_only', 'multiple_choice')}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-colors shadow-2xs text-center cursor-pointer ${
                    theme === 'dark'
                      ? 'border-[#383f4f] bg-[#2a2f3c] hover:bg-[#333948] text-[#d6dae4]'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                  title="Hızlı Çoktan Seçmeli Test Sorusu Ekle"
                >
                  + Test Sorusu
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAddFormat('lecture_block')}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-colors shadow-2xs text-center cursor-pointer ${
                    theme === 'dark'
                      ? 'border-[#383f4f] bg-[#2a2f3c] hover:bg-[#333948] text-[#d6dae4]'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                  title="Konu Özeti, Formül veya Not Bloğu Ekle"
                >
                  + Konu / Not Bloğu
                </button>
              </div>
            </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Center: The True Responsive A4 Vector Printing Canvas */}
          <DocumentPreview
            docType={docType}
            settings={settings}
            brand={brand}
            questions={displayedQuestions}
            onReorderQuestion={handleReorderQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onUpdateQuestionPoints={handleUpdatePoints}
            onUpdateQuestionText={handleUpdateQuestionText}
            onDuplicateQuestion={handleDuplicateQuestion}
            onQuickAddQuestion={handleQuickAddQuestion}
            onTogglePageBreak={handleTogglePageBreak}
            onOpenSmartBoard={() => setIsSmartBoardOpen(true)}
            onEditQuestionModal={setEditingQuestionIndex}
            theme={theme}
          />

          {/* Right Drawer: Document Settings */}
          <DocumentSettingsDrawer
            isOpen={isSettingsDrawerOpen}
            onClose={() => setIsSettingsDrawerOpen(false)}
            settings={settings}
            onSettingsChange={setSettings}
            brand={brand}
            onBrandChange={setBrand}
            docType={docType}
            onDocTypeChange={handleDocTypeChange}
            questions={questions}
            availableBooklets={availableBooklets}
            onAddBooklet={handleAddBooklet}
            onRemoveBooklet={handleRemoveBooklet}
            onReshuffleBooklet={handleReshuffleBooklet}
            onOpenBookletMatrix={() => setIsBookletMatrixOpen(true)}
            onGenerateBookletB={handleGenerateBookletB}
            onAutoBalancePoints={handleAutoBalancePoints}
            theme={theme}
          />
        </div>
      </div>
    </>
  )}

      {/* 3. Full-featured Modular Overlays with Smooth Wall-Docked Transitions */}
      {/* Soru Havuzu Modal */}
      <AnimatePresence>
        {activeTab === 'pool' && (
          <QuestionPoolDrawer
            key="question-pool-drawer"
            poolQuestions={poolQuestions}
            documentQuestions={questions}
            onAddQuestionToDoc={handleAddQuestionToDoc}
            onAddMultipleToDoc={handleAddMultipleToDoc}
            onAddNewToPool={handleAddNewToPool}
            onOpenCropModal={() => setActiveTab('crop')}
            onClose={() => setActiveTab(previousTab || 'editor')}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* PDF Kırpıcı Modal */}
      <AnimatePresence>
        {activeTab === 'crop' && (
          <CropToolModal
            key="crop-tool-modal"
            existingQuestions={questions}
            onAddQuestion={(q) => {
              handleAddNewToPool(q);
              handleAddQuestionToDoc(q);
            }}
            onAddAndEdit={(q) => {
              handleAddNewToPool(q);
              setQuestions((prev) => {
                const next = [...prev, q];
                setEditingQuestionIndex(next.length - 1);
                return next;
              });
              setActiveTab('editor');
            }}
            onRemoveQuestion={(id) => {
              handleRemoveQuestion(id);
            }}
            onClose={() => setActiveTab(previousTab || 'editor')}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Slayt Modu / Akıllı Tahta Tam Ekran */}
      {isSmartBoardOpen && (
        <SmartBoardModal
          questions={displayedQuestions}
          brand={brand}
          docTitle={settings.title}
          onClose={() => setIsSmartBoardOpen(false)}
        />
      )}

      {/* Çoklu Kitapçık Karşılaştırmalı Cevap Anahtarları (Matris) Modalı */}
      <AnimatePresence>
        {isBookletMatrixOpen && (
          <BookletMatrixModal
            key="booklet-matrix-modal"
            isOpen={isBookletMatrixOpen}
            onClose={() => setIsBookletMatrixOpen(false)}
            matrixRows={getBookletMatrix(questions, availableBooklets, bookletSeeds)}
            bookletCodes={availableBooklets}
            docTitle={settings.title}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Doğrudan Yüksek Çözünürlüklü PDF Dışa Aktarma İlerleme Modalı */}
      <AnimatePresence>
        {isPdfExportModalOpen && (
          <PdfExportModal
            key="pdf-export-modal"
            isOpen={isPdfExportModalOpen}
            progress={pdfProgress}
            isCompleted={isPdfCompleted}
            error={pdfExportError}
            onClose={() => setIsPdfExportModalOpen(false)}
            onFallbackPrint={() => window.print()}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Yeni Soru & İçerik Ekleme Masası (Soru Sunum Formatı Seçici) */}
      <AnimatePresence>
        {isAddQuestionModalOpen && (
          <AddQuestionModal
            key="add-question-modal"
            isOpen={isAddQuestionModalOpen}
            onClose={() => setIsAddQuestionModalOpen(false)}
            onSelectFormat={handleSelectAddFormat}
            onOpenCropTool={() => {
              setIsAddQuestionModalOpen(false);
              setActiveTab('crop');
            }}
            theme={theme}
            docType={docType}
          />
        )}
      </AnimatePresence>

      {/* Soru Düzenleme Ek Ekran Penceresi (Slide-over Sheet) */}
      <AnimatePresence>
        {editingQuestionIndex !== null && questions[editingQuestionIndex] && (
          <QuestionEditorModal
            key="question-editor-sheet"
            question={questions[editingQuestionIndex]}
            index={editingQuestionIndex}
            questionNumber={questionNumberMap[editingQuestionIndex]}
            totalQuestions={questions.length}
            docType={docType}
            brand={brand}
            onSave={(updatedQ) => {
              setQuestions((prev) =>
                prev.map((q, i) => (i === editingQuestionIndex ? updatedQ : q))
              );
            }}
            onRemove={(id) => {
              handleRemoveQuestion(id);
              setEditingQuestionIndex(null);
            }}
            onClose={() => setEditingQuestionIndex(null)}
            onNavigate={(newIdx) => setEditingQuestionIndex(newIdx)}
            onOpenCropTool={() => {
              setEditingQuestionIndex(null);
              setActiveTab('crop');
            }}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
