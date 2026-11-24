import React, { useEffect, useRef, useState } from 'react';
import { Download, Flag, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { AppLanguage } from '../types/vamx';
import { UI_STRINGS } from '../data/uiStrings';

interface WaveformPlayerProps {
  waveform: number[];
  durationSec: number;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  audioUrl?: string;
  language?: AppLanguage;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onCycleRate: () => void;
  onAddHighlight: () => void;
  onExport: () => void;
}

export const formatDuration = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  waveform,
  durationSec,
  currentTime,
  isPlaying,
  playbackRate,
  audioUrl,
  language = 'zh',
  onTogglePlay,
  onSeek,
  onCycleRate,
  onAddHighlight,
  onExport,
}) => {
  const w = UI_STRINGS[language].waveform;
  const trackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync optional real <audio> element when user imports an audio file
  useEffect(() => {
    if (!audioUrl) return;
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isPlaying, playbackRate, audioUrl]);

  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    if (Math.abs(audioRef.current.currentTime - currentTime) > 1.2) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime, audioUrl]);

  const progressRatio = durationSec > 0 ? Math.min(1, Math.max(0, currentTime / durationSec)) : 0;

  const computeSeekFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(Math.round(ratio * durationSec));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7ECF4] shadow-[0_4px_16px_-6px_rgba(22,42,84,0.06)] p-4 transition-colors">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className="flex items-center gap-3.5">
        {/* Ink Slate Play/Pause Trigger */}
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? w.pauseAria : w.playAria}
          className="w-12 h-12 rounded-full bg-[#1C2331] text-white flex items-center justify-center shrink-0 hover:bg-[#111827] active:scale-95 transition-all duration-150 cursor-pointer shadow-xs"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-[1px]" />
          )}
        </button>

        {/* Interactive Scrubbing Waveform + VAMX Blue Slider */}
        <div className="flex-1 min-w-0">
          <div
            ref={trackRef}
            role="slider"
            aria-label={w.sliderAria}
            aria-valuemin={0}
            aria-valuemax={durationSec}
            aria-valuenow={Math.floor(currentTime)}
            tabIndex={0}
            onPointerDown={(e) => {
              setIsDragging(true);
              e.currentTarget.setPointerCapture(e.pointerId);
              computeSeekFromPointer(e.clientX);
            }}
            onPointerMove={(e) => {
              if (isDragging) computeSeekFromPointer(e.clientX);
            }}
            onPointerUp={() => setIsDragging(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onSeek(Math.min(durationSec, currentTime + 5));
              if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - 5));
            }}
            className="relative cursor-pointer touch-none select-none group pt-1"
          >
            <div className="h-9 flex items-center gap-[3px]">
              {waveform.map((amp, idx) => {
                const barRatio = idx / Math.max(1, waveform.length - 1);
                const passed = barRatio <= progressRatio;
                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full transition-colors duration-100 ${
                      passed ? 'bg-[#1668FF]' : 'bg-[#D5DCE6] group-hover:bg-[#BDC8D8]'
                    }`}
                    style={{ height: `${Math.max(20, Math.round(amp * 100))}%` }}
                  />
                );
              })}
            </div>

            {/* VAMX Blue Progress Bar & Thumb */}
            <div className="relative h-1.5 mt-2 bg-[#E8EEF7] rounded-full">
              <div
                className="h-full bg-[#1668FF] rounded-full"
                style={{ width: `${progressRatio * 100}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#1668FF] shadow-[0_0_0_2px_#ffffff] pointer-events-none"
                style={{ left: `calc(${progressRatio * 100}% - 6px)` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-1.5 text-[11px] font-mono text-zinc-500 tabular-nums">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(durationSec)}</span>
          </div>
        </div>
      </div>

      {/* Tactile Secondary Controls (>= 44px touch targets) */}
      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#F0F3F8]">
        <button
          type="button"
          onClick={onCycleRate}
          className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-[#F2F5FA] hover:bg-[#E7ECF5] text-xs font-mono font-medium text-[#1C2331] transition-colors active:scale-95 cursor-pointer tabular-nums"
        >
          {playbackRate}×
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
            aria-label={w.rewind10Aria}
            className="min-h-[44px] min-w-[48px] px-2.5 rounded-xl text-zinc-600 hover:text-[#1668FF] hover:bg-[#F2F5FA] flex items-center justify-center gap-1 text-xs font-mono transition-colors active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>10</span>
          </button>

          <button
            type="button"
            onClick={() => onSeek(Math.min(durationSec, currentTime + 10))}
            aria-label={w.forward10Aria}
            className="min-h-[44px] min-w-[48px] px-2.5 rounded-xl text-zinc-600 hover:text-[#1668FF] hover:bg-[#F2F5FA] flex items-center justify-center gap-1 text-xs font-mono transition-colors active:scale-95 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>10</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onAddHighlight}
            title={w.markTitle}
            className="min-h-[44px] px-2.5 rounded-xl text-zinc-600 hover:text-[#1668FF] hover:bg-[#F2F5FA] flex items-center gap-1.5 text-xs font-medium transition-colors active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Flag className="w-4 h-4" />
            <span>{w.markBtn}</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            title={w.exportAria}
            aria-label={w.exportAria}
            className="min-h-[44px] min-w-[44px] rounded-xl text-zinc-600 hover:text-[#1668FF] hover:bg-[#F2F5FA] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
