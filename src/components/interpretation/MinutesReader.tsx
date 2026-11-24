import type { InterpMinutesData } from '../../types/vamx';
import { isMissingMinutesField } from '../../data/archiveWorkflow';
import { ChevronDown, Play } from 'lucide-react';

export function MinutesReader({ minutes, onJump }: { minutes: InterpMinutesData; onJump: (time: string) => void }) {
  const heading = 'text-sm font-display font-bold text-[#111827]';
  const section = 'pt-4 border-t border-[#EEF2F7] space-y-3';
  const disclosure = 'flex items-center justify-between list-none cursor-pointer text-sm font-display font-bold text-[#111827] [&::-webkit-details-marker]:hidden';
  return <div className="space-y-4 text-[#334155]">
    <section className="space-y-2"><h4 className={heading}>会议摘要</h4><p className="text-[15px] leading-7 whitespace-pre-wrap break-words text-[#334155]">{minutes.summary || '暂无摘要'}</p></section>
    {!!minutes.topics.length && <div className="flex flex-wrap gap-1.5">{minutes.topics.map((topic, i) => <span key={i} className="rounded-md border border-[#E2E8F2] bg-[#F4F7FC] px-2 py-1 text-xs text-[#475569]">{topic}</span>)}</div>}
    <section className={section}><h4 className={heading}>待办事项{minutes.actionItems.length ? `（${minutes.actionItems.length}）` : ''}</h4>
      {!minutes.actionItems.length && <p className="text-xs text-[#94A3B8]">暂无明确待办事项</p>}
      <div className="space-y-2">{minutes.actionItems.map((a, i) => <article key={a.id} className="rounded-xl border border-[#E5EAF3] bg-[#FAFBFD] px-3.5 py-3 space-y-2.5">
        <div className="flex items-start gap-2"><span className="mt-0.5 text-xs font-semibold text-[#1668FF]">{String(i + 1).padStart(2, '0')}</span><p className="text-sm font-medium text-[#111827] break-words leading-6">{a.task || '待补充任务内容'}</p></div>
        <dl className="grid grid-cols-2 gap-3 pl-6 text-xs"><div><dt className="text-[#64748B] mb-1">负责人</dt><dd className="break-words text-[#334155]">{isMissingMinutesField(a.owner) ? <span className="text-[#D97706]">待跟进</span> : a.owner}</dd></div><div><dt className="text-[#64748B] mb-1">截止时间</dt><dd className="break-words text-[#334155]">{isMissingMinutesField(a.deadline) ? <span className="text-[#D97706]">待跟进</span> : a.deadline}</dd></div></dl>
        <button type="button" onClick={() => onJump(a.sourceTimestamp)} className="ml-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#1668FF] hover:underline"><Play className="h-3 w-3" />{a.sourceTimestamp} 原文定位</button>
      </article>)}</div>
    </section>
    {!!minutes.topicAnalyses.length && <details className={section}><summary className={disclosure}>分议题分析<ChevronDown className="h-4 w-4 text-[#94A3B8]" /></summary><div className="space-y-2.5">{minutes.topicAnalyses.map((a,i) => <div key={i} className="rounded-xl border border-[#EEF2F7] bg-[#FAFBFD] p-3 text-xs"><p className="font-semibold text-[#111827]">{a.topic}</p><p className="mt-1.5 leading-6 text-[#475569] whitespace-pre-wrap">{a.analysis}</p></div>)}</div></details>}
    {!!minutes.keyConclusions.length && <details className={section}><summary className={disclosure}>关键结论<ChevronDown className="h-4 w-4 text-[#94A3B8]" /></summary><div className="space-y-2.5">{minutes.keyConclusions.map(a => <p key={a.id} className="text-xs leading-6 text-[#475569]"><button type="button" onClick={() => onJump(a.timestamp)} className="font-mono text-[#1668FF] mr-2 hover:underline">[{a.timestamp}]</button>{a.text}</p>)}</div></details>}
    {!!minutes.risksAndOpenQuestions.length && <details className={section}><summary className={disclosure}>风险与待确认事项<ChevronDown className="h-4 w-4 text-[#94A3B8]" /></summary><ul className="list-disc pl-5 space-y-2 text-xs leading-6 text-[#475569]">{minutes.risksAndOpenQuestions.map((r,i) => <li key={i}>{r}</li>)}</ul></details>}
  </div>;
}
