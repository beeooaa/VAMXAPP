export type AppLanguage = 'zh' | 'en' | 'vi';

export type NavTab = 'files' | 'toolbox' | 'ai' | 'rooms' | 'profile';

export type RecordingSource = 'card' | 'link' | 'phone' | 'import';
export type RecordingLocation = 'local' | 'cloud';
export type RecordingStatus = 'transcribed' | 'processing' | 'pending' | 'failed';

export interface TranscriptSegment {
  id: string;
  time: string;
  seconds: number;
  speakerId: string;
  speakerName: string;
  text: string;
}

export interface HighlightItem {
  id: string;
  seconds: number;
  time: string;
  note: string;
}

export interface ActionItem {
  id: string;
  text: string;
  owner?: string;
  done: boolean;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface RecordingSummary {
  templateId: string;
  language: string;
  overview: string;
  keyPoints: string[];
  decisions: string[];
  actions: ActionItem[];
}

export interface RecordingItem {
  id: string;
  title: string;
  dateLabel: string;
  timestamp: string;
  durationSec: number;
  durationLabel: string;
  sizeLabel: string;
  source: RecordingSource;
  location: RecordingLocation;
  hasLocal?: boolean;
  hasCloud?: boolean;
  trashedLocal?: boolean;
  trashedCloud?: boolean;
  status: RecordingStatus;
  folderId: string;
  tags: string[];
  diarized: boolean;
  waveform: number[];
  transcript: TranscriptSegment[];
  summary?: RecordingSummary;
  highlights: HighlightItem[];
  notes: string;
  mindMap?: MindMapNode;
  audioUrl?: string;
  trashed?: boolean;
  trashedAt?: string;
}

export interface CardFileItem {
  id: string;
  name: string;
  date: string;
  duration: string;
  durationSec: number;
  size: string;
  imported: boolean;
  progress: number;
}

export interface UserProfileState {
  userName: string;
  userEmail: string;
  userPhone: string;
  credits: number;
  lastCheckInDate: string | null;
  notifyOnDone: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  count?: number;
}

export interface SummaryTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  tone: 'indigo' | 'amber' | 'emerald' | 'slate';
  isCustom?: boolean;
}

export interface TransferTask {
  id: string;
  filename: string;
  sizeLabel: string;
  progress: number;
  status: 'completed' | 'transferring' | 'failed';
  errorMsg?: string;
}

export interface DeviceInfo {
  name: string;
  bound?: boolean;
  connected: boolean;
  battery: number;
  usedMb: number;
  totalGb: number;
  protocol: string;
  mac: string;
  firmware: string;
  usbReadEnabled: boolean;
  syncing: boolean;
  pendingCount: number;
}

export interface AutomationConfig {
  autoImportFromDevice: boolean;
  autoUploadToCloud: boolean;
  autoTranscribeAfterUpload: boolean;
  autoSummarizeAfterTranscribe: boolean;
  wifiOnlyUpload: boolean;
  defaultTemplateId: string;
}

export type InterpRoleView =
  | 'host'
  | 'speaker'
  | 'interpreter'
  | 'standby'
  | 'audience';

export type InterpLifecycleStatus =
  | 'upcoming'
  | 'live'
  | 'paused'
  | 'reviewable'
  | 'published';

export type InterpArchiveStatus =
  | 'reviewable'
  | 'processing'
  | 'completed'
  | 'published';

export type InterpAccessPolicy =
  | 'public'
  | 'org_only'
  | 'allowlist'
  | 'restricted';

export interface StandbyInterpreter {
  id: string;
  name: string;
  langs: string;
  device: string;
  network: string;
  latencyMs: number;
  online: boolean;
}

export interface InterpUtterance {
  id: string;
  time: string;
  seconds: number;
  speakerName: string;
  interpreterName: string;
  sourceText: string;
  translatedText: string;
  translationStatus: 'confirmed' | 'draft' | 'retranslating' | 'failed';
  terminologyMatched?: string[];
  isGap?: boolean;
  gapReason?: string;
  gapResolved?: boolean;
}

export interface InterpTrackSegment {
  id: string;
  startSec: number;
  endSec: number;
  label: string;
  isGap?: boolean;
  gapReason?: string;
  resolved?: boolean;
}

export interface InterpMinutesActionItem {
  id: string;
  task: string;
  owner: string;
  deadline: string;
  sourceTimestamp: string;
}

export interface InterpMinutesData {
  summary: string;
  topics: string[];
  topicAnalyses: Array<{ topic: string; analysis: string }>;
  keyConclusions: Array<{ id: string; text: string; timestamp: string }>;
  actionItems: InterpMinutesActionItem[];
  risksAndOpenQuestions: string[];
  reviewedConfirmed: boolean;
  publishedLocked: boolean;
  generatedAt: string;
}

export interface InterpAuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  detail: string;
}

export interface InterpretationRoom {
  id: string;
  title: string;
  sourceLang: string;
  targetLang: string;
  status: 'live' | 'upcoming' | 'paused' | 'ended';
  lifecycle?: InterpLifecycleStatus;
  archiveStatus?: InterpArchiveStatus;
  orgId?: string;
  listenerCount: number;
  maxSeats?: number;
  inviteCode: string;
  createdByMe: boolean;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  trashed?: boolean;
  trashedAt?: string;
  retentionDaysLeft?: number;
  routeId?: 'route-asean' | 'route-global';
  routeLabel?: string;
  accessPolicy?: InterpAccessPolicy;
  glossaryHints?: string[];
  audienceCaptionsEnabled?: boolean;
  entryOpen?: boolean;
  removedGuests?: string[];
  notes?: string;
  speakerName?: string;
  leadInterpreterId?: string;
  leadInterpreterName?: string;
  standbyInterpreters?: StandbyInterpreter[];
  aiAssistEnabled?: boolean;
  preflight?: {
    micChecked: boolean;
    dualToneChecked: boolean;
    rtcChecked: boolean;
  };
  durationSec?: number;
  handoverAtSec?: number;
  handoverNote?: string;
  utterances?: InterpUtterance[];
  originalSegments?: InterpTrackSegment[];
  interpretedSegments?: InterpTrackSegment[];
  minutes?: InterpMinutesData;
  auditLogs?: InterpAuditLog[];
}

export interface TranslationBlock {
  id: string;
  time: string;
  sourceText: string;
  translatedText: string;
  isFinal: boolean;
}

export interface AiCitation {
  index: number;
  recordingId: string;
  recordingTitle: string;
  timeRange: string;
  seconds: number;
  snippet: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: AiCitation[];
  createdAt: string;
}
