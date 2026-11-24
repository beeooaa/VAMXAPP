import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  Bluetooth,
  Captions,
  Check,
  Mic,
  Pause,
  Play,
  SlidersHorizontal,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { AppLanguage, DeviceInfo, TranslationBlock } from '../types/vamx';
import { getLanguageOptionLabel, UI_STRINGS } from '../data/uiStrings';
import { formatDuration } from './WaveformPlayer';

interface RealTimeTranslationViewProps {
  device: DeviceInfo;
  blocks: TranslationBlock[];
  sourceLang: string;
  targetLang: string;
  audioInput: 'card' | 'phone';
  isListening: boolean;
  elapsedSec: number;
  showPip: boolean;
  autoSpeak: boolean;
  ttsRate: number;
  language?: AppLanguage;
  onChangeSourceLang: (lang: string) => void;
  onChangeTargetLang: (lang: string) => void;
  onSwapLanguages: () => void;
  onSelectAudioInput: (next: 'card' | 'phone') => void;
  onToggleListening: () => void;
  onTogglePip: () => void;
  onToggleAutoSpeak: () => void;
  onChangeTtsRate: (rate: number) => void;
  onSpeakText: (text: string) => void;
  onBack: () => void;
  onEndTranslation: () => void;
  onNotify: (msg: string) => void;
}

export const RealTimeTranslationView: React.FC<RealTimeTranslationViewProps> = ({
  device,
  blocks,
  sourceLang,
  targetLang,
  audioInput,
  isListening,
  elapsedSec,
  showPip,
  autoSpeak,
  ttsRate,
  language = 'zh',
  onChangeSourceLang,
  onChangeTargetLang,
  onSwapLanguages,
  onSelectAudioInput,
  onToggleListening,
  onTogglePip,
  onToggleAutoSpeak,
  onChangeTtsRate,
  onSpeakText,
  onBack,
  onEndTranslation,
  onNotify,
}) => {
  const tr = UI_STRINGS[language].translate;
  const [viewMode, setViewMode] = useState<'bilingual' | 'source' | 'target'>('bilingual');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'translate' | 'tts' | 'device'>('translate');
  const [onlySource, setOnlySource] = useState(false);
  const [industry, setIndustry] = useState(tr.defaultIndustry);
  const [keywords, setKeywords] = useState(tr.defaultKeywords);

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB] overflow-hidden relative">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-100 px-4 py-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              aria-label={tr.backAria}
              className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base font-display font-bold text-[#111827] truncate">
                {tr.title}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSettingsTab('device');
                  setShowSettings(true);
                }}
                className="flex items-center gap-1 text-[11px] text-[#1668FF] hover:underline truncate cursor-pointer"
              >
                {audioInput === 'card' ? (
                  <Bluetooth className="w-3 h-3 shrink-0" />
                ) : (
                  <Mic className="w-3 h-3 shrink-0" />
                )}
                <span className="truncate">
                  {audioInput === 'card' && device.bound !== false
                    ? `${device.name}${tr.switchSuffix}`
                    : `${tr.sourcePhone}${tr.switchSuffix}`}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Compact Language Pair Switcher */}
            <div className="flex items-center bg-[#F3F6FC] rounded-xl px-1.5 py-1 text-xs font-medium text-[#111827]">
              <select
                aria-label={tr.sourceLangAria}
                value={sourceLang}
                onChange={(e) => onChangeSourceLang(e.target.value)}
                className="vamx-select vamx-select--xs vamx-select--inline"
              >
                <option value="中文">{getLanguageOptionLabel('中文', language)}</option>
                <option value="英语">{getLanguageOptionLabel('英语', language)}</option>
                <option value="日语">{getLanguageOptionLabel('日语', language)}</option>
              </select>
              <button
                type="button"
                onClick={onSwapLanguages}
                aria-label={tr.swapLangAria}
                className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <select
                aria-label={tr.targetLangAria}
                value={targetLang}
                onChange={(e) => onChangeTargetLang(e.target.value)}
                className="vamx-select vamx-select--xs vamx-select--inline"
              >
                <option value="英语">{getLanguageOptionLabel('英语', language)}</option>
                <option value="中文">{getLanguageOptionLabel('中文', language)}</option>
                <option value="日语">{getLanguageOptionLabel('日语', language)}</option>
                <option value="越南语">{getLanguageOptionLabel('越南语', language)}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setSettingsTab('translate');
                setShowSettings(true);
              }}
              aria-label={tr.settingsAria}
              className="w-11 h-11 -mr-1.5 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean View Mode Tabs + Floating PiP Toggle */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-1 bg-[#F3F6FC] p-0.5 rounded-xl">
            {(
              [
                { id: 'bilingual', label: tr.modeBilingualShort },
                { id: 'source', label: tr.modeSourceShort },
                { id: 'target', label: tr.modeTargetShort },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  viewMode === tab.id
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onTogglePip}
            className={`h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showPip
                ? 'bg-[#1668FF] text-white'
                : 'bg-[#F2F5FA] text-zinc-700 hover:bg-[#E7ECF5]'
            }`}
          >
            <Captions className="w-3.5 h-3.5" />
            <span>{showPip ? tr.pipActiveBtn : tr.pipBtn}</span>
          </button>
        </div>
      </div>

      {/* Streaming Transcript Area */}
      <div className="flex-1 overflow-y-auto thin-scrollbar px-4 sm:px-6 py-4 divide-y divide-[#E6ECF5]">
        {blocks.map((block) => (
          <div key={block.id} className="py-4 first:pt-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                {block.time}
              </span>
              <button
                type="button"
                onClick={() => onSpeakText(block.translatedText)}
                className="h-7 px-2.5 rounded-lg bg-white border border-[#E5ECF5] hover:border-[#1668FF]/40 text-[11px] font-medium text-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Volume2 className="w-3 h-3" />
                <span>{tr.readAloud}</span>
              </button>
            </div>

            {viewMode !== 'target' && (
              <p className="text-sm leading-relaxed text-zinc-600">
                {block.sourceText}
              </p>
            )}

            {viewMode !== 'source' && (
              <p className="text-[15.5px] font-medium leading-relaxed text-[#111827]">
                {block.translatedText}
              </p>
            )}
          </div>
        ))}

        {isListening && (
          <div className="py-4 flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-pulse" />
            <span>
              {tr.listeningVia(
                audioInput === 'card' && device.bound !== false
                  ? device.name
                  : tr.sourcePhone
              )}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Sticky Control Dock with Direct Audio Source Switch */}
      <div className="bg-white border-t border-[#E6ECF5] px-4 sm:px-6 py-3.5 shrink-0">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2.5 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isListening ? 'bg-[#E53935] animate-pulse' : 'bg-zinc-400'
              }`}
            />
            <span className="truncate">{isListening ? tr.receivingAudio : tr.pausedAudio}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectAudioInput(audioInput === 'card' ? 'phone' : 'card')}
              className="h-7 px-2.5 rounded-lg bg-[#EEF3FF] hover:bg-[#E0EAFF] text-[11px] font-medium text-[#1668FF] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              {audioInput === 'card' ? (
                <Bluetooth className="w-3 h-3" />
              ) : (
                <Mic className="w-3 h-3" />
              )}
              <span>{audioInput === 'card' ? tr.sourceCard : tr.sourcePhone}</span>
              <ArrowLeftRight className="w-2.5 h-2.5 opacity-70" />
            </button>

            <span className="font-mono font-semibold text-[#111827] tabular-nums">
              {formatDuration(elapsedSec)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleListening}
            className="flex-1 h-11 rounded-xl border border-[#E5ECF5] bg-white hover:bg-[#F8FAFD] text-xs font-semibold text-[#111827] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isListening ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{tr.pauseCapture}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[#1668FF]" />
                <span>{tr.resumeCapture}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onEndTranslation}
            className="flex-1 h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_-4px_rgba(22,104,255,0.4)]"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{tr.endAndSave}</span>
          </button>
        </div>
      </div>

      {/* 3-Tab Translation Settings Mobile Bottom Sheet */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setShowSettings(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] bg-white rounded-t-3xl border-t border-[#E6ECF5] px-5 pt-3 pb-6 space-y-4 shadow-2xl max-h-[82%] overflow-y-auto thin-scrollbar"
          >
            <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#111827]">{tr.settingsTitle}</h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label={tr.closeSettingsAria}
                className="w-11 h-11 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 bg-[#F3F6FC] p-1 rounded-xl">
              {(
                [
                  { id: 'translate', label: tr.tabTranslate },
                  { id: 'tts', label: tr.tabTts },
                  { id: 'device', label: tr.tabDevice },
                ] as const
              ).map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setSettingsTab(tabItem.id)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    settingsTab === tabItem.id
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {settingsTab === 'translate' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#111827]">{tr.onlySourceTitle}</div>
                    <div className="text-xs text-zinc-400">{tr.onlySourceDesc}</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={onlySource}
                    onClick={() => setOnlySource((v) => !v)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      onlySource ? 'bg-[#1668FF]' : 'bg-zinc-200'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        onlySource ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-500">{tr.industryLabel}</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#1668FF]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-500">
                    {tr.keywordsLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full p-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#1668FF]"
                  />
                </div>
              </div>
            )}

            {settingsTab === 'tts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#111827]">{tr.autoSpeakTitle}</div>
                    <div className="text-xs text-zinc-400">{tr.autoSpeakDesc}</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoSpeak}
                    onClick={onToggleAutoSpeak}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      autoSpeak ? 'bg-[#1668FF]' : 'bg-zinc-200'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        autoSpeak ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-700">{tr.ttsRateLabel}</span>
                  <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
                    {[0.8, 1, 1.2, 1.5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onChangeTtsRate(r)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-xs cursor-pointer ${
                          ttsRate === r ? 'bg-white font-semibold text-[#111827]' : 'text-zinc-500'
                        }`}
                      >
                        {r}×
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'device' && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-[#64748B]">{tr.chooseSourceLabel}</div>

                <button
                  type="button"
                  onClick={() => onSelectAudioInput('phone')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    audioInput === 'phone'
                      ? 'border-[#1668FF] bg-[#F4F8FF]'
                      : 'border-[#E5ECF5] bg-white hover:bg-[#F8FAFD]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF3FF] text-[#1668FF] flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#111827]">{tr.phoneMicTitle}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{tr.phoneMicDesc}</div>
                    </div>
                  </div>
                  {audioInput === 'phone' && <Check className="w-4 h-4 text-[#1668FF] shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectAudioInput('card')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    audioInput === 'card'
                      ? 'border-[#1668FF] bg-[#F4F8FF]'
                      : 'border-[#E5ECF5] bg-white hover:bg-[#F8FAFD]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF3FF] text-[#1668FF] flex items-center justify-center shrink-0">
                      <Bluetooth className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#111827] truncate">
                        {device.bound === false ? tr.cardUnboundTitle : tr.cardBoundTitle(device.name)}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {device.bound === false
                          ? tr.cardUnboundDesc
                          : device.connected
                          ? tr.cardConnectedDesc(device.battery)
                          : tr.cardDisconnectedDesc}
                      </div>
                    </div>
                  </div>
                  {audioInput === 'card' && device.bound !== false && (
                    <Check className="w-4 h-4 text-[#1668FF] shrink-0" />
                  )}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowSettings(false);
                onNotify(tr.settingsSavedToast);
              }}
              className="w-full h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer"
            >
              {tr.doneBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
