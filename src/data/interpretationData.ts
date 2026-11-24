import {
  AppLanguage,
  InterpAccessPolicy,
  InterpArchiveStatus,
  InterpAuditLog,
  InterpLifecycleStatus,
  InterpRoleView,
  InterpUtterance,
  InterpretationRoom,
  StandbyInterpreter,
} from '../types/vamx';

export interface InterpLangPair {
  id: string;
  sourceLang: string;
  targetLang: string;
  zhLabel: string;
  enLabel: string;
  viLabel: string;
  featured?: boolean;
}

export const INTERP_LANG_PAIRS: InterpLangPair[] = [
  {
    id: 'zh-vi',
    sourceLang: '中文',
    targetLang: '越南语',
    zhLabel: '中文 → 越南语（首发中译越重点方向）',
    enLabel: 'Chinese → Vietnamese (Priority ASEAN Route)',
    viLabel: 'Tiếng Trung → Tiếng Việt (Tuyến ưu tiên ASEAN)',
    featured: true,
  },
  {
    id: 'vi-zh',
    sourceLang: '越南语',
    targetLang: '中文',
    zhLabel: '越南语 → 中文',
    enLabel: 'Vietnamese → Chinese',
    viLabel: 'Tiếng Việt → Tiếng Trung',
  },
  {
    id: 'zh-en',
    sourceLang: '中文',
    targetLang: '英语',
    zhLabel: '中文 → 英语',
    enLabel: 'Chinese → English',
    viLabel: 'Tiếng Trung → Tiếng Anh',
  },
  {
    id: 'en-zh',
    sourceLang: '英语',
    targetLang: '中文',
    zhLabel: '英语 → 中文',
    enLabel: 'English → Chinese',
    viLabel: 'Tiếng Anh → Tiếng Trung',
  },
  {
    id: 'en-vi',
    sourceLang: '英语',
    targetLang: '越南语',
    zhLabel: '英语 → 越南语',
    enLabel: 'English → Vietnamese',
    viLabel: 'Tiếng Anh → Tiếng Việt',
  },
  {
    id: 'vi-en',
    sourceLang: '越南语',
    targetLang: '英语',
    zhLabel: '越南语 → 英语',
    enLabel: 'Vietnamese → English',
    viLabel: 'Tiếng Việt → Tiếng Anh',
  },
];

export interface InterpRouteOption {
  id: 'route-asean' | 'route-global';
  latencyMs: number;
  zhName: string;
  enName: string;
  viName: string;
}

export const INTERP_ROUTES: InterpRouteOption[] = [
  {
    id: 'route-asean',
    latencyMs: 680,
    zhName: '线路 A · 东盟中越低延迟专线 (~680ms)',
    enName: 'Route A · ASEAN Low-Latency Line (~680ms)',
    viName: 'Tuyến A · Chuyên tuyến ASEAN độ trễ thấp (~680ms)',
  },
  {
    id: 'route-global',
    latencyMs: 1120,
    zhName: '线路 B · 全球通用线路 (~1120ms)',
    enName: 'Route B · Global Standard Line (~1120ms)',
    viName: 'Tuyến B · Toàn cầu tiêu chuẩn (~1120ms)',
  },
];

export interface InterpOrg {
  id: 'org-a' | 'org-b';
  zhLabel: string;
  enLabel: string;
  viLabel: string;
  adminName: string;
  avatarChar: string;
}

export const INTERP_ORGS: InterpOrg[] = [
  {
    id: 'org-a',
    zhLabel: '组织 A · 张明（创建人）',
    enLabel: 'Org A · Zhang Ming (Creator)',
    viLabel: 'Tổ chức A · Zhang Ming (Người tạo)',
    adminName: '张明',
    avatarChar: '张',
  },
  {
    id: 'org-b',
    zhLabel: '组织 B · 陈越（跨组织管理员）',
    enLabel: 'Org B · Chen Yue (Cross-Org Admin)',
    viLabel: 'Tổ chức B · Chen Yue (Quản trị viên khác)',
    adminName: '陈越',
    avatarChar: '陈',
  },
];

export const DEFAULT_STANDBY_INTERPRETERS: StandbyInterpreter[] = [
  {
    id: 'int-1',
    name: '阮氏明',
    langs: '中文 ↔ 越南语 · 商务制造',
    device: 'MacBook Pro + Neumann USB',
    network: 'Wi-Fi 6 · 18ms',
    latencyMs: 18,
    online: true,
  },
  {
    id: 'int-2',
    name: '黎文辉',
    langs: '中文 ↔ 越南语 · 供应链/合规',
    device: 'ThinkPad X1 + Shure MV7',
    network: '5G 专线 · 26ms',
    latencyMs: 26,
    online: true,
  },
  {
    id: 'int-3',
    name: '陈美玲',
    langs: '中 / 英 / 越 三语高级同传',
    device: 'iPad Pro + Rode NT-USB',
    network: '光纤专线 · 14ms',
    latencyMs: 14,
    online: true,
  },
];

export const TRIAL_SPEECH_SAMPLES: Record<string, string[]> = {
  中文: [
    '各位好，海防仓的验收改到 2026 年 12 月 4 日下午 3 点，请林岚提前核对 25 箱货物与双语清单。',
    '本次中越跨境物流通道已经切换到东盟低延迟节点，所有现场听众可通过六位邀请码直接浏览器收听。',
    '第二议题请越南工厂团队同步三季度良品率数据，并在周五前确认备货排期。',
  ],
  越南语: [
    'Xin chào mọi người, lịch nghiệm thu kho Hải Phòng chuyển sang 15:00 ngày 04/12/2026, chị Lin Lan vui lòng đối chiếu trước 25 thùng hàng và danh sách song ngữ.',
    'Tất cả thính giả tại hội trường có thể mở trình duyệt và nhập mã 6 số để nghe kênh dịch trực tiếp.',
  ],
  英语: [
    'Welcome everyone. The Haiphong warehouse inspection moves to Dec 4, 2026 at 3:00 PM. Please ask Lin Lan to verify all 25 cartons against the bilingual manifest.',
    'If AI caption assistance is temporarily degraded, human audio interpretation continues uninterrupted across both tracks.',
  ],
};

export function formatSecMMSS(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function getRouteLabel(routeId: 'route-asean' | 'route-global', lang: AppLanguage): string {
  const found = INTERP_ROUTES.find((r) => r.id === routeId) || INTERP_ROUTES[0];
  return lang === 'en' ? found.enName : lang === 'vi' ? found.viName : found.zhName;
}

export function getRoomLifecycle(room: InterpretationRoom): InterpLifecycleStatus {
  if (room.lifecycle) return room.lifecycle;
  if (room.status === 'live') return 'live';
  if (room.status === 'paused') return 'paused';
  if (room.status === 'ended') {
    return room.minutes?.publishedLocked ? 'published' : 'reviewable';
  }
  return 'upcoming';
}

export function getArchiveStatus(
  room: InterpretationRoom,
  isGenerating = false
): InterpArchiveStatus {
  if (isGenerating) return 'processing';
  const lc = getRoomLifecycle(room);
  if (lc === 'published' || room.minutes?.publishedLocked || room.archiveStatus === 'published') {
    return 'published';
  }
  if (room.archiveStatus === 'completed' || room.minutes?.reviewedConfirmed) {
    return 'completed';
  }
  if (room.archiveStatus === 'processing' || Boolean(room.minutes)) {
    return 'processing';
  }
  return 'reviewable';
}

export function createAuditEntry(actor: string, action: string, detail: string): InterpAuditLog {
  const d = new Date();
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  return {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time,
    actor,
    action,
    detail,
  };
}

export function normalizeInterpretationRoom(room: InterpretationRoom): InterpretationRoom {
  const lifecycle = getRoomLifecycle(room);
  const routeId = room.routeId ?? 'route-asean';
  const durationSec = room.durationSec ?? (lifecycle === 'reviewable' || lifecycle === 'published' ? 60 : 0);
  const utterances = room.utterances ?? [];
  const originalSegments =
    room.originalSegments ??
    (durationSec > 0
      ? [
          {
            id: `${room.id}-orig-1`,
            startSec: 0,
            endSec: durationSec,
            label: `00:00 ${room.sourceLang === '中文' ? '中文 (zh)' : room.sourceLang}`,
          },
        ]
      : []);
  const interpretedSegments =
    room.interpretedSegments ??
    (durationSec > 0
      ? [
          {
            id: `${room.id}-int-1`,
            startSec: 0,
            endSec: durationSec,
            label: `00:00 ${room.targetLang === '越南语' ? '越南语 (vi)' : room.targetLang}`,
          },
        ]
      : []);

  const archiveStatus =
    lifecycle === 'reviewable' || lifecycle === 'published' || room.status === 'ended'
      ? getArchiveStatus(room)
      : room.archiveStatus;

  return {
    ...room,
    orgId: room.orgId ?? 'org-a',
    lifecycle,
    archiveStatus,
    maxSeats: room.maxSeats ?? 30,
    routeId,
    routeLabel: room.routeLabel ?? INTERP_ROUTES.find((r) => r.id === routeId)?.zhName ?? INTERP_ROUTES[0].zhName,
    accessPolicy: room.accessPolicy ?? 'public',
    glossaryHints: room.glossaryHints ?? ['海防仓', '林岚', '双语清单', '25箱'],
    audienceCaptionsEnabled: room.audienceCaptionsEnabled ?? false,
    entryOpen: room.entryOpen ?? (lifecycle !== 'reviewable' && lifecycle !== 'published'),
    removedGuests: room.removedGuests ?? [],
    notes: room.notes ?? '会前联调完成再开播；听众默认关闭实时字幕。',
    speakerName: room.speakerName ?? '陈远',
    leadInterpreterId: room.leadInterpreterId ?? 'int-1',
    leadInterpreterName: room.leadInterpreterName ?? '阮氏明',
    standbyInterpreters: room.standbyInterpreters ?? DEFAULT_STANDBY_INTERPRETERS,
    aiAssistEnabled: room.aiAssistEnabled ?? true,
    preflight: room.preflight ?? {
      micChecked: lifecycle === 'live' || lifecycle === 'reviewable' || lifecycle === 'published',
      dualToneChecked: lifecycle === 'live' || lifecycle === 'reviewable' || lifecycle === 'published',
      rtcChecked: true,
    },
    durationSec,
    utterances,
    originalSegments,
    interpretedSegments,
    auditLogs: room.auditLogs ?? [],
  };
}

export function createRichInitialRooms(): InterpretationRoom[] {
  return [
    {
      id: 'room-live-demo',
      title: '中越跨境供应链培训（演练）',
      sourceLang: '中文',
      targetLang: '越南语',
      status: 'live',
      lifecycle: 'live',
      orgId: 'org-a',
      listenerCount: 0,
      maxSeats: 30,
      inviteCode: '664335',
      createdByMe: true,
      createdAt: '2026-11-24 16:40',
      startedAt: '2026-11-24 16:42',
      routeId: 'route-asean',
      routeLabel: '线路 A · 东盟中越低延迟专线',
      accessPolicy: 'public',
      glossaryHints: ['海防仓', '林岚', '双语清单', '25箱'],
      audienceCaptionsEnabled: false,
      entryOpen: true,
      notes: '会前联调完成再开播；听众默认关闭实时字幕。',
      speakerName: '陈远',
      leadInterpreterId: 'int-1',
      leadInterpreterName: '阮氏明',
      standbyInterpreters: DEFAULT_STANDBY_INTERPRETERS,
      aiAssistEnabled: true,
      preflight: { micChecked: true, dualToneChecked: true, rtcChecked: true },
      durationSec: 45,
      utterances: [],
      originalSegments: [],
      interpretedSegments: [],
      auditLogs: [
        {
          id: 'aud-init-1',
          time: '16:40:12',
          actor: '张明（主持人）',
          action: '创建房间',
          detail: '锁定线路 A · 东盟中越低延迟专线，生成 6 位码 664335',
        },
        {
          id: 'aud-init-2',
          time: '16:42:05',
          actor: '张明（主持人）',
          action: '开始同传广播',
          detail: '状态切换为直播中，听众实时字幕默认关闭',
        },
      ],
    },
    {
      id: 'room-arch-1',
      title: '中越跨境供应链培训（演练）',
      sourceLang: '中文',
      targetLang: '越南语',
      status: 'ended',
      lifecycle: 'reviewable',
      orgId: 'org-a',
      listenerCount: 18,
      maxSeats: 30,
      inviteCode: '812409',
      createdByMe: true,
      createdAt: '2026-11-24 16:47',
      startedAt: '2026-11-24 16:00',
      endedAt: '2026-11-24 16:47',
      routeId: 'route-asean',
      routeLabel: '线路 A · 东盟中越低延迟专线',
      accessPolicy: 'public',
      glossaryHints: ['海防仓', '林岚', '双语清单', '25箱'],
      audienceCaptionsEnabled: false,
      entryOpen: false,
      speakerName: '陈远',
      leadInterpreterId: 'int-2',
      leadInterpreterName: '黎文辉',
      standbyInterpreters: DEFAULT_STANDBY_INTERPRETERS,
      aiAssistEnabled: true,
      durationSec: 60,
      handoverAtSec: 32,
      handoverNote: '32s 处由 阮氏明 应急交接至 黎文辉',
      utterances: [
        {
          id: 'utt-a1-1',
          time: '00:05',
          seconds: 5,
          speakerName: '陈远',
          interpreterName: '阮氏明',
          sourceText: '各位同事下午好，今天首先同步海防仓 12 月 4 日下午 3 点的验收安排，共计 25 箱出口组件。',
          translatedText:
            'Chào buổi chiều các anh chị, hôm nay trước hết xin cập nhật lịch nghiệm thu tại kho Hải Phòng vào 15:00 ngày 4/12 với tổng cộng 25 thùng linh kiện xuất khẩu.',
          translationStatus: 'confirmed',
          terminologyMatched: ['海防仓', '25箱'],
        },
        {
          id: 'utt-a1-2',
          time: '00:22',
          seconds: 22,
          speakerName: '陈远',
          interpreterName: '阮氏明',
          sourceText: '请林岚在本周四前完成双语清单核对，并同步给越南现场质检团队。',
          translatedText:
            'Đề nghị chị Lin Lan hoàn tất đối chiếu danh sách song ngữ trước thứ Năm tuần này và gửi cho đội kiểm tra chất lượng tại Việt Nam.',
          translationStatus: 'draft',
          terminologyMatched: ['林岚', '双语清单'],
        },
        {
          id: 'utt-a1-3',
          time: '00:38',
          seconds: 38,
          speakerName: '陈远',
          interpreterName: '黎文辉',
          sourceText: '交接后的备货温湿度追踪表需要保留至少 90 天云端留痕。',
          translatedText: '',
          translationStatus: 'failed',
          isGap: true,
          gapReason: '网络瞬断 · 待人工补录译文',
          gapResolved: false,
        },
      ],
      originalSegments: [
        { id: 'os-1', startSec: 0, endSec: 60, label: '00:00 中文 (zh)' },
      ],
      interpretedSegments: [
        { id: 'is-1', startSec: 0, endSec: 32, label: '00:00 越南语 (vi) · 阮氏明' },
        { id: 'is-2', startSec: 32, endSec: 44, label: '00:32 缺段（交接瞬断）', isGap: true, gapReason: '译员交接重连 12s' },
        { id: 'is-3', startSec: 44, endSec: 60, label: '00:44 越南语 (vi) · 黎文辉' },
      ],
      auditLogs: [
        {
          id: 'aud-a1-1',
          time: '16:15:32',
          actor: '张明（主持人）',
          action: '应急暂停并换人',
          detail: '由 阮氏明 切换为 黎文辉，已在 00:32 写入交接点',
        },
        {
          id: 'aud-a1-2',
          time: '16:47:00',
          actor: '张明（主持人）',
          action: '结束会议',
          detail: '关闭新入场，双轨状态已收敛为可用',
        },
      ],
    },
    {
      id: 'room-arch-2',
      title: '河内工厂质量评审会',
      sourceLang: '中文',
      targetLang: '越南语',
      status: 'ended',
      lifecycle: 'published',
      orgId: 'org-a',
      listenerCount: 24,
      maxSeats: 30,
      inviteCode: '390512',
      createdByMe: true,
      createdAt: '2026-11-18 14:20',
      startedAt: '2026-11-18 14:00',
      endedAt: '2026-11-18 14:20',
      routeId: 'route-asean',
      routeLabel: '线路 A · 东盟中越低延迟专线',
      accessPolicy: 'org_only',
      glossaryHints: ['良品率', '河内二厂', 'SOP'],
      audienceCaptionsEnabled: false,
      entryOpen: false,
      speakerName: '林岚',
      leadInterpreterId: 'int-1',
      leadInterpreterName: '阮氏明',
      durationSec: 156,
      utterances: [
        {
          id: 'utt-a2-1',
          time: '00:10',
          seconds: 10,
          speakerName: '林岚',
          interpreterName: '阮氏明',
          sourceText: '河内二厂 10 月成品良品率已提升至 99.4%，达到季度交付线。',
          translatedText:
            'Tỷ lệ đạt chuẩn thành phẩm tháng 10 tại Nhà máy Hà Nội 2 đã tăng lên 99,4%, đạt ngưỡng giao hàng quý.',
          translationStatus: 'confirmed',
          terminologyMatched: ['河内二厂', '良品率'],
        },
        {
          id: 'utt-a2-2',
          time: '01:18',
          seconds: 78,
          speakerName: '林岚',
          interpreterName: '阮氏明',
          sourceText: '下一批抽检 SOP 将在周一前下发给质检班长确认签收。',
          translatedText:
            'Quy trình SOP kiểm tra ngẫu nhiên lô tiếp theo sẽ được gửi cho tổ trưởng QC xác nhận trước thứ Hai.',
          translationStatus: 'confirmed',
          terminologyMatched: ['SOP'],
        },
      ],
      originalSegments: [{ id: 'os-a2', startSec: 0, endSec: 156, label: '00:00 中文 (zh)' }],
      interpretedSegments: [{ id: 'is-a2', startSec: 0, endSec: 156, label: '00:00 越南语 (vi)' }],
      minutes: {
        summary: '本次河内工厂质量评审会确认二厂 10 月良品率达 99.4%，并明确下一批次抽检 SOP 下发与签收安排。',
        topics: ['河内二厂良品率达成', '下一批次抽检 SOP 更新'],
        topicAnalyses: [
          {
            topic: '河内二厂良品率达成',
            analysis: '成品良品率达到 99.4%，已满足当前季度出口订单合规要求，波动项主要集中在包装工段复检。',
          },
          {
            topic: '下一批次抽检 SOP 更新',
            analysis: '新版抽检 SOP 将重点补齐条码核验与双语标签抽样动作。',
          },
        ],
        keyConclusions: [
          { id: 'kc-1', text: '河内二厂 10 月良品率 99.4% 正式通过季度交付验收。', timestamp: '00:10' },
          { id: 'kc-2', text: '新版抽检 SOP 需在周一前完成质检班长签收确认。', timestamp: '01:18' },
        ],
        actionItems: [
          {
            id: 'ai-1',
            task: '下发新版抽检 SOP 并收集质检班长签收确认',
            owner: '林岚',
            deadline: '周一前',
            sourceTimestamp: '01:18',
          },
        ],
        risksAndOpenQuestions: ['暂无未决阻塞项，建议下月复查包装段温湿度记录。'],
        reviewedConfirmed: true,
        publishedLocked: true,
        generatedAt: '2026-11-18 14:25',
      },
      auditLogs: [],
    },
    {
      id: 'room-arch-3',
      title: '东盟跨境供应链周会',
      sourceLang: '中文',
      targetLang: '越南语',
      status: 'ended',
      lifecycle: 'reviewable',
      archiveStatus: 'processing',
      orgId: 'org-a',
      listenerCount: 15,
      maxSeats: 30,
      inviteCode: '551029',
      createdByMe: true,
      createdAt: '2026-11-17 10:15',
      startedAt: '2026-11-17 09:30',
      endedAt: '2026-11-17 10:15',
      routeId: 'route-asean',
      routeLabel: '线路 A · 东盟中越低延迟专线',
      accessPolicy: 'public',
      glossaryHints: ['海防港', '清关单证'],
      audienceCaptionsEnabled: false,
      entryOpen: false,
      speakerName: '陈远',
      leadInterpreterId: 'int-1',
      leadInterpreterName: '阮氏明',
      durationSec: 180,
      utterances: [
        {
          id: 'utt-a3-1',
          time: '00:15',
          seconds: 15,
          speakerName: '陈远',
          interpreterName: '阮氏明',
          sourceText: '本周海防港清关单证需同步双语发票与箱单电子章。',
          translatedText:
            'Chứng từ thông quan cảng Hải Phòng tuần này cần đồng bộ hóa đơn song ngữ và phiếu đóng gói có dấu điện tử.',
          translationStatus: 'confirmed',
        },
        {
          id: 'utt-a3-2',
          time: '01:40',
          seconds: 100,
          speakerName: '陈远',
          interpreterName: '阮氏明',
          sourceText: '请跟进下周加开柜位费用确认，目前还没定谁来对接船务。',
          translatedText:
            'Vui lòng theo dõi xác nhận chi phí đặt thêm container tuần tới, hiện chưa chốt đầu mối liên hệ hãng tàu.',
          translationStatus: 'draft',
        },
      ],
      originalSegments: [{ id: 'os-a3', startSec: 0, endSec: 180, label: '00:00 中文 (zh)' }],
      interpretedSegments: [{ id: 'is-a3', startSec: 0, endSec: 180, label: '00:00 越南语 (vi)' }],
      minutes: {
        summary: '同步海防港本周清关单证双语发票电子章要求，并跟进下周加开柜位费用确认与船务对接人选。',
        topics: ['海防港清关单证', '加开柜位费用确认'],
        topicAnalyses: [
          {
            topic: '海防港清关单证',
            analysis: '需同步双语发票与电子签章箱单，确保越南港务当天放行。',
          },
        ],
        keyConclusions: [
          { id: 'kc-31', text: '本周海防港清关单证需配齐双语发票及电子章。', timestamp: '00:15' },
        ],
        actionItems: [
          {
            id: 'ai-31',
            task: '确认下周加开柜位费用与船务对接责任人',
            owner: '待确认',
            deadline: '周五前',
            sourceTimestamp: '01:40',
          },
        ],
        risksAndOpenQuestions: ['加开柜位船务对接人尚未最终落定。'],
        reviewedConfirmed: false,
        publishedLocked: false,
        generatedAt: '2026-11-17 10:22',
      },
      auditLogs: [],
    },
    {
      id: 'room-arch-5',
      title: '中译越培训彩排',
      sourceLang: '中文',
      targetLang: '越南语',
      status: 'ended',
      lifecycle: 'reviewable',
      archiveStatus: 'completed',
      orgId: 'org-a',
      listenerCount: 12,
      maxSeats: 30,
      inviteCode: '449810',
      createdByMe: true,
      createdAt: '2026-11-17 09:10',
      startedAt: '2026-11-17 08:30',
      endedAt: '2026-11-17 09:10',
      routeId: 'route-asean',
      routeLabel: '线路 A · 东盟中越低延迟专线',
      accessPolicy: 'org_only',
      glossaryHints: ['海防仓', '东盟专线'],
      audienceCaptionsEnabled: false,
      entryOpen: false,
      speakerName: '陈远',
      leadInterpreterId: 'int-1',
      leadInterpreterName: '阮氏明',
      durationSec: 120,
      utterances: [
        {
          id: 'utt-a5-1',
          time: '00:12',
          seconds: 12,
          speakerName: '陈远',
          interpreterName: '阮氏明',
          sourceText: '彩排阶段已完成中译越热词表注入与双声道音量校准。',
          translatedText:
            'Giai đoạn tổng duyệt đã hoàn tất nạp bảng thuật ngữ Trung - Việt và cân chỉnh âm lượng 2 kênh.',
          translationStatus: 'confirmed',
        },
      ],
      originalSegments: [{ id: 'os-a5', startSec: 0, endSec: 120, label: '00:00 中文 (zh)' }],
      interpretedSegments: [{ id: 'is-a5', startSec: 0, endSec: 120, label: '00:00 越南语 (vi)' }],
      minutes: {
        summary: '完成中译越专项培训彩排，热词表与东盟低延迟双声道链路均已核验通过。',
        topics: ['热词表注入校验', '双声道延迟测试'],
        topicAnalyses: [
          {
            topic: '热词表注入校验',
            analysis: '海防仓、东盟专线等核心词条映射准确率 100%。',
          },
        ],
        keyConclusions: [
          { id: 'kc-51', text: '彩排双轨录音与 AI 字幕草稿均已核对确认。', timestamp: '00:12' },
        ],
        actionItems: [
          {
            id: 'ai-51',
            task: '发布归档后同步给培训讲师与译员团队留存',
            owner: '张明',
            deadline: '今日内',
            sourceTimestamp: '00:12',
          },
        ],
        risksAndOpenQuestions: [],
        reviewedConfirmed: true,
        publishedLocked: false,
        generatedAt: '2026-11-17 09:15',
      },
      auditLogs: [],
    },
    {
      id: 'room-arch-4',
      title: '新加坡商务合规培训（已结束归档）',
      sourceLang: '中文',
      targetLang: '英语',
      status: 'ended',
      lifecycle: 'published',
      orgId: 'org-a',
      listenerCount: 28,
      maxSeats: 30,
      inviteCode: '778320',
      createdByMe: true,
      createdAt: '2026-11-16 15:40',
      startedAt: '2026-11-16 14:30',
      endedAt: '2026-11-16 15:40',
      routeId: 'route-global',
      routeLabel: '线路 B · 全球通用线路',
      accessPolicy: 'allowlist',
      glossaryHints: ['PDPA', '合规审查'],
      audienceCaptionsEnabled: false,
      entryOpen: false,
      speakerName: '张明',
      leadInterpreterId: 'int-3',
      leadInterpreterName: '陈美玲',
      durationSec: 210,
      utterances: [
        {
          id: 'utt-a4-1',
          time: '00:08',
          seconds: 8,
          speakerName: '张明',
          interpreterName: '陈美玲',
          sourceText: '所有跨境音频与双语转写资产均遵循组织隔离与 PDPA 数据留痕规范。',
          translatedText:
            'All cross-border audio and bilingual transcript assets strictly adhere to org isolation and PDPA retention compliance.',
          translationStatus: 'confirmed',
        },
      ],
      originalSegments: [{ id: 'os-a4', startSec: 0, endSec: 210, label: '00:00 中文 (zh)' }],
      interpretedSegments: [{ id: 'is-a4', startSec: 0, endSec: 210, label: '00:00 English (en)' }],
      minutes: {
        summary: '梳理新加坡区域数据合规与跨境传输留痕要求，确认工作台组织隔离生效。',
        topics: ['PDPA 合规要求', '组织隔离验证'],
        topicAnalyses: [
          {
            topic: 'PDPA 合规要求',
            analysis: '明确会议开场前听众须知勾选录制告知并记录审计时间戳。',
          },
        ],
        keyConclusions: [
          { id: 'kc-41', text: '所有同传场次强制绑定组织归属并落盘审计日志。', timestamp: '00:08' },
        ],
        actionItems: [
          { id: 'ai-41', task: '季度例行抽查外部访客入场告知记录', owner: '待确认', deadline: '待确认', sourceTimestamp: '00:08' },
        ],
        risksAndOpenQuestions: [],
        reviewedConfirmed: true,
        publishedLocked: true,
        generatedAt: '2026-11-16 15:45',
      },
      auditLogs: [],
    },
    {
      id: 'room-trash-demo',
      title: '历史演练房（7天回收站示例）',
      sourceLang: '中文',
      targetLang: '越南语',
      status: 'ended',
      lifecycle: 'reviewable',
      orgId: 'org-a',
      listenerCount: 0,
      maxSeats: 30,
      inviteCode: '110482',
      createdByMe: true,
      createdAt: '2026-11-15 09:30',
      startedAt: '2026-11-15 09:30',
      endedAt: '2026-11-15 09:31',
      trashed: true,
      trashedAt: '2026-11-22 09:30',
      retentionDaysLeft: 5,
      routeId: 'route-asean',
      routeLabel: '线路 A · 东盟中越低延迟专线',
      durationSec: 40,
      utterances: [
        {
          id: 'utt-tr-1',
          time: '00:04',
          seconds: 4,
          speakerName: '测试发言人',
          interpreterName: '阮氏明',
          sourceText: '这是一段演练房测试音频记录。',
          translatedText: 'Đây là đoạn ghi âm thử nghiệm phòng diễn tập.',
          translationStatus: 'confirmed',
        },
      ],
      originalSegments: [{ id: 'os-tr', startSec: 0, endSec: 40, label: '00:00 中文 (zh)' }],
      interpretedSegments: [{ id: 'is-tr', startSec: 0, endSec: 40, label: '00:00 越南语 (vi)' }],
      auditLogs: [],
    },
    {
      id: 'room-orgb-1',
      title: '组织 B · 亚太产品规划评审',
      sourceLang: '英语',
      targetLang: '中文',
      status: 'live',
      lifecycle: 'live',
      orgId: 'org-b',
      listenerCount: 6,
      maxSeats: 30,
      inviteCode: '998120',
      createdByMe: true,
      createdAt: '2026-11-24 14:00',
      startedAt: '2026-11-24 14:05',
      routeId: 'route-global',
      routeLabel: '线路 B · 全球通用线路',
      accessPolicy: 'org_only',
      glossaryHints: ['Q4 Roadmap', 'ARR'],
      audienceCaptionsEnabled: true,
      entryOpen: true,
      speakerName: 'Alex Wu',
      leadInterpreterId: 'int-3',
      leadInterpreterName: '陈美玲',
      durationSec: 95,
      utterances: [
        {
          id: 'utt-b1',
          time: '00:12',
          seconds: 12,
          speakerName: 'Alex Wu',
          interpreterName: '陈美玲',
          sourceText: 'For Q4 roadmap, we prioritize enterprise multi-tenant org isolation and low-latency streaming.',
          translatedText: '第四季度路线图将优先保障企业多租户组织隔离与低延迟流式同传。',
          translationStatus: 'confirmed',
        },
      ],
      originalSegments: [{ id: 'os-b', startSec: 0, endSec: 95, label: '00:00 English (en)' }],
      interpretedSegments: [{ id: 'is-b', startSec: 0, endSec: 95, label: '00:00 中文 (zh)' }],
      auditLogs: [],
    },
  ];
}

export function buildArchiveTxt(room: InterpretationRoom): string {
  const lines: string[] = [
    `VAMX Simultaneous Interpretation Archive`,
    `Title: ${room.title}`,
    `Language Pair: ${room.sourceLang} -> ${room.targetLang}`,
    `Route: ${room.routeLabel || '-'}`,
    `Created At: ${room.createdAt}`,
    `Speakers / Interpreter: ${room.speakerName || '-'} / ${room.leadInterpreterName || '-'}`,
    '',
    '=== BILINGUAL TRANSCRIPT ===',
  ];
  (room.utterances || []).forEach((u) => {
    lines.push(`[${u.time}] ${u.speakerName}: ${u.sourceText}`);
    lines.push(`   -> (${u.interpreterName}): ${u.translatedText || '[Missing translation]'}`);
  });
  if (room.minutes) {
    lines.push('', '=== MEETING MINUTES ===', `Summary: ${room.minutes.summary}`);
    lines.push('Topics: ' + room.minutes.topics.join(', '));
    lines.push('Key Conclusions:');
    room.minutes.keyConclusions.forEach((k) => lines.push(`- [${k.timestamp}] ${k.text}`));
    lines.push('Action Items:');
    room.minutes.actionItems.forEach((a) =>
      lines.push(`- ${a.task} | Owner: ${a.owner} | Deadline: ${a.deadline} (${a.sourceTimestamp})`)
    );
  }
  return lines.join('\n');
}

export function buildArchiveSrt(room: InterpretationRoom): string {
  const utts = room.utterances || [];
  const toSrtTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},000`;
  };
  return utts
    .map((u, idx) => {
      const endSec = (utts[idx + 1]?.seconds ?? u.seconds + 8);
      return `${idx + 1}\n${toSrtTime(u.seconds)} --> ${toSrtTime(Math.max(u.seconds + 2, endSec))}\n${u.sourceText}\n${u.translatedText || ''}`;
    })
    .join('\n\n');
}

export function buildArchiveDocxHtml(room: InterpretationRoom): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = (room.utterances || [])
    .map(
      (u) =>
        `<tr><td>${esc(u.time)}</td><td>${esc(u.speakerName)}</td><td>${esc(u.sourceText)}</td><td>${esc(u.translatedText || '[Missing]')}</td></tr>`
    )
    .join('');
  const minutesHtml = room.minutes
    ? `<h2>Minutes Summary</h2><p>${esc(room.minutes.summary)}</p><h3>Action Items</h3><ul>${room.minutes.actionItems
        .map((a) => `<li><b>${esc(a.task)}</b> — ${esc(a.owner)} (${esc(a.deadline)}) [${esc(a.sourceTimestamp)}]</li>`)
        .join('')}</ul>`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(room.title)}</title></head><body><h1>${esc(
    room.title
  )}</h1><p>${esc(room.sourceLang)} → ${esc(room.targetLang)} · ${esc(room.createdAt)}</p>${minutesHtml}<h2>Transcript</h2><table border="1" cellspacing="0" cellpadding="6"><tr><th>Time</th><th>Speaker</th><th>Source</th><th>Translation</th></tr>${rows}</table></body></html>`;
}

export interface InterpCopy {
  brandSub: string;
  navWorkbench: string;
  navAssistant: string;
  navPricing: string;
  navInviteUsers: string;
  subLiveControl: string;
  subArchive: string;
  remainMinutes: (mins: number) => string;
  newRoomBtn: string;
  expandPcBtn: string;
  myRoomsTitle: string;
  roomsCountUnit: (n: number) => string;
  noActiveRooms: string;
  inviteCodeLabel: string;
  seatsRatio: (cur: number, max: number) => string;
  rotateCodeBtn: string;
  copyInviteBtn: string;
  qrBtn: string;
  closeEntryBtn: string;
  reopenEntryBtn: string;
  entryOpenState: string;
  entryLockedState: string;
  entryClosedTag: string;
  roleViewTitle: string;
  roles: Record<InterpRoleView, string>;
  roleHints: Record<InterpRoleView, string>;
  preflightBtn: string;
  captionsDefaultOff: string;
  captionsEnabled: string;
  startBroadcastBtn: string;
  resumeBroadcastBtn: string;
  emergencyPauseBtn: string;
  endMeetingBtn: string;
  cancelRoomBtn: string;
  moreHandover: string;
  morePip: string;
  morePipClose: string;
  moreOnlyTarget: string;
  moreBilingual: string;
  moreAiAssist: string;
  moreSimulateDegrade: string;
  moreRecoverAi: string;
  glossaryPrefix: string;
  liveSrcHeader: (lang: string) => string;
  liveTgtHeader: (lang: string) => string;
  speakerRoleSuffix: string;
  leadInterpSuffix: string;
  emptyStreamHint: string;
  inputPlaceholder: (lang: string) => string;
  trialSamplesBtn: string;
  sendTranslateBtn: string;
  translatingBtn: string;
  statusMap: Record<InterpLifecycleStatus, string>;
  archiveStatuses: Record<InterpArchiveStatus, string>;
  sentenceStatuses: Record<InterpUtterance['translationStatus'], string>;
  ttsBtn: string;
  editBtn: string;
  saveEditBtn: string;
  cancelBtn: string;
  retranslateBtn: string;
  retryBtn: string;
  newCaptionsJump: string;
  degradedBanner: string;
  dictationListening: string;
  dictationUnsupported: string;
  // Preflight
  preflightTitle: string;
  micCheckLabel: string;
  startMicTest: string;
  stopMicTest: string;
  micLevelText: (lvl: number) => string;
  dualToneLabel: string;
  playOrigTone: string;
  playIntTone: string;
  checklistLabel: string;
  checkItem1: string;
  checkItem2: string;
  checkItem3: string;
  // Create Modal
  createTitle: string;
  roomNameLabel: string;
  langPairLabel: string;
  expandAdvanced: string;
  collapseAdvanced: string;
  bindRouteLabel: string;
  routeLockedHint: string;
  accessPolicyLabel: string;
  policies: Record<InterpAccessPolicy, string>;
  glossaryLabel: string;
  glossaryPlaceholder: string;
  autoCaptionsLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  createSubmitBtn: string;
  // Handover Modal
  handoverTitle: string;
  handoverDesc: string;
  confirmHandoverBtn: string;
  standbyOnline: string;
  // QR Modal
  qrTitle: string;
  qrDownloadPng: string;
  qrCopyLink: string;
  qrOpenGuestPreview: string;
  // Org 403
  org403Title: string;
  org403Desc: string;
  // Archive
  archiveTitle: string;
  archiveBreadcrumb: string;
  archiveListTab: (n: number) => string;
  trashTab: (n: number) => string;
  searchArchivePlaceholder: string;
  allStatuses: string;
  allDates: string;
  dateToday: string;
  dateLast7: string;
  dateThisMonth: string;
  sortNewest: string;
  sortOldest: string;
  pendingReviewBanner: string;
  processingBanner: string;
  completedBanner: string;
  publishedBanner: string;
  moveToTrashBtn: string;
  tabPlayback: string;
  tabTranscript: string;
  tabMinutes: string;
  playBtn: string;
  pauseBtn: string;
  readyLabel: string;
  modeOrigOnly: string;
  modeIntOnly: string;
  modeMix: string;
  origVolLabel: string;
  intVolLabel: string;
  dualTrackTitle: string;
  handoverPin: (sec: string, note?: string) => string;
  gapWarningTag: string;
  supplementGapBtn: string;
  markResolvedBtn: string;
  resolvedTag: string;
  filterAllUtterances: string;
  filterAnomalies: string;
  confirmTextOkBtn: string;
  textConfirmedBadge: string;
  generateMinutesBtn: string;
  generatingMinutesBtn: string;
  confirmReviewBtn: string;
  publishArchiveBtn: string;
  publishedLockedBadge: string;
  exportDocx: string;
  exportTxt: string;
  exportSrt: string;
  copyShareLink: string;
  trashBanner: string;
  retentionDays: (days: number) => string;
  restoreArchiveBtn: string;
  permDeleteBtn: string;
  permDeleteTitle: string;
  permDeleteWarn: string;
  permDeleteConfirm: string;
  // Minutes headings
  minSummary: string;
  minTopics: string;
  minAddTopicPlaceholder: string;
  minAddBtn: string;
  minTopicAnalyses: string;
  minConclusions: string;
  minActions: string;
  minActionTask: string;
  minActionOwner: string;
  minActionDeadline: string;
  minActionSource: string;
  minRisks: string;
  // Listener / Guest
  guestBanner: string;
  guestSubtitle: string;
  guestCodePlaceholder: string;
  guestCaptchaLabel: string;
  guestCaptchaPlaceholder: string;
  guestConsentLabel: string;
  guestEnterBtn: string;
  guestScanQrBtn: string;
  guestUploadQrBtn: string;
  guestPlayStates: Record<'idle' | 'playing' | 'reconnecting' | 'autoplay_blocked' | 'paused', string>;
  guestUnlockPlayBtn: string;
  guestCaptionsDisabled: string;
  guestCaptionModes: Record<'bilingual' | 'source' | 'target', string>;
  guestFontSizes: Record<'sm' | 'md' | 'lg', string>;
  guestShowDrafts: string;
  guestFullscreenBtn: string;
  guestExitFullscreenBtn: string;
  // Audit / Pricing / Invite
  auditBtn: string;
  auditTitle: string;
  pricingTitle: string;
  inviteUserTitle: string;
  globalRouteLabel: string;
  // Mobile App Lobby & Sheets
  lobbyTitle: string;
  lobbyLiveTab: (n: number) => string;
  enterRoomBtn: string;
  inviteSheetTitle: string;
  moreSheetTitle: string;
  globalSettingsTitle: string;
  endConfirmTitle: string;
  endConfirmDesc: string;
  endConfirmBtn: string;
  cancelRoomConfirmTitle: string;
  cancelRoomConfirmDesc: string;
  cancelRoomConfirmBtn: string;
  backToLobby: string;
}

export const INTERP_COPY: Record<AppLanguage, InterpCopy> = {
  zh: {
    brandSub: '同传工作台',
    navWorkbench: '同传工作台',
    navAssistant: '音视频助手',
    navPricing: '定价',
    navInviteUsers: '邀请用户',
    subLiveControl: '会中控场',
    subArchive: '会后归档',
    remainMinutes: (m) => `剩余 ${m.toLocaleString()} 分钟`,
    newRoomBtn: '+ 新建同传房间',
    expandPcBtn: 'PC 宽屏工作台',
    myRoomsTitle: '我的同传房间',
    roomsCountUnit: (n) => `${n}间`,
    noActiveRooms: '当前组织暂无进行中的房间',
    inviteCodeLabel: '六位邀请码',
    seatsRatio: (c, m) => `${c}/${m}席`,
    rotateCodeBtn: '轮换邀请码',
    copyInviteBtn: '复制邀请',
    qrBtn: '二维码',
    closeEntryBtn: '锁定入场',
    reopenEntryBtn: '解锁重开入场',
    entryOpenState: '允许新入场',
    entryLockedState: '已锁定新入场',
    entryClosedTag: '入场已锁定（新访客禁止进入）',
    roleViewTitle: '当前端内工作视角',
    roles: {
      host: '主持人',
      speaker: '发言人',
      interpreter: '主译员',
      standby: '替补译员',
      audience: '听众',
    },
    roleHints: {
      host: '完整控场、换译员、字幕授权与归档发布权限',
      speaker: '可语音听写或发送原声试讲语句，查看实时双语流',
      interpreter: '可编辑、重译与校对译文，提交已确认字幕',
      standby: '在线待命，被主持人指派后升级为主译员接管推流',
      audience: '精简端内听众视角（已隐藏左侧控场与邀请码）',
    },
    preflightBtn: '会前联调',
    captionsDefaultOff: '听众字幕：已关闭（默认）',
    captionsEnabled: '听众字幕：已授权开启',
    startBroadcastBtn: '开始同传广播',
    resumeBroadcastBtn: '恢复广播',
    emergencyPauseBtn: '应急暂停',
    endMeetingBtn: '结束会议',
    cancelRoomBtn: '取消房间',
    moreHandover: '暂停并换译员',
    morePip: '浮窗 / 投屏预览',
    morePipClose: '关闭浮窗预览',
    moreOnlyTarget: '仅看译文',
    moreBilingual: '双语对照视图',
    moreAiAssist: 'AI 实时字幕辅助',
    moreSimulateDegrade: '模拟 AI 故障降级 (S07)',
    moreRecoverAi: '恢复 AI 字幕服务',
    glossaryPrefix: '热词表：',
    liveSrcHeader: (l) => `实时原文 · ${l}`,
    liveTgtHeader: (l) => `实时译文 · ${l}`,
    speakerRoleSuffix: '（发言人）',
    leadInterpSuffix: '（主译员）',
    emptyStreamHint: '开始同传广播或触发下方「试讲样例」后，原文和译文会实时显示在这里。',
    inputPlaceholder: (l) => `输入发言人${l}发言内容（如：海防仓的验收改到 2026 年 12 月 4 日下午 3 点。）`,
    trialSamplesBtn: '试讲样例',
    sendTranslateBtn: '发送并实时翻译',
    translatingBtn: '翻译中…',
    statusMap: {
      upcoming: '待开始',
      live: '直播中',
      paused: '已暂停',
      reviewable: '待审核',
      published: '已归档',
    },
    archiveStatuses: {
      reviewable: '待审核',
      processing: '处理中',
      completed: '已完成',
      published: '已归档',
    },
    sentenceStatuses: {
      confirmed: '已确认',
      draft: 'AI 草稿',
      retranslating: '重译中…',
      failed: '译文失败',
    },
    ttsBtn: '试听朗读',
    editBtn: '编辑',
    saveEditBtn: '保存确认',
    cancelBtn: '取消',
    retranslateBtn: '重译',
    retryBtn: '重试翻译',
    newCaptionsJump: '有新字幕，点击跳至最新 ↓',
    degradedBanner: 'AI 字幕辅助已降级（S07）：原声与译音双轨语音广播不受影响，可点重译或由译员手动补录。',
    dictationListening: '正在语音听写，停顿后自动成句翻译…',
    dictationUnsupported: '当前浏览器不支持 Web Speech API，已启用模拟声学听写输入。',
    preflightTitle: '开播前三端自检（Preflight）',
    micCheckLabel: '1. 本机麦克风电平检测',
    startMicTest: '开启麦检',
    stopMicTest: '停止检测',
    micLevelText: (lvl) => `实时电平 ${lvl}%`,
    dualToneLabel: '2. 双声道试音链路',
    playOrigTone: '原声测试音',
    playIntTone: '译音测试音',
    checklistLabel: '3. 连通性核验清单',
    checkItem1: '发言人 / 主译员在线与麦检正常',
    checkItem2: '原声与译音测试音监听清晰无回声',
    checkItem3: 'RTC / TURN 低延迟通道连接就绪',
    createTitle: '新建同声传译房间',
    roomNameLabel: '房间名称',
    langPairLabel: '同传语言方向',
    expandAdvanced: '展开高级选项',
    collapseAdvanced: '收起高级选项',
    bindRouteLabel: '绑定翻译线路（建房锁定）',
    routeLockedHint: '继承账号默认翻译线路，建房后永久锁定不随全局变更',
    accessPolicyLabel: '入场访问策略',
    policies: {
      public: '公开邀请（免下载 App · 扫码 / 六位码）',
      org_only: '仅组织成员',
      allowlist: '实名名单核验',
      restricted: '受控访问（需主持人逐一放行）',
    },
    glossaryLabel: '识别热词提示（人名、品牌与专业词，逗号分隔）',
    glossaryPlaceholder: '海防仓, 林岚, 双语清单, 25箱',
    autoCaptionsLabel: '开播即开启听众实时字幕（默认关闭）',
    notesLabel: '房间备注（可选）',
    notesPlaceholder: '会前联调完成再开播；听众默认关闭实时字幕。',
    createSubmitBtn: '创建房间并进入联调',
    handoverTitle: '应急暂停并更换主译员',
    handoverDesc: '确认指派后将立即暂停当前广播、撤回原译员推流权，并在录音轨精确打入交接时间戳。',
    confirmHandoverBtn: '确认切换并接管',
    standbyOnline: '在线待命',
    qrTitle: '扫码加入同声传译房间',
    qrDownloadPng: '下载二维码 (.png)',
    qrCopyLink: '复制直连网址',
    qrOpenGuestPreview: '新窗口模拟访客入场',
    org403Title: '403 · 跨组织越权访问已拒绝',
    org403Desc: '根据多租户组织隔离策略，当前组织无权查看或操作其他组织的房间、双轨录音与归档数据。',
    archiveTitle: '会后归档与纪要',
    archiveBreadcrumb: '会议结束 → 查看记录 → 回放录音 → 检查原文与译文 → 生成纪要 → 确认并归档',
    archiveListTab: (n) => `归档列表 (${n})`,
    trashTab: (n) => `回收站 (${n})`,
    searchArchivePlaceholder: '按会议名称或关键词搜索…',
    allStatuses: '全部状态',
    allDates: '全部日期',
    dateToday: '今天',
    dateLast7: '近 7 天',
    dateThisMonth: '本月',
    sortNewest: '时间：最新优先',
    sortOldest: '时间：最早优先',
    pendingReviewBanner: '请核对译文并确认纪要后再归档',
    processingBanner: '正在校对译文或提炼纪要中',
    completedBanner: '已核对完毕，可点击「确认发布归档」锁定',
    publishedBanner: '正文与纪要已锁定，支持导出或分享',
    moveToTrashBtn: '移入回收站',
    tabPlayback: '录音回放',
    tabTranscript: '原文与译文',
    tabMinutes: '会议纪要',
    playBtn: '播放录音',
    pauseBtn: '暂停回放',
    readyLabel: '准备就绪',
    modeOrigOnly: '仅原声',
    modeIntOnly: '仅译音',
    modeMix: '双轨混听',
    origVolLabel: '原声音量',
    intVolLabel: '译音音量',
    dualTrackTitle: '双轨分段定位（点击分段直接跳转）',
    handoverPin: (sec, note) => `交接点 ${sec} · ${note || '译员交接'}`,
    gapWarningTag: '缺段待处理',
    supplementGapBtn: '人工补录',
    markResolvedBtn: '标记已解决',
    resolvedTag: '缺段已解决',
    filterAllUtterances: '全部段落',
    filterAnomalies: '仅异常/待确认段落',
    confirmTextOkBtn: '确认文本无误',
    textConfirmedBadge: '文本已核对',
    generateMinutesBtn: '生成会议纪要',
    generatingMinutesBtn: 'AI 提炼中…',
    confirmReviewBtn: '确认审阅无误',
    publishArchiveBtn: '确认发布归档',
    publishedLockedBadge: '已归档锁定',
    exportDocx: '导出 DOCX',
    exportTxt: '导出 TXT',
    exportSrt: '导出 SRT',
    copyShareLink: '复制分享链接',
    trashBanner: '已删记录保留 7 天，到期自动清理；永久删除不可恢复',
    retentionDays: (d) => `剩余保留 ${d} 天`,
    restoreArchiveBtn: '恢复到归档',
    permDeleteBtn: '永久删除',
    permDeleteTitle: '彻底永久删除确认',
    permDeleteWarn: '该操作不可逆，将同步物理清除双轨录音、转写文稿、会议纪要，并令所有外部分享链接立即失效。',
    permDeleteConfirm: '确认彻底删除',
    minSummary: '会议摘要',
    minTopics: '核心议题标签',
    minAddTopicPlaceholder: '新增议题标签…',
    minAddBtn: '添加',
    minTopicAnalyses: '分议题深度拆解',
    minConclusions: '关键结论（点击时间戳跳转）',
    minActions: '待办事项表',
    minActionTask: '任务内容',
    minActionOwner: '负责人',
    minActionDeadline: '截止时间',
    minActionSource: '出处',
    minRisks: '待确认风险清单',
    guestBanner: 'VAMX 同声传译 · 外部访客直连收听端',
    guestSubtitle: '免下载浏览器即开即听，音频流与实时字幕由主持人控场台实时同步。',
    guestCodePlaceholder: '输入 6 位房间邀请码（如 664335）',
    guestCaptchaLabel: '人机验证（输入 VAMX）',
    guestCaptchaPlaceholder: 'VAMX',
    guestConsentLabel: '已知晓本场次可能被录制、双语转写与归档保存',
    guestEnterBtn: '验证并进入收听席位',
    guestScanQrBtn: '摄像头扫码',
    guestUploadQrBtn: '上传二维码图',
    guestPlayStates: {
      idle: '待播放',
      playing: '播放中 · 低延迟接收',
      reconnecting: '弱网重连中…',
      autoplay_blocked: '浏览器自动播放受阻，请点击下方解锁音频',
      paused: '用户主动暂停（切声道不会误恢复）',
    },
    guestUnlockPlayBtn: '点击解锁并收听同传',
    guestCaptionsDisabled: '主持人暂未授权听众实时字幕（双语广播音频不受影响，正常播放中）',
    guestCaptionModes: { bilingual: '双语对照', source: '仅原文', target: '仅译文' },
    guestFontSizes: { sm: '小', md: '中', lg: '大' },
    guestShowDrafts: '显示 AI 草稿句',
    guestFullscreenBtn: '大字全屏',
    guestExitFullscreenBtn: '退出全屏',
    auditBtn: '审计日志',
    auditTitle: '同传室操作审计日志',
    pricingTitle: 'VAMX 企业同传分钟数与版本定价',
    inviteUserTitle: '邀请组织成员与译员加入工作台',
    globalRouteLabel: '账号默认翻译线路',
    lobbyTitle: '同传室',
    lobbyLiveTab: (n) => `进行中 (${n})`,
    enterRoomBtn: '进入控场',
    inviteSheetTitle: '入场码与席位管理',
    moreSheetTitle: '会场控制与视角切换',
    globalSettingsTitle: '组织与线路设置',
    endConfirmTitle: '确认结束本场同传会议？',
    endConfirmDesc: '结束后将立即停止收音与广播，自动锁定新访客入口，并转入「会后归档」等待校对与生成纪要。',
    endConfirmBtn: '确认结束并归档',
    cancelRoomConfirmTitle: '确认取消该待开始房间？',
    cancelRoomConfirmDesc: '该房间尚未开播且无发言记录，取消后将直接移除，不会产生无效的会后归档记录。',
    cancelRoomConfirmBtn: '确认取消房间',
    backToLobby: '返回列表',
  },
  en: {
    brandSub: 'Interpretation Workbench',
    navWorkbench: 'Interpretation',
    navAssistant: 'Media Assistant',
    navPricing: 'Pricing',
    navInviteUsers: 'Invite Users',
    subLiveControl: 'Live Control',
    subArchive: 'Archive & Minutes',
    remainMinutes: (m) => `${m.toLocaleString()} min left`,
    newRoomBtn: '+ New Room',
    expandPcBtn: 'PC Workbench',
    myRoomsTitle: 'My Rooms',
    roomsCountUnit: (n) => `${n} active`,
    noActiveRooms: 'No active rooms in this organization',
    inviteCodeLabel: '6-Digit Code',
    seatsRatio: (c, m) => `${c}/${m} seats`,
    rotateCodeBtn: 'Rotate Code',
    copyInviteBtn: 'Copy Invite',
    qrBtn: 'QR Code',
    closeEntryBtn: 'Lock Entry',
    reopenEntryBtn: 'Unlock Entry',
    entryOpenState: 'Entry Open',
    entryLockedState: 'Entry Locked',
    entryClosedTag: 'Entry locked (new guests blocked)',
    roleViewTitle: 'In-App Role Perspective',
    roles: {
      host: 'Host',
      speaker: 'Speaker',
      interpreter: 'Lead Interpreter',
      standby: 'Standby Interpreter',
      audience: 'Audience',
    },
    roleHints: {
      host: 'Full control over broadcast, handover, captions & archive publishing',
      speaker: 'Stream source dictation & trial phrases; view live bilingual feed',
      interpreter: 'Edit, retranslate & confirm subtitles',
      standby: 'Standing by to assume Lead Interpreter stream on host handover',
      audience: 'Compact in-app listener card (invite/entry controls hidden)',
    },
    preflightBtn: 'Preflight Check',
    captionsDefaultOff: 'Audience Captions: Off (Default)',
    captionsEnabled: 'Audience Captions: Authorized',
    startBroadcastBtn: 'Start Broadcast',
    resumeBroadcastBtn: 'Resume Broadcast',
    emergencyPauseBtn: 'Emergency Pause',
    endMeetingBtn: 'End Meeting',
    cancelRoomBtn: 'Cancel Room',
    moreHandover: 'Pause & Handover Interpreter',
    morePip: 'Floating Subtitle Window',
    morePipClose: 'Close Floating Window',
    moreOnlyTarget: 'Target Only View',
    moreBilingual: 'Bilingual Split View',
    moreAiAssist: 'AI Live Caption Assist',
    moreSimulateDegrade: 'Simulate AI Degrade (S07)',
    moreRecoverAi: 'Restore AI Subtitles',
    glossaryPrefix: 'Glossary: ',
    liveSrcHeader: (l) => `Live Source · ${l}`,
    liveTgtHeader: (l) => `Live Translation · ${l}`,
    speakerRoleSuffix: ' (Speaker)',
    leadInterpSuffix: ' (Lead)',
    emptyStreamHint: 'Start broadcast or pick a trial sample below to see real-time bilingual interpretation.',
    inputPlaceholder: (l) => `Enter ${l} speaker utterance (e.g. Haiphong inspection moves to Dec 4, 2026 at 3 PM.)`,
    trialSamplesBtn: 'Samples',
    sendTranslateBtn: 'Send & Translate',
    translatingBtn: 'Translating…',
    statusMap: {
      upcoming: 'Upcoming',
      live: 'Live',
      paused: 'Paused',
      reviewable: 'Pending Review',
      published: 'Archived',
    },
    archiveStatuses: {
      reviewable: 'Pending Review',
      processing: 'Processing',
      completed: 'Completed',
      published: 'Archived',
    },
    sentenceStatuses: {
      confirmed: 'Confirmed',
      draft: 'AI Draft',
      retranslating: 'Retranslating…',
      failed: 'Failed',
    },
    ttsBtn: 'Speak',
    editBtn: 'Edit',
    saveEditBtn: 'Save & Confirm',
    cancelBtn: 'Cancel',
    retranslateBtn: 'Retranslate',
    retryBtn: 'Retry',
    newCaptionsJump: 'New captions below · Jump to latest ↓',
    degradedBanner: 'AI caption assist degraded (S07): Human dual-track audio broadcast continues uninterrupted.',
    dictationListening: 'Listening via microphone, pauses auto-send for translation…',
    dictationUnsupported: 'Web Speech API unavailable; using simulated acoustic phrase capture.',
    preflightTitle: 'Pre-Broadcast 3-Way Check',
    micCheckLabel: '1. Local Microphone Level',
    startMicTest: 'Test Mic',
    stopMicTest: 'Stop Mic',
    micLevelText: (lvl) => `Input level ${lvl}%`,
    dualToneLabel: '2. Dual-Channel Audio Test',
    playOrigTone: 'Original Tone',
    playIntTone: 'Interpreted Tone',
    checklistLabel: '3. Readiness Checklist',
    checkItem1: 'Speaker & Lead Interpreter online and mic tested',
    checkItem2: 'Both original and interpreted test tones clear',
    checkItem3: 'RTC / TURN low-latency route connected',
    createTitle: 'New Interpretation Room',
    roomNameLabel: 'Room Name',
    langPairLabel: 'Language Direction',
    expandAdvanced: 'Show Advanced Options',
    collapseAdvanced: 'Hide Advanced Options',
    bindRouteLabel: 'Locked Translation Route',
    routeLockedHint: 'Inherits account default route and locks permanently after creation',
    accessPolicyLabel: 'Admission Policy',
    policies: {
      public: 'Public Invite (No App · QR / 6-Digit Code)',
      org_only: 'Org Members Only',
      allowlist: 'Verified Allowlist',
      restricted: 'Host Approval Required',
    },
    glossaryLabel: 'Glossary Hotwords (comma separated)',
    glossaryPlaceholder: 'Haiphong Warehouse, Lin Lan, Bilingual List, 25 cartons',
    autoCaptionsLabel: 'Enable audience captions on start (Off by default)',
    notesLabel: 'Session Notes (Optional)',
    notesPlaceholder: 'Verify audio preflight before going live; captions off by default.',
    createSubmitBtn: 'Create Room & Preflight',
    handoverTitle: 'Emergency Pause & Handover Interpreter',
    handoverDesc: 'Pauses broadcast immediately, revokes previous lead stream rights, and stamps handover timecode on the audio track.',
    confirmHandoverBtn: 'Confirm Handover',
    standbyOnline: 'Standby Online',
    qrTitle: 'Scan to Join Interpretation Room',
    qrDownloadPng: 'Download QR (.png)',
    qrCopyLink: 'Copy Direct URL',
    qrOpenGuestPreview: 'Open Guest View',
    org403Title: '403 · Cross-Organization Access Denied',
    org403Desc: 'Multi-tenant isolation blocks access to another organization’s rooms, dual-track audio, and archive data.',
    archiveTitle: 'Post-Meeting Archive & Minutes',
    archiveBreadcrumb: 'Session Ended → Review → Dual-Track Playback → Proofread → Generate Minutes → Publish',
    archiveListTab: (n) => `Archives (${n})`,
    trashTab: (n) => `Trash (${n})`,
    searchArchivePlaceholder: 'Search room title or transcript…',
    allStatuses: 'All Statuses',
    allDates: 'All Dates',
    dateToday: 'Today',
    dateLast7: 'Last 7 Days',
    dateThisMonth: 'This Month',
    sortNewest: 'Newest First',
    sortOldest: 'Oldest First',
    pendingReviewBanner: 'Proofread transcript and confirm minutes before archiving',
    processingBanner: 'Processing transcript & minutes draft',
    completedBanner: 'Review verified — ready to publish and lock',
    publishedBanner: 'Locked & archived — export or share available',
    moveToTrashBtn: 'Move to Trash',
    tabPlayback: 'Audio Playback',
    tabTranscript: 'Transcript',
    tabMinutes: 'Minutes',
    playBtn: 'Play Audio',
    pauseBtn: 'Pause',
    readyLabel: 'Ready',
    modeOrigOnly: 'Source Only',
    modeIntOnly: 'Interpreted Only',
    modeMix: 'Dual Mix',
    origVolLabel: 'Source Vol',
    intVolLabel: 'Interp Vol',
    dualTrackTitle: 'Dual-Track Timeline (Click segment to seek)',
    handoverPin: (sec, note) => `Handover @ ${sec} · ${note || 'Interpreter swap'}`,
    gapWarningTag: 'Gap Detected',
    supplementGapBtn: 'Fill Manually',
    markResolvedBtn: 'Mark Resolved',
    resolvedTag: 'Gap Resolved',
    filterAllUtterances: 'All Segments',
    filterAnomalies: 'Missing / Draft Only',
    confirmTextOkBtn: 'Confirm Transcript',
    textConfirmedBadge: 'Transcript Verified',
    generateMinutesBtn: 'Generate Minutes',
    generatingMinutesBtn: 'Generating…',
    confirmReviewBtn: 'Confirm Review',
    publishArchiveBtn: 'Publish Archive',
    publishedLockedBadge: 'Published & Locked',
    exportDocx: 'Export DOCX',
    exportTxt: 'Export TXT',
    exportSrt: 'Export SRT',
    copyShareLink: 'Copy Share Link',
    trashBanner: 'Deleted items stay for 7 days before auto-cleanup; permanent deletion cannot be undone',
    retentionDays: (d) => `${d} days left`,
    restoreArchiveBtn: 'Restore',
    permDeleteBtn: 'Delete Forever',
    permDeleteTitle: 'Confirm Permanent Deletion',
    permDeleteWarn: 'This cannot be undone. Dual-track audio, transcript, minutes, and share links will be permanently destroyed.',
    permDeleteConfirm: 'Permanently Delete',
    minSummary: 'Executive Summary',
    minTopics: 'Topic Tags',
    minAddTopicPlaceholder: 'Add topic tag…',
    minAddBtn: 'Add',
    minTopicAnalyses: 'Topic Breakdown',
    minConclusions: 'Key Conclusions (Click time to seek)',
    minActions: 'Action Items',
    minActionTask: 'Task',
    minActionOwner: 'Owner',
    minActionDeadline: 'Deadline',
    minActionSource: 'Source',
    minRisks: 'Risks & Open Questions',
    guestBanner: 'VAMX Interpretation · Guest Browser Listener',
    guestSubtitle: 'Zero-install browser listening synced live with the host workbench.',
    guestCodePlaceholder: 'Enter 6-digit invite code (e.g. 664335)',
    guestCaptchaLabel: 'Verification (Enter VAMX)',
    guestCaptchaPlaceholder: 'VAMX',
    guestConsentLabel: 'I acknowledge this session may be recorded, transcribed, and archived.',
    guestEnterBtn: 'Verify & Join Room',
    guestScanQrBtn: 'Camera Scan',
    guestUploadQrBtn: 'Upload QR',
    guestPlayStates: {
      idle: 'Ready to Play',
      playing: 'Playing · Low-Latency Stream',
      reconnecting: 'Weak Network Reconnecting…',
      autoplay_blocked: 'Autoplay blocked by browser — tap below to unlock audio',
      paused: 'Paused by user (channel switch preserves pause)',
    },
    guestUnlockPlayBtn: 'Unlock & Listen Live',
    guestCaptionsDisabled: 'Host has not authorized audience captions yet (live audio continues uninterrupted).',
    guestCaptionModes: { bilingual: 'Bilingual', source: 'Source', target: 'Target' },
    guestFontSizes: { sm: 'S', md: 'M', lg: 'L' },
    guestShowDrafts: 'Show AI Drafts',
    guestFullscreenBtn: 'Fullscreen Captions',
    guestExitFullscreenBtn: 'Exit Fullscreen',
    auditBtn: 'Audit Log',
    auditTitle: 'Interpretation Audit Trail',
    pricingTitle: 'VAMX Enterprise Interpretation Plans',
    inviteUserTitle: 'Invite Team Members & Interpreters',
    globalRouteLabel: 'Default Account Route',
    lobbyTitle: 'Interpretation Rooms',
    lobbyLiveTab: (n) => `Active (${n})`,
    enterRoomBtn: 'Enter Room',
    inviteSheetTitle: 'Invite Code & Admission',
    moreSheetTitle: 'Room Controls & Perspective',
    globalSettingsTitle: 'Organization & Route Settings',
    endConfirmTitle: 'End this interpretation meeting?',
    endConfirmDesc: 'Broadcast and dictation will stop immediately, new guest entry will lock, and the session moves to Archive.',
    endConfirmBtn: 'End & Archive',
    cancelRoomConfirmTitle: 'Cancel this upcoming room?',
    cancelRoomConfirmDesc: 'This room has not started broadcasting yet. Canceling removes it cleanly without creating an empty archive.',
    cancelRoomConfirmBtn: 'Confirm Cancel',
    backToLobby: 'Rooms',
  },
  vi: {
    brandSub: 'Bàn Phiên Dịch',
    navWorkbench: 'Phiên dịch',
    navAssistant: 'Trợ lý Media',
    navPricing: 'Bảng giá',
    navInviteUsers: 'Mời người dùng',
    subLiveControl: 'Điều hành trực tiếp',
    subArchive: 'Lưu trữ & Biên bản',
    remainMinutes: (m) => `Còn ${m.toLocaleString()} phút`,
    newRoomBtn: '+ Tạo phòng mới',
    expandPcBtn: 'Giao diện PC',
    myRoomsTitle: 'Phòng của tôi',
    roomsCountUnit: (n) => `${n} phòng`,
    noActiveRooms: 'Chưa có phòng hoạt động trong tổ chức',
    inviteCodeLabel: 'Mã mời 6 số',
    seatsRatio: (c, m) => `${c}/${m} chỗ`,
    rotateCodeBtn: 'Đổi mã mời',
    copyInviteBtn: 'Sao chép mời',
    qrBtn: 'Mã QR',
    closeEntryBtn: 'Khóa cửa vào',
    reopenEntryBtn: 'Mở khóa cửa vào',
    entryOpenState: 'Đang mở cửa vào',
    entryLockedState: 'Đã khóa cửa vào',
    entryClosedTag: 'Đã khóa cửa vào (khách mới bị chặn)',
    roleViewTitle: 'Vai trò trong ứng dụng',
    roles: {
      host: 'Chủ tọa',
      speaker: 'Diễn giả',
      interpreter: 'Phiên dịch chính',
      standby: 'Phiên dịch dự bị',
      audience: 'Thính giả',
    },
    roleHints: {
      host: 'Toàn quyền điều hành, đổi phiên dịch viên, cấp phụ đề & xuất bản biên bản',
      speaker: 'Đọc/nhập câu gốc và xem dòng phụ đề song ngữ thời gian thực',
      interpreter: 'Chỉnh sửa, dịch lại và xác nhận bản dịch',
      standby: 'Trực sẵn sàng; nâng lên Phiên dịch chính khi được chỉ định bàn giao',
      audience: 'Thẻ nghe tinh gọn (tự động ẩn mục mã mời & khóa cửa bên trái)',
    },
    preflightBtn: 'Kiểm tra trước',
    captionsDefaultOff: 'Phụ đề thính giả: Đang tắt (Mặc định)',
    captionsEnabled: 'Phụ đề thính giả: Đã bật',
    startBroadcastBtn: 'Bắt đầu phát sóng',
    resumeBroadcastBtn: 'Tiếp tục phát',
    emergencyPauseBtn: 'Tạm dừng khẩn',
    endMeetingBtn: 'Kết thúc họp',
    cancelRoomBtn: 'Hủy phòng',
    moreHandover: 'Tạm dừng & Đổi phiên dịch',
    morePip: 'Cửa sổ phụ đề nổi',
    morePipClose: 'Đóng cửa sổ nổi',
    moreOnlyTarget: 'Chỉ xem bản dịch',
    moreBilingual: 'Xem song ngữ',
    moreAiAssist: 'Trợ lý phụ đề AI',
    moreSimulateDegrade: 'Giả lập lỗi AI (S07)',
    moreRecoverAi: 'Khôi phục phụ đề AI',
    glossaryPrefix: 'Thuật ngữ: ',
    liveSrcHeader: (l) => `Bản gốc trực tiếp · ${l}`,
    liveTgtHeader: (l) => `Bản dịch trực tiếp · ${l}`,
    speakerRoleSuffix: ' (Diễn giả)',
    leadInterpSuffix: ' (Chính)',
    emptyStreamHint: 'Bắt đầu phát sóng hoặc chọn mẫu thử bên dưới để hiển thị song ngữ thời gian thực.',
    inputPlaceholder: (l) => `Nhập nội dung ${l} của diễn giả (VD: Lịch nghiệm thu kho Hải Phòng...)`,
    trialSamplesBtn: 'Mẫu nói thử',
    sendTranslateBtn: 'Gửi & Dịch ngay',
    translatingBtn: 'Đang dịch…',
    statusMap: {
      upcoming: 'Chờ bắt đầu',
      live: 'Đang phát',
      paused: 'Tạm dừng',
      reviewable: 'Chờ duyệt',
      published: 'Đã lưu trữ',
    },
    archiveStatuses: {
      reviewable: 'Chờ duyệt',
      processing: 'Đang xử lý',
      completed: 'Hoàn tất',
      published: 'Đã lưu trữ',
    },
    sentenceStatuses: {
      confirmed: 'Đã xác nhận',
      draft: 'Bản nháp AI',
      retranslating: 'Đang dịch lại…',
      failed: 'Lỗi dịch',
    },
    ttsBtn: 'Nghe đọc',
    editBtn: 'Sửa',
    saveEditBtn: 'Lưu xác nhận',
    cancelBtn: 'Hủy',
    retranslateBtn: 'Dịch lại',
    retryBtn: 'Thử lại',
    newCaptionsJump: 'Có phụ đề mới · Nhấn xuống cuối ↓',
    degradedBanner: 'Trợ lý AI tạm suy giảm (S07): Luồng âm thanh song ngữ trực tiếp vẫn hoạt động bình thường.',
    dictationListening: 'Đang nghe giọng nói, tự động dịch khi ngừng câu…',
    dictationUnsupported: 'Trình duyệt không hỗ trợ Web Speech API; đã chuyển sang nhập mẫu mô phỏng.',
    preflightTitle: 'Kiểm tra kỹ thuật trước giờ phát',
    micCheckLabel: '1. Kiểm tra micro thiết bị',
    startMicTest: 'Bật thử mic',
    stopMicTest: 'Dừng thử mic',
    micLevelText: (lvl) => `Mức âm thanh ${lvl}%`,
    dualToneLabel: '2. Kiểm tra 2 kênh âm thanh',
    playOrigTone: 'Âm thử gốc',
    playIntTone: 'Âm thử dịch',
    checklistLabel: '3. Danh mục kiểm tra kết nối',
    checkItem1: 'Diễn giả & Phiên dịch chính đã trực tuyến và thử mic',
    checkItem2: 'Nghe rõ âm thanh gốc và âm thanh dịch không vọng',
    checkItem3: 'Đường truyền RTC / TURN độ trễ thấp sẵn sàng',
    createTitle: 'Tạo phòng phiên dịch mới',
    roomNameLabel: 'Tên phòng',
    langPairLabel: 'Cặp ngôn ngữ phiên dịch',
    expandAdvanced: 'Mở tùy chọn nâng cao',
    collapseAdvanced: 'Thu gọn tùy chọn nâng cao',
    bindRouteLabel: 'Tuyến dịch cố định',
    routeLockedHint: 'Kế thừa tuyến mặc định tài khoản và khóa cố định sau khi tạo',
    accessPolicyLabel: 'Chính sách vào phòng',
    policies: {
      public: 'Mời công khai (Không cần App · QR / Mã 6 số)',
      org_only: 'Chỉ thành viên tổ chức',
      allowlist: 'Danh sách xác thực',
      restricted: 'Kiểm soát chặt',
    },
    glossaryLabel: 'Từ khóa thuật ngữ (cách nhau bằng dấu phẩy)',
    glossaryPlaceholder: 'Kho Hải Phòng, Lin Lan, Danh sách song ngữ, 25 thùng',
    autoCaptionsLabel: 'Bật phụ đề thính giả khi phát (Mặc định tắt)',
    notesLabel: 'Ghi chú phòng (tùy chọn)',
    notesPlaceholder: 'Kiểm tra kỹ thuật trước khi phát; phụ đề mặc định tắt.',
    createSubmitBtn: 'Tạo phòng & Kiểm tra',
    handoverTitle: 'Tạm dừng khẩn & Đổi phiên dịch viên',
    handoverDesc: 'Tạm dừng ngay lập tức, thu hồi quyền phát của người cũ và ghi dấu thời điểm bàn giao vào bản ghi âm.',
    confirmHandoverBtn: 'Xác nhận bàn giao',
    standbyOnline: 'Sẵn sàng trực tuyến',
    qrTitle: 'Quét mã để tham gia phòng phiên dịch',
    qrDownloadPng: 'Tải ảnh QR (.png)',
    qrCopyLink: 'Sao chép liên kết',
    qrOpenGuestPreview: 'Mở trang thính giả',
    org403Title: '403 · Từ chối truy cập khác tổ chức',
    org403Desc: 'Cách ly đa tổ chức không cho phép truy cập phòng, âm thanh hoặc dữ liệu lưu trữ của tổ chức khác.',
    archiveTitle: 'Lưu trữ & Biên bản sau họp',
    archiveBreadcrumb: 'Kết thúc → Xem lại → Nghe 2 kênh → Rà soát → Tạo biên bản → Xuất bản',
    archiveListTab: (n) => `Danh sách (${n})`,
    trashTab: (n) => `Thùng rác (${n})`,
    searchArchivePlaceholder: 'Tìm tên cuộc họp hoặc từ khóa…',
    allStatuses: 'Mọi trạng thái',
    allDates: 'Mọi ngày',
    dateToday: 'Hôm nay',
    dateLast7: '7 ngày qua',
    dateThisMonth: 'Tháng này',
    sortNewest: 'Mới nhất trước',
    sortOldest: 'Cũ nhất trước',
    pendingReviewBanner: 'Rà soát bản dịch & xác nhận biên bản trước khi lưu',
    processingBanner: 'Đang xử lý bản dịch và tóm tắt biên bản',
    completedBanner: 'Đã rà soát xong — sẵn sàng xuất bản khóa',
    publishedBanner: 'Đã khóa lưu trữ — hỗ trợ xuất tệp & chia sẻ',
    moveToTrashBtn: 'Chuyển vào thùng rác',
    tabPlayback: 'Phát lại 2 kênh',
    tabTranscript: 'Bản gốc & Bản dịch',
    tabMinutes: 'Biên bản họp',
    playBtn: 'Phát ghi âm',
    pauseBtn: 'Tạm dừng',
    readyLabel: 'Sẵn sàng',
    modeOrigOnly: 'Chỉ âm gốc',
    modeIntOnly: 'Chỉ âm dịch',
    modeMix: 'Trộn 2 kênh',
    origVolLabel: 'Âm lượng gốc',
    intVolLabel: 'Âm lượng dịch',
    dualTrackTitle: 'Dòng thời gian 2 kênh (Nhấn đoạn để tua)',
    handoverPin: (sec, note) => `Bàn giao tại ${sec} · ${note || 'Đổi phiên dịch'}`,
    gapWarningTag: 'Thiếu đoạn',
    supplementGapBtn: 'Bổ sung thủ công',
    markResolvedBtn: 'Đánh dấu đã xử lý',
    resolvedTag: 'Đã xử lý',
    filterAllUtterances: 'Tất cả đoạn',
    filterAnomalies: 'Chỉ đoạn lỗi / nháp',
    confirmTextOkBtn: 'Xác nhận văn bản',
    textConfirmedBadge: 'Đã xác nhận',
    generateMinutesBtn: 'Tạo biên bản họp',
    generatingMinutesBtn: 'Đang tổng hợp…',
    confirmReviewBtn: 'Xác nhận đã rà soát',
    publishArchiveBtn: 'Xuất bản lưu trữ',
    publishedLockedBadge: 'Đã khóa xuất bản',
    exportDocx: 'Xuất DOCX',
    exportTxt: 'Xuất TXT',
    exportSrt: 'Xuất SRT',
    copyShareLink: 'Sao chép liên kết',
    trashBanner: 'Bản ghi lưu 7 ngày trước khi tự động xóa vĩnh viễn',
    retentionDays: (d) => `Còn giữ ${d} ngày`,
    restoreArchiveBtn: 'Khôi phục',
    permDeleteBtn: 'Xóa vĩnh viễn',
    permDeleteTitle: 'Xác nhận xóa vĩnh viễn',
    permDeleteWarn: 'Thao tác không thể hoàn tác. Âm thanh 2 kênh, bản chép, biên bản và liên kết chia sẻ sẽ bị hủy vĩnh viễn.',
    permDeleteConfirm: 'Xóa vĩnh viễn',
    minSummary: 'Tóm tắt cuộc họp',
    minTopics: 'Thẻ chủ đề chính',
    minAddTopicPlaceholder: 'Thêm thẻ chủ đề…',
    minAddBtn: 'Thêm',
    minTopicAnalyses: 'Phân tích theo chủ đề',
    minConclusions: 'Kết luận chính (Nhấn giờ để tua)',
    minActions: 'Bảng đầu việc cần làm',
    minActionTask: 'Nhiệm vụ',
    minActionOwner: 'Phụ trách',
    minActionDeadline: 'Hạn chót',
    minActionSource: 'Nguồn',
    minRisks: 'Rủi ro & Câu hỏi mở',
    guestBanner: 'VAMX Phiên Dịch · Cổng Nghe Cho Khách',
    guestSubtitle: 'Nghe trực tiếp trên trình duyệt không cần cài App, đồng bộ tức thì với chủ tọa.',
    guestCodePlaceholder: 'Nhập mã mời 6 chữ số (VD: 664335)',
    guestCaptchaLabel: 'Xác minh (Nhập VAMX)',
    guestCaptchaPlaceholder: 'VAMX',
    guestConsentLabel: 'Tôi đã biết phiên họp này có thể được ghi âm, chép lời và lưu trữ.',
    guestEnterBtn: 'Xác minh & Vào phòng',
    guestScanQrBtn: 'Quét camera',
    guestUploadQrBtn: 'Tải ảnh QR',
    guestPlayStates: {
      idle: 'Sẵn sàng phát',
      playing: 'Đang phát · Độ trễ thấp',
      reconnecting: 'Mạng yếu, đang kết nối lại…',
      autoplay_blocked: 'Trình duyệt chặn tự phát — nhấn bên dưới để mở âm thanh',
      paused: 'Người dùng đã tạm dừng (đổi kênh giữ nguyên tạm dừng)',
    },
    guestUnlockPlayBtn: 'Mở khóa & Nghe trực tiếp',
    guestCaptionsDisabled: 'Chủ tọa chưa bật phụ đề cho thính giả (âm thanh vẫn đang phát bình thường).',
    guestCaptionModes: { bilingual: 'Song ngữ', source: 'Chỉ gốc', target: 'Chỉ dịch' },
    guestFontSizes: { sm: 'Nhỏ', md: 'Vừa', lg: 'Lớn' },
    guestShowDrafts: 'Hiện câu nháp AI',
    guestFullscreenBtn: 'Phóng to phụ đề',
    guestExitFullscreenBtn: 'Thoát toàn màn hình',
    auditBtn: 'Nhật ký',
    auditTitle: 'Nhật ký kiểm toán phòng dịch',
    pricingTitle: 'Bảng giá & Gói phút phiên dịch VAMX',
    inviteUserTitle: 'Mời thành viên & phiên dịch viên',
    globalRouteLabel: 'Tuyến mặc định tài khoản',
    lobbyTitle: 'Phòng phiên dịch',
    lobbyLiveTab: (n) => `Đang mở (${n})`,
    enterRoomBtn: 'Vào phòng',
    inviteSheetTitle: 'Mã mời & Kiểm soát vào phòng',
    moreSheetTitle: 'Điều khiển & Vai trò',
    globalSettingsTitle: 'Tổ chức & Tuyến dịch mặc định',
    endConfirmTitle: 'Kết thúc phiên họp phiên dịch?',
    endConfirmDesc: 'Phát sóng và thu âm sẽ dừng ngay, khóa cửa khách mới và chuyển sang lưu trữ sau họp.',
    endConfirmBtn: 'Kết thúc & Lưu trữ',
    cancelRoomConfirmTitle: 'Hủy phòng chờ bắt đầu này?',
    cancelRoomConfirmDesc: 'Phòng chưa phát sóng. Hủy sẽ xóa phòng trực tiếp mà không tạo bản lưu trữ trống.',
    cancelRoomConfirmBtn: 'Xác nhận hủy phòng',
    backToLobby: 'Danh sách',
  },
};
