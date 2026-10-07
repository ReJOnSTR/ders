'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestionItem } from '@/types/studio';
import { MEB_OUTCOMES } from '@/data/mebOutcomes';
import {
  Scissors,
  Check,
  Upload,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
  FileText,
  RefreshCw,
  X,
  Layers,
  Trash2,
  Plus,
  Eraser,
  ArrowRight,
  BookOpen,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  HardDrive,
} from 'lucide-react';

import {
  savePdfToStorage,
  loadAllPdfs,
  removeStoredPdf,
  updatePdfLastPage,
  setLastActivePdfId,
  clearAllStoredPdfs,
} from '@/lib/pdfStorage';

interface LoadedPdfItem {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any;
  numPages: number;
  lastPage?: number;
}

interface CropToolModalProps {
  existingQuestions?: QuestionItem[];
  onAddQuestion: (q: QuestionItem) => void;
  onAddAndEdit?: (q: QuestionItem) => void;
  onRemoveQuestion?: (id: string) => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

// Helper: scans pixel matrix to find the exact ink bounding box (ignoring paper background and noise)
function detectInkBounds(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  scanW: number,
  scanH: number
): { minX: number; minY: number; maxX: number; maxY: number; hasContent: boolean } {
  if (scanW < 15 || scanH < 15) {
    return { minX: 0, minY: 0, maxX: scanW, maxY: scanH, hasContent: false };
  }

  const imgData = ctx.getImageData(startX, startY, scanW, scanH);
  const d = imgData.data;

  // Compute paper background reference from border corners
  let bgR = 255;
  let bgG = 255;
  let bgB = 255;
  let bgCount = 0;
  let rSum = 0,
    gSum = 0,
    bSum = 0;

  const sampleIndices = [
    0,
    1,
    2,
    scanW - 3,
    scanW - 2,
    scanW - 1,
    (scanH - 1) * scanW,
    (scanH - 1) * scanW + 1,
    scanH * scanW - 2,
    scanH * scanW - 1,
  ];
  for (const idx of sampleIndices) {
    if (idx >= 0 && idx * 4 + 3 < d.length && d[idx * 4 + 3] > 30) {
      rSum += d[idx * 4];
      gSum += d[idx * 4 + 1];
      bSum += d[idx * 4 + 2];
      bgCount++;
    }
  }
  if (bgCount > 0) {
    bgR = Math.round(rSum / bgCount);
    bgG = Math.round(gSum / bgCount);
    bgB = Math.round(bSum / bgCount);
  }

  const rowInk = new Uint16Array(scanH);
  const colInk = new Uint16Array(scanW);

  for (let y = 0; y < scanH; y++) {
    const rowOffset = y * scanW * 4;
    for (let x = 0; x < scanW; x++) {
      const i = rowOffset + x * 4;
      const a = d[i + 3];
      if (a < 30) continue; // transparent pixel
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      const diffFromBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      // An ink pixel has distinct darkness or color difference from background paper
      if (diffFromBg > 28 || (luminance < 232 && (r < 238 || g < 238 || b < 238))) {
        rowInk[y]++;
        colInk[x]++;
      }
    }
  }

  const minInkPerRow = Math.max(2, Math.floor(scanW * 0.003));
  const minInkPerCol = Math.max(2, Math.floor(scanH * 0.003));

  let minY = -1;
  let maxY = -1;
  for (let y = 0; y < scanH; y++) {
    if (rowInk[y] >= minInkPerRow) {
      if (minY === -1) minY = y;
      maxY = y;
    }
  }

  let minX = -1;
  let maxX = -1;
  for (let x = 0; x < scanW; x++) {
    if (colInk[x] >= minInkPerCol) {
      if (minX === -1) minX = x;
      maxX = x;
    }
  }

  const hasContent = minY !== -1 && minX !== -1 && maxX > minX && maxY > minY;

  return {
    minX: hasContent ? minX : 0,
    minY: hasContent ? minY : 0,
    maxX: hasContent ? maxX : scanW,
    maxY: hasContent ? maxY : scanH,
    hasContent,
  };
}

// Auto-trim helper: scans pixels to find actual content bounding box and removes surrounding extra whitespace
function autoTrimCanvas(sourceCanvas: HTMLCanvasElement, padding = 8): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  if (width < 20 || height < 20) return sourceCanvas;

  const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  try {
    const bounds = detectInkBounds(ctx, 0, 0, width, height);
    if (!bounds.hasContent) return sourceCanvas;

    const cropX = Math.max(0, bounds.minX - padding);
    const cropY = Math.max(0, bounds.minY - padding);
    const cropW = Math.min(width - cropX, bounds.maxX - bounds.minX + padding * 2);
    const cropH = Math.min(height - cropY, bounds.maxY - bounds.minY + padding * 2);

    if (cropW < 20 || cropH < 20 || (cropW >= width - 2 && cropH >= height - 2)) {
      return sourceCanvas;
    }

    const trimmed = document.createElement('canvas');
    trimmed.width = cropW;
    trimmed.height = cropH;
    const tCtx = trimmed.getContext('2d');
    if (!tCtx) return sourceCanvas;

    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, cropW, cropH);
    tCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    return trimmed;
  } catch {
    return sourceCanvas;
  }
}

export default function CropToolModal({
  existingQuestions = [],
  onAddQuestion,
  onAddAndEdit,
  onRemoveQuestion,
  onClose,
  theme = 'light',
}: CropToolModalProps) {
  const isDark = theme === 'dark';

  // Active modal view: 'crop' (Kırpma Masası) or 'list' (Eklenen Sorular)
  const [activeView, setActiveView] = useState<'crop' | 'list'>('crop');

  // Left Sidebar state (Açılır Kapanır PDF Menüsü)
  const [isPdfSidebarOpen, setIsPdfSidebarOpen] = useState<boolean>(true);
  const [pageJumpInput, setPageJumpInput] = useState<string>('1');

  // Multiple PDFs state
  const [pdfList, setPdfList] = useState<LoadedPdfItem[]>([]);
  const [activePdfId, setActivePdfId] = useState<string | null>(null);

  // Active PDF document state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfScale] = useState<number>(2.5);

  // Fallback image source if not a PDF
  const [imageSrc, setImageSrc] = useState<string>('');

  // In-session added questions tracker
  const [sessionAddedQuestions, setSessionAddedQuestions] = useState<QuestionItem[]>([]);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Auto-restore PDFs from persistent storage (IndexedDB) and in-memory cache
  useEffect(() => {
    let isMounted = true;
    const initCachedPdfs = async () => {
      setIsLoadingPdf(true);
      try {
        const { items, activeId } = await loadAllPdfs();
        if (!isMounted) return;
        if (items.length > 0) {
          setPdfList(items);
          const activeItem = items.find((p) => p.id === activeId) || items[0];
          setActivePdfId(activeItem.id);
          setPdfDoc(activeItem.doc);
          setPdfFileName(activeItem.name);
          setNumPages(activeItem.numPages);
          const lastP = activeItem.lastPage || 1;
          setCurrentPage(lastP);
          setPageJumpInput(String(lastP));
          setSuccessNotification(`Kayıtlı "${activeItem.name}" ve kalınan sayfa (${lastP}. sayfa) hafızadan yüklendi.`);
          setTimeout(() => setSuccessNotification(null), 3500);
        }
      } catch (err) {
        console.warn('PDF auto-restore error:', err);
      } finally {
        if (isMounted) setIsLoadingPdf(false);
      }
    };

    initCachedPdfs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync current page to persistent storage whenever page or active PDF changes
  useEffect(() => {
    if (activePdfId && currentPage) {
      updatePdfLastPage(activePdfId, currentPage);
    }
  }, [activePdfId, currentPage]);

  // Question metadata
  const [course, setCourse] = useState<string>('Matematik');
  const [grade, setGrade] = useState<string>('9. Sınıf');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('MAT.9.2.1');
  const [correctAnswer, setCorrectAnswer] = useState<string>('B');
  const [points, setPoints] = useState<number>(10);

  // Question Format & Options Mode (Soru Sunum Formatı)
  const [questionMode, setQuestionMode] = useState<'image_only_copyable' | 'image_only_in_image' | 'standard'>('image_only_copyable');

  // Sizing & Alignment
  const [cropImageNaturalSize, setCropImageNaturalSize] = useState<boolean>(true);
  const [cropImageWidthPercent, setCropImageWidthPercent] = useState<number>(100);
  const [cropImageAlignment, setCropImageAlignment] = useState<'left' | 'center' | 'right'>('left');

  // Quality & Straightening Filters
  const [cleanBackground, setCleanBackground] = useState<boolean>(true);
  const [autoTrimWhitespace, setAutoTrimWhitespace] = useState<boolean>(true);
  const [whiteThreshold] = useState<number>(236);
  const [boostContrast, setBoostContrast] = useState<boolean>(true);
  const [deskewAngle, setDeskewAngle] = useState<number>(0);
  const [rotation90, setRotation90] = useState<number>(0);

  // Optional Daksil (Tippex) tool
  const [isTippexActive, setIsTippexActive] = useState<boolean>(false);
  const [tippexSize] = useState<number>(18);

  // Crop & Selection state
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const startCoord = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [canvasDim, setCanvasDim] = useState<{ width: number; height: number }>({ width: 1200, height: 1650 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tippexCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawCropCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Combined list of questions
  const allQuestionsList = useMemo(() => {
    const map = new Map<string, QuestionItem>();
    existingQuestions.forEach((q) => map.set(q.id, q));
    sessionAddedQuestions.forEach((q) => map.set(q.id, q));
    return Array.from(map.values());
  }, [existingQuestions, sessionAddedQuestions]);

  // Jump to specific page
  const handleJumpToPage = useCallback(
    (targetPage: number) => {
      const maxPages = numPages || 1;
      const clamped = Math.max(1, Math.min(maxPages, targetPage));
      setCurrentPage(clamped);
      setPageJumpInput(String(clamped));
      setSelection(null);
      setCroppedDataUrl(null);
    },
    [numPages]
  );

  // Sync jump input with current page
  useEffect(() => {
    setPageJumpInput(String(currentPage));
  }, [currentPage]);

  // Handle page jump form submit
  const handlePageJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(pageJumpInput.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= (numPages || 1)) {
      handleJumpToPage(num);
    } else {
      setPageJumpInput(String(currentPage));
    }
  };

  // Render a specific PDF page
  const renderPdfPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      setIsLoadingPdf(true);
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: pdfScale });

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setCanvasDim({ width: viewport.width, height: viewport.height });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        setIsLoadingPdf(false);
      } catch (err) {
        console.error('PDF render error:', err);
        setIsLoadingPdf(false);
      }
    },
    [pdfDoc, pdfScale]
  );

  useEffect(() => {
    if (!pdfDoc) return;
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled && canvasRef.current) {
        renderPdfPage(currentPage);
      }
    }, 40);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [pdfDoc, currentPage, renderPdfPage]);

  // Render sample or image fallback
  useEffect(() => {
    if (pdfDoc || !imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setCanvasDim({ width: img.width, height: img.height });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    };
  }, [pdfDoc, imageSrc]);

  // Process raw crop canvas
  const processCropImage = useCallback(
    (sourceCanvas: HTMLCanvasElement): string => {
      const outCanvas = document.createElement('canvas');
      const origW = sourceCanvas.width;
      const origH = sourceCanvas.height;

      const totalAngle = deskewAngle + rotation90;
      const rad = (totalAngle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));

      const targetW = Math.round(origW * cos + origH * sin);
      const targetH = Math.round(origW * sin + origH * cos);

      outCanvas.width = targetW;
      outCanvas.height = targetH;
      const ctx = outCanvas.getContext('2d');
      if (!ctx) return '';

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);

      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate(rad);
      ctx.drawImage(sourceCanvas, -origW / 2, -origH / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      if (cleanBackground || boostContrast) {
        try {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const d = imgData.data;
          const thresh = whiteThreshold;

          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

            if (cleanBackground && r >= thresh && g >= thresh && b >= thresh) {
              d[i] = 255;
              d[i + 1] = 255;
              d[i + 2] = 255;
            } else if (boostContrast && brightness < 170) {
              d[i] = Math.max(0, r - 30);
              d[i + 1] = Math.max(0, g - 30);
              d[i + 2] = Math.max(0, b - 30);
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // fallback if tainted
        }
      }

      // Auto-trim extra whitespace margins around the question content
      const finalCanvas = autoTrimWhitespace ? autoTrimCanvas(outCanvas, 10) : outCanvas;

      return finalCanvas.toDataURL('image/png');
    },
    [deskewAngle, rotation90, cleanBackground, whiteThreshold, boostContrast, autoTrimWhitespace]
  );

  const doCropPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selection || selection.w < 20 || selection.h < 20) return;

    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = selection.w;
    rawCanvas.height = selection.h;
    const ctx = rawCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      canvas,
      selection.x,
      selection.y,
      selection.w,
      selection.h,
      0,
      0,
      selection.w,
      selection.h
    );

    rawCropCanvasRef.current = rawCanvas;
    const processedUrl = processCropImage(rawCanvas);
    setCroppedDataUrl(processedUrl);
  }, [selection, processCropImage]);

  useEffect(() => {
    if (rawCropCanvasRef.current) {
      const processedUrl = processCropImage(rawCropCanvasRef.current);
      setCroppedDataUrl(processedUrl);
    }
  }, [processCropImage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      doCropPreview();
    }, 200);
    return () => clearTimeout(timer);
  }, [doCropPreview]);

  // Multiple PDF upload with persistent storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoadingPdf(true);
    try {
      const pdfjs = await import('pdfjs-dist');
      if (typeof window !== 'undefined') {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }

      const newPdfItems: LoadedPdfItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const rawBuffer = await file.arrayBuffer();
          // Safe clone: one for PDF.js web worker, one for IndexedDB persistence
          const storageBuffer = rawBuffer.slice(0);
          const workerBuffer = rawBuffer.slice(0);

          const loadingTask = pdfjs.getDocument({ data: new Uint8Array(workerBuffer) });
          const loadedPdf = await loadingTask.promise;
          const pdfItem: LoadedPdfItem = {
            id: `pdf-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            doc: loadedPdf,
            numPages: loadedPdf.numPages,
            lastPage: 1,
          };
          newPdfItems.push(pdfItem);

          // Save to IndexedDB & in-memory cache
          await savePdfToStorage({
            id: pdfItem.id,
            name: pdfItem.name,
            data: storageBuffer,
            doc: loadedPdf,
            numPages: loadedPdf.numPages,
            lastPage: 1,
          });
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              setPdfDoc(null);
              setPdfFileName(file.name);
              setNumPages(0);
              setImageSrc(ev.target.result as string);
              setSelection(null);
              setCroppedDataUrl(null);
              setDeskewAngle(0);
              setRotation90(0);
            }
          };
          reader.readAsDataURL(file);
        }
      }

      if (newPdfItems.length > 0) {
        setPdfList((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filteredNew = newPdfItems.filter((p) => !existingIds.has(p.id));
          return [...prev, ...filteredNew];
        });
        const first = newPdfItems[0];
        setActivePdfId(first.id);
        setLastActivePdfId(first.id);
        setPdfDoc(first.doc);
        setPdfFileName(first.name);
        setNumPages(first.numPages);
        setCurrentPage(1);
        setPageJumpInput('1');
        setSelection(null);
        setCroppedDataUrl(null);
        setDeskewAngle(0);
        setRotation90(0);
        setSuccessNotification(`"${first.name}" yüklendi ve tarayıcı hafızasına güvenle kaydedildi.`);
        setTimeout(() => setSuccessNotification(null), 3500);
      }
    } catch (err) {
      console.error('PDF yükleme hatası:', err);
      alert('PDF dosyası açılırken bir hata oluştu.');
    } finally {
      setIsLoadingPdf(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSwitchPdf = (item: LoadedPdfItem) => {
    setActivePdfId(item.id);
    setLastActivePdfId(item.id);
    setPdfDoc(item.doc);
    setPdfFileName(item.name);
    setNumPages(item.numPages);
    const targetPage = item.lastPage || 1;
    setCurrentPage(targetPage);
    setPageJumpInput(String(targetPage));
    setSelection(null);
    setCroppedDataUrl(null);
    setDeskewAngle(0);
    setRotation90(0);
  };

  const handleRemovePdf = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeStoredPdf(id);
    setPdfList((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (activePdfId === id) {
        if (filtered.length > 0) {
          const next = filtered[0];
          setActivePdfId(next.id);
          setLastActivePdfId(next.id);
          setPdfDoc(next.doc);
          setPdfFileName(next.name);
          setNumPages(next.numPages);
          const targetPage = next.lastPage || 1;
          setCurrentPage(targetPage);
          setPageJumpInput(String(targetPage));
        } else {
          setActivePdfId(null);
          setLastActivePdfId(null);
          setPdfDoc(null);
          setPdfFileName('');
          setNumPages(0);
          setImageSrc('');
        }
        setSelection(null);
        setCroppedDataUrl(null);
      }
      return filtered;
    });
  };

  const handleClearAllPdfs = async () => {
    if (!window.confirm('Kayıtlı tüm PDF föylerini tarayıcı hafızasından silmek istediğinize emin misiniz?')) {
      return;
    }
    await clearAllStoredPdfs();
    setPdfList([]);
    setActivePdfId(null);
    setLastActivePdfId(null);
    setPdfDoc(null);
    setPdfFileName('');
    setNumPages(0);
    setImageSrc('');
    setSelection(null);
    setCroppedDataUrl(null);
  };

  // Keyboard shortcut listener for A-E keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key) && !(e.target instanceof HTMLInputElement)) {
        setCorrectAnswer(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Direct canvas drag-to-crop
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    startCoord.current = { x, y };
    setIsSelecting(true);
    setSelection({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    const x = Math.min(startCoord.current.x, currentX);
    const y = Math.min(startCoord.current.y, currentY);
    const w = Math.abs(currentX - startCoord.current.x);
    const h = Math.abs(currentY - startCoord.current.y);

    setSelection({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const canvas = canvasRef.current;
    if (!canvas || !selection || selection.w < 20 || selection.h < 20) {
      doCropPreview();
      return;
    }

    // Auto-detect and snap selection box by removing unwritten white margins
    try {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const startX = Math.max(0, Math.floor(selection.x));
        const startY = Math.max(0, Math.floor(selection.y));
        const scanW = Math.min(canvas.width - startX, Math.ceil(selection.w));
        const scanH = Math.min(canvas.height - startY, Math.ceil(selection.h));

        if (scanW >= 20 && scanH >= 20) {
          const bounds = detectInkBounds(ctx, startX, startY, scanW, scanH);

          if (bounds.hasContent) {
            const pad = 8;
            const contentX = Math.max(0, startX + bounds.minX - pad);
            const contentY = Math.max(0, startY + bounds.minY - pad);
            const contentW = Math.min(canvas.width - contentX, bounds.maxX - bounds.minX + pad * 2);
            const contentH = Math.min(canvas.height - contentY, bounds.maxY - bounds.minY + pad * 2);

            if (contentW >= 20 && contentH >= 20) {
              const snapped = { x: contentX, y: contentY, w: contentW, h: contentH };
              setSelection(snapped);

              const rawCanvas = document.createElement('canvas');
              rawCanvas.width = contentW;
              rawCanvas.height = contentH;
              const rawCtx = rawCanvas.getContext('2d');
              if (rawCtx) {
                rawCtx.drawImage(
                  canvas,
                  contentX,
                  contentY,
                  contentW,
                  contentH,
                  0,
                  0,
                  contentW,
                  contentH
                );
                rawCropCanvasRef.current = rawCanvas;
                const processed = processCropImage(rawCanvas);
                setCroppedDataUrl(processed);
              }
              return;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Auto-snap selection fallback:', err);
    }

    doCropPreview();
  };

  // Tippex on preview
  const isTippexing = useRef(false);
  const handleTippexDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isTippexActive) return;
    isTippexing.current = true;
    paintTippex(e);
  };

  const handleTippexMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isTippexing.current || !isTippexActive) return;
    paintTippex(e);
  };

  const handleTippexUp = () => {
    isTippexing.current = false;
    if (tippexCanvasRef.current) {
      setCroppedDataUrl(tippexCanvasRef.current.toDataURL('image/png'));
    }
  };

  const paintTippex = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = tippexCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, tippexSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    if (!croppedDataUrl) return;
    const canvas = tippexCanvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.src = croppedDataUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    };
  }, [croppedDataUrl]);

  // Build question item
  const buildQuestionItemWithUrl = (dataUrl: string): QuestionItem => {
    const matchedOutcome = MEB_OUTCOMES.find((o) => o.code === selectedOutcome);
    const isImageOnly = questionMode !== 'standard';
    const optionsInImage = questionMode === 'image_only_in_image';

    return {
      id: 'crop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: 'multiple_choice',
      courseName: course,
      gradeLevel: grade,
      difficulty: 'Orta',
      points: points || 10,
      mebOutcomeCode: matchedOutcome?.code || selectedOutcome,
      mebOutcomeText: matchedOutcome?.description || 'Özel Kırpılmış Soru',
      text: questionMode === 'standard' ? 'Görseldeki soruyu inceleyerek doğru cevabı işaretleyiniz.' : '',
      options: optionsInImage ? ['A', 'B', 'C', 'D', 'E'] : ['A) ', 'B) ', 'C) ', 'D) ', 'E) '],
      correctAnswer: correctAnswer,
      imageUrl: dataUrl,
      presentationFormat: isImageOnly ? 'image_only' : 'image_hybrid',
      isImageOnly: isImageOnly,
      optionsInImage: optionsInImage,
      imageNaturalSize: cropImageNaturalSize,
      imageWidthPercent: cropImageWidthPercent,
      imageBorder: false,
      imageAlignment: cropImageAlignment,
    };
  };

  // 1-Click Fast Confirm Handler
  const handleQuickConfirmCrop = () => {
    let finalUrl = croppedDataUrl;
    if (!finalUrl && canvasRef.current && selection && selection.w >= 20 && selection.h >= 20) {
      const rawCanvas = document.createElement('canvas');
      rawCanvas.width = selection.w;
      rawCanvas.height = selection.h;
      const ctx = rawCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvasRef.current,
          selection.x,
          selection.y,
          selection.w,
          selection.h,
          0,
          0,
          selection.w,
          selection.h
        );
        rawCropCanvasRef.current = rawCanvas;
        finalUrl = processCropImage(rawCanvas);
        setCroppedDataUrl(finalUrl);
      }
    }

    if (!finalUrl) {
      return;
    }

    const q = buildQuestionItemWithUrl(finalUrl);
    onAddQuestion(q);
    setSessionAddedQuestions((prev) => [q, ...prev]);

    setSuccessNotification(`✓ Soru listeye eklendi! (Toplam: ${allQuestionsList.length + 1} soru)`);
    setTimeout(() => {
      setSuccessNotification(null);
    }, 2800);

    setSelection(null);
    setCroppedDataUrl(null);
  };

  const handleAddAndEditQuestion = () => {
    if (!croppedDataUrl) return;
    const q = buildQuestionItemWithUrl(croppedDataUrl);
    if (onAddAndEdit) {
      onAddAndEdit(q);
    } else {
      onAddQuestion(q);
      onClose();
    }
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

      {/* 2. Sağ Duvara Bağlı Çekmece Penceresi */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[860px] md:w-[1000px] lg:w-[1160px] xl:w-[1300px] max-w-[98vw] h-full h-screen border-l shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#1a1c23] border-[#2c303c] text-[#f0f2f5]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* ================= MODAL TOP HEADER (Compact h-12) ================= */}
        <div
          className={`h-12 shrink-0 border-b px-3 sm:px-4 flex items-center justify-between z-10 transition-colors ${
            isDark ? 'border-[#2c303c] bg-[#20232c]' : 'border-slate-200 bg-white'
          }`}
        >
          {/* Left: Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white font-bold text-xs shrink-0 shadow-2xs">
                <Scissors className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className={`text-xs sm:text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  PDF Soru Kırpma Motoru
                </h3>
                <span className="text-[11px] text-slate-400 hidden lg:inline">· 300 DPI Saf Baskı</span>
              </div>
            </div>
          </div>

          {/* Right: View Switcher + Upload + Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Switcher: Segmented Control */}
            <div className={`flex items-center p-0.5 rounded-lg border ${
              isDark ? 'bg-[#181a20] border-[#363c4c]' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setActiveView('crop')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'crop'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scissors className="h-3 w-3" />
                <span>Kırpma Masası</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'list'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3 w-3" />
                <span>Eklenenler</span>
                <span className="px-1 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-white">
                  {allQuestionsList.length}
                </span>
              </button>
            </div>

            {/* Hidden File Input (triggered from left sidebar upload buttons) */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={onClose}
              className={`h-7.5 w-7.5 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:bg-[#2c313f] hover:text-white'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Global Toast Success Banner */}
        <AnimatePresence>
          {successNotification && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-600 text-white text-[11px] font-bold px-4 py-1.5 flex items-center justify-between shadow-2xs z-20"
            >
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>{successNotification}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="underline hover:text-emerald-100 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <span>Listeyi Gör</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= VIEW 1: KIRPMA MASASI (3 KOLON: SOL PDF MENÜ + ORTA TUVAL + SAĞ AYARLAR) ================= */}
        {activeView === 'crop' && (
          <div className="flex flex-1 overflow-hidden">
            {/* ================= 1. SOL DUVAR: Yüklü PDF Kitapçıkları & Sayfa Gezgini ================= */}
            <div
              className={`border-r shrink-0 flex flex-col transition-all duration-200 select-none overflow-hidden ${
                isPdfSidebarOpen ? 'w-68 sm:w-76' : 'w-11'
              } ${isDark ? 'border-[#2d323f] bg-[#161820]' : 'border-slate-200 bg-slate-50/80'}`}
            >
              {isPdfSidebarOpen ? (
                <>
                  {/* Sol Menü Başlığı & Kapatma Butonu */}
                  <div
                    className={`h-10 px-3 border-b flex items-center justify-between shrink-0 ${
                      isDark ? 'border-[#2d323f] bg-[#1d202a]' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="h-4 w-4 text-sky-500 shrink-0" />
                      <span className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Yüklü PDF&apos;ler
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
                        isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {pdfList.length}
                      </span>
                      {pdfList.length > 0 && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-500 dark:text-emerald-400 ml-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Kalıcı
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPdfSidebarOpen(false)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="PDF Menüsünü Daralt"
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </button>
                  </div>

                  {/* + Yeni PDF Ekle Butonu / Upload Card */}
                  <div className={`p-2.5 border-b shrink-0 ${isDark ? 'border-[#2d323f] bg-[#191b24]' : 'border-slate-200 bg-slate-50'}`}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-2 px-3 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isDark
                          ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400'
                          : 'border-sky-400 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-500'
                      }`}
                      title="Bilgisayarınızdan bir veya birden fazla PDF dosyası seçin"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Yeni PDF / Föy Ekle</span>
                    </button>
                  </div>

                  {/* PDF Dosyaları Listesi (Esnek ve Kaydırılabilir) */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                    {pdfList.length === 0 ? (
                      /* Eğer henüz kullanıcı PDF yüklemediyse: Temiz Bilgilendirme (Butonsuz) */
                      <div
                        className={`rounded-xl border border-dashed p-4 text-center space-y-1.5 ${
                          isDark
                            ? 'border-[#2d3342] bg-[#171922] text-slate-400'
                            : 'border-slate-300 bg-white text-slate-500'
                        }`}
                      >
                        <FileText className="h-6 w-6 mx-auto mb-1 text-slate-400 stroke-[1.5]" />
                        <h4 className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          Henüz PDF Eklenmedi
                        </h4>
                        <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Yüklediğiniz PDF föyleri tarayıcınızın kalıcı hafızasında saklanır; sayfayı yenileseniz veya sekmeler arasında geçiş yapsanız da kaybolmaz.
                        </p>
                      </div>
                    ) : (
                      pdfList.map((item, idx) => {
                        const isActive = activePdfId === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSwitchPdf(item)}
                            className={`rounded-xl border p-2.5 transition-all cursor-pointer ${
                              isActive
                                ? isDark
                                  ? 'bg-sky-950/40 border-sky-500/70 shadow-xs ring-1 ring-sky-500/30'
                                  : 'bg-sky-50/80 border-sky-500 shadow-2xs ring-1 ring-sky-500/20'
                                : isDark
                                ? 'bg-[#1e222d] border-[#2e3444] hover:bg-[#252b3a] hover:border-slate-500'
                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            {/* PDF Kart Başlığı & Bilgisi */}
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isActive
                                    ? 'bg-sky-600 text-white shadow-2xs'
                                    : isDark ? 'bg-slate-800 text-sky-400' : 'bg-slate-100 text-sky-600'
                                }`}>
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4
                                    className={`text-xs font-bold truncate ${
                                      isActive
                                        ? isDark ? 'text-sky-200' : 'text-sky-950 font-black'
                                        : isDark ? 'text-slate-200' : 'text-slate-800'
                                    }`}
                                    title={item.name}
                                  >
                                    {idx + 1}. {item.name}
                                  </h4>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                      {item.numPages} Sayfa
                                    </p>
                                    {item.lastPage && item.lastPage > 1 && (
                                      <span className={`text-[9px] font-mono px-1 rounded ${
                                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        Son: S.{item.lastPage}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isActive && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    ● Aktif
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleRemovePdf(item.id, e)}
                                  className={`p-1 rounded transition-colors ${
                                    isDark
                                      ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  }`}
                                  title="Bu PDF'i Listeden Çıkar"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* EĞER AKTİF PDF İSE: ŞIK VE TEMİZ SAYFA GEÇİŞ ÇUBUĞU */}
                            {isActive && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`mt-2.5 pt-2 border-t space-y-1.5 ${
                                  isDark ? 'border-sky-500/30' : 'border-sky-200'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Sayfa Seç:
                                  </span>
                                  <div className="flex items-center gap-1 font-mono text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => handleJumpToPage(currentPage - 1)}
                                      disabled={currentPage <= 1 || isLoadingPdf}
                                      className={`h-6 w-6 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                                        isDark
                                          ? 'border-[#383f52] bg-[#1a1c24] text-slate-200 hover:bg-[#252a36] disabled:opacity-30'
                                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30'
                                      }`}
                                      title="Önceki Sayfa"
                                    >
                                      <ChevronLeft className="h-3.5 w-3.5" />
                                    </button>

                                    <span className={`px-1.5 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                      {currentPage} / {numPages || 1}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => handleJumpToPage(currentPage + 1)}
                                      disabled={currentPage >= (numPages || 1) || isLoadingPdf}
                                      className={`h-6 w-6 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                                        isDark
                                          ? 'border-[#383f52] bg-[#1a1c24] text-slate-200 hover:bg-[#252a36] disabled:opacity-30'
                                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30'
                                      }`}
                                      title="Sonraki Sayfa"
                                    >
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Hızlı Sayfaya Gitme Formu */}
                                {numPages > 1 && (
                                  <form
                                    onSubmit={handlePageJumpSubmit}
                                    className="flex items-center gap-1 pt-0.5"
                                  >
                                    <span className={`text-[10px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Sayfaya Git:
                                    </span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={numPages || 1}
                                      value={pageJumpInput}
                                      onChange={(e) => setPageJumpInput(e.target.value)}
                                      className={`flex-1 h-6 px-1.5 text-center text-xs font-mono font-bold rounded border ${
                                        isDark
                                          ? 'bg-[#12141a] border-[#383f52] text-white focus:border-sky-500'
                                          : 'bg-white border-slate-300 text-slate-900 focus:border-sky-600'
                                      }`}
                                    />
                                    <button
                                      type="submit"
                                      className="h-6 px-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] cursor-pointer"
                                    >
                                      Git
                                    </button>
                                  </form>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Sol Menü Altı: Hafıza Durumu & Temizleme Butonu */}
                  {pdfList.length > 0 && (
                    <div className={`p-2 px-3 border-t mt-auto shrink-0 flex items-center justify-between text-[11px] ${
                      isDark ? 'border-[#2d323f] bg-[#14161f] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-1.5 min-w-0" title="PDF föyleriniz tarayıcınızın kalıcı hafızasında saklanmaktadır">
                        <HardDrive className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Hafızada Kayıtlı
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearAllPdfs}
                        className="text-rose-500 hover:text-rose-600 hover:underline cursor-pointer shrink-0 text-[10px] font-semibold transition-colors"
                        title="Tüm kayıtlı PDF föylerini tarayıcı hafızasından sil"
                      >
                        Tümünü Temizle
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Daraltılmış Sol Menü (Slim w-11) */
                <div className="flex flex-col items-center py-2.5 gap-2.5 h-full">
                  <button
                    type="button"
                    onClick={() => setIsPdfSidebarOpen(true)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark
                        ? 'text-slate-300 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                    title="PDF Menüsünü Aç"
                  >
                    <PanelLeftOpen className="h-4.5 w-4.5 text-sky-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/10'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                    title="Yeni PDF Ekle"
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <div
                    className={`mt-auto mb-2 px-1 py-1 rounded text-[10px] font-mono font-bold text-center ${
                      isDark ? 'bg-sky-950/60 text-sky-300 border border-sky-800' : 'bg-sky-100 text-sky-800'
                    }`}
                    title={`Aktif Sayfa: ${currentPage} / ${numPages || 1}`}
                  >
                    S.{currentPage}
                  </div>
                </div>
              )}
            </div>

            {/* ================= 2. ORTA KOLON: Canvas & Önizleme Şeridi ================= */}
            <div
              className={`flex flex-1 flex-col border-r overflow-hidden ${
                isDark ? 'border-[#2d323f] bg-[#14161c]' : 'border-slate-200 bg-slate-100/70'
              }`}
            >
              {/* Canvas Toolbar: Aktif PDF Adı + Sayfa Bilgisi (Compact h-8) */}
              <div
                className={`h-8 px-3 flex items-center justify-between border-b text-[11px] shrink-0 ${
                  isDark ? 'border-[#2d323f] bg-[#1a1c24]' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-slate-400 shrink-0">Aktif:</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400 truncate max-w-[200px] sm:max-w-[320px]">
                    {pdfDoc || imageSrc ? pdfFileName : 'Henüz PDF Eklenmedi'}
                  </span>
                  {(pdfDoc || imageSrc) && (
                    <span className={`shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      · Sayfa {currentPage}/{numPages || 1}
                    </span>
                  )}
                </div>

                {pdfDoc || imageSrc ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Kutu çizerek kırpın</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleJumpToPage(currentPage - 1)}
                        disabled={currentPage <= 1 || isLoadingPdf}
                        className={`p-1 rounded transition-colors cursor-pointer disabled:opacity-30 ${
                          isDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-black/5'
                        }`}
                        title="Önceki Sayfa"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <span className={`font-mono text-[10px] font-bold px-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {currentPage} / {numPages || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleJumpToPage(currentPage + 1)}
                        disabled={currentPage >= (numPages || 1) || isLoadingPdf}
                        className={`p-1 rounded transition-colors cursor-pointer disabled:opacity-30 ${
                          isDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-black/5'
                        }`}
                        title="Sonraki Sayfa"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Sol menüden PDF yükleyiniz</span>
                )}
              </div>

              {/* Canvas Area with Clean Floating Confirm/Cancel Buttons OR Clean Empty State */}
              <div className="flex-1 overflow-auto p-3 flex items-center justify-center relative select-none">
                {isLoadingPdf && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/35 backdrop-blur-xs text-white">
                    <RefreshCw className="h-6 w-6 animate-spin text-sky-400 mb-2" />
                    <span className="text-xs font-bold">Sayfa 300 DPI ile İşleniyor...</span>
                  </div>
                )}

                {pdfDoc || imageSrc ? (
                  <div
                    className={`relative inline-block shadow-md border ${
                      isDark ? 'border-[#333846] bg-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      className="max-h-[66vh] max-w-full object-contain cursor-crosshair block"
                    />

                    {/* Drawn Selection Overlay with Connected Minimal Toolbar ("Kutuya Bağlı & Minimal") */}
                    {selection && selection.w > 15 && selection.h > 15 && canvasDim.width > 0 && (
                      <div
                        className="absolute border-[1.5px] border-sky-500 bg-sky-500/10 pointer-events-none select-none transition-all duration-75"
                        style={{
                          left: `${(selection.x / canvasDim.width) * 100}%`,
                          top: `${(selection.y / canvasDim.height) * 100}%`,
                          width: `${(selection.w / canvasDim.width) * 100}%`,
                          height: `${(selection.h / canvasDim.height) * 100}%`,
                        }}
                      >
                        {/* Precision Corner Marks */}
                        <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-sky-600 bg-white" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-sky-600 bg-white" />
                        <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-sky-600 bg-white" />
                        <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-sky-600 bg-white" />

                        {/* Top-Left Dimensions Tab */}
                        <div className="absolute -top-4.5 left-0 bg-sky-700/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-t-xs whitespace-nowrap flex items-center gap-1 shadow-2xs pointer-events-none">
                          <span>{Math.round(selection.w)}×{Math.round(selection.h)}</span>
                          {autoTrimWhitespace && (
                            <span className="text-[8px] text-sky-200 font-sans">Tam Ölçü</span>
                          )}
                        </div>

                        {/* Connected Action Toolbar Welded Directly to the Box Border ("Kutuya Bağlı & Uygun Boyut") */}
                        <div
                          className={`absolute z-30 pointer-events-auto flex items-center gap-1 select-none transition-all shadow-md ${
                            selection.y + selection.h > canvasDim.height - 32
                              ? 'bottom-0.5 right-0.5 bg-slate-900/90 backdrop-blur-xs border border-sky-400/40 rounded-md p-0.5'
                              : 'top-[calc(100%+2px)] right-0 bg-slate-900/90 backdrop-blur-xs border border-sky-400/40 rounded-b-md rounded-tl-md px-1 py-0.5'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickConfirmCrop();
                            }}
                            className="flex items-center gap-1 h-5 px-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded text-[10px] font-bold shadow-2xs cursor-pointer transition-all"
                            title="Bu soruyu onayla ve listeye ekle"
                          >
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                            <span>Onayla</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelection(null);
                              setCroppedDataUrl(null);
                            }}
                            className="flex items-center justify-center h-5 w-5 hover:bg-white/20 text-slate-300 hover:text-white rounded text-[10px] transition-colors cursor-pointer"
                            title="Seçimi İptal Et"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* PDF Ekli Değilse: Temiz Boş Alan (Kâğıt Yok, Buton Yok) */
                  <div className="flex flex-col items-center justify-center p-6 text-center select-none max-w-sm">
                    <div
                      className={`p-4 rounded-2xl mb-3 border ${
                        isDark ? 'bg-[#181a22] border-[#292e3d] text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-2xs'
                      }`}
                    >
                      <FileText className="h-9 w-9 stroke-[1.5]" />
                    </div>
                    <h4 className={`text-xs sm:text-sm font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Kırpılacak PDF Eklenmedi
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Soru kırpma işlemine başlamak için lütfen sol taraftaki menüden bir PDF veya soru föyü ekleyiniz.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Quick Added Questions Dock (Session Strip - Compact h-9) */}
              <div
                className={`h-9 border-t px-3 flex items-center justify-between shrink-0 gap-2 text-[11px] ${
                  isDark ? 'border-[#2c303c] bg-[#1a1c23] text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
                  <span className="font-bold text-slate-400 shrink-0">Eklenenler ({allQuestionsList.length}):</span>

                  {allQuestionsList.length === 0 ? (
                    <span className="text-slate-400 italic truncate">
                      Kutu çizin ve Onayla&apos;ya basın.
                    </span>
                  ) : (
                    allQuestionsList.slice(-6).map((q, idx) => (
                      <div
                        key={q.id}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded border shrink-0 ${
                          isDark ? 'bg-[#20232c] border-[#363c4c]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="font-semibold">{idx + 1}. Soru</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          [{q.correctAnswer || '—'}]
                        </span>
                        {onRemoveQuestion && (
                          <button
                            type="button"
                            onClick={() => onRemoveQuestion(q.id)}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5"
                            title="Listeden Çıkar"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  className="text-sky-600 dark:text-sky-400 font-bold hover:underline shrink-0 cursor-pointer text-[11px]"
                >
                  Tüm Liste ({allQuestionsList.length}) →
                </button>
              </div>
            </div>

            {/* ================= 3. SAĞ KOLON: Minimal Setup Panel (w-80) ================= */}
            <div
              className={`w-80 flex flex-col border-l overflow-y-auto p-3.5 space-y-3 shrink-0 transition-colors ${
                isDark ? 'border-[#2c303c] bg-[#20232c]' : 'border-slate-200 bg-white'
              }`}
            >
              {/* 1. EN ÜST: Soru Sunum Formatı (Minimal Segmented Bar) */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Soru Sunum Formatı
                </span>
                <div className={`grid grid-cols-3 p-0.5 rounded-lg border text-center ${
                  isDark ? 'bg-[#181a20] border-[#363c4c]' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setQuestionMode('image_only_copyable')}
                    className={`py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      questionMode === 'image_only_copyable'
                        ? 'bg-sky-600 text-white shadow-2xs font-bold'
                        : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Görsel ana sorudur, şıklar seçilebilir metindir"
                  >
                    Görsel+Şık
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuestionMode('image_only_in_image')}
                    className={`py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      questionMode === 'image_only_in_image'
                        ? 'bg-sky-600 text-white shadow-2xs font-bold'
                        : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Şıklar resmin içindedir, sadece cevap anahtarı seçilir"
                  >
                    Tam Görsel
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuestionMode('standard')}
                    className={`py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      questionMode === 'standard'
                        ? 'bg-sky-600 text-white shadow-2xs font-bold'
                        : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Soru metni manuel yazılır"
                  >
                    Metinli
                  </button>
                </div>
              </div>

              {/* 2. Önizleme Kutusu (Compact max-h-[140px]) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Önizleme:</span>
                  {rawCropCanvasRef.current && (
                    <button
                      type="button"
                      onClick={doCropPreview}
                      className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer text-[10px]"
                    >
                      Yenile
                    </button>
                  )}
                </div>

                {croppedDataUrl ? (
                  <div className="space-y-1.5">
                    <div
                      className={`relative rounded-xl border p-1.5 flex items-center justify-center max-h-[135px] overflow-hidden ${
                        isDark ? 'border-[#333846] bg-[#14161c]' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <canvas
                        ref={tippexCanvasRef}
                        onMouseDown={handleTippexDown}
                        onMouseMove={handleTippexMove}
                        onMouseUp={handleTippexUp}
                        className={`max-h-[120px] w-full object-contain rounded ${
                          isTippexActive ? 'cursor-cell ring-1 ring-sky-500' : 'cursor-default'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <button
                        type="button"
                        onClick={() => setIsTippexActive((v) => !v)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isTippexActive
                            ? 'bg-sky-600 text-white border-sky-600'
                            : isDark ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Eraser className="h-3 w-3" />
                        <span>{isTippexActive ? 'Silgiyi Kapat' : 'Daksil'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !autoTrimWhitespace;
                          setAutoTrimWhitespace(nextVal);
                          if (rawCropCanvasRef.current) {
                            const trimmed = nextVal ? autoTrimCanvas(rawCropCanvasRef.current, 10) : rawCropCanvasRef.current;
                            setCroppedDataUrl(trimmed.toDataURL('image/png'));
                          }
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer font-bold ${
                          autoTrimWhitespace
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'
                        }`}
                        title="Sorunun yanlarındaki beyaz kenar boşluklarını otomatik kaldırır"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{autoTrimWhitespace ? '✓ Tam Ölçü' : 'Boşluk Kırp'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-xl border border-dashed p-4 text-center text-[11px] ${
                    isDark ? 'border-[#333846] text-slate-500' : 'border-slate-300 text-slate-400'
                  }`}>
                    Sol taraftan bir soru alanı seçiniz.
                  </div>
                )}
              </div>

              {/* 3. Filtreler & Düzeltme */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-[#2c303c] text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                    <span>Otomatik Kenar Kırpma:</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">(Tam Ölçü)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !autoTrimWhitespace;
                      setAutoTrimWhitespace(next);
                      if (rawCropCanvasRef.current) {
                        const trimmed = next ? autoTrimCanvas(rawCropCanvasRef.current, 10) : rawCropCanvasRef.current;
                        setCroppedDataUrl(trimmed.toDataURL('image/png'));
                      }
                    }}
                    className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                      autoTrimWhitespace ? 'bg-emerald-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                    title="Sorunun etrafındaki gereksiz beyaz kenar boşluklarını otomatik tespit edip kırpar"
                  >
                    <span
                      className={`block w-3 h-3 rounded-full bg-white transition-transform absolute top-0.5 ${
                        autoTrimWhitespace ? 'left-3.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Saf Beyaz Arka Plan:</span>
                  <button
                    type="button"
                    onClick={() => setCleanBackground((v) => !v)}
                    className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                      cleanBackground ? 'bg-sky-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-3 h-3 rounded-full bg-white transition-transform absolute top-0.5 ${
                        cleanBackground ? 'left-3.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Döndür:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setRotation90((r) => (r + 90) % 360)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-[10px] cursor-pointer"
                    >
                      <RotateCw className="h-2.5 w-2.5" />
                      <span>90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoostContrast((b) => !b)}
                      className={`px-1.5 py-0.5 rounded border text-[10px] cursor-pointer ${
                        boostContrast
                          ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold'
                          : 'border-slate-300 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      Mürekkep+
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Doğru Şık (A–E) & Puan */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-[#2c303c]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-white">Doğru Cevap:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Puan:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      className={`w-11 h-6 rounded border text-center font-bold text-xs ${
                        isDark ? 'bg-[#181a20] border-[#363c4c] text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {['A', 'B', 'C', 'D', 'E'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCorrectAnswer(opt)}
                      className={`h-7.5 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                        correctAnswer === opt
                          ? 'bg-sky-600 text-white border-sky-600 shadow-2xs font-black'
                          : isDark
                          ? 'bg-[#181a20] text-slate-300 border-[#363c4c] hover:bg-[#252a36]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS: Sleek & Compact */}
              <div className="mt-auto pt-2 border-t border-slate-200 dark:border-[#2c303c] space-y-1.5">
                <button
                  type="button"
                  onClick={handleQuickConfirmCrop}
                  disabled={!croppedDataUrl && (!selection || selection.w < 20 || selection.h < 20)}
                  className={`w-full h-8.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all ${
                    croppedDataUrl || (selection && selection.w >= 20 && selection.h >= 20)
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-98'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>✓ Onayla ve Listeye Ekle</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className={`w-full h-7.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? 'border-[#383f4f] bg-[#242833] text-slate-300 hover:bg-[#2c313f]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: EKLENEN SORULAR LİSTESİ ================= */}
        {activeView === 'list' && (
          <div className={`flex-1 overflow-y-auto p-4 sm:p-5 transition-colors ${
            isDark ? 'bg-[#14161c]' : 'bg-slate-100/60'
          }`}>
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Layers className="h-4 w-4 text-sky-500" />
                    <span>Eklenen Sorular Listesi ({allQuestionsList.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Kırpılan tüm soruları inceleyebilir veya silip yenisini ekleyebilirsiniz.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveView('crop')}
                    className="flex items-center gap-1 h-7.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer transition-all"
                  >
                    <Scissors className="h-3 w-3" />
                    <span>Kırpmaya Devam Et</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1 h-7.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer transition-all"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                    <span>Belgeye Dön ({allQuestionsList.length})</span>
                  </button>
                </div>
              </div>

              {allQuestionsList.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border ${
                  isDark ? 'bg-[#1a1c23] border-[#2c303c]' : 'bg-white border-slate-200'
                }`}>
                  <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-400 mb-1">Henüz Eklenmiş Soru Yok</h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Kırpma Masasına dönüp PDF&apos;deki sorunun etrafına kutu çizin ve &quot;Onayla&quot; butonuna tıklayın.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView('crop')}
                    className="h-7.5 px-3 bg-sky-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Kırpma Masasına Git
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allQuestionsList.map((q, qIndex) => (
                    <div
                      key={q.id || qIndex}
                      className={`rounded-xl border p-3 flex flex-col justify-between shadow-2xs transition-all ${
                        isDark ? 'bg-[#20232c] border-[#2c303c]' : 'bg-white border-slate-200 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className="h-4.5 w-4.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                              {qIndex + 1}
                            </span>
                            <span>{q.courseName || 'Matematik'}</span>
                          </span>

                          <span className="text-[10px] text-slate-400 font-mono">
                            {q.points || 10} Puan
                          </span>
                        </div>

                        {q.imageUrl ? (
                          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-1 flex items-center justify-center h-28 overflow-hidden mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={q.imageUrl}
                              alt={`Soru ${qIndex + 1}`}
                              className="max-h-24 w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="p-2 text-xs italic text-slate-400 bg-slate-50 dark:bg-[#14161c] rounded-lg mb-2">
                            {q.text || 'Görsel yok'}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            Cevap: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">{q.correctAnswer || '—'}</strong>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                            {q.mebOutcomeCode || 'Özel'}
                          </span>
                        </div>
                      </div>

                      {onRemoveQuestion && (
                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onRemoveQuestion(q.id)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Kaldır</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
}
