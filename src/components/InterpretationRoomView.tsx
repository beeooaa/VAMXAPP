import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  AudioLines,
  Ban,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit3,
  Headphones,
  History,
  Lock,
  Mic,
  MicOff,
  MoreHorizontal,
  Pause,
  PictureInPicture2,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Square,
  Unlock,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import {
  AppLanguage,
  InterpRoleView,
  InterpUtterance,
  InterpretationRoom,
  StandbyInterpreter,
} from '../types/vamx';
import {
  createAuditEntry,
  formatSecMMSS,
  getArchiveStatus,
  getRoomLifecycle,
  INTERP_COPY,
  INTERP_ORGS,
  INTERP_ROUTES,
  normalizeInterpretationRoom,
  TRIAL_SPEECH_SAMPLES,
} from '../data/interpretationData';
import { getLanguageOptionLabel } from '../data/uiStrings';
import { ArchiveWorkspace } from './interpretation/ArchiveWorkspace';
import { AudienceView } from './interpretation/AudienceView';
import { CreateRoomModal } from './interpretation/CreateRoomModal';
import { InterpreterHandoverModal } from './interpretation/InterpreterHandoverModal';
import { PreflightPanel } from './interpretation/PreflightPanel';
import { buildGuestJoinUrl, QrInviteModal } from './interpretation/QrInviteModal';

interface InterpretationRoomViewProps {
  rooms: InterpretationRoom[];
  language?: AppLanguage;
  desktopMode?: boolean;
  onBack?: () => void;
  onChangeLanguage?: (lang: AppLanguage) => void;
  onRequestDesktopMode?: () => void;
  onNavigateToAssistant?: () => void;
  onCreateRoom: (room: InterpretationRoom) => void;
  onUpdateRoom: (room: InterpretationRoom) => void;
  onDeleteRoomPermanent?: (roomId: string) => void;
  onEnterLiveTranslate?: () => void;
  onOpenGuestLanding?: (room: InterpretationRoom) => void;
  onNotify: (msg: string) => void;
}

const SPEECH_LOCALE_MAP: Record<string, string> = {
  中文: 'zh-CN',
  简体中文: 'zh-CN',
  越南语: 'vi-VN',
  英语: 'en-US',
};

export const InterpretationRoomView: React.FC<InterpretationRoomViewProps> = ({
  rooms: rawRooms,
  language = 'zh',
  desktopMode = false,
  onBack,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoomPermanent,
  onOpenGuestLanding,
  onNotify,
}) => {
  const c = INTERP_COPY[language];
  const rooms = useMemo(() => rawRooms.map(normalizeInterpretationRoom), [rawRooms]);

  // Top-level workbench states
  const [subTab, setSubTab] = useState<'live' | 'archive'>('live');
  const [mobileScreen, setMobileScreen] = useState<'lobby' | 'room'>('lobby');
  const [mobileArchiveDetailOpen, setMobileArchiveDetailOpen] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState<'org-a' | 'org-b'>('org-a');
  const [roleView, setRoleView] = useState<InterpRoleView>('host');
  const [defaultRouteId, setDefaultRouteId] = useState<'route-asean' | 'route-global'>('route-asean');
  const [crossOrgForbiddenRoom, setCrossOrgForbiddenRoom] = useState<InterpretationRoom | null>(null);
  const [showMobileSettingsSheet, setShowMobileSettingsSheet] = useState(false);
  const [showMobileInviteSheet, setShowMobileInviteSheet] = useState(false);
  const [showMobileMoreSheet, setShowMobileMoreSheet] = useState(false);
  const [roomActionConfirm, setRoomActionConfirm] = useState<{
    room: InterpretationRoom;
    kind: 'end' | 'cancel';
  } | null>(null);

  // Live control states
  const [selectedLiveRoomId, setSelectedLiveRoomId] = useState<string | null>(null);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [autoOpenArchiveDetailNonce, setAutoOpenArchiveDetailNonce] = useState(0);
  const [showPreflight, setShowPreflight] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFloatingPip, setShowFloatingPip] = useState(false);
  const [onlyTargetView, setOnlyTargetView] = useState(false);
  const [simulateDegraded, setSimulateDegraded] = useState(false);

  // Speech & input states
  const [draftInput, setDraftInput] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [pendingTranslations, setPendingTranslations] = useState(0);
  const isTranslating = pendingTranslations > 0;
  const [showTrialDropdown, setShowTrialDropdown] = useState(false);

  // Utterance inline editing & smart scroll
  const [editingUttId, setEditingUttId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const streamScrollRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);
  const [hasNewBelow, setHasNewBelow] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [qrModalRoom, setQrModalRoom] = useState<InterpretationRoom | null>(null);
  const [handoverModalRoom, setHandoverModalRoom] = useState<InterpretationRoom | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const latestRoomsRef = useRef<InterpretationRoom[]>(rooms);
  latestRoomsRef.current = rooms;
  const currentLiveRoomIdRef = useRef<string | null>(null);
  const sendUtteranceRef = useRef<(textOverride?: string) => void>(() => {});

  const activeOrg = INTERP_ORGS.find((o) => o.id === activeOrgId) || INTERP_ORGS[0];
  const actorLabel = `${activeOrg.adminName}（${c.roles[roleView]}）`;

  // Filter rooms strictly by active org (RBAC multi-tenant isolation)
  const orgRooms = useMemo(
    () => rooms.filter((r) => (r.orgId || 'org-a') === activeOrgId),
    [rooms, activeOrgId]
  );

  const activeLiveRooms = useMemo(() => {
    return orgRooms.filter((r) => {
      if (r.trashed) return false;
      const lc = getRoomLifecycle(r);
      return lc === 'upcoming' || lc === 'live' || lc === 'paused';
    });
  }, [orgRooms]);

  const pendingReviewCount = useMemo(() => {
    return orgRooms.filter((r) => {
      if (r.trashed) return false;
      const lc = getRoomLifecycle(r);
      if (lc !== 'reviewable' && lc !== 'published' && r.status !== 'ended') return false;
      return getArchiveStatus(r) !== 'published';
    }).length;
  }, [orgRooms]);

  const currentLiveRoom = useMemo(() => {
    if (crossOrgForbiddenRoom) return null;
    return activeLiveRooms.find((r) => r.id === selectedLiveRoomId) || activeLiveRooms[0] || null;
  }, [activeLiveRooms, selectedLiveRoomId, crossOrgForbiddenRoom]);
  currentLiveRoomIdRef.current = currentLiveRoom?.id ?? null;

  // Smart scroll handler
  const handleStreamScroll = () => {
    const el = streamScrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNear = distance < 48;
    nearBottomRef.current = isNear;
    if (isNear) setHasNewBelow(false);
  };

  const scrollToLatest = () => {
    const el = streamScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setHasNewBelow(false);
  };

  useEffect(() => {
    const el = streamScrollRef.current;
    if (!el) return;
    if (nearBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else if ((currentLiveRoom?.utterances?.length ?? 0) > 0) {
      setHasNewBelow(true);
    }
  }, [currentLiveRoom?.utterances?.length]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
    };
  }, []);

  // Switch org safely (clears selection & enforces 403 if probing cross-org room)
  const handleSwitchOrg = (nextOrg: 'org-a' | 'org-b') => {
    setActiveOrgId(nextOrg);
    setCrossOrgForbiddenRoom(null);
    setSelectedLiveRoomId(null);
    setSelectedArchiveId(null);
    setShowMoreMenu(false);
  };

  const updateLiveRoom = (updater: (r: InterpretationRoom) => InterpretationRoom) => {
    if (!currentLiveRoom) return;
    if (currentLiveRoom.orgId && currentLiveRoom.orgId !== activeOrgId) {
      setCrossOrgForbiddenRoom(currentLiveRoom);
      return;
    }
    onUpdateRoom(updater(currentLiveRoom));
  };

  const handleToggleBroadcast = () => {
    if (!currentLiveRoom) return;
    const lc = getRoomLifecycle(currentLiveRoom);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (lc === 'live') {
      updateLiveRoom((r) => ({
        ...r,
        status: 'paused',
        lifecycle: 'paused',
        auditLogs: [
          createAuditEntry(actorLabel, '应急暂停', '主持人手动暂停广播'),
          ...(r.auditLogs || []),
        ],
      }));
      onNotify(c.emergencyPauseBtn);
    } else {
      updateLiveRoom((r) => ({
        ...r,
        status: 'live',
        lifecycle: 'live',
        startedAt: r.startedAt || nowTime,
        auditLogs: [
          createAuditEntry(actorLabel, lc === 'paused' ? '恢复广播' : '开始同传广播', r.title),
          ...(r.auditLogs || []),
        ],
      }));
      onNotify(lc === 'paused' ? c.resumeBroadcastBtn : c.startBroadcastBtn);
    }
  };

  const getRoomCloseKind = (r: InterpretationRoom): 'end' | 'cancel' =>
    getRoomLifecycle(r) === 'upcoming' && (r.utterances || []).length === 0 ? 'cancel' : 'end';

  const handleEndMeeting = (explicitRoom?: InterpretationRoom) => {
    const target =
      explicitRoom && typeof explicitRoom === 'object' && 'id' in explicitRoom
        ? explicitRoom
        : currentLiveRoom;
    if (!target) return;
    if (target.orgId && target.orgId !== activeOrgId) {
      setCrossOrgForbiddenRoom(target);
      return;
    }
    if (isDictating && target.id === currentLiveRoom?.id) stopDictation();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endedId = target.id;
    const totalDur = Math.max(
      45,
      target.durationSec ?? 0,
      ((target.utterances || []).slice(-1)[0]?.seconds ?? 0) + 15
    );

    onUpdateRoom({
      ...target,
      status: 'ended',
      lifecycle: 'reviewable',
      archiveStatus: 'reviewable',
      entryOpen: false,
      endedAt: nowTime,
      durationSec: totalDur,
      originalSegments:
        (target.originalSegments || []).length > 0
          ? target.originalSegments
          : [
              {
                id: `${target.id}-os`,
                startSec: 0,
                endSec: totalDur,
                label: `00:00 ${target.sourceLang === '中文' ? '中文 (zh)' : target.sourceLang}`,
              },
            ],
      interpretedSegments:
        (target.interpretedSegments || []).length > 0
          ? target.interpretedSegments
          : [
              {
                id: `${target.id}-is`,
                startSec: 0,
                endSec: totalDur,
                label: `00:00 ${target.targetLang === '越南语' ? '越南语 (vi)' : target.targetLang}`,
              },
            ],
      auditLogs: [
        createAuditEntry(actorLabel, '结束会议', '已停止推流与听写，自动锁定新入场并转入归档'),
        ...(target.auditLogs || []),
      ],
    });
    setRoomActionConfirm(null);
    setShowMobileMoreSheet(false);
    setShowMobileInviteSheet(false);
    setShowMoreMenu(false);
    setSelectedArchiveId(endedId);
    setAutoOpenArchiveDetailNonce((n) => n + 1);
    setSubTab('archive');
    setMobileScreen('lobby');
    onNotify(c.endMeetingBtn);
  };

  const handleCancelUpcomingRoom = (target: InterpretationRoom) => {
    if (target.orgId && target.orgId !== activeOrgId) {
      setCrossOrgForbiddenRoom(target);
      return;
    }
    if (onDeleteRoomPermanent) {
      onDeleteRoomPermanent(target.id);
    } else {
      onUpdateRoom({ ...target, trashed: true });
    }
    if (selectedLiveRoomId === target.id) {
      setSelectedLiveRoomId(null);
    }
    setRoomActionConfirm(null);
    setShowMobileMoreSheet(false);
    setShowMobileInviteSheet(false);
    setShowMoreMenu(false);
    setMobileScreen('lobby');
    onNotify(c.cancelRoomBtn);
  };

  const handleRotateInviteCode = () => {
    if (!currentLiveRoom) return;
    const nextCode = String(Math.floor(100000 + Math.random() * 900000));
    updateLiveRoom((r) => ({
      ...r,
      inviteCode: nextCode,
      auditLogs: [
        createAuditEntry(actorLabel, '轮换邀请码', `旧码 ${r.inviteCode} 失效，新码 ${nextCode}`),
        ...(r.auditLogs || []),
      ],
    }));
    onNotify(`${c.rotateCodeBtn}: ${nextCode}`);
  };

  const handleConfirmHandover = (nextLead: StandbyInterpreter) => {
    if (!currentLiveRoom) return;
    const handoverSec = Math.max(12, ((currentLiveRoom.utterances || []).slice(-1)[0]?.seconds ?? 12) + 4);
    updateLiveRoom((r) => ({
      ...r,
      status: 'paused',
      lifecycle: 'paused',
      leadInterpreterId: nextLead.id,
      leadInterpreterName: nextLead.name,
      handoverAtSec: handoverSec,
      handoverNote: `${r.leadInterpreterName || ''} → ${nextLead.name}`,
      auditLogs: [
        createAuditEntry(
          actorLabel,
          '应急暂停并换人',
          `原主译员 ${r.leadInterpreterName} 降为替补，${nextLead.name} 升级接管（交接点 ${formatSecMMSS(
            handoverSec
          )}）`
        ),
        ...(r.auditLogs || []),
      ],
    }));
    onNotify(`${c.confirmHandoverBtn}: ${nextLead.name}`);
  };

  const requestTranslationForText = async (
    text: string,
    room: InterpretationRoom
  ): Promise<{ translation: string; terminologyMatched: string[]; failed: boolean }> => {
    if (simulateDegraded || room.aiAssistEnabled === false) {
      return { translation: '', terminologyMatched: [], failed: true };
    }
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: room.sourceLang,
          targetLang: room.targetLang,
          glossaryHints: room.glossaryHints || [],
        }),
      });
      if (!res.ok) {
        return { translation: '', terminologyMatched: [], failed: true };
      }
      const data = (await res.json()) as {
        translation?: string;
        terminologyMatched?: string[];
      };
      return {
        translation: (data.translation || '').trim(),
        terminologyMatched: Array.isArray(data.terminologyMatched) ? data.terminologyMatched : [],
        failed: !(data.translation || '').trim(),
      };
    } catch {
      return { translation: '', terminologyMatched: [], failed: true };
    }
  };

  const handleSendUtterance = async (textOverride?: string) => {
    const targetRoomId = currentLiveRoomIdRef.current || currentLiveRoom?.id;
    const latestTargetRoom =
      latestRoomsRef.current.find((r) => r.id === targetRoomId) || currentLiveRoom;
    if (!latestTargetRoom) return;
    const cleanText = (textOverride ?? draftInput).trim();
    if (!cleanText) return;

    if (!textOverride) setDraftInput('');
    setInterimText('');
    setPendingTranslations((n) => n + 1);

    const prevUtts = latestTargetRoom.utterances || [];
    const nextSec = prevUtts.length === 0 ? 5 : prevUtts[prevUtts.length - 1].seconds + 14;
    const uttId = `utt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const lc = getRoomLifecycle(latestTargetRoom);

    // Optimistic insert + auto transition 待开始 -> 直播中 on first utterance
    const pendingUtt: InterpUtterance = {
      id: uttId,
      time: formatSecMMSS(nextSec),
      seconds: nextSec,
      speakerName: latestTargetRoom.speakerName || '陈远',
      interpreterName: latestTargetRoom.leadInterpreterName || '阮氏明',
      sourceText: cleanText,
      translatedText: '',
      translationStatus: 'retranslating',
    };

    const roomSnapshot: InterpretationRoom = {
      ...latestTargetRoom,
      status: lc === 'upcoming' ? 'live' : latestTargetRoom.status,
      lifecycle: lc === 'upcoming' ? 'live' : lc,
      startedAt:
        latestTargetRoom.startedAt ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSec: Math.max(latestTargetRoom.durationSec ?? 0, nextSec + 6),
      utterances: [...prevUtts, pendingUtt],
    };
    latestRoomsRef.current = latestRoomsRef.current.map((r) =>
      r.id === roomSnapshot.id ? roomSnapshot : r
    );
    onUpdateRoom(roomSnapshot);

    const result = await requestTranslationForText(cleanText, roomSnapshot);

    const finalStatus: InterpUtterance['translationStatus'] = result.failed
      ? 'failed'
      : 'draft';

    const freshRoom =
      latestRoomsRef.current.find((r) => r.id === roomSnapshot.id) || roomSnapshot;
    const updatedRoom: InterpretationRoom = {
      ...freshRoom,
      utterances: (freshRoom.utterances || []).map((u) =>
        u.id === uttId
          ? {
              ...u,
              translatedText: result.translation,
              translationStatus: finalStatus,
              terminologyMatched: result.terminologyMatched,
            }
          : u
      ),
    };
    latestRoomsRef.current = latestRoomsRef.current.map((r) =>
      r.id === updatedRoom.id ? updatedRoom : r
    );
    onUpdateRoom(updatedRoom);

    if (result.failed) {
      onNotify(c.degradedBanner);
    }
    setPendingTranslations((n) => Math.max(0, n - 1));
  };
  sendUtteranceRef.current = handleSendUtterance;

  const handleRetranslateUtterance = async (utt: InterpUtterance) => {
    if (!currentLiveRoom) return;
    const targetId = currentLiveRoom.id;
    updateLiveRoom((r) => ({
      ...r,
      utterances: (r.utterances || []).map((u) =>
        u.id === utt.id ? { ...u, translationStatus: 'retranslating' } : u
      ),
    }));
    const result = await requestTranslationForText(utt.sourceText, currentLiveRoom);
    const freshRoom = latestRoomsRef.current.find((r) => r.id === targetId);
    if (!freshRoom) return;
    onUpdateRoom({
      ...freshRoom,
      utterances: (freshRoom.utterances || []).map((u) =>
        u.id === utt.id
          ? {
              ...u,
              translatedText: result.failed ? u.translatedText : result.translation,
              terminologyMatched: result.terminologyMatched,
              translationStatus: result.failed ? 'failed' : 'draft',
            }
          : u
      ),
    });
  };

  const handleSaveInlineTranslation = (uttId: string) => {
    const clean = editingText.trim();
    updateLiveRoom((r) => ({
      ...r,
      utterances: (r.utterances || []).map((u) =>
        u.id === uttId
          ? {
              ...u,
              translatedText: clean,
              translationStatus: 'confirmed',
            }
          : u
      ),
      auditLogs: [
        createAuditEntry(actorLabel, '编辑确认译文', clean.slice(0, 32)),
        ...(r.auditLogs || []),
      ],
    }));
    setEditingUttId(null);
    onNotify(c.saveEditBtn);
  };

  const handleSpeakSentence = (text: string, targetLang: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = SPEECH_LOCALE_MAP[targetLang] || 'zh-CN';
    window.speechSynthesis.speak(utter);
  };

  const stopDictation = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    setIsDictating(false);
    setInterimText('');
  };

  const handleToggleDictation = () => {
    if (isDictating) {
      stopDictation();
      return;
    }
    if (!currentLiveRoom) return;

    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      onNotify(c.dictationUnsupported);
      const samples = TRIAL_SPEECH_SAMPLES[currentLiveRoom.sourceLang] || TRIAL_SPEECH_SAMPLES['中文'];
      setDraftInput(samples[0]);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SpeechRec() as any;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = SPEECH_LOCALE_MAP[currentLiveRoom.sourceLang] || 'zh-CN';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalChunk += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }
      setInterimText(interim);
      if (finalChunk.trim()) {
        sendUtteranceRef.current(finalChunk.trim());
      }
    };
    rec.onerror = () => {
      setIsDictating(false);
      setInterimText('');
    };
    rec.onend = () => {
      setIsDictating(false);
      setInterimText('');
    };
    recognitionRef.current = rec;
    rec.start();
    setIsDictating(true);
  };

  const currentLifecycle = currentLiveRoom ? getRoomLifecycle(currentLiveRoom) : 'upcoming';
  const isHost = roleView === 'host';
  const canEditTranslations = roleView === 'host' || roleView === 'interpreter';
  const canSpeakSource = roleView === 'host' || roleView === 'speaker';
  const trialList =
    (currentLiveRoom && TRIAL_SPEECH_SAMPLES[currentLiveRoom.sourceLang]) ||
    TRIAL_SPEECH_SAMPLES['中文'];

  return (
    <div
      className={
        desktopMode
          ? 'bg-[#F5F7FB] text-[#111827] rounded-2xl border border-[#E5EAF3] overflow-hidden relative'
          : 'flex-1 min-h-0 flex flex-col bg-[#F5F7FB] text-[#111827] overflow-hidden relative'
      }
    >
      {!desktopMode ? (
        mobileScreen === 'lobby' ? (
          /* ================= MOBILE STAGE 1: ROOM LOBBY (进行中 / 会后归档) ================= */
          <div className="flex-1 min-h-0 flex flex-col bg-[#F5F7FB] overflow-hidden">
            {/* Lobby Top Bar & Segmented Switcher (Hidden when drilled into Archive Detail on mobile) */}
            {!(subTab === 'archive' && mobileArchiveDetailOpen) && (
              <div className="bg-white border-b border-[#EDF1F7] shrink-0">
                <div className="h-12 px-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    {onBack && (
                      <button
                        type="button"
                        onClick={onBack}
                        aria-label={c.backToLobby}
                        className="min-w-[40px] h-10 -ml-2 rounded-full hover:bg-[#F3F6FC] flex items-center justify-center text-[#111827] cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <h1 className="font-display text-base font-bold text-[#111827] truncate">
                      {c.lobbyTitle}
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMobileSettingsSheet(true)}
                    aria-label={c.globalSettingsTitle}
                    className="w-10 h-10 -mr-1.5 rounded-full hover:bg-[#F3F6FC] flex items-center justify-center text-[#475569] cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Segmented Switcher: 进行中 | 会后归档 */}
                <div className="px-4 pb-2.5 pt-0.5">
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F2F5FA]">
                    <button
                      type="button"
                      onClick={() => {
                        setSubTab('live');
                        setMobileArchiveDetailOpen(false);
                      }}
                      className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                        subTab === 'live'
                          ? 'bg-white text-[#111827] shadow-2xs'
                          : 'text-[#64748B] hover:text-[#111827]'
                      }`}
                    >
                      <AudioLines className="w-3.5 h-3.5 text-[#1668FF]" />
                      <span>{c.lobbyLiveTab(activeLiveRooms.length)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAutoOpenArchiveDetailNonce(0);
                        setSelectedArchiveId(null);
                        setMobileArchiveDetailOpen(false);
                        setSubTab('archive');
                      }}
                      className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                        subTab === 'archive'
                          ? 'bg-white text-[#111827] shadow-2xs'
                          : 'text-[#64748B] hover:text-[#111827]'
                      }`}
                    >
                      <FileTextPlaceholder />
                      <span>{c.subArchive}</span>
                      {pendingReviewCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-white text-[10px] font-mono font-bold leading-none tabular-nums">
                          {pendingReviewCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lobby Content Body */}
            {subTab === 'archive' ? (
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 pb-10">
                <ArchiveWorkspace
                  rooms={orgRooms}
                  language={language}
                  actorName={actorLabel}
                  compactMobile
                  selectedArchiveId={selectedArchiveId}
                  autoOpenDetailNonce={autoOpenArchiveDetailNonce}
                  onSelectArchiveId={setSelectedArchiveId}
                  onMobileDetailOpenChange={setMobileArchiveDetailOpen}
                  onUpdateRoom={onUpdateRoom}
                  onPermanentDeleteRoom={(id) => {
                    onDeleteRoomPermanent?.(id);
                  }}
                  onNotify={onNotify}
                />
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col relative">
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3.5 pb-24 space-y-3">
                  {crossOrgForbiddenRoom ? (
                    <div className="rounded-2xl bg-white border border-[#EAEFF7] p-6 text-center space-y-3">
                      <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-display font-bold text-[#111827]">{c.org403Title}</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">{c.org403Desc}</p>
                      <button
                        type="button"
                        onClick={() => setCrossOrgForbiddenRoom(null)}
                        className="h-9 px-4 rounded-xl bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
                      >
                        {c.backToLobby}
                      </button>
                    </div>
                  ) : activeLiveRooms.length === 0 ? (
                    <div className="rounded-2xl bg-white border border-[#EAEFF7] p-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EEF3FF] text-[#1668FF] flex items-center justify-center mx-auto">
                        <Headphones className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-[#64748B]">{c.noActiveRooms}</p>
                    </div>
                  ) : (
                    activeLiveRooms.map((r) => {
                      const lc = getRoomLifecycle(r);
                      return (
                        <div
                          key={r.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setCrossOrgForbiddenRoom(null);
                            setSelectedLiveRoomId(r.id);
                            setMobileScreen('room');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setCrossOrgForbiddenRoom(null);
                              setSelectedLiveRoomId(r.id);
                              setMobileScreen('room');
                            }
                          }}
                          className="rounded-2xl bg-white border border-[#EAEFF7] p-4 shadow-[0_2px_10px_-4px_rgba(20,40,80,0.06)] active:scale-[0.99] transition-transform cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <h3 className="text-[15px] font-display font-bold text-[#111827] leading-snug line-clamp-2 flex-1 min-w-0">
                              {r.title}
                            </h3>
                            <span
                              className={`text-xs font-semibold shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap ${
                                lc === 'live'
                                  ? 'text-[#16A34A]'
                                  : lc === 'paused'
                                  ? 'text-[#D97706]'
                                  : 'text-[#64748B]'
                              }`}
                            >
                              {lc === 'live' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                              )}
                              <span>{c.statusMap[lc]}</span>
                            </span>
                          </div>

                          {/* Clean unboxed typographic metadata */}
                          <div className="mt-1.5 text-xs text-[#64748B] flex flex-wrap items-center gap-1.5 tabular-nums">
                            <span>
                              {getLanguageOptionLabel(r.sourceLang, language)} →{' '}
                              {getLanguageOptionLabel(r.targetLang, language)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{c.seatsRatio(r.listenerCount, r.maxSeats ?? 30)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{r.routeLabel}</span>
                            {r.entryOpen === false && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#DC2626] font-medium">{c.entryClosedTag}</span>
                              </>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                            {roleView !== 'audience' ? (
                              <div
                                className="flex items-center gap-1.5 min-w-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    const url = buildGuestJoinUrl(r);
                                    const msg = `${r.title}\n${c.inviteCodeLabel}: ${r.inviteCode}\n${url}`;
                                    navigator.clipboard?.writeText(msg).catch(() => {});
                                    onNotify(`${c.copyInviteBtn}: ${r.inviteCode}`);
                                  }}
                                  className="h-8 px-2.5 rounded-lg bg-[#F4F6FA] hover:bg-[#E7ECF5] text-xs font-mono font-bold text-[#111827] inline-flex items-center gap-1.5 tabular-nums cursor-pointer"
                                >
                                  <span>{r.inviteCode}</span>
                                  <Copy className="w-3 h-3 text-[#64748B]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setQrModalRoom(r)}
                                  aria-label={c.qrBtn}
                                  className="w-8 h-8 rounded-lg bg-[#EEF3FF] text-[#1668FF] flex items-center justify-center cursor-pointer"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#94A3B8] truncate">
                                {r.speakerName} / {r.leadInterpreterName}
                              </span>
                            )}

                            <div className="flex items-center gap-2 shrink-0">
                              {isHost && (() => {
                                const closeKind = getRoomCloseKind(r);
                                return (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRoomActionConfirm({ room: r, kind: closeKind });
                                    }}
                                    className={`h-8 px-2.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                                      closeKind === 'cancel'
                                        ? 'bg-[#F4F6FA] hover:bg-red-50 text-[#475569] hover:text-[#DC2626]'
                                        : 'bg-red-50 hover:bg-red-100 text-[#DC2626]'
                                    }`}
                                  >
                                    {closeKind === 'cancel' ? c.cancelRoomBtn : c.endMeetingBtn}
                                  </button>
                                );
                              })()}
                              <span className="text-xs font-semibold text-[#1668FF] inline-flex items-center gap-0.5 whitespace-nowrap">
                                <span>{c.enterRoomBtn}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Sticky Bottom Primary CTA */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pt-4 pb-4 bg-gradient-to-t from-[#F5F7FB] via-[#F5F7FB]/95 to-transparent pointer-events-none">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="pointer-events-auto w-full h-12 rounded-2xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-sm font-semibold shadow-lg shadow-[#1668FF]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{c.newRoomBtn.replace(/^\+\s*/, '')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= MOBILE STAGE 2: IMMERSIVE LIVE ROOM STAGE ================= */
          <div className="flex-1 min-h-0 flex flex-col bg-[#F5F7FB] overflow-hidden">
            {/* Single Clean Top App Bar */}
            <header className="h-14 px-3 bg-white border-b border-[#EDF1F7] flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isDictating) stopDictation();
                  setMobileScreen('lobby');
                }}
                aria-label={c.backToLobby}
                className="min-w-[40px] h-10 -ml-1 rounded-full hover:bg-[#F3F6FC] flex items-center justify-center text-[#111827] cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-display font-bold text-[#111827] truncate leading-tight">
                  {currentLiveRoom ? currentLiveRoom.title : c.lobbyTitle}
                </h2>
                {currentLiveRoom && (
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1 truncate mt-0.5">
                    <span>
                      {getLanguageOptionLabel(currentLiveRoom.sourceLang, language)} →{' '}
                      {getLanguageOptionLabel(currentLiveRoom.targetLang, language)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        currentLifecycle === 'live'
                          ? 'text-[#16A34A]'
                          : currentLifecycle === 'paused'
                          ? 'text-[#D97706]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {c.statusMap[currentLifecycle]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#1668FF] font-medium">{c.roles[roleView]}</span>
                    {currentLiveRoom.entryOpen === false && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#DC2626] font-semibold">{c.entryClosedTag}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                {currentLiveRoom && roleView !== 'audience' && (
                  <button
                    type="button"
                    onClick={() => setShowMobileInviteSheet(true)}
                    aria-label={c.inviteSheetTitle}
                    className="w-10 h-10 rounded-full hover:bg-[#F3F6FC] flex items-center justify-center text-[#1668FF] cursor-pointer"
                  >
                    <QrCode className="w-[18px] h-[18px]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMobileMoreSheet(true)}
                  aria-label={c.moreSheetTitle}
                  className="w-10 h-10 -mr-1 rounded-full hover:bg-[#F3F6FC] flex items-center justify-center text-[#334155] cursor-pointer"
                >
                  <MoreHorizontal className="w-[18px] h-[18px]" />
                </button>
              </div>
            </header>

            {crossOrgForbiddenRoom ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-base font-display font-bold text-[#111827]">{c.org403Title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{c.org403Desc}</p>
                <button
                  type="button"
                  onClick={() => {
                    setCrossOrgForbiddenRoom(null);
                    setMobileScreen('lobby');
                  }}
                  className="h-10 px-5 rounded-xl bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
                >
                  {c.backToLobby}
                </button>
              </div>
            ) : !currentLiveRoom ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <p className="text-sm font-medium text-[#64748B]">{c.noActiveRooms}</p>
                <button
                  type="button"
                  onClick={() => setMobileScreen('lobby')}
                  className="h-10 px-5 rounded-xl bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
                >
                  {c.backToLobby}
                </button>
              </div>
            ) : roleView === 'audience' ? (
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar bg-[#F5F7FB]">
                <AudienceView
                  mode="in_app"
                  compactMobile
                  rooms={orgRooms}
                  activeRoom={currentLiveRoom}
                  language={language}
                  onNotify={onNotify}
                />
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* 1-Line Compact Broadcast Control Bar */}
                <div className="bg-white border-b border-[#EEF2F7] px-3.5 py-2 flex items-center justify-between gap-2 shrink-0">
                  <div className="min-w-0 flex-1 text-[11px] text-[#64748B] truncate">
                    {isHost ? (
                      <>
                        {currentLiveRoom.speakerName}
                        {c.speakerRoleSuffix} · {currentLiveRoom.leadInterpreterName}
                        {c.leadInterpSuffix}
                      </>
                    ) : (
                      <span>{c.roleHints[roleView]}</span>
                    )}
                  </div>

                  {isHost && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleToggleBroadcast}
                        className="h-8 px-3 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        {currentLifecycle === 'live' ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {currentLifecycle === 'live'
                            ? c.emergencyPauseBtn
                            : currentLifecycle === 'paused'
                            ? c.resumeBroadcastBtn
                            : c.startBroadcastBtn}
                        </span>
                      </button>
                      {(() => {
                        const closeKind = getRoomCloseKind(currentLiveRoom);
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              setRoomActionConfirm({ room: currentLiveRoom, kind: closeKind })
                            }
                            className={`h-8 px-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                              closeKind === 'cancel'
                                ? 'bg-[#F4F6FA] hover:bg-red-50 text-[#475569] hover:text-[#DC2626]'
                                : 'bg-red-50 hover:bg-red-100 text-[#DC2626]'
                            }`}
                          >
                            {closeKind === 'cancel' ? (
                              <X className="w-3.5 h-3.5" />
                            ) : (
                              <Square className="w-3 h-3 fill-current" />
                            )}
                            <span>{closeKind === 'cancel' ? c.cancelRoomBtn : c.endMeetingBtn}</span>
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Mobile Preflight Bottom Sheet */}
                {showPreflight && (
                  <PreflightPanel
                    room={currentLiveRoom}
                    language={language}
                    variant="sheet"
                    onUpdatePreflight={(patch) =>
                      updateLiveRoom((r) => ({
                        ...r,
                        preflight: {
                          micChecked: r.preflight?.micChecked ?? false,
                          dualToneChecked: r.preflight?.dualToneChecked ?? false,
                          rtcChecked: r.preflight?.rtcChecked ?? true,
                          ...patch,
                        },
                      }))
                    }
                    onClose={() => setShowPreflight(false)}
                    onNotify={onNotify}
                  />
                )}

                {(simulateDegraded || currentLiveRoom.aiAssistEnabled === false) && (
                  <div className="mx-3.5 mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-[11px] text-[#B45309] shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.degradedBanner}</span>
                    </div>
                    {simulateDegraded && (
                      <button
                        type="button"
                        onClick={() => setSimulateDegraded(false)}
                        className="font-semibold text-[#1668FF] shrink-0 cursor-pointer"
                      >
                        {c.moreRecoverAi}
                      </button>
                    )}
                  </div>
                )}

                {/* Clean Scrollable Bilingual Utterance Cards */}
                <div className="flex-1 min-h-0 relative flex flex-col">
                  <div
                    ref={streamScrollRef}
                    onScroll={handleStreamScroll}
                    className="flex-1 overflow-y-auto no-scrollbar px-3.5 py-3 space-y-2.5"
                  >
                    {(currentLiveRoom.utterances || []).length === 0 ? (
                      <div className="h-full min-h-[200px] flex items-center justify-center px-6 text-center text-xs text-[#94A3B8]">
                        {c.emptyStreamHint}
                      </div>
                    ) : (
                      (currentLiveRoom.utterances || []).map((utt) => (
                        <div
                          key={utt.id}
                          className="rounded-2xl bg-white border border-[#EAEFF7] p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 text-[#94A3B8] font-mono tabular-nums">
                              <span>{utt.time}</span>
                              <span>·</span>
                              <span
                                className={`font-sans font-semibold ${
                                  utt.translationStatus === 'confirmed'
                                    ? 'text-[#16A34A]'
                                    : utt.translationStatus === 'failed'
                                    ? 'text-[#DC2626]'
                                    : utt.translationStatus === 'retranslating'
                                    ? 'text-[#1668FF]'
                                    : 'text-[#D97706]'
                                }`}
                              >
                                {c.sentenceStatuses[utt.translationStatus]}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {utt.translatedText && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSpeakSentence(
                                      utt.translatedText,
                                      currentLiveRoom.targetLang
                                    )
                                  }
                                  title={c.ttsBtn}
                                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-[#64748B] hover:text-[#1668FF] cursor-pointer"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canEditTranslations && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUttId(utt.id);
                                    setEditingText(utt.translatedText);
                                  }}
                                  title={c.editBtn}
                                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-[#64748B] cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canEditTranslations && (
                                <button
                                  type="button"
                                  onClick={() => handleRetranslateUtterance(utt)}
                                  className="px-2 py-1 rounded-md bg-[#F2F5FA] text-[10px] font-medium text-[#475569] cursor-pointer"
                                >
                                  {utt.translationStatus === 'failed'
                                    ? c.retryBtn
                                    : c.retranslateBtn}
                                </button>
                              )}
                            </div>
                          </div>

                          {!onlyTargetView && (
                            <p className="text-[13px] text-[#475569] leading-relaxed">
                              {utt.sourceText}
                            </p>
                          )}

                          {editingUttId === utt.id ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                rows={2}
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-[#1668FF] text-xs focus:outline-none"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineTranslation(utt.id)}
                                  className="h-8 px-3 rounded-lg bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
                                >
                                  {c.saveEditBtn}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingUttId(null)}
                                  className="h-8 px-3 rounded-lg border border-[#DCE3EE] text-xs cursor-pointer"
                                >
                                  {c.cancelBtn}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-[#111827] leading-relaxed pt-1 border-t border-[#F4F6FA]">
                              {utt.translationStatus === 'retranslating' ? (
                                <span className="text-[#1668FF]">{c.translatingBtn}</span>
                              ) : utt.translatedText ? (
                                utt.translatedText
                              ) : (
                                <span className="text-[#DC2626] italic">{c.degradedBanner}</span>
                              )}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {hasNewBelow && (
                    <button
                      type="button"
                      onClick={scrollToLatest}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 h-8 px-3.5 rounded-full bg-[#1668FF] text-white text-[11px] font-semibold shadow-lg cursor-pointer"
                    >
                      {c.newCaptionsJump}
                    </button>
                  )}
                </div>

                {/* Docked 1-Row Speech & Input Bar */}
                <div className="bg-white border-t border-[#EAEFF7] px-3 py-2.5 shrink-0 relative">
                  {isDictating && (
                    <div className="mb-2 px-3 py-1.5 rounded-xl bg-[#EEF3FF] text-[11px] text-[#1668FF] flex items-center justify-between gap-2">
                      <span className="truncate">
                        {interimText ? interimText : c.dictationListening}
                      </span>
                      <button
                        type="button"
                        onClick={stopDictation}
                        className="font-semibold underline shrink-0 cursor-pointer"
                      >
                        {c.cancelBtn}
                      </button>
                    </div>
                  )}

                  {showTrialDropdown && (
                    <div className="absolute bottom-14 left-3 right-3 bg-white rounded-2xl border border-[#E5EAF3] shadow-xl p-1.5 z-30 space-y-1 max-h-56 overflow-y-auto">
                      {trialList.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setShowTrialDropdown(false);
                            handleSendUtterance(sample);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#F4F7FC] text-xs text-[#334155] leading-relaxed cursor-pointer"
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={!canSpeakSource}
                      onClick={handleToggleDictation}
                      title={c.dictationListening}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        isDictating
                          ? 'bg-[#E53935] text-white'
                          : 'bg-[#F2F5FA] text-[#475569] hover:text-[#1668FF]'
                      } disabled:opacity-40`}
                    >
                      {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <input
                      type="text"
                      disabled={!canSpeakSource}
                      value={draftInput}
                      onChange={(e) => setDraftInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendUtterance();
                        }
                      }}
                      placeholder={c.inputPlaceholder(
                        getLanguageOptionLabel(currentLiveRoom.sourceLang, language)
                      )}
                      className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-[#F5F7FB] border border-[#E5EAF3] text-xs text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#1668FF] disabled:bg-zinc-100"
                    />

                    <button
                      type="button"
                      disabled={!canSpeakSource}
                      onClick={() => setShowTrialDropdown((v) => !v)}
                      title={c.trialSamplesBtn}
                      className="h-10 px-2.5 rounded-xl bg-[#F2F5FA] hover:bg-[#E7ECF5] text-[11px] font-medium text-[#334155] inline-flex items-center gap-0.5 cursor-pointer shrink-0 disabled:opacity-40"
                    >
                      <span>{c.trialSamplesBtn}</span>
                      <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                    </button>

                    <button
                      type="button"
                      disabled={!canSpeakSource || isTranslating || !draftInput.trim()}
                      onClick={() => handleSendUtterance()}
                      title={c.sendTranslateBtn}
                      aria-label={c.sendTranslateBtn}
                      className="w-10 h-10 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] disabled:bg-[#CBD5E1] text-white flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <>
          {/* DESKTOP PC WORKBENCH SUB-HEADER */}
          <div className="bg-white border-b border-[#EDF1F7] shrink-0">
            <div className="px-5 h-12 flex items-center justify-between gap-2">
              <div className="inline-flex items-center p-0.5 rounded-xl bg-[#F2F5FA] shrink-0">
                <button
                  type="button"
                  onClick={() => setSubTab('live')}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                    subTab === 'live'
                      ? 'bg-white text-[#111827] shadow-2xs'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  <AudioLines className="w-3.5 h-3.5 text-[#1668FF]" />
                  <span>{c.subLiveControl}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAutoOpenArchiveDetailNonce(0);
                    setSelectedArchiveId(null);
                    setSubTab('archive');
                  }}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                    subTab === 'archive'
                      ? 'bg-white text-[#111827] shadow-2xs'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  <FileTextPlaceholder />
                  <span>{c.subArchive}</span>
                  {pendingReviewCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-white text-[10px] font-mono font-bold leading-none tabular-nums">
                      {pendingReviewCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={activeOrgId}
                  onChange={(e) => handleSwitchOrg(e.target.value as 'org-a' | 'org-b')}
                  aria-label="Organization Switcher"
                  className="h-8 px-2.5 rounded-lg border border-[#E5EAF3] text-xs bg-white text-[#334155] max-w-[165px] truncate cursor-pointer"
                >
                  {INTERP_ORGS.map((org) => (
                    <option key={org.id} value={org.id}>
                      {language === 'en' ? org.enLabel : language === 'vi' ? org.viLabel : org.zhLabel}
                    </option>
                  ))}
                </select>

                <select
                  value={defaultRouteId}
                  onChange={(e) =>
                    setDefaultRouteId(e.target.value as 'route-asean' | 'route-global')
                  }
                  aria-label={c.globalRouteLabel}
                  className="h-8 px-2.5 rounded-lg border border-[#E5EAF3] bg-white text-xs text-[#334155] max-w-[180px] truncate cursor-pointer"
                >
                  {INTERP_ROUTES.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {language === 'en' ? rt.enName : language === 'vi' ? rt.viName : rt.zhName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowAuditModal(true)}
                  title={c.auditBtn}
                  aria-label={c.auditBtn}
                  className="h-8 px-2.5 rounded-lg border border-[#E5EAF3] bg-white hover:bg-zinc-50 text-xs text-[#475569] inline-flex items-center gap-1 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{c.auditBtn}</span>
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP BODY */}
          {subTab === 'archive' ? (
            <div className="p-4 sm:p-6">
              <ArchiveWorkspace
                rooms={orgRooms}
                language={language}
                actorName={actorLabel}
                selectedArchiveId={selectedArchiveId}
                autoOpenDetailNonce={autoOpenArchiveDetailNonce}
                onSelectArchiveId={setSelectedArchiveId}
                onUpdateRoom={onUpdateRoom}
                onPermanentDeleteRoom={(id) => {
                  onDeleteRoomPermanent?.(id);
                }}
                onNotify={onNotify}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] bg-white">

          {/* DESKTOP LEFT SIDEBAR: Rooms + 6-Digit Invite/Entry Control + Role View Switch */}
          {desktopMode && (
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#E8EDF5] flex flex-col justify-between bg-[#FAFBFD]">
            <div className="divide-y divide-[#EDF2F7]">
              {/* My Active Rooms */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#64748B]">{c.myRoomsTitle}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8] tabular-nums">
                      {c.roomsCountUnit(activeLiveRooms.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      title={c.newRoomBtn}
                      aria-label={c.newRoomBtn}
                      className="w-6 h-6 rounded-md bg-[#EEF3FF] hover:bg-[#DFE9FF] text-[#1668FF] flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {activeLiveRooms.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[#DCE3EE] text-center text-xs text-[#64748B] space-y-2">
                    <p>{c.noActiveRooms}</p>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="text-[#1668FF] font-semibold hover:underline cursor-pointer"
                    >
                      {c.newRoomBtn}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[240px] overflow-y-auto thin-scrollbar">
                    {activeLiveRooms.map((r) => {
                      const lc = getRoomLifecycle(r);
                      const active = currentLiveRoom?.id === r.id;
                      return (
                        <div
                          key={r.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setCrossOrgForbiddenRoom(null);
                            setSelectedLiveRoomId(r.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setCrossOrgForbiddenRoom(null);
                              setSelectedLiveRoomId(r.id);
                            }
                          }}
                          className={`group w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            active
                              ? 'bg-[#EEF3FF] border-[#C7DAFF]'
                              : 'bg-white border-[#E8EDF5] hover:border-[#CFD9EA]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-xs font-semibold truncate ${
                                active ? 'text-[#1668FF]' : 'text-[#111827]'
                              }`}
                            >
                              {r.title}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1.5 flex-wrap">
                              <span>
                                {getLanguageOptionLabel(r.sourceLang, language)} →{' '}
                                {getLanguageOptionLabel(r.targetLang, language)}
                              </span>
                              <span>·</span>
                              <span
                                className={
                                  lc === 'live'
                                    ? 'text-[#16A34A] font-medium'
                                    : lc === 'paused'
                                    ? 'text-[#D97706] font-medium'
                                    : 'text-[#64748B]'
                                }
                              >
                                {c.statusMap[lc]}
                              </span>
                              {r.entryOpen === false && (
                                <span className="text-[#DC2626] font-medium">· {c.entryLockedState}</span>
                              )}
                            </div>
                          </div>
                          {isHost && (() => {
                            const closeKind = getRoomCloseKind(r);
                            const actionTitle =
                              closeKind === 'cancel' ? c.cancelRoomBtn : c.endMeetingBtn;
                            return (
                              <button
                                type="button"
                                title={actionTitle}
                                aria-label={`${actionTitle}: ${r.title}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRoomActionConfirm({ room: r, kind: closeKind });
                                }}
                                className="w-6 h-6 rounded-md text-[#94A3B8] hover:text-[#DC2626] hover:bg-red-50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                              >
                                {closeKind === 'cancel' ? (
                                  <X className="w-3.5 h-3.5" />
                                ) : (
                                  <Square className="w-2.5 h-2.5 fill-current" />
                                )}
                              </button>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6-Digit Invite Code & Entry Control (Hidden automatically when roleView === 'audience'!) */}
              {currentLiveRoom && roleView !== 'audience' && (
                <div className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>{c.inviteCodeLabel}</span>
                    <span className="font-mono tabular-nums">
                      {c.seatsRatio(currentLiveRoom.listenerCount, currentLiveRoom.maxSeats ?? 30)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-2xl font-bold tracking-[0.16em] text-[#111827] tabular-nums">
                      {currentLiveRoom.inviteCode}
                    </span>
                    {isHost && (
                      <button
                        type="button"
                        onClick={handleRotateInviteCode}
                        title={c.rotateCodeBtn}
                        aria-label={c.rotateCodeBtn}
                        className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-[#64748B] hover:text-[#1668FF] cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = buildGuestJoinUrl(currentLiveRoom);
                        const msg = `${currentLiveRoom.title}\n${c.inviteCodeLabel}: ${currentLiveRoom.inviteCode}\n${url}`;
                        navigator.clipboard?.writeText(msg).catch(() => {});
                        onNotify(`${c.copyInviteBtn}: ${currentLiveRoom.inviteCode}`);
                      }}
                      className="h-8 px-2 rounded-lg border border-[#DCE3EE] bg-white hover:bg-zinc-50 text-[11px] font-medium text-[#334155] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span className="truncate">{c.copyInviteBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrModalRoom(currentLiveRoom)}
                      className="h-8 px-2 rounded-lg border border-[#DCE3EE] bg-white hover:bg-zinc-50 text-[11px] font-medium text-[#1668FF] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3 h-3" />
                      <span className="truncate">{c.qrBtn}</span>
                    </button>
                  </div>

                  {isHost && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextOpen = currentLiveRoom.entryOpen === false;
                        updateLiveRoom((r) => ({
                          ...r,
                          entryOpen: nextOpen,
                          auditLogs: [
                            createAuditEntry(
                              actorLabel,
                              nextOpen ? '解锁重开入场' : '锁定新入场',
                              r.title
                            ),
                            ...(r.auditLogs || []),
                          ],
                        }));
                        onNotify(nextOpen ? c.entryOpenState : c.entryLockedState);
                      }}
                      className={`w-full h-9 px-3 rounded-xl border text-[11px] font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        currentLiveRoom.entryOpen === false
                          ? 'bg-red-50 border-red-200 text-[#DC2626] hover:bg-red-100'
                          : 'bg-[#F5F7FB] border-[#DCE3EE] text-[#334155] hover:bg-[#EAEFF7]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
                        {currentLiveRoom.entryOpen === false ? (
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 shrink-0 text-[#16A34A]" />
                        )}
                        <span className="truncate">
                          {currentLiveRoom.entryOpen === false
                            ? c.entryLockedState
                            : c.entryOpenState}
                        </span>
                      </span>
                      <span className="text-[10px] font-medium opacity-80 shrink-0">
                        {currentLiveRoom.entryOpen === false ? c.reopenEntryBtn : c.closeEntryBtn}
                      </span>
                    </button>
                  )}

                  {currentLiveRoom.entryOpen === false && (
                    <p className="text-[11px] text-[#DC2626] leading-snug">
                      {c.entryClosedTag}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom-Left Role Perspective Selector + Cross-Org RBAC Test */}
            <div className="p-4 border-t border-[#E8EDF5] bg-white space-y-2.5">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#64748B]">{c.roleViewTitle}</label>
                <select
                  value={roleView}
                  onChange={(e) => setRoleView(e.target.value as InterpRoleView)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#DCE3EE] text-xs font-medium text-[#111827] bg-white focus:outline-none focus:border-[#1668FF]"
                >
                  {(['host', 'speaker', 'interpreter', 'standby', 'audience'] as InterpRoleView[]).map(
                    (rv) => (
                      <option key={rv} value={rv}>
                        {c.roles[rv]}
                      </option>
                    )
                  )}
                </select>
                <p className="text-[11px] text-[#94A3B8] leading-snug">{c.roleHints[roleView]}</p>
              </div>

              {activeOrgId === 'org-b' && (
                <button
                  type="button"
                  onClick={() => {
                    const orgARoom = rooms.find((r) => (r.orgId || 'org-a') === 'org-a');
                    if (orgARoom) setCrossOrgForbiddenRoom(orgARoom);
                  }}
                  className="w-full h-8 px-2 rounded-lg border border-red-200 bg-red-50 text-[11px] font-medium text-[#DC2626] cursor-pointer truncate"
                >
                  403 RBAC · Org A Probe
                </button>
              )}
            </div>
          </aside>
          )}

          {/* MAIN RIGHT WORKSPACE */}
          <section className={desktopMode ? 'lg:col-span-9 flex flex-col min-h-[600px]' : 'flex-1 flex flex-col min-h-0'}>
            {crossOrgForbiddenRoom ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-base font-display font-bold text-[#111827]">{c.org403Title}</h3>
                <p className="text-xs text-[#64748B] max-w-md leading-relaxed">{c.org403Desc}</p>
                <button
                  type="button"
                  onClick={() => setCrossOrgForbiddenRoom(null)}
                  className="h-9 px-4 rounded-xl bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
                >
                  {c.myRoomsTitle}
                </button>
              </div>
            ) : !currentLiveRoom ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-3">
                <p className="text-sm font-medium text-[#64748B]">{c.noActiveRooms}</p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="h-10 px-5 rounded-xl bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
                >
                  {c.newRoomBtn}
                </button>
              </div>
            ) : roleView === 'audience' ? (
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar bg-[#F5F7FB]">
                <AudienceView
                  mode="in_app"
                  rooms={orgRooms}
                  activeRoom={currentLiveRoom}
                  language={language}
                  onNotify={onNotify}
                />
              </div>
            ) : (
              /* DESKTOP WIDE WORKBENCH LIVE CONTROL */
              <div className="flex-1 flex flex-col justify-between min-h-0">
                {/* Room Status & Toolbar Header */}
                <div>
                  <div className="px-5 py-4 border-b border-[#EEF2F7] flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-display font-bold text-[#111827] truncate">
                        {currentLiveRoom.title}
                      </h2>
                      <div className="text-xs text-[#64748B] mt-1 flex flex-wrap items-center gap-1.5">
                        <span>
                          {getLanguageOptionLabel(currentLiveRoom.sourceLang, language)} →{' '}
                          {getLanguageOptionLabel(currentLiveRoom.targetLang, language)}
                        </span>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            currentLifecycle === 'live'
                              ? 'text-[#16A34A]'
                              : currentLifecycle === 'paused'
                              ? 'text-[#D97706]'
                              : 'text-[#64748B]'
                          }`}
                        >
                          {c.statusMap[currentLifecycle]}
                        </span>
                        <span>·</span>
                        <span>
                          {currentLiveRoom.speakerName}
                          {c.speakerRoleSuffix} / {currentLiveRoom.leadInterpreterName}
                          {c.leadInterpSuffix}
                        </span>
                        <span>·</span>
                        <span className="truncate">{currentLiveRoom.routeLabel}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 relative">
                      <button
                        type="button"
                        onClick={() => setShowPreflight((v) => !v)}
                        className={`h-9 px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer ${
                          showPreflight
                            ? 'bg-[#EEF3FF] border-[#1668FF] text-[#1668FF]'
                            : 'bg-white border-[#DCE3EE] text-[#334155] hover:bg-zinc-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{c.preflightBtn}</span>
                      </button>

                      {isHost && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = !currentLiveRoom.audienceCaptionsEnabled;
                            updateLiveRoom((r) => ({
                              ...r,
                              audienceCaptionsEnabled: nextVal,
                              auditLogs: [
                                createAuditEntry(
                                  actorLabel,
                                  nextVal ? '授权听众字幕' : '撤回听众字幕',
                                  nextVal ? '听众端同步开启双语字幕' : '听众字幕已在 2s 内强制清空（音频不断流）'
                                ),
                                ...(r.auditLogs || []),
                              ],
                            }));
                            onNotify(nextVal ? c.captionsEnabled : c.captionsDefaultOff);
                          }}
                          className={`h-9 px-3 rounded-xl border text-xs font-medium cursor-pointer ${
                            currentLiveRoom.audienceCaptionsEnabled
                              ? 'bg-[#EDFDF3] border-[#BBE7CA] text-[#16A34A]'
                              : 'bg-white border-[#DCE3EE] text-[#475569] hover:bg-zinc-50'
                          }`}
                        >
                          {currentLiveRoom.audienceCaptionsEnabled
                            ? c.captionsEnabled
                            : c.captionsDefaultOff}
                        </button>
                      )}

                      {isHost && (
                        <button
                          type="button"
                          onClick={handleToggleBroadcast}
                          className="h-9 px-4 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {currentLifecycle === 'live' ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {currentLifecycle === 'live'
                              ? c.emergencyPauseBtn
                              : currentLifecycle === 'paused'
                              ? c.resumeBroadcastBtn
                              : c.startBroadcastBtn}
                          </span>
                        </button>
                      )}

                      {isHost && (() => {
                        const closeKind = getRoomCloseKind(currentLiveRoom);
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              setRoomActionConfirm({ room: currentLiveRoom, kind: closeKind })
                            }
                            className={`h-9 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                              closeKind === 'cancel'
                                ? 'bg-[#F5F7FB] hover:bg-red-50 border-[#DCE3EE] hover:border-red-200 text-[#475569] hover:text-[#DC2626]'
                                : 'bg-red-50 hover:bg-red-100 border-red-200 text-[#DC2626]'
                            }`}
                          >
                            {closeKind === 'cancel' ? (
                              <X className="w-3.5 h-3.5" />
                            ) : (
                              <Square className="w-3 h-3 fill-current" />
                            )}
                            <span>{closeKind === 'cancel' ? c.cancelRoomBtn : c.endMeetingBtn}</span>
                          </button>
                        );
                      })()}

                      {/* ··· More Controls Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowMoreMenu((v) => !v)}
                          aria-label="More Controls"
                          className="w-9 h-9 rounded-xl border border-[#DCE3EE] bg-white hover:bg-zinc-50 flex items-center justify-center text-[#334155] cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showMoreMenu && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E5EAF3] shadow-xl py-1.5 z-30 text-xs">
                            {isHost && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowMoreMenu(false);
                                  setHandoverModalRoom(currentLiveRoom);
                                }}
                                className="w-full px-4 py-2.5 text-left hover:bg-[#F6F8FC] flex items-center gap-2.5 text-[#111827] cursor-pointer"
                              >
                                <Users className="w-4 h-4 text-[#64748B]" />
                                <span>{c.moreHandover}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setShowFloatingPip((v) => !v);
                                setShowMoreMenu(false);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-[#F6F8FC] flex items-center gap-2.5 text-[#111827] cursor-pointer"
                            >
                              <PictureInPicture2 className="w-4 h-4 text-[#64748B]" />
                              <span>{showFloatingPip ? c.morePipClose : c.morePip}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOnlyTargetView((v) => !v);
                                setShowMoreMenu(false);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-[#F6F8FC] flex items-center gap-2.5 text-[#111827] cursor-pointer"
                            >
                              <AudioLines className="w-4 h-4 text-[#64748B]" />
                              <span>{onlyTargetView ? c.moreBilingual : c.moreOnlyTarget}</span>
                            </button>

                            <div className="my-1 border-t border-[#F1F5F9]" />

                            <label className="w-full px-4 py-2.5 hover:bg-[#F6F8FC] flex items-center justify-between text-[#111827] cursor-pointer">
                              <span>{c.moreAiAssist}</span>
                              <input
                                type="checkbox"
                                checked={currentLiveRoom.aiAssistEnabled !== false}
                                onChange={(e) => {
                                  updateLiveRoom((r) => ({
                                    ...r,
                                    aiAssistEnabled: e.target.checked,
                                  }));
                                }}
                                className="rounded border-zinc-300 text-[#1668FF]"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                setSimulateDegraded((v) => !v);
                                setShowMoreMenu(false);
                                onNotify(!simulateDegraded ? c.degradedBanner : c.moreRecoverAi);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-[#F6F8FC] flex items-center gap-2.5 text-[#D97706] cursor-pointer"
                            >
                              <Ban className="w-4 h-4" />
                              <span>
                                {simulateDegraded ? c.moreRecoverAi : c.moreSimulateDegrade}
                              </span>
                            </button>

                            {(currentLiveRoom.glossaryHints || []).length > 0 && (
                              <div className="mt-1 px-4 pt-2 pb-1.5 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8] leading-snug">
                                {c.glossaryPrefix}
                                {currentLiveRoom.glossaryHints!.join('、')}
                              </div>
                            )}

                            {isHost && (
                              <>
                                <div className="my-1 border-t border-[#F1F5F9]" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextOpen = currentLiveRoom.entryOpen === false;
                                    updateLiveRoom((r) => ({
                                      ...r,
                                      entryOpen: nextOpen,
                                      auditLogs: [
                                        createAuditEntry(
                                          actorLabel,
                                          nextOpen ? '解锁重开入场' : '锁定新入场',
                                          r.title
                                        ),
                                        ...(r.auditLogs || []),
                                      ],
                                    }));
                                    setShowMoreMenu(false);
                                    onNotify(nextOpen ? c.entryOpenState : c.entryLockedState);
                                  }}
                                  className="w-full px-4 py-2.5 text-left hover:bg-[#F6F8FC] flex items-center justify-between text-[#334155] cursor-pointer"
                                >
                                  <span className="inline-flex items-center gap-2.5">
                                    {currentLiveRoom.entryOpen === false ? (
                                      <Lock className="w-4 h-4 text-[#DC2626]" />
                                    ) : (
                                      <Unlock className="w-4 h-4 text-[#16A34A]" />
                                    )}
                                    <span>
                                      {currentLiveRoom.entryOpen === false
                                        ? c.reopenEntryBtn
                                        : c.closeEntryBtn}
                                    </span>
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold ${
                                      currentLiveRoom.entryOpen === false
                                        ? 'text-[#DC2626]'
                                        : 'text-[#16A34A]'
                                    }`}
                                  >
                                    {currentLiveRoom.entryOpen === false ? 'LOCKED' : 'OPEN'}
                                  </span>
                                </button>
                                {(() => {
                                  const closeKind = getRoomCloseKind(currentLiveRoom);
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowMoreMenu(false);
                                        setRoomActionConfirm({
                                          room: currentLiveRoom,
                                          kind: closeKind,
                                        });
                                      }}
                                      className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-2.5 text-[#DC2626] font-semibold cursor-pointer"
                                    >
                                      {closeKind === 'cancel' ? (
                                        <X className="w-3.5 h-3.5" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 fill-current" />
                                      )}
                                      <span>
                                        {closeKind === 'cancel' ? c.cancelRoomBtn : c.endMeetingBtn}
                                      </span>
                                    </button>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Preflight Check Panel */}
                  {showPreflight && (
                    <PreflightPanel
                      room={currentLiveRoom}
                      language={language}
                      onUpdatePreflight={(patch) =>
                        updateLiveRoom((r) => ({
                          ...r,
                          preflight: {
                            micChecked: r.preflight?.micChecked ?? false,
                            dualToneChecked: r.preflight?.dualToneChecked ?? false,
                            rtcChecked: r.preflight?.rtcChecked ?? true,
                            ...patch,
                          },
                        }))
                      }
                      onClose={() => setShowPreflight(false)}
                      onNotify={onNotify}
                    />
                  )}

                  {/* AI Degraded Warning Banner */}
                  {(simulateDegraded || currentLiveRoom.aiAssistEnabled === false) && (
                    <div className="mx-5 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-[#B45309]">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{c.degradedBanner}</span>
                      </div>
                      {simulateDegraded && (
                        <button
                          type="button"
                          onClick={() => setSimulateDegraded(false)}
                          className="text-xs font-semibold text-[#1668FF] hover:underline shrink-0 cursor-pointer"
                        >
                          {c.moreRecoverAi}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Live Bilingual Stream Table */}
                <div className="flex-1 flex flex-col p-4 sm:p-5 min-h-[360px]">
                  <div className="flex-1 rounded-2xl border border-[#E5EAF3] overflow-hidden flex flex-col relative bg-white">
                    <div
                      className={`grid ${
                        onlyTargetView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                      } border-b border-[#EEF2F7] bg-[#FAFBFD] text-xs`}
                    >
                      {!onlyTargetView && (
                        <div className="px-4 py-2.5 flex items-center justify-between md:border-r border-[#EEF2F7]">
                          <span className="font-semibold text-[#111827]">
                            {c.liveSrcHeader(getLanguageOptionLabel(currentLiveRoom.sourceLang, language))}
                          </span>
                          <span className="text-[#94A3B8]">
                            {currentLiveRoom.speakerName}
                            {c.speakerRoleSuffix}
                          </span>
                        </div>
                      )}
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="font-semibold text-[#111827]">
                          {c.liveTgtHeader(getLanguageOptionLabel(currentLiveRoom.targetLang, language))}
                        </span>
                        <span className="text-[#94A3B8]">
                          {currentLiveRoom.leadInterpreterName}
                          {c.leadInterpSuffix}
                        </span>
                      </div>
                    </div>

                    <div
                      ref={streamScrollRef}
                      onScroll={handleStreamScroll}
                      className="flex-1 max-h-[380px] overflow-y-auto thin-scrollbar divide-y divide-[#F1F5F9]"
                    >
                      {(currentLiveRoom.utterances || []).length === 0 ? (
                        <div className="h-[280px] flex items-center justify-center px-6 text-center text-xs text-[#94A3B8]">
                          {c.emptyStreamHint}
                        </div>
                      ) : (
                        (currentLiveRoom.utterances || []).map((utt) => (
                          <div
                            key={utt.id}
                            className={`grid ${
                              onlyTargetView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                            } hover:bg-[#FAFBFD] transition-colors`}
                          >
                            {!onlyTargetView && (
                              <div className="p-4 md:border-r border-[#F1F5F9] space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8] tabular-nums">
                                  <span>{utt.time}</span>
                                  <span>·</span>
                                  <span>{utt.speakerName}</span>
                                </div>
                                <p className="text-sm text-[#1E293B] leading-relaxed">
                                  {utt.sourceText}
                                </p>
                              </div>
                            )}

                            <div className="p-4 space-y-2">
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <div className="flex items-center gap-2 text-[#94A3B8] font-mono tabular-nums">
                                  <span>{utt.interpreterName}</span>
                                  <span>·</span>
                                  <span
                                    className={`font-sans font-semibold ${
                                      utt.translationStatus === 'confirmed'
                                        ? 'text-[#16A34A]'
                                        : utt.translationStatus === 'failed'
                                        ? 'text-[#DC2626]'
                                        : utt.translationStatus === 'retranslating'
                                        ? 'text-[#1668FF]'
                                        : 'text-[#D97706]'
                                    }`}
                                  >
                                    {c.sentenceStatuses[utt.translationStatus]}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {utt.translatedText && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSpeakSentence(
                                          utt.translatedText,
                                          currentLiveRoom.targetLang
                                        )
                                      }
                                      title={c.ttsBtn}
                                      className="p-1 rounded hover:bg-zinc-100 text-[#64748B] hover:text-[#1668FF] cursor-pointer"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {canEditTranslations && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingUttId(utt.id);
                                        setEditingText(utt.translatedText);
                                      }}
                                      title={c.editBtn}
                                      className="p-1 rounded hover:bg-zinc-100 text-[#64748B] hover:text-[#111827] cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {canEditTranslations && (
                                    <button
                                      type="button"
                                      onClick={() => handleRetranslateUtterance(utt)}
                                      title={c.retranslateBtn}
                                      className="px-2 py-0.5 rounded border border-[#DCE3EE] text-[11px] text-[#475569] hover:text-[#1668FF] cursor-pointer"
                                    >
                                      {utt.translationStatus === 'failed'
                                        ? c.retryBtn
                                        : c.retranslateBtn}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {editingUttId === utt.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    rows={2}
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveInlineTranslation(utt.id);
                                      }
                                    }}
                                    className="w-full p-2.5 rounded-xl border border-[#1668FF] text-sm focus:outline-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveInlineTranslation(utt.id)}
                                      className="h-7 px-3 rounded-lg bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
                                    >
                                      {c.saveEditBtn} (⌘/Ctrl+Enter)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingUttId(null)}
                                      className="h-7 px-3 rounded-lg border border-[#DCE3EE] text-xs cursor-pointer"
                                    >
                                      {c.cancelBtn}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm font-medium text-[#111827] leading-relaxed">
                                  {utt.translationStatus === 'retranslating' ? (
                                    <span className="text-[#1668FF]">{c.translatingBtn}</span>
                                  ) : utt.translatedText ? (
                                    utt.translatedText
                                  ) : (
                                    <span className="text-[#DC2626] italic">
                                      {c.degradedBanner}
                                    </span>
                                  )}
                                </p>
                              )}

                              {utt.terminologyMatched && utt.terminologyMatched.length > 0 && (
                                <div className="text-[11px] text-[#64748B]">
                                  {c.glossaryPrefix}
                                  {utt.terminologyMatched.join(' · ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {hasNewBelow && (
                      <button
                        type="button"
                        onClick={scrollToLatest}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 h-8 px-4 rounded-full bg-[#1668FF] text-white text-xs font-semibold shadow-lg cursor-pointer"
                      >
                        {c.newCaptionsJump}
                      </button>
                    )}
                  </div>

                  {/* Interim Dictation Indicator */}
                  {isDictating && (
                    <div className="mt-2 px-3 py-2 rounded-xl bg-[#EEF3FF] text-xs text-[#1668FF] flex items-center justify-between gap-2">
                      <span className="truncate">
                        {interimText ? `Interim: ${interimText}` : c.dictationListening}
                      </span>
                      <button
                        type="button"
                        onClick={stopDictation}
                        className="font-semibold underline shrink-0 cursor-pointer"
                      >
                        {c.cancelBtn}
                      </button>
                    </div>
                  )}

                  {/* Bottom Input & Speech Bar */}
                  <div className="mt-3 p-2.5 rounded-2xl border border-[#E5EAF3] bg-[#FAFBFD] flex flex-wrap sm:flex-nowrap items-center gap-2 relative">
                    <button
                      type="button"
                      disabled={!canSpeakSource}
                      onClick={handleToggleDictation}
                      title={c.dictationListening}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        isDictating
                          ? 'bg-[#E53935] border-[#E53935] text-white'
                          : 'bg-white border-[#DCE3EE] text-[#475569] hover:text-[#1668FF]'
                      } disabled:opacity-40`}
                    >
                      {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <input
                      type="text"
                      disabled={!canSpeakSource}
                      value={draftInput}
                      onChange={(e) => setDraftInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendUtterance();
                        }
                      }}
                      placeholder={c.inputPlaceholder(
                        getLanguageOptionLabel(currentLiveRoom.sourceLang, language)
                      )}
                      className="flex-1 min-w-[200px] h-10 px-3.5 rounded-xl bg-white border border-[#DCE3EE] text-xs text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1668FF] disabled:bg-zinc-100"
                    />

                    <div className="relative">
                      <button
                        type="button"
                        disabled={!canSpeakSource}
                        onClick={() => setShowTrialDropdown((v) => !v)}
                        className="h-10 px-3 rounded-xl bg-white border border-[#DCE3EE] hover:bg-zinc-50 text-xs font-medium text-[#334155] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-40"
                      >
                        <span>{c.trialSamplesBtn}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                      </button>

                      {showTrialDropdown && (
                        <div className="absolute bottom-12 right-0 w-80 bg-white rounded-2xl border border-[#E5EAF3] shadow-xl p-1.5 z-30 space-y-1">
                          {trialList.map((sample, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setShowTrialDropdown(false);
                                handleSendUtterance(sample);
                              }}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-[#F4F7FC] text-xs text-[#334155] leading-relaxed cursor-pointer"
                            >
                              {sample}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!canSpeakSource || isTranslating || !draftInput.trim()}
                      onClick={() => handleSendUtterance()}
                      className="h-10 px-4 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] disabled:bg-[#CBD5E1] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isTranslating ? c.translatingBtn : c.sendTranslateBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
          )}
        </>
      )}

      {/* MOBILE BOTTOM SHEET 1: LOBBY GLOBAL SETTINGS (Org / Default Route / Audit) */}
      {!desktopMode && showMobileSettingsSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowMobileSettingsSheet(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-7 space-y-4 shadow-2xl"
          >
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-[#111827]">
                {c.globalSettingsTitle}
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileSettingsSheet(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-[#64748B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                  Org / Tenant
                </label>
                <select
                  value={activeOrgId}
                  onChange={(e) => handleSwitchOrg(e.target.value as 'org-a' | 'org-b')}
                  className="w-full h-11 px-3 rounded-xl border border-[#DCE3EE] text-xs font-medium bg-white text-[#111827]"
                >
                  {INTERP_ORGS.map((org) => (
                    <option key={org.id} value={org.id}>
                      {language === 'en' ? org.enLabel : language === 'vi' ? org.viLabel : org.zhLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                  {c.globalRouteLabel}
                </label>
                <select
                  value={defaultRouteId}
                  onChange={(e) =>
                    setDefaultRouteId(e.target.value as 'route-asean' | 'route-global')
                  }
                  className="w-full h-11 px-3 rounded-xl border border-[#DCE3EE] text-xs font-medium bg-white text-[#111827]"
                >
                  {INTERP_ROUTES.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {language === 'en' ? rt.enName : language === 'vi' ? rt.viName : rt.zhName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowMobileSettingsSheet(false);
                  setShowAuditModal(true);
                }}
                className="w-full h-11 px-4 rounded-xl bg-[#F5F7FB] hover:bg-[#EAEFF7] text-xs font-semibold text-[#111827] flex items-center justify-between cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <History className="w-4 h-4 text-[#64748B]" />
                  <span>{c.auditTitle}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>

              {activeOrgId === 'org-b' && (
                <button
                  type="button"
                  onClick={() => {
                    const orgARoom = rooms.find((r) => (r.orgId || 'org-a') === 'org-a');
                    if (orgARoom) {
                      setShowMobileSettingsSheet(false);
                      setSubTab('live');
                      setCrossOrgForbiddenRoom(orgARoom);
                    }
                  }}
                  className="w-full h-11 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-semibold text-[#DC2626] flex items-center justify-between cursor-pointer"
                >
                  <span>403 RBAC · Org A Probe</span>
                  <ShieldAlert className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET 2: INVITE CODE & ADMISSION SHEET */}
      {!desktopMode && showMobileInviteSheet && currentLiveRoom && roleView !== 'audience' && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowMobileInviteSheet(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-7 space-y-4 shadow-2xl"
          >
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-display font-bold text-[#111827]">
                  {c.inviteSheetTitle}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5 tabular-nums">
                  {c.seatsRatio(currentLiveRoom.listenerCount, currentLiveRoom.maxSeats ?? 30)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileInviteSheet(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-[#64748B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#F5F7FB] p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-[#64748B]">{c.inviteCodeLabel}</div>
                <div className="font-mono text-3xl font-bold tracking-[0.18em] text-[#111827] tabular-nums mt-0.5">
                  {currentLiveRoom.inviteCode}
                </div>
              </div>
              {isHost && (
                <button
                  type="button"
                  onClick={handleRotateInviteCode}
                  title={c.rotateCodeBtn}
                  className="h-10 px-3 rounded-xl bg-white border border-[#DCE3EE] text-xs font-medium text-[#334155] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#1668FF]" />
                  <span>{c.rotateCodeBtn}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const url = buildGuestJoinUrl(currentLiveRoom);
                  const msg = `${currentLiveRoom.title}\n${c.inviteCodeLabel}: ${currentLiveRoom.inviteCode}\n${url}`;
                  navigator.clipboard?.writeText(msg).catch(() => {});
                  onNotify(`${c.copyInviteBtn}: ${currentLiveRoom.inviteCode}`);
                }}
                className="h-11 rounded-xl border border-[#DCE3EE] bg-white hover:bg-zinc-50 text-xs font-semibold text-[#111827] inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[#64748B]" />
                <span>{c.copyInviteBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMobileInviteSheet(false);
                  setQrModalRoom(currentLiveRoom);
                }}
                className="h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>{c.qrBtn}</span>
              </button>
            </div>

            {isHost && (
              <button
                type="button"
                onClick={() => {
                  const nextOpen = currentLiveRoom.entryOpen === false;
                  updateLiveRoom((r) => ({
                    ...r,
                    entryOpen: nextOpen,
                    auditLogs: [
                      createAuditEntry(
                        actorLabel,
                        nextOpen ? '解锁重开入场' : '锁定新入场',
                        r.title
                      ),
                      ...(r.auditLogs || []),
                    ],
                  }));
                  onNotify(nextOpen ? c.entryOpenState : c.entryLockedState);
                }}
                className={`w-full h-11 px-4 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                  currentLiveRoom.entryOpen === false
                    ? 'bg-red-50 border-red-200 text-[#DC2626]'
                    : 'bg-[#F5F7FB] border-[#DCE3EE] text-[#334155]'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {currentLiveRoom.entryOpen === false ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4 text-[#16A34A]" />
                  )}
                  <span>
                    {currentLiveRoom.entryOpen === false
                      ? c.entryLockedState
                      : c.entryOpenState}
                  </span>
                </span>
                <span className="text-[11px] opacity-80">
                  {currentLiveRoom.entryOpen === false ? c.reopenEntryBtn : c.closeEntryBtn}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET 3: ROOM CONTROLS & ROLE PERSPECTIVE */}
      {!desktopMode && showMobileMoreSheet && currentLiveRoom && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowMobileMoreSheet(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-7 space-y-4 shadow-2xl max-h-[82vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-[#111827]">
                {c.moreSheetTitle}
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileMoreSheet(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-[#64748B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role Perspective Selector */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[#64748B]">{c.roleViewTitle}</div>
              <div className="grid grid-cols-3 gap-2">
                {(['host', 'speaker', 'interpreter', 'standby', 'audience'] as InterpRoleView[]).map(
                  (rv) => {
                    const active = roleView === rv;
                    return (
                      <button
                        key={rv}
                        type="button"
                        onClick={() => {
                          setRoleView(rv);
                          setShowMobileMoreSheet(false);
                        }}
                        className={`h-10 px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer truncate ${
                          active
                            ? 'bg-[#EEF3FF] border-[#1668FF] text-[#1668FF]'
                            : 'bg-white border-[#E5EAF3] text-[#334155]'
                        }`}
                      >
                        {c.roles[rv]}
                      </button>
                    );
                  }
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-snug">{c.roleHints[roleView]}</p>
            </div>

            {roleView !== 'audience' && (
              <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreflight((v) => !v);
                    setShowMobileMoreSheet(false);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl hover:bg-[#F5F7FB] flex items-center justify-between text-xs font-medium text-[#111827] cursor-pointer"
                >
                  <span>{c.preflightBtn}</span>
                  {showPreflight && <Check className="w-4 h-4 text-[#1668FF]" />}
                </button>

                {isHost && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !currentLiveRoom.audienceCaptionsEnabled;
                        updateLiveRoom((r) => ({
                          ...r,
                          audienceCaptionsEnabled: nextVal,
                          auditLogs: [
                            createAuditEntry(
                              actorLabel,
                              nextVal ? '授权听众字幕' : '撤回听众字幕',
                              nextVal ? '听众端同步开启双语字幕' : '听众字幕已在 2s 内强制清空（音频不断流）'
                            ),
                            ...(r.auditLogs || []),
                          ],
                        }));
                        setShowMobileMoreSheet(false);
                        onNotify(nextVal ? c.captionsEnabled : c.captionsDefaultOff);
                      }}
                      className="w-full h-11 px-3.5 rounded-xl hover:bg-[#F5F7FB] flex items-center justify-between text-xs font-medium text-[#111827] cursor-pointer"
                    >
                      <span>
                        {currentLiveRoom.audienceCaptionsEnabled
                          ? c.captionsEnabled
                          : c.captionsDefaultOff}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          currentLiveRoom.audienceCaptionsEnabled ? 'bg-[#16A34A]' : 'bg-zinc-300'
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMoreSheet(false);
                        setHandoverModalRoom(currentLiveRoom);
                      }}
                      className="w-full h-11 px-3.5 rounded-xl hover:bg-[#F5F7FB] flex items-center justify-between text-xs font-medium text-[#111827] cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#64748B]" />
                        <span>{c.moreHandover}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowFloatingPip((v) => !v);
                    setShowMobileMoreSheet(false);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl hover:bg-[#F5F7FB] flex items-center justify-between text-xs font-medium text-[#111827] cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <PictureInPicture2 className="w-4 h-4 text-[#64748B]" />
                    <span>{showFloatingPip ? c.morePipClose : c.morePip}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOnlyTargetView((v) => !v);
                    setShowMobileMoreSheet(false);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl hover:bg-[#F5F7FB] flex items-center justify-between text-xs font-medium text-[#111827] cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <AudioLines className="w-4 h-4 text-[#64748B]" />
                    <span>{onlyTargetView ? c.moreBilingual : c.moreOnlyTarget}</span>
                  </span>
                </button>

                <label className="w-full h-11 px-3.5 rounded-xl hover:bg-[#F5F7FB] flex items-center justify-between text-xs font-medium text-[#111827] cursor-pointer">
                  <span>{c.moreAiAssist}</span>
                  <input
                    type="checkbox"
                    checked={currentLiveRoom.aiAssistEnabled !== false}
                    onChange={(e) => {
                      updateLiveRoom((r) => ({
                        ...r,
                        aiAssistEnabled: e.target.checked,
                      }));
                    }}
                    className="rounded border-zinc-300 text-[#1668FF]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setSimulateDegraded((v) => !v);
                    setShowMobileMoreSheet(false);
                    onNotify(!simulateDegraded ? c.degradedBanner : c.moreRecoverAi);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl hover:bg-amber-50 flex items-center gap-2 text-xs font-medium text-[#D97706] cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>{simulateDegraded ? c.moreRecoverAi : c.moreSimulateDegrade}</span>
                </button>

                {isHost && (
                  <div className="pt-2 mt-2 border-t border-[#F1F5F9] space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const nextOpen = currentLiveRoom.entryOpen === false;
                        updateLiveRoom((r) => ({
                          ...r,
                          entryOpen: nextOpen,
                          auditLogs: [
                            createAuditEntry(
                              actorLabel,
                              nextOpen ? '解锁重开入场' : '锁定新入场',
                              r.title
                            ),
                            ...(r.auditLogs || []),
                          ],
                        }));
                        setShowMobileMoreSheet(false);
                        onNotify(nextOpen ? c.entryOpenState : c.entryLockedState);
                      }}
                      className={`w-full h-11 px-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer ${
                        currentLiveRoom.entryOpen === false
                          ? 'bg-red-50 border-red-200 text-[#DC2626]'
                          : 'bg-[#F5F7FB] border-[#DCE3EE] text-[#334155]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {currentLiveRoom.entryOpen === false ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4 text-[#16A34A]" />
                        )}
                        <span>
                          {currentLiveRoom.entryOpen === false
                            ? c.entryLockedState
                            : c.entryOpenState}
                        </span>
                      </span>
                      <span className="text-[11px] opacity-80">
                        {currentLiveRoom.entryOpen === false ? c.reopenEntryBtn : c.closeEntryBtn}
                      </span>
                    </button>

                    {(() => {
                      const closeKind = getRoomCloseKind(currentLiveRoom);
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMobileMoreSheet(false);
                            setRoomActionConfirm({ room: currentLiveRoom, kind: closeKind });
                          }}
                          className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${
                            closeKind === 'cancel'
                              ? 'bg-[#F4F6FA] hover:bg-red-50 text-[#475569] hover:text-[#DC2626]'
                              : 'bg-red-50 hover:bg-red-100 text-[#DC2626]'
                          }`}
                        >
                          {closeKind === 'cancel' ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Square className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>{closeKind === 'cancel' ? c.cancelRoomBtn : c.endMeetingBtn}</span>
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* END MEETING / CANCEL UPCOMING ROOM CONFIRMATION (Mobile Bottom Sheet / Desktop Dialog) */}
      {roomActionConfirm && (
        <div
          className={`fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex justify-center ${
            desktopMode ? 'items-center p-4' : 'items-end'
          }`}
          onClick={() => setRoomActionConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={
              desktopMode
                ? 'w-full max-w-[420px] bg-white rounded-2xl border border-[#E5EAF3] p-6 space-y-4 shadow-2xl'
                : 'w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-7 space-y-4 shadow-2xl'
            }
          >
            {!desktopMode && <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto -mt-1" />}
            <div className="space-y-1.5">
              <h3 className="text-base font-display font-bold text-[#111827]">
                {roomActionConfirm.kind === 'cancel'
                  ? c.cancelRoomConfirmTitle
                  : c.endConfirmTitle}
              </h3>
              <div className="text-xs font-semibold text-[#111827] bg-[#F5F7FB] rounded-xl px-3 py-2 truncate">
                {roomActionConfirm.room.title}
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {roomActionConfirm.kind === 'cancel'
                  ? c.cancelRoomConfirmDesc
                  : c.endConfirmDesc}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setRoomActionConfirm(null)}
                className="h-11 rounded-xl border border-[#DCE3EE] bg-white hover:bg-zinc-50 text-xs font-semibold text-[#334155] cursor-pointer"
              >
                {c.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() =>
                  roomActionConfirm.kind === 'cancel'
                    ? handleCancelUpcomingRoom(roomActionConfirm.room)
                    : handleEndMeeting(roomActionConfirm.room)
                }
                className="h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold cursor-pointer"
              >
                {roomActionConfirm.kind === 'cancel'
                  ? c.cancelRoomConfirmBtn
                  : c.endConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-Right Translucent Dark Bilingual Subtitle Overlay */}
      {showFloatingPip && currentLiveRoom && (
        <div className="fixed bottom-6 right-6 z-40 w-[340px] max-w-[calc(100vw-32px)] rounded-2xl bg-[#111622]/90 backdrop-blur-xl text-white border border-white/15 p-4 shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span className="truncate font-medium">
              {currentLiveRoom.title} · {c.morePip}
            </span>
            <button
              type="button"
              onClick={() => setShowFloatingPip(false)}
              className="w-6 h-6 rounded-full hover:bg-white/15 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2 border-t border-white/10 pt-2">
            {(currentLiveRoom.utterances || []).slice(-2).length === 0 ? (
              <p className="text-xs text-white/60">{c.emptyStreamHint}</p>
            ) : (
              (currentLiveRoom.utterances || []).slice(-2).map((u) => (
                <div key={u.id} className="space-y-0.5">
                  <p className="text-[11px] text-white/65 line-clamp-1">{u.sourceText}</p>
                  <p className="text-xs font-semibold text-white line-clamp-2">
                    {u.translatedText || '…'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <CreateRoomModal
        open={showCreateModal}
        language={language}
        activeOrgId={activeOrgId}
        actorName={actorLabel}
        defaultRouteId={defaultRouteId}
        existingRoomCount={activeLiveRooms.length}
        onClose={() => setShowCreateModal(false)}
        onCreate={(room) => {
          onCreateRoom(room);
          setSubTab('live');
          setSelectedLiveRoomId(room.id);
          setMobileScreen('room');
          setShowPreflight(false);
          onNotify(c.createTitle);
        }}
      />

      <QrInviteModal
        room={qrModalRoom}
        language={language}
        onClose={() => setQrModalRoom(null)}
        onCopyUrl={(url) => {
          navigator.clipboard?.writeText(url).catch(() => {});
          onNotify(c.qrCopyLink);
        }}
        onOpenGuestPreview={(room) => {
          if (onOpenGuestLanding) {
            onOpenGuestLanding(room);
          } else {
            const url = buildGuestJoinUrl(room);
            navigator.clipboard?.writeText(url).catch(() => {});
            onNotify(c.qrCopyLink);
          }
        }}
      />

      <InterpreterHandoverModal
        room={handoverModalRoom}
        language={language}
        onClose={() => setHandoverModalRoom(null)}
        onConfirmHandover={handleConfirmHandover}
      />

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setShowAuditModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[540px] bg-white rounded-2xl border border-[#E5EAF3] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
          >
            <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-[#111827]">{c.auditTitle}</h3>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-2.5 thin-scrollbar">
              {orgRooms.flatMap((r) =>
                (r.auditLogs || []).map((log) => ({ ...log, roomTitle: r.title }))
              ).length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-6">{c.noActiveRooms}</p>
              ) : (
                orgRooms
                  .flatMap((r) =>
                    (r.auditLogs || []).map((log) => ({ ...log, roomTitle: r.title }))
                  )
                  .slice(0, 30)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[#FAFBFD] border border-[#EEF2F7] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[#64748B] font-mono">
                        <span>{log.action} · {log.roomTitle}</span>
                        <span>{log.time}</span>
                      </div>
                      <div className="text-[#111827]">{log.detail}</div>
                      <div className="text-[11px] text-[#94A3B8]">{log.actor}</div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FileTextPlaceholder: React.FC = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    className="w-3.5 h-3.5"
  >
    <rect x="2.5" y="2" width="11" height="12" rx="2" />
    <path d="M5 6h6M5 9h6M5 12h4" strokeLinecap="round" />
  </svg>
);
