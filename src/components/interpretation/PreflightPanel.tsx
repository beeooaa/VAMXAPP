import React, { useEffect, useRef, useState } from 'react';
import { Check, Mic, MicOff, Square, Volume2, X } from 'lucide-react';
import { AppLanguage, InterpretationRoom } from '../../types/vamx';
import { INTERP_COPY } from '../../data/interpretationData';

interface PreflightPanelProps {
  room: InterpretationRoom;
  language: AppLanguage;
  variant?: 'inline' | 'sheet';
  onUpdatePreflight: (patch: Partial<NonNullable<InterpretationRoom['preflight']>>) => void;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

const METER_BARS = 14;

export const PreflightPanel: React.FC<PreflightPanelProps> = ({
  room,
  language,
  variant = 'inline',
  onUpdatePreflight,
  onClose,
  onNotify,
}) => {
  const c = INTERP_COPY[language];
  const preflight = room.preflight ?? {
    micChecked: false,
    dualToneChecked: false,
    rtcChecked: true,
  };

  const [micTesting, setMicTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [activeTone, setActiveTone] = useState<'orig' | 'interp' | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stopMic = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setMicTesting(false);
    setMicLevel(0);
  };

  useEffect(() => {
    return () => stopMic();
  }, []);

  const handleToggleMic = async () => {
    if (micTesting) {
      stopMic();
      return;
    }
    setMicError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Browser mediaDevices unavailable');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      setMicTesting(true);
      onUpdatePreflight({ micChecked: true });

      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        const pct = Math.min(100, Math.round((avg / 96) * 100));
        setMicLevel(pct);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setMicError(err instanceof Error ? err.message : 'Microphone access denied');
      setMicTesting(false);
    }
  };

  const playTestTone = (channel: 'orig' | 'interp') => {
    setActiveTone(channel);
    window.setTimeout(() => setActiveTone((cur) => (cur === channel ? null : cur)), 650);
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(channel === 'orig' ? 523.25 : 659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        channel === 'orig' ? 659.25 : 880,
        ctx.currentTime + 0.35
      );
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.58);
      onUpdatePreflight({ dualToneChecked: true });
      onNotify(channel === 'orig' ? c.playOrigTone : c.playIntTone);
      window.setTimeout(() => ctx.close().catch(() => {}), 700);
    } catch {
      onUpdatePreflight({ dualToneChecked: true });
    }
  };

  const checklistItems: Array<{
    key: 'micChecked' | 'dualToneChecked' | 'rtcChecked';
    checked: boolean;
    label: string;
  }> = [
    { key: 'micChecked', checked: preflight.micChecked, label: c.checkItem1 },
    { key: 'dualToneChecked', checked: preflight.dualToneChecked, label: c.checkItem2 },
    { key: 'rtcChecked', checked: preflight.rtcChecked, label: c.checkItem3 },
  ];

  const readyCount = checklistItems.filter((i) => i.checked).length;

  const micSection = (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#111827]">{c.micCheckLabel}</span>
        <span className="font-mono text-[11px] font-semibold text-[#1668FF] tabular-nums">
          {c.micLevelText(micLevel)}
        </span>
      </div>

      {/* Segmented Equalizer Audio Meter */}
      <div className="flex items-center gap-1 h-7 px-2.5 rounded-xl bg-[#F4F7FC]">
        {Array.from({ length: METER_BARS }).map((_, idx) => {
          const threshold = ((idx + 1) / METER_BARS) * 100;
          const active = micTesting && micLevel >= threshold - 5;
          const isHot = idx >= METER_BARS - 3;
          return (
            <span
              key={idx}
              className={`flex-1 rounded-full transition-all duration-75 ${
                active
                  ? isHot
                    ? 'h-4 bg-[#F59E0B]'
                    : 'h-3.5 bg-[#1668FF]'
                  : 'h-1.5 bg-[#DCE4F0]'
              }`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleToggleMic}
          className={`h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
            micTesting
              ? 'bg-[#E53935] text-white'
              : 'bg-[#EEF3FF] text-[#1668FF] hover:bg-[#E1EBFF]'
          }`}
        >
          {micTesting ? (
            <Square className="w-3 h-3 fill-current" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
          <span>{micTesting ? c.stopMicTest : c.startMicTest}</span>
        </button>

        {micError && (
          <span className="text-[11px] text-[#E53935] inline-flex items-center gap-1 truncate">
            <MicOff className="w-3 h-3 shrink-0" />
            <span className="truncate">{micError}</span>
          </span>
        )}
      </div>
    </div>
  );

  const dualToneSection = (
    <div className="space-y-2.5">
      <div className="text-xs font-semibold text-[#111827]">{c.dualToneLabel}</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => playTestTone('orig')}
          className={`h-10 px-3 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            activeTone === 'orig'
              ? 'bg-[#EEF3FF] text-[#1668FF] ring-1 ring-[#1668FF]/40'
              : 'bg-[#F4F7FC] hover:bg-[#EAEFF8] text-[#111827]'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-[#1668FF] shrink-0" />
          <span className="truncate">{c.playOrigTone}</span>
        </button>
        <button
          type="button"
          onClick={() => playTestTone('interp')}
          className={`h-10 px-3 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            activeTone === 'interp'
              ? 'bg-[#ECFDF5] text-[#0F766E] ring-1 ring-[#0F766E]/40'
              : 'bg-[#F4F7FC] hover:bg-[#EAEFF8] text-[#111827]'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
          <span className="truncate">{c.playIntTone}</span>
        </button>
      </div>
    </div>
  );

  const checklistSection = (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#111827]">{c.checklistLabel}</span>
        <span className="font-mono text-[11px] font-semibold text-[#64748B] tabular-nums">
          {readyCount}/3
        </span>
      </div>

      <div className="divide-y divide-[#F1F5F9]">
        {checklistItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onUpdatePreflight({ [item.key]: !item.checked })}
            className="w-full min-h-[38px] py-1.5 flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                item.checked
                  ? 'bg-[#1668FF] text-white'
                  : 'border border-[#CBD5E1] bg-white group-hover:border-[#1668FF]'
              }`}
            >
              {item.checked && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
            </span>
            <span
              className={`text-xs leading-snug ${
                item.checked ? 'text-[#111827] font-medium' : 'text-[#64748B]'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  if (variant === 'sheet') {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end justify-center"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-7 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto -mt-1" />

          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-display font-bold text-[#111827]">{c.preflightTitle}</h3>
              <p className="text-[11px] text-[#64748B] mt-0.5 font-mono tabular-nums">
                {readyCount}/3 {c.readyLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={c.cancelBtn}
              className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-[#64748B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5 divide-y divide-[#F1F5F9]">
            <div>{micSection}</div>
            <div className="pt-4">{dualToneSection}</div>
            <div className="pt-4">{checklistSection}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-2xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer"
          >
            {c.saveEditBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-5 mt-3 rounded-2xl bg-[#FAFBFD] border border-[#E6ECF5] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#EEF2F7] bg-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-display font-bold text-[#111827]">{c.preflightTitle}</span>
          <span className="text-[11px] font-mono text-[#64748B] tabular-nums">{readyCount}/3</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={c.cancelBtn}
          className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EAEFF7] bg-white">
        <div className="p-4">{micSection}</div>
        <div className="p-4">{dualToneSection}</div>
        <div className="p-4">{checklistSection}</div>
      </div>
    </div>
  );
};
