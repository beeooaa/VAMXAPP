import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Download,
  FileAudio,
  Link2,
  MessageSquare,
  Mic,
  RefreshCw,
  Search,
  Upload,
  X,
} from 'lucide-react';
import { AppLanguage, CardFileItem, DeviceInfo, FolderItem, RecordingItem } from '../types/vamx';
import { getFolderDisplayName, getLanguageOptionLabel, UI_STRINGS } from '../data/uiStrings';
import { formatDuration } from './WaveformPlayer';

export type ImportSheetMode = 'menu' | 'comments' | 'local' | 'link' | 'device';

interface ImportFilesSheetProps {
  isOpen: boolean;
  initialMode?: ImportSheetMode;
  device: DeviceInfo;
  folders: FolderItem[];
  cardFiles: CardFileItem[];
  language?: AppLanguage;
  onUpdateCardFiles: React.Dispatch<React.SetStateAction<CardFileItem[]>>;
  onRefreshCardFiles: () => void;
  onClose: () => void;
  onImportRecording: (rec: RecordingItem, openAfter?: boolean) => void;
  onStartQuickRecord: () => void;
  onNotify: (msg: string) => void;
}

const TARGET_LANGUAGES = [
  '不确定/混合',
  '简体中文',
  '英语',
  '日语',
  '韩语',
  '西班牙语',
  '越南语',
];

export const ImportFilesSheet: React.FC<ImportFilesSheetProps> = ({
  isOpen,
  initialMode = 'menu',
  device,
  folders,
  cardFiles,
  language = 'zh',
  onUpdateCardFiles,
  onRefreshCardFiles,
  onClose,
  onImportRecording,
  onStartQuickRecord,
  onNotify,
}) => {
  const imp = UI_STRINGS[language].importSheet;
  const cm = UI_STRINGS[language].common;
  const [mode, setMode] = useState<ImportSheetMode>(initialMode);
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'pending' | 'imported'>('all');
  const [importingId, setImportingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Shared form options
  const [targetLang, setTargetLang] = useState('不确定/混合');
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [diarize, setDiarize] = useState(false);

  // 链接导入 state
  const [videoLinkText, setVideoLinkText] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  // 本地导入 state
  const [selectedLocalFile, setSelectedLocalFile] = useState<File | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | undefined>(undefined);
  const [localDurationSec, setLocalDurationSec] = useState<number>(60);

  // 下载评论 state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [downloadAudioToo, setDownloadAudioToo] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setIsProcessing(false);
      setTargetLang('不确定/混合');
      setSelectedFolderId('all');
      setDiarize(false);
      setVideoLinkText('');
      setLinkError(null);
      setYoutubeUrl('');
      setYoutubeError(null);
      setDownloadAudioToo(false);
      setSelectedLocalFile(null);
      setLocalAudioUrl(undefined);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const files = cardFiles;

  const pendingFiles = files.filter((f) => !f.imported);
  const importedFiles = files.filter((f) => f.imported);
  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.trim().toLowerCase());
    if (!matchesSearch) return false;
    if (deviceFilter === 'pending') return !f.imported;
    if (deviceFilter === 'imported') return f.imported;
    return true;
  });

  const folderOptions = folders.map((f) => ({
    id: f.id,
    name: f.id === 'all' ? cm.unfiled : getFolderDisplayName(f, language),
  }));

  const importCardFile = (file: CardFileItem) => {
    if (file.imported || importingId || device.bound === false || !device.connected) return;
    setImportingId(file.id);
    let pct = 25;
    onUpdateCardFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress: pct } : f)));

    const timer = window.setInterval(() => {
      pct += 38;
      if (pct >= 100) {
        window.clearInterval(timer);
        onUpdateCardFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress: 100, imported: true } : f))
        );
        setImportingId(null);

        onImportRecording(
          {
            id: `rec-imp-${Date.now()}`,
            title: file.name,
            dateLabel: '刚刚',
            timestamp: file.date,
            durationSec: file.durationSec,
            durationLabel: file.duration,
            sizeLabel: file.size,
            source: 'card',
            location: 'cloud',
            hasLocal: true,
            hasCloud: true,
            status: 'transcribed',
            folderId: 'all',
            tags: ['Card Sync'],
            diarized: false,
            waveform: Array.from({ length: 56 }, (_, i) =>
              Number((0.25 + Math.abs(Math.sin(i * 0.55)) * 0.65).toFixed(2))
            ),
            highlights: [],
            notes: '',
            transcript: [
              {
                id: `seg-imp-${Date.now()}`,
                time: '00:00',
                seconds: 0,
                speakerId: 'spk-1',
                speakerName: cm.speakerDefault,
                text:
                  language === 'en'
                    ? `Fast-synced and auto-transcribed from ${device.name}. Audio is clear and ready for summary or mind map generation.`
                    : language === 'vi'
                    ? `Đã đồng bộ nhanh và chép lời từ ${device.name}. Âm thanh rõ nét, sẵn sàng tạo tóm tắt hoặc sơ đồ tư duy.`
                    : `已从 ${device.name} 高速同步并完成自动转写：音频信号清晰，支持立即生成纪要或思维导图。`,
              },
            ],
          },
          false
        );
        onNotify(imp.toastCardImported(file.name));
      } else {
        onUpdateCardFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress: pct } : f)));
      }
    }, 120);
  };

  const handleImportAllPending = () => {
    if (pendingFiles.length === 0 || device.bound === false || !device.connected || importingId) return;
    const targets = [...pendingFiles];
    setImportingId(targets[0].id);
    window.setTimeout(() => {
      const importedIds = new Set(targets.map((t) => t.id));
      onUpdateCardFiles((prev) =>
        prev.map((f) => (importedIds.has(f.id) ? { ...f, progress: 100, imported: true } : f))
      );
      targets.forEach((file, idx) => {
        onImportRecording(
          {
            id: `rec-imp-${Date.now()}-${idx}`,
            title: file.name,
            dateLabel: '刚刚',
            timestamp: file.date,
            durationSec: file.durationSec,
            durationLabel: file.duration,
            sizeLabel: file.size,
            source: 'card',
            location: 'cloud',
            hasLocal: true,
            hasCloud: true,
            status: 'transcribed',
            folderId: 'all',
            tags: ['Card Sync'],
            diarized: false,
            waveform: Array.from({ length: 56 }, (_, i) =>
              Number((0.25 + Math.abs(Math.sin(i * 0.55 + idx)) * 0.65).toFixed(2))
            ),
            highlights: [],
            notes: '',
            transcript: [
              {
                id: `seg-imp-${Date.now()}-${idx}`,
                time: '00:00',
                seconds: 0,
                speakerId: 'spk-1',
                speakerName: cm.speakerDefault,
                text:
                  language === 'en'
                    ? `Batch imported and transcribed from ${device.name}. Generate a structured summary at the top.`
                    : language === 'vi'
                    ? `Đã nhập hàng loạt và chép lời từ ${device.name}. Tạo tóm tắt có cấu trúc ngay ở phía trên.`
                    : `已从 ${device.name} 批量导入并完成转写，可直接在顶部生成结构化总结。`,
              },
            ],
          },
          false
        );
      });
      setImportingId(null);
      onNotify(imp.toastCardBatch(targets.length));
    }, 360);
  };

  const handlePickLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const objectUrl = URL.createObjectURL(file);
    setSelectedLocalFile(file);
    setLocalAudioUrl(objectUrl);

    const audio = new Audio(objectUrl);
    audio.addEventListener('loadedmetadata', () => {
      const dur = Number.isFinite(audio.duration) ? Math.max(1, Math.round(audio.duration)) : 60;
      setLocalDurationSec(dur);
    });
    audio.addEventListener('error', () => {
      setLocalDurationSec(60);
    });
    e.target.value = '';
  };

  const handleConfirmLocalImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocalFile || isProcessing) return;
    setIsProcessing(true);

    const file = selectedLocalFile;
    const sizeLabel =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    window.setTimeout(() => {
      const nowId = Date.now();
      onImportRecording(
        {
          id: `rec-local-${nowId}`,
          title: file.name,
          dateLabel: '本地导入',
          timestamp: new Date().toISOString(),
          durationSec: localDurationSec,
          durationLabel: formatDuration(localDurationSec),
          sizeLabel,
          source: 'import',
          location: 'local',
          hasLocal: true,
          hasCloud: false,
          status: 'transcribed',
          folderId: selectedFolderId,
          tags: [imp.localTitle, getLanguageOptionLabel(targetLang, language)],
          diarized: diarize,
          audioUrl: localAudioUrl,
          waveform: Array.from({ length: 56 }, (_, i) =>
            Number((0.2 + Math.abs(Math.cos(i * 0.6)) * 0.7).toFixed(2))
          ),
          highlights: [],
          notes: '',
          transcript: [
            {
              id: `seg-loc-1-${nowId}`,
              time: '00:00',
              seconds: 0,
              speakerId: 'spk-1',
              speakerName: diarize ? cm.speakerN(1) : cm.speakerDefault,
              text:
                language === 'en'
                  ? `Imported local audio "${file.name}" (${getLanguageOptionLabel(targetLang, language)}). Play the live waveform right at the top.`
                  : language === 'vi'
                  ? `Đã nhập tệp âm thanh "${file.name}" (${getLanguageOptionLabel(targetLang, language)}). Phát sóng âm trực tiếp ngay phía trên.`
                  : `已导入本地音频「${file.name}」（识别语言：${targetLang}），可直接在页面顶部播放真实音频波形。`,
            },
            ...(diarize
              ? [
                  {
                    id: `seg-loc-2-${nowId}`,
                    time: '00:28',
                    seconds: 28,
                    speakerId: 'spk-2',
                    speakerName: cm.speakerN(2),
                    text:
                      language === 'en'
                        ? 'Speaker diarization is enabled. Tap any speaker name to rename them anytime.'
                        : language === 'vi'
                        ? 'Đã bật phân tách người nói tự động. Nhấn vào tên bất kỳ để đổi tên.'
                        : '已开启发言人自动区分，可在转写页面随时点击名字进行重命名。',
                  },
                ]
              : []),
          ],
        },
        true
      );
      setIsProcessing(false);
      onNotify(imp.toastLocalImported(file.name));
      onClose();
    }, 320);
  };

  const handleConfirmLinkImport = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = videoLinkText.trim();
    if (!raw || isProcessing) return;
    if (!/https?:\/\/\S+/i.test(raw)) {
      setLinkError(imp.linkInvalidErr);
      return;
    }
    setLinkError(null);
    setIsProcessing(true);

    window.setTimeout(() => {
      const nowId = Date.now();
      const targetLangLabel = getLanguageOptionLabel(targetLang, language);
      const platform = raw.includes('douyin')
        ? language === 'zh'
          ? '抖音'
          : 'Douyin'
        : raw.includes('bilibili') || raw.includes('b23')
        ? language === 'zh'
          ? 'B站'
          : 'Bilibili'
        : raw.includes('kuaishou')
        ? language === 'zh'
          ? '快手'
          : 'Kuaishou'
        : raw.includes('youtu')
        ? 'YouTube'
        : raw.includes('facebook')
        ? 'Facebook'
        : raw.includes('x.com') || raw.includes('twitter')
        ? 'X/Twitter'
        : language === 'en'
        ? 'Media Link'
        : language === 'vi'
        ? 'Liên kết âm thanh'
        : '音视频链接';

      onImportRecording(
        {
          id: `rec-link-${nowId}`,
          title:
            language === 'en'
              ? `${platform} Media Transcript`
              : language === 'vi'
              ? `Bản chép lời ${platform}`
              : `${platform}音视频转写纪要`,
          dateLabel: '链接导入',
          timestamp: new Date().toISOString(),
          durationSec: 842,
          durationLabel: '14:02',
          sizeLabel: '6.4 MB',
          source: 'link',
          location: 'cloud',
          hasLocal: false,
          hasCloud: true,
          status: 'transcribed',
          folderId: selectedFolderId,
          tags: [imp.linkTitle, platform],
          diarized: diarize,
          waveform: Array.from({ length: 56 }, (_, i) =>
            Number((0.2 + Math.abs(Math.sin(i * 0.42)) * 0.68).toFixed(2))
          ),
          highlights: [
            {
              id: `hl-lk-${nowId}`,
              seconds: 96,
              time: '01:36',
              note:
                language === 'en'
                  ? 'Core methodology breakdown & practical examples'
                  : language === 'vi'
                  ? 'Phân tích phương pháp cốt lõi & ví dụ thực tế'
                  : '核心方法论拆解与实操案例',
            },
          ],
          notes:
            language === 'en'
              ? `Source URL: ${raw}`
              : language === 'vi'
              ? `Nguồn liên kết: ${raw}`
              : `来源内容：${raw}`,
          summary: {
            templateId: 'podcast',
            language: targetLang === '不确定/混合' ? '简体中文' : targetLang,
            overview:
              language === 'en'
                ? `Extracted and transcribed the public media stream from ${platform} (${targetLangLabel}), highlighting key arguments and timeline moments.`
                : language === 'vi'
                ? `Đã trích xuất và chép lời luồng âm thanh từ ${platform} (${targetLangLabel}), tổng hợp luận điểm chính và mốc thời gian.`
                : `已提取来自 ${platform} 的公开音视频流并完成转写（目标语言：${targetLang}），自动梳理出核心观点与重点时间轴。`,
            keyPoints:
              language === 'en'
                ? [
                    'Opening sets a dense, structured context and discussion framework.',
                    'Middle section walks through implementation steps and common pitfalls with examples.',
                  ]
                : language === 'vi'
                ? [
                    'Phần mở đầu xác lập bối cảnh và khung thảo luận cô đọng.',
                    'Phần giữa phân tích từng bước triển khai kèm ví dụ thực tế.',
                  ]
                : [
                    '开篇界定了核心背景与讨论框架，信息密度高。',
                    '中段结合具体案例拆解了落地步骤与常见误区。',
                  ],
            decisions:
              language === 'en'
                ? ['Archived to workspace for instant audio replay or VAMX Q&A.']
                : language === 'vi'
                ? ['Đã lưu vào không gian làm việc để nghe lại hoặc hỏi VAMX bất cứ lúc nào.']
                : ['归档至工作区，支持随时回听原声或向 VAMX 提问。'],
            actions: [
              {
                id: `act-lk-${nowId}`,
                text:
                  language === 'en'
                    ? 'Replay highlight at 01:36 and add supplemental notes'
                    : language === 'vi'
                    ? 'Nghe lại đoạn nổi bật lúc 01:36 và bổ sung ghi chú'
                    : '复听 01:36 重点片段并完善补充笔记',
                owner: language === 'en' ? 'Me' : language === 'vi' ? 'Tôi' : '我',
                done: false,
              },
            ],
          },
          transcript: [
            {
              id: `seg-lk-1-${nowId}`,
              time: '00:00',
              seconds: 0,
              speakerId: 'spk-1',
              speakerName: diarize ? cm.speakerN(1) : cm.speakerDefault,
              text:
                language === 'en'
                  ? `Parsed audio stream from ${platform} (${targetLangLabel}). Structured transcript follows.`
                  : language === 'vi'
                  ? `Đã phân tích luồng âm thanh từ ${platform} (${targetLangLabel}). Dưới đây là nội dung chép lời.`
                  : `已成功解析 ${platform} 分享链接音频流（${targetLang}）。以下为正文结构化转写内容。`,
            },
            {
              id: `seg-lk-2-${nowId}`,
              time: '01:36',
              seconds: 96,
              speakerId: diarize ? 'spk-2' : 'spk-1',
              speakerName: diarize ? cm.speakerN(2) : cm.speakerDefault,
              text:
                language === 'en'
                  ? 'Turning long videos and podcasts into searchable timeline notes multiplies review and knowledge capture efficiency.'
                  : language === 'vi'
                  ? 'Chuyển đổi video dài và podcast thành ghi chú theo mốc thời gian giúp tăng gấp nhiều lần hiệu suất tra cứu.'
                  : '将长视频和播客内容转化为可检索的时间轴纪要，能把复盘和知识沉淀效率提升数倍。',
            },
          ],
        },
        true
      );
      setIsProcessing(false);
      onNotify(imp.toastLinkImported(platform));
      onClose();
    }, 360);
  };

  const handleConfirmCommentsImport = (e: React.FormEvent) => {
    e.preventDefault();
    const url = youtubeUrl.trim();
    if (!url || isProcessing) return;
    if (!/https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
      setYoutubeError(imp.commentsInvalidErr);
      return;
    }
    setYoutubeError(null);
    setIsProcessing(true);

    window.setTimeout(() => {
      const nowId = Date.now();
      const videoTag = url.includes('v=') ? url.split('v=')[1].slice(0, 8) : 'YouTube';
      onImportRecording(
        {
          id: `rec-yt-cmt-${nowId}`,
          title:
            language === 'en'
              ? `YouTube Comment Insights (${videoTag})`
              : language === 'vi'
              ? `Phân tích bình luận YouTube (${videoTag})`
              : `YouTube 视频评论洞察 (${videoTag})`,
          dateLabel: '下载评论',
          timestamp: new Date().toISOString(),
          durationSec: downloadAudioToo ? 412 : 185,
          durationLabel: downloadAudioToo ? '06:52' : '03:05',
          sizeLabel: downloadAudioToo ? '4.8 MB' : '142 KB',
          source: 'import',
          location: 'cloud',
          hasLocal: downloadAudioToo,
          hasCloud: true,
          status: 'transcribed',
          folderId: selectedFolderId,
          tags:
            language === 'en'
              ? downloadAudioToo
                ? ['YouTube Comments', 'With Audio']
                : ['YouTube Comments']
              : language === 'vi'
              ? downloadAudioToo
                ? ['Bình luận YouTube', 'Kèm âm thanh']
                : ['Bình luận YouTube']
              : downloadAudioToo
              ? ['YouTube 评论', '含音频']
              : ['YouTube 评论'],
          diarized: diarize,
          waveform: Array.from({ length: 56 }, (_, i) =>
            Number((0.22 + Math.abs(Math.sin(i * 0.48)) * 0.58).toFixed(2))
          ),
          highlights: [
            {
              id: `hl-yt-${nowId}`,
              seconds: 0,
              time: '00:00',
              note:
                language === 'en'
                  ? 'Top consensus: portable pickup and live translation praised most'
                  : language === 'vi'
                  ? 'Đồng thuận nổi bật: thu âm nhỏ gọn & dịch trực tiếp được khen nhiều nhất'
                  : '高赞评论共识：便携拾音与翻译体验最受关注',
            },
          ],
          notes: `YouTube: ${url}`,
          summary: {
            templateId: 'meeting',
            language: language === 'en' ? '英语' : language === 'vi' ? '越南语' : '简体中文',
            overview:
              language === 'en'
                ? `Fetched and analyzed top YouTube comments${downloadAudioToo ? ' alongside the video audio track' : ''}. Viewers highlighted noise reduction, slim magnetic hardware, and multilingual accuracy.`
                : language === 'vi'
                ? `Đã tổng hợp bình luận nổi bật trên YouTube${downloadAudioToo ? ' kèm âm thanh gốc' : ''}. Người xem đánh giá cao khả năng lọc ồn, thiết kế mỏng và độ chính xác đa ngôn ngữ.`
                : `已抓取并解析该 YouTube 视频的高赞评论区${downloadAudioToo ? '并同步下载原视频音频' : ''}，观众关注集中在降噪表现、便携设计及多语种准确度。`,
            keyPoints:
              language === 'en'
                ? [
                    'Positive feedback (68%): Slim magnetic card with clean voice isolation in cafes.',
                    'Feature requests (21%): Industry glossaries and faster export templates.',
                    'Top questions (11%): Long-audio turnaround speed and cross-device cloud sync.',
                  ]
                : language === 'vi'
                ? [
                    'Phản hồi tích cực (68%): Thiết kế mỏng gọn, tách giọng rõ ở quán cà phê.',
                    'Đề xuất (21%): Thêm từ điển chuyên ngành và mẫu xuất tệp nhanh.',
                    'Câu hỏi phổ biến (11%): Tốc độ xử lý tệp dài và đồng bộ đa thiết bị.',
                  ]
                : [
                    '高频正向反馈（68%）：磁吸卡片形态轻薄便携，嘈杂环境语音分离清晰。',
                    '产品建议（21%）：希望补充更多专业行业词库与快速导出格式。',
                    '高频提问（11%）：关注长音频后台转写速度与跨设备云同步。',
                  ],
            decisions:
              language === 'en'
                ? ['Consolidate top viewer questions as inputs for the next release.']
                : language === 'vi'
                ? ['Tổng hợp câu hỏi hàng đầu làm tài liệu cho bản cập nhật tới.']
                : ['整理评论区 Top 问题并沉淀为下一版优化参考。'],
            actions: [
              {
                id: `act-yt-${nowId}`,
                text:
                  language === 'en'
                    ? 'Compile top-voted comment themes and share with product team'
                    : language === 'vi'
                    ? 'Tổng hợp chủ đề bình luận nổi bật và gửi nhóm sản phẩm'
                    : '汇总高赞评论观点并同步给产品协作组',
                owner: language === 'en' ? 'Me' : language === 'vi' ? 'Tôi' : '我',
                done: false,
              },
            ],
          },
          transcript: [
            {
              id: `seg-yt-1-${nowId}`,
              time: '00:00',
              seconds: 0,
              speakerId: 'spk-1',
              speakerName: diarize
                ? language === 'en'
                  ? 'Commenter #1 (@AlexChen)'
                  : language === 'vi'
                  ? 'Bình luận #1 (@AlexChen)'
                  : '评论者 #1 (@AlexChen)'
                : language === 'en'
                ? 'Top Comments'
                : language === 'vi'
                ? 'Bình luận chọn lọc'
                : '评论精选',
              text:
                language === 'en'
                  ? 'Voice isolation on this magnetic card recorder in an open cafe exceeded expectations—almost zero background chatter.'
                  : language === 'vi'
                  ? 'Khả năng tách giọng của thẻ ghi âm này trong quán cà phê vượt mong đợi, gần như không lẫn tạp âm.'
                  : '这台卡片录音设备在开放式咖啡馆的语音分离表现超出预期，几乎没有被环境背景音干扰。',
            },
            {
              id: `seg-yt-2-${nowId}`,
              time: '01:12',
              seconds: 72,
              speakerId: diarize ? 'spk-2' : 'spk-1',
              speakerName: diarize
                ? language === 'en'
                  ? 'Commenter #2 (@MiraStudio)'
                  : language === 'vi'
                  ? 'Bình luận #2 (@MiraStudio)'
                  : '评论者 #2 (@MiraStudio)'
                : language === 'en'
                ? 'Top Comments'
                : language === 'vi'
                ? 'Bình luận chọn lọc'
                : '评论精选',
              text:
                language === 'en'
                  ? 'Love the live translation and mind map features—turning YouTube discussion threads into action items is super handy.'
                  : language === 'vi'
                  ? 'Rất thích tính năng dịch trực tiếp và sơ đồ tư duy—biến thảo luận YouTube thành đầu việc rất tiện.'
                  : '非常喜欢实时翻译和思维导图功能，能直接把 YouTube 讨论评论也归纳成行动清单很实用。',
            },
            {
              id: `seg-yt-3-${nowId}`,
              time: '02:24',
              seconds: 144,
              speakerId: diarize ? 'spk-3' : 'spk-1',
              speakerName: diarize
                ? language === 'en'
                  ? 'Question (@Dev_Ken)'
                  : language === 'vi'
                  ? 'Câu hỏi (@Dev_Ken)'
                  : '评论提问 (@Dev_Ken)'
                : language === 'en'
                ? 'Top Comments'
                : language === 'vi'
                ? 'Bình luận chọn lọc'
                : '评论精选',
              text:
                language === 'en'
                  ? 'After importing a long video link, how long does speaker diarization and structured summary usually take?'
                  : language === 'vi'
                  ? 'Sau khi nhập liên kết video dài, việc phân tách người nói và tóm tắt thường mất bao lâu?'
                  : '请问导入长视频链接后，平均需要多久可以完成说话人区分与结构化总结？',
            },
          ],
        },
        true
      );
      setIsProcessing(false);
      onNotify(downloadAudioToo ? imp.toastCommentsAudioDone : imp.toastCommentsOnlyDone);
      onClose();
    }, 360);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-white rounded-t-3xl border-t border-[#E6ECF5] overflow-hidden shadow-2xl max-h-[88%] flex flex-col"
      >
        {/* Hidden native audio file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.m4a,.aac,.amr,.wav,.ogg,.flac,.opus,audio/*"
          onChange={handlePickLocalFile}
          className="hidden"
        />

        {/* MAIN 4-OPTION IMPORT AUDIO MENU */}
        {mode === 'menu' && (
          <div className="px-6 pt-5 pb-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-[18px] font-display font-bold text-[#111827]">{imp.menuTitle}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={imp.closeMenuAria}
                className="w-10 h-10 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center text-[#111827] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-[#EDF2F8]">
              <button
                type="button"
                onClick={() => setMode('comments')}
                className="w-full py-4 px-0.5 hover:bg-[#F8FAFD] flex items-center gap-4 text-left cursor-pointer transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-[#111827] shrink-0 stroke-[1.75]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium text-[#111827] leading-snug">
                    {imp.optComments}
                  </div>
                  <div className="text-[12px] text-[#94A3B8] mt-0.5">
                    {imp.optCommentsSub}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('local')}
                className="w-full py-4 px-0.5 hover:bg-[#F8FAFD] flex items-center gap-4 text-left cursor-pointer transition-colors"
              >
                <FileAudio className="w-5 h-5 text-[#111827] shrink-0 stroke-[1.75]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium text-[#111827] leading-snug">
                    {imp.optLocal}
                  </div>
                  <div className="text-[12px] text-[#94A3B8] mt-0.5">
                    {imp.optLocalSub}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('link')}
                className="w-full py-4 px-0.5 hover:bg-[#F8FAFD] flex items-center gap-4 text-left cursor-pointer transition-colors"
              >
                <Link2 className="w-5 h-5 text-[#111827] shrink-0 stroke-[1.75]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium text-[#111827] leading-snug">
                    {imp.optLink}
                  </div>
                  <div className="text-[12px] text-[#94A3B8] mt-0.5">
                    {imp.optLinkSub}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartQuickRecord();
                }}
                className="w-full py-4 px-0.5 hover:bg-[#F8FAFD] flex items-center gap-4 text-left cursor-pointer transition-colors"
              >
                <Mic className="w-5 h-5 text-[#111827] shrink-0 stroke-[1.75]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium text-[#111827] leading-snug">
                    {imp.optRecord}
                  </div>
                  <div className="text-[12px] text-[#94A3B8] mt-0.5">
                    {imp.optRecordSub}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* SUB-VIEW 1: 链接导入 */}
        {mode === 'link' && (
          <form onSubmit={handleConfirmLinkImport} className="flex-1 overflow-y-auto thin-scrollbar px-6 pt-5 pb-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-display font-bold text-[#111827]">{imp.linkTitle}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={cm.close}
                className="w-10 h-10 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center text-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="text-[14.5px] font-semibold text-[#111827]">{imp.linkHeading}</div>
              <p className="text-[12px] text-[#64748B] leading-relaxed mt-1">
                {imp.linkDesc}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] text-[#64748B]">{imp.linkLabel}</label>
                <button
                  type="button"
                  onClick={() => {
                    setVideoLinkText('https://www.bilibili.com/video/BV1VamxDemo');
                    setLinkError(null);
                  }}
                  className="text-[11px] font-medium text-[#1668FF] hover:underline cursor-pointer"
                >
                  {imp.fillExample}
                </button>
              </div>
              <textarea
                rows={4}
                value={videoLinkText}
                onChange={(e) => {
                  setVideoLinkText(e.target.value);
                  if (linkError) setLinkError(null);
                }}
                placeholder={imp.linkPlaceholder}
                autoFocus
                className={`w-full rounded-2xl border bg-white p-3.5 text-[13px] text-[#111827] placeholder:text-[#94A3B8] focus:outline-none resize-none transition-colors ${
                  linkError ? 'border-[#E53935]' : 'border-[#DCE3EE] focus:border-[#1668FF]'
                }`}
              />
              {linkError && <p className="text-[11px] text-[#E53935]">{linkError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] text-[#64748B]">{imp.targetLangLabel}</label>
              <div className="relative">
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-9 rounded-2xl border border-[#DCE3EE] bg-white text-[13.5px] text-[#111827] appearance-none focus:outline-none focus:border-[#1668FF] cursor-pointer"
                >
                  {TARGET_LANGUAGES.map((langOpt) => (
                    <option key={langOpt} value={langOpt}>
                      {getLanguageOptionLabel(langOpt, language)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] text-[#64748B]">{imp.folderLabel}</label>
              <div className="relative">
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-9 rounded-2xl border border-[#DCE3EE] bg-white text-[13.5px] text-[#111827] appearance-none focus:outline-none focus:border-[#1668FF] cursor-pointer"
                >
                  {folderOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={diarize}
                onChange={(e) => setDiarize(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#1668FF] focus:ring-[#1668FF]"
              />
              <span className="text-[13.5px] text-[#111827]">{imp.diarizeLabel}</span>
            </label>

            <button
              type="submit"
              disabled={!videoLinkText.trim() || isProcessing}
              className="w-full h-11 rounded-2xl bg-[#1668FF] hover:bg-[#0D59EB] disabled:bg-[#8EB7FF] text-white text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? imp.processingBtn : imp.linkSubmit}
            </button>
          </form>
        )}

        {/* SUB-VIEW 2: 本地导入 */}
        {mode === 'local' && (
          <form onSubmit={handleConfirmLocalImport} className="flex-1 overflow-y-auto thin-scrollbar px-6 pt-5 pb-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-display font-bold text-[#111827]">{imp.localTitle}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={cm.close}
                className="w-10 h-10 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center text-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="text-[14.5px] font-semibold text-[#111827]">{imp.localHeading}</div>
              <p className="text-[12px] text-[#64748B] mt-1">
                {imp.localDesc}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] text-[#64748B]">{imp.localAudioLabel}</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12 px-3 rounded-2xl border border-[#DCE3EE] bg-white hover:border-[#1668FF]/60 flex items-center gap-3 cursor-pointer transition-colors"
              >
                <span className="h-7 px-3 rounded-lg bg-[#EFF2F6] text-[12px] font-medium text-[#111827] inline-flex items-center shrink-0">
                  {imp.localPickBtn}
                </span>
                <span className="text-[13.5px] text-[#111827] truncate">
                  {selectedLocalFile ? selectedLocalFile.name : imp.localNoFile}
                </span>
              </div>
              <p className="text-[11.5px] text-[#64748B] leading-relaxed">
                {imp.localHint}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] text-[#64748B]">{imp.targetLangLabel}</label>
              <div className="relative">
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-9 rounded-2xl border border-[#DCE3EE] bg-white text-[13.5px] text-[#111827] appearance-none focus:outline-none focus:border-[#1668FF] cursor-pointer"
                >
                  {TARGET_LANGUAGES.map((langOpt) => (
                    <option key={langOpt} value={langOpt}>
                      {getLanguageOptionLabel(langOpt, language)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] text-[#64748B]">{imp.folderLabel}</label>
              <div className="relative">
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-9 rounded-2xl border border-[#DCE3EE] bg-white text-[13.5px] text-[#111827] appearance-none focus:outline-none focus:border-[#1668FF] cursor-pointer"
                >
                  {folderOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={diarize}
                onChange={(e) => setDiarize(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#1668FF] focus:ring-[#1668FF]"
              />
              <span className="text-[13.5px] text-[#111827]">{imp.diarizeLabel}</span>
            </label>

            <button
              type="submit"
              disabled={!selectedLocalFile || isProcessing}
              className="w-full h-11 rounded-2xl bg-[#1668FF] hover:bg-[#0D59EB] disabled:bg-[#8EB7FF] text-white text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? imp.localSubmitting : imp.localSubmit}
            </button>
          </form>
        )}

        {/* SUB-VIEW 3: 下载评论 */}
        {mode === 'comments' && (
          <form onSubmit={handleConfirmCommentsImport} className="flex-1 overflow-y-auto thin-scrollbar px-6 pt-5 pb-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-display font-bold text-[#111827]">{imp.commentsTitle}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={cm.close}
                className="w-10 h-10 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center text-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="text-[14.5px] font-semibold text-[#111827]">{imp.commentsHeading}</div>
              <p className="text-[12px] text-[#64748B] mt-1">
                {imp.commentsDesc}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] text-[#64748B]">{imp.commentsInputLabel}</label>
                <button
                  type="button"
                  onClick={() => {
                    setYoutubeUrl('https://www.youtube.com/watch?v=vamxCardDemo01');
                    setYoutubeError(null);
                  }}
                  className="text-[11px] font-medium text-[#1668FF] hover:underline cursor-pointer"
                >
                  {imp.fillExample}
                </button>
              </div>
              <textarea
                rows={4}
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  if (youtubeError) setYoutubeError(null);
                }}
                placeholder={imp.commentsPlaceholder}
                autoFocus
                className={`w-full rounded-2xl border bg-white p-3.5 text-[13px] text-[#111827] placeholder:text-[#94A3B8] focus:outline-none resize-none transition-colors ${
                  youtubeError ? 'border-[#E53935]' : 'border-[#DCE3EE] focus:border-[#1668FF]'
                }`}
              />
              {youtubeError && <p className="text-[11px] text-[#E53935]">{youtubeError}</p>}
            </div>

            <div className="space-y-3 pt-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={diarize}
                  onChange={(e) => setDiarize(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#1668FF] focus:ring-[#1668FF]"
                />
                <span className="text-[13.5px] text-[#111827]">
                  {imp.commentsDiarizeLabel}
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-not-allowed select-none opacity-65">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  disabled
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#1668FF]"
                />
                <span className="text-[13.5px] text-[#64748B]">{imp.commentsDownloadOnly}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={downloadAudioToo}
                  onChange={(e) => setDownloadAudioToo(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#1668FF] focus:ring-[#1668FF]"
                />
                <span className="text-[13.5px] text-[#111827]">{imp.commentsDownloadAudio}</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] text-[#64748B]">{imp.folderLabel}</label>
              <div className="relative">
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-9 rounded-2xl border border-[#DCE3EE] bg-white text-[13.5px] text-[#111827] appearance-none focus:outline-none focus:border-[#1668FF] cursor-pointer"
                >
                  {folderOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!youtubeUrl.trim() || isProcessing}
              className="w-full h-11 rounded-2xl bg-[#1668FF] hover:bg-[#0D59EB] disabled:bg-[#8EB7FF] text-white text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? imp.commentsSubmitting : imp.commentsSubmit}
            </button>
          </form>
        )}

        {/* SUB-VIEW 4: DEVICE CARD RECORDINGS SYNC */}
        {mode === 'device' && (
          <>
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-zinc-200" />
            </div>
            <div className="px-5 pt-2 pb-3 border-b border-[#EDF2F8] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-display font-bold text-[#111827]">{imp.deviceTitle}</h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-mono tabular-nums truncate">
                  {device.bound === false
                    ? imp.deviceUnboundStatus
                    : device.connected
                    ? imp.deviceConnectedStatus(device.name, pendingFiles.length, importedFiles.length)
                    : imp.deviceOfflineStatus}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {pendingFiles.length > 0 && device.bound !== false && device.connected && (
                  <button
                    type="button"
                    onClick={handleImportAllPending}
                    disabled={!!importingId}
                    className="h-9 px-3 rounded-lg bg-[#1668FF] hover:bg-[#0D59EB] disabled:opacity-60 text-white text-xs font-medium whitespace-nowrap cursor-pointer"
                  >
                    {pendingFiles.length > 1 ? imp.importAllBtn : imp.importOneBtn}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={imp.closeImportAria}
                  className="w-11 h-11 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs + Search */}
            <div className="px-5 pt-3 pb-2.5 border-b border-[#EDF2F8] space-y-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'all', label: imp.tabAll(files.length) },
                    { id: 'pending', label: imp.tabPending(pendingFiles.length) },
                    { id: 'imported', label: imp.tabImported(importedFiles.length) },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDeviceFilter(tab.id)}
                    className={`h-7 px-3 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
                      deviceFilter === tab.id
                        ? 'bg-[#EEF3FF] text-[#1668FF] font-semibold'
                        : 'bg-[#F4F6FA] text-[#64748B] hover:text-[#111827]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={imp.searchCardPlaceholder}
                    className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#F4F6FA] text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRefreshing(true);
                    onRefreshCardFiles();
                    window.setTimeout(() => setIsRefreshing(false), 380);
                  }}
                  aria-label={imp.refreshCardAria}
                  className="w-9 h-9 rounded-xl bg-[#F4F6FA] hover:bg-[#E7ECF5] flex items-center justify-center text-zinc-600 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#1668FF]' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar divide-y divide-[#EDF2F8] px-5">
              {filteredFiles.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#94A3B8]">
                  {imp.emptyCardFiles}
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div key={file.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-[#EEF3FF] flex items-center justify-center text-[#1668FF] shrink-0">
                        <FileAudio className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#111827] truncate">
                            {file.name}
                          </span>
                          {!file.imported && (
                            <span className="text-[11px] font-medium text-amber-600 shrink-0">
                              {imp.pendingBadge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">
                          {file.date} · {file.duration} · {file.size}
                        </div>
                        {file.progress > 0 && !file.imported && (
                          <div className="mt-2 h-1 bg-[#E8EEF7] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1668FF] transition-all duration-150"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {file.imported ? (
                      <div className="h-7 px-2 text-emerald-600 text-[11px] font-medium flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        <span>{imp.importedBadge}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => importCardFile(file)}
                        disabled={device.bound === false || !device.connected || importingId === file.id}
                        className="h-8 px-3 rounded-lg bg-[#EEF3FF] hover:bg-[#E0EAFF] text-xs font-semibold text-[#1668FF] flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{importingId === file.id ? `${file.progress}%` : imp.importBtn}</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-[#EDF2F8] bg-[#FAFBFD]">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="w-full h-10 rounded-xl border border-[#DCE5F2] bg-white hover:bg-[#F4F7FC] text-xs font-semibold text-[#111827] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-[#1668FF]" />
                <span>{imp.openMenuFooterBtn}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
