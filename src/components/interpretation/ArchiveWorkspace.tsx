import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Headphones,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {
  AppLanguage,
  InterpArchiveStatus,
  InterpMinutesActionItem,
  InterpMinutesData,
  InterpretationRoom,
} from '../../types/vamx';
import {
  buildArchiveDocxHtml,
  buildArchiveSrt,
  buildArchiveTxt,
  createAuditEntry,
  formatSecMMSS,
  getArchiveStatus,
  getRoomLifecycle,
  INTERP_COPY,
} from '../../data/interpretationData';
import { getLanguageOptionLabel } from '../../data/uiStrings';
import { archiveWorkflow, areAllUtterancesConfirmed, isBlockedUtterance, isMissingMinutesField, validText } from '../../data/archiveWorkflow';
import { MinutesReader } from './MinutesReader';

interface ArchiveWorkspaceProps {
  rooms: InterpretationRoom[];
  language: AppLanguage;
  actorName: string;
  compactMobile?: boolean;
  selectedArchiveId: string | null;
  autoOpenDetailNonce?: number;
  onSelectArchiveId: (id: string | null) => void;
  onMobileDetailOpenChange?: (open: boolean) => void;
  onUpdateRoom: (room: InterpretationRoom) => void;
  onPermanentDeleteRoom: (roomId: string) => void;
  onNotify: (msg: string) => void;
}

export const ArchiveWorkspace: React.FC<ArchiveWorkspaceProps> = ({
  rooms,
  language,
  actorName,
  compactMobile = false,
  selectedArchiveId,
  autoOpenDetailNonce = 0,
  onSelectArchiveId,
  onMobileDetailOpenChange,
  onUpdateRoom,
  onPermanentDeleteRoom,
  onNotify,
}) => {
  const c = INTERP_COPY[language];
  const [mobileDetailOpen, setMobileDetailOpen] = useState(
    () => autoOpenDetailNonce > 0 && Boolean(selectedArchiveId)
  );
  const [subMode, setSubMode] = useState<'list' | 'trash'>('list');
  const lastAutoOpenNonceRef = useRef(autoOpenDetailNonce);

  useEffect(() => {
    if (autoOpenDetailNonce > 0 && autoOpenDetailNonce !== lastAutoOpenNonceRef.current && selectedArchiveId) {
      lastAutoOpenNonceRef.current = autoOpenDetailNonce;
      setSubMode('list');
      setMobileDetailOpen(true);
    } else if (autoOpenDetailNonce === 0 && !selectedArchiveId) {
      lastAutoOpenNonceRef.current = 0;
      setMobileDetailOpen(false);
    }
  }, [autoOpenDetailNonce, selectedArchiveId]);

  useEffect(() => {
    onMobileDetailOpenChange?.(mobileDetailOpen && subMode === 'list');
  }, [mobileDetailOpen, subMode, onMobileDetailOpenChange]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InterpArchiveStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | 'month'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [detailTab, setDetailTab] = useState<'playback' | 'transcript' | 'minutes'>('playback');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTimeSec, setPlayTimeSec] = useState(0);
  const [trackMode, setTrackMode] = useState<'original' | 'interpreted' | 'mix'>('interpreted');
  const [origVol, setOrigVol] = useState(40);
  const [intVol, setIntVol] = useState(90);

  const [utteranceFilter, setUtteranceFilter] = useState<'all' | 'anomalies'>('all');
  const [editingUttId, setEditingUttId] = useState<string | null>(null);
  const [editingUttDraft, setEditingUttDraft] = useState('');
  const [manualSource, setManualSource] = useState('');
  const [manualTranslation, setManualTranslation] = useState('');

  const [generatingRoomId, setGeneratingRoomId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;
  const isGeneratingMinutes = generatingRoomId !== null;
  const [newTopicText, setNewTopicText] = useState('');
  const [editingMinutes, setEditingMinutes] = useState(false);
  const [confirmPendingArchive, setConfirmPendingArchive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [focusMissingField, setFocusMissingField] = useState(false);
  const [permDeleteTarget, setPermDeleteTarget] = useState<InterpretationRoom | null>(null);

  const timerRef = useRef<number | null>(null);

  const archivedRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (r.trashed) return false;
      const lc = getRoomLifecycle(r);
      return lc === 'reviewable' || lc === 'published' || r.status === 'ended';
    });
  }, [rooms]);

  const trashedRooms = useMemo(() => rooms.filter((r) => Boolean(r.trashed)), [rooms]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = archivedRooms.filter((r) => {
      const archStatus = getArchiveStatus(r, generatingRoomId === r.id);
      if (statusFilter !== 'all' && archStatus !== statusFilter) return false;
      const today = new Date();
      const date = new Date(r.endedAt || r.createdAt);
      if (dateFilter === 'today' && date.toDateString() !== today.toDateString()) return false;
      if (dateFilter === '7d' && date.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).getTime()) return false;
      if (dateFilter === 'month' && (date.getMonth() !== today.getMonth() || date.getFullYear() !== today.getFullYear())) return false;
      if (q) {
        const hitTitle = r.title.toLowerCase().includes(q);
        const hitUtt = (r.utterances || []).some(
          (u) => u.sourceText.toLowerCase().includes(q) || u.translatedText.toLowerCase().includes(q)
        );
        if (!hitTitle && !hitUtt) return false;
      }
      return true;
    });
    return [...list].sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt)
    );
  }, [archivedRooms, statusFilter, dateFilter, search, sortOrder, generatingRoomId]);

  const filteredTrash = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trashedRooms.filter((r) => !q || r.title.toLowerCase().includes(q));
  }, [trashedRooms, search]);

  const selectedRoom = useMemo(() => {
    return (
      filteredList.find((r) => r.id === selectedArchiveId) ||
      filteredList[0] ||
      null
    );
  }, [filteredList, selectedArchiveId]);

  const duration = Math.max(10, selectedRoom?.durationSec ?? 60);
  const workflow = selectedRoom ? archiveWorkflow(selectedRoom) : null;
  const anomalyUtteranceCount = (selectedRoom?.utterances || []).filter(
    u => u.translationStatus !== 'confirmed' || isBlockedUtterance(u)
  ).length;
  useEffect(() => {
    if (detailTab !== 'minutes' || !focusMissingField) return;
    const input = [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-review-missing="true"]')].find(el => el.getClientRects().length > 0);
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
    setFocusMissingField(false);
  }, [detailTab, focusMissingField, selectedRoom?.id]);
  const busy = generatingRoomId === selectedRoom?.id || retryingId !== null;
  const invalidateText = (room: InterpretationRoom): InterpretationRoom => ({
    ...room, transcriptReviewed: false, archiveStatus: 'reviewable', minutesError: undefined,
    minutes: room.minutes ? { ...room.minutes, reviewedConfirmed: false, stale: true } : undefined,
  });

  useEffect(() => {
    setIsPlaying(false);
    setPlayTimeSec(0);
    setEditingUttId(null);
    setUtteranceFilter('all');
    setManualSource('');
    setManualTranslation('');
    setEditingMinutes(false);
    setConfirmPendingArchive(false);
    setShowHistory(false);
    setDetailTab('minutes');
  }, [selectedRoom?.id]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = window.setInterval(() => {
      setPlayTimeSec((prev) => {
        if (prev + 1 >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return prev + 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  const triggerPlayBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(trackMode === 'original' ? 392 : 523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
      window.setTimeout(() => ctx.close().catch(() => {}), 300);
    } catch {
      // Ignore
    }
  };

  const jumpToSeconds = (sec: number, switchTab = true) => {
    const clamped = Math.max(0, Math.min(duration, sec));
    setPlayTimeSec(clamped);
    setIsPlaying(true);
    triggerPlayBeep();
    if (switchTab) setDetailTab('playback');
  };

  const handleSaveUttEdit = (uttId: string) => {
    if (!selectedRoom || workflow?.locked || busy) return;
    if (!validText(editingUttDraft)) { onNotify('请填写有效译文，错误提示不能作为译文保存。'); return; }
    const nextUtterances = (selectedRoom.utterances || []).map((u) =>
      u.id === uttId
        ? {
            ...u,
            translatedText: editingUttDraft.trim(),
            translationStatus: 'confirmed' as const,
            gapResolved: u.isGap ? true : u.gapResolved,
          }
        : u
    );
    const textConfirmed = areAllUtterancesConfirmed(nextUtterances);
    onUpdateRoom({
      ...invalidateText(selectedRoom),
      utterances: nextUtterances,
      transcriptReviewed: textConfirmed,
      auditLogs: [
        createAuditEntry(actorName, textConfirmed ? '校对译文并确认文本' : '校对译文', `更新段落 ${uttId}${textConfirmed ? '，全部段落已确认' : ''}`),
        ...(selectedRoom.auditLogs || []),
      ],
    });
    setEditingUttId(null);
    onNotify(textConfirmed ? c.textConfirmedBadge : c.saveEditBtn);
  };

  const handleResolveGapSegment = (segId: string) => {
    if (!selectedRoom || workflow?.locked || busy) return;
    onUpdateRoom({
      ...selectedRoom,
      interpretedSegments: (selectedRoom.interpretedSegments || []).map((s) =>
        s.id === segId ? { ...s, resolved: true } : s
      ),
      originalSegments: (selectedRoom.originalSegments || []).map((s) => s.id === segId ? { ...s, resolved: true } : s),
      auditLogs: [
        createAuditEntry(actorName, '处理音频缺段', `标记分段 ${segId} 已解决`),
        ...(selectedRoom.auditLogs || []),
      ],
    });
    onNotify(c.resolvedTag);
  };

  const handleConfirmTranscriptAll = () => {
    if (!selectedRoom || workflow?.locked || busy || !workflow?.textReady || workflow.noTranscript) return;
    const hasMinutes = Boolean(selectedRoom.minutes);
    onUpdateRoom({
      ...selectedRoom,
      transcriptReviewed: true,
      archiveStatus: hasMinutes
        ? selectedRoom.minutes?.reviewedConfirmed
          ? 'completed'
          : 'processing'
        : 'processing',
      utterances: (selectedRoom.utterances || []).map((u) => ({
        ...u,
        translationStatus: u.translatedText ? 'confirmed' : u.translationStatus,
      })),
      auditLogs: [
        createAuditEntry(actorName, '确认文本无误', '已核对本场次原文与译文'),
        ...(selectedRoom.auditLogs || []),
      ],
    });
    onNotify(c.textConfirmedBadge);
  };

  const handleGenerateMinutes = async () => {
    if (!selectedRoom || generatingRoomId || workflow?.locked || !workflow?.textReviewed || workflow.noTranscript || busy) return;
    const targetRoom = selectedRoom;
    setGeneratingRoomId(targetRoom.id);
    try {
      const res = await fetch('/api/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: selectedRoom.title,
          sourceLang: selectedRoom.sourceLang,
          targetLang: selectedRoom.targetLang,
          uiLocale: language,
          utterances: selectedRoom.utterances || [],
        }),
      });
      if (!res.ok) {
        const errPayload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errPayload.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        summary: string;
        topics: string[];
        topicAnalyses: Array<{ topic: string; analysis: string }>;
        keyConclusions: Array<{ text: string; timestamp: string }>;
        actionItems: Array<{ task: string; owner: string; deadline: string; sourceTimestamp: string }>;
        risksAndOpenQuestions: string[];
      };

      const minutes: InterpMinutesData = {
        version: (targetRoom.minutes?.version || (targetRoom.minutes ? 1 : 0)) + 1,
        stale: false,
        summary: data.summary || '',
        topics: data.topics || [],
        topicAnalyses: data.topicAnalyses || [],
        keyConclusions: (data.keyConclusions || []).map((k, idx) => ({
          id: `kc-${Date.now()}-${idx}`,
          text: k.text,
          timestamp: k.timestamp || '00:00',
        })),
        actionItems: (data.actionItems || []).map((a, idx) => ({
          id: `act-${Date.now()}-${idx}`,
          task: a.task,
          owner: a.owner || (language === 'en' ? 'TBD' : language === 'vi' ? 'Chờ xác nhận' : '待确认'),
          deadline: a.deadline || (language === 'en' ? 'TBD' : language === 'vi' ? 'Chờ xác nhận' : '待确认'),
          sourceTimestamp: a.sourceTimestamp || '00:00',
        })),
        risksAndOpenQuestions: data.risksAndOpenQuestions || [],
        reviewedConfirmed: false,
        publishedLocked: false,
        generatedAt: new Date().toLocaleTimeString(),
      };

      if (!validText(minutes.summary)) throw new Error('未生成有效摘要，请重试或手动填写纪要。');
      const latest = roomsRef.current.find(r => r.id === targetRoom.id);
      if (!latest || latest.trashed || archiveWorkflow(latest).locked || JSON.stringify(latest.utterances) !== JSON.stringify(targetRoom.utterances)) return;
      onUpdateRoom({
        ...latest,
        minutesHistory: targetRoom.minutes ? [...(latest.minutesHistory || []), targetRoom.minutes] : latest.minutesHistory,
        minutesError: undefined,
        archiveStatus: 'reviewable',
        minutes,
        auditLogs: [
          createAuditEntry(actorName, '生成会议纪要', '已调用 AI 接口生成结构化纪要'),
          ...(targetRoom.auditLogs || []),
        ],
      });
      onNotify(c.tabMinutes);
    } catch (err) {
      const latest = roomsRef.current.find(r => r.id === targetRoom.id);
      if (latest && !archiveWorkflow(latest).locked && !latest.trashed) onUpdateRoom({ ...latest, minutesError: err instanceof Error ? err.message : '生成失败，请重试' });
      onNotify(err instanceof Error ? err.message : 'Failed to generate minutes');
    } finally {
      setGeneratingRoomId(null);
    }
  };

  const updateMinutes = (patch: Partial<InterpMinutesData>, nextArchiveStatus?: InterpArchiveStatus) => {
    setConfirmPendingArchive(false);
    if (!selectedRoom?.minutes || workflow?.locked || busy) return;
    if (patch.reviewedConfirmed && !workflow?.canReview) return;
    onUpdateRoom({
      ...selectedRoom,
      archiveStatus: nextArchiveStatus ?? 'reviewable',
      minutes: { ...selectedRoom.minutes, reviewedConfirmed: false, ...patch },
      auditLogs: patch.reviewedConfirmed ? [createAuditEntry(actorName, '确认纪要审核', '文本与纪要均通过校验，等待归档'), ...(selectedRoom.auditLogs || [])] : selectedRoom.auditLogs,
    });
  };

  const createManualMinutes = () => {
    if (!selectedRoom || workflow?.locked || !workflow?.textReviewed || busy || selectedRoom.minutes) return;
    setEditingMinutes(true);
    onUpdateRoom({ ...selectedRoom, minutesError: undefined, minutes: {
      version: 1, summary: '', topics: [], topicAnalyses: [], keyConclusions: [], actionItems: [],
      risksAndOpenQuestions: [], reviewedConfirmed: false, publishedLocked: false, generatedAt: new Date().toISOString(),
    }});
  };

  const addManualUtterance = () => {
    if (!selectedRoom || workflow?.locked || busy || !validText(manualSource) || !validText(manualTranslation)) return;
    onUpdateRoom({ ...invalidateText(selectedRoom), noTranscriptConfirmed: false,
      utterances: [...(selectedRoom.utterances || []), {
        id: `manual-${Date.now()}`, time: '00:00', seconds: 0,
        speakerName: '人工补录', interpreterName: '人工补录', sourceText: manualSource.trim(),
        translatedText: manualTranslation.trim(), translationStatus: 'draft',
      }],
      auditLogs: [createAuditEntry(actorName, '人工补录文本', '补录原文与译文，等待核对'), ...(selectedRoom.auditLogs || [])],
    });
    setManualSource(''); setManualTranslation('');
  };

  const handlePublishArchive = (confirmedPending = false) => {
    if (!selectedRoom || !workflow?.canReview || busy) return;
    if (workflow.pendingActions && !confirmedPending) { setConfirmPendingArchive(true); return; }
    setConfirmPendingArchive(false);
    setEditingMinutes(false);
    onUpdateRoom({
      ...selectedRoom,
      lifecycle: 'published',
      archivedAt: new Date().toISOString(),
      archiveStatus: 'published',
      minutes: { ...selectedRoom.minutes!, reviewedConfirmed: true, publishedLocked: true },
      auditLogs: [
        createAuditEntry(actorName, '确认发布归档', '已锁定正文与纪要'),
        ...(selectedRoom.auditLogs || []),
      ],
    });
    onNotify(c.publishedLockedBadge);
  };

  const createRevision = () => {
    if (!selectedRoom?.minutes || !workflow?.locked) return;
    onUpdateRoom({ ...selectedRoom, lifecycle: 'reviewable', archiveStatus: 'reviewable', transcriptReviewed: false, archivedAt: undefined,
      minutesHistory: [...(selectedRoom.minutesHistory || []), selectedRoom.minutes],
      minutes: { ...selectedRoom.minutes, version: (selectedRoom.minutes.version || 1) + 1, publishedLocked: false, reviewedConfirmed: false } });
    setDetailTab('minutes'); setEditingMinutes(true);
    onNotify('已创建修订草稿，原归档纪要保留在历史版本中。');
  };

  const handleRetryTranslation = async (uttId: string) => {
    if (!selectedRoom || workflow?.locked || busy) return;
    const roomId = selectedRoom.id;
    const utterance = selectedRoom.utterances?.find(u => u.id === uttId);
    if (!utterance) return;
    setRetryingId(uttId);
    try {
      const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: utterance.sourceText, sourceLang: selectedRoom.sourceLang, targetLang: selectedRoom.targetLang }) });
      const data = await response.json();
      if (!response.ok || !validText(data.translation || '')) throw new Error(data.error || '翻译失败，请手动补录或重试');
      const latest = roomsRef.current.find(r => r.id === roomId);
      if (!latest || latest.trashed || archiveWorkflow(latest).locked) return;
      onUpdateRoom({ ...invalidateText(latest), utterances: latest.utterances?.map(u => u.id === uttId ? { ...u, translatedText: data.translation, translationStatus: 'draft', gapResolved: true } : u) });
      onNotify('重译成功，请核对译文后确认文本。');
    } catch (error) { onNotify(error instanceof Error ? error.message : '翻译失败'); }
    finally { setRetryingId(null); }
  };

  const downloadBlob = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const parseTimestampSec = (ts: string): number => {
    const m = ts.match(/(\d+):(\d+)/);
    if (!m) return 0;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  };

  return (
    <div className={`${compactMobile ? 'space-y-3' : 'space-y-4'} [&_button:disabled]:opacity-40 [&_button:disabled]:cursor-not-allowed`}>
      {/* Desktop Header Row (Lightweight Trash Trigger — no double-tab bar) */}
      {!compactMobile && subMode === 'list' && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-display font-bold text-[#111827]">{c.archiveTitle}</h2>
          <button
            type="button"
            onClick={() => setSubMode('trash')}
            className="h-8 px-3 rounded-xl border border-[#E5EAF3] bg-white hover:bg-red-50 hover:border-red-200 text-xs font-medium text-[#64748B] hover:text-[#DC2626] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{c.trashTab(trashedRooms.length)}</span>
          </button>
        </div>
      )}

      {subMode === 'trash' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSubMode('list')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1668FF] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{c.archiveListTab(archivedRooms.length)}</span>
            </button>
            <span className="text-xs font-semibold text-[#64748B] tabular-nums">
              {c.trashTab(filteredTrash.length)}
            </span>
          </div>

          <p className="text-[11px] text-[#64748B] flex items-center gap-1.5 px-0.5 leading-snug">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#D97706]" />
            <span>{c.trashBanner}</span>
          </p>

          <div className="bg-white rounded-2xl border border-[#E5EAF3] overflow-hidden">
            <div className="p-3.5 border-b border-[#EEF2F7] flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={c.searchArchivePlaceholder}
                  className="w-full h-9 pl-8 pr-3 rounded-xl border border-[#DCE3EE] text-xs focus:outline-none focus:border-[#1668FF]"
                />
              </div>
            </div>

            {filteredTrash.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">{c.noActiveRooms}</div>
            ) : (
              <div className="divide-y divide-[#EEF2F7]">
                {filteredTrash.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-[#FAFBFD]"
                  >
                    <div>
                      <div className="text-sm font-display font-bold text-[#111827]">{r.title}</div>
                      <div className="text-xs text-[#64748B] mt-1 flex items-center gap-2 tabular-nums">
                        <span className="text-[#DC2626] font-medium">
                          {c.retentionDays(r.retentionDaysLeft ?? 7)}
                        </span>
                        <span>·</span>
                        <span>{r.createdAt}</span>
                        <span>·</span>
                        <span>
                          {getLanguageOptionLabel(r.sourceLang, language)} →{' '}
                          {getLanguageOptionLabel(r.targetLang, language)}
                        </span>
                        <span>·</span>
                        <span>{formatSecMMSS(r.durationSec ?? 40)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateRoom({
                            ...r,
                            trashed: false,
                            auditLogs: [
                              createAuditEntry(actorName, '从回收站恢复', r.title),
                              ...(r.auditLogs || []),
                            ],
                          });
                          onNotify(c.restoreArchiveBtn);
                        }}
                        className="h-9 px-3.5 rounded-xl bg-[#EEF3FF] hover:bg-[#E1EBFF] text-[#1668FF] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{c.restoreArchiveBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPermDeleteTarget(r)}
                        className="h-9 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{c.permDeleteBtn}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={compactMobile ? 'space-y-3' : 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'}>
          {/* Left Archive Filter & List */}
          {(!compactMobile || !mobileDetailOpen) && (
          <div className={`${compactMobile ? '' : 'lg:col-span-4'} bg-white rounded-2xl border border-[#E5EAF3] ${compactMobile ? 'p-3 space-y-2' : 'p-4 space-y-3'}`}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={c.searchArchivePlaceholder}
                  className={`w-full pl-8 pr-3 rounded-xl bg-[#F8FAFD] border border-[#DCE3EE] text-xs focus:outline-none focus:border-[#1668FF] focus:bg-white ${compactMobile ? 'h-8' : 'h-9'}`}
                />
              </div>
              {compactMobile && (
                <button type="button" onClick={() => setShowMobileFilters(value => !value)} aria-expanded={showMobileFilters} aria-label="筛选归档" className={`h-8 w-8 shrink-0 rounded-xl border inline-flex items-center justify-center cursor-pointer ${showMobileFilters || statusFilter !== 'all' || dateFilter !== 'all' ? 'border-[#CDE0FF] bg-[#EEF3FF] text-[#1668FF]' : 'border-[#DCE3EE] bg-[#F8FAFD] text-[#64748B]'}`}>
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              )}
              {compactMobile && (
                <button
                  type="button"
                  onClick={() => setSubMode('trash')}
                  title={c.trashTab(trashedRooms.length)}
                  aria-label={c.trashTab(trashedRooms.length)}
                  className="h-8 px-2 rounded-xl border border-[#DCE3EE] bg-[#F8FAFD] hover:bg-red-50 hover:border-red-200 text-[#64748B] hover:text-[#DC2626] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {trashedRooms.length > 0 && (
                    <span className="text-[11px] font-mono font-semibold tabular-nums">
                      {trashedRooms.length}
                    </span>
                  )}
                </button>
              )}
            </div>

            {(!compactMobile || showMobileFilters) && <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | InterpArchiveStatus)
                }
                className="vamx-select vamx-select--xs w-full"
              >
                <option value="all">{c.allStatuses}</option>
                <option value="empty">{c.archiveStatuses.empty}</option>
                <option value="reviewable">{c.archiveStatuses.reviewable}</option>
                <option value="processing">{c.archiveStatuses.processing}</option>
                <option value="completed">{c.archiveStatuses.completed}</option>
                <option value="published">{c.archiveStatuses.published}</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | '7d' | 'month')}
                className="vamx-select vamx-select--xs w-full"
              >
                <option value="all">{c.allDates}</option>
                <option value="today">{c.dateToday}</option>
                <option value="7d">{c.dateLast7}</option>
                <option value="month">{c.dateThisMonth}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
              className="text-xs text-[#64748B] hover:text-[#111827] inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder === 'newest' ? c.sortNewest : c.sortOldest}</span>
            </button>
            </div>}

            <div className="divide-y divide-[#F1F5F9] max-h-[540px] overflow-y-auto thin-scrollbar">
              {filteredList.map((r) => {
                const archStatus = getArchiveStatus(r, generatingRoomId === r.id);
                const active = selectedRoom?.id === r.id;
                const statusColor =
                  archStatus === 'processing'
                    ? 'text-[#1668FF]'
                    : archStatus === 'empty'
                    ? 'text-[#94A3B8]'
                    : archStatus === 'completed'
                    ? 'text-[#16A34A]'
                    : archStatus === 'published'
                    ? 'text-[#64748B]'
                    : 'text-[#D97706]';
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      onSelectArchiveId(r.id);
                      if (compactMobile) setMobileDetailOpen(true);
                    }}
                    className={`w-full text-left py-3 px-3 rounded-xl transition-colors cursor-pointer my-0.5 ${
                      active ? 'bg-[#EEF3FF]' : 'hover:bg-[#F8FAFD]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`text-xs font-semibold truncate ${
                          active ? 'text-[#1668FF]' : 'text-[#111827]'
                        }`}
                      >
                        {r.title}
                      </div>
                      <span className={`text-[11px] font-medium shrink-0 ${statusColor}`}>
                        {c.archiveStatuses[archStatus]}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1 tabular-nums">
                      {getLanguageOptionLabel(r.sourceLang, language)} →{' '}
                      {getLanguageOptionLabel(r.targetLang, language)}{archStatus !== 'empty' && <> · {formatSecMMSS(r.durationSec ?? 60)}</>} ·{' '}
                      {r.createdAt.slice(0, 10)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {/* Right Archive Detail Panel */}
          {(!compactMobile || mobileDetailOpen) && (
          <div className={`${compactMobile ? '' : 'lg:col-span-8'} space-y-4`}>
            {compactMobile && (
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1668FF] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{c.archiveListTab(archivedRooms.length)}</span>
              </button>
            )}
            {!selectedRoom ? (
              <div className="bg-white rounded-2xl border border-[#E5EAF3] p-12 text-center text-xs text-[#64748B]">
                {c.noActiveRooms}
              </div>
            ) : (
              <>
                {/* Unified Compact Detail Header + 1-Line Status Strip */}
                {(() => {
                  const detailArchStatus = getArchiveStatus(
                    selectedRoom,
                    generatingRoomId === selectedRoom.id
                  );
                  const labelStyle =
                    detailArchStatus === 'published' || detailArchStatus === 'completed'
                      ? 'text-[#16A34A]'
                      : detailArchStatus === 'empty'
                      ? 'text-[#94A3B8]'
                      : detailArchStatus === 'processing'
                      ? 'text-[#1668FF]'
                      : 'text-[#D97706]';

                  return (
                    <div className="bg-white rounded-2xl border border-[#E5EAF3] p-4 sm:p-5 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-display font-bold text-[#111827] leading-snug">
                            {selectedRoom.title}
                          </h3>
                          <span className={`inline-block mt-1 text-xs font-medium ${labelStyle}`}>{c.archiveStatuses[detailArchStatus]}</span>
                          <div className="text-xs text-[#64748B] mt-1 tabular-nums">
                            {selectedRoom.createdAt} ·{' '}
                            {getLanguageOptionLabel(selectedRoom.sourceLang, language)} →{' '}
                            {getLanguageOptionLabel(selectedRoom.targetLang, language)}
                            {!workflow?.empty && <> · {formatSecMMSS(duration)}</>}
                          </div>
                        </div>

                        <details className="relative shrink-0">
                        <summary aria-label="更多操作" className="flex h-8 w-8 items-center justify-center cursor-pointer list-none rounded-lg border border-[#E5EAF3] bg-[#FAFBFD] text-[#64748B] [&::-webkit-details-marker]:hidden"><MoreHorizontal className="h-4 w-4" /></summary>
                        <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-[#E5EAF3] bg-white p-1.5 shadow-lg space-y-0.5">
                        {workflow?.locked && <button type="button" onClick={e => { e.currentTarget.closest('details')?.removeAttribute('open'); createRevision(); }} className="w-full rounded-lg text-left p-2 text-xs text-[#334155] hover:bg-[#F5F8FD]">创建修订版本</button>}
                        {!!selectedRoom.minutesHistory?.length && <button type="button" onClick={e => { e.currentTarget.closest('details')?.removeAttribute('open'); setDetailTab('minutes'); setShowHistory(s => !s); }} className="w-full rounded-lg text-left p-2 text-xs text-[#334155] hover:bg-[#F5F8FD]">历史版本</button>}
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateRoom({
                              ...selectedRoom,
                              trashed: true,
                              retentionDaysLeft: 7,
                              auditLogs: [
                                createAuditEntry(actorName, '移入回收站', selectedRoom.title),
                                ...(selectedRoom.auditLogs || []),
                              ],
                            });
                            if (compactMobile) setMobileDetailOpen(false);
                            onNotify(c.moveToTrashBtn);
                          }}
                          title={c.moveToTrashBtn}
                          className="w-full rounded-lg p-2 hover:bg-red-50 text-xs font-medium text-[#64748B] hover:text-[#DC2626] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{c.moveToTrashBtn}</span>
                        </button>
                        </div>
                        </details>
                      </div>

                    </div>
                  );
                })()}

                {workflow?.empty ? (
                  <div className="rounded-2xl border border-[#E5EAF3] bg-white px-5 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] text-[#94A3B8]"><FileText className="h-5 w-5" /></div>
                    <h4 className="text-sm font-display font-semibold text-[#334155]">{c.archiveStatuses.empty}</h4>
                    <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[#64748B]">本场没有形成可用的录音、原文或译文，因此无需核对，也没有可生成的会议纪要。</p>
                  </div>
                ) : (
                /* 3 Archive Detail Tabs */
                <div className="bg-white rounded-2xl border border-[#E5EAF3]">
                  <div className="px-5 border-b border-[#EEF2F7] flex items-center gap-6 overflow-x-auto">
                    {(() => {
                      const anomalyCount = (selectedRoom.utterances || []).filter(
                        (u) => isBlockedUtterance(u) || u.translationStatus !== 'confirmed'
                      ).length + (workflow?.audioGaps || 0);
                      return (
                        [
                          { id: 'playback', label: c.tabPlayback, icon: <Headphones className="w-3.5 h-3.5" /> },
                          { id: 'transcript', label: c.tabTranscript, icon: <Volume2 className="w-3.5 h-3.5" /> },
                          { id: 'minutes', label: c.tabMinutes, icon: <FileText className="w-3.5 h-3.5" /> },
                        ] as const
                      ).map((t) => {
                        const active = detailTab === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setDetailTab(t.id)}
                            className={`relative py-3.5 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                              active ? 'text-[#1668FF]' : 'text-[#64748B] hover:text-[#111827]'
                            }`}
                          >
                            {t.icon}
                            <span>{t.label}</span>
                            {t.id === 'transcript' && anomalyCount > 0 && (
                              <span className="text-[#D97706] tabular-nums">({anomalyCount})</span>
                            )}
                            {active && (
                              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1668FF] rounded-full" />
                            )}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  {/* TAB 1: DUAL-TRACK PLAYBACK */}
                  {detailTab === 'playback' && (
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="rounded-xl border border-[#E5EAF3] bg-[#FAFBFD] p-3 sm:p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const next = !isPlaying;
                              setIsPlaying(next);
                              if (next) triggerPlayBeep();
                            }}
                            className="h-10 w-10 shrink-0 rounded-full bg-[#1668FF] hover:bg-[#0D59EB] text-white inline-flex items-center justify-center cursor-pointer"
                            aria-label={isPlaying ? c.pauseBtn : c.playBtn}
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                          <input
                            type="range"
                            aria-label="回放进度"
                            min={0}
                            max={duration}
                            value={playTimeSec}
                            onChange={(e) => setPlayTimeSec(Number(e.target.value))}
                            className="min-w-0 flex-1 accent-[#1668FF] cursor-pointer"
                          />
                          <span className="shrink-0 font-mono text-[11px] text-[#64748B] tabular-nums whitespace-nowrap">
                            {formatSecMMSS(playTimeSec)} / {formatSecMMSS(duration)}
                          </span>
                        </div>
                        <div className="flex w-full items-center p-1 rounded-lg bg-[#EDF2F8]">
                          {(
                            [
                              { id: 'original', label: c.modeOrigOnly },
                              { id: 'interpreted', label: c.modeIntOnly },
                              { id: 'mix', label: c.modeMix },
                            ] as const
                          ).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setTrackMode(m.id)}
                              className={`h-8 flex-1 px-2 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap ${
                                trackMode === m.id
                                  ? 'bg-white text-[#1668FF] shadow-2xs font-semibold'
                                  : 'text-[#64748B]'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {trackMode === 'mix' && (
                        <div className={`grid gap-3 p-3 rounded-xl bg-[#FAFBFD] border border-[#EEF2F7] ${compactMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                          <label className="flex min-w-0 items-center gap-2 text-xs text-[#475569]">
                            <span className="w-16 shrink-0 whitespace-nowrap">{c.origVolLabel}</span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={origVol}
                              onChange={(e) => setOrigVol(Number(e.target.value))}
                              className="min-w-0 flex-1 accent-[#1668FF]"
                            />
                            <span className="font-mono w-9 text-right">{origVol}%</span>
                          </label>
                          <label className="flex min-w-0 items-center gap-2 text-xs text-[#475569]">
                            <span className="w-16 shrink-0 whitespace-nowrap">{c.intVolLabel}</span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={intVol}
                              onChange={(e) => setIntVol(Number(e.target.value))}
                              className="min-w-0 flex-1 accent-[#1668FF]"
                            />
                            <span className="font-mono w-9 text-right">{intVol}%</span>
                          </label>
                        </div>
                      )}

                      {/* Dual Track Segment Bars */}
                      <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-display font-bold text-[#111827]">
                            {c.dualTrackTitle}
                          </span>
                          {selectedRoom.handoverAtSec !== undefined && (
                            <span className="text-[11px] font-medium text-[#1668FF]">
                              {c.handoverPin(formatSecMMSS(selectedRoom.handoverAtSec), selectedRoom.handoverNote)}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-xs text-[#64748B]">
                            {getLanguageOptionLabel(selectedRoom.sourceLang, language)}
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {(selectedRoom.originalSegments || []).map((seg) => (
                              <button
                                key={seg.id}
                                type="button"
                                onClick={() => jumpToSeconds(seg.startSec, false)}
                                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-[#EFF5FF] border border-[#CDE0FF] text-left text-xs text-[#1668FF] font-mono hover:bg-[#E1ECFF] cursor-pointer"
                              >
                                {seg.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-xs text-[#64748B]">
                            {getLanguageOptionLabel(selectedRoom.targetLang, language)}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex gap-1.5 flex-wrap">
                              {(selectedRoom.interpretedSegments || []).map((seg) => (
                                <div key={seg.id} className="flex-1 min-w-[160px] space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => jumpToSeconds(seg.startSec, false)}
                                    className={`w-full px-3 py-2 rounded-lg border text-left text-xs font-mono cursor-pointer ${
                                      seg.isGap && !seg.resolved
                                        ? 'bg-red-50 border-red-200 text-[#DC2626]'
                                        : 'bg-[#EFF5FF] border-[#CDE0FF] text-[#1668FF] hover:bg-[#E1ECFF]'
                                    }`}
                                  >
                                    {seg.label}
                                  </button>
                                  {seg.isGap && !seg.resolved && !workflow?.locked && (
                                    <div className="flex items-center gap-2 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => setDetailTab('transcript')}
                                        className="text-[#1668FF] hover:underline cursor-pointer"
                                      >
                                        {c.supplementGapBtn}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleResolveGapSegment(seg.id)}
                                        className="text-[#16A34A] hover:underline cursor-pointer"
                                      >
                                        {c.markResolvedBtn}
                                      </button>
                                    </div>
                                  )}
                                  {seg.isGap && seg.resolved && (
                                    <div className="text-[11px] text-[#16A34A]">{c.resolvedTag}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TRANSCRIPT PROOFREADING */}
                  {detailTab === 'transcript' && (
                    <div className={`${compactMobile ? 'p-4' : 'p-5'} space-y-4`}>
                      {workflow?.noTranscript && <div className="rounded-xl border border-[#E5EAF3] bg-[#FAFBFD] p-4 space-y-3">
                        <p className="text-sm font-semibold text-[#111827]">没有可核对的原文与译文</p>
                        <p className="text-xs leading-relaxed text-[#64748B]">本场没有形成发言文本。请勿将空白录音段当作转写结果；如有可靠内容，可人工补录。若确无可用文本，可标记后按现有纪要继续审核。</p>
                        {!workflow.locked && !selectedRoom.noTranscriptConfirmed && <>
                          <textarea aria-label="人工补录原文" placeholder="人工补录原文" rows={2} value={manualSource} onChange={e => setManualSource(e.target.value)} className="w-full rounded-lg border border-[#DCE3EE] bg-white p-3 text-sm" />
                          <textarea aria-label="人工补录译文" placeholder="人工补录译文" rows={2} value={manualTranslation} onChange={e => setManualTranslation(e.target.value)} className="w-full rounded-lg border border-[#DCE3EE] bg-white p-3 text-sm" />
                          <div className="flex flex-wrap gap-2">
                            <button type="button" disabled={!validText(manualSource) || !validText(manualTranslation) || busy} onClick={addManualUtterance} className="h-9 rounded-lg bg-[#EEF3FF] px-3 text-xs font-semibold text-[#1668FF] disabled:opacity-40">保存补录文本</button>
                            <button type="button" disabled={busy} onClick={() => onUpdateRoom({ ...selectedRoom, noTranscriptConfirmed: true, transcriptReviewed: false, auditLogs: [createAuditEntry(actorName, '确认无可核对文本', '本场未形成可核对原文与译文，纪要须由人工审阅'), ...(selectedRoom.auditLogs || [])] })} className="h-9 rounded-lg border border-[#DCE3EE] bg-white px-3 text-xs font-semibold text-[#475569]">确认无可核对文本</button>
                          </div>
                        </>}
                        {selectedRoom.noTranscriptConfirmed && <p className="text-xs text-[#16A34A]">已标记无可核对文本。纪要需人工填写和审阅。</p>}
                      </div>}
                      {!workflow?.noTranscript && <div className={compactMobile ? 'flex flex-col gap-2' : 'flex flex-wrap items-center justify-between gap-2'}>
                        <div className={`inline-flex items-center p-1 rounded-xl bg-[#F1F5F9] ${compactMobile ? 'w-full' : ''}`}>
                          <button
                            type="button"
                            onClick={() => setUtteranceFilter('all')}
                            className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer ${compactMobile ? 'flex-1' : ''} ${
                              utteranceFilter === 'all' ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#64748B]'
                            }`}
                          >
                            {c.filterAllUtterances} ({selectedRoom.utterances?.length || 0})
                          </button>
                          <button
                            type="button"
                            onClick={() => setUtteranceFilter('anomalies')}
                            className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer ${compactMobile ? 'flex-1' : ''} ${
                              utteranceFilter === 'anomalies'
                                ? 'bg-white text-[#D97706] shadow-2xs'
                                : 'text-[#64748B]'
                            }`}
                          >
                            {c.filterAnomalies} ({anomalyUtteranceCount + (workflow?.audioGaps || 0)})
                          </button>
                        </div>

                        {!selectedRoom.minutes?.publishedLocked && !workflow?.noTranscript && editingUttId === null && (
                          workflow?.textReviewed ? <span className={`h-9 px-3.5 rounded-xl bg-[#F0FDF4] text-[#16A34A] text-xs font-semibold inline-flex items-center gap-1.5 ${compactMobile ? 'w-full justify-center' : ''}`}><CheckCircle2 className="w-3.5 h-3.5" />{c.textConfirmedBadge}</span> : <button
                            type="button"
                            onClick={handleConfirmTranscriptAll}
                            disabled={!workflow?.textReady || busy}
                            className={`h-9 px-3.5 rounded-xl bg-[#EEF3FF] hover:bg-[#E1EBFF] text-[#1668FF] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${compactMobile ? 'w-full justify-center' : ''}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{c.confirmTextOkBtn}</span>
                          </button>
                        )}
                      </div>}
                      {!workflow?.noTranscript && !workflow?.textReady && !!workflow?.textBlockers && (
                        <p className="text-xs text-[#B45309]">还有 {workflow.textBlockers} 段文字需补齐或校正，完成后即可确认。</p>
                      )}

                      {!!workflow?.audioGaps && (
                        <div className="space-y-2">
                          <p className="text-xs text-[#64748B]">文字校正后可先确认；录音缺段需单独核查，才能归档。</p>
                          {[...(selectedRoom.originalSegments || []), ...(selectedRoom.interpretedSegments || [])]
                            .filter(s => s.isGap && !s.resolved)
                            .map(s => (
                              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#F3D5A1] bg-[#FFFBF2] p-3 text-xs">
                                <span className="text-[#92400E]">录音缺段：{s.label}</span>
                                {!workflow.locked && <button disabled={busy} type="button" onClick={() => handleResolveGapSegment(s.id)} className="font-semibold text-[#1668FF] hover:underline">确认已核查缺段</button>}
                              </div>
                            ))}
                        </div>
                      )}

                      <div className="space-y-3">
                        {utteranceFilter === 'anomalies' && anomalyUtteranceCount === 0 && !workflow?.audioGaps && !workflow?.noTranscript && (
                          <div className="rounded-xl bg-[#F7FAFD] px-4 py-6 text-center text-xs text-[#64748B]">没有异常或待确认段落</div>
                        )}
                        {(selectedRoom.utterances || [])
                          .filter(
                            (u) =>
                              utteranceFilter === 'all' ||
                              u.translationStatus !== 'confirmed' || isBlockedUtterance(u)
                          )
                          .map((u) => (
                            <div
                              key={u.id}
                              className="p-4 rounded-xl border border-[#E5EAF3] bg-white space-y-3"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => jumpToSeconds(u.seconds, true)}
                                  className="font-mono text-[#1668FF] hover:underline font-semibold tabular-nums cursor-pointer"
                                >
                                  {u.time} · {u.speakerName}
                                </button>
                                <span
                                  className={`text-[11px] font-medium ${
                                    u.translationStatus === 'confirmed'
                                      ? 'text-[#16A34A]'
                                      : u.translationStatus === 'failed'
                                      ? 'text-[#DC2626]'
                                      : 'text-[#D97706]'
                                  }`}
                                >
                                  {c.sentenceStatuses[u.translationStatus]}
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-semibold text-[#94A3B8]">原文</span>
                                <p className="text-sm text-[#475569] leading-6 break-words">{u.sourceText || '暂无原文'}</p>
                                {!workflow?.locked && <details className="text-xs text-[#1668FF]"><summary className="cursor-pointer">校正原文</summary><textarea aria-label="校正原文" disabled={busy} value={u.sourceText} onChange={e => onUpdateRoom({ ...invalidateText(selectedRoom), utterances: selectedRoom.utterances?.map(item => item.id === u.id ? { ...item, sourceText: e.target.value } : item) })} className="w-full rounded-lg border border-[#DCE3EE] bg-white p-3 mt-2 text-sm text-[#334155]" /></details>}
                              </div>
                              {isBlockedUtterance(u) && <p className="text-xs text-red-600" role="alert">{!validText(u.sourceText) ? '原文缺失，请展开“校正原文”补录。' : !validText(u.translatedText) ? '译文缺失或无效，请人工补录有效译文。' : u.isGap && !u.gapResolved ? '该段缺失，请核查并保存译文。' : '译文处理未完成，请核查后保存。'}</p>}
                              {!workflow?.locked && (u.translationStatus === 'failed' || !validText(u.translatedText)) && <button type="button" disabled={busy} onClick={() => handleRetryTranslation(u.id)} className="text-xs text-blue-600 disabled:opacity-50">{retryingId === u.id ? '重译中…' : '重试翻译'}</button>}
                              <div className="border-t border-[#EEF2F7] pt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-[#94A3B8]">译文</span>
                                  {!workflow?.locked && editingUttId !== u.id && (
                                    <button type="button" onClick={() => { setEditingUttId(u.id); setEditingUttDraft(u.translatedText); }} className="text-xs font-medium text-[#1668FF] cursor-pointer">{c.editBtn}</button>
                                  )}
                                </div>
                              {editingUttId === u.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    rows={2}
                                    aria-label="编辑译文"
                                    value={editingUttDraft}
                                    onChange={(e) => setEditingUttDraft(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-[#1668FF] bg-white text-sm leading-6 focus:outline-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveUttEdit(u.id)}
                                      className="h-8 px-3 rounded-lg bg-[#1668FF] text-white text-xs font-semibold cursor-pointer"
                                    >
                                      {c.saveEditBtn}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingUttId(null)}
                                      className="h-8 px-3 rounded-lg border border-[#DCE3EE] bg-white text-xs cursor-pointer"
                                    >
                                      {c.cancelBtn}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm font-medium text-[#111827] leading-6 break-words">
                                    {u.translatedText || (
                                      <span className="text-[#DC2626] italic">{u.gapReason || c.gapWarningTag}</span>
                                    )}
                                  </p>
                                </div>
                              )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: AI STRUCTURED MINUTES & PUBLISH */}
                  {detailTab === 'minutes' && (
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#EEF2F7] pb-3">
                        <div className="min-w-0 flex-1 flex items-baseline gap-1.5">
                          <h4 className="font-display text-sm font-bold text-[#111827] whitespace-nowrap">{c.tabMinutes}</h4>
                          {selectedRoom.minutes && <span className="text-[11px] text-[#94A3B8]">v{selectedRoom.minutes.version || 1}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {!selectedRoom.minutes?.publishedLocked && editingMinutes && !workflow?.noTranscript && (
                            <button
                              type="button"
                              onClick={handleGenerateMinutes}
                              disabled={busy || !workflow?.textReviewed}
                              className="h-9 px-4 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isGeneratingMinutes ? c.generatingMinutesBtn : selectedRoom.minutes ? '重新生成纪要' : c.generateMinutesBtn}</span>
                            </button>
                          )}

                        </div>

                        {selectedRoom.minutes && !workflow?.locked && !editingMinutes && <button type="button" disabled={busy} onClick={() => setEditingMinutes(true)} className="h-8 rounded-lg bg-[#EEF3FF] px-2.5 text-xs font-semibold text-[#1668FF] hover:bg-[#E1EBFF] whitespace-nowrap">编辑</button>}
                        <details className="relative">
                        <summary className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#DCE3EE] bg-white px-2.5 text-xs font-medium text-[#475569] cursor-pointer list-none whitespace-nowrap [&::-webkit-details-marker]:hidden"><Download className="h-3.5 w-3.5" />导出</summary>
                        <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border border-[#E5EAF3] bg-white p-1.5 shadow-lg space-y-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              downloadBlob(
                                buildArchiveDocxHtml(selectedRoom),
                                `${selectedRoom.title}.doc`,
                                'application/msword'
                              )
                            }
                            className="w-full rounded-lg p-2 text-xs text-[#475569] hover:bg-[#F5F8FD] inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>{c.exportDocx}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              downloadBlob(
                                buildArchiveTxt(selectedRoom),
                                `${selectedRoom.title}.txt`,
                                'text/plain;charset=utf-8'
                              )
                            }
                            className="w-full rounded-lg p-2 text-xs text-[#475569] hover:bg-[#F5F8FD] inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>{c.exportTxt}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              downloadBlob(
                                buildArchiveSrt(selectedRoom),
                                `${selectedRoom.title}.srt`,
                                'text/plain;charset=utf-8'
                              )
                            }
                            className="w-full rounded-lg p-2 text-xs text-[#475569] hover:bg-[#F5F8FD] inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>{c.exportSrt}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const link = `${window.location.origin}?archive=${selectedRoom.id}`;
                              navigator.clipboard?.writeText(link).catch(() => {});
                              onNotify(c.copyShareLink);
                            }}
                            className="w-full rounded-lg p-2 text-xs text-[#1668FF] hover:bg-[#F5F8FD] inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{c.copyShareLink}</span>
                          </button>
                        </div>
                        </details>
                      </div>

                      {!workflow?.locked && workflow?.textReviewed && !selectedRoom.minutes && <button type="button" disabled={busy} className="text-xs text-[#1668FF]" onClick={createManualMinutes}>手动填写纪要</button>}
                      {showHistory && !!selectedRoom.minutesHistory?.length && <details className="text-xs text-slate-600"><summary>历史纪要版本（{selectedRoom.minutesHistory.length}）</summary>{selectedRoom.minutesHistory.map((minute, i) => <details key={i} className="mt-3 border-t pt-2"><summary>v{minute.version || i + 1} · {minute.publishedLocked ? '已归档' : '草稿'} · {minute.generatedAt}</summary><p className="my-2 whitespace-pre-wrap">{minute.summary}</p><p>{minute.topics.join(' · ')}</p>{minute.topicAnalyses.map((a,j) => <p key={j}>{a.topic}：{a.analysis}</p>)}{minute.keyConclusions.map(a => <p key={a.id}>{a.timestamp} {a.text}</p>)}{minute.actionItems.map(a => <p key={a.id}>{a.task} · {a.owner} · {a.deadline}</p>)}{minute.risksAndOpenQuestions.map((a,j) => <p key={j}>{a}</p>)}</details>)}</details>}
                      {selectedRoom.minutes?.stale && !workflow?.locked && <button type="button" disabled={!workflow?.textReviewed || busy} className="text-xs text-amber-700" onClick={() => updateMinutes({ stale: false })}>我已人工核对纪要与最新原文、译文一致</button>}
                      {!selectedRoom.minutes ? (
                        <div className="py-10 text-center rounded-xl border border-dashed border-[#DCE3EE] text-xs text-[#64748B]">
                          {workflow?.noTranscript ? '暂无会议纪要。确认无可核对文本后，可手动填写。' : c.generateMinutesBtn}
                        </div>
                      ) : !editingMinutes || workflow?.locked ? (
                        <MinutesReader minutes={selectedRoom.minutes} onJump={time => jumpToSeconds(parseTimestampSec(time), true)} />
                      ) : (
                        <div className="space-y-5">
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold text-[#111827]">{c.minSummary}</div>
                            <textarea
                              rows={3}
                              data-review-missing={!validText(selectedRoom.minutes.summary) && !workflow?.locked ? 'true' : undefined}
                              aria-invalid={!validText(selectedRoom.minutes.summary) && !workflow?.locked}
                              disabled={selectedRoom.minutes.publishedLocked}
                              value={selectedRoom.minutes.summary}
                              onChange={(e) => updateMinutes({ summary: e.target.value })}
                              className={`w-full p-3 rounded-xl border text-xs text-[#334155] leading-relaxed disabled:bg-[#FAFBFD] focus:outline-none focus:border-[#1668FF] ${!validText(selectedRoom.minutes.summary) && !workflow?.locked ? 'border-amber-500 bg-amber-50' : 'border-[#DCE3EE]'}`}
                            />
                          </div>

                          {/* Topic Tags */}
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-[#111827]">{c.minTopics}</div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#334155]">
                              {selectedRoom.minutes.topics.map((tp, idx) => (
                                <span
                                  key={`${tp}-${idx}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F7FC] border border-[#E2E8F2]"
                                >
                                  <span>{tp}</span>
                                  {!selectedRoom.minutes?.publishedLocked && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateMinutes({
                                          topics: selectedRoom.minutes!.topics.filter((_, i) => i !== idx),
                                        })
                                      }
                                      className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </span>
                              ))}
                              {!selectedRoom.minutes.publishedLocked && (
                                <div className="inline-flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={newTopicText}
                                    onChange={(e) => setNewTopicText(e.target.value)}
                                    placeholder={c.minAddTopicPlaceholder}
                                    className="h-7 px-2 rounded-lg border border-[#DCE3EE] text-xs w-32"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!newTopicText.trim()) return;
                                      updateMinutes({
                                        topics: [...selectedRoom.minutes!.topics, newTopicText.trim()],
                                      });
                                      setNewTopicText('');
                                    }}
                                    className="h-7 px-2.5 rounded-lg bg-[#1668FF] text-white text-xs cursor-pointer"
                                  >
                                    {c.minAddBtn}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Topic Analyses */}
                          {selectedRoom.minutes.topicAnalyses.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-[#111827]">{c.minTopicAnalyses}</div>
                              <div className="space-y-2">
                                {selectedRoom.minutes.topicAnalyses.map((ta, idx) => (
                                  <div key={idx} className="p-3 rounded-xl bg-[#FAFBFD] border border-[#EEF2F7] text-xs">
                                    <div className="font-semibold text-[#111827]">{ta.topic}</div>
                                    <p className="text-[#475569] mt-1 leading-relaxed">{ta.analysis}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Key Conclusions */}
                          {selectedRoom.minutes.keyConclusions.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-[#111827]">{c.minConclusions}</div>
                              <div className="space-y-1.5">
                                {selectedRoom.minutes.keyConclusions.map((kc) => (
                                  <div key={kc.id} className="flex items-start gap-2 text-xs text-[#334155]">
                                    <button
                                      type="button"
                                      onClick={() => jumpToSeconds(parseTimestampSec(kc.timestamp), true)}
                                      className="font-mono text-[#1668FF] hover:underline shrink-0 cursor-pointer tabular-nums"
                                    >
                                      [{kc.timestamp}]
                                    </button>
                                    <span>{kc.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action items: readable cards on phones, table on wide screens */}
                          <div className="space-y-2">
                            <div className="text-sm font-bold text-[#111827]">{compactMobile && language === 'zh' ? '待办事项' : c.minActions}</div>
                            {!workflow?.locked && <button type="button" disabled={busy} className="text-xs text-blue-600" onClick={() => updateMinutes({ actionItems: [...selectedRoom.minutes!.actionItems, { id: crypto.randomUUID(), task: '', owner: '', deadline: '', sourceTimestamp: '00:00' }] })}>添加待办事项</button>}
                            {selectedRoom.minutes.actionItems.length === 0 && <p className="text-xs text-slate-500">本次会议暂无明确待办事项。</p>}
                            <div className={`${compactMobile ? 'space-y-3' : 'space-y-3 md:hidden'}`}>
                              {selectedRoom.minutes.actionItems.map((act, index) => (
                                <div key={act.id} className="rounded-xl border border-[#DCE3EE] bg-[#FAFBFD] p-4 space-y-4">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-[#111827]">待办 {index + 1}</span>
                                    {!workflow?.locked && <button type="button" disabled={busy} className="text-sm text-red-600" onClick={() => updateMinutes({ actionItems: selectedRoom.minutes!.actionItems.filter(a => a.id !== act.id) })}>移除</button>}
                                  </div>
                                  <label className="block space-y-1.5">
                                    <span className="text-sm text-[#64748B]">{c.minActionTask}</span>
                                    <textarea rows={2} aria-invalid={!workflow?.locked && isMissingMinutesField(act.task)} data-review-missing={!workflow?.locked && isMissingMinutesField(act.task) ? 'true' : undefined} disabled={workflow?.locked || busy} value={act.task} onChange={e => updateMinutes({ actionItems: selectedRoom.minutes!.actionItems.map(a => a.id === act.id ? { ...a, task: e.target.value } : a) })} className={`w-full rounded-lg border p-3 text-base leading-relaxed text-[#111827] disabled:bg-transparent ${!workflow?.locked && isMissingMinutesField(act.task) ? 'border-amber-500 bg-amber-50' : 'border-[#DCE3EE] bg-white'}`} />
                                  </label>
                                  <div className="grid grid-cols-2 gap-3">
                                    {(['owner', 'deadline'] as const).map(field => (
                                      <label key={field} className="min-w-0 space-y-1.5">
                                        <span className="block text-sm text-[#64748B]">{field === 'owner' ? c.minActionOwner : c.minActionDeadline}</span>
                                        <input type="text" aria-invalid={!workflow?.locked && isMissingMinutesField(act[field])} data-review-missing={!workflow?.locked && isMissingMinutesField(act[field]) ? 'true' : undefined} disabled={workflow?.locked || busy} value={act[field]} onChange={e => updateMinutes({ actionItems: selectedRoom.minutes!.actionItems.map(a => a.id === act.id ? { ...a, [field]: e.target.value } : a) })} className={`w-full min-w-0 rounded-lg border p-3 text-base text-[#111827] disabled:bg-transparent ${!workflow?.locked && isMissingMinutesField(act[field]) ? 'border-amber-500 bg-amber-50' : 'border-[#DCE3EE] bg-white'}`} />
                                      </label>
                                    ))}
                                  </div>
                                  <button type="button" onClick={() => jumpToSeconds(parseTimestampSec(act.sourceTimestamp), true)} className="text-sm font-medium text-[#1668FF]">查看原文 · {act.sourceTimestamp}</button>
                                </div>
                              ))}
                            </div>
                            <div className={`${compactMobile ? 'hidden' : 'hidden md:block'} overflow-x-auto border border-[#EEF2F7] rounded-xl`}>
                              <table className="w-full text-left text-xs">
                                <thead className="bg-[#FAFBFD] text-[#64748B] border-b border-[#EEF2F7]">
                                  <tr>
                                    <th className="py-2 px-3">{c.minActionTask}</th>
                                    <th className="py-2 px-3">{c.minActionOwner}</th>
                                    <th className="py-2 px-3">{c.minActionDeadline}</th>
                                    <th className="py-2 px-3">{c.minActionSource}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEF2F7]">
                                  {selectedRoom.minutes.actionItems.map((act: InterpMinutesActionItem) => (
                                    <tr key={act.id}>
                                      <td className="py-2 px-3 text-[#111827]"><input aria-label={`第 ${selectedRoom.minutes!.actionItems.indexOf(act) + 1} 项待办内容`} aria-invalid={!workflow?.locked && isMissingMinutesField(act.task)} data-review-missing={!workflow?.locked && isMissingMinutesField(act.task) ? 'true' : undefined} disabled={workflow?.locked || busy} value={act.task} onChange={e => updateMinutes({ actionItems: selectedRoom.minutes!.actionItems.map(a => a.id === act.id ? { ...a, task: e.target.value } : a) })} className={`w-full border rounded p-1 ${!workflow?.locked && isMissingMinutesField(act.task) ? 'border-amber-500 bg-amber-50' : 'border-[#DCE3EE]'}`} /></td>
                                      <td className="py-2 px-3">
                                        <input
                                          type="text"
                                          aria-label={`第 ${selectedRoom.minutes!.actionItems.indexOf(act) + 1} 项负责人`}
                                          aria-invalid={!workflow?.locked && isMissingMinutesField(act.owner)}
                                          data-review-missing={!workflow?.locked && isMissingMinutesField(act.owner) ? 'true' : undefined}
                                          disabled={selectedRoom.minutes?.publishedLocked}
                                          value={act.owner}
                                          onChange={(e) =>
                                            updateMinutes({
                                              actionItems: selectedRoom.minutes!.actionItems.map((x) =>
                                                x.id === act.id ? { ...x, owner: e.target.value } : x
                                              ),
                                            })
                                          }
                                          className={`w-24 px-2 py-1 rounded border text-xs disabled:border-transparent ${!workflow?.locked && isMissingMinutesField(act.owner) ? 'border-amber-500 bg-amber-50' : 'border-[#DCE3EE]'}`}
                                        />
                                      </td>
                                      <td className="py-2 px-3">
                                        <input
                                          type="text"
                                          aria-label={`第 ${selectedRoom.minutes!.actionItems.indexOf(act) + 1} 项截止时间`}
                                          aria-invalid={!workflow?.locked && isMissingMinutesField(act.deadline)}
                                          data-review-missing={!workflow?.locked && isMissingMinutesField(act.deadline) ? 'true' : undefined}
                                          disabled={selectedRoom.minutes?.publishedLocked}
                                          value={act.deadline}
                                          onChange={(e) =>
                                            updateMinutes({
                                              actionItems: selectedRoom.minutes!.actionItems.map((x) =>
                                                x.id === act.id ? { ...x, deadline: e.target.value } : x
                                              ),
                                            })
                                          }
                                          className={`w-24 px-2 py-1 rounded border text-xs disabled:border-transparent ${!workflow?.locked && isMissingMinutesField(act.deadline) ? 'border-amber-500 bg-amber-50' : 'border-[#DCE3EE]'}`}
                                        />
                                      </td>
                                      <td className="py-2 px-3 font-mono tabular-nums">
                                        {!workflow?.locked && <button type="button" disabled={busy} className="text-xs text-red-600 mr-2" onClick={() => updateMinutes({ actionItems: selectedRoom.minutes!.actionItems.filter(a => a.id !== act.id) })}>移除待办</button>}
                                        <button
                                          type="button"
                                          onClick={() => jumpToSeconds(parseTimestampSec(act.sourceTimestamp), true)}
                                          className="text-[#1668FF] hover:underline cursor-pointer"
                                        >
                                          {act.sourceTimestamp}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Risks & Open Questions */}
                          {selectedRoom.minutes.risksAndOpenQuestions.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-xs font-bold text-[#111827]">{c.minRisks}</div>
                              <ul className="list-disc pl-5 space-y-1 text-xs text-[#475569]">
                                {selectedRoom.minutes.risksAndOpenQuestions.map((rq, idx) => (
                                  <li key={idx}>{rq}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {!workflow?.locked && (
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          {selectedRoom.minutesError && <p role="alert" className="text-xs text-red-600">生成失败：{selectedRoom.minutesError}</p>}
                          {selectedRoom.minutes?.stale && <p className="text-xs text-amber-700">文本已变更，请重新核对纪要。</p>}
                          {!workflow?.textReviewed && <p className="text-xs text-amber-700">{workflow?.noTranscript ? '本场没有可核对原文，请在“原文与译文”中确认无可用文本，或人工补录。' : workflow?.textBlockers ? `有 ${workflow.textBlockers} 项文字待校正` : '请先核对原文与译文'}</p>}
                          {!!workflow?.audioGaps && <p className="text-xs text-amber-700">还有 {workflow.audioGaps} 处录音缺段，请到“原文与译文”核查后处理。</p>}
                          {workflow?.textReviewed && selectedRoom.minutes && !workflow.minutesReady && !selectedRoom.minutes.stale && <p className="text-xs text-amber-700">请补充有效摘要和待办内容。</p>}
                          {confirmPendingArchive ? (
                            <div role="dialog" aria-label="待跟进事项提醒" className="rounded-xl bg-amber-50 p-4 space-y-3">
                              <p className="text-sm text-amber-900">有 {workflow?.pendingActions} 项待办的负责人或截止时间尚未确定，将以“待跟进”保留在纪要中。</p>
                              <div className="flex gap-3"><button type="button" disabled={busy} onClick={() => handlePublishArchive(true)} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm">保留待跟进并归档</button><button type="button" onClick={() => setConfirmPendingArchive(false)} className="text-sm">返回</button></div>
                            </div>
                          ) : (
                            <button type="button" disabled={busy} onClick={() => {
                              if (!workflow?.textReviewed) { setDetailTab('transcript'); return; }
                              if (workflow.audioGaps) { setDetailTab('transcript'); return; }
                              if (!selectedRoom.minutes) { if (workflow.noTranscript) createManualMinutes(); else void handleGenerateMinutes(); return; }
                              if (editingMinutes) { setEditingMinutes(false); return; }
                              if (!workflow.minutesReady) { setEditingMinutes(true); setFocusMissingField(true); return; }
                              handlePublishArchive();
                            }} className="w-full sm:w-auto h-10 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] px-5 text-xs font-semibold text-white">
                              {busy ? '处理中…' : !workflow?.textReviewed ? workflow?.noTranscript ? '处理无原文记录' : '核对原文与译文' : workflow.audioGaps ? '处理录音缺段' : !selectedRoom.minutes ? workflow.noTranscript ? '手动填写纪要' : '生成纪要' : editingMinutes ? '完成编辑' : !workflow.minutesReady ? '完善纪要' : '确认并归档'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}
              </>
            )}
          </div>
          )}
        </div>
      )}

      {/* Permanent Delete 2nd Confirmation Danger Modal */}
      {permDeleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setPermDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] bg-white rounded-2xl border border-[#E5EAF3] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-[#DC2626]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-display font-bold">{c.permDeleteTitle}</h4>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              <strong>{permDeleteTarget.title}</strong> — {c.permDeleteWarn}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPermDeleteTarget(null)}
                className="h-9 px-4 rounded-xl border border-[#DCE3EE] text-xs font-medium text-[#475569] cursor-pointer"
              >
                {c.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  onPermanentDeleteRoom(permDeleteTarget.id);
                  setPermDeleteTarget(null);
                  onNotify(c.permDeleteConfirm);
                }}
                className="h-9 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold cursor-pointer"
              >
                {c.permDeleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
