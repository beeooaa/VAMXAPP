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

export interface InterpretationRoom {
  id: string;
  title: string;
  sourceLang: string;
  targetLang: string;
  status: 'live' | 'upcoming' | 'paused' | 'ended';
  listenerCount: number;
  inviteCode: string;
  createdByMe: boolean;
  createdAt: string;
  trashed?: boolean;
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
