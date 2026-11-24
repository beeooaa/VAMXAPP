import type { InterpretationRoom, InterpUtterance } from '../types/vamx';

export const isFailureText = (text: string) => /^(AI\s*任务失败|翻译失败|translation failed|upstream.*error|error|failed)$/i.test(text.trim());
export const validText = (text: string) => Boolean(text.trim()) && !isFailureText(text);
export const isMissingMinutesField = (value: string) => !value.trim() || /^(待确认|TBD|Chờ xác nhận)$/i.test(value.trim());
export const isBlockedUtterance = (u: InterpUtterance) =>
  !validText(u.sourceText) || !validText(u.translatedText) || u.translationStatus === 'failed' ||
  u.translationStatus === 'retranslating' || Boolean(u.isGap && !u.gapResolved);

export const areAllUtterancesConfirmed = (utterances: InterpUtterance[]) =>
  utterances.length > 0 && utterances.every(u => u.translationStatus === 'confirmed' && !isBlockedUtterance(u));

export const isEmptyArchiveRoom = (room: InterpretationRoom) => {
  if ((room.utterances || []).length > 0) return false;
  const minutes = room.minutes;
  if (!minutes) return true;
  return !(
    validText(minutes.summary) || minutes.topics.some(validText) ||
    minutes.topicAnalyses.some(item => validText(item.analysis)) ||
    minutes.keyConclusions.some(item => validText(item.text)) ||
    minutes.actionItems.some(item => validText(item.task)) ||
    minutes.risksAndOpenQuestions.some(validText)
  );
};

export function archiveWorkflow(room: InterpretationRoom) {
  const locked = room.lifecycle === 'published' || room.archiveStatus === 'published' || Boolean(room.minutes?.publishedLocked);
  const utterances = room.utterances || [];
  const textBlockers = utterances.filter(isBlockedUtterance).length;
  const audioGaps = [...(room.originalSegments || []), ...(room.interpretedSegments || [])]
    .filter(s => s.isGap && !s.resolved).length;
  const blockers = textBlockers + audioGaps;
  const noTranscript = utterances.length === 0;
  const empty = isEmptyArchiveRoom(room);
  const textReady = !empty && (noTranscript ? room.noTranscriptConfirmed === true : textBlockers === 0);
  const textReviewed = textReady && (noTranscript ? room.noTranscriptConfirmed === true : room.transcriptReviewed === true);
  const minutes = room.minutes;
  const incompleteActions = minutes?.actionItems.filter(a => isMissingMinutesField(a.task)).length || 0;
  const pendingActions = minutes?.actionItems.filter(a => isMissingMinutesField(a.owner) || isMissingMinutesField(a.deadline)).length || 0;
  const minutesReady = Boolean(minutes && validText(minutes.summary) && !minutes.stale && incompleteActions === 0);
  const canReview = textReviewed && minutesReady && audioGaps === 0 && !locked;
  const canArchive = canReview && Boolean(minutes?.reviewedConfirmed);
  return { locked, empty, noTranscript, textBlockers, audioGaps, blockers, textReady, textReviewed, minutesReady, incompleteActions, pendingActions, canReview, canArchive };
}
