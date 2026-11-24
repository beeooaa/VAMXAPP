import React from 'react';
import { Bluetooth, Wifi } from 'lucide-react';
import { AppLanguage, DeviceInfo } from '../types/vamx';
import { UI_STRINGS } from '../data/uiStrings';

interface DeviceCardVisualProps {
  device: DeviceInfo;
  isRecording: boolean;
  recordingSeconds: number;
  onPhysicalButtonClick: () => void;
  compact?: boolean;
  language?: AppLanguage;
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const DeviceCardVisual: React.FC<DeviceCardVisualProps> = ({
  device,
  isRecording,
  recordingSeconds,
  onPhysicalButtonClick,
  compact = false,
  language = 'zh',
}) => {
  const dv = UI_STRINGS[language].deviceVisual;
  return (
    <div className="relative select-none flex items-center justify-center">
      {/* Subtle ambient ground shadow */}
      <div
        className={`absolute w-[78%] rounded-full bg-black/15 blur-md pointer-events-none ${
          compact ? '-bottom-2 h-3.5' : '-bottom-3 h-5'
        }`}
        aria-hidden="true"
      />

      {/* Anodized Titanium Card Body */}
      <div
        className={`relative transition-transform duration-200 ease-out border flex flex-col justify-between ${
          compact
            ? 'w-[110px] [@media(min-height:740px)]:w-[132px] aspect-[1/1.44] rounded-[16px] p-3'
            : 'w-[158px] sm:w-[172px] aspect-[1/1.54] rounded-[18px] p-3.5'
        } ${
          device.connected
            ? 'bg-gradient-to-br from-[#52555A] via-[#45484D] to-[#34363A] border-white/15 shadow-[0_12px_28px_-10px_rgba(17,17,19,0.34),inset_0_1px_0_rgba(255,255,255,0.2)]'
            : 'bg-gradient-to-br from-[#8B8E94] via-[#7A7D82] to-[#686A6F] border-white/20 opacity-85 shadow-[0_10px_24px_-10px_rgba(17,17,19,0.2)]'
        }`}
      >
        {/* Subtle milled edge inset */}
        <div
          className={`absolute pointer-events-none border border-white/[0.07] ${
            compact ? 'inset-[4px] rounded-[12px]' : 'inset-[5px] rounded-[14px]'
          }`}
        />

        {/* Top OLED & Physical Button Strip */}
        <div
          className={`relative z-10 flex items-center justify-between bg-[#16171A] border border-black/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] ${
            compact ? 'gap-1.5 rounded-[9px] px-2 py-1.5' : 'gap-2 rounded-[11px] px-2.5 py-2'
          }`}
        >
          {/* OLED Screen */}
          <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
            {isRecording ? (
              <div className="flex items-center gap-1 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse shrink-0" />
                <span
                  className={`font-mono font-semibold tracking-tight tabular-nums text-white/95 ${
                    compact ? 'text-[8.5px]' : 'text-[10px]'
                  }`}
                >
                  {formatTime(recordingSeconds)}
                </span>
              </div>
            ) : device.syncing ? (
              <div className="flex items-center gap-1 text-sky-300">
                <Wifi className={compact ? 'w-2.5 h-2.5 animate-pulse' : 'w-3 h-3 animate-pulse'} />
                <span className={`font-mono tracking-wider uppercase ${compact ? 'text-[7.5px]' : 'text-[9px]'}`}>
                  SYNC
                </span>
              </div>
            ) : device.connected ? (
              <div className={`flex items-center text-sky-300/90 ${compact ? 'gap-1' : 'gap-2'}`}>
                {/* Mini Battery */}
                <div className="flex items-center">
                  <div
                    className={`rounded-[2px] border border-sky-300/70 p-[1px] flex items-center ${
                      compact ? 'w-3 h-1.5' : 'w-4 h-2'
                    }`}
                  >
                    <div
                      className="h-full bg-sky-300 rounded-[1px]"
                      style={{ width: `${Math.max(15, device.battery)}%` }}
                    />
                  </div>
                </div>
                <Bluetooth className={compact ? 'w-2 h-2 text-sky-300' : 'w-2.5 h-2.5 text-sky-300'} />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-zinc-500">
                <span className="w-2 h-0.5 rounded-full bg-zinc-600" />
                <Bluetooth className="w-2 h-2 opacity-50" />
              </div>
            )}
          </div>

          {/* Physical Tactile Record Key */}
          <button
            type="button"
            onClick={onPhysicalButtonClick}
            title={isRecording ? dv.stopHwRecTitle : dv.startHwRecTitle}
            aria-label={isRecording ? dv.stopHwRecAria : dv.startHwRecAria}
            className={`relative after:absolute after:-inset-3 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer border shrink-0 ${
              compact ? 'w-5 h-5' : 'w-7 h-7'
            } ${
              isRecording
                ? 'bg-[#EF4444]/20 border-[#EF4444]/70 text-[#EF4444]'
                : 'bg-[#26282C] border-white/15 hover:border-white/35 text-white/60'
            }`}
          >
            <span
              className={`block transition-all duration-150 ${
                isRecording
                  ? compact
                    ? 'w-1.5 h-1.5 rounded-[1.5px] bg-[#EF4444]'
                    : 'w-2.5 h-2.5 rounded-[2px] bg-[#EF4444]'
                  : compact
                  ? 'w-1.5 h-1.5 rounded-full bg-white/35'
                  : 'w-2 h-2 rounded-full bg-white/30'
              }`}
            />
          </button>
        </div>

        {/* Acoustic Micro-Mesh Texture Hint */}
        <div className="my-auto flex flex-col items-center justify-center opacity-15 pointer-events-none">
          <div className={`${compact ? 'w-6' : 'w-10'} h-[1px] bg-white mb-1`} />
          <div className={`${compact ? 'w-3.5' : 'w-6'} h-[1px] bg-white`} />
        </div>

        {/* Bottom Laser-Etched VAMX Wordmark */}
        <div className="relative z-10 flex items-end justify-between px-0.5">
          <span
            className={`font-display font-semibold tracking-[0.16em] text-white/75 ${
              compact ? 'text-[8.5px]' : 'text-[11px]'
            }`}
          >
            VAMX
          </span>
          <span className={`font-mono text-white/35 tracking-wider ${compact ? 'text-[7px]' : 'text-[8px]'}`}>
            H1
          </span>
        </div>
      </div>
    </div>
  );
};
