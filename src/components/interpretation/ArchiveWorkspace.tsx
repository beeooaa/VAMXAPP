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
  Lock,
  Pause,
  Play,
  RotateCcw,
  Search,
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

  const [detailTab, setDetailTab] = useState<'playback' | 'transcript' | 'minutes'>('playback');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTimeSec, setPlayTimeSec] = useState(0);
  const [trackMode, setTrackMode] = useState<'original' | 'interpreted' | 'mix'>('interpreted');
  const [origVol, setOrigVol] = useState(40);
  const [intVol, setIntVol] = useState(90);

  const [utteranceFilter, setUtteranceFilter] = useState<'all' | 'anomalies'>('all');
  const [editingUttId, setEditingUttId] = useState<string | null>(null);
  const [editingUttDraft, setEditingUttDraft] = useState('');

  const [generatingRoomId, setGeneratingRoomId] = useState<string | null>(null);
  const isGeneratingMinutes = generatingRoomId !== null;
  const [newTopicText, setNewTopicText] = useState('');
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
      if (dateFilter === 'today' && !r.createdAt.startsWith('2026-11-24')) return false;
      if (dateFilter === '7d' && r.createdAt < '2026-11-17') return false;
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

  useEffect(() => {
    setIsPlaying(false);
    setPlayTimeSec(0);
    setEditingUttId(null);
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
    if (!selectedRoom) return;
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
    const currentArch = getArchiveStatus(selectedRoom);
    onUpdateRoom({
      ...selectedRoom,
      archiveStatus: currentArch === 'reviewable' ? 'processing' : selectedRoom.archiveStatus,
      utterances: nextUtterances,
      auditLogs: [
        createAuditEntry(actorName, '校对译文', `更新段落 ${uttId} 并标记已确认`),
        ...(selectedRoom.auditLogs || []),
      ],
    });
    setEditingUttId(null);
    onNotify(c.saveEditBtn);
  };

  const handleResolveGapSegment = (segId: string) => {
    if (!selectedRoom) return;
    const currentArch = getArchiveStatus(selectedRoom);
    onUpdateRoom({
      ...selectedRoom,
      archiveStatus: currentArch === 'reviewable' ? 'processing' : selectedRoom.archiveStatus,
      interpretedSegments: (selectedRoom.interpretedSegments || []).map((s) =>
        s.id === segId ? { ...s, resolved: true } : s
      ),
      auditLogs: [
        createAuditEntry(actorName, '处理音频缺段', `标记分段 ${segId} 已解决`),
        ...(selectedRoom.auditLogs || []),
      ],
    });
    onNotify(c.resolvedTag);
  };

  const handleConfirmTranscriptAll = () => {
    if (!selectedRoom) return;
    const hasMinutes = Boolean(selectedRoom.minutes);
    onUpdateRoom({
      ...selectedRoom,
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
    if (!selectedRoom || generatingRoomId) return;
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

      onUpdateRoom({
        ...targetRoom,
        archiveStatus: 'processing',
        minutes,
        auditLogs: [
          createAuditEntry(actorName, '生成会议纪要', '已调用 AI 接口生成结构化纪要'),
          ...(targetRoom.auditLogs || []),
        ],
      });
      onNotify(c.tabMinutes);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to generate minutes');
    } finally {
      setGeneratingRoomId(null);
    }
  };

  const updateMinutes = (patch: Partial<InterpMinutesData>, nextArchiveStatus?: InterpArchiveStatus) => {
    if (!selectedRoom?.minutes || selectedRoom.minutes.publishedLocked) return;
    onUpdateRoom({
      ...selectedRoom,
      archiveStatus: nextArchiveStatus ?? selectedRoom.archiveStatus,
      minutes: { ...selectedRoom.minutes, ...patch },
    });
  };

  const handlePublishArchive = () => {
    if (!selectedRoom) return;
    onUpdateRoom({
      ...selectedRoom,
      lifecycle: 'published',
      archiveStatus: 'published',
      minutes: selectedRoom.minutes
        ? { ...selectedRoom.minutes, reviewedConfirmed: true, publishedLocked: true }
        : {
            summary: selectedRoom.title,
            topics: [],
            topicAnalyses: [],
            keyConclusions: [],
            actionItems: [],
            risksAndOpenQuestions: [],
            reviewedConfirmed: true,
            publishedLocked: true,
            generatedAt: new Date().toLocaleTimeString(),
          },
      auditLogs: [
        createAuditEntry(actorName, '确认发布归档', '已锁定正文与纪要'),
        ...(selectedRoom.auditLogs || []),
      ],
    });
    onNotify(c.publishedLockedBadge);
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
    <div className={compactMobile ? 'space-y-3' : 'space-y-4'}>
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
          <div className={`${compactMobile ? '' : 'lg:col-span-4'} bg-white rounded-2xl border border-[#E5EAF3] p-4 space-y-3`}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={c.searchArchivePlaceholder}
                  className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#F8FAFD] border border-[#DCE3EE] text-xs focus:outline-none focus:border-[#1668FF] focus:bg-white"
                />
              </div>
              {compactMobile && (
                <button
                  type="button"
                  onClick={() => setSubMode('trash')}
                  title={c.trashTab(trashedRooms.length)}
                  aria-label={c.trashTab(trashedRooms.length)}
                  className="h-9 px-2.5 rounded-xl border border-[#DCE3EE] bg-[#F8FAFD] hover:bg-red-50 hover:border-red-200 text-[#64748B] hover:text-[#DC2626] inline-flex items-center gap-1 shrink-0 cursor-pointer"
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

            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | InterpArchiveStatus)
                }
                className="h-9 px-2.5 rounded-xl border border-[#DCE3EE] text-xs bg-white text-[#334155]"
              >
                <option value="all">{c.allStatuses}</option>
                <option value="reviewable">{c.archiveStatuses.reviewable}</option>
                <option value="processing">{c.archiveStatuses.processing}</option>
                <option value="completed">{c.archiveStatuses.completed}</option>
                <option value="published">{c.archiveStatuses.published}</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | '7d' | 'month')}
                className="h-9 px-2.5 rounded-xl border border-[#DCE3EE] text-xs bg-white text-[#334155]"
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

            <div className="divide-y divide-[#F1F5F9] max-h-[540px] overflow-y-auto thin-scrollbar">
              {filteredList.map((r) => {
                const archStatus = getArchiveStatus(r, generatingRoomId === r.id);
                const active = selectedRoom?.id === r.id;
                const statusColor =
                  archStatus === 'processing'
                    ? 'text-[#1668FF]'
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
                      {getLanguageOptionLabel(r.targetLang, language)} · {formatSecMMSS(r.durationSec ?? 60)} ·{' '}
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
                      : detailArchStatus === 'processing'
                      ? 'text-[#1668FF]'
                      : 'text-[#D97706]';
                  const bannerCopy =
                    detailArchStatus === 'published'
                      ? c.publishedBanner
                      : detailArchStatus === 'completed'
                      ? c.completedBanner
                      : detailArchStatus === 'processing'
                      ? c.processingBanner
                      : c.pendingReviewBanner;

                  return (
                    <div className="bg-white rounded-2xl border border-[#E5EAF3] p-4 sm:p-5 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-display font-bold text-[#111827] leading-snug">
                            {selectedRoom.title}
                          </h3>
                          <div className="text-xs text-[#64748B] mt-1 tabular-nums">
                            {selectedRoom.createdAt} ·{' '}
                            {getLanguageOptionLabel(selectedRoom.sourceLang, language)} →{' '}
                            {getLanguageOptionLabel(selectedRoom.targetLang, language)} ·{' '}
                            {formatSecMMSS(duration)}
                          </div>
                        </div>

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
                          className="h-8 px-2.5 rounded-lg border border-[#E5EAF3] bg-[#FAFBFD] hover:bg-red-50 hover:border-red-200 text-xs font-medium text-[#64748B] hover:text-[#DC2626] inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{c.moveToTrashBtn}</span>
                        </button>
                      </div>

                      <div className="pt-2.5 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className={`font-semibold shrink-0 ${labelStyle}`}>
                            {c.archiveStatuses[detailArchStatus]}
                          </span>
                          <span className="text-[#CBD5E1] shrink-0">·</span>
                          <span className="text-[#64748B] truncate">{bannerCopy}</span>
                        </div>
                        {detailArchStatus === 'completed' && (
                          <button
                            type="button"
                            onClick={handlePublishArchive}
                            className="h-7 px-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                          >
                            {c.publishArchiveBtn}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3 Archive Detail Tabs */}
                <div className="bg-white rounded-2xl border border-[#E5EAF3] overflow-hidden">
                  <div className="px-5 border-b border-[#EEF2F7] flex items-center gap-6 overflow-x-auto">
                    {(() => {
                      const anomalyCount = (selectedRoom.utterances || []).filter(
                        (u) => u.translationStatus !== 'confirmed' || !u.translatedText
                      ).length;
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
                    <div className="p-5 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const next = !isPlaying;
                              setIsPlaying(next);
                              if (next) triggerPlayBeep();
                            }}
                            className="h-10 px-5 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            <span>{isPlaying ? c.pauseBtn : c.playBtn}</span>
                          </button>
                          <div className="text-xs">
                            <div className="font-semibold text-[#111827]">{c.readyLabel}</div>
                            <div className="font-mono text-[#64748B] tabular-nums">
                              {formatSecMMSS(playTimeSec)} / {formatSecMMSS(duration)}
                            </div>
                          </div>
                        </div>

                        <div className="inline-flex items-center p-1 rounded-xl bg-[#F1F5F9]">
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
                              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer ${
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

                      {/* Scrubber */}
                      <div>
                        <input
                          type="range"
                          min={0}
                          max={duration}
                          value={playTimeSec}
                          onChange={(e) => setPlayTimeSec(Number(e.target.value))}
                          className="w-full accent-[#1668FF] cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] tabular-nums">
                          <span>00:00</span>
                          <span>{formatSecMMSS(duration)}</span>
                        </div>
                      </div>

                      {trackMode === 'mix' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAFBFD] border border-[#EEF2F7]">
                          <label className="flex items-center gap-2 text-xs text-[#475569]">
                            <span className="w-16">{c.origVolLabel}</span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={origVol}
                              onChange={(e) => setOrigVol(Number(e.target.value))}
                              className="flex-1 accent-[#1668FF]"
                            />
                            <span className="font-mono w-9 text-right">{origVol}%</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-[#475569]">
                            <span className="w-16">{c.intVolLabel}</span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={intVol}
                              onChange={(e) => setIntVol(Number(e.target.value))}
                              className="flex-1 accent-[#1668FF]"
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
                                  {seg.isGap && !seg.resolved && (
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
                    <div className="p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex items-center p-1 rounded-xl bg-[#F1F5F9]">
                          <button
                            type="button"
                            onClick={() => setUtteranceFilter('all')}
                            className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer ${
                              utteranceFilter === 'all' ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#64748B]'
                            }`}
                          >
                            {c.filterAllUtterances}
                          </button>
                          <button
                            type="button"
                            onClick={() => setUtteranceFilter('anomalies')}
                            className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer ${
                              utteranceFilter === 'anomalies'
                                ? 'bg-white text-[#D97706] shadow-2xs'
                                : 'text-[#64748B]'
                            }`}
                          >
                            {c.filterAnomalies}
                          </button>
                        </div>

                        {!selectedRoom.minutes?.publishedLocked && (
                          <button
                            type="button"
                            onClick={handleConfirmTranscriptAll}
                            className="h-9 px-3.5 rounded-xl bg-[#EEF3FF] hover:bg-[#E1EBFF] text-[#1668FF] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{c.confirmTextOkBtn}</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {(selectedRoom.utterances || [])
                          .filter(
                            (u) =>
                              utteranceFilter === 'all' ||
                              u.translationStatus !== 'confirmed' ||
                              !u.translatedText
                          )
                          .map((u) => (
                            <div
                              key={u.id}
                              className="p-4 rounded-xl border border-[#EEF2F7] bg-[#FAFBFD] space-y-2"
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
                              <p className="text-xs text-[#475569] leading-relaxed">{u.sourceText}</p>
                              {editingUttId === u.id ? (
                                <div className="space-y-2 pt-1">
                                  <textarea
                                    rows={2}
                                    value={editingUttDraft}
                                    onChange={(e) => setEditingUttDraft(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-[#1668FF] bg-white text-xs focus:outline-none"
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
                                <div className="flex items-start justify-between gap-3 pt-1">
                                  <p className="text-sm font-medium text-[#111827] leading-relaxed">
                                    {u.translatedText || (
                                      <span className="text-[#DC2626] italic">{u.gapReason || c.gapWarningTag}</span>
                                    )}
                                  </p>
                                  {!selectedRoom.minutes?.publishedLocked && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingUttId(u.id);
                                        setEditingUttDraft(u.translatedText);
                                      }}
                                      className="text-xs text-[#1668FF] hover:underline shrink-0 cursor-pointer"
                                    >
                                      {c.editBtn}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: AI STRUCTURED MINUTES & PUBLISH */}
                  {detailTab === 'minutes' && (
                    <div className="p-5 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {!selectedRoom.minutes?.publishedLocked && (
                            <button
                              type="button"
                              onClick={handleGenerateMinutes}
                              disabled={isGeneratingMinutes}
                              className="h-9 px-4 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isGeneratingMinutes ? c.generatingMinutesBtn : c.generateMinutesBtn}</span>
                            </button>
                          )}

                          {selectedRoom.minutes && !selectedRoom.minutes.publishedLocked && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  updateMinutes({ reviewedConfirmed: true }, 'completed');
                                  onNotify(c.confirmReviewBtn);
                                }}
                                className={`h-9 px-3.5 rounded-xl border text-xs font-medium cursor-pointer ${
                                  selectedRoom.minutes.reviewedConfirmed
                                    ? 'border-[#BBE7CA] bg-[#EDFDF3] text-[#16A34A] font-semibold'
                                    : 'border-[#DCE3EE] bg-white hover:bg-zinc-50 text-[#111827]'
                                }`}
                              >
                                {c.confirmReviewBtn}
                              </button>
                              <button
                                type="button"
                                onClick={handlePublishArchive}
                                className="h-9 px-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer"
                              >
                                {c.publishArchiveBtn}
                              </button>
                            </>
                          )}

                          {selectedRoom.minutes?.publishedLocked && (
                            <span className="h-9 px-3 rounded-xl bg-[#EDFDF3] text-[#16A34A] text-xs font-semibold inline-flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5" />
                              <span>{c.publishedLockedBadge}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              downloadBlob(
                                buildArchiveDocxHtml(selectedRoom),
                                `${selectedRoom.title}.doc`,
                                'application/msword'
                              )
                            }
                            className="h-8 px-2.5 rounded-lg border border-[#DCE3EE] text-[11px] font-medium text-[#475569] hover:bg-zinc-50 inline-flex items-center gap-1 cursor-pointer"
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
                            className="h-8 px-2.5 rounded-lg border border-[#DCE3EE] text-[11px] font-medium text-[#475569] hover:bg-zinc-50 inline-flex items-center gap-1 cursor-pointer"
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
                            className="h-8 px-2.5 rounded-lg border border-[#DCE3EE] text-[11px] font-medium text-[#475569] hover:bg-zinc-50 inline-flex items-center gap-1 cursor-pointer"
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
                            className="h-8 px-2.5 rounded-lg border border-[#DCE3EE] text-[11px] font-medium text-[#1668FF] hover:bg-[#F5F8FD] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{c.copyShareLink}</span>
                          </button>
                        </div>
                      </div>

                      {!selectedRoom.minutes ? (
                        <div className="py-10 text-center rounded-xl border border-dashed border-[#DCE3EE] text-xs text-[#64748B]">
                          {c.generateMinutesBtn}
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold text-[#111827]">{c.minSummary}</div>
                            <textarea
                              rows={3}
                              disabled={selectedRoom.minutes.publishedLocked}
                              value={selectedRoom.minutes.summary}
                              onChange={(e) => updateMinutes({ summary: e.target.value })}
                              className="w-full p-3 rounded-xl border border-[#DCE3EE] text-xs text-[#334155] leading-relaxed disabled:bg-[#FAFBFD] focus:outline-none focus:border-[#1668FF]"
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

                          {/* Action Items Table */}
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-[#111827]">{c.minActions}</div>
                            <div className="overflow-x-auto border border-[#EEF2F7] rounded-xl">
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
                                      <td className="py-2 px-3 text-[#111827]">{act.task}</td>
                                      <td className="py-2 px-3">
                                        <input
                                          type="text"
                                          disabled={selectedRoom.minutes?.publishedLocked}
                                          value={act.owner}
                                          onChange={(e) =>
                                            updateMinutes({
                                              actionItems: selectedRoom.minutes!.actionItems.map((x) =>
                                                x.id === act.id ? { ...x, owner: e.target.value } : x
                                              ),
                                            })
                                          }
                                          className="w-24 px-2 py-1 rounded border border-[#DCE3EE] text-xs disabled:border-transparent"
                                        />
                                      </td>
                                      <td className="py-2 px-3">
                                        <input
                                          type="text"
                                          disabled={selectedRoom.minutes?.publishedLocked}
                                          value={act.deadline}
                                          onChange={(e) =>
                                            updateMinutes({
                                              actionItems: selectedRoom.minutes!.actionItems.map((x) =>
                                                x.id === act.id ? { ...x, deadline: e.target.value } : x
                                              ),
                                            })
                                          }
                                          className="w-24 px-2 py-1 rounded border border-[#DCE3EE] text-xs disabled:border-transparent"
                                        />
                                      </td>
                                      <td className="py-2 px-3 font-mono tabular-nums">
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
                    </div>
                  )}
                </div>
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
