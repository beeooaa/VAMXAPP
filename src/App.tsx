import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  AudioLines,
  Bluetooth,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  FileAudio,
  Folder,
  FolderOpen,
  FolderPlus,
  Headphones,
  Languages,
  LayoutGrid,
  Mic,
  Monitor,
  MoreHorizontal,
  PenLine,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Smartphone,
  Sparkles,
  Square,
  Trash2,
  Upload,
  User,
  X,
  Zap,
} from 'lucide-react';
import {
  AiChatMessage,
  AppLanguage,
  AutomationConfig,
  CardFileItem,
  DeviceInfo,
  FolderItem,
  InterpretationRoom,
  NavTab,
  RecordingItem,
  SummaryTemplate,
  TransferTask,
  TranslationBlock,
  UserProfileState,
} from './types/vamx';
import {
  I18N,
  INITIAL_AI_MESSAGES,
  INITIAL_AUTOMATION,
  INITIAL_CARD_FILES,
  INITIAL_DEVICE,
  INITIAL_FOLDERS,
  INITIAL_RECORDINGS,
  INITIAL_ROOMS,
  INITIAL_TEMPLATES,
  INITIAL_TRANSFERS,
  INITIAL_TRANSLATION_BLOCKS,
  INITIAL_USER_PROFILE,
  NEARBY_DEVICE_CANDIDATES,
} from './data/mockData';
import {
  UI_STRINGS,
  formatDateLabelDisplay,
  getFolderDisplayName,
} from './data/uiStrings';
import { DeviceCardVisual } from './components/DeviceCardVisual';
import { RecordingDetailView, RecordingSeekTarget } from './components/RecordingDetailView';
import { LiveRecordSheet } from './components/LiveRecordSheet';
import { RealTimeTranslationView } from './components/RealTimeTranslationView';
import { InterpretationRoomView } from './components/InterpretationRoomView';
import { AiWorkbenchView } from './components/AiWorkbenchView';
import { ProfileSettingsView, ProfileSheetType } from './components/ProfileSettingsView';
import { ImportFilesSheet, ImportSheetMode } from './components/ImportFilesSheet';
import { FloatingPipSubtitle } from './components/FloatingPipSubtitle';
import { formatDuration } from './components/WaveformPlayer';

const STORAGE_KEY = 'vamx_app_state_v1';

interface PersistedAppState {
  language?: AppLanguage;
  transcriptionLang?: string;
  device?: DeviceInfo;
  automation?: AutomationConfig;
  templates?: SummaryTemplate[];
  folders?: FolderItem[];
  recordings?: RecordingItem[];
  rooms?: InterpretationRoom[];
  transfers?: TransferTask[];
  cardFiles?: CardFileItem[];
  userProfile?: UserProfileState;
  aiMessages?: AiChatMessage[];
  authStatus?: 'signed_in' | 'signed_out' | 'deleted';
}

const loadPersistedState = (): PersistedAppState => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return {};
  }
};

const hasLocalCopy = (r: RecordingItem) => Boolean(r.hasLocal ?? r.location === 'local');
const hasCloudCopy = (r: RecordingItem) => Boolean(r.hasCloud ?? r.location === 'cloud');
const isLocalActive = (r: RecordingItem) => hasLocalCopy(r) && !r.trashedLocal && !r.trashed;
const isCloudActive = (r: RecordingItem) => hasCloudCopy(r) && !r.trashedCloud && !r.trashed;
const isRecordingActive = (r: RecordingItem) => isLocalActive(r) || isCloudActive(r);
const isRecordingInTrash = (r: RecordingItem) =>
  Boolean(r.trashed || r.trashedLocal || r.trashedCloud);

const parseSizeToMb = (sizeLabel?: string): number => {
  if (!sizeLabel) return 0;
  const match = sizeLabel.trim().match(/^([\d.]+)\s*(KB|MB|GB)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  if (!Number.isFinite(val)) return 0;
  const unit = match[2].toUpperCase();
  if (unit === 'GB') return val * 1024;
  if (unit === 'KB') return val / 1024;
  return val;
};

const formatMbLabel = (totalMb: number): string => {
  if (totalMb <= 0) return '0 MB';
  if (totalMb >= 1024) return `${(totalMb / 1024).toFixed(2)} GB`;
  return `${totalMb.toFixed(1)} MB`;
};

const TRANSLATION_STREAM_SAMPLES: Array<{ src: string; tgt: string }> = [
  {
    src: '本次会议我们重点对齐 Q4 海外市场的本地化交付节奏，请各研发团队先确认接口冻结日期。',
    tgt: 'In this session we will align on Q4 localization delivery milestones; engineering teams please confirm API freeze dates first.',
  },
  {
    src: '硬件录音卡已切换至低功耗直连模式，当前延迟稳定在 180 毫秒以内。',
    tgt: 'The hardware voice card is now in low-power direct mode, keeping end-to-end latency steadily under 180 milliseconds.',
  },
  {
    src: '所有双语字幕可通过画中画悬浮在任意页面上方，自由拖动停靠边角。',
    tgt: 'Bilingual subtitles stay floating above any screen in Picture-in-Picture mode and snap cleanly to screen corners.',
  },
];

export default function App() {
  const [persisted] = useState<PersistedAppState>(() => loadPersistedState());
  const [authStatus, setAuthStatus] = useState<'signed_in' | 'signed_out' | 'deleted'>(
    persisted.authStatus ?? 'signed_in'
  );
  const [loginInput, setLoginInput] = useState(
    persisted.userProfile?.userEmail || INITIAL_USER_PROFILE.userEmail
  );
  const [loginPwd, setLoginPwd] = useState('');
  const [language, setLanguage] = useState<AppLanguage>(persisted.language ?? 'zh');
  const [transcriptionLang, setTranscriptionLang] = useState(
    persisted.transcriptionLang ?? '不确定/混合'
  );
  const [activeTab, setActiveTab] = useState<NavTab>('files');
  const [prevRootTab, setPrevRootTab] = useState<'files' | 'toolbox'>('files');
  // Mobile-first primary experience by default; optional wide-screen toggle for desktop users
  const [desktopMode, setDesktopMode] = useState(false);

  const [cardFiles, setCardFiles] = useState<CardFileItem[]>(
    persisted.cardFiles ?? INITIAL_CARD_FILES
  );
  const [device, setDevice] = useState<DeviceInfo>(() => {
    const base = persisted.device ?? INITIAL_DEVICE;
    const files = persisted.cardFiles ?? INITIAL_CARD_FILES;
    return {
      ...base,
      pendingCount: files.filter((f) => !f.imported).length,
    };
  });
  const [automation, setAutomation] = useState<AutomationConfig>(
    persisted.automation ?? INITIAL_AUTOMATION
  );
  const [templates, setTemplates] = useState<SummaryTemplate[]>(
    persisted.templates ?? INITIAL_TEMPLATES
  );
  const [folders, setFolders] = useState<FolderItem[]>(persisted.folders ?? INITIAL_FOLDERS);
  const [recordings, setRecordings] = useState<RecordingItem[]>(
    persisted.recordings ?? INITIAL_RECORDINGS
  );
  const [rooms, setRooms] = useState<InterpretationRoom[]>(persisted.rooms ?? INITIAL_ROOMS);
  const [transfers, setTransfers] = useState<TransferTask[]>(
    persisted.transfers ?? INITIAL_TRANSFERS
  );
  const [userProfile, setUserProfile] = useState<UserProfileState>(
    persisted.userProfile ?? INITIAL_USER_PROFILE
  );
  const [translationBlocks, setTranslationBlocks] = useState<TranslationBlock[]>(
    INITIAL_TRANSLATION_BLOCKS
  );
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>(
    persisted.aiMessages ?? INITIAL_AI_MESSAGES
  );

  // Files & Search state
  const [libSearch, setLibSearch] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [libFilter, setLibFilter] = useState<'all' | 'local' | 'cloud' | 'pending' | 'trash'>('all');
  const [libFolderId, setLibFolderId] = useState('all');
  const [selectedRecId, setSelectedRecId] = useState<string | null>(
    (persisted.recordings ?? INITIAL_RECORDINGS)[0]?.id ?? null
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [seekTarget, setSeekTarget] = useState<RecordingSeekTarget | null>(null);
  const [showFolderSheet, setShowFolderSheet] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Quick row actions & clean batch selection mode
  const [rowMenuRecId, setRowMenuRecId] = useState<string | null>(null);
  const [rowRenameDraft, setRowRenameDraft] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchMoveSheet, setShowBatchMoveSheet] = useState(false);

  // Fast Transfer simulation state
  const [isFastSyncing, setIsFastSyncing] = useState(false);
  const [fastSyncProgress, setFastSyncProgress] = useState(38);

  // Overlays & Live States
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordPaused, setIsRecordPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [liveRecordNotes, setLiveRecordNotes] = useState<
    Array<{ time: string; seconds: number; text: string }>
  >([]);
  const [showLiveRecordSheet, setShowLiveRecordSheet] = useState(false);
  const [showLiveTranslate, setShowLiveTranslate] = useState(false);
  const [translationListening, setTranslationListening] = useState(false);
  const [translationElapsed, setTranslationElapsed] = useState(0);
  const [translationAudioInput, setTranslationAudioInput] = useState<'card' | 'phone'>(() => {
    const dev = persisted.device ?? INITIAL_DEVICE;
    return dev.bound !== false && dev.connected ? 'card' : 'phone';
  });
  const [translationSourceLang, setTranslationSourceLang] = useState('中文');
  const [translationTargetLang, setTranslationTargetLang] = useState('英语');
  const [showTranslationPip, setShowTranslationPip] = useState(false);
  const [pipShowSource, setPipShowSource] = useState(true);
  const [translationAutoSpeak, setTranslationAutoSpeak] = useState(false);
  const [translationTtsRate, setTranslationTtsRate] = useState(1);

  const [showImportSheet, setShowImportSheet] = useState(false);
  const [importSheetMode, setImportSheetMode] = useState<ImportSheetMode>('menu');
  const [showDeviceQuickSheet, setShowDeviceQuickSheet] = useState(false);
  const [quickScanOpen, setQuickScanOpen] = useState(false);
  const [quickScanning, setQuickScanning] = useState(false);
  const [profileSheet, setProfileSheet] = useState<ProfileSheetType>(null);

  const handleQuickScanDevices = () => {
    setQuickScanOpen(true);
    setQuickScanning(true);
    window.setTimeout(() => {
      setQuickScanning(false);
    }, 550);
  };

  const openImportAudio = () => {
    setImportSheetMode('menu');
    setShowImportSheet(true);
  };

  const openDeviceFiles = () => {
    setImportSheetMode('device');
    setShowImportSheet(true);
  };

  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const appShellRef = useRef<HTMLDivElement | null>(null);
  const phoneAudioPickerRef = useRef<HTMLInputElement | null>(null);
  const translationElapsedRef = useRef(0);
  translationElapsedRef.current = translationElapsed;
  const translationSampleIdxRef = useRef(0);

  const t = I18N[language];
  const ui = UI_STRINGS[language];

  const handlePhoneAudioPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const objectUrl = URL.createObjectURL(file);
    const sizeLabel =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const finalizeImport = (durSec: number) => {
      const nowId = Date.now();
      const newRec: RecordingItem = {
        id: `rec-phone-pick-${nowId}`,
        title: file.name,
        dateLabel: '手机文件',
        timestamp: new Date().toISOString(),
        durationSec: durSec,
        durationLabel: formatDuration(durSec),
        sizeLabel,
        source: 'import',
        location: 'local',
        hasLocal: true,
        hasCloud: false,
        status: 'transcribed',
        folderId: 'all',
        tags: [ui.common.localImportDate],
        diarized: false,
        audioUrl: objectUrl,
        waveform: Array.from({ length: 56 }, (_, i) =>
          Number((0.2 + Math.abs(Math.cos(i * 0.6)) * 0.7).toFixed(2))
        ),
        highlights: [],
        notes: '',
        transcript: [
          {
            id: `seg-pick-${nowId}`,
            time: '00:00',
            seconds: 0,
            speakerId: 'spk-1',
            speakerName: ui.common.speakerDefault,
            text:
              language === 'en'
                ? `Imported "${file.name}" from your phone. Play above to listen or generate an AI summary.`
                : language === 'vi'
                ? `Đã nhập "${file.name}" từ điện thoại. Nhấn phát ở trên để nghe hoặc tạo tóm tắt AI.`
                : `已从手机选择并导入音频「${file.name}」，可直接在顶部播放器试听与总结。`,
          },
        ],
      };
      setRecordings((prev) => [newRec, ...prev]);
      setSelectedRecId(newRec.id);
      setShowDeviceQuickSheet(false);
      setProfileSheet(null);
      setActiveTab('files');
      setMobileDetailOpen(true);
      notify(ui.toasts.importedFromPhone(file.name));
    };

    const audio = new Audio(objectUrl);
    audio.addEventListener('loadedmetadata', () => {
      const dur = Number.isFinite(audio.duration) ? Math.max(1, Math.round(audio.duration)) : 60;
      finalizeImport(dur);
    });
    audio.addEventListener('error', () => {
      finalizeImport(45);
    });
    e.target.value = '';
  };

  const notify = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2400);
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang =
      language === 'zh' ? 'zh-CN' : language === 'vi' ? 'vi' : 'en';
    document.title =
      language === 'en'
        ? 'VAMX — Smart Acoustic & AI Voice Workbench'
        : language === 'vi'
        ? 'VAMX — Trợ lý Ghi âm Thông minh & AI'
        : 'VAMX — 智能声学与 AI 纪要工作台';
  }, [language]);

  const speakTranslatedText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang =
        translationTargetLang === '英语'
          ? 'en-US'
          : translationTargetLang === '日语'
          ? 'ja-JP'
          : translationTargetLang === '越南语'
          ? 'vi-VN'
          : 'zh-CN';
      utter.rate = translationTtsRate;
      window.speechSynthesis.speak(utter);
    }
  };

  const openLiveTranslate = () => {
    setShowLiveTranslate(true);
    setTranslationListening(true);
  };

  const handleSelectTranslationAudioInput = (next: 'card' | 'phone') => {
    if (next === 'card') {
      if (device.bound === false) {
        setTranslationAudioInput('phone');
        setShowDeviceQuickSheet(true);
        notify(ui.toasts.bindCardFirst);
        return;
      }
      if (!device.connected) {
        setDevice((d) => ({ ...d, connected: true }));
        setTranslationAudioInput('card');
        notify(ui.toasts.connectedAndSwitchedCard(device.name));
        return;
      }
    }
    setTranslationAudioInput(next);
    notify(
      next === 'card'
        ? ui.toasts.switchedToCard(device.name)
        : ui.toasts.switchedToPhone
    );
  };

  // Keep device.pendingCount & live audio input synced with real state
  const pendingCardCount = useMemo(
    () => cardFiles.filter((f) => !f.imported).length,
    [cardFiles]
  );

  useEffect(() => {
    setDevice((prev) =>
      prev.pendingCount === pendingCardCount ? prev : { ...prev, pendingCount: pendingCardCount }
    );
  }, [pendingCardCount]);

  useEffect(() => {
    if ((device.bound === false || !device.connected) && translationAudioInput === 'card') {
      setTranslationAudioInput('phone');
    }
  }, [device.bound, device.connected, translationAudioInput]);

  // Persist workspace state locally (strip transient blob: URLs)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const serializableRecordings = recordings.map((r) =>
        r.audioUrl?.startsWith('blob:') ? { ...r, audioUrl: undefined } : r
      );
      const payload: PersistedAppState = {
        language,
        transcriptionLang,
        device,
        automation,
        templates,
        folders,
        recordings: serializableRecordings,
        rooms,
        transfers,
        cardFiles,
        userProfile,
        aiMessages,
        authStatus,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    language,
    transcriptionLang,
    device,
    automation,
    templates,
    folders,
    recordings,
    rooms,
    transfers,
    cardFiles,
    userProfile,
    aiMessages,
    authStatus,
  ]);

  // Live recording timer
  useEffect(() => {
    if (!isRecording || isRecordPaused) return;
    const timer = window.setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRecording, isRecordPaused]);

  // Live translation timer (runs independently across full view & floating Apple PiP)
  useEffect(() => {
    if ((!showLiveTranslate && !showTranslationPip) || !translationListening) return;
    const timer = window.setInterval(() => {
      setTranslationElapsed((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [showLiveTranslate, showTranslationPip, translationListening]);

  // Stream incoming translation blocks while translation or PiP is active
  useEffect(() => {
    if ((!showLiveTranslate && !showTranslationPip) || !translationListening) return;
    const timer = window.setInterval(() => {
      const sample =
        TRANSLATION_STREAM_SAMPLES[
          translationSampleIdxRef.current % TRANSLATION_STREAM_SAMPLES.length
        ];
      translationSampleIdxRef.current += 1;
      const newBlock: TranslationBlock = {
        id: `tb-${Date.now()}`,
        time: formatDuration(translationElapsedRef.current),
        sourceText: sample.src,
        translatedText: sample.tgt,
        isFinal: true,
      };
      setTranslationBlocks((prev) => [...prev, newBlock]);
      if (translationAutoSpeak) {
        speakTranslatedText(sample.tgt);
      }
    }, 5500);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLiveTranslate, showTranslationPip, translationListening, translationAutoSpeak, translationTargetLang, translationTtsRate]);

  // Quick Cmd/Ctrl + K focus on Files search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTab('files');
        setMobileDetailOpen(false);
        setShowSearchBar(true);
        window.setTimeout(() => {
          document.getElementById('vamx-lib-search')?.focus();
        }, 40);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const activeRecordings = useMemo(
    () => recordings.filter((rec) => isRecordingActive(rec)),
    [recordings]
  );

  const trashedRecordings = useMemo(
    () => recordings.filter((rec) => isRecordingInTrash(rec)),
    [recordings]
  );

  const localStorageLabel = useMemo(() => {
    const totalMb = recordings.reduce((acc, rec) => {
      if (!isLocalActive(rec)) return acc;
      return acc + parseSizeToMb(rec.sizeLabel);
    }, 0);
    return formatMbLabel(totalMb);
  }, [recordings]);

  const filteredRecordings = useMemo(() => {
    return recordings.filter((rec) => {
      if (libFilter === 'trash') {
        if (!isRecordingInTrash(rec)) return false;
      } else {
        if (!isRecordingActive(rec)) return false;
        if (libFilter === 'local' && !isLocalActive(rec)) return false;
        if (libFilter === 'cloud' && !isCloudActive(rec)) return false;
        if (libFilter === 'pending' && rec.status !== 'pending' && rec.status !== 'failed')
          return false;
        if (libFolderId !== 'all' && rec.folderId !== libFolderId) return false;
      }
      if (libSearch.trim()) {
        const q = libSearch.toLowerCase();
        const hay = `${rec.title} ${rec.tags.join(' ')} ${rec.notes} ${rec.transcript
          .map((s) => s.text)
          .join(' ')}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [recordings, libFilter, libFolderId, libSearch]);

  const selectedRecording = useMemo(
    () =>
      activeRecordings.find((r) => r.id === selectedRecId) ||
      (libFilter === 'trash' ? null : filteredRecordings[0]) ||
      null,
    [activeRecordings, selectedRecId, libFilter, filteredRecordings]
  );

  const currentScopeLabel = useMemo(() => {
    if (libFilter === 'trash') return t.trash;
    if (libFolderId !== 'all') {
      return getFolderDisplayName(folders.find((f) => f.id === libFolderId), language);
    }
    if (libFilter === 'local') return t.local;
    if (libFilter === 'cloud') return t.cloud;
    if (libFilter === 'pending') return t.pending;
    return t.allFiles;
  }, [libFolderId, libFilter, folders, language, t.allFiles, t.trash, t.local, t.cloud, t.pending]);

  const liveRoomsCount = useMemo(
    () => rooms.filter((r) => !r.trashed && r.status === 'live').length,
    [rooms]
  );

  const navigateToSubView = (target: 'ai' | 'rooms' | 'profile', sheet: ProfileSheetType = null) => {
    if (activeTab === 'files' || activeTab === 'toolbox') {
      setPrevRootTab(activeTab);
    }
    setShowLiveTranslate(false);
    setMobileDetailOpen(false);
    setProfileSheet(sheet);
    setActiveTab(target);
  };

  const handleStartQuickRecord = () => {
    setShowDeviceQuickSheet(false);
    if (isRecording) {
      setShowLiveRecordSheet(true);
      return;
    }
    setRecordSeconds(0);
    setLiveRecordNotes([]);
    setIsRecordPaused(false);
    setIsRecording(true);
    setShowLiveRecordSheet(true);
    if (device.bound === false || !device.connected) {
      notify(ui.toasts.usingPhoneMic);
    }
  };

  const handleRefreshCardFiles = () => {
    const hasPending = cardFiles.some((f) => !f.imported);
    if (!hasPending) {
      const nowDate = new Date();
      const stamp = `${nowDate.getFullYear()}${String(nowDate.getMonth() + 1).padStart(2, '0')}${String(
        nowDate.getDate()
      ).padStart(2, '0')}${String(nowDate.getHours()).padStart(2, '0')}${String(
        nowDate.getMinutes()
      ).padStart(2, '0')}${String(nowDate.getSeconds()).padStart(2, '0')}`;
      const newFile: CardFileItem = {
        id: `cf-scan-${Date.now()}`,
        name: `${stamp}.mp3`,
        date: nowDate.toLocaleString('sv-SE').slice(0, 19),
        duration: '06:24',
        durationSec: 384,
        size: '2.4 MB',
        imported: false,
        progress: 0,
      };
      setCardFiles((prev) => [newFile, ...prev]);
      notify(ui.toasts.scannedOneNew);
      return;
    }
    notify(ui.toasts.refreshedPending(cardFiles.filter((f) => !f.imported).length));
  };

  const handleTriggerFastSync = () => {
    if (device.bound === false || !device.connected || isFastSyncing) return;
    setIsFastSyncing(true);
    setFastSyncProgress(68);
    window.setTimeout(() => {
      setFastSyncProgress(100);
      const pendingCardItems = cardFiles.filter((f) => !f.imported);
      if (pendingCardItems.length > 0) {
        setCardFiles((prev) => prev.map((f) => ({ ...f, imported: true, progress: 100 })));
      }
      setRecordings((prev) => {
        const existingTitles = new Set(prev.map((r) => r.title));
        const importedFromCard: RecordingItem[] = pendingCardItems
          .filter((cf) => !existingTitles.has(cf.name))
          .map((cf, idx) => ({
            id: `rec-fast-${Date.now()}-${idx}`,
            title: cf.name,
            dateLabel: '刚刚 · 录音卡快传',
            timestamp: cf.date || new Date().toISOString(),
            durationSec: cf.durationSec,
            durationLabel: cf.duration,
            sizeLabel: cf.size,
            source: 'card',
            location: 'cloud',
            hasLocal: true,
            hasCloud: true,
            status: 'transcribed',
            folderId: 'all',
            tags: [ui.detail.sourceCard],
            diarized: true,
            waveform: Array.from({ length: 56 }, (_, i) =>
              Number((0.22 + Math.abs(Math.sin(i * 0.55 + idx)) * 0.7).toFixed(2))
            ),
            highlights: [],
            notes: '',
            transcript: [
              {
                id: `seg-fast-${Date.now()}-${idx}`,
                time: '00:00',
                seconds: 0,
                speakerId: 'spk-1',
                speakerName: ui.common.speakerN(1),
                text:
                  language === 'en'
                    ? `Synced "${cf.name}" via VAMX Wi-Fi Fast Transfer to local & cloud with transcription complete.`
                    : language === 'vi'
                    ? `Đã đồng bộ "${cf.name}" qua VAMX Wi-Fi truyền nhanh và hoàn tất chép lời.`
                    : `已通过 VAMX Wi-Fi 快传将「${cf.name}」同步至本机与云端，并完成转写。`,
              },
            ],
          }));

        const updatedExisting = prev.map((r) =>
          r.status === 'pending'
            ? {
                ...r,
                status: 'transcribed' as const,
                location: 'cloud' as const,
                hasCloud: true,
                transcript: [
                  {
                    id: `seg-sync-${Date.now()}`,
                    time: '00:00',
                    seconds: 0,
                    speakerId: 'spk-1',
                    speakerName: ui.common.speakerDefault,
                    text:
                      language === 'en'
                        ? `Completed VAMX Wi-Fi Fast Sync and auto-transcription for "${r.title}".`
                        : language === 'vi'
                        ? `Đã đồng bộ nhanh Wi-Fi VAMX và chép lời xong cho "${r.title}".`
                        : `已通过 VAMX Wi-Fi 快传完成「${r.title}」的音频同步与自动转写。`,
                  },
                ],
              }
            : r
        );
        return [...importedFromCard, ...updatedExisting];
      });
      setDevice((d) => ({ ...d, syncing: false, pendingCount: 0 }));
      setIsFastSyncing(false);
      setFastSyncProgress(38);
      notify(
        pendingCardItems.length > 0
          ? ui.toasts.fastSyncImported(pendingCardItems.length)
          : ui.toasts.fastSyncDone
      );
    }, 650);
  };

  const handleStopAndSaveRecording = () => {
    const dur = Math.max(3, recordSeconds);
    const durLabel = formatDuration(dur);
    const id = `rec-live-${Date.now()}`;
    const title = `${ui.toasts.liveRecTitlePrefix} ${new Date().toLocaleTimeString(
      language === 'zh' ? 'zh-CN' : language === 'vi' ? 'vi-VN' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )}`;
    const useCard = device.bound !== false && device.connected;
    const newRec: RecordingItem = {
      id,
      title,
      dateLabel: '刚刚',
      timestamp: new Date().toISOString(),
      durationSec: dur,
      durationLabel: durLabel,
      sizeLabel: `${Math.max(24, Math.round(dur * 3.9))} KB`,
      source: useCard ? 'card' : 'phone',
      location: automation.autoUploadToCloud ? 'cloud' : 'local',
      hasLocal: true,
      hasCloud: automation.autoUploadToCloud,
      status: automation.autoTranscribeAfterUpload ? 'transcribed' : 'pending',
      folderId: 'all',
      tags: [useCard ? ui.detail.sourceCard : ui.detail.sourcePhone],
      diarized: false,
      waveform: Array.from({ length: 56 }, (_, i) =>
        Number((0.2 + Math.abs(Math.sin(i * 0.63 + dur)) * 0.72).toFixed(2))
      ),
      highlights: liveRecordNotes.map((n, i) => ({
        id: `hl-live-${i}`,
        seconds: n.seconds,
        time: n.time,
        note: n.text,
      })),
      notes: liveRecordNotes.map((n) => `[${n.time}] ${n.text}`).join('\n'),
      transcript: automation.autoTranscribeAfterUpload
        ? [
            {
              id: `seg-live-${Date.now()}`,
              time: '00:00',
              seconds: 0,
              speakerId: 'spk-1',
              speakerName: ui.common.speakerDefault,
              text:
                liveRecordNotes.length > 0
                  ? language === 'en'
                    ? `Live recording transcribed and archived, including your highlight note at ${liveRecordNotes[0].time}: "${liveRecordNotes[0].text}".`
                    : language === 'vi'
                    ? `Bản ghi trực tiếp đã được chép lời và lưu trữ, kèm ghi chú lúc ${liveRecordNotes[0].time}: "${liveRecordNotes[0].text}".`
                    : `本次实时录音已自动转写归档，其中包含你在 ${liveRecordNotes[0].time} 记录的关键备注：“${liveRecordNotes[0].text}”。`
                  : language === 'en'
                  ? `Completed ${durLabel} live recording and transcription. Tap "Generate Summary" for key takeaways.`
                  : language === 'vi'
                  ? `Đã hoàn tất ghi âm trực tiếp ${durLabel} và chép lời. Nhấn "Tạo tóm tắt" để trích xuất ý chính.`
                  : `已完成 ${durLabel} 实时声学录制并同步转写，可点击“生成总结”提炼核心要点。`,
            },
          ]
        : [],
    };

    setRecordings((prev) => [newRec, ...prev]);
    setIsRecording(false);
    setIsRecordPaused(false);
    setRecordSeconds(0);
    setLiveRecordNotes([]);
    setShowLiveRecordSheet(false);
    setSelectedRecId(id);
    setActiveTab('files');
    setMobileDetailOpen(true);
    notify(ui.toasts.savedLiveRecording(title));
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFolderName.trim();
    if (!clean) return;
    const f: FolderItem = { id: `fld-${Date.now()}`, name: clean };
    setFolders((prev) => [...prev, f]);
    setLibFolderId(f.id);
    setLibFilter('all');
    setNewFolderName('');
    setShowNewFolderModal(false);
    setShowFolderSheet(false);
    notify(ui.toasts.createdFolder(clean));
  };

  const handleRetryFailedRecording = (rec: RecordingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordings((prev) =>
      prev.map((r) =>
        r.id === rec.id
          ? {
              ...r,
              status: 'transcribed',
              transcript: [
                {
                  id: `seg-retry-${Date.now()}`,
                  time: '00:00',
                  seconds: 0,
                  speakerId: 'spk-1',
                  speakerName: ui.common.speakerDefault,
                  text:
                    language === 'en'
                      ? `Completed resumed upload and cloud transcription recovery for "${rec.title}".`
                      : language === 'vi'
                      ? `Đã khôi phục tải lên và hoàn tất chép lời đám mây cho "${rec.title}".`
                      : `已完成「${rec.title}」的断点重传与云端转写恢复。`,
                },
              ],
            }
          : r
      )
    );
    notify(ui.toasts.retriedRecording(rec.title));
  };

  const handleDeleteRecording = (id: string, scope: 'local' | 'cloud') => {
    const target = recordings.find((r) => r.id === id);
    if (!target) return;

    let stillActive = false;
    setRecordings((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const localPresent = hasLocalCopy(r);
        const cloudPresent = hasCloudCopy(r);
        if (scope === 'local') {
          const cloudRemains = cloudPresent && !r.trashedCloud && !r.trashed;
          stillActive = cloudRemains;
          return {
            ...r,
            hasLocal: localPresent,
            hasCloud: cloudPresent,
            trashedLocal: true,
            trashed: !cloudRemains,
            trashedAt: '刚刚',
          };
        }
        const localRemains = localPresent && !r.trashedLocal && !r.trashed;
        stillActive = localRemains;
        return {
          ...r,
          hasLocal: localPresent,
          hasCloud: cloudPresent,
          trashedCloud: true,
          trashed: !localRemains,
          trashedAt: '刚刚',
        };
      })
    );

    if (!stillActive) {
      if (selectedRecId === id) setSelectedRecId(null);
      setMobileDetailOpen(false);
      notify(
        scope === 'local'
          ? ui.toasts.deletedLocalAndTrashed
          : ui.toasts.deletedCloudAndTrashed
      );
    } else {
      notify(
        scope === 'local'
          ? ui.toasts.deletedLocalKeptCloud
          : ui.toasts.deletedCloudKeptLocal
      );
    }
  };

  const handleRestoreRecording = (id: string) => {
    setRecordings((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              trashed: false,
              trashedLocal: false,
              trashedCloud: false,
              trashedAt: undefined,
            }
          : r
      )
    );
    notify(ui.toasts.restoredFromTrash);
  };

  const handlePermanentDeleteRecording = (id: string) => {
    setRecordings((prev) => {
      const next: RecordingItem[] = [];
      for (const r of prev) {
        if (r.id !== id) {
          next.push(r);
          continue;
        }
        const keepLocal = isLocalActive(r);
        const keepCloud = isCloudActive(r);
        if (keepLocal || keepCloud) {
          next.push({
            ...r,
            hasLocal: keepLocal,
            hasCloud: keepCloud,
            location: keepCloud ? 'cloud' : 'local',
            trashed: false,
            trashedLocal: false,
            trashedCloud: false,
            trashedAt: undefined,
          });
        }
      }
      return next;
    });
    notify(ui.toasts.permanentlyDeleted);
  };

  const handleEmptyTrash = () => {
    setRecordings((prev) => {
      const next: RecordingItem[] = [];
      for (const r of prev) {
        if (!isRecordingInTrash(r)) {
          next.push(r);
          continue;
        }
        const keepLocal = isLocalActive(r);
        const keepCloud = isCloudActive(r);
        if (keepLocal || keepCloud) {
          next.push({
            ...r,
            hasLocal: keepLocal,
            hasCloud: keepCloud,
            location: keepCloud ? 'cloud' : 'local',
            trashed: false,
            trashedLocal: false,
            trashedCloud: false,
            trashedAt: undefined,
          });
        }
      }
      return next;
    });
    notify(ui.toasts.emptiedTrash);
  };

  const handleResetDemoData = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setLanguage('zh');
    setTranscriptionLang('不确定/混合');
    setDevice(INITIAL_DEVICE);
    setAutomation(INITIAL_AUTOMATION);
    setTemplates(INITIAL_TEMPLATES);
    setFolders(INITIAL_FOLDERS);
    setRecordings(INITIAL_RECORDINGS);
    setRooms(INITIAL_ROOMS);
    setTransfers(INITIAL_TRANSFERS);
    setCardFiles(INITIAL_CARD_FILES);
    setUserProfile(INITIAL_USER_PROFILE);
    setAiMessages(INITIAL_AI_MESSAGES);
    setSelectedRecId(INITIAL_RECORDINGS[0]?.id ?? null);
    setLibFilter('all');
    setLibFolderId('all');
    setProfileSheet(null);
    setAuthStatus('signed_in');
    notify(UI_STRINGS.zh.toasts.resetAllDone);
  };

  const handleLogout = () => {
    setIsRecording(false);
    setIsRecordPaused(false);
    setShowLiveRecordSheet(false);
    setShowLiveTranslate(false);
    setShowTranslationPip(false);
    setTranslationListening(false);
    setProfileSheet(null);
    setMobileDetailOpen(false);
    setLoginInput(userProfile.userEmail || userProfile.userPhone || '');
    setLoginPwd('');
    setAuthStatus('signed_out');
    notify(ui.toasts.loggedOut);
  };

  const handleDeleteAccount = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setIsRecording(false);
    setIsRecordPaused(false);
    setShowLiveRecordSheet(false);
    setShowLiveTranslate(false);
    setShowTranslationPip(false);
    setTranslationListening(false);
    setProfileSheet(null);
    setMobileDetailOpen(false);
    setRecordings([]);
    setRooms([]);
    setTransfers([]);
    setCardFiles([]);
    setAiMessages([]);
    setSelectedRecId(null);
    setDevice({
      ...INITIAL_DEVICE,
      bound: false,
      connected: false,
      pendingCount: 0,
    });
    setUserProfile({
      userName: '',
      userEmail: '',
      userPhone: '',
      credits: 0,
      lastCheckInDate: null,
      notifyOnDone: true,
    });
    setLoginInput('');
    setLoginPwd('');
    setActiveTab('files');
    setAuthStatus('deleted');
    notify(ui.toasts.accountDeleted);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = loginInput.trim();
    if (!account) {
      notify(ui.auth.errEmptyAccount);
      return;
    }
    if (!loginPwd.trim()) {
      notify(ui.auth.errEmptyPwd);
      return;
    }
    const isEmail = account.includes('@');
    if (authStatus === 'deleted' || !userProfile.userName) {
      const displayName =
        (isEmail ? account.split('@')[0] : account).slice(0, 12) || ui.toasts.defaultUserName;
      setUserProfile({
        userName: displayName,
        userEmail: isEmail ? account : '',
        userPhone: isEmail ? '' : account,
        credits: 150,
        lastCheckInDate: null,
        notifyOnDone: true,
      });
      setFolders(INITIAL_FOLDERS);
      setTemplates(INITIAL_TEMPLATES);
      setAutomation(INITIAL_AUTOMATION);
    }
    setActiveTab('files');
    setAuthStatus('signed_in');
    setLoginPwd('');
    notify(ui.auth.toastWelcomeBack(account));
  };

  const rowMenuRec = useMemo(
    () => recordings.find((r) => r.id === rowMenuRecId) ?? null,
    [recordings, rowMenuRecId]
  );

  const openRowMenu = (rec: RecordingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRowRenameDraft(rec.title);
    setRowMenuRecId(rec.id);
  };

  const handleRowRenameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rowMenuRec) return;
    const clean = rowRenameDraft.trim();
    if (!clean) return;
    setRecordings((prev) =>
      prev.map((r) => (r.id === rowMenuRec.id ? { ...r, title: clean } : r))
    );
    setRowMenuRecId(null);
    notify(ui.toasts.renamedRecording);
  };

  const handleToggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchMoveFolder = (folderId: string) => {
    if (selectedIds.length === 0) return;
    setRecordings((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, folderId } : r))
    );
    const folderName = getFolderDisplayName(
      folders.find((f) => f.id === folderId),
      language
    );
    const count = selectedIds.length;
    setShowBatchMoveSheet(false);
    setSelectionMode(false);
    setSelectedIds([]);
    notify(ui.toasts.batchMoved(count, folderName));
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    setRecordings((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id)
          ? {
              ...r,
              trashed: true,
              trashedLocal: hasLocalCopy(r),
              trashedCloud: hasCloudCopy(r),
              trashedAt: '刚刚',
            }
          : r
      )
    );
    if (selectedRecId && selectedIds.includes(selectedRecId)) {
      setSelectedRecId(null);
      setMobileDetailOpen(false);
    }
    setSelectionMode(false);
    setSelectedIds([]);
    notify(ui.toasts.batchDeleted(count));
  };

  const handleRetryTransfer = (id: string) => {
    setTransfers((prev) =>
      prev.map((tf) => (tf.id === id ? { ...tf, status: 'transferring', progress: 78 } : tf))
    );
    window.setTimeout(() => {
      setTransfers((prev) =>
        prev.map((tf) => (tf.id === id ? { ...tf, status: 'completed', progress: 100 } : tf))
      );
      notify(ui.toasts.transferResumed);
    }, 350);
  };

  const desktopNavItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'files', label: t.allFiles, icon: <Folder className="w-[19px] h-[19px]" /> },
    { id: 'toolbox', label: t.navToolbox, icon: <LayoutGrid className="w-[19px] h-[19px]" /> },
    { id: 'ai', label: t.navAi, icon: <Sparkles className="w-[19px] h-[19px]" /> },
    { id: 'rooms', label: t.navRooms, icon: <Headphones className="w-[19px] h-[19px]" /> },
    { id: 'profile', label: t.navProfile, icon: <User className="w-[19px] h-[19px]" /> },
  ];

  const isRootTab = activeTab === 'files' || activeTab === 'toolbox';
  const isMobileFullPush =
    showLiveTranslate || (!desktopMode && activeTab === 'files' && mobileDetailOpen);
  const isSubPagePush = !desktopMode && !showLiveTranslate && !isRootTab;
  const showMobileBottomDock = !isMobileFullPush && isRootTab;

  return (
    <div
      className={`min-h-[100dvh] text-[#111827] ${
        desktopMode
          ? 'bg-[#F5F7FB]'
          : 'bg-white sm:bg-[#EAEFF7] sm:flex sm:flex-col sm:items-center sm:justify-center sm:py-4 sm:px-4'
      }`}
    >
      {/* Subtle Desktop Studio Bar (Only visible on >= sm screens when viewing the Mobile App) */}
      {!desktopMode && (
        <div className="hidden sm:flex items-center justify-between w-full max-w-[420px] mb-2.5 px-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Smartphone className="w-3.5 h-3.5 text-[#1668FF]" />
            <span className="font-medium text-[#111827]">{ui.sidebar.modeMobile}</span>
          </div>
          <button
            type="button"
            onClick={() => setDesktopMode(true)}
            className="h-7 px-2.5 rounded-full bg-white/90 hover:bg-white border border-[#DCE5F2] text-[11px] font-medium text-zinc-600 hover:text-[#1668FF] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Monitor className="w-3 h-3" />
            <span>{ui.sidebar.modeDesktop}</span>
          </button>
        </div>
      )}

      {/* APP VIEWPORT SHELL */}
      <div
        ref={appShellRef}
        className={
          desktopMode
            ? 'min-h-screen flex flex-col lg:flex-row relative'
            : 'w-full h-[100dvh] sm:max-w-[420px] sm:h-[min(852px,calc(100dvh-64px))] bg-white sm:rounded-[32px] sm:border sm:border-[#D9E2EF] sm:shadow-[0_24px_60px_-15px_rgba(20,40,80,0.16)] overflow-hidden flex flex-col relative transform-gpu'
        }
      >
        {authStatus !== 'signed_in' ? (
          <div className="flex-1 flex flex-col justify-between px-6 py-10 bg-white overflow-y-auto">
            <div className="max-w-sm w-full mx-auto my-auto space-y-6">
              <div className="space-y-2.5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1668FF] text-white flex items-center justify-center mx-auto shadow-[0_8px_20px_-6px_rgba(22,104,255,0.45)]">
                  <AudioLines className="w-6 h-6" />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
                  VAMX
                </h1>
                <p className="text-xs text-[#64748B]">{ui.auth.tagline}</p>
              </div>

              {authStatus === 'deleted' && (
                <div className="p-3.5 rounded-2xl bg-[#F6F8FC] border border-[#E5ECF5] text-xs text-[#64748B] leading-relaxed text-center">
                  {ui.auth.deletedBanner}
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#64748B]">{ui.auth.emailOrPhoneInputLabel}</label>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder={ui.auth.phoneOrEmailPlaceholder}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F6F8FC] border border-[#E3EAF5] text-sm text-[#111827] placeholder:text-zinc-400 focus:outline-none focus:border-[#1668FF] focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#64748B]">{ui.auth.passwordLabel}</label>
                  <input
                    type="password"
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                    placeholder={ui.auth.loginPwdPlaceholder}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F6F8FC] border border-[#E3EAF5] text-sm text-[#111827] placeholder:text-zinc-400 focus:outline-none focus:border-[#1668FF] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-2xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-sm font-semibold cursor-pointer shadow-[0_6px_16px_-6px_rgba(22,104,255,0.45)]"
                >
                  {authStatus === 'deleted' ? ui.auth.registerAndSignIn : ui.auth.signInVamx}
                </button>
              </form>

              {authStatus === 'signed_out' && (userProfile.userEmail || userProfile.userPhone) && (
                <button
                  type="button"
                  onClick={() => {
                    const acct = userProfile.userEmail || userProfile.userPhone;
                    setActiveTab('files');
                    setAuthStatus('signed_in');
                    notify(ui.auth.toastResignedIn(acct));
                  }}
                  className="w-full h-11 rounded-2xl border border-[#DCE5F2] bg-white hover:bg-[#F8FAFD] text-xs font-semibold text-[#1668FF] cursor-pointer"
                >
                  {ui.auth.quickContinueWith(userProfile.userEmail || userProfile.userPhone)}
                </button>
              )}

              {authStatus === 'deleted' && (
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  className="w-full py-2 text-xs font-medium text-[#64748B] hover:text-[#1668FF] cursor-pointer"
                >
                  {ui.auth.restoreDemoExperience}
                </button>
              )}
            </div>

            <p className="text-center text-[11px] text-zinc-400">
              VAMX Voice Workspace
            </p>
          </div>
        ) : (
        <>
        {/* DESKTOP LEFT NAVIGATION RAIL (When user explicitly toggles Desktop Wide Mode) */}
        {desktopMode && (
          <aside className="hidden lg:flex lg:w-[244px] lg:shrink-0 lg:flex-col bg-white border-r border-zinc-200/80 sticky top-0 h-screen px-4 py-5 justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1668FF] text-white flex items-center justify-center shadow-xs">
                    <AudioLines className="w-4 h-4" />
                  </div>
                  <span className="font-display text-lg font-bold tracking-tight text-[#111827]">
                    VAMX
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDesktopMode(false)}
                  title={ui.files.desktopBackToMobile}
                  aria-label={ui.files.desktopBackToMobile}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-[#1668FF] cursor-pointer transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleStartQuickRecord}
                className={`w-full h-11 rounded-xl px-3.5 flex items-center justify-between text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer ${
                  isRecording
                    ? 'bg-[#E55B5B] text-white'
                    : 'bg-[#1668FF] hover:bg-[#0D59EB] text-white shadow-[0_4px_12px_-4px_rgba(22,104,255,0.4)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? ui.sidebar.recordingNow : t.quickRecord}</span>
                </span>
                {isRecording ? (
                  <span className="font-mono tabular-nums">{formatDuration(recordSeconds)}</span>
                ) : (
                  <span className="font-mono text-[10px] text-white/60">REC</span>
                )}
              </button>

              <nav className="space-y-1">
                {desktopNavItems.map((item) => {
                  const active = activeTab === item.id && !showLiveTranslate;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setShowLiveTranslate(false);
                        setActiveTab(item.id);
                      }}
                      className={`w-full h-10 px-3 rounded-xl flex items-center gap-3 text-[13.5px] font-medium transition-colors duration-150 cursor-pointer ${
                        active
                          ? 'bg-[#EEF3FF] text-[#1668FF] font-semibold'
                          : 'text-zinc-500 hover:text-[#111827] hover:bg-zinc-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={() => setProfileSheet('device')}
              className="w-full p-3 rounded-2xl bg-[#F6F8FC] hover:bg-[#EEF3FF] border border-[#E6ECF5] text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111827] truncate">
                  {device.bound === false ? ui.sidebar.unboundDevice : device.name}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    device.bound !== false && device.connected ? 'bg-emerald-500' : 'bg-zinc-300'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1 tabular-nums">
                <span>
                  {device.bound === false
                    ? ui.sidebar.tapToBind
                    : device.connected
                    ? ui.sidebar.battery(device.battery)
                    : t.disconnected}
                </span>
                <span>{device.bound === false ? '--' : `${device.usedMb} MB`}</span>
              </div>
            </button>
          </aside>
        )}

        {/* MOBILE TOP APP BAR (Root: Device Icon + Search/AI + User; Sub-pages: Crisp Back Bar) */}
        {!isMobileFullPush && (
          <header
            className={`${
              desktopMode ? 'flex lg:hidden' : 'flex'
            } sticky top-0 z-30 h-12 px-4 items-center justify-between shrink-0 ${
              isSubPagePush
                ? 'bg-white border-b border-[#EDF2F8]'
                : activeTab === 'toolbox'
                ? 'bg-[#F5F8FD]/95 backdrop-blur-md'
                : 'bg-white/95 backdrop-blur-md'
            }`}
          >
            {isSubPagePush ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setProfileSheet(null);
                    setActiveTab(prevRootTab);
                  }}
                  aria-label={t.back}
                  className="min-w-[44px] h-11 -ml-2 px-2 rounded-full hover:bg-zinc-100 flex items-center gap-1 text-sm font-medium text-[#111827] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.back}</span>
                </button>
                <span className="font-display text-sm font-bold text-[#111827] truncate">
                  {activeTab === 'ai'
                    ? t.navAi
                    : activeTab === 'rooms'
                    ? t.roomsTitle
                    : t.profileTitle}
                </span>
                <div className="w-11" aria-hidden="true" />
              </>
            ) : (
              <>
                {/* Top-Left: Minimalist Hardware Card Status Trigger */}
                <button
                  type="button"
                  onClick={() => setShowDeviceQuickSheet(true)}
                  aria-label={ui.files.headerDeviceAria}
                  className="min-h-[44px] -ml-1.5 px-1.5 rounded-xl hover:bg-[#F3F6FC] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="relative w-[20px] h-[24px] rounded-[4px] border-[1.5px] border-[#111827]/85 bg-white flex flex-col items-center justify-between py-[3px] px-[2.5px] shadow-2xs">
                    {/* Left status edge indicator matching hardware state */}
                    <span
                      className={`absolute -left-[2px] top-[3px] bottom-[3px] w-[2.5px] rounded-full ${
                        isRecording
                          ? 'bg-[#EF4444] animate-pulse'
                          : device.bound !== false && device.connected
                          ? 'bg-emerald-500'
                          : 'bg-zinc-300'
                      }`}
                    />
                    <span className="w-2.5 h-[2.5px] rounded-[1px] bg-[#111827]/80" />
                    <span className="w-1.5 h-[1.5px] rounded-full bg-[#1668FF]/70 self-end" />
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* Center: Live Recording Indicator Pill (Only when actively recording) */}
                {isRecording ? (
                  <button
                    type="button"
                    onClick={() => setShowLiveRecordSheet(true)}
                    className="h-8 px-3 rounded-full bg-[#E55B5B] text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 tabular-nums cursor-pointer shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{formatDuration(recordSeconds)}</span>
                  </button>
                ) : (
                  <div />
                )}

                {/* Top-Right: Search/AI & Profile */}
                <div className="flex items-center gap-0.5 -mr-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab !== 'files') {
                        setActiveTab('files');
                      }
                      setShowSearchBar((prev) => {
                        const next = activeTab !== 'files' ? true : !prev;
                        if (next) {
                          window.setTimeout(() => {
                            document.getElementById('vamx-lib-search')?.focus();
                          }, 50);
                        }
                        return next;
                      });
                    }}
                    aria-label={ui.files.headerSearchAria}
                    className={`relative w-11 h-11 rounded-full hover:bg-[#F3F6FC] flex items-center justify-center transition-colors cursor-pointer ${
                      showSearchBar && activeTab === 'files' ? 'text-[#1668FF]' : 'text-[#111827]'
                    }`}
                  >
                    <Search className="w-[18px] h-[18px]" />
                    <Sparkles className="w-2.5 h-2.5 text-[#1668FF] absolute top-2.5 right-2" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToSubView('profile')}
                    aria-label={ui.files.headerProfileAria}
                    className="w-11 h-11 rounded-full hover:bg-[#F3F6FC] flex items-center justify-center text-[#111827] transition-colors cursor-pointer"
                  >
                    <User className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </>
            )}
          </header>
        )}

        {/* MAIN CONTENT WORKSPACE */}
        <main
          className={
            desktopMode
              ? 'flex-1 min-w-0 pb-20 lg:pb-8 px-4 sm:px-6 lg:px-8 py-5 lg:py-6 max-w-7xl w-full mx-auto'
              : isMobileFullPush || activeTab === 'ai'
              ? 'flex-1 min-h-0 flex flex-col overflow-hidden'
              : activeTab === 'toolbox'
              ? 'flex-1 min-h-0 overflow-y-auto no-scrollbar bg-[#F5F8FD] px-4 pt-2 pb-10'
              : 'flex-1 min-h-0 overflow-y-auto no-scrollbar bg-white px-5 pt-1 pb-10'
          }
        >
          {/* LIVE TRANSLATION FULL-SCREEN PUSH WORKSPACE */}
          {showLiveTranslate ? (
            <div className={desktopMode ? 'h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)]' : 'h-full flex-1 min-h-0'}>
              <RealTimeTranslationView
                device={device}
                blocks={translationBlocks}
                sourceLang={translationSourceLang}
                targetLang={translationTargetLang}
                audioInput={translationAudioInput}
                isListening={translationListening}
                elapsedSec={translationElapsed}
                showPip={showTranslationPip}
                autoSpeak={translationAutoSpeak}
                ttsRate={translationTtsRate}
                language={language}
                onChangeSourceLang={setTranslationSourceLang}
                onChangeTargetLang={setTranslationTargetLang}
                onSwapLanguages={() => {
                  setTranslationSourceLang(translationTargetLang);
                  setTranslationTargetLang(translationSourceLang);
                }}
                onSelectAudioInput={handleSelectTranslationAudioInput}
                onToggleListening={() => setTranslationListening((v) => !v)}
                onTogglePip={() => {
                  setShowTranslationPip((prev) => {
                    const next = !prev;
                    if (next) {
                      notify(ui.toasts.pipEnabled);
                    }
                    return next;
                  });
                }}
                onToggleAutoSpeak={() => setTranslationAutoSpeak((v) => !v)}
                onChangeTtsRate={setTranslationTtsRate}
                onSpeakText={(text) => {
                  speakTranslatedText(text);
                  notify(ui.toasts.readingAloud);
                }}
                onBack={() => {
                  setShowLiveTranslate(false);
                  if (!showTranslationPip) {
                    setTranslationListening(false);
                  }
                }}
                onEndTranslation={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  setShowLiveTranslate(false);
                  setShowTranslationPip(false);
                  setTranslationListening(false);
                  setTranslationElapsed(0);
                  notify(ui.toasts.endTranslation);
                }}
                onNotify={notify}
              />
            </div>
          ) : (
            <>
              {/* 1. FILES TAB ("全部文件" Plaud-inspired Minimalist Home + VAMX Identity) */}
              {activeTab === 'files' && (
                <div
                  className={
                    desktopMode
                      ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-52px)]'
                      : 'h-full'
                  }
                >
                  {/* RECORDINGS LIST PANE */}
                  <div
                    className={`${
                      desktopMode
                        ? mobileDetailOpen
                          ? 'hidden lg:flex lg:col-span-5 lg:flex-col'
                          : 'flex flex-col lg:col-span-5'
                        : mobileDetailOpen
                        ? 'hidden'
                        : 'flex flex-col'
                    }`}
                  >
                    {/* Bold Minimalist Title + Scope Dropdown */}
                    <div className="flex items-center justify-between gap-2 pt-1 pb-3">
                      <button
                        type="button"
                        onClick={() => setShowFolderSheet(true)}
                        className="min-h-[44px] inline-flex items-center gap-1.5 text-left group cursor-pointer"
                      >
                        <h1 className="text-[28px] font-display font-bold tracking-tight text-[#111827] leading-none">
                          {currentScopeLabel}
                        </h1>
                        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-[#1668FF] transition-colors mt-1" />
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-zinc-400 tabular-nums">
                          {filteredRecordings.length} {ui.common.itemsUnit}
                        </span>
                        {filteredRecordings.length > 0 && libFilter !== 'trash' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectionMode((prev) => !prev);
                              setSelectedIds([]);
                            }}
                            className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              selectionMode
                                ? 'bg-[#1668FF] text-white'
                                : 'text-[#64748B] hover:bg-[#F3F6FC] hover:text-[#111827]'
                            }`}
                          >
                            {selectionMode ? ui.files.cancelMultiSelect : ui.files.multiSelect}
                          </button>
                        )}
                        {desktopMode && (
                          <button
                            type="button"
                            onClick={openImportAudio}
                            className="h-9 px-3 rounded-xl bg-white border border-[#E5ECF5] hover:border-[#1668FF]/40 text-xs font-medium text-[#111827] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#1668FF]" />
                            <span>{t.importBtn}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Batch Selection Toolbar */}
                    {selectionMode && libFilter !== 'trash' && (
                      <div className="mb-3 px-3 py-2 rounded-xl bg-[#EEF3FF] border border-[#D6E4FF] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedIds.length === filteredRecordings.length) {
                                setSelectedIds([]);
                              } else {
                                setSelectedIds(filteredRecordings.map((r) => r.id));
                              }
                            }}
                            className="text-xs font-semibold text-[#1668FF] hover:underline cursor-pointer"
                          >
                            {selectedIds.length === filteredRecordings.length ? ui.files.deselectAll : ui.files.selectAll}
                          </button>
                          <span className="text-xs text-[#64748B] tabular-nums">
                            {ui.files.selectedCount(selectedIds.length)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={selectedIds.length === 0}
                            onClick={() => setShowBatchMoveSheet(true)}
                            className="h-7 px-2.5 rounded-lg bg-white border border-[#D6E4FF] text-xs font-medium text-[#111827] disabled:opacity-45 cursor-pointer"
                          >
                            {ui.files.batchMove}
                          </button>
                          <button
                            type="button"
                            disabled={selectedIds.length === 0}
                            onClick={handleBatchDelete}
                            className="h-7 px-2.5 rounded-lg bg-white border border-red-200 text-xs font-medium text-[#E53935] disabled:opacity-45 cursor-pointer"
                          >
                            {ui.files.batchDelete}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expandable Instant Search Bar (On mobile toggle or always in Desktop Mode) */}
                    {(desktopMode || showSearchBar || libSearch.trim().length > 0) && (
                      <div className="mb-3 flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="vamx-lib-search"
                            type="text"
                            value={libSearch}
                            onChange={(e) => setLibSearch(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full h-10 pl-9 pr-8 rounded-xl bg-[#F4F7FC] border border-[#E3EAF5] text-xs text-[#111827] placeholder:text-zinc-400 focus:outline-none focus:border-[#1668FF] focus:bg-white transition-colors"
                          />
                          {libSearch && (
                            <button
                              type="button"
                              onClick={() => setLibSearch('')}
                              aria-label={ui.files.clearSearchAria}
                              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => navigateToSubView('ai')}
                          className="h-10 px-3 rounded-xl bg-[#EEF3FF] hover:bg-[#E0EAFF] text-[#1668FF] text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{ui.files.askVamx}</span>
                        </button>
                      </div>
                    )}

                    {/* Inline Device Transfer Progress Strip */}
                    {device.bound !== false && device.connected && (device.pendingCount > 0 || isFastSyncing) && (
                      <div className="border-y border-[#EDF2F8] py-3 mb-1">
                        <div className="flex items-center gap-2 text-xs text-[#64748B]">
                          <RefreshCw
                            className={`w-3.5 h-3.5 text-[#1668FF] shrink-0 ${
                              isFastSyncing ? 'animate-spin' : ''
                            }`}
                          />
                          <span className="truncate">
                            {ui.files.fastSyncBanner(device.name)} ({device.pendingCount || 1})
                          </span>
                        </div>

                        <div className="w-full h-[2.5px] bg-[#E8EFFA] rounded-full overflow-hidden my-2.5">
                          <div
                            className="h-full bg-[#1668FF] rounded-full transition-all duration-300"
                            style={{ width: `${isFastSyncing ? fastSyncProgress : 38}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
                            {isFastSyncing ? '512.40 KB/S' : '81.46 KB/S'}
                          </span>
                          <button
                            type="button"
                            onClick={handleTriggerFastSync}
                            disabled={isFastSyncing}
                            className="h-8 px-3.5 rounded-lg bg-[#1668FF] hover:bg-[#0D59EB] disabled:opacity-70 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-[0_4px_12px_-4px_rgba(22,104,255,0.45)]"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>{isFastSyncing ? ui.files.fastSyncing : ui.files.fastSync}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Desktop Quick Filter Strip */}
                    {desktopMode && (
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1 bg-zinc-200/60 p-0.5 rounded-xl overflow-x-auto no-scrollbar">
                          {(
                            [
                              { id: 'all', label: t.all },
                              { id: 'local', label: t.local },
                              { id: 'cloud', label: t.cloud },
                              { id: 'pending', label: t.pending },
                              {
                                id: 'trash',
                                label:
                                  trashedRecordings.length > 0
                                    ? ui.files.trashBanner(trashedRecordings.length)
                                    : ui.sheets.trashLabel,
                              },
                            ] as const
                          ).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => {
                                setLibFilter(f.id);
                                setLibFolderId('all');
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                                libFilter === f.id
                                  ? 'bg-white text-[#111827] shadow-xs'
                                  : 'text-zinc-500 hover:text-zinc-800'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowNewFolderModal(true)}
                          title={t.newFolder}
                          aria-label={t.newFolder}
                          className="w-9 h-9 rounded-lg hover:bg-zinc-200/70 flex items-center justify-center text-zinc-600 cursor-pointer"
                        >
                          <FolderPlus className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Recycle Bin Status & Clear Bar */}
                    {libFilter === 'trash' && (
                      <div className="mb-2 px-3 py-2.5 rounded-xl bg-[#F6F8FC] border border-[#E5ECF5] flex items-center justify-between gap-2">
                        <span className="text-xs text-[#64748B]">
                          {ui.files.trashedHint}
                        </span>
                        {trashedRecordings.length > 0 && (
                          <button
                            type="button"
                            onClick={handleEmptyTrash}
                            className="text-xs font-semibold text-[#E53935] hover:underline shrink-0 cursor-pointer"
                          >
                            {ui.files.emptyTrashAction}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Clean Minimalist Hairline-Divided Feed */}
                    <div
                      className={
                        desktopMode
                          ? 'bg-white rounded-2xl border border-[#E5ECF5] divide-y divide-[#EDF2F8] overflow-y-auto thin-scrollbar'
                          : 'divide-y divide-[#EDF2F8]'
                      }
                    >
                      {filteredRecordings.length === 0 ? (
                        <div className="py-16 text-center px-4">
                          <p className="text-sm font-medium text-zinc-700">
                            {libFilter === 'trash' ? ui.files.emptyTrashTitle : ui.files.emptyFilesTitle}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            {libFilter === 'trash'
                              ? ui.files.emptyTrashDesc
                              : ui.files.emptyFilesDesc}
                          </p>
                          {libFilter === 'trash' && (
                            <button
                              type="button"
                              onClick={() => setLibFilter('all')}
                              className="mt-4 h-9 px-4 rounded-xl bg-[#EEF3FF] text-xs font-semibold text-[#1668FF] cursor-pointer"
                            >
                              {ui.files.backToAllFiles}
                            </button>
                          )}
                        </div>
                      ) : libFilter === 'trash' ? (
                        filteredRecordings.map((rec) => (
                          <div
                            key={rec.id}
                            className={`py-4 ${
                              desktopMode ? 'px-4' : 'px-0.5'
                            } flex items-center justify-between gap-3`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-[15px] font-medium text-[#111827] leading-[1.45] line-clamp-2">
                                {rec.title}
                              </div>
                              <div className="mt-1.5 flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#94A3B8] tabular-nums">
                                <span>{ui.files.trashedAt(formatDateLabelDisplay(rec.trashedAt || '刚刚', language))}</span>
                                <span aria-hidden="true" className="text-[#CBD5E1]">|</span>
                                <span className="font-mono">{rec.durationLabel}</span>
                                <span aria-hidden="true" className="text-[#CBD5E1]">|</span>
                                <span>
                                  {rec.trashedLocal && rec.trashedCloud
                                    ? ui.files.trashBothBadge
                                    : rec.trashedCloud
                                    ? ui.files.trashCloudBadge
                                    : rec.trashedLocal
                                    ? ui.files.trashLocalBadge
                                    : hasCloudCopy(rec)
                                    ? ui.files.cloudBadge
                                    : ui.files.localBadge}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRestoreRecording(rec.id)}
                                className="h-8 px-2.5 rounded-lg bg-[#EEF3FF] hover:bg-[#E0EAFF] text-xs font-semibold text-[#1668FF] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>{ui.common.restore}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePermanentDeleteRecording(rec.id)}
                                aria-label={ui.files.deleteForeverAria}
                                className="w-8 h-8 rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-[#E53935] flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        filteredRecordings.map((rec) => {
                          const isSelected = desktopMode && selectedRecording?.id === rec.id;
                          const isChecked = selectedIds.includes(rec.id);
                          return (
                            <div
                              key={rec.id}
                              onClick={() => {
                                if (selectionMode) {
                                  handleToggleSelectId(rec.id);
                                  return;
                                }
                                setSelectedRecId(rec.id);
                                setSeekTarget(null);
                                setMobileDetailOpen(true);
                              }}
                              className={`py-4 ${
                                desktopMode ? 'px-4' : 'px-0.5'
                              } cursor-pointer transition-colors flex items-start justify-between gap-2.5 ${
                                isSelected || (selectionMode && isChecked)
                                  ? 'bg-[#EEF3FF]/70'
                                  : 'hover:bg-[#F8FAFD] active:bg-[#F3F6FC]'
                              }`}
                            >
                              {selectionMode && (
                                <span className="pt-0.5 text-[#1668FF] shrink-0">
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4" />
                                  ) : (
                                    <Square className="w-4 h-4 text-zinc-300" />
                                  )}
                                </span>
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="text-[15.5px] font-medium text-[#111827] leading-[1.45] line-clamp-2">
                                  {rec.title}
                                </div>

                                <div className="mt-1.5 flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#94A3B8] tabular-nums">
                                  <span>{formatDateLabelDisplay(rec.dateLabel, language)}</span>
                                  <span aria-hidden="true" className="text-[#CBD5E1]">
                                    |
                                  </span>
                                  <span className="font-mono">{rec.durationLabel}</span>

                                  {(rec.status === 'pending' || rec.status === 'processing') && (
                                    <span className="inline-flex items-center gap-1 text-[#1668FF] font-medium ml-0.5">
                                      <Sparkles className="w-3 h-3" />
                                      <span>{ui.files.generatingStatus}</span>
                                    </span>
                                  )}

                                  {rec.status === 'failed' && (
                                    <span className="inline-flex items-center gap-2 text-[#E53935] font-medium ml-0.5">
                                      <span>{ui.files.failedStatus}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => handleRetryFailedRecording(rec, e)}
                                        className="inline-flex items-center gap-1 text-[#1668FF] hover:underline font-semibold cursor-pointer py-0.5"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>{ui.common.retry}</span>
                                      </button>
                                    </span>
                                  )}
                                </div>

                                {(rec.summary || rec.notes) && rec.status === 'transcribed' && (
                                  <div className="mt-1.5 flex items-center gap-1.5 text-[#94A3B8]">
                                    <PenLine className="w-3 h-3" />
                                  </div>
                                )}
                              </div>

                              {!selectionMode && (
                                <button
                                  type="button"
                                  onClick={(e) => openRowMenu(rec, e)}
                                  aria-label={ui.files.openMenuAria(rec.title)}
                                  className="w-9 h-9 -mr-1.5 rounded-full hover:bg-[#EDF2F8] text-zinc-400 hover:text-zinc-700 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* RECORDING DETAIL PANE */}
                  <div
                    className={
                      desktopMode
                        ? mobileDetailOpen
                          ? 'block lg:col-span-7 h-full overflow-hidden'
                          : 'hidden lg:block lg:col-span-7 h-full overflow-hidden'
                        : mobileDetailOpen
                        ? 'h-full flex flex-col overflow-hidden'
                        : 'hidden'
                    }
                  >
                    {selectedRecording ? (
                      <RecordingDetailView
                        recording={selectedRecording}
                        templates={templates}
                        folders={folders}
                        language={language}
                        seekTarget={seekTarget}
                        onBack={
                          !desktopMode || mobileDetailOpen
                            ? () => setMobileDetailOpen(false)
                            : undefined
                        }
                        onUpdateRecording={(updated) =>
                          setRecordings((prev) =>
                            prev.map((r) => (r.id === updated.id ? updated : r))
                          )
                        }
                        onDeleteRecording={handleDeleteRecording}
                        onNotify={notify}
                      />
                    ) : (
                      <div className="h-full rounded-2xl border border-[#E5ECF5] bg-white flex flex-col items-center justify-center text-center p-8">
                        <AudioLines className="w-8 h-8 text-zinc-300 mb-3" />
                        <p className="text-sm font-medium text-zinc-600">
                          {ui.files.noSelectionDesktop}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. TOOLBOX TAB */}
              {activeTab === 'toolbox' && (
                <div className={desktopMode ? 'space-y-6 pb-8' : 'space-y-4 pb-6'}>
                  <div className="pt-1 flex items-end justify-between gap-3">
                    <div>
                      <h1 className="text-[28px] font-display font-bold tracking-tight text-[#111827] leading-none">
                        {t.navToolbox}
                      </h1>
                      <p className="text-xs text-[#64748B] mt-1.5">
                        {t.toolboxSubtitle}
                      </p>
                    </div>
                  </div>

                  <div className={desktopMode ? 'max-w-4xl space-y-5' : 'space-y-4'}>
                    {/* Focal Spotlight: Ask VAMX */}
                    <button
                      type="button"
                      onClick={() => navigateToSubView('ai')}
                      className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-[#EDF3FF] via-[#F6F9FF] to-white border border-[#D6E4FF] hover:border-[#B8D0FF] transition-all duration-150 active:scale-[0.99] cursor-pointer flex items-center justify-between gap-3.5 shadow-[0_4px_18px_-8px_rgba(22,104,255,0.16)]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-white text-[#1668FF] border border-[#E0EAFF] flex items-center justify-center shrink-0 shadow-2xs">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[15px] font-display font-bold text-[#111827]">
                            {t.askVamx}
                          </div>
                          <div className="text-xs text-[#64748B] mt-0.5 truncate tabular-nums">
                            {ui.toolbox.askVamxDynamicSub(activeRecordings.length)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#1668FF] shrink-0" />
                    </button>

                    {/* Core Tools Grid + Card Files Quick Import */}
                    <section className="space-y-2.5">
                      <h2 className="text-xs font-medium text-[#64748B] px-0.5">
                        {t.commonTools}
                      </h2>
                      <div className={desktopMode ? 'grid grid-cols-4 gap-3' : 'grid grid-cols-2 gap-3'}>
                        <button
                          type="button"
                          onClick={openLiveTranslate}
                          className="text-left p-3.5 rounded-2xl bg-white hover:bg-[#FAFBFD] border border-[#E5ECF5] hover:border-[#CFD9EA] transition-all duration-150 active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[100px]"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#ECFDF8] text-[#0F766E] flex items-center justify-center">
                            <Languages className="w-[18px] h-[18px]" />
                          </div>
                          <div className="mt-2.5">
                            <div className="text-[14px] font-display font-bold text-[#111827]">
                              {t.liveTranslate}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-0.5 truncate">
                              {ui.toolbox.liveTranslateCardSub}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigateToSubView('rooms')}
                          className="text-left p-3.5 rounded-2xl bg-white hover:bg-[#FAFBFD] border border-[#E5ECF5] hover:border-[#CFD9EA] transition-all duration-150 active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[100px]"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#EEF3FF] text-[#1668FF] flex items-center justify-center">
                            <Headphones className="w-[18px] h-[18px]" />
                          </div>
                          <div className="mt-2.5">
                            <div className="text-[14px] font-display font-bold text-[#111827]">
                              {t.roomsTitle}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-0.5 tabular-nums truncate">
                              {liveRoomsCount > 0 ? ui.toolbox.roomsLiveSub(liveRoomsCount) : ui.toolbox.roomsIdleSub}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={openImportAudio}
                          className="text-left p-3.5 rounded-2xl bg-white hover:bg-[#FAFBFD] border border-[#E5ECF5] hover:border-[#CFD9EA] transition-all duration-150 active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[100px]"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#F2F5FA] text-[#1E293B] flex items-center justify-center">
                            <Upload className="w-[18px] h-[18px]" />
                          </div>
                          <div className="mt-2.5">
                            <div className="text-[14px] font-display font-bold text-[#111827]">
                              {t.importAudio}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-0.5 truncate">
                              {ui.toolbox.importAudioCardSub}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProfileSheet('templates')}
                          className="text-left p-3.5 rounded-2xl bg-white hover:bg-[#FAFBFD] border border-[#E5ECF5] hover:border-[#CFD9EA] transition-all duration-150 active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[100px]"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4B5AE4] flex items-center justify-center">
                            <LayoutGrid className="w-[18px] h-[18px]" />
                          </div>
                          <div className="mt-2.5">
                            <div className="text-[14px] font-display font-bold text-[#111827]">
                              {t.templates}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-0.5 tabular-nums truncate">
                              {ui.toolbox.templatesCountSub(templates.length)}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={openDeviceFiles}
                          className={`${
                            desktopMode ? 'col-span-4' : 'col-span-2'
                          } text-left px-4 py-3.5 rounded-2xl bg-white hover:bg-[#FAFBFD] border border-[#E5ECF5] hover:border-[#CFD9EA] transition-all duration-150 active:scale-[0.99] cursor-pointer flex items-center justify-between gap-3`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#EEF3FF] text-[#1668FF] flex items-center justify-center shrink-0">
                              <FileAudio className="w-[18px] h-[18px]" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[14px] font-display font-bold text-[#111827]">
                                {t.importCardFiles}
                              </div>
                              <div className="text-[11px] text-[#64748B] mt-0.5 truncate tabular-nums">
                                {device.bound === false
                                  ? ui.toolbox.cardUnboundSub
                                  : pendingCardCount > 0
                                  ? ui.toolbox.cardPendingSub(device.name, pendingCardCount)
                                  : ui.toolbox.cardSyncedSub(device.name, cardFiles.length)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-[#1668FF] tabular-nums">
                            {pendingCardCount > 0 && <span>{ui.toolbox.pendingBadge(pendingCardCount)}</span>}
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                          </div>
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* 3. AI WORKBENCH TAB */}
              {activeTab === 'ai' && (
                <div
                  className={
                    desktopMode
                      ? 'h-[calc(100vh-96px)] rounded-2xl border border-zinc-200/80 overflow-hidden'
                      : 'h-full flex-1 min-h-0'
                  }
                >
                  <AiWorkbenchView
                    messages={aiMessages}
                    recordings={activeRecordings}
                    folders={folders}
                    language={language}
                    onSendMessage={(u, a) => setAiMessages((prev) => [...prev, u, a])}
                    onResetChat={() => {
                      setAiMessages([]);
                      notify(ui.toasts.startedNewChat);
                    }}
                    onJumpToCitation={(recordingId, seconds) => {
                      setSelectedRecId(recordingId);
                      setSeekTarget({
                        seconds,
                        nonce: Date.now(),
                        autoPlay: true,
                        tab: 'transcript',
                      });
                      setActiveTab('files');
                      setMobileDetailOpen(true);
                      notify(ui.toasts.jumpedToAudio(formatDuration(seconds)));
                    }}
                  />
                </div>
              )}

              {/* 4. INTERPRETATION ROOMS TAB */}
              {activeTab === 'rooms' && (
                <InterpretationRoomView
                  rooms={rooms}
                  language={language}
                  onCreateRoom={(room) => setRooms((prev) => [room, ...prev])}
                  onUpdateRoom={(room) =>
                    setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)))
                  }
                  onEnterLiveTranslate={openLiveTranslate}
                  onNotify={notify}
                />
              )}

              {/* 5. PROFILE & SETTINGS TAB */}
              {activeTab === 'profile' && (
                <ProfileSettingsView
                  language={language}
                  transcriptionLang={transcriptionLang}
                  recordingsCount={activeRecordings.length}
                  localStorageLabel={localStorageLabel}
                  trashedRecordings={trashedRecordings}
                  device={device}
                  automation={automation}
                  templates={templates}
                  transfers={transfers}
                  userProfile={userProfile}
                  activeSheet={profileSheet}
                  onSetActiveSheet={setProfileSheet}
                  onUpdateUserProfile={setUserProfile}
                  onChangeLanguage={(lang) => {
                    setLanguage(lang);
                    notify(
                      lang === 'zh'
                        ? UI_STRINGS[lang].toasts.switchedZh
                        : lang === 'en'
                        ? UI_STRINGS[lang].toasts.switchedEn
                        : UI_STRINGS[lang].toasts.switchedVi
                    );
                  }}
                  onChangeTranscriptionLang={setTranscriptionLang}
                  onUpdateDevice={setDevice}
                  onUpdateAutomation={setAutomation}
                  onAddTemplate={(tpl) => setTemplates((prev) => [...prev, tpl])}
                  onRetryTransfer={handleRetryTransfer}
                  onRestoreRecording={handleRestoreRecording}
                  onPermanentDeleteRecording={handlePermanentDeleteRecording}
                  onEmptyTrash={handleEmptyTrash}
                  onOpenImport={openDeviceFiles}
                  onOpenPhoneAudioPicker={() => phoneAudioPickerRef.current?.click()}
                  onResetDemoData={handleResetDemoData}
                  onLogout={handleLogout}
                  onDeleteAccount={handleDeleteAccount}
                  onNotify={notify}
                />
              )}
            </>
          )}
        </main>

        {/* SHARED MODAL SHEETS WHEN OPENED FROM TOOLBOX / FILES / SIDEBAR */}
        {activeTab !== 'profile' && profileSheet && (
          <ProfileSettingsView
            sheetsOnly
            language={language}
            transcriptionLang={transcriptionLang}
            recordingsCount={activeRecordings.length}
            localStorageLabel={localStorageLabel}
            trashedRecordings={trashedRecordings}
            device={device}
            automation={automation}
            templates={templates}
            transfers={transfers}
            userProfile={userProfile}
            activeSheet={profileSheet}
            onSetActiveSheet={setProfileSheet}
            onUpdateUserProfile={setUserProfile}
            onChangeLanguage={(lang) => {
              setLanguage(lang);
              notify(
                lang === 'zh'
                  ? UI_STRINGS[lang].toasts.switchedZh
                  : lang === 'en'
                  ? UI_STRINGS[lang].toasts.switchedEn
                  : UI_STRINGS[lang].toasts.switchedVi
              );
            }}
            onChangeTranscriptionLang={setTranscriptionLang}
            onUpdateDevice={setDevice}
            onUpdateAutomation={setAutomation}
            onAddTemplate={(tpl) => setTemplates((prev) => [...prev, tpl])}
            onRetryTransfer={handleRetryTransfer}
            onRestoreRecording={handleRestoreRecording}
            onPermanentDeleteRecording={handlePermanentDeleteRecording}
            onEmptyTrash={handleEmptyTrash}
            onOpenImport={openDeviceFiles}
            onOpenPhoneAudioPicker={() => phoneAudioPickerRef.current?.click()}
            onResetDemoData={handleResetDemoData}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            onNotify={notify}
          />
        )}

        {/* MOBILE 3-ANCHOR BOTTOM DOCK (Files + Elevated VAMX Blue Hero Button + Toolbox) */}
        {showMobileBottomDock && (
          <nav
            aria-label={ui.toolbox.dockNavAria}
            className={`${
              desktopMode ? 'grid lg:hidden fixed bottom-0 left-0 right-0' : 'grid shrink-0'
            } z-30 grid-cols-3 items-center h-[60px] bg-white/95 backdrop-blur-md border-t border-[#E6ECF5] px-2 relative`}
          >
            {/* Left Anchor: Files */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('files');
                setMobileDetailOpen(false);
              }}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors cursor-pointer ${
                activeTab === 'files' ? 'text-[#1668FF]' : 'text-[#8C95A6] hover:text-zinc-700'
              }`}
            >
              {activeTab === 'files' ? (
                <FolderOpen className="w-5 h-5" />
              ) : (
                <Folder className="w-5 h-5" />
              )}
              <span
                className={`text-[10px] tracking-tight ${
                  activeTab === 'files' ? 'font-semibold' : 'font-medium'
                }`}
              >
                {t.navFiles}
              </span>
            </button>

            {/* Center Anchor: Direct Quick Record Button */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleStartQuickRecord}
                aria-label={isRecording ? ui.toolbox.dockRecordActiveAria : ui.toolbox.dockRecordStartAria}
                className={`w-[54px] h-[54px] -mt-6 rounded-full ring-4 ring-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer ${
                  isRecording
                    ? 'bg-[#E55B5B] text-white shadow-[0_8px_22px_-4px_rgba(229,91,91,0.5)]'
                    : 'bg-[#1668FF] hover:bg-[#0D59EB] text-white shadow-[0_8px_22px_-4px_rgba(22,104,255,0.48)]'
                }`}
              >
                <Mic className={`w-[22px] h-[22px] ${isRecording ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            {/* Right Anchor: Toolbox */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('toolbox');
                setMobileDetailOpen(false);
              }}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors cursor-pointer ${
                activeTab === 'toolbox' ? 'text-[#1668FF]' : 'text-[#8C95A6] hover:text-zinc-700'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span
                className={`text-[10px] tracking-tight ${
                  activeTab === 'toolbox' ? 'font-semibold' : 'font-medium'
                }`}
              >
                {t.navToolbox}
              </span>
            </button>
          </nav>
        )}

        {/* DEVICE QUICK CONTROL SHEET (Matches Top-Left "我的设备" Screenshot) */}
        {showDeviceQuickSheet && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => {
              setQuickScanOpen(false);
              setShowDeviceQuickSheet(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] bg-white rounded-t-3xl border-t border-[#E6ECF5] overflow-hidden shadow-2xl max-h-[88%] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 pt-5 pb-3 border-b border-[#EDF2F8] flex items-center justify-between shrink-0">
                <h3 className="text-[18px] font-display font-bold text-[#111827]">{ui.sheets.deviceTitle}</h3>
                <div className="flex items-center gap-1 -mr-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeviceQuickSheet(false);
                      openDeviceFiles();
                    }}
                    title={ui.sheets.deviceManageTitle}
                    className="h-9 px-2.5 rounded-full hover:bg-[#F4F7FC] text-xs font-medium text-[#1668FF] cursor-pointer"
                  >
                    {ui.sheets.cardFilesBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickScanOpen(false);
                      setShowDeviceQuickSheet(false);
                    }}
                    aria-label={ui.common.close}
                    className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto thin-scrollbar px-6 pt-4 pb-6 space-y-4">
                {/* Centered 3D Card Visual */}
                <div className="flex flex-col items-center">
                  <DeviceCardVisual
                    device={device}
                    isRecording={isRecording}
                    recordingSeconds={recordSeconds}
                    language={language}
                    onPhysicalButtonClick={() => {
                      if (device.bound === false) {
                        handleQuickScanDevices();
                        notify(ui.toasts.selectOrBindCard);
                        return;
                      }
                      handleStartQuickRecord();
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setShowDeviceQuickSheet(false);
                      openLiveTranslate();
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1668FF] hover:text-[#0D59EB] cursor-pointer py-1"
                  >
                    <Languages className="w-4 h-4" />
                    <span>{ui.sheets.liveTranslateBtn}</span>
                  </button>

                  <div className="text-[18px] font-display font-bold text-[#111827] mt-1">
                    {device.bound === false ? ui.sheets.unboundCardLabel : device.name}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDeviceQuickSheet(false);
                      if (isRecording) {
                        setShowLiveRecordSheet(true);
                      } else {
                        handleStartQuickRecord();
                      }
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#1668FF] hover:text-[#0D59EB] cursor-pointer"
                  >
                    <AudioLines className="w-3.5 h-3.5" />
                    <span>
                      {isRecording
                        ? ui.sheets.viewLiveRecStatus
                        : device.bound !== false && device.connected
                        ? ui.sheets.startCardDirectRec
                        : ui.sheets.usePhoneMicRec}
                    </span>
                  </button>

                  <div className="text-[11px] text-[#94A3B8] mt-2">
                    {device.bound === false
                      ? ui.sheets.statusUnbound
                      : device.connected
                      ? ui.sheets.statusConnected
                      : ui.sheets.statusDisconnected}
                  </div>
                </div>

                {/* 4-Column Hardware Info Strip */}
                <div className="grid grid-cols-4 gap-2 py-2.5 text-center">
                  <div>
                    <div className="text-[11px] text-[#94A3B8]">{ui.sheets.batteryLabel}</div>
                    <div className="font-mono text-xs font-semibold text-[#111827] mt-1 tabular-nums">
                      {device.bound !== false && device.connected ? `${device.battery}%` : ui.sheets.statusDisconnected}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#94A3B8]">MAC</div>
                    <div className="font-mono text-[11px] font-medium text-[#111827] mt-1 truncate">
                      {device.bound === false ? '--' : device.mac}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#94A3B8]">{ui.sheets.firmwareLabel}</div>
                    <div className="font-mono text-xs font-medium text-[#111827] mt-1">
                      {device.bound === false ? '--' : device.firmware}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#94A3B8]">{ui.sheets.cardStorageLabel}</div>
                    <div className="font-mono text-[11px] font-medium text-[#111827] mt-1 tabular-nums">
                      {device.bound !== false && device.connected
                        ? `${device.usedMb}MB/${device.totalGb}G`
                        : '-- / --'}
                    </div>
                  </div>
                </div>

                {/* Two Secondary Actions */}
                {device.bound !== false && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDevice((d) => ({ ...d, connected: !d.connected }));
                        notify(
                          device.connected
                            ? ui.toasts.disconnectedDevice
                            : ui.toasts.reconnectedDevice(device.name)
                        );
                      }}
                      className="h-10 px-5 rounded-xl bg-white hover:bg-[#F8FAFD] border border-[#E2E8F4] text-xs font-medium text-[#111827] cursor-pointer transition-colors shadow-2xs"
                    >
                      {device.connected ? ui.sheets.disconnect : ui.sheets.reconnect}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDevice((d) => ({ ...d, bound: false, connected: false }));
                        notify(ui.toasts.unboundDevice(device.name));
                      }}
                      className="h-10 px-5 rounded-xl bg-white hover:bg-red-50/70 border border-[#E2E8F4] hover:border-red-200 text-xs font-medium text-[#111827] hover:text-[#D9534F] cursor-pointer transition-colors shadow-2xs"
                    >
                      {ui.sheets.unbindDevice}
                    </button>
                  </div>
                )}

                {/* Nearby Device Scanner Panel */}
                {quickScanOpen && (
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E5ECF5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#111827]">
                        {quickScanning ? ui.sheets.scanningVamxCards : ui.sheets.nearbyVamxCards}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuickScanOpen(false)}
                        className="text-[11px] text-[#64748B] hover:text-[#111827] cursor-pointer"
                      >
                        {ui.sheets.collapse}
                      </button>
                    </div>
                    {quickScanning ? (
                      <div className="py-3 flex items-center justify-center gap-2 text-xs text-[#64748B]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1668FF]" />
                        <span>{ui.sheets.bleSearching}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {NEARBY_DEVICE_CANDIDATES.map((cand) => {
                          const isBound = device.bound !== false && device.mac === cand.mac;
                          return (
                            <div
                              key={cand.mac}
                              className="p-2.5 rounded-xl bg-white border border-[#E5ECF5] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-[#111827] truncate">
                                  {cand.name}
                                </div>
                                <div className="text-[10.5px] font-mono text-[#64748B]">
                                  {cand.mac} · {ui.sheets.batteryLabel} {cand.battery}%
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={isBound && device.connected}
                                onClick={() => {
                                  setDevice((d) => ({
                                    ...d,
                                    name: cand.name,
                                    mac: cand.mac,
                                    battery: cand.battery,
                                    firmware: cand.firmware,
                                    usedMb: cand.usedMb,
                                    totalGb: cand.totalGb,
                                    bound: true,
                                    connected: true,
                                  }));
                                  setQuickScanOpen(false);
                                  notify(ui.toasts.boundCard(cand.name));
                                }}
                                className={`h-8 px-3 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer ${
                                  isBound && device.connected
                                    ? 'bg-[#F4F6FA] text-[#94A3B8] cursor-default'
                                    : 'bg-[#1668FF] hover:bg-[#0D59EB] text-white'
                                }`}
                              >
                                {isBound && device.connected ? ui.sheets.statusConnected : ui.sheets.bindAndConnect}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Full-Width Cobalt CTA */}
                <button
                  type="button"
                  onClick={handleQuickScanDevices}
                  className="w-full h-11 rounded-2xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-[0_6px_16px_-6px_rgba(22,104,255,0.45)]"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>{ui.sheets.scanNearbyDevices}</span>
                </button>

                <button
                  type="button"
                  onClick={() => phoneAudioPickerRef.current?.click()}
                  className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-[#1668FF] hover:text-[#0D59EB] cursor-pointer transition-colors"
                >
                  <FileAudio className="w-4 h-4" />
                  <span>{ui.sheets.selectPhoneAudioFull}</span>
                </button>

                {(!device.connected || device.bound === false) && (
                  <p className="text-[11px] text-[#94A3B8] text-center leading-relaxed">
                    {ui.sheets.scanNoDeviceHint}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FOLDER & SCOPE FILTER BOTTOM SHEET */}
        {showFolderSheet && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => setShowFolderSheet(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] bg-white rounded-t-3xl border-t border-[#E6ECF5] px-5 pt-3 pb-7 space-y-4 shadow-2xl max-h-[82%] overflow-y-auto thin-scrollbar"
            >
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-bold text-[#111827]">{ui.sheets.folderSheetTitle}</h3>
                <button
                  type="button"
                  onClick={() => setShowFolderSheet(false)}
                  aria-label={ui.common.close}
                  className="w-10 h-10 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Storage / Status Scope */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[#64748B]">{ui.sheets.statusSection}</div>
                <div className="grid grid-cols-4 gap-1.5 bg-[#F4F7FC] p-1 rounded-xl">
                  {(
                    [
                      { id: 'all', label: t.all },
                      { id: 'local', label: t.local },
                      { id: 'cloud', label: t.cloud },
                      { id: 'pending', label: t.pending },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setLibFilter(f.id);
                        setLibFolderId('all');
                        setShowFolderSheet(false);
                      }}
                      className={`h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        libFilter === f.id && libFolderId === 'all'
                          ? 'bg-white text-[#1668FF] font-semibold shadow-2xs'
                          : 'text-[#64748B] hover:text-[#111827]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Folders List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#64748B]">{ui.sheets.foldersSection}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFolderSheet(false);
                      setShowNewFolderModal(true);
                    }}
                    className="text-xs font-semibold text-[#1668FF] inline-flex items-center gap-1 cursor-pointer py-1"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>{t.newFolder}</span>
                  </button>
                </div>

                <div className="divide-y divide-[#EDF2F8] border border-[#E5ECF5] rounded-2xl overflow-hidden">
                  {folders.map((fld) => {
                    const active = libFolderId === fld.id && libFilter !== 'trash';
                    return (
                      <button
                        key={fld.id}
                        type="button"
                        onClick={() => {
                          setLibFolderId(fld.id);
                          setLibFilter('all');
                          setShowFolderSheet(false);
                        }}
                        className={`w-full px-4 h-12 flex items-center justify-between text-sm transition-colors cursor-pointer ${
                          active ? 'bg-[#EEF3FF]/70 text-[#1668FF] font-semibold' : 'text-[#111827] hover:bg-[#F8FAFD]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Folder className="w-4 h-4" />
                          <span>{getFolderDisplayName(fld, language)}</span>
                        </span>
                        {active && <Check className="w-4 h-4 text-[#1668FF]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recycle Bin Scope Entry */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[#64748B]">{ui.sheets.deletedSection}</div>
                <button
                  type="button"
                  onClick={() => {
                    setLibFilter('trash');
                    setLibFolderId('all');
                    setShowFolderSheet(false);
                  }}
                  className={`w-full px-4 h-12 rounded-2xl border flex items-center justify-between text-sm transition-colors cursor-pointer ${
                    libFilter === 'trash'
                      ? 'border-[#1668FF] bg-[#EEF3FF]/70 text-[#1668FF] font-semibold'
                      : 'border-[#E5ECF5] bg-white text-[#111827] hover:bg-[#F8FAFD]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4" />
                    <span>{ui.sheets.trashLabel}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-mono text-[#64748B] tabular-nums">
                    <span>{trashedRecordings.length} {ui.common.itemsUnit}</span>
                    {libFilter === 'trash' && <Check className="w-4 h-4 text-[#1668FF]" />}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE RECORDING BOTTOM SHEET */}
        <LiveRecordSheet
          isOpen={showLiveRecordSheet}
          isRecording={isRecording}
          isPaused={isRecordPaused}
          seconds={recordSeconds}
          device={device}
          liveNotes={liveRecordNotes}
          language={language}
          onClose={() => setShowLiveRecordSheet(false)}
          onTogglePause={() => setIsRecordPaused((p) => !p)}
          onStopAndSave={handleStopAndSaveRecording}
          onDiscard={() => {
            setIsRecording(false);
            setIsRecordPaused(false);
            setRecordSeconds(0);
            setLiveRecordNotes([]);
            setShowLiveRecordSheet(false);
            notify(ui.toasts.cancelledRecording);
          }}
          onAddNote={(text) => {
            setLiveRecordNotes((prev) => [
              ...prev,
              { time: formatDuration(recordSeconds), seconds: recordSeconds, text },
            ]);
            notify(ui.toasts.insertedLiveNote);
          }}
          onSwitchToTranslate={() => {
            setShowLiveRecordSheet(false);
            openLiveTranslate();
          }}
        />

        {/* APPLE-STYLE FLOATING PICTURE-IN-PICTURE SUBTITLE OVERLAY */}
        <FloatingPipSubtitle
          visible={showTranslationPip}
          desktopMode={desktopMode}
          containerRef={appShellRef}
          latestBlock={translationBlocks[translationBlocks.length - 1]}
          sourceLang={translationSourceLang}
          targetLang={translationTargetLang}
          audioInput={translationAudioInput}
          deviceName={device.name}
          isListening={translationListening}
          elapsedSec={translationElapsed}
          showSource={pipShowSource}
          language={language}
          onToggleSource={() => setPipShowSource((v) => !v)}
          onToggleListen={() => setTranslationListening((v) => !v)}
          onExpand={() => {
            setShowLiveRecordSheet(false);
            setShowLiveTranslate(true);
          }}
          onClose={() => {
            setShowTranslationPip(false);
            if (!showLiveTranslate) {
              setTranslationListening(false);
            }
          }}
        />

        <input
          ref={phoneAudioPickerRef}
          type="file"
          accept=".mp3,.m4a,.aac,.amr,.wav,.ogg,.flac,.opus,audio/*"
          onChange={handlePhoneAudioPicked}
          className="hidden"
        />

        {/* IMPORT FILES / IMPORT AUDIO BOTTOM SHEET */}
        <ImportFilesSheet
          isOpen={showImportSheet}
          initialMode={importSheetMode}
          device={device}
          folders={folders}
          cardFiles={cardFiles}
          language={language}
          onUpdateCardFiles={setCardFiles}
          onRefreshCardFiles={handleRefreshCardFiles}
          onClose={() => setShowImportSheet(false)}
          onImportRecording={(rec, openAfter) => {
            setRecordings((prev) => [rec, ...prev]);
            setSelectedRecId(rec.id);
            if (openAfter) {
              setActiveTab('files');
              setMobileDetailOpen(true);
            }
          }}
          onStartQuickRecord={() => {
            setShowImportSheet(false);
            handleStartQuickRecord();
          }}
          onNotify={notify}
        />

        {/* ROW QUICK ACTION SHEET */}
        {rowMenuRec && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => setRowMenuRecId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-white rounded-t-3xl border-t border-[#E6ECF5] px-5 pt-3 pb-7 space-y-4 shadow-2xl max-h-[82%] overflow-y-auto thin-scrollbar"
            >
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-display font-bold text-[#111827] truncate">
                  {rowMenuRec.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setRowMenuRecId(null)}
                  aria-label={ui.common.close}
                  className="w-10 h-10 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRowRenameSave} className="flex items-center gap-2">
                <input
                  type="text"
                  value={rowRenameDraft}
                  onChange={(e) => setRowRenameDraft(e.target.value)}
                  placeholder={ui.sheets.rowRenamePlaceholder}
                  className="flex-1 h-10 px-3 rounded-xl bg-[#F6F8FC] border border-[#E3EAF5] text-xs text-[#111827] focus:outline-none focus:border-[#1668FF] focus:bg-white"
                />
                <button
                  type="submit"
                  className="h-10 px-3.5 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  {ui.sheets.rowRenameBtn}
                </button>
              </form>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[#64748B]">{ui.sheets.moveToFolder}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {folders.map((fld) => {
                    const current = rowMenuRec.folderId === fld.id;
                    const fldLabel = getFolderDisplayName(fld, language);
                    return (
                      <button
                        key={fld.id}
                        type="button"
                        onClick={() => {
                          setRecordings((prev) =>
                            prev.map((r) =>
                              r.id === rowMenuRec.id ? { ...r, folderId: fld.id } : r
                            )
                          );
                          setRowMenuRecId(null);
                          notify(ui.toasts.movedToFolder(fldLabel));
                        }}
                        className={`h-8 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          current
                            ? 'bg-[#EEF3FF] border-[#1668FF] text-[#1668FF]'
                            : 'bg-white border-[#E5ECF5] text-[#111827] hover:bg-[#F8FAFD]'
                        }`}
                      >
                        {fldLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="divide-y divide-[#EDF2F8] border border-[#E5ECF5] rounded-2xl overflow-hidden">
                {!isCloudActive(rowMenuRec) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecordings((prev) =>
                        prev.map((r) =>
                          r.id === rowMenuRec.id
                            ? { ...r, hasCloud: true, trashedCloud: false, location: 'cloud' }
                            : r
                        )
                      );
                      setRowMenuRecId(null);
                      notify(ui.toasts.backedUpToCloud);
                    }}
                    className="w-full px-4 h-12 flex items-center gap-3 text-sm font-medium text-[#111827] hover:bg-[#F8FAFD] cursor-pointer"
                  >
                    <CloudUpload className="w-4 h-4 text-[#1668FF]" />
                    <span>{ui.sheets.backupToCloud}</span>
                  </button>
                )}

                {isLocalActive(rowMenuRec) && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = rowMenuRec.id;
                      setRowMenuRecId(null);
                      handleDeleteRecording(targetId, 'local');
                    }}
                    className="w-full px-4 h-12 flex items-center gap-3 text-sm font-medium text-[#E53935] hover:bg-red-50/60 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{ui.sheets.deleteLocalCopy}</span>
                  </button>
                )}

                {isCloudActive(rowMenuRec) && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = rowMenuRec.id;
                      setRowMenuRecId(null);
                      handleDeleteRecording(targetId, 'cloud');
                    }}
                    className="w-full px-4 h-12 flex items-center gap-3 text-sm font-medium text-[#E53935] hover:bg-red-50/60 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{ui.sheets.deleteCloudCopy}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BATCH MOVE TO FOLDER SHEET */}
        {showBatchMoveSheet && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => setShowBatchMoveSheet(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-white rounded-t-3xl border-t border-[#E6ECF5] px-5 pt-3 pb-7 space-y-4 shadow-2xl"
            >
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-bold text-[#111827]">
                  {ui.sheets.batchMoveTitle(selectedIds.length)}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBatchMoveSheet(false)}
                  aria-label={ui.common.close}
                  className="w-10 h-10 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-[#EDF2F8] border border-[#E5ECF5] rounded-2xl overflow-hidden">
                {folders.map((fld) => (
                  <button
                    key={fld.id}
                    type="button"
                    onClick={() => handleBatchMoveFolder(fld.id)}
                    className="w-full px-4 h-12 flex items-center justify-between text-sm text-[#111827] hover:bg-[#F8FAFD] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-[#1668FF]" />
                      <span>{getFolderDisplayName(fld, language)}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NEW FOLDER BOTTOM SHEET */}
        {showNewFolderModal && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => setShowNewFolderModal(false)}
          >
            <form
              onSubmit={handleCreateFolder}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] bg-white rounded-t-3xl border-t border-zinc-200 px-5 pt-3 pb-6 space-y-4 shadow-2xl"
            >
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-bold text-[#111827]">{ui.sheets.newFolderTitle}</h3>
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  aria-label={ui.common.close}
                  className="w-11 h-11 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={ui.sheets.newFolderPlaceholder}
                autoFocus
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#1668FF]"
              />
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{ui.sheets.createFolderBtn}</span>
              </button>
            </form>
          </div>
        )}
        </>
        )}

        {/* CRISP NON-OVERLAPPING TOAST FEEDBACK */}
        {toast && (
          <div
            role="status"
            className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-full bg-[#1C2331] text-white text-xs font-medium shadow-lg pointer-events-none whitespace-nowrap"
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
