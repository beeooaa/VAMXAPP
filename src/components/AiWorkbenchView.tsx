import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  FolderOpen,
  History,
  MessageSquarePlus,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { AiChatMessage, AiCitation, AppLanguage, FolderItem, RecordingItem } from '../types/vamx';
import { getFolderDisplayName, UI_STRINGS } from '../data/uiStrings';

interface AiWorkbenchViewProps {
  messages: AiChatMessage[];
  recordings: RecordingItem[];
  folders: FolderItem[];
  language?: AppLanguage;
  onSendMessage: (msg: AiChatMessage, reply: AiChatMessage) => void;
  onResetChat: () => void;
  onJumpToCitation: (recordingId: string, seconds: number) => void;
}

export const AiWorkbenchView: React.FC<AiWorkbenchViewProps> = ({
  messages,
  recordings,
  folders,
  language = 'zh',
  onSendMessage,
  onResetChat,
  onJumpToCitation,
}) => {
  const ai = UI_STRINGS[language].ai;
  const [input, setInput] = useState('');
  const [scopeId, setScopeId] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [pendingTurn, setPendingTurn] = useState<{
    userMsg: AiChatMessage;
    scopedCount: number;
  } | null>(null);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [streamedChars, setStreamedChars] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleSubmit = (promptText?: string) => {
    const query = (promptText ?? input).trim();
    if (!query || pendingTurn) return;
    setInput('');

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const now = new Date().toTimeString().slice(0, 5);
    const userMsg: AiChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: now,
    };

    const scopedRecs =
      scopeId === 'all'
        ? recordings
        : recordings.filter((r) => r.folderId === scopeId);

    clearTimers();
    setPendingTurn({ userMsg, scopedCount: scopedRecs.length });
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);

    timeoutRef.current = window.setTimeout(() => {
      const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
      const matched = scopedRecs.filter((rec) => {
        const hay = `${rec.title} ${rec.notes} ${rec.summary?.overview || ''} ${rec.transcript
          .map((t) => t.text)
          .join(' ')}`.toLowerCase();
        return keywords.some((k) => hay.includes(k));
      });

      const targetRecs = matched.length > 0 ? matched.slice(0, 3) : scopedRecs.slice(0, 2);

      const citations: AiCitation[] = targetRecs
        .filter((r) => r.transcript.length > 0)
        .map((r, i) => {
          const seg = r.transcript[0];
          return {
            index: i + 1,
            recordingId: r.id,
            recordingTitle: r.title,
            timeRange: seg.time,
            seconds: seg.seconds,
            snippet: seg.text.slice(0, 68) + (seg.text.length > 68 ? '…' : ''),
          };
        });

      const summaryLines = targetRecs.map((r, idx) => {
        const point = r.summary?.keyPoints[0] || r.transcript[0]?.text.slice(0, 60) || r.title;
        return `${idx + 1}. **${r.title.slice(0, 28)}**：${point}`;
      });

      const replyContent =
        summaryLines.length > 0
          ? ai.replyHeader(scopedRecs.length, summaryLines.join('\n'))
          : ai.replyNoMatch;

      const replyId = `a-${Date.now() + 1}`;
      const replyMsg: AiChatMessage = {
        id: replyId,
        role: 'assistant',
        content: replyContent,
        citations,
        createdAt: now,
      };

      setPendingTurn(null);
      onSendMessage(userMsg, replyMsg);

      if (!reduced) {
        setStreamingMsgId(replyId);
        setStreamedChars(0);
        let chars = 0;
        const step = Math.max(3, Math.ceil(replyContent.length / 24));
        intervalRef.current = window.setInterval(() => {
          chars += step;
          if (chars >= replyContent.length) {
            setStreamingMsgId(null);
            if (intervalRef.current !== null) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 40);
          } else {
            setStreamedChars(chars);
          }
        }, 18);
      }

      window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }, reduced ? 120 : 660);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <h1 className="text-lg font-display font-bold text-[#111113] truncate">
            {ai.title}
          </h1>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            {ai.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            aria-label={ai.historyAria}
            className="w-11 h-11 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              clearTimers();
              setPendingTurn(null);
              setStreamingMsgId(null);
              onResetChat();
            }}
            aria-label={ai.newChatAria}
            className="w-11 h-11 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-5 space-y-6">
        {messages.length === 0 && !pendingTurn ? (
          <div className="py-12 max-w-md mx-auto text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-[#ECEFFE] text-[#4B5AE4] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-semibold text-[#111827]">
                {ai.emptyTitle}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {ai.emptyDesc}
              </p>
            </div>
            <div className="space-y-2 text-left">
              {ai.prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSubmit(p)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F6F8FC] hover:bg-[#EEF3FF] border border-[#E6ECF5] text-xs font-medium text-[#111827] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="truncate">{p}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#1668FF] shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isStreamingThis = streamingMsgId === msg.id;
              const displayedContent = isStreamingThis
                ? msg.content.slice(0, streamedChars)
                : msg.content;
              return (
                <div key={msg.id} className="space-y-3">
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] px-4 py-2.5 rounded-2xl bg-[#1668FF] text-white text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-vamx-rise">
                      <div className="text-[14.5px] leading-[1.7] text-[#111827] whitespace-pre-line">
                        {displayedContent}
                        {isStreamingThis && (
                          <span
                            aria-hidden="true"
                            className="inline-block w-[2px] h-4 bg-[#1668FF] ml-0.5 align-middle animate-pulse"
                          />
                        )}
                      </div>

                      {!isStreamingThis && msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 space-y-2 animate-vamx-rise">
                          <div className="text-[11px] font-medium text-zinc-400">
                            {ai.citationsLabel}
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.citations.map((cit, cIdx) => (
                              <button
                                key={`${msg.id}-${cit.index}`}
                                type="button"
                                onClick={() => onJumpToCitation(cit.recordingId, cit.seconds)}
                                style={{ animationDelay: `${cIdx * 65}ms` }}
                                className="animate-vamx-rise text-left p-3 rounded-xl bg-[#F6F8FC] hover:bg-[#EEF3FF] border border-[#E5ECF6] transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#111827]">
                                  <span className="truncate">
                                    <span className="font-mono text-[#1668FF] mr-1.5">
                                      {cit.index}.
                                    </span>
                                    {cit.recordingTitle}
                                  </span>
                                  <span className="font-mono text-[11px] text-[#1668FF] shrink-0 tabular-nums">
                                    {cit.timeRange}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                                  {cit.snippet}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {pendingTurn && (
              <div className="space-y-3 animate-vamx-rise">
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl bg-[#1668FF] text-white text-sm leading-relaxed">
                    {pendingTurn.userMsg.content}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#F6F8FC] border border-[#E5ECF6] text-xs text-[#64748B]">
                  <Sparkles className="w-3.5 h-3.5 text-[#1668FF] shrink-0" />
                  <span>{ai.searchingStatus(pendingTurn.scopedCount)}</span>
                  <span className="inline-flex items-center gap-1 ml-0.5" aria-hidden="true">
                    <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-1" />
                    <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-2" />
                    <span className="w-1 h-1 rounded-full bg-[#1668FF] vamx-dot-3" />
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom Composer */}
      <div className="p-4 border-t border-[#EAEFF7] bg-white shrink-0 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-xs text-[#1668FF]">
            <FolderOpen className="w-3.5 h-3.5" />
            <select
              aria-label={ai.scopeAria}
              value={scopeId}
              onChange={(e) => setScopeId(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id === 'all' ? ai.scopeAll : ai.scopeFolder(getFolderDisplayName(f, language))}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ai.inputPlaceholder}
            className="flex-1 h-11 px-4 rounded-xl bg-[#F6F8FC] border border-[#E5EAF3] text-sm text-[#111827] placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1668FF]"
          />
          <button
            type="submit"
            aria-label={ai.sendAria}
            className="w-11 h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[11px] text-center text-zinc-400">
          {ai.disclaimer}
        </p>
      </div>

      {/* History Bottom Sheet */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setShowHistory(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl border-t border-zinc-200 px-5 pt-3 pb-6 space-y-2.5 shadow-2xl"
          >
            <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-sm font-semibold text-[#111113]">{ai.historyTitle}</span>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                aria-label={ai.closeHistoryAria}
                className="w-11 h-11 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {ai.historyItems.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setShowHistory(false);
                  handleSubmit(h.title);
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <div className="text-xs font-medium text-[#111113] truncate">{h.title}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{h.time}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
