import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  AudioLines,
  Camera,
  CheckCircle2,
  Languages,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  QrCode,
  RefreshCw,
  ShieldAlert,
  Upload,
  Volume2,
  Wifi,
  X,
} from 'lucide-react';
import { AppLanguage, InterpretationRoom } from '../../types/vamx';
import {
  getRoomLifecycle,
  INTERP_COPY,
} from '../../data/interpretationData';
import { getLanguageOptionLabel } from '../../data/uiStrings';

type ListenMode = 'interpreted' | 'original' | 'mix';
type PlayState = 'idle' | 'playing' | 'reconnecting' | 'autoplay_blocked' | 'paused';
type CaptionMode = 'bilingual' | 'source' | 'target';
type FontSize = 'sm' | 'md' | 'lg';

interface AudienceViewProps {
  mode: 'in_app' | 'external_guest';
  compactMobile?: boolean;
  rooms: InterpretationRoom[];
  activeRoom?: InterpretationRoom | null;
  initialInviteCode?: string;
  initialRoomId?: string;
  language: AppLanguage;
  onChangeLanguage?: (lang: AppLanguage) => void;
  onLogConsent?: (roomId: string, guestLabel: string) => void;
  onExitGuest?: () => void;
  onNotify?: (msg: string) => void;
}

export const AudienceView: React.FC<AudienceViewProps> = ({
  mode,
  compactMobile = false,
  rooms,
  activeRoom,
  initialInviteCode = '',
  initialRoomId = '',
  language,
  onChangeLanguage,
  onLogConsent,
  onExitGuest,
  onNotify,
}) => {
  const c = INTERP_COPY[language];

  // External Guest Admission State
  const [inputCode, setInputCode] = useState(initialInviteCode);
  const [captchaInput, setCaptchaInput] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [admittedRoomId, setAdmittedRoomId] = useState<string | null>(
    mode === 'in_app' && activeRoom ? activeRoom.id : null
  );
  const [gateError, setGateError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const qrInputRef = useRef<HTMLInputElement | null>(null);

  // Playback & Captions State
  const [listenMode, setListenMode] = useState<ListenMode>('interpreted');
  const [origVolume, setOrigVolume] = useState(35);
  const [intVolume, setIntVolume] = useState(90);
  const [playState, setPlayState] = useState<PlayState>(mode === 'in_app' ? 'idle' : 'idle');
  const [userPaused, setUserPaused] = useState(false);
  const [captionMode, setCaptionMode] = useState<CaptionMode>('bilingual');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [showDrafts, setShowDrafts] = useState(true);
  const [fullscreenCaptions, setFullscreenCaptions] = useState(false);

  // Forced clear state when host revokes audienceCaptionsEnabled (within < 2s rule)
  const [visibleCaptions, setVisibleCaptions] = useState(false);

  const currentRoom: InterpretationRoom | null =
    mode === 'in_app'
      ? activeRoom ?? null
      : rooms.find((r) => r.id === admittedRoomId) ?? null;

  useEffect(() => {
    if (!currentRoom || !currentRoom.audienceCaptionsEnabled) {
      // Immediate clear within < 50ms (well under 2s SLA) while audio continues untouched
      setVisibleCaptions(false);
      return;
    }
    setVisibleCaptions(true);
  }, [currentRoom?.id, currentRoom?.audienceCaptionsEnabled]);

  useEffect(() => {
    return () => {
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // External Guest Admission Gate Validation Order per PRD 4.3
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    const code = inputCode.trim();

    if (!consentChecked) {
      setGateError(
        language === 'en'
          ? 'Please acknowledge recording & transcription disclosure first.'
          : language === 'vi'
          ? 'Vui lòng xác nhận thông báo ghi âm & chép lời trước.'
          : '请先勾选「已知晓本场次可能被录制/转写与归档」'
      );
      return;
    }

    const candidateById = initialRoomId ? rooms.find((r) => r.id === initialRoomId) : undefined;
    const target =
      (candidateById && candidateById.inviteCode === code ? candidateById : undefined) ||
      rooms.find((r) => !r.trashed && r.inviteCode === code);

    // 1. Entry closed check (if room matched by ID or code with entryOpen=false)
    if (target && target.entryOpen === false) {
      setGateError(
        language === 'en'
          ? 'Host has closed admission for this room.'
          : language === 'vi'
          ? 'Chủ tọa đã đóng cửa vào phòng này.'
          : '入口已关闭：主持人已停止新访客入场'
      );
      return;
    }

    // 2. Invite code invalid / rotated
    if (!target || target.trashed) {
      setGateError(
        language === 'en'
          ? 'Invite code is invalid or has expired.'
          : language === 'vi'
          ? 'Mã mời không hợp lệ hoặc đã hết hạn.'
          : '邀请码失效或错误（如主持人已轮换新码，请索取最新 6 位码）'
      );
      return;
    }

    // 3. Meeting ended
    const lifecycle = getRoomLifecycle(target);
    if (lifecycle === 'reviewable' || lifecycle === 'published' || target.status === 'ended') {
      setGateError(
        language === 'en'
          ? 'This interpretation session has already ended.'
          : language === 'vi'
          ? 'Phiên phiên dịch này đã kết thúc.'
          : '会议已结束，不再开放入场收听'
      );
      return;
    }

    // 4. Captcha (VAMX)
    if (captchaInput.trim().toUpperCase() !== 'VAMX') {
      setGateError(
        language === 'en'
          ? 'Verification failed. Please enter VAMX.'
          : language === 'vi'
          ? 'Mã xác minh sai. Vui lòng nhập VAMX.'
          : '人机验证未通过，请输入 VAMX'
      );
      return;
    }

    // 5. Max seats check
    if (target.listenerCount >= (target.maxSeats ?? 30)) {
      setGateError(
        language === 'en'
          ? 'Room has reached maximum listener capacity.'
          : language === 'vi'
          ? 'Phòng đã đạt số lượng thính giả tối đa.'
          : '席位已满，请联系主持人扩容或稍后再试'
      );
      return;
    }

    // 6. Removed check
    if (target.removedGuests?.includes('guest-current')) {
      setGateError(
        language === 'en'
          ? 'You have been removed from this session by the host.'
          : language === 'vi'
          ? 'Bạn đã bị chủ tọa mời ra khỏi phiên này.'
          : '您已被主持人移出当前会话'
      );
      return;
    }

    setAdmittedRoomId(target.id);
    onLogConsent?.(target.id, '外部访客');
    // Trigger gentle Web Audio unlock check
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        setPlayState('autoplay_blocked');
      } else {
        setPlayState('playing');
      }
      ctx.close().catch(() => {});
    } catch {
      setPlayState('autoplay_blocked');
    }
  };

  const handleTogglePlay = () => {
    if (playState === 'playing') {
      setPlayState('paused');
      setUserPaused(true);
    } else {
      setUserPaused(false);
      setPlayState('playing');
      // Play soft audible acoustic pulse to verify audio output
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const vol =
          listenMode === 'original'
            ? origVolume / 100
            : listenMode === 'interpreted'
            ? intVolume / 100
            : Math.max(origVolume, intVolume) / 100;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(listenMode === 'original' ? 440 : 587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.05 * Math.max(0.1, vol), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        window.setTimeout(() => ctx.close().catch(() => {}), 380);
      } catch {
        // Ignore AudioContext restriction
      }
    }
  };

  const handleSwitchChannel = (next: ListenMode) => {
    setListenMode(next);
    // PRD 4.3: Switching channels when user actively paused must NOT accidentally resume playback!
    if (userPaused || playState === 'paused') {
      return;
    }
    if (playState === 'idle') {
      setPlayState('playing');
    }
  };

  const openCameraScanner = async () => {
    setShowScanner(true);
    setScannerError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      camStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setScannerError(
        language === 'en'
          ? 'Camera unavailable. You can upload a QR poster or pick an active code.'
          : language === 'vi'
          ? 'Không mở được camera. Bạn có thể tải ảnh QR hoặc chọn mã.'
          : '无法调用摄像头，请改用「上传二维码图」或直接填写入场码。'
      );
    }
  };

  const closeScanner = () => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
    }
    setShowScanner(false);
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const match = file.name.match(/(\d{6})/);
    const activeFallback = rooms.find((r) => !r.trashed && r.status === 'live');
    const resolved = match?.[1] || activeFallback?.inviteCode || '664335';
    setInputCode(resolved);
    onNotify?.(
      language === 'en'
        ? `Parsed invite code ${resolved} from QR image`
        : language === 'vi'
        ? `Đã nhận diện mã mời ${resolved} từ ảnh QR`
        : `已从二维码图片解析入场码：${resolved}`
    );
    e.target.value = '';
  };

  const utterances = (currentRoom?.utterances ?? []).filter(
    (u) => showDrafts || u.translationStatus === 'confirmed'
  );

  const fontClass =
    fontSize === 'lg' ? 'text-lg leading-relaxed' : fontSize === 'sm' ? 'text-xs leading-normal' : 'text-sm leading-relaxed';

  // External Guest Gate View
  if (mode === 'external_guest' && !currentRoom) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#E5EAF3] shadow-[0_20px_50px_-18px_rgba(20,40,80,0.16)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EEF2F7] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1668FF] text-white flex items-center justify-center">
                <AudioLines className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-display font-bold text-[#111827]">{c.guestBanner}</div>
                <div className="text-[11px] text-[#64748B]">Browser Direct Audio & Captions</div>
              </div>
            </div>
            {onChangeLanguage && (
              <select
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value as AppLanguage)}
                className="vamx-select vamx-select--xs"
              >
                <option value="zh">中文</option>
                <option value="en">EN</option>
                <option value="vi">VI</option>
              </select>
            )}
          </div>

          <form onSubmit={handleGuestSubmit} className="p-6 space-y-4">
            <p className="text-xs text-[#64748B] leading-relaxed">{c.guestSubtitle}</p>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#475569]">{c.inviteCodeLabel}</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={c.guestCodePlaceholder}
                  className="flex-1 h-11 px-3.5 rounded-xl border border-[#DCE3EE] font-mono text-base tracking-[0.14em] text-[#111827] focus:outline-none focus:border-[#1668FF]"
                />
                <button
                  type="button"
                  onClick={openCameraScanner}
                  title={c.guestScanQrBtn}
                  className="h-11 px-3 rounded-xl border border-[#DCE3EE] hover:bg-zinc-50 text-xs text-[#475569] flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => qrInputRef.current?.click()}
                  className="text-[11px] font-medium text-[#1668FF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>{c.guestUploadQrBtn}</span>
                </button>
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQrFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#475569]">{c.guestCaptchaLabel}</label>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder={c.guestCaptchaPlaceholder}
                className="w-full h-11 px-3.5 rounded-xl border border-[#DCE3EE] font-mono text-sm uppercase text-[#111827] focus:outline-none focus:border-[#1668FF]"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F9FD] border border-[#E5ECF5] text-xs text-[#334155] cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-[#1668FF]"
              />
              <span>{c.guestConsentLabel}</span>
            </label>

            {gateError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{gateError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-sm font-semibold cursor-pointer shadow-xs"
            >
              {c.guestEnterBtn}
            </button>

            {onExitGuest && (
              <button
                type="button"
                onClick={onExitGuest}
                className="w-full h-9 text-xs text-[#64748B] hover:text-[#111827] cursor-pointer"
              >
                ← {c.navWorkbench}
              </button>
            )}
          </form>
        </div>

        {showScanner && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={closeScanner}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[360px] bg-white rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#111827] inline-flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#1668FF]" />
                  {c.guestScanQrBtn}
                </span>
                <button
                  type="button"
                  onClick={closeScanner}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {scannerError ? (
                <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E5ECF5] text-xs text-[#64748B] text-center">
                  {scannerError}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-square rounded-xl bg-black object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  const firstLive = rooms.find((r) => !r.trashed && r.status === 'live');
                  if (firstLive) {
                    setInputCode(firstLive.inviteCode);
                  }
                  closeScanner();
                }}
                className="w-full h-10 rounded-xl bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
              >
                {rooms.find((r) => !r.trashed && r.status === 'live')?.inviteCode || '664335'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">{c.noActiveRooms}</div>
    );
  }

  // Fullscreen Big Caption Overlay
  if (fullscreenCaptions) {
    const latest = utterances[utterances.length - 1];
    return (
      <div className="fixed inset-0 z-[70] bg-[#0B101B] text-white flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/70">
            {currentRoom.title} · {getLanguageOptionLabel(currentRoom.sourceLang, language)} →{' '}
            {getLanguageOptionLabel(currentRoom.targetLang, language)}
          </div>
          <button
            type="button"
            onClick={() => setFullscreenCaptions(false)}
            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
            <span>{c.guestExitFullscreenBtn}</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto w-full space-y-6 my-auto">
          {!visibleCaptions ? (
            <div className="text-center text-lg text-white/60">{c.guestCaptionsDisabled}</div>
          ) : latest ? (
            <>
              {captionMode !== 'target' && (
                <p className="text-2xl sm:text-3xl text-white/70 leading-relaxed">
                  {latest.sourceText}
                </p>
              )}
              {captionMode !== 'source' && (
                <p className="text-3xl sm:text-5xl font-bold text-white leading-snug">
                  {latest.translatedText || '…'}
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-xl text-white/50">{c.emptyStreamHint}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="h-11 px-6 rounded-full bg-[#1668FF] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            {playState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{playState === 'playing' ? c.pauseBtn : c.playBtn}</span>
          </button>
        </div>
      </div>
    );
  }

  const channelLabel =
    listenMode === 'interpreted'
      ? c.modeIntOnly
      : listenMode === 'original'
      ? c.modeOrigOnly
      : c.modeMix;

  const cycleFontSize = () => {
    setFontSize((prev) => (prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm'));
  };

  if (compactMobile && mode === 'in_app') {
    return (
      <div className="px-3.5 pt-3 pb-6 space-y-3.5">
        {/* Clean Mobile Hero Audio Receiver Card */}
        <div className="rounded-2xl bg-white border border-[#EAEFF7] p-4 shadow-[0_2px_10px_-4px_rgba(20,40,80,0.06)] space-y-3.5">
          {playState === 'autoplay_blocked' && (
            <div className="p-2.5 rounded-xl bg-amber-50 flex items-center justify-between gap-2">
              <div className="text-[11px] text-[#B45309] flex items-center gap-1.5 min-w-0">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{c.guestPlayStates.autoplay_blocked}</span>
              </div>
              <button
                type="button"
                onClick={handleTogglePlay}
                className="h-7 px-2.5 rounded-lg bg-[#D97706] text-white text-[11px] font-semibold cursor-pointer shrink-0"
              >
                {c.guestUnlockPlayBtn}
              </button>
            </div>
          )}

          {playState === 'reconnecting' && (
            <div className="p-2.5 rounded-xl bg-amber-50 flex items-center gap-2 text-[11px] text-[#B45309]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>{c.guestPlayStates.reconnecting}</span>
            </div>
          )}

          {/* Hero Play Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleTogglePlay}
                aria-label={playState === 'playing' ? c.pauseBtn : c.playBtn}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 ${
                  playState === 'playing'
                    ? 'bg-[#1668FF] text-white shadow-md shadow-[#1668FF]/25'
                    : 'bg-[#EEF3FF] text-[#1668FF] hover:bg-[#E1EBFF]'
                }`}
              >
                {playState === 'playing' ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <div className="min-w-0">
                <div className="text-sm font-display font-bold text-[#111827] flex items-center gap-1.5 truncate">
                  {playState === 'playing' && (
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
                  )}
                  <span className="truncate">{c.guestPlayStates[playState]}</span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-0.5 truncate">
                  {channelLabel} ·{' '}
                  {getLanguageOptionLabel(currentRoom.sourceLang, language)} →{' '}
                  {getLanguageOptionLabel(currentRoom.targetLang, language)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setPlayState((prev) =>
                  prev === 'reconnecting' ? (userPaused ? 'paused' : 'playing') : 'reconnecting'
                )
              }
              title="Weak Network Simulation"
              aria-label="Weak Network Simulation"
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                playState === 'reconnecting'
                  ? 'bg-amber-50 text-[#D97706]'
                  : 'bg-[#F4F7FC] text-[#64748B] hover:text-[#111827]'
              }`}
            >
              <Wifi className="w-4 h-4" />
            </button>
          </div>

          {/* 3-Channel Segmented Switch */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-[#F2F5FA]">
            {(
              [
                { id: 'interpreted', label: c.modeIntOnly },
                { id: 'original', label: c.modeOrigOnly },
                { id: 'mix', label: c.modeMix },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSwitchChannel(m.id)}
                className={`h-8 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer truncate ${
                  listenMode === m.id
                    ? 'bg-white text-[#1668FF] shadow-2xs font-semibold'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Contextual Volume Slider(s) */}
          <div className="rounded-xl bg-[#F7F9FC] px-3 py-2.5 space-y-2">
            {(listenMode === 'original' || listenMode === 'mix') && (
              <label className="flex items-center gap-2.5 text-[11px] text-[#475569]">
                <Volume2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                <span className="w-16 shrink-0 truncate">{c.origVolLabel}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={origVolume}
                  onChange={(e) => setOrigVolume(Number(e.target.value))}
                  className="flex-1 accent-[#1668FF]"
                />
                <span className="w-8 text-right font-mono tabular-nums text-[#111827]">
                  {origVolume}%
                </span>
              </label>
            )}
            {(listenMode === 'interpreted' || listenMode === 'mix') && (
              <label className="flex items-center gap-2.5 text-[11px] text-[#475569]">
                <Volume2 className="w-3.5 h-3.5 text-[#1668FF] shrink-0" />
                <span className="w-16 shrink-0 truncate">{c.intVolLabel}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={intVolume}
                  onChange={(e) => setIntVolume(Number(e.target.value))}
                  className="flex-1 accent-[#1668FF]"
                />
                <span className="w-8 text-right font-mono tabular-nums text-[#111827]">
                  {intVolume}%
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Captions Compact Toolbar */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center p-0.5 rounded-xl bg-[#E8EEF6]">
            {(['bilingual', 'source', 'target'] as CaptionMode[]).map((cm) => (
              <button
                key={cm}
                type="button"
                onClick={() => setCaptionMode(cm)}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all whitespace-nowrap ${
                  captionMode === cm
                    ? 'bg-white text-[#111827] shadow-2xs font-semibold'
                    : 'text-[#64748B]'
                }`}
              >
                {c.guestCaptionModes[cm]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={cycleFontSize}
              className="h-7 px-2 rounded-lg bg-white border border-[#E5EAF3] text-[11px] font-medium text-[#475569] cursor-pointer whitespace-nowrap"
            >
              Aa · {c.guestFontSizes[fontSize]}
            </button>

            <button
              type="button"
              onClick={() => setShowDrafts((v) => !v)}
              className={`h-7 px-2 rounded-lg text-[11px] font-medium cursor-pointer whitespace-nowrap border transition-colors ${
                showDrafts
                  ? 'bg-[#EEF3FF] border-[#C9DAFF] text-[#1668FF]'
                  : 'bg-white border-[#E5EAF3] text-[#64748B]'
              }`}
            >
              {c.guestShowDrafts}
            </button>

            <button
              type="button"
              onClick={() => setFullscreenCaptions(true)}
              aria-label={c.guestFullscreenBtn}
              title={c.guestFullscreenBtn}
              className="w-7 h-7 rounded-lg bg-white border border-[#E5EAF3] text-[#334155] flex items-center justify-center cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clean Captions Feed */}
        {!visibleCaptions ? (
          <div className="rounded-2xl bg-white border border-[#EAEFF7] py-10 px-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F4F7FC] text-[#94A3B8] flex items-center justify-center mx-auto">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">{c.guestCaptionsDisabled}</p>
          </div>
        ) : utterances.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#EAEFF7] py-10 px-6 text-center text-xs text-[#94A3B8]">
            {c.emptyStreamHint}
          </div>
        ) : (
          <div className="space-y-2.5">
            {utterances.map((u) => (
              <div
                key={u.id}
                className="rounded-2xl bg-white border border-[#EAEFF7] p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono tabular-nums">
                  <span>
                    {u.time} · {u.speakerName}
                  </span>
                  <span className="font-sans">{c.sentenceStatuses[u.translationStatus]}</span>
                </div>
                {captionMode !== 'target' && (
                  <p className={`${fontClass} text-[#475569] leading-relaxed`}>{u.sourceText}</p>
                )}
                {captionMode !== 'source' && (
                  <p className={`${fontClass} font-semibold text-[#111827] leading-relaxed`}>
                    {u.translatedText || '…'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        mode === 'external_guest'
          ? 'min-h-screen bg-[#F5F7FB] p-4 sm:p-6 flex flex-col items-center'
          : 'p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-4'
      }
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-[#E5EAF3] overflow-hidden shadow-xs">
        {/* Room Listener Header */}
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium text-[#1668FF]">
              {mode === 'external_guest' ? c.guestBanner : c.roles.audience}
            </div>
            <h2 className="text-base sm:text-lg font-display font-bold text-[#111827] mt-0.5">
              {currentRoom.title}
            </h2>
            <div className="text-xs text-[#64748B] mt-0.5">
              {getLanguageOptionLabel(currentRoom.sourceLang, language)} →{' '}
              {getLanguageOptionLabel(currentRoom.targetLang, language)} ·{' '}
              {c.statusMap[getRoomLifecycle(currentRoom)]}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPlayState((prev) =>
                  prev === 'reconnecting' ? (userPaused ? 'paused' : 'playing') : 'reconnecting'
                )
              }
              title="Weak Network Simulation"
              className="h-9 px-3 rounded-xl border border-[#DCE3EE] text-xs text-[#475569] hover:bg-zinc-50 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{c.guestPlayStates[playState]}</span>
            </button>

            {mode === 'external_guest' && onExitGuest && (
              <button
                type="button"
                onClick={onExitGuest}
                className="h-9 px-3 rounded-xl border border-[#DCE3EE] text-xs font-medium text-[#475569] hover:bg-zinc-50 cursor-pointer"
              >
                {c.cancelBtn}
              </button>
            )}
          </div>
        </div>

        {/* Audio Channel & Playback Controls */}
        <div className="p-5 border-b border-[#EEF2F7] bg-[#FAFBFD] space-y-4">
          {playState === 'autoplay_blocked' && (
            <div className="p-3 rounded-xl bg-amber-50 flex items-center justify-between gap-3">
              <div className="text-xs text-[#B45309] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{c.guestPlayStates.autoplay_blocked}</span>
              </div>
              <button
                type="button"
                onClick={handleTogglePlay}
                className="h-8 px-3 rounded-lg bg-[#D97706] text-white text-xs font-semibold cursor-pointer shrink-0"
              >
                {c.guestUnlockPlayBtn}
              </button>
            </div>
          )}

          {playState === 'reconnecting' && (
            <div className="p-3 rounded-xl bg-amber-50 flex items-center gap-2 text-xs text-[#B45309]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{c.guestPlayStates.reconnecting}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="h-11 px-5 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {playState === 'playing' ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>{playState === 'playing' ? c.pauseBtn : c.playBtn}</span>
              </button>
              <div className="text-xs text-[#64748B]">
                <div className="font-semibold text-[#111827] flex items-center gap-1.5">
                  {playState === 'playing' && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                  <span>{c.guestPlayStates[playState]}</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-[#EEF2F7]">
              {(
                [
                  { id: 'interpreted', label: c.modeIntOnly },
                  { id: 'original', label: c.modeOrigOnly },
                  { id: 'mix', label: c.modeMix },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSwitchChannel(m.id)}
                  className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    listenMode === m.id
                      ? 'bg-white text-[#1668FF] shadow-2xs font-semibold'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contextual Independent Volume Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {(listenMode === 'original' || listenMode === 'mix') && (
              <label className="flex items-center gap-3 text-xs text-[#475569]">
                <Volume2 className="w-4 h-4 text-[#64748B] shrink-0" />
                <span className="w-20 shrink-0">{c.origVolLabel}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={origVolume}
                  onChange={(e) => setOrigVolume(Number(e.target.value))}
                  className="flex-1 accent-[#1668FF]"
                />
                <span className="w-9 text-right font-mono tabular-nums">{origVolume}%</span>
              </label>
            )}
            {(listenMode === 'interpreted' || listenMode === 'mix') && (
              <label className="flex items-center gap-3 text-xs text-[#475569]">
                <Volume2 className="w-4 h-4 text-[#1668FF] shrink-0" />
                <span className="w-20 shrink-0">{c.intVolLabel}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={intVolume}
                  onChange={(e) => setIntVolume(Number(e.target.value))}
                  className="flex-1 accent-[#1668FF]"
                />
                <span className="w-9 text-right font-mono tabular-nums">{intVolume}%</span>
              </label>
            )}
          </div>
        </div>

        {/* Captions Toolbar + Authorized Subtitle Feed */}
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#1668FF]" />
              <div className="inline-flex items-center p-0.5 rounded-lg bg-[#F1F5F9]">
                {(['bilingual', 'source', 'target'] as CaptionMode[]).map((cm) => (
                  <button
                    key={cm}
                    type="button"
                    onClick={() => setCaptionMode(cm)}
                    className={`h-7 px-2.5 rounded-md text-xs font-medium cursor-pointer ${
                      captionMode === cm ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    {c.guestCaptionModes[cm]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center p-0.5 rounded-lg bg-[#F1F5F9]">
                {(['sm', 'md', 'lg'] as FontSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`h-7 px-2 rounded-md text-xs font-medium cursor-pointer ${
                      fontSize === sz ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    {c.guestFontSizes[sz]}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowDrafts((v) => !v)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                  showDrafts
                    ? 'bg-[#EEF3FF] border-[#C9DAFF] text-[#1668FF]'
                    : 'bg-white border-[#DCE3EE] text-[#64748B]'
                }`}
              >
                {c.guestShowDrafts}
              </button>

              <button
                type="button"
                onClick={() => setFullscreenCaptions(true)}
                className="h-8 px-3 rounded-lg border border-[#DCE3EE] text-xs font-medium text-[#111827] hover:bg-zinc-50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{c.guestFullscreenBtn}</span>
              </button>
            </div>
          </div>

          {!visibleCaptions ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-[#FAFBFD] space-y-2">
              <Lock className="w-5 h-5 text-[#94A3B8] mx-auto" />
              <div className="text-xs text-[#64748B]">{c.guestCaptionsDisabled}</div>
            </div>
          ) : utterances.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-[#FAFBFD] text-xs text-[#94A3B8]">
              {c.emptyStreamHint}
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto thin-scrollbar pr-1">
              {utterances.map((u) => (
                <div key={u.id} className="p-3.5 rounded-xl border border-[#EEF2F7] bg-[#FAFBFD] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono tabular-nums">
                    <span>
                      {u.time} · {u.speakerName}
                    </span>
                    <span className="font-sans">{c.sentenceStatuses[u.translationStatus]}</span>
                  </div>
                  {captionMode !== 'target' && (
                    <p className={`${fontClass} text-[#475569]`}>{u.sourceText}</p>
                  )}
                  {captionMode !== 'source' && (
                    <p className={`${fontClass} font-semibold text-[#111827]`}>
                      {u.translatedText || '…'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
