'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuestionItem, BrandSettings } from '@/types/studio';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  RotateCcw,
  PenTool,
  Trash2,
  X,
  Maximize,
  Minimize,
  CheckCircle2,
  Eraser,
  Highlighter,
} from 'lucide-react';

interface SmartBoardModalProps {
  questions: QuestionItem[];
  brand: BrandSettings;
  docTitle?: string;
  onClose: () => void;
}

const PEN_COLORS = [
  { color: '#ef4444', label: 'Kırmızı' },
  { color: '#3b82f6', label: 'Mavi' },
  { color: '#10b981', label: 'Yeşil' },
  { color: '#eab308', label: 'Sarı' },
  { color: '#ffffff', label: 'Beyaz' },
];

export default function SmartBoardModal({
  questions,
  brand,
  docTitle,
  onClose,
}: SmartBoardModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pen tool states (Docked on the left wall)
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#ef4444');
  const [penMode, setPenMode] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penWidth, setPenWidth] = useState(3.5);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Simple, calm timer
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentQ = questions[currentIndex];

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
      clearCanvas();
    }
  }, [currentIndex, questions.length, clearCanvas]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
      clearCanvas();
    }
  }, [currentIndex, clearCanvas]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // Keyboard Navigation: Arrow keys, Space/Enter, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === ' ' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setShowAnswer((s) => !s);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Timer interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Canvas resize & draw handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
  }, [isPenActive, currentIndex]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPenActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

    if (penMode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (penMode === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.lineWidth = 16;
      ctx.lineCap = 'square';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !isPenActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  if (!currentQ) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131418] text-stone-200">
        <p>Görüntülenecek soru bulunamadı.</p>
        <button onClick={onClose} className="ml-4 underline cursor-pointer">
          Kapat
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#121316] text-[#e8eaed] select-none overflow-hidden font-sans">
      {/* 1. MINIMAL & SADE ÜST ÇUBUK */}
      <header className="flex h-14 items-center justify-between px-6 border-b border-white/5 bg-[#17181d] shrink-0 z-30">
        {/* Sol: Soru Numarası & Başlık */}
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: brand.primaryColor || '#0284c7' }}
          >
            Soru {currentIndex + 1}
          </span>
          <span className="text-xs text-stone-400 font-medium hidden sm:inline">
            {currentQ.courseName ? `${currentQ.courseName} · ` : ''}
            {docTitle || brand.instituteName || 'Sınav Sunumu'}
          </span>
        </div>

        {/* Orta: Sade Kronometre */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs">
          <Clock className="h-3.5 w-3.5 text-stone-400" />
          <button
            type="button"
            onClick={() => setIsTimerRunning((r) => !r)}
            className="font-mono font-bold tracking-wider hover:text-white transition-colors cursor-pointer"
            title={isTimerRunning ? 'Durdur' : 'Başlat'}
          >
            {formatTimer(timerSeconds)}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsTimerRunning(false);
              setTimerSeconds(120);
            }}
            className="text-stone-500 hover:text-stone-300 ml-1 transition-colors cursor-pointer"
            title="2 Dakikaya Sıfırla"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>

        {/* Sağ: Tam Ekran ve Kapat */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isFullscreen ? 'Tam Ekrandan Çık (F)' : 'Tam Ekran (F)'}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Kapat (Esc)"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Kapat</span>
          </button>
        </div>
      </header>

      {/* 2. SOL DUVARDA KALEM & ÇİZİM ARAÇLARI (Left Wall Dock) */}
      <aside className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 p-2 rounded-2xl bg-[#1c1d25]/95 border border-white/10 shadow-2xl backdrop-blur-md text-white select-none">
        {/* Kalem Aç/Kapat Butonu */}
        <button
          type="button"
          onClick={() => {
            setIsPenActive((p) => !p);
            if (!isPenActive) setPenMode('pen');
          }}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isPenActive && penMode === 'pen'
              ? 'bg-sky-600 text-white shadow-md scale-105'
              : 'text-stone-400 hover:text-white hover:bg-white/10'
          }`}
          title={isPenActive ? 'Kalemi Kapat' : 'Tahta Kalemi Aç'}
        >
          <PenTool className="h-4 w-4" />
        </button>

        {/* Vurgulayıcı */}
        <button
          type="button"
          onClick={() => {
            setIsPenActive(true);
            setPenMode('highlighter');
          }}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isPenActive && penMode === 'highlighter'
              ? 'bg-amber-500 text-black shadow-md scale-105'
              : 'text-stone-400 hover:text-white hover:bg-white/10'
          }`}
          title="Fosforlu Vurgulayıcı"
        >
          <Highlighter className="h-4 w-4" />
        </button>

        {/* Silgi */}
        <button
          type="button"
          onClick={() => {
            setIsPenActive(true);
            setPenMode('eraser');
          }}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isPenActive && penMode === 'eraser'
              ? 'bg-stone-300 text-black shadow-md scale-105'
              : 'text-stone-400 hover:text-white hover:bg-white/10'
          }`}
          title="Silgi"
        >
          <Eraser className="h-4 w-4" />
        </button>

        <div className="w-5 h-px bg-white/10 my-0.5" />

        {/* Kalem Renkleri (Seçilebilir) */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          {PEN_COLORS.map((c) => (
            <button
              key={c.color}
              type="button"
              onClick={() => {
                setPenColor(c.color);
                setIsPenActive(true);
                setPenMode('pen');
              }}
              className={`h-5 w-5 rounded-full border transition-all cursor-pointer ${
                penColor === c.color && penMode === 'pen'
                  ? 'scale-125 ring-2 ring-white shadow-sm'
                  : 'opacity-70 hover:opacity-100 hover:scale-110'
              }`}
              style={{ backgroundColor: c.color, borderColor: '#ffffff50' }}
              title={c.label}
            />
          ))}
        </div>

        <div className="w-5 h-px bg-white/10 my-0.5" />

        {/* Tüm Çizimleri Temizle */}
        <button
          type="button"
          onClick={clearCanvas}
          className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
          title="Çizimleri Temizle"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </aside>

      {/* 3. ORTALANMIŞ, SADE VE DİNLENDİRİCİ SORU ALANI */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto pl-16 sm:pl-20">
        {/* Çizim Tuvali */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className={`absolute inset-0 z-20 ${
            isPenActive ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          }`}
        />

        {/* Odaklanmış ve İçeriği Ortalı Soru Kartı */}
        <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-[#191a21] border border-white/8 p-6 sm:p-10 shadow-2xl flex flex-col items-center text-center space-y-6">
          {/* Üst Rozet (Ortalı) */}
          <div className="flex items-center justify-center gap-2">
            <span
              className="px-3.5 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider"
              style={{ backgroundColor: brand.primaryColor || '#0284c7' }}
            >
              Soru {currentIndex + 1}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              ({currentQ.points || 10} Puan)
            </span>
          </div>

          {/* Soru Görseli (Varsa - Ortalı) */}
          {currentQ.imageUrl && (
            <div className={`flex justify-center bg-white rounded-xl p-2 ${currentQ.isImageOnly ? 'max-h-[500px] max-w-4xl' : 'max-h-[320px] max-w-2xl'} overflow-hidden mx-auto border-0 border-none outline-none`}>
              <img
                src={currentQ.imageUrl}
                alt="Soru Görseli"
                className={`${currentQ.isImageOnly ? 'max-h-[480px]' : 'max-h-[300px]'} w-auto max-w-full object-contain mx-auto border-0 border-none outline-none`}
                style={{
                  filter: currentQ.imageGrayscale ? 'grayscale(100%) contrast(125%)' : undefined,
                  transform: currentQ.imageRotation ? `rotate(${currentQ.imageRotation}deg)` : undefined
                }}
              />
            </div>
          )}

          {/* Okuma Parçası / Öncül Metin (Ortalı) */}
          {currentQ.subText && (
            <div className="w-full max-w-2xl rounded-2xl p-4 bg-white/4 border border-white/6 text-stone-300 font-serif leading-relaxed whitespace-pre-line text-base sm:text-lg text-center mx-auto border-t-2 border-t-sky-500">
              {currentQ.subText}
            </div>
          )}

          {/* Soru Kökü (Ortalı ve Net) */}
          {currentQ.text && (
            <div className="w-full max-w-2xl text-xl sm:text-2xl md:text-3xl font-medium text-[#f0f2f5] leading-relaxed whitespace-pre-line text-center mx-auto">
              {currentQ.text}
            </div>
          )}

          {/* Şıklar (Ortalanmış Blok - Eğer şıklar görselde mevcut değilse gösterilir) */}
          {!currentQ.optionsInImage && currentQ.options && currentQ.options.length > 0 && (
            <div className="w-full max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const optLetter = opt.trim().charAt(0).toUpperCase();
                const isCorrect = showAnswer && optLetter === currentQ.correctAnswer?.toUpperCase();

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 text-base sm:text-lg transition-all ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-bold ring-1 ring-emerald-500/50 shadow-md scale-[1.02]'
                        : 'border-white/6 bg-white/3 text-stone-200 hover:border-white/15'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                        isCorrect
                          ? 'bg-emerald-500 text-black shadow-xs'
                          : 'bg-white/8 text-stone-300'
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="flex-1 text-left break-words">
                      {opt.replace(/^[A-E]\)\s*/i, '')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Çözüm ve Doğru Cevap (Ortalı - Cevap Açıldığında Görünür) */}
          {showAnswer && (
            <div className="w-full max-w-xl mx-auto pt-4 border-t border-white/8 flex flex-col items-center text-center animate-in fade-in duration-200">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-base mb-1.5">
                <CheckCircle2 className="h-5 w-5" />
                <span>Doğru Cevap:</span>
                <span className="bg-emerald-500 text-black px-3 py-0.5 rounded-lg font-mono text-sm font-black shadow-xs">
                  {currentQ.correctAnswer || 'A'}
                </span>
              </div>
              {currentQ.solutionExplanation && (
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line mt-2 p-4 rounded-xl bg-white/4 border border-white/6 text-center max-w-lg mx-auto">
                  {currentQ.solutionExplanation}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 4. SADE VE NET ALT NAVİGASYON */}
      <footer className="flex h-16 items-center justify-between px-6 border-t border-white/5 bg-[#17181d] shrink-0 z-30">
        {/* Önceki Soru */}
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            currentIndex === 0
              ? 'opacity-25 cursor-not-allowed text-stone-500'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Önceki Soru</span>
        </button>

        {/* Ortadaki Cevap Butonu & Sayfa Numarası */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowAnswer((s) => !s)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
              showAnswer
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showAnswer ? 'Cevabı Gizle' : 'Cevabı Göster (Boşluk)'}</span>
          </button>

          <span className="text-xs font-mono text-stone-400 hidden md:inline">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Sonraki Soru */}
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex === questions.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            currentIndex === questions.length - 1
              ? 'opacity-25 cursor-not-allowed text-stone-500'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="hidden sm:inline">Sonraki Soru</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
