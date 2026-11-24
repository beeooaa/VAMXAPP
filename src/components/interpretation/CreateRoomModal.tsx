import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Lock, X } from 'lucide-react';
import {
  AppLanguage,
  InterpAccessPolicy,
  InterpretationRoom,
} from '../../types/vamx';
import {
  createAuditEntry,
  DEFAULT_STANDBY_INTERPRETERS,
  getRouteLabel,
  INTERP_COPY,
  INTERP_LANG_PAIRS,
  INTERP_ROUTES,
} from '../../data/interpretationData';

interface CreateRoomModalProps {
  open: boolean;
  language: AppLanguage;
  activeOrgId: 'org-a' | 'org-b';
  actorName: string;
  defaultRouteId: 'route-asean' | 'route-global';
  existingRoomCount?: number;
  onClose: () => void;
  onCreate: (room: InterpretationRoom) => void;
}

const getDefaultRoomTitle = (language: AppLanguage, count: number) => {
  const base =
    language === 'en'
      ? 'Cross-Border Supply Chain Briefing'
      : language === 'vi'
      ? 'Đào tạo Chuỗi cung ứng Xuyên biên giới'
      : '中越跨境供应链培训（演练）';
  return count > 0 ? `${base} #${count + 1}` : base;
};

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  open,
  language,
  activeOrgId,
  actorName,
  defaultRouteId,
  existingRoomCount = 0,
  onClose,
  onCreate,
}) => {
  const c = INTERP_COPY[language];
  const [title, setTitle] = useState(() => getDefaultRoomTitle(language, existingRoomCount));
  const [pairId, setPairId] = useState(INTERP_LANG_PAIRS[0].id);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [routeId, setRouteId] = useState<'route-asean' | 'route-global'>(defaultRouteId);
  const [accessPolicy, setAccessPolicy] = useState<InterpAccessPolicy>('public');
  const [glossaryRaw, setGlossaryRaw] = useState('海防仓, 林岚, 双语清单, 25箱');
  const [autoCaptions, setAutoCaptions] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(getDefaultRoomTitle(language, existingRoomCount));
    setRouteId(defaultRouteId);
    setShowAdvanced(false);
    setAutoCaptions(false);
  }, [open, language, defaultRouteId, existingRoomCount]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pair = INTERP_LANG_PAIRS.find((p) => p.id === pairId) || INTERP_LANG_PAIRS[0];
    const cleanTitle = title.trim() || getDefaultRoomTitle(language, existingRoomCount);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const glossaryHints = glossaryRaw
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const lockedRoute = getRouteLabel(routeId, language);

    const room: InterpretationRoom = {
      id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title: cleanTitle,
      sourceLang: pair.sourceLang,
      targetLang: pair.targetLang,
      status: 'upcoming',
      lifecycle: 'upcoming',
      orgId: activeOrgId,
      listenerCount: 0,
      maxSeats: 30,
      inviteCode: code,
      createdByMe: true,
      createdAt,
      routeId,
      routeLabel: lockedRoute,
      accessPolicy,
      glossaryHints,
      audienceCaptionsEnabled: autoCaptions,
      entryOpen: true,
      removedGuests: [],
      notes: notes.trim(),
      speakerName: '陈远',
      leadInterpreterId: DEFAULT_STANDBY_INTERPRETERS[0].id,
      leadInterpreterName: DEFAULT_STANDBY_INTERPRETERS[0].name,
      standbyInterpreters: DEFAULT_STANDBY_INTERPRETERS,
      aiAssistEnabled: true,
      preflight: {
        micChecked: false,
        dualToneChecked: false,
        rtcChecked: false,
      },
      durationSec: 0,
      utterances: [],
      originalSegments: [],
      interpretedSegments: [],
      auditLogs: [
        createAuditEntry(
          actorName,
          '创建房间',
          `语向 ${pair.sourceLang}→${pair.targetLang} · 锁定线路 ${lockedRoute} · 邀请码 ${code}`
        ),
      ],
    };

    onCreate(room);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] bg-white rounded-2xl border border-[#E5EAF3] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-[#EEF2F7] flex items-center justify-between shrink-0">
          <h3 className="text-[17px] font-display font-bold text-[#111827]">{c.createTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={c.cancelBtn}
            className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto thin-scrollbar">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#475569]">{c.roomNameLabel}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-[#DCE3EE] text-sm text-[#111827] focus:outline-none focus:border-[#1668FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#475569]">{c.langPairLabel}</label>
            <select
              value={pairId}
              onChange={(e) => setPairId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#DCE3EE] text-sm text-[#111827] bg-white focus:outline-none focus:border-[#1668FF]"
            >
              {INTERP_LANG_PAIRS.map((p) => (
                <option key={p.id} value={p.id}>
                  {language === 'en' ? p.enLabel : language === 'vi' ? p.viLabel : p.zhLabel}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#1668FF] cursor-pointer pt-1"
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showAdvanced ? c.collapseAdvanced : c.expandAdvanced}</span>
          </button>

          {showAdvanced && (
            <div className="pt-2 border-t border-[#F1F5F9] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-medium text-[#475569]">
                    <Lock className="w-3 h-3 text-[#64748B]" />
                    <span>{c.bindRouteLabel}</span>
                  </label>
                  <select
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value as 'route-asean' | 'route-global')}
                    className="w-full h-10 px-3 rounded-xl border border-[#DCE3EE] text-xs text-[#111827] bg-white focus:outline-none focus:border-[#1668FF]"
                  >
                    {INTERP_ROUTES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {language === 'en' ? r.enName : language === 'vi' ? r.viName : r.zhName}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#94A3B8]">{c.routeLockedHint}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#475569]">{c.accessPolicyLabel}</label>
                  <select
                    value={accessPolicy}
                    onChange={(e) => setAccessPolicy(e.target.value as InterpAccessPolicy)}
                    className="w-full h-10 px-3 rounded-xl border border-[#DCE3EE] text-xs text-[#111827] bg-white focus:outline-none focus:border-[#1668FF]"
                  >
                    {(['public', 'org_only', 'allowlist', 'restricted'] as InterpAccessPolicy[]).map(
                      (pol) => (
                        <option key={pol} value={pol}>
                          {c.policies[pol]}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#475569]">{c.glossaryLabel}</label>
                <input
                  type="text"
                  value={glossaryRaw}
                  onChange={(e) => setGlossaryRaw(e.target.value)}
                  placeholder={c.glossaryPlaceholder}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#DCE3EE] text-xs text-[#111827] focus:outline-none focus:border-[#1668FF]"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs text-[#334155] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoCaptions}
                  onChange={(e) => setAutoCaptions(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#1668FF] focus:ring-[#1668FF]"
                />
                <span>{c.autoCaptionsLabel}</span>
              </label>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#475569]">{c.notesLabel}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={c.notesPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EE] text-xs text-[#111827] focus:outline-none focus:border-[#1668FF] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#EEF2F7] flex items-center justify-end gap-2.5 bg-[#FAFBFD] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-[#DCE3EE] bg-white hover:bg-zinc-50 text-xs font-medium text-[#475569] cursor-pointer"
          >
            {c.cancelBtn}
          </button>
          <button
            type="submit"
            className="h-10 px-5 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            {c.createSubmitBtn}
          </button>
        </div>
      </form>
    </div>
  );
};
