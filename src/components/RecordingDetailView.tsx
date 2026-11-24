import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Cloud,
  Copy,
  Download,
  Edit3,
  FileText,
  Flag,
  Folder,
  GitBranch,
  Mic,
  MoreHorizontal,
  Pause,
  PenLine,
  Play,
  Plus,
  RotateCcw,
  Send,
  Share2,
  Sparkles,
  Square,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  AppLanguage,
  FolderItem,
  MindMapNode,
  RecordingItem,
  SummaryTemplate,
} from '../types/vamx';
import { SUMMARY_LANGUAGES } from '../data/mockData';
import {
  UI_STRINGS,
  formatDateLabelDisplay,
  getFolderDisplayName,
  getLanguageOptionLabel,
  getTemplateDisplay,
} from '../data/uiStrings';
import { WaveformPlayer, formatDuration } from './WaveformPlayer';

export type DetailTab = 'summary' | 'transcript' | 'notes' | 'mindmap' | 'ask';

export interface RecordingSeekTarget {
  seconds: number;
  nonce: number;
  autoPlay?: boolean;
  tab?: DetailTab;
}

interface RecordingDetailViewProps {
  language?: AppLanguage;
  recording: RecordingItem;
  templates: SummaryTemplate[];
  folders?: FolderItem[];
  seekTarget?: RecordingSeekTarget | null;
  onBack?: () => void;
  onUpdateRecording: (updated: RecordingItem) => void;
  onDeleteRecording: (id: string, scope: 'local' | 'cloud') => void;
  onNotify: (msg: string) => void;
}

export const RecordingDetailView: React.FC<RecordingDetailViewProps> = ({
  language = 'zh',
  recording,
  templates,
  folders = [],
  seekTarget,
  onBack,
  onUpdateRecording,
  onDeleteRecording,
  onNotify,
}) => {
  const s = UI_STRINGS[language].detail;
  const c = UI_STRINGS[language].common;
  const aiStrings = UI_STRINGS[language].ai;
  const w = UI_STRINGS[language].waveform;
  const [activeTab, setActiveTab] = useState<DetailTab>('summary');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [showStickyMiniPlayer, setShowStickyMiniPlayer] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainPlayerWrapperRef = useRef<HTMLDivElement>(null);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(recording.title);

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    recording.summary?.templateId || templates[0]?.id || 'meeting'
  );
  const [summaryLang, setSummaryLang] = useState(
    recording.summary?.language || SUMMARY_LANGUAGES[0]
  );
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryStage, setSummaryStage] = useState<0 | 1 | 2>(0);
  const [summaryGeneratingTplName, setSummaryGeneratingTplName] = useState('');
  const [summaryRevealChars, setSummaryRevealChars] = useState<number | null>(null);
  const [summaryAnimKey, setSummaryAnimKey] = useState(0);

  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [mindMapAnimKey, setMindMapAnimKey] = useState(0);

  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [transcriptAnimKey, setTranscriptAnimKey] = useState(0);

  const [notesDraft, setNotesDraft] = useState(recording.notes);
  const [notesSaved, setNotesSaved] = useState(true);

  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [speakerDraft, setSpeakerDraft] = useState('');

  const [askInput, setAskInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [pendingAskQuery, setPendingAskQuery] = useState<string | null>(null);
  const [streamingQaId, setStreamingQaId] = useState<string | null>(null);
  const [qaRevealChars, setQaRevealChars] = useState<number>(0);
  const [attachRecordingContext, setAttachRecordingContext] = useState(true);
  const askEndRef = useRef<HTMLDivElement>(null);
  const [qaHistory, setQaHistory] = useState<
    Array<{
      id: string;
      q: string;
      a: string;
      refs: Array<{ time: string; seconds: number; speaker: string; snippet: string }>;
    }>
  >([]);
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});

  const activeTimeoutsRef = useRef<number[]>([]);
  const streamIntervalsRef = useRef<number[]>([]);

  const clearAllGenerationTimers = () => {
    activeTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    activeTimeoutsRef.current = [];
    streamIntervalsRef.current.forEach((id) => window.clearInterval(id));
    streamIntervalsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllGenerationTimers();
  }, []);

  // Reset local view state smoothly when recording changes
  useEffect(() => {
    clearAllGenerationTimers();
    setTitleDraft(recording.title);
    setNotesDraft(recording.notes);
    setNotesSaved(true);
    setEditingTitle(false);
    setEditingSpeakerId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setQaHistory([]);
    setIsAsking(false);
    setPendingAskQuery(null);
    setStreamingQaId(null);
    setIsGeneratingSummary(false);
    setSummaryRevealChars(null);
    setIsGeneratingMindMap(false);
    setIsGeneratingTranscript(false);
    setAttachRecordingContext(true);
    setShowStickyMiniPlayer(false);
    scrollContainerRef.current?.scrollTo({ top: 0 });
    if (recording.summary) {
      setSelectedTemplateId(recording.summary.templateId);
      setSummaryLang(recording.summary.language);
    }
  }, [recording.id]);

  // Handle explicit jump-to-timestamp requests (e.g. from Ask VAMX citation)
  useEffect(() => {
    if (!seekTarget) return;
    if (seekTarget.tab) {
      setActiveTab(seekTarget.tab);
    }
    setCurrentTime(Math.max(0, Math.min(recording.durationSec, seekTarget.seconds)));
    if (seekTarget.autoPlay) {
      setIsPlaying(true);
    }
  }, [seekTarget?.nonce, recording.id]);

  // Observe when WaveformPlayer scrolls out of view to activate Sticky Mini Player
  useEffect(() => {
    if (activeTab === 'ask') {
      setShowStickyMiniPlayer(false);
      return;
    }
    const root = scrollContainerRef.current;
    const target = mainPlayerWrapperRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyMiniPlayer(!entry.isIntersecting);
      },
      { root, threshold: 0.08 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [recording.id, activeTab]);

  // Keep Ask VAMX conversation scrolled to latest reply
  useEffect(() => {
    if (activeTab === 'ask' && (qaHistory.length > 0 || isAsking)) {
      askEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeTab, qaHistory.length, isAsking]);

  // Smooth playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + playbackRate * 0.25;
        if (next >= recording.durationSec) {
          setIsPlaying(false);
          return recording.durationSec;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [isPlaying, playbackRate, recording.durationSec]);

  const speakerStats = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; chars: number }>();
    recording.transcript.forEach((seg) => {
      const existing = map.get(seg.speakerId);
      if (existing) {
        existing.count += 1;
        existing.chars += seg.text.length;
      } else {
        map.set(seg.speakerId, {
          id: seg.speakerId,
          name: seg.speakerName,
          count: 1,
          chars: seg.text.length,
        });
      }
    });
    const totalChars = Array.from(map.values()).reduce((acc, s) => acc + s.chars, 0) || 1;
    return Array.from(map.values()).map((s) => ({
      ...s,
      pct: Math.round((s.chars / totalChars) * 100),
    }));
  }, [recording.transcript]);

  const progressRatio =
    recording.durationSec > 0
      ? Math.min(1, Math.max(0, currentTime / recording.durationSec))
      : 0;

  const handleCycleRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
  };

  const handleAddHighlight = () => {
    const sec = Math.floor(currentTime);
    const timeStr = formatDuration(sec);
    const matchedSeg = [...recording.transcript]
      .reverse()
      .find((seg) => seg.seconds <= sec);
    const snippet = matchedSeg
      ? matchedSeg.text.slice(0, 32) + (matchedSeg.text.length > 32 ? '…' : '')
      : s.defaultHighlightNote;
    const newItem = {
      id: `hl-${Date.now()}`,
      seconds: sec,
      time: timeStr,
      note: snippet,
    };
    onUpdateRecording({
      ...recording,
      highlights: [...recording.highlights, newItem].sort((a, b) => a.seconds - b.seconds),
    });
    onNotify(s.toastAddedHighlight(timeStr));
  };

  const handleSaveTitle = () => {
    const clean = titleDraft.trim();
    if (clean) {
      onUpdateRecording({ ...recording, title: clean });
      onNotify(s.toastTitleUpdated);
    }
    setEditingTitle(false);
  };

  const handleGenerateSummary = (tplId = selectedTemplateId) => {
    clearAllGenerationTimers();
    const tpl = templates.find((t) => t.id === tplId) || templates[0];
    const tplDisplay = getTemplateDisplay(tpl, language).name;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    setSummaryGeneratingTplName(tplDisplay);
    setSummaryStage(0);
    setSummaryRevealChars(null);
    setIsGeneratingSummary(true);

    const t1 = window.setTimeout(() => setSummaryStage(1), reduced ? 40 : 340);
    const t2 = window.setTimeout(() => setSummaryStage(2), reduced ? 80 : 720);
    const t3 = window.setTimeout(() => {
      const firstLine =
        recording.transcript[0]?.text.slice(0, 48) || recording.durationLabel;
      const overviewBase = s.autoSummaryOverview(
        tplDisplay,
        recording.title.slice(0, 28),
        firstLine
      );

      onUpdateRecording({
        ...recording,
        status: 'transcribed',
        summary: {
          templateId: tpl.id,
          language: summaryLang,
          overview: overviewBase,
          keyPoints:
            recording.summary?.keyPoints.length
              ? recording.summary.keyPoints
              : [s.autoSummaryKp1(tplDisplay), s.autoSummaryKp2],
          decisions: recording.summary?.decisions.length
            ? recording.summary.decisions
            : [s.autoSummaryDecision],
          actions: recording.summary?.actions.length
            ? recording.summary.actions
            : [
                {
                  id: `act-${Date.now()}`,
                  text: s.autoSummaryAction1,
                  owner: s.autoActionOwner1,
                  done: false,
                },
              ],
        },
      });
      setIsGeneratingSummary(false);
      setSummaryAnimKey((k) => k + 1);

      if (!reduced) {
        let chars = 0;
        setSummaryRevealChars(0);
        const step = Math.max(2, Math.ceil(overviewBase.length / 22));
        const iv = window.setInterval(() => {
          chars += step;
          if (chars >= overviewBase.length) {
            setSummaryRevealChars(null);
            window.clearInterval(iv);
          } else {
            setSummaryRevealChars(chars);
          }
        }, 20);
        streamIntervalsRef.current.push(iv);
      }
      onNotify(`${s.toastSummaryReady} (${tplDisplay})`);
    }, reduced ? 160 : 1080);

    activeTimeoutsRef.current.push(t1, t2, t3);
  };

  const handleGenerateMindMap = () => {
    clearAllGenerationTimers();
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setIsGeneratingMindMap(true);
    const tid = window.setTimeout(() => {
      const generated: MindMapNode = recording.mindMap || {
        id: 'mm-gen',
        label: recording.title.slice(0, 18),
        children: [
          {
            id: 'mm-b1',
            label: s.sectionKeyPoints,
            children: [
              { id: 'mm-b1a', label: recording.summary?.keyPoints[0]?.slice(0, 24) || s.autoSummaryKp2 },
              { id: 'mm-b1b', label: recording.summary?.keyPoints[1]?.slice(0, 24) || s.autoSummaryKp3 },
            ],
          },
          {
            id: 'mm-b2',
            label: s.sectionDecisions,
            children: [
              { id: 'mm-b2a', label: recording.summary?.decisions[0]?.slice(0, 24) || s.autoSummaryDecision },
              { id: 'mm-b2b', label: s.autoSummaryAction1 },
            ],
          },
        ],
      };
      onUpdateRecording({ ...recording, mindMap: generated });
      setIsGeneratingMindMap(false);
      setMindMapAnimKey((k) => k + 1);
      onNotify(s.toastMindmapReady);
    }, reduced ? 140 : 940);
    activeTimeoutsRef.current.push(tid);
  };

  const handleGenerateTranscript = () => {
    clearAllGenerationTimers();
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setIsGeneratingTranscript(true);
    const tid = window.setTimeout(() => {
      const midSec = Math.max(8, Math.round(recording.durationSec * 0.45));
      const baseSegs = [
        {
          id: `seg-${Date.now()}-1`,
          time: '00:00',
          seconds: 0,
          speakerId: 'spk-1',
          speakerName: c.speakerDefault,
          text:
            language === 'en'
              ? `Cloud transcription completed for "${recording.title.slice(0, 26)}". Vocals are clear; tap any timestamp to jump directly to the audio.`
              : language === 'vi'
              ? `Đã hoàn tất chép lời đám mây cho "${recording.title.slice(0, 26)}". Nhấn mốc thời gian để nghe lại ngay.`
              : `已完成「${recording.title.slice(0, 22)}」云端高精度转写识别：背景引入与议题对齐部分人声清晰，支持点击时间轴跳转原声。`,
        },
        {
          id: `seg-${Date.now()}-2`,
          time: formatDuration(midSec),
          seconds: midSec,
          speakerId: 'spk-1',
          speakerName: c.speakerDefault,
          text:
            language === 'en'
              ? 'Discussion centers on milestone pacing, scope alignment, and next follow-up items. Switch to Summary for structured takeaways.'
              : language === 'vi'
              ? 'Nội dung xoay quanh tiến độ cột mốc, phạm vi phối hợp và việc cần theo dõi tiếp theo. Chuyển sang Tóm tắt để xem kết luận.'
              : '核心讨论围绕阶段推进节奏、待确认边界以及后续跟进事项展开，可切换至「总结」页一键提炼结构化纪要。',
        },
      ];
      onUpdateRecording({
        ...recording,
        status: 'transcribed',
        transcript: baseSegs,
      });
      setIsGeneratingTranscript(false);
      setTranscriptAnimKey((k) => k + 1);
      onNotify(s.toastTranscriptReady);
    }, reduced ? 140 : 920);
    activeTimeoutsRef.current.push(tid);
  };

  const handleToggleDiarization = () => {
    const nextDiarized = !recording.diarized;
    const updatedTranscript = recording.transcript.map((seg, i) => ({
      ...seg,
      speakerId: nextDiarized ? `spk-${(i % 2) + 1}` : 'spk-1',
      speakerName: nextDiarized ? c.speakerN((i % 2) + 1) : c.speakerDefault,
    }));
    onUpdateRecording({
      ...recording,
      diarized: nextDiarized,
      transcript: updatedTranscript,
    });
    setEditingSpeakerId(null);
    onNotify(nextDiarized ? s.toastSeparatedSpeakers : s.toastMergedSpeakers);
  };

  const handleRenameSpeaker = (speakerId: string) => {
    const clean = speakerDraft.trim();
    if (!clean) {
      setEditingSpeakerId(null);
      return;
    }
    const updatedTranscript = recording.transcript.map((seg) =>
      seg.speakerId === speakerId ? { ...seg, speakerName: clean } : seg
    );
    onUpdateRecording({ ...recording, transcript: updatedTranscript });
    setEditingSpeakerId(null);
    onNotify(s.toastSpeakerUpdated);
  };

  const handleSaveNotes = () => {
    onUpdateRecording({ ...recording, notes: notesDraft });
    setNotesSaved(true);
    onNotify(s.toastNotesSaved);
  };

  const handleAskQuestion = (questionText?: string) => {
    const q = (questionText ?? askInput).trim();
    if (!q || isAsking) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setAskInput('');
    setPendingAskQuery(q);
    setIsAsking(true);

    const tid = window.setTimeout(() => {
      const lowerQ = q.toLowerCase();
      const segs = recording.transcript;
      const keywords = lowerQ
        .replace(/[？?！!，,。.、]/g, ' ')
        .split(/\s+/)
        .filter((k) => k.length >= 2);

      const matchedSegs = segs
        .filter((seg) =>
          keywords.some(
            (k) =>
              seg.text.toLowerCase().includes(k) ||
              seg.speakerName.toLowerCase().includes(k)
          )
        )
        .slice(0, 2);
      const fallbackSegs = matchedSegs.length > 0 ? matchedSegs : segs.slice(0, 2);
      const refs = fallbackSegs.map((seg) => ({
        time: seg.time,
        seconds: seg.seconds,
        speaker: seg.speakerName,
        snippet: seg.text.slice(0, 48) + (seg.text.length > 48 ? '…' : ''),
      }));

      let answer = '';
      if (segs.length === 0 && !recording.summary) {
        answer = s.autoAskDefaultExcerpt;
      } else if (/行动|待办|跟进|action|todo|việc|đầu việc/.test(lowerQ)) {
        const acts = recording.summary?.actions || [];
        if (acts.length > 0) {
          answer =
            `${s.sectionActions} (${acts.length}):\n` +
            acts
              .map(
                (a, idx) =>
                  `${idx + 1}. ${a.done ? '[✓] ' : ''}${a.text}${
                    a.owner ? ` (${s.actionOwnerPrefix}${a.owner})` : ''
                  }`
              )
              .join('\n');
        } else {
          answer = s.autoAskResponse(
            q,
            fallbackSegs[0]?.text.slice(0, 64) || s.autoSummaryAction1,
            fallbackSegs[0]?.time || '00:00'
          );
        }
      } else if (/决策|结论|总结|核心|决定|decision|takeaway|conclusion|kết luận|quyết định/.test(lowerQ)) {
        const decs = recording.summary?.decisions || [];
        const pts = recording.summary?.keyPoints || [];
        const lines: string[] = [];
        if (recording.summary?.overview) lines.push(`${s.sectionOverview}: ${recording.summary.overview}`);
        if (decs.length > 0) lines.push(`${s.sectionDecisions}:\n• ${decs.join('\n• ')}`);
        else if (pts.length > 0) lines.push(`${s.sectionKeyPoints}:\n• ${pts.slice(0, 2).join('\n• ')}`);
        answer =
          lines.join('\n\n') ||
          s.autoAskResponse(q, segs[0]?.text.slice(0, 64) || s.autoAskDefaultExcerpt, segs[0]?.time || '00:00');
      } else if (/重点|标记|笔记|highlight|bookmark|note|đánh dấu|ghi chú/.test(lowerQ)) {
        if (recording.highlights.length > 0) {
          answer =
            `${s.highlightsTitle} (${recording.highlights.length}):\n` +
            recording.highlights.map((h) => `• [${h.time}] ${h.note}`).join('\n') +
            (recording.notes ? `\n\n${s.freeNotesTitle}: ${recording.notes}` : '');
        } else if (recording.notes) {
          answer = `${s.freeNotesTitle}:\n“${recording.notes}”`;
        } else {
          answer = s.noHighlights;
        }
      } else if (/发言人|谁|观点|speaker|người nói/.test(lowerQ)) {
        if (speakerStats.length > 0) {
          const breakdown = speakerStats.map((spk) => {
            const first = segs.find((seg) => seg.speakerId === spk.id);
            return `• ${spk.name} (${spk.pct}%): ${first ? first.text.slice(0, 44) + '…' : '—'}`;
          });
          answer = `${s.speakersCount(speakerStats.length)}:\n${breakdown.join('\n')}`;
        } else {
          answer = s.emptyTranscriptDesc;
        }
      } else if (matchedSegs.length > 0) {
        answer = matchedSegs
          .map((seg) => `• [${seg.time}] ${seg.speakerName}: ${seg.text}`)
          .join('\n');
      } else {
        const excerpt =
          recording.summary?.overview ||
          recording.summary?.keyPoints[0] ||
          fallbackSegs[0]?.text.slice(0, 64) ||
          s.autoAskDefaultExcerpt;
        answer = s.autoAskResponse(q, excerpt, fallbackSegs[0]?.time || '00:00');
      }

      const qaId = `qa-${Date.now()}`;
      setQaHistory((prev) => [
        ...prev,
        {
          id: qaId,
          q,
          a: answer,
          refs,
        },
      ]);
      setPendingAskQuery(null);
      setIsAsking(false);

      if (!reduced) {
        setStreamingQaId(qaId);
        setQaRevealChars(0);
        let chars = 0;
        const step = Math.max(2, Math.ceil(answer.length / 22));
        const iv = window.setInterval(() => {
          chars += step;
          if (chars >= answer.length) {
            setStreamingQaId(null);
            window.clearInterval(iv);
          } else {
            setQaRevealChars(chars);
          }
        }, 20);
        streamIntervalsRef.current.push(iv);
      }
    }, reduced ? 120 : 620);
    activeTimeoutsRef.current.push(tid);
  };

  const handleSaveAiReplyToNotes = (answerText: string) => {
    const clean = `[${s.askHeadline}]\n${answerText}`;
    const nextNotes = notesDraft ? `${notesDraft}\n\n${clean}` : clean;
    setNotesDraft(nextNotes);
    setNotesSaved(true);
    onUpdateRecording({ ...recording, notes: nextNotes });
    onNotify(s.askSavedToNotesToast);
  };

  const handleCopyTranscript = () => {
    const content = recording.transcript.length
      ? recording.transcript.map((seg) => `[${seg.time}] ${seg.speakerName}: ${seg.text}`).join('\n\n')
      : recording.title;
    navigator.clipboard?.writeText(content).catch(() => {});
    setShowMoreMenu(false);
    onNotify(s.toastCopiedTranscript);
  };

  const handleDownloadTxt = (ext: 'txt' | 'md' | 'doc') => {
    const content = [
      `# ${recording.title}`,
      `${formatDateLabelDisplay(recording.dateLabel, language)} · ${recording.durationLabel}`,
      '',
      `## ${s.tabSummary}`,
      recording.summary?.overview || s.emptySummaryTitle,
      '',
      `## ${s.tabTranscript}`,
      ...recording.transcript.map((seg) => `[${seg.time}] ${seg.speakerName}: ${seg.text}`),
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.title.slice(0, 24)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMoreMenu(false);
    onNotify(
      ext === 'doc'
        ? s.toastDownloadedDoc
        : ext === 'md'
        ? s.toastDownloadedMd
        : s.toastDownloadedTxt
    );
  };

  const handleDownloadPdf = () => {
    setShowMoreMenu(false);
    onNotify(s.toastDownloadedPdf);
  };

  const tabs: { id: DetailTab; label: string; count?: number }[] = [
    { id: 'summary', label: s.tabSummary },
    { id: 'transcript', label: s.tabTranscript },
    { id: 'notes', label: s.tabNotes, count: recording.highlights.length },
    { id: 'mindmap', label: s.tabMindmap },
    { id: 'ask', label: s.tabAsk },
  ];

  const statusText =
    recording.status === 'transcribed'
      ? s.statusTranscribed
      : recording.status === 'processing'
      ? s.statusProcessing
      : recording.status === 'pending'
      ? s.statusPending
      : s.statusFailed;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {/* Minimal Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-2 px-4 min-h-[48px] py-1.5 bg-white/95 backdrop-blur-md border-b border-[#EDF2F8] shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={s.backToList}
              className="min-w-[40px] h-10 -ml-2 px-1.5 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F4F7FC] active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {activeTab === 'ask' ? (
            <span className="text-[12.5px] font-medium text-[#111827] leading-snug line-clamp-2">
              {recording.title}
            </span>
          ) : (
            <span className="text-xs font-medium text-[#64748B] truncate">
              {recording.source === 'card'
                ? s.sourceCard
                : recording.source === 'link'
                ? s.sourceLink
                : recording.source === 'import'
                ? s.sourceImport
                : s.sourcePhone}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowMoreMenu(true)}
          aria-label={s.moreActionsAria}
          className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F4F7FC] active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {activeTab === 'ask' ? (
        <>
          {/* Pinned 5-Tab Bar */}
          <div className="shrink-0 bg-white border-b border-[#EDF2F8] px-4 sm:px-6">
            <div className="grid grid-cols-5">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-2.5 text-[12px] sm:text-[13px] text-center whitespace-nowrap truncate transition-colors duration-150 cursor-pointer ${
                      active
                        ? 'text-[#1668FF] font-semibold'
                        : 'text-[#64748B] font-medium hover:text-[#111827]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && tab.count > 0 && (
                      <span
                        className={`ml-0.5 font-mono text-[10.5px] tabular-nums ${
                          active ? 'text-[#1668FF]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                    {active && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#1668FF] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slim Floating Audio Bar ONLY when playing a citation in Ask VAMX */}
          {isPlaying && (
            <div className="shrink-0 bg-[#F4F8FF] border-b border-[#E0EAFF] px-4 py-1.5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                aria-label={s.pauseAudioBarAria}
                className="w-7 h-7 rounded-full bg-[#1668FF] text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Pause className="w-3 h-3 fill-current" />
              </button>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                  setCurrentTime(Math.round(ratio * recording.durationSec));
                }}
                className="flex-1 py-1.5 cursor-pointer"
              >
                <div className="h-1 bg-[#DCE6F8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1668FF] rounded-full transition-all duration-150"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </div>
              </div>
              <span className="font-mono text-[10.5px] text-[#1668FF] tabular-nums shrink-0">
                {formatDuration(currentTime)} / {recording.durationLabel}
              </span>
            </div>
          )}

          {/* Dedicated Full-Height Ask VAMX Workspace */}
          <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFD]">
            <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-5 sm:px-6 py-5 space-y-4">
              {qaHistory.length === 0 && !isAsking ? (
                <div className="pt-2 space-y-5">
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-[#E8EFFD] text-[#1668FF] flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-[22px] font-display font-bold text-[#111827] mt-3 tracking-tight">
                      {s.askHeadline}
                    </h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      {s.askTagline}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2.5">
                    {[
                      s.askDefaultPrompt1,
                      s.askDefaultPrompt2,
                      s.askDefaultPrompt3,
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleAskQuestion(prompt)}
                        className="w-fit max-w-full px-4 py-2.5 rounded-xl bg-white hover:bg-[#F4F8FF] border border-[#E5ECF5] hover:border-[#BFD4FF] text-left text-[13px] font-medium text-[#111827] inline-flex items-center gap-3 transition-colors cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                      >
                        <span className="truncate">{prompt}</span>
                        <ArrowUp className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#94A3B8]">
                      {s.askHistoryCount(qaHistory.length + (pendingAskQuery ? 1 : 0))}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        clearAllGenerationTimers();
                        setIsAsking(false);
                        setPendingAskQuery(null);
                        setStreamingQaId(null);
                        setQaHistory([]);
                      }}
                      className="text-[11px] font-medium text-[#64748B] hover:text-[#1668FF] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{s.askNewChat}</span>
                    </button>
                  </div>
                  {qaHistory.map((item) => {
                    const isStreamingThis = streamingQaId === item.id;
                    const displayedAnswer = isStreamingThis
                      ? item.a.slice(0, qaRevealChars)
                      : item.a;
                    return (
                      <div key={item.id} className="space-y-2.5">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-md bg-[#1668FF] text-white text-xs leading-relaxed">
                            {item.q}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl rounded-tl-md bg-[#F8FAFD] border border-[#E5ECF5] space-y-3 animate-vamx-rise">
                          <p className="text-[13px] leading-[1.65] text-[#1E293B] whitespace-pre-line">
                            {displayedAnswer}
                            {isStreamingThis && (
                              <span
                                aria-hidden="true"
                                className="inline-block w-[2px] h-3.5 bg-[#1668FF] ml-0.5 align-middle animate-pulse"
                              />
                            )}
                          </p>

                          {/* Clickable Audio-Jump Citation Chips */}
                          {!isStreamingThis && item.refs.length > 0 && (
                            <div className="space-y-1.5 pt-1 border-t border-[#E8EEF6] animate-vamx-rise">
                              <div className="text-[11px] font-medium text-[#64748B]">
                                {s.askSourcesHeader}
                              </div>
                              <div className="space-y-1.5">
                                {item.refs.map((ref, rIdx) => (
                                  <button
                                    key={rIdx}
                                    type="button"
                                    onClick={() => {
                                      setCurrentTime(ref.seconds);
                                      setIsPlaying(true);
                                      onNotify(s.toastSeekedTo(ref.time));
                                    }}
                                    style={{ animationDelay: `${rIdx * 65}ms` }}
                                    className="animate-vamx-rise w-full text-left p-2 rounded-xl bg-white hover:bg-[#EEF3FF]/70 border border-[#E5ECF5] hover:border-[#BFD4FF] flex items-start gap-2 transition-colors cursor-pointer"
                                  >
                                    <span className="h-5 px-1.5 rounded-md bg-[#EEF3FF] text-[#1668FF] font-mono text-[10.5px] font-semibold inline-flex items-center gap-1 shrink-0 tabular-nums mt-0.5">
                                      <Play className="w-2.5 h-2.5 fill-current" />
                                      {ref.time}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[11px] font-semibold text-[#111827] mr-1.5">
                                        {ref.speaker}
                                      </span>
                                      <span className="text-[11.5px] text-[#64748B] line-clamp-1">
                                        “{ref.snippet}”
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quick Actions on AI Reply */}
                          {!isStreamingThis && (
                            <div className="flex items-center justify-end gap-2 pt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(item.a).catch(() => {});
                                  onNotify(s.toastCopiedSummary);
                                }}
                                className="h-7 px-2.5 rounded-lg bg-white border border-[#E5ECF5] hover:border-[#1668FF]/40 text-[11px] font-medium text-[#475569] inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{c.copy}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveAiReplyToNotes(item.a)}
                                className="h-7 px-2.5 rounded-lg bg-white border border-[#E5ECF5] hover:border-[#1668FF]/40 text-[11px] font-medium text-[#1668FF] inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <PenLine className="w-3 h-3" />
                                <span>{s.askSaveToNotes}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isAsking && pendingAskQuery && (
                    <div className="space-y-2.5 animate-vamx-rise">
                      <div className="flex justify-end">
                        <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-md bg-[#1668FF] text-white text-xs leading-relaxed">
                          {pendingAskQuery}
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl rounded-tl-md bg-[#F8FAFD] border border-[#E5ECF5] text-xs text-[#64748B]">
                        <Sparkles className="w-3.5 h-3.5 text-[#1668FF]" />
                        <span>{s.askThinking}</span>
                        <span className="inline-flex items-center gap-1 ml-0.5" aria-hidden="true">
                          <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-1" />
                          <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-2" />
                          <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-3" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={askEndRef} />
            </div>

            {/* Pinned Bottom Ask Dock */}
            <div className="shrink-0 bg-[#FAFBFD] px-4 sm:px-5 pt-2 pb-3 space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {attachRecordingContext ? (
                  <span className="inline-flex items-center gap-1.5 max-w-[260px] h-7 px-2.5 rounded-lg bg-[#EAEEF5] text-[11px] font-medium text-[#475569] shrink-0">
                    <span className="truncate">{recording.title}</span>
                    <button
                      type="button"
                      onClick={() => setAttachRecordingContext(false)}
                      aria-label={s.askRemoveContextAria}
                      className="text-[#64748B] hover:text-[#111827] cursor-pointer shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAttachRecordingContext(true)}
                    className="h-7 px-2.5 rounded-lg bg-[#EEF3FF] text-[11px] font-medium text-[#1668FF] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{s.askAttachContext}</span>
                  </button>
                )}

                {qaHistory.length > 0 &&
                  s.askQuickChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleAskQuestion(chip)}
                      className="h-7 px-2.5 rounded-lg bg-white border border-[#E5ECF5] text-[11px] font-medium text-[#475569] hover:text-[#1668FF] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskQuestion();
                }}
                className="rounded-2xl border border-[#DCE5F2] bg-white p-1.5 flex items-center gap-2 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setAttachRecordingContext(true);
                    setAskInput((prev) => prev || s.askQuick1);
                  }}
                  aria-label={s.askQuickMenuAria}
                  className="w-9 h-9 rounded-xl bg-[#F4F7FC] hover:bg-[#EAF0FA] text-[#475569] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  placeholder={s.askInputPlaceholder}
                  className="flex-1 min-w-0 h-9 px-1 text-[13.5px] text-[#111827] placeholder:text-[#94A3B8] focus:outline-none"
                />
                {askInput.trim() ? (
                  <button
                    type="submit"
                    disabled={isAsking}
                    aria-label={s.askSendAria}
                    className="w-9 h-9 rounded-xl bg-[#1668FF] disabled:opacity-45 text-white flex items-center justify-center hover:bg-[#0D59EB] active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAskInput(s.askDefaultPrompt1)}
                    aria-label={s.askVoiceAria}
                    className="w-9 h-9 rounded-xl bg-[#F4F7FC] hover:bg-[#EAF0FA] text-[#475569] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </form>

              <p className="text-center text-[11px] text-[#94A3B8]">
                {aiStrings.disclaimer}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Sticky Mini Audio Player */}
          {showStickyMiniPlayer && (
            <div className="z-20 bg-[#F8FAFD]/95 backdrop-blur-md border-b border-[#E7ECF4] px-4 py-2 flex items-center gap-2.5 shrink-0 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? s.miniPauseAria : s.miniPlayAria}
                className="w-8 h-8 rounded-full bg-[#1668FF] hover:bg-[#0D59EB] text-white flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform shadow-2xs"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" />
                )}
              </button>

              <div
                role="slider"
                aria-label={s.miniSliderAria}
                aria-valuemin={0}
                aria-valuemax={recording.durationSec}
                aria-valuenow={Math.floor(currentTime)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                  setCurrentTime(Math.round(ratio * recording.durationSec));
                }}
                className="flex-1 min-w-0 py-2 cursor-pointer"
              >
                <div className="h-1.5 bg-[#E2E8F4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1668FF] rounded-full transition-all duration-150"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </div>
              </div>

              <span className="font-mono text-[11px] text-[#64748B] tabular-nums shrink-0">
                {formatDuration(currentTime)}
              </span>

              <button
                type="button"
                onClick={handleCycleRate}
                className="h-7 px-2 rounded-lg bg-white border border-[#E5ECF5] text-[11px] font-mono font-medium text-[#111827] hover:border-[#1668FF]/40 cursor-pointer tabular-nums shrink-0"
              >
                {playbackRate}×
              </button>

              <button
                type="button"
                onClick={handleAddHighlight}
                aria-label={w.markBtn}
                title={w.markTitle}
                className="w-8 h-8 rounded-lg hover:bg-white text-[#64748B] hover:text-[#1668FF] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scrollable Body */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto thin-scrollbar px-5 sm:px-6 pt-4 pb-10 space-y-5"
          >
        {/* Title & Unboxed Metadata */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                recording.status === 'transcribed'
                  ? 'bg-emerald-500'
                  : recording.status === 'failed'
                  ? 'bg-[#E53935]'
                  : 'bg-amber-500'
              }`}
            />
            <span className="font-medium text-[#111827]">{statusText}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formatDateLabelDisplay(recording.dateLabel, language)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{recording.durationLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{recording.sizeLabel}</span>
          </div>

          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                autoFocus
                placeholder={s.renamePlaceholder}
                className="flex-1 text-lg sm:text-xl font-display font-bold text-[#111827] bg-[#F8FAFD] border border-[#1668FF] rounded-xl px-3 py-1.5 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="h-9 px-3.5 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer"
              >
                {c.save}
              </button>
            </div>
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              title={s.renameTitleAria}
              className="text-[20px] sm:text-2xl font-display font-bold text-[#111827] leading-snug tracking-tight cursor-pointer hover:text-[#1668FF] transition-colors"
            >
              {recording.title}
            </h1>
          )}
        </div>

        {/* Main Waveform Player (Observed for Sticky Mini Player) */}
        <div ref={mainPlayerWrapperRef}>
          <WaveformPlayer
            language={language}
            waveform={recording.waveform}
            durationSec={recording.durationSec}
            currentTime={currentTime}
            isPlaying={isPlaying}
            playbackRate={playbackRate}
            audioUrl={recording.audioUrl}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onSeek={(sec) => setCurrentTime(sec)}
            onCycleRate={handleCycleRate}
            onAddHighlight={handleAddHighlight}
            onExport={() => setShowMoreMenu(true)}
          />
        </div>

        {/* Clean 5-Tab Navigation */}
        <div className="border-b border-[#EDF2F8] -mx-5 px-4 sm:-mx-6 sm:px-6">
          <div className="grid grid-cols-5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3 text-[12px] sm:text-[13px] text-center whitespace-nowrap truncate transition-colors duration-150 cursor-pointer ${
                    active
                      ? 'text-[#1668FF] font-semibold'
                      : 'text-[#64748B] font-medium hover:text-[#111827]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span
                      className={`ml-0.5 font-mono text-[10.5px] tabular-nums ${
                        active ? 'text-[#1668FF]' : 'text-[#94A3B8]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#1668FF] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="pb-6">
          {/* 1. SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="space-y-5">
              {/* Template & Language Controls */}
              <div className="flex items-center gap-1.5 flex-nowrap">
                <select
                  aria-label={s.summaryTemplateSelectAria}
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    if (recording.summary) {
                      handleGenerateSummary(e.target.value);
                    }
                  }}
                  className="flex-1 min-w-0 h-8 px-2.5 rounded-lg bg-[#F4F7FC] hover:bg-[#EAF0FA] text-xs font-medium text-[#111827] border border-[#E5ECF5] focus:outline-none cursor-pointer truncate"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {s.templatePrefix}{getTemplateDisplay(t, language).name}
                    </option>
                  ))}
                </select>

                <select
                  aria-label={s.summaryLangSelectAria}
                  value={summaryLang}
                  onChange={(e) => setSummaryLang(e.target.value)}
                  className="w-[104px] shrink-0 h-8 px-2 rounded-lg bg-[#F4F7FC] hover:bg-[#EAF0FA] text-xs font-medium text-[#475569] border border-[#E5ECF5] focus:outline-none cursor-pointer truncate"
                >
                  {SUMMARY_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {getLanguageOptionLabel(lang, language)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleGenerateSummary(selectedTemplateId)}
                  disabled={isGeneratingSummary}
                  className="h-8 px-3 rounded-lg bg-[#1668FF] text-white text-xs font-semibold hover:bg-[#0D59EB] active:scale-95 transition-all flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-60 shadow-[0_4px_12px_-4px_rgba(22,104,255,0.4)]"
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 shrink-0 ${isGeneratingSummary ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isGeneratingSummary
                      ? s.generatingBtn
                      : recording.summary
                      ? s.regenerateBtn
                      : s.generateSummaryBtn}
                  </span>
                </button>
              </div>

              {isGeneratingSummary ? (
                <div className="space-y-5 pt-1 animate-vamx-rise" aria-live="polite">
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#F4F8FF] border border-[#DCE7FE]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#1668FF]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {summaryStage === 0
                          ? s.stageReadingAudio
                          : summaryStage === 1
                          ? s.stageDistillingTpl(summaryGeneratingTplName || c.confirm)
                          : s.stagePolishingActions}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 shrink-0" aria-hidden="true">
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-1" />
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-2" />
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-3" />
                    </span>
                  </div>

                  <section className="space-y-2.5">
                    <div className="h-3 w-16 rounded-md vamx-skeleton" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-full rounded-md vamx-skeleton" />
                      <div className="h-3.5 w-[92%] rounded-md vamx-skeleton" />
                      <div className="h-3.5 w-[70%] rounded-md vamx-skeleton" />
                    </div>
                  </section>

                  <div className="h-[1px] bg-[#EDF2F8]" />

                  <section className="space-y-2.5">
                    <div className="h-3 w-16 rounded-md vamx-skeleton" />
                    <div className="space-y-2.5">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <div className="h-3 w-5 rounded vamx-skeleton shrink-0" />
                          <div
                            className="h-3.5 rounded-md vamx-skeleton"
                            style={{ width: idx === 1 ? '86%' : idx === 2 ? '76%' : '94%' }}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="h-[1px] bg-[#EDF2F8]" />

                  <section className="space-y-2.5">
                    <div className="h-3 w-16 rounded-md vamx-skeleton" />
                    <div className="space-y-2">
                      <div className="h-9 w-full rounded-xl vamx-skeleton" />
                      <div className="h-9 w-[85%] rounded-xl vamx-skeleton" />
                    </div>
                  </section>
                </div>
              ) : recording.summary ? (
                <div key={summaryAnimKey} className="space-y-5">
                  <section className="animate-vamx-rise">
                    <h3 className="text-xs font-semibold text-[#64748B] tracking-wide mb-2">
                      {s.sectionOverview}
                    </h3>
                    <p className="text-[14.5px] leading-relaxed text-[#111827]">
                      {summaryRevealChars !== null
                        ? recording.summary.overview.slice(0, summaryRevealChars)
                        : recording.summary.overview}
                      {summaryRevealChars !== null && (
                        <span
                          aria-hidden="true"
                          className="inline-block w-[2px] h-4 bg-[#1668FF] ml-0.5 align-middle animate-pulse"
                        />
                      )}
                    </p>
                  </section>

                  <div className="h-[1px] bg-[#EDF2F8]" />

                  <section
                    className={summaryAnimKey > 0 ? 'animate-vamx-rise' : ''}
                    style={summaryAnimKey > 0 ? { animationDelay: '90ms' } : undefined}
                  >
                    <h3 className="text-xs font-semibold text-[#64748B] tracking-wide mb-2.5">
                      {s.sectionKeyPoints}
                    </h3>
                    <ul className="space-y-2.5">
                      {recording.summary.keyPoints.map((pt, idx) => (
                        <li
                          key={idx}
                          style={
                            summaryAnimKey > 0
                              ? { animationDelay: `${130 + idx * 65}ms` }
                              : undefined
                          }
                          className={`flex items-start gap-2.5 text-[14px] leading-relaxed text-[#1E293B] ${
                            summaryAnimKey > 0 ? 'animate-vamx-rise' : ''
                          }`}
                        >
                          <span className="font-mono text-xs text-[#1668FF] mt-0.5 tabular-nums font-medium">
                            0{idx + 1}.
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {recording.summary.decisions.length > 0 && (
                    <>
                      <div className="h-[1px] bg-[#EDF2F8]" />
                      <section
                        className={summaryAnimKey > 0 ? 'animate-vamx-rise' : ''}
                        style={summaryAnimKey > 0 ? { animationDelay: '220ms' } : undefined}
                      >
                        <h3 className="text-xs font-semibold text-[#64748B] tracking-wide mb-2.5">
                          {s.sectionDecisions}
                        </h3>
                        <ul className="space-y-2">
                          {recording.summary.decisions.map((dec, idx) => (
                            <li key={idx} className="text-[14px] leading-relaxed text-[#1E293B]">
                              • {dec}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </>
                  )}

                  {recording.summary.actions.length > 0 && (
                    <>
                      <div className="h-[1px] bg-[#EDF2F8]" />
                      <section
                        className={summaryAnimKey > 0 ? 'animate-vamx-rise' : ''}
                        style={summaryAnimKey > 0 ? { animationDelay: '290ms' } : undefined}
                      >
                        <h3 className="text-xs font-semibold text-[#64748B] tracking-wide mb-2.5">
                          {s.sectionActions}
                        </h3>
                        <div className="space-y-1.5">
                          {recording.summary.actions.map((act) => (
                            <button
                              key={act.id}
                              type="button"
                              onClick={() => {
                                if (!recording.summary) return;
                                onUpdateRecording({
                                  ...recording,
                                  summary: {
                                    ...recording.summary,
                                    actions: recording.summary.actions.map((a) =>
                                      a.id === act.id ? { ...a, done: !a.done } : a
                                    ),
                                  },
                                });
                              }}
                              className="w-full text-left flex items-start gap-2.5 py-2 px-2 -mx-2 rounded-xl hover:bg-[#F8FAFD] transition-colors cursor-pointer"
                            >
                              {act.done ? (
                                <CheckSquare className="w-4 h-4 text-[#1668FF] mt-0.5 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-[#94A3B8] mt-0.5 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`text-[14px] ${
                                    act.done ? 'line-through text-[#94A3B8]' : 'text-[#1E293B]'
                                  }`}
                                >
                                  {act.text}
                                </span>
                                {act.owner && (
                                  <span className="ml-2 text-xs text-[#64748B]">
                                    · {act.owner}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    </>
                  )}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF3FF] flex items-center justify-center text-[#1668FF] mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-[#111827]">
                    {s.summaryCardEmptyHeadline}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1 mb-4">
                    {s.emptySummaryDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerateSummary(selectedTemplateId)}
                    className="h-10 px-5 rounded-xl bg-[#1668FF] text-white text-xs font-semibold hover:bg-[#0D59EB] active:scale-95 transition-all cursor-pointer shadow-[0_4px_12px_-4px_rgba(22,104,255,0.4)]"
                  >
                    {s.generateSummaryBtn}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. TRANSCRIPT + INTEGRATED SPEAKER MANAGEMENT TAB */}
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              {isGeneratingTranscript ? (
                <div className="space-y-4 py-2 animate-vamx-rise" aria-live="polite">
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#F4F8FF] border border-[#DCE7FE]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#1668FF]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{s.retranscribingStatus}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 shrink-0" aria-hidden="true">
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-1" />
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-2" />
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-3" />
                    </span>
                  </div>
                  <div className="divide-y divide-[#EDF2F8]">
                    {[0, 1, 2].map((row) => (
                      <div key={row} className="py-3.5 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-10 rounded vamx-skeleton" />
                          <div className="h-3 w-14 rounded vamx-skeleton" />
                        </div>
                        <div className="h-3.5 w-full rounded vamx-skeleton" />
                        <div
                          className="h-3.5 rounded vamx-skeleton"
                          style={{ width: row === 1 ? '82%' : '68%' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : recording.transcript.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#64748B] mb-3">{s.emptyTranscriptTitle}</p>
                  <button
                    type="button"
                    onClick={handleGenerateTranscript}
                    className="h-9 px-4 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer shadow-[0_4px_12px_-4px_rgba(22,104,255,0.35)]"
                  >
                    {s.startTranscribeBtn}
                  </button>
                </div>
              ) : (
                <>
                  {/* Integrated Speaker Diarization & Quick Rename Strip */}
                  <div className="p-3 rounded-2xl bg-[#F6F8FC] border border-[#E5ECF5] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-[#475569]">
                        <Users className="w-3.5 h-3.5 text-[#1668FF]" />
                        <span className="font-medium text-[#111827]">
                          {recording.diarized
                            ? s.diarizedSpeakersCount(speakerStats.length)
                            : s.noDiarizationLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleDiarization}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          recording.diarized
                            ? 'bg-white border border-[#DCE5F2] text-[#475569] hover:text-[#111827]'
                            : 'bg-[#1668FF] text-white hover:bg-[#0D59EB]'
                        }`}
                      >
                        {recording.diarized ? s.mergeSpeakersBtn : s.separateSpeakersBtn}
                      </button>
                    </div>

                    {speakerStats.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {speakerStats.map((spk) =>
                          editingSpeakerId === spk.id ? (
                            <div key={spk.id} className="flex items-center gap-1.5 w-full">
                              <input
                                type="text"
                                value={speakerDraft}
                                onChange={(e) => setSpeakerDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameSpeaker(spk.id);
                                  if (e.key === 'Escape') setEditingSpeakerId(null);
                                }}
                                placeholder={s.speakerInputPlaceholder}
                                autoFocus
                                className="flex-1 h-8 px-2.5 text-xs bg-white border border-[#1668FF] rounded-lg focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRenameSpeaker(spk.id)}
                                className="h-8 px-2.5 rounded-lg bg-[#1668FF] text-white text-xs font-medium cursor-pointer"
                              >
                                {s.confirmSpeakerBtn}
                              </button>
                            </div>
                          ) : (
                            <button
                              key={spk.id}
                              type="button"
                              onClick={() => {
                                setEditingSpeakerId(spk.id);
                                setSpeakerDraft(spk.name);
                              }}
                              title={s.clickToEditSpeaker}
                              className="h-7 px-2.5 rounded-lg bg-white border border-[#E5ECF5] hover:border-[#1668FF]/40 text-[11px] text-[#111827] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <span className="font-medium">{spk.name}</span>
                              <span className="font-mono text-[#64748B] tabular-nums">
                                {spk.pct}%
                              </span>
                              <PenLine className="w-2.5 h-2.5 text-[#94A3B8]" />
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div key={transcriptAnimKey} className="divide-y divide-[#EDF2F8]">
                    {recording.transcript.map((seg, idx) => {
                      const isActiveSeg =
                        currentTime >= seg.seconds &&
                        currentTime < seg.seconds + 40;
                      return (
                        <div
                          key={seg.id}
                          onClick={() => {
                            setCurrentTime(seg.seconds);
                            setIsPlaying(true);
                          }}
                          style={
                            transcriptAnimKey > 0
                              ? { animationDelay: `${idx * 90}ms` }
                              : undefined
                          }
                          className={`py-3.5 px-3 -mx-3 rounded-xl transition-colors cursor-pointer ${
                            transcriptAnimKey > 0 ? 'animate-vamx-rise ' : ''
                          }${
                            isActiveSeg
                              ? 'bg-[#EEF3FF]/65'
                              : 'hover:bg-[#F8FAFD]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span
                                className={`font-mono tabular-nums ${
                                  isActiveSeg ? 'text-[#1668FF] font-semibold' : 'text-[#64748B]'
                                }`}
                              >
                                {seg.time}
                              </span>
                              <span aria-hidden="true" className="text-zinc-300">·</span>
                              <span className="font-semibold text-[#111827]">
                                {seg.speakerName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSpeakerId(seg.speakerId);
                                setSpeakerDraft(seg.speakerName);
                              }}
                              aria-label={s.clickToEditSpeaker}
                              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#1668FF] hover:bg-white cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[14.5px] leading-[1.7] text-[#1E293B] whitespace-pre-line">
                            {seg.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 3. NOTES & HIGHLIGHTS MERGED TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Timestamped Highlights Section */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#64748B]">
                    {s.highlightsHeaderCount(recording.highlights.length)}
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="h-8 px-3 rounded-lg bg-[#EEF3FF] hover:bg-[#E0EAFF] text-xs font-semibold text-[#1668FF] inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer tabular-nums"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{s.markCurrentBtn(formatDuration(currentTime))}</span>
                  </button>
                </div>

                {recording.highlights.length === 0 ? (
                  <div className="py-5 px-4 rounded-2xl bg-[#F8FAFD] border border-[#E7ECF4] text-center">
                    <p className="text-xs text-[#64748B]">
                      {s.noHighlights}
                    </p>
                  </div>
                ) : (
                  <div className="border border-[#E5ECF5] rounded-2xl divide-y divide-[#EDF2F8] overflow-hidden">
                    {recording.highlights.map((hl) => (
                      <div
                        key={hl.id}
                        onClick={() => {
                          setCurrentTime(hl.seconds);
                          setIsPlaying(true);
                        }}
                        className="px-3.5 py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-[#F8FAFD] transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="font-mono text-[11px] font-semibold text-[#1668FF] bg-[#EEF3FF] px-2 py-0.5 rounded-md tabular-nums shrink-0 mt-0.5">
                            {hl.time}
                          </span>
                          <p className="text-[13.5px] text-[#111827] leading-relaxed">{hl.note}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateRecording({
                              ...recording,
                              highlights: recording.highlights.filter((h) => h.id !== hl.id),
                            });
                          }}
                          aria-label={s.deleteHighlightAria}
                          className="p-1 text-[#94A3B8] hover:text-[#E53935] cursor-pointer shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="h-[1px] bg-[#EDF2F8]" />

              {/* Personal Written Notes Section */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-[#64748B]">{s.freeNotesTitle}</h3>
                <textarea
                  rows={6}
                  value={notesDraft}
                  onChange={(e) => {
                    setNotesDraft(e.target.value);
                    setNotesSaved(false);
                  }}
                  onBlur={() => {
                    if (!notesSaved && notesDraft !== recording.notes) {
                      onUpdateRecording({ ...recording, notes: notesDraft });
                      setNotesSaved(true);
                    }
                  }}
                  placeholder={s.freeNotesPlaceholder}
                  className="w-full rounded-2xl border border-[#E5ECF5] bg-[#F8FAFD] focus:bg-white p-4 text-sm leading-relaxed text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1668FF] resize-none transition-colors"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const stamp = `[${formatDuration(currentTime)}] `;
                      setNotesDraft((prev) => (prev ? `${prev}\n${stamp}` : stamp));
                      setNotesSaved(false);
                    }}
                    className="h-9 px-3 rounded-xl bg-[#F4F7FC] hover:bg-[#EAF0FA] text-xs font-medium text-[#475569] flex items-center gap-1.5 cursor-pointer tabular-nums"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{s.insertTimeBtn(formatDuration(currentTime))}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      notesSaved
                        ? 'bg-[#F4F7FC] text-[#64748B]'
                        : 'bg-[#1668FF] text-white hover:bg-[#0D59EB] active:scale-95 shadow-[0_4px_12px_-4px_rgba(22,104,255,0.4)]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{notesSaved ? s.notesSavedBtn : s.saveNotesBtn}</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* 4. MIND MAP TAB */}
          {activeTab === 'mindmap' && (
            <div>
              {isGeneratingMindMap ? (
                <div className="space-y-4 animate-vamx-rise" aria-live="polite">
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#F4F8FF] border border-[#DCE7FE]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#1668FF]">
                      <GitBranch className="w-3.5 h-3.5 shrink-0" />
                      <span>{s.mindmapGeneratingDesc}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 shrink-0" aria-hidden="true">
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-1" />
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-2" />
                      <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-3" />
                    </span>
                  </div>

                  {/* Branching Mind Map Skeleton */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#E5ECF5] space-y-3.5">
                    <div className="h-8 w-36 rounded-xl vamx-skeleton" />
                    <div className="ml-2.5 pl-4 border-l border-[#DCE4F0] space-y-3.5">
                      {[0, 1].map((b) => (
                        <div key={b} className="relative space-y-2">
                          <span
                            aria-hidden="true"
                            className="absolute -left-4 top-4 w-3 h-[1px] bg-[#DCE4F0]"
                          />
                          <div className="h-10 w-full rounded-xl vamx-skeleton" />
                          <div className="ml-3 pl-3.5 border-l border-[#E6ECF5] space-y-1.5">
                            <div className="h-8 w-[88%] rounded-xl vamx-skeleton" />
                            <div className="h-8 w-[72%] rounded-xl vamx-skeleton" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : recording.mindMap ? (
                <div key={mindMapAnimKey} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748B]">{s.mindmapSubtitle}</span>
                    <button
                      type="button"
                      onClick={handleGenerateMindMap}
                      className="h-8 px-3 rounded-lg bg-[#F4F7FC] hover:bg-[#EAF0FA] text-xs font-medium text-[#111827] cursor-pointer"
                    >
                      {s.regenerateBtn}
                    </button>
                  </div>

                  {/* Mobile-First Vertical Indented Mind Map Tree */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#E5ECF5] space-y-3.5">
                    <div
                      className={`px-3.5 py-2 rounded-xl bg-[#1668FF] text-white text-xs font-semibold inline-block ${
                        mindMapAnimKey > 0 ? 'animate-vamx-rise' : ''
                      }`}
                    >
                      {recording.mindMap.label}
                    </div>

                    <div className="ml-2.5 pl-4 border-l border-[#DCE4F0] space-y-3">
                      {recording.mindMap.children?.map((branch, bIdx) => {
                        const isCollapsed = !!collapsedBranches[branch.id];
                        const hasLeaves = branch.children && branch.children.length > 0;
                        return (
                          <div
                            key={branch.id}
                            style={
                              mindMapAnimKey > 0
                                ? { animationDelay: `${80 + bIdx * 100}ms` }
                                : undefined
                            }
                            className={`relative ${mindMapAnimKey > 0 ? 'animate-vamx-rise' : ''}`}
                          >
                            <span
                              aria-hidden="true"
                              className="absolute -left-4 top-4 w-3 h-[1px] bg-[#DCE4F0]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                hasLeaves &&
                                setCollapsedBranches((prev) => ({
                                  ...prev,
                                  [branch.id]: !prev[branch.id],
                                }))
                              }
                              className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-white hover:bg-[#EEF3FF]/60 border border-[#E2E9F5] text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                            >
                              <span className="text-xs font-semibold text-[#111827]">
                                {branch.label}
                              </span>
                              {hasLeaves && (
                                <span className="text-[#94A3B8] shrink-0">
                                  {isCollapsed ? (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </span>
                              )}
                            </button>

                            {hasLeaves && !isCollapsed && (
                              <div className="ml-3 pl-3.5 mt-2 border-l border-[#E6ECF5] space-y-1.5">
                                {branch.children!.map((leaf, lIdx) => (
                                  <div
                                    key={leaf.id}
                                    style={
                                      mindMapAnimKey > 0
                                        ? {
                                            animationDelay: `${160 + bIdx * 100 + lIdx * 60}ms`,
                                          }
                                        : undefined
                                    }
                                    className={`relative px-3 py-2 rounded-xl bg-white border border-[#EAEFF7] text-xs text-[#475569] leading-relaxed ${
                                      mindMapAnimKey > 0 ? 'animate-vamx-rise' : ''
                                    }`}
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="absolute -left-3.5 top-4 w-2.5 h-[1px] bg-[#E6ECF5]"
                                    />
                                    {leaf.label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF3FF] flex items-center justify-center text-[#1668FF] mb-3">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-[#111827]">{s.tabMindmap}</p>
                  <p className="text-xs text-[#64748B] mt-1 mb-4">
                    {s.mindmapEmptySubtitle}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateMindMap}
                    disabled={isGeneratingMindMap}
                    className="h-10 px-5 rounded-xl bg-[#1668FF] text-white text-xs font-semibold hover:bg-[#0D59EB] active:scale-95 transition-all cursor-pointer shadow-[0_4px_12px_-4px_rgba(22,104,255,0.4)]"
                  >
                    {s.generateMindmapBtn}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
        </>
      )}

      {/* More Actions Mobile Bottom Sheet */}
      {showMoreMenu && (() => {
        const hasLocalCopy = recording.hasLocal ?? recording.location === 'local';
        const hasCloudCopy = recording.hasCloud ?? recording.location === 'cloud';
        return (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => setShowMoreMenu(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] bg-white rounded-t-3xl border-t border-[#E6ECF5] px-5 pt-3 pb-6 shadow-2xl max-h-[82%] overflow-y-auto thin-scrollbar"
            >
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto mb-2" />
              <div className="flex items-center justify-between pb-2.5 border-b border-[#EDF2F8]">
                <span className="text-base font-display font-bold text-[#111827]">{s.moreTitle}</span>
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(false)}
                  aria-label={s.closeMenuAria}
                  className="w-11 h-11 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-[#EDF2F8]">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setEditingTitle(true);
                  }}
                  className="w-full min-h-[48px] px-1 hover:bg-[#F8FAFD] flex items-center gap-3.5 text-sm text-[#111827] cursor-pointer transition-colors"
                >
                  <Edit3 className="w-[17px] h-[17px] text-[#334155]" />
                  <span>{s.renameRecordingAction}</span>
                </button>

                {folders.length > 0 && (
                  <div className="min-h-[48px] px-1 flex items-center justify-between gap-3 text-sm text-[#111827]">
                    <span className="flex items-center gap-3.5 shrink-0">
                      <Folder className="w-[17px] h-[17px] text-[#334155]" />
                      <span>{s.moveToFolderBtn}</span>
                    </span>
                    <select
                      aria-label={s.moveToFolderBtn}
                      value={recording.folderId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        onUpdateRecording({ ...recording, folderId: nextId });
                        const fObj = folders.find((f) => f.id === nextId);
                        const fName = nextId === 'all' ? c.unfiled : getFolderDisplayName(fObj, language);
                        onNotify(s.toastMovedFolder(fName));
                      }}
                      className="text-xs font-medium text-[#1668FF] bg-transparent focus:outline-none cursor-pointer text-right"
                    >
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.id === 'all' ? c.unfiled : getFolderDisplayName(f, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!hasCloudCopy && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onUpdateRecording({
                        ...recording,
                        hasCloud: true,
                        trashedCloud: false,
                        location: 'cloud',
                      });
                      onNotify(s.toastUploadedCloud);
                    }}
                    className="w-full min-h-[48px] px-1 hover:bg-[#F8FAFD] flex items-center gap-3.5 text-sm text-[#1668FF] font-medium cursor-pointer transition-colors"
                  >
                    <Cloud className="w-[17px] h-[17px]" />
                    <span>{UI_STRINGS[language].sheets.backupToCloud}</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={recording.transcript.length === 0 && !recording.summary}
                  onClick={handleCopyTranscript}
                  className="w-full min-h-[48px] px-1 hover:bg-[#F8FAFD] disabled:hover:bg-transparent flex items-center gap-3.5 text-sm text-[#111827] disabled:text-[#94A3B8] cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <Copy className="w-[17px] h-[17px] text-[#334155] opacity-75" />
                  <span>{s.exportCopyTranscript}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTxt('txt')}
                  className="w-full min-h-[48px] px-1 hover:bg-[#F8FAFD] flex items-center gap-3.5 text-sm text-[#111827] cursor-pointer transition-colors"
                >
                  <FileText className="w-[17px] h-[17px] text-[#334155]" />
                  <span>{s.downloadTxt}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full min-h-[48px] px-1 hover:bg-[#F8FAFD] flex items-center gap-3.5 text-sm text-[#111827] cursor-pointer transition-colors"
                >
                  <FileText className="w-[17px] h-[17px] text-[#334155]" />
                  <span>{s.downloadPdf}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTxt('doc')}
                  className="w-full min-h-[48px] px-1 hover:bg-[#F8FAFD] flex items-center gap-3.5 text-sm text-[#111827] cursor-pointer transition-colors"
                >
                  <Download className="w-[17px] h-[17px] text-[#334155]" />
                  <span>{s.downloadWord}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTxt('md')}
                  className="w-full min-h-[48px] px-1 hover:bg-[#F8FAFD] flex items-center gap-3.5 text-sm text-[#111827] cursor-pointer transition-colors"
                >
                  <Share2 className="w-[17px] h-[17px] text-[#334155]" />
                  <span>{s.exportMarkdownBtn}</span>
                </button>

                <button
                  type="button"
                  disabled={!hasLocalCopy}
                  onClick={() => {
                    setShowMoreMenu(false);
                    onDeleteRecording(recording.id, 'local');
                  }}
                  className="w-full min-h-[48px] px-1 hover:bg-red-50/70 disabled:hover:bg-transparent flex items-center justify-between gap-3 text-sm text-[#D9534F] disabled:text-[#D9534F]/40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <span className="flex items-center gap-3.5">
                    <Trash2 className="w-[17px] h-[17px]" />
                    <span>{s.deleteLocalAction}</span>
                  </span>
                  {!hasLocalCopy && (
                    <span className="text-[11px] text-[#94A3B8]">{s.noLocalCopy}</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!hasCloudCopy}
                  onClick={() => {
                    setShowMoreMenu(false);
                    onDeleteRecording(recording.id, 'cloud');
                  }}
                  className="w-full min-h-[48px] px-1 hover:bg-red-50/70 disabled:hover:bg-transparent flex items-center justify-between gap-3 text-sm text-[#D9534F] disabled:text-[#D9534F]/40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <span className="flex items-center gap-3.5">
                    <Trash2 className="w-[17px] h-[17px]" />
                    <span>{s.deleteCloudAction}</span>
                  </span>
                  {!hasCloudCopy && (
                    <span className="text-[11px] text-[#94A3B8]">{s.noCloudCopy}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
