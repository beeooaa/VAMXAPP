import React, { useState } from 'react';
import { Laptop, PauseCircle, Wifi, X } from 'lucide-react';
import { AppLanguage, InterpretationRoom, StandbyInterpreter } from '../../types/vamx';
import { DEFAULT_STANDBY_INTERPRETERS, INTERP_COPY } from '../../data/interpretationData';

interface InterpreterHandoverModalProps {
  room: InterpretationRoom | null;
  language: AppLanguage;
  onClose: () => void;
  onConfirmHandover: (nextLead: StandbyInterpreter) => void;
}

export const InterpreterHandoverModal: React.FC<InterpreterHandoverModalProps> = ({
  room,
  language,
  onClose,
  onConfirmHandover,
}) => {
  const c = INTERP_COPY[language];
  const candidates = (room?.standbyInterpreters ?? DEFAULT_STANDBY_INTERPRETERS).filter(
    (item) => item.id !== room?.leadInterpreterId
  );
  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.id ?? '');

  if (!room) return null;

  const chosen = candidates.find((x) => x.id === selectedId) || candidates[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-white rounded-2xl border border-[#E5EAF3] shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-4 h-4 text-[#D97706]" />
            <h3 className="text-sm font-display font-bold text-[#111827]">{c.handoverTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={c.cancelBtn}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">{c.handoverDesc}</p>

          <div className="space-y-2">
            {candidates.map((cand) => {
              const active = chosen?.id === cand.id;
              return (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => setSelectedId(cand.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'border-[#1668FF] bg-[#F2F6FF]'
                      : 'border-[#E5ECF5] bg-white hover:bg-[#FAFBFD]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#111827]">{cand.name}</span>
                    <span className="text-[11px] font-medium text-[#16A34A]">{c.standbyOnline}</span>
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">{cand.langs}</div>
                  <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] font-mono tabular-nums mt-2">
                    <span className="inline-flex items-center gap-1">
                      <Laptop className="w-3 h-3" />
                      {cand.device}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      {cand.network}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[#EEF2F7] bg-[#FAFBFD] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border border-[#DCE3EE] bg-white text-xs font-medium text-[#475569] cursor-pointer"
          >
            {c.cancelBtn}
          </button>
          <button
            type="button"
            disabled={!chosen}
            onClick={() => {
              if (!chosen) return;
              onConfirmHandover(chosen);
              onClose();
            }}
            className="h-9 px-4 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
          >
            {c.confirmHandoverBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
