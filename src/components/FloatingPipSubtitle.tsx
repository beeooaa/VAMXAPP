import React, { useEffect, useRef, useState } from 'react';
import {
  Bluetooth,
  Maximize2,
  Mic,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { AppLanguage, TranslationBlock } from '../types/vamx';
import { getLanguageOptionLabel, UI_STRINGS } from '../data/uiStrings';
import { formatDuration } from './WaveformPlayer';

interface FloatingPipSubtitleProps {
  visible: boolean;
  desktopMode: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  latestBlock?: TranslationBlock;
  sourceLang: string;
  targetLang: string;
  audioInput: 'card' | 'phone';
  deviceName: string;
  isListening: boolean;
  elapsedSec: number;
  showSource: boolean;
  language?: AppLanguage;
  onToggleSource: () => void;
  onToggleListen: () => void;
  onExpand: () => void;
  onClose: () => void;
}

export const FloatingPipSubtitle: React.FC<FloatingPipSubtitleProps> = ({
  visible,
  desktopMode,
  containerRef,
  latestBlock,
  sourceLang,
  targetLang,
  audioInput,
  deviceName,
  isListening,
  elapsedSec,
  showSource,
  language = 'zh',
  onToggleSource,
  onToggleListen,
  onExpand,
  onClose,
}) => {
  const tr = UI_STRINGS[language].translate;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const getBounds = () => {
    const padX = 12;
    const topSafe = desktopMode ? 16 : 56;
    const bottomSafe = desktopMode ? 24 : 76;

    const cw = desktopMode
      ? window.innerWidth
      : containerRef.current?.clientWidth || 390;
    const ch = desktopMode
      ? window.innerHeight
      : containerRef.current?.clientHeight || 800;

    const cardW = cardRef.current?.offsetWidth || Math.min(316, cw - 24);
    const cardH = cardRef.current?.offsetHeight || 138;

    return {
      minX: padX,
      maxX: Math.max(padX, cw - cardW - padX),
      minY: topSafe,
      maxY: Math.max(topSafe, ch - cardH - bottomSafe),
      cw,
      ch,
      cardW,
      cardH,
    };
  };

  // Initialize default Apple PiP position (top-right / upper safe zone) when shown
  useEffect(() => {
    if (!visible) {
      setPos(null);
      return;
    }
    const raf = window.requestAnimationFrame(() => {
      const b = getBounds();
      setPos({ x: b.maxX, y: b.minY });
    });
    return () => window.cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, desktopMode]);

  // Keep within bounds on resize
  useEffect(() => {
    if (!visible) return;
    const onResize = () => {
      const b = getBounds();
      setPos((prev) => {
        if (!prev) return { x: b.maxX, y: b.minY };
        return {
          x: Math.min(b.maxX, Math.max(b.minX, prev.x)),
          y: Math.min(b.maxY, Math.max(b.minY, prev.y)),
        };
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, desktopMode]);

  if (!visible || !latestBlock) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-pip-control="true"]')) return;

    const b = getBounds();
    const current = pos ?? { x: b.maxX, y: b.minY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      originX: current.x,
      originY: current.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.moved = true;
    }
    const b = getBounds();
    setPos({
      x: Math.min(b.maxX, Math.max(b.minX, dragStartRef.current.originX + dx)),
      y: Math.min(b.maxY, Math.max(b.minY, dragStartRef.current.originY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const moved = dragStartRef.current.moved;
    dragStartRef.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!moved) return;

    // Apple PiP magnetic corner snap (snaps cleanly to nearest edge/corner)
    const b = getBounds();
    setPos((prev) => {
      if (!prev) return { x: b.maxX, y: b.minY };
      const snapX = prev.x + b.cardW / 2 < b.cw / 2 ? b.minX : b.maxX;
      // Snap vertically to top or bottom safe corner when near edges, or allow middle-ish resting
      const snapY =
        prev.y + b.cardH / 2 < b.ch / 2 ? b.minY : b.maxY;
      return { x: snapX, y: snapY };
    });
  };

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={tr.pipBtn}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: pos ? `translate3d(${pos.x}px, ${pos.y}px, 0)` : undefined,
        transition: dragging
          ? 'none'
          : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        touchAction: 'none',
      }}
      className={`${
        desktopMode ? 'fixed' : 'absolute'
      } top-0 left-0 z-[52] w-[308px] max-w-[calc(100%-24px)] select-none rounded-[22px] bg-[#141821]/90 backdrop-blur-2xl text-white border border-white/15 shadow-[0_22px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)] overflow-hidden cursor-grab active:cursor-grabbing ${
        !pos ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Apple PiP Top Drag Pill */}
      <div className="pt-2 pb-1 flex justify-center">
        <div className="w-8 h-1 rounded-full bg-white/25" />
      </div>

      {/* Top Chrome Row */}
      <div className="px-3 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            data-pip-control="true"
            onClick={onClose}
            aria-label={tr.pipCloseAria}
            className="w-6 h-6 rounded-full bg-white/12 hover:bg-white/22 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 px-2 h-6 rounded-full bg-white/8 text-[11px] font-medium text-white/85 min-w-0">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isListening ? 'bg-[#FF453A] animate-pulse' : 'bg-zinc-400'
              }`}
            />
            <span className="truncate">
              {getLanguageOptionLabel(sourceLang, language)} → {getLanguageOptionLabel(targetLang, language)}
            </span>
            <span className="text-white/35">·</span>
            {audioInput === 'card' ? (
              <Bluetooth className="w-3 h-3 text-[#60A5FA] shrink-0" aria-label={deviceName} />
            ) : (
              <Mic className="w-3 h-3 text-white/75 shrink-0" aria-label={tr.sourcePhone} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            data-pip-control="true"
            onClick={onToggleSource}
            className={`h-6 px-2 rounded-full text-[10.5px] font-medium transition-colors cursor-pointer ${
              showSource
                ? 'bg-white/20 text-white'
                : 'bg-white/8 text-white/55 hover:text-white/85'
            }`}
          >
            {tr.pipSourceToggle}
          </button>

          <button
            type="button"
            data-pip-control="true"
            onClick={onToggleListen}
            aria-label={isListening ? tr.pipPauseAria : tr.pipPlayAria}
            className="w-6 h-6 rounded-full bg-white/12 hover:bg-white/22 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            {isListening ? (
              <Pause className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            data-pip-control="true"
            onClick={onExpand}
            aria-label={tr.pipExpandAria}
            title={tr.pipExpandAria}
            className="w-6 h-6 rounded-full bg-white/12 hover:bg-white/22 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Live Subtitle Body */}
      <div className="px-3.5 pb-3 pt-0.5 space-y-1.5 border-t border-white/8">
        {showSource && (
          <p className="text-[11.5px] text-white/60 leading-snug line-clamp-2 pt-1.5">
            {latestBlock.sourceText}
          </p>
        )}
        <p
          className={`text-[14px] font-medium text-white leading-relaxed line-clamp-3 ${
            !showSource ? 'pt-1.5' : ''
          }`}
        >
          {latestBlock.translatedText}
        </p>

        <div className="flex items-center justify-between pt-0.5 text-[10px] text-white/45 font-mono tabular-nums">
          <span>
            {audioInput === 'card' ? tr.pipCardSource(deviceName) : tr.pipPhoneSource}
          </span>
          <span>{formatDuration(elapsedSec)}</span>
        </div>
      </div>
    </div>
  );
};
