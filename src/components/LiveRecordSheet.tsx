import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AudioLines,
  BookmarkCheck,
  ChevronDown,
  FileText,
  Flag,
  Languages,
  Mic,
  Pause,
  Play,
  Send,
  X,
} from 'lucide-react';
import { AppLanguage, DeviceInfo } from '../types/vamx';
import { UI_STRINGS } from '../data/uiStrings';
import { formatDuration } from './WaveformPlayer';

interface LiveRecordSheetProps {
  isOpen: boolean;
  isRecording: boolean;
  isPaused: boolean;
  seconds: number;
  device: DeviceInfo;
  liveNotes: Array<{ time: string; seconds: number; text: string }>;
  language?: AppLanguage;
  onClose: () => void;
  onTogglePause: () => void;
  onStopAndSave: () => void;
  onDiscard?: () => void;
  onAddNote: (noteText: string) => void;
  onSwitchToTranslate: () => void;
}

const BAR_COUNT = 45;

export const LiveRecordSheet: React.FC<LiveRecordSheetProps> = ({
  isOpen,
  isRecording,
  isPaused,
  seconds,
  device,
  liveNotes,
  language = 'zh',
  onClose,
  onTogglePause,
  onStopAndSave,
  onDiscard,
  onAddNote,
  onSwitchToTranslate,
}) => {
  const lr = UI_STRINGS[language].liveRecord;
  const bookmarkKeyword = lr.markHighlightBtn;
  const [showNoteDrawer, setShowNoteDrawer] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [energy, setEnergy] = useState(0.2);
  const [justBookmarked, setJustBookmarked] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const isHardwareCard = device.bound !== false && device.connected;

  // Borderless 60fps Dual-Layer In-Place Acoustic Wave Renderer (Fluid Ribbon + Tapered Spectrum)
  useEffect(() => {
    if (!isOpen || !isRecording) return;

    let rafId = 0;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;
    let lastFrameTime = performance.now();
    let lastEnergyStatePush = 0;
    let phase = 0;
    let smoothEnergy = 0.18;
    const smoothBars = new Float32Array(BAR_COUNT).fill(0.12);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const startMic = async () => {
      try {
        if (!isHardwareCard && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const ctx = new AudioContext();
          audioCtxRef.current = ctx;
          const src = ctx.createMediaStreamSource(stream);
          analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.72;
          src.connect(analyser);
          dataArray = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        }
      } catch {
        // Organic speech envelope fallback
      }
    };

    startMic();

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      const paused = isPausedRef.current;

      if (!paused) {
        phase += dt * 3.8;
      }

      // 1. Sample acoustic spectrum or organic speech cadence
      let frameEnergy = 0.08;
      if (!paused && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        const bins = Math.min(32, dataArray.length);
        for (let i = 0; i < bins; i++) sum += dataArray[i];
        frameEnergy = Math.max(0.08, Math.min(1, (sum / (bins * 255)) * 2.3 + 0.06));

        for (let i = 0; i < BAR_COUNT; i++) {
          // Symmetric frequency mapping (low/mid richness in center)
          const centerDist = Math.abs(i - (BAR_COUNT - 1) / 2) / ((BAR_COUNT - 1) / 2);
          const binIdx = Math.min(dataArray.length - 1, Math.floor(centerDist * 26));
          const raw = dataArray[binIdx] / 255;
          const target = Math.max(0.1, Math.min(1, raw * 1.45 + 0.08));
          smoothBars[i] = smoothBars[i] * 0.65 + target * 0.35;
        }
      } else if (!paused) {
        const speechMod = Math.max(0.25, Math.sin(phase * 0.45) * 0.45 + 0.55);
        const burst = Math.abs(Math.sin(phase * 1.35) * 0.5 + Math.cos(phase * 2.15) * 0.5);
        frameEnergy = Math.max(0.12, Math.min(0.92, 0.14 + speechMod * burst * 0.78));

        for (let i = 0; i < BAR_COUNT; i++) {
          const wave =
            Math.abs(
              Math.sin(phase * 1.4 + i * 0.36) * 0.52 +
                Math.cos(phase * 2.1 - i * 0.62) * 0.48
            ) * speechMod;
          const target = Math.max(0.1, Math.min(0.96, wave * 0.92 + 0.1));
          smoothBars[i] = smoothBars[i] * 0.72 + target * 0.28;
        }
      } else {
        frameEnergy = 0;
        for (let i = 0; i < BAR_COUNT; i++) {
          smoothBars[i] = smoothBars[i] * 0.84 + 0.08 * 0.16;
        }
      }

      smoothEnergy = smoothEnergy * 0.76 + frameEnergy * 0.24;

      if (now - lastEnergyStatePush >= 75) {
        lastEnergyStatePush = now;
        setEnergy(paused ? 0 : smoothEnergy);
      }

      // 2. Draw borderless layered waves on transparent canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssW = canvas.clientWidth;
        const cssH = canvas.clientHeight;
        if (cssW > 0 && cssH > 0) {
          const targetW = Math.round(cssW * dpr);
          const targetH = Math.round(cssH * dpr);
          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, cssW, cssH);

            const midY = cssH / 2;
            const maxAmp = cssH * 0.42;

            // Layer A: Soft ambient mirrored fluid wave ribbon (drawn behind crisp bars)
            if (!prefersReducedMotion) {
              const drawRibbon = (
                freq: number,
                speed: number,
                ampScale: number,
                fillStyle: string | CanvasGradient,
                strokeStyle: string
              ) => {
                const steps = 64;
                ctx.beginPath();
                for (let s = 0; s <= steps; s++) {
                  const t = s / steps;
                  const x = t * cssW;
                  const bell = Math.pow(Math.sin(Math.PI * t), 1.55);
                  const yOff =
                    Math.sin(t * Math.PI * freq + phase * speed) *
                    (0.22 + smoothEnergy * 0.9) *
                    maxAmp *
                    ampScale *
                    bell;
                  if (s === 0) ctx.moveTo(x, midY - yOff);
                  else ctx.lineTo(x, midY - yOff);
                }
                for (let s = steps; s >= 0; s--) {
                  const t = s / steps;
                  const x = t * cssW;
                  const bell = Math.pow(Math.sin(Math.PI * t), 1.55);
                  const yOff =
                    Math.sin(t * Math.PI * freq + phase * speed) *
                    (0.22 + smoothEnergy * 0.9) *
                    maxAmp *
                    ampScale *
                    bell;
                  ctx.lineTo(x, midY + yOff);
                }
                ctx.closePath();
                ctx.fillStyle = fillStyle;
                ctx.fill();

                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = 1;
                ctx.stroke();
              };

              const ribbonGrad = ctx.createLinearGradient(0, 0, cssW, 0);
              if (paused) {
                ribbonGrad.addColorStop(0, 'rgba(148, 163, 184, 0)');
                ribbonGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.08)');
                ribbonGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
              } else {
                ribbonGrad.addColorStop(0, 'rgba(22, 104, 255, 0)');
                ribbonGrad.addColorStop(0.5, 'rgba(22, 104, 255, 0.11)');
                ribbonGrad.addColorStop(1, 'rgba(22, 104, 255, 0)');
              }

              drawRibbon(
                3.2,
                1.15,
                0.76,
                ribbonGrad,
                paused ? 'rgba(148, 163, 184, 0.18)' : 'rgba(22, 104, 255, 0.2)'
              );
              drawRibbon(
                4.8,
                -0.85,
                0.52,
                paused ? 'rgba(148, 163, 184, 0.04)' : 'rgba(96, 165, 250, 0.08)',
                paused ? 'rgba(148, 163, 184, 0.12)' : 'rgba(96, 165, 250, 0.22)'
              );
            }

            // Layer B: Crisp center-weighted tapered acoustic bars
            const totalW = cssW * 0.94;
            const startX = (cssW - totalW) / 2;
            const slotW = totalW / BAR_COUNT;
            const barW = Math.min(2.6, Math.max(1.8, slotW * 0.42));

            for (let i = 0; i < BAR_COUNT; i++) {
              const t = i / (BAR_COUNT - 1);
              // Gentle bell taper so edges melt organically
              const bell = 0.24 + 0.76 * Math.pow(Math.sin(Math.PI * t), 1.15);
              const val = smoothBars[i];
              const halfH = Math.max(2, val * maxAmp * bell);
              const x = startX + i * slotW + (slotW - barW) / 2;

              const distFromCenter = Math.abs(t - 0.5) * 2; // 0 center -> 1 edges
              const edgeFade = Math.max(0.28, 1 - Math.pow(distFromCenter, 2.2) * 0.72);

              if (paused) {
                ctx.fillStyle = `rgba(148, 163, 184, ${(0.52 * edgeFade).toFixed(2)})`;
              } else if (distFromCenter < 0.45) {
                const alpha = (0.55 + val * 0.4) * edgeFade;
                ctx.fillStyle = `rgba(22, 104, 255, ${alpha.toFixed(2)})`;
              } else {
                const alpha = (0.45 + val * 0.32) * edgeFade;
                ctx.fillStyle = `rgba(100, 116, 139, ${alpha.toFixed(2)})`;
              }

              ctx.beginPath();
              ctx.roundRect(x, midY - halfH, barW, halfH * 2, barW / 2);
              ctx.fill();
            }
          }
        }
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, [isOpen, isRecording, isHardwareCard]);

  const latestNote = liveNotes.length > 0 ? liveNotes[liveNotes.length - 1] : null;

  // Audio-reactive scale/opacity for concentric mic halo (compositor-only)
  const outerRingScale = isPaused ? 0.94 : Number((1 + energy * 0.24).toFixed(3));
  const midRingScale = isPaused ? 0.96 : Number((1 + energy * 0.13).toFixed(3));
  const outerRingOpacity = isPaused ? 0.3 : Number((0.25 + energy * 0.45).toFixed(2));

  const levelBars = useMemo(() => [0.22, 0.42, 0.62, 0.82], []);

  if (!isOpen) return null;

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = noteInput.trim();
    if (!clean) return;
    onAddNote(clean);
    setNoteInput('');
  };

  const handleQuickBookmark = () => {
    onAddNote(bookmarkKeyword);
    setJustBookmarked(true);
    window.setTimeout(() => setJustBookmarked(false), 650);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
      <div className="w-full h-full sm:max-w-[440px] sm:max-h-[860px] sm:rounded-[32px] bg-[#FAF9F6] flex flex-col justify-between overflow-hidden relative shadow-2xl">
        {/* Top Brand & Live Status Bar */}
        <header className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              aria-label={UI_STRINGS[language].common.close}
              className="w-10 h-10 -ml-2 rounded-full hover:bg-black/[0.04] flex items-center justify-center text-[#64748B] cursor-pointer transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[7px] bg-[#1668FF] text-white flex items-center justify-center shadow-2xs">
                <AudioLines className="w-3.5 h-3.5" />
              </div>
              <span className="font-display text-[17px] font-bold tracking-tight text-[#1E293B]">
                VAMX
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPaused ? 'bg-amber-500' : 'bg-[#E86D5D] animate-pulse'
                }`}
              />
              <span>{isPaused ? lr.statusPaused : lr.statusRecording}</span>
            </div>

            {onDiscard && (
              <button
                type="button"
                onClick={onDiscard}
                className="h-9 px-2.5 rounded-lg hover:bg-black/[0.04] text-xs text-[#94A3B8] hover:text-[#E5484D] transition-colors cursor-pointer"
              >
                {lr.cancel}
              </button>
            )}
          </div>
        </header>

        {/* Serene Center Acoustic Studio Workspace */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 text-center -mt-2">
          {/* Audio-Reactive Concentric Acoustic Halo */}
          <div className="relative w-[128px] h-[128px] flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full transition-transform duration-100 will-change-transform ${
                isPaused
                  ? 'bg-[#E2E8F0]'
                  : isHardwareCard
                  ? 'bg-[#1668FF]/15'
                  : 'bg-[#64748B]/14'
              }`}
              style={{
                transform: `scale(${outerRingScale})`,
                opacity: outerRingOpacity,
              }}
            />
            <div
              className={`absolute inset-3 rounded-full transition-transform duration-100 will-change-transform ${
                isPaused
                  ? 'bg-[#ECEEE9]'
                  : isHardwareCard
                  ? 'bg-[#1668FF]/18'
                  : 'bg-[#94A3B8]/18'
              }`}
              style={{
                transform: `scale(${midRingScale})`,
              }}
            />
            <div className="relative w-[76px] h-[76px] rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-[0_6px_20px_-6px_rgba(15,23,42,0.12)]">
              <Mic
                className={`w-7 h-7 stroke-[1.75] transition-colors ${
                  isPaused
                    ? 'text-[#94A3B8]'
                    : isHardwareCard
                    ? 'text-[#1668FF]'
                    : 'text-[#334155]'
                }`}
              />
            </div>
          </div>

          {/* Source & Real-Time Signal Meter */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[12.5px] font-medium text-[#64748B]">
            <span>{isHardwareCard ? lr.sourceCard(device.name) : lr.sourcePhone}</span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="inline-flex items-end gap-[2px] h-3" aria-label="signal">
              {levelBars.map((threshold, idx) => {
                const active = !isPaused && energy >= threshold * 0.72;
                return (
                  <span
                    key={idx}
                    className={`w-[2.5px] rounded-full transition-colors duration-100 ${
                      active
                        ? idx === 3
                          ? 'bg-[#E86D5D]'
                          : 'bg-[#1668FF]'
                        : 'bg-[#CBD5E1]'
                    }`}
                    style={{ height: `${5 + idx * 2}px` }}
                  />
                );
              })}
            </span>
          </div>

          {/* Giant Crisp Mono Timer */}
          <div className="mt-2.5 font-mono text-[52px] font-semibold tracking-[-0.025em] leading-none text-[#111827] tabular-nums">
            {formatDuration(seconds)}
          </div>

          {/* Borderless Dual-Layer In-Place Acoustic Wave */}
          <div className="w-full max-w-[320px] mt-5">
            <canvas
              ref={canvasRef}
              className="w-full h-[84px] block"
              aria-label="Live waveform"
            />
          </div>

          {/* Quiet Guidance or Latest Note Feedback */}
          <div className="mt-3 min-h-[20px] flex items-center justify-center">
            {latestNote ? (
              <button
                type="button"
                onClick={() => setShowNoteDrawer(true)}
                className="max-w-[290px] inline-flex items-center gap-1.5 text-[11.5px] text-[#475569] hover:text-[#1668FF] truncate cursor-pointer tabular-nums transition-colors"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    latestNote.text === bookmarkKeyword || latestNote.text === '重点标记'
                      ? 'bg-[#E86D5D]'
                      : 'bg-[#1668FF]'
                  }`}
                />
                <span className="font-mono font-medium">{latestNote.time}</span>
                <span className="truncate">{latestNote.text}</span>
              </button>
            ) : (
              <p className="text-xs text-[#94A3B8]">
                {isPaused
                  ? lr.pausedNotice
                  : isHardwareCard
                  ? lr.promptCard
                  : lr.promptPhone}
              </p>
            )}
          </div>

          {/* Centered Note & Live Translate Triggers */}
          <div className="mt-4 flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowNoteDrawer(true)}
              className="h-11 px-4 rounded-full bg-white border border-[#E2E4E0] hover:border-[#CBD5E1] text-[13px] font-medium text-[#334155] shadow-[0_1px_3px_rgba(0,0,0,0.03)] inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer tabular-nums"
            >
              <FileText className="w-4 h-4 text-[#475569]" />
              <span>{liveNotes.length > 0 ? `${lr.noteBtn} (${liveNotes.length})` : lr.noteBtn}</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToTranslate}
              className="h-11 px-4 rounded-full bg-white border border-[#E2E4E0] hover:border-[#1668FF]/40 text-[13px] font-medium text-[#1668FF] shadow-[0_1px_3px_rgba(0,0,0,0.03)] inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Languages className="w-4 h-4" />
              <span>{lr.translateBtn}</span>
            </button>
          </div>
        </div>

        {/* Bottom 3-Column Thumb Controls */}
        <div className="px-6 pb-8 pt-2 grid grid-cols-3 items-start shrink-0">
          {/* Left: One-tap Highlight Bookmark */}
          <button
            type="button"
            onClick={handleQuickBookmark}
            className="flex flex-col items-center gap-2 min-h-[68px] pt-2.5 cursor-pointer group active:scale-95 transition-transform"
          >
            {justBookmarked ? (
              <BookmarkCheck className="w-[22px] h-[22px] text-[#E86D5D] stroke-[2] transition-transform scale-110" />
            ) : (
              <Flag className="w-[22px] h-[22px] text-[#64748B] group-hover:text-[#E86D5D] stroke-[1.6] transition-colors" />
            )}
            <span
              className={`text-xs font-medium transition-colors ${
                justBookmarked ? 'text-[#E86D5D]' : 'text-[#64748B]'
              }`}
            >
              {justBookmarked ? lr.markedFeedback : lr.markHighlightBtn}
            </span>
          </button>

          {/* Center: Elevated Coral Stop & Save Button */}
          <button
            type="button"
            onClick={onStopAndSave}
            aria-label={lr.saveAria}
            className="flex flex-col items-center gap-2.5 cursor-pointer group active:scale-95 transition-transform"
          >
            <span className="relative w-[68px] h-[68px] rounded-full bg-[#F5D0CA]/75 flex items-center justify-center">
              {!isPaused && (
                <span
                  className="absolute inset-0 rounded-full border border-[#E86D5D]/35 transition-transform duration-150 will-change-transform"
                  style={{
                    transform: `scale(${Number((1 + energy * 0.14).toFixed(3))})`,
                    opacity: Number((0.25 + energy * 0.45).toFixed(2)),
                  }}
                />
              )}
              <span className="relative w-[52px] h-[52px] rounded-full bg-[#E86D5D] group-hover:bg-[#DF5E4D] flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(232,109,93,0.45)] transition-colors">
                <span className="w-[18px] h-[18px] rounded-[4px] bg-white" />
              </span>
            </span>
            <span className="text-xs font-medium text-[#64748B]">{lr.saveLabel}</span>
          </button>

          {/* Right: Pause / Resume */}
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={isPaused ? lr.resumeAria : lr.pauseAria}
            className="flex flex-col items-center gap-2 min-h-[68px] pt-2.5 cursor-pointer group active:scale-95 transition-transform"
          >
            {isPaused ? (
              <Play className="w-[22px] h-[22px] text-[#1668FF] fill-current" />
            ) : (
              <Pause className="w-[22px] h-[22px] text-[#64748B] group-hover:text-[#111827] stroke-[1.6] transition-colors" />
            )}
            <span className={`text-xs font-medium ${isPaused ? 'text-[#1668FF]' : 'text-[#64748B]'}`}>
              {isPaused ? lr.resumeLabel : lr.pauseLabel}
            </span>
          </button>
        </div>

        {/* Inline Slide-Up Note Drawer */}
        {showNoteDrawer && (
          <div
            className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[1px] flex items-end justify-center"
            onClick={() => setShowNoteDrawer(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl border-t border-[#E5ECF5] px-5 pt-3 pb-6 space-y-3.5 shadow-2xl max-h-[75%] flex flex-col"
            >
              <div className="w-9 h-1 rounded-full bg-zinc-200 mx-auto shrink-0" />
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-display font-bold text-[#111827]">{lr.drawerTitle}</h3>
                  <p className="text-[11px] font-mono text-[#64748B] mt-0.5 tabular-nums">
                    {formatDuration(seconds)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNoteDrawer(false)}
                  aria-label={UI_STRINGS[language].common.close}
                  className="w-10 h-10 -mr-1.5 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              {liveNotes.length > 0 && (
                <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar divide-y divide-[#F1F5F9] max-h-40">
                  {liveNotes.map((n, i) => (
                    <div key={i} className="py-2 flex items-baseline gap-2.5 text-xs">
                      <span
                        className={`font-mono font-medium tabular-nums shrink-0 ${
                          n.text === bookmarkKeyword || n.text === '重点标记'
                            ? 'text-[#E86D5D]'
                            : 'text-[#1668FF]'
                        }`}
                      >
                        {n.time}
                      </span>
                      <span className="text-[#1E293B]">{n.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* One-tap quick scene tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 shrink-0">
                {lr.quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onAddNote(tag)}
                    className="h-9 px-3 rounded-lg bg-[#F4F7FC] hover:bg-[#E8F0FE] text-[11.5px] font-medium text-[#1E293B] hover:text-[#1668FF] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmitNote} className="flex items-center gap-2 pt-0.5 shrink-0">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder={lr.drawerPlaceholder(formatDuration(seconds))}
                  autoFocus
                  className="flex-1 h-11 px-3.5 rounded-xl bg-[#F6F8FC] border border-[#E5ECF5] text-xs text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1668FF] focus:bg-white"
                />
                <button
                  type="submit"
                  aria-label={lr.drawerAddBtn}
                  className="h-11 px-4 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lr.drawerAddBtn}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
