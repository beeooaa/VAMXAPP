import { test } from 'node:test';
import assert from 'node:assert/strict';
import { archiveWorkflow, areAllUtterancesConfirmed } from './archiveWorkflow';
import { createRichInitialRooms, getArchiveStatus } from './interpretationData';

const fixture = () => {
  const room = structuredClone(createRichInitialRooms().find(r => r.id === 'room-arch-5')!);
  room.transcriptReviewed = true;
  return room;
};
test('two reviews are required before archive', () => {
  const room = fixture();
  assert.equal(archiveWorkflow(room).canArchive, true);
  assert.equal(getArchiveStatus(room), 'completed');
  room.transcriptReviewed = false;
  assert.equal(archiveWorkflow(room).canArchive, false);
  assert.equal(getArchiveStatus(room), 'reviewable');
});
test('failure placeholder cannot pass even when marked confirmed', () => {
  const room = fixture();
  room.utterances![0].translatedText = 'AI任务失败';
  assert.equal(archiveWorkflow(room).textReady, false);
  assert.equal(archiveWorkflow(room).canArchive, false);
});
test('empty records, unresolved gaps, stale minutes and empty tasks block archive', () => {
  for (const mutate of [
    (r: ReturnType<typeof fixture>) => { r.utterances = []; },
    (r: ReturnType<typeof fixture>) => { r.minutes!.summary = ''; },
    (r: ReturnType<typeof fixture>) => { r.minutes!.stale = true; },
    (r: ReturnType<typeof fixture>) => { r.minutes!.actionItems[0].task = ''; },
    (r: ReturnType<typeof fixture>) => { r.interpretedSegments![0].isGap = true; },
  ]) { const room = fixture(); mutate(room); assert.equal(archiveWorkflow(room).canArchive, false); }
});
test('unknown owner and deadline stay pending and allow combined review and archive', () => {
  const room = fixture();
  room.minutes!.reviewedConfirmed = false;
  room.minutes!.actionItems[0].owner = '待确认';
  room.minutes!.actionItems[0].deadline = '';
  assert.equal(archiveWorkflow(room).pendingActions, 1);
  assert.equal(archiveWorkflow(room).canReview, true);
  assert.equal(room.minutes!.actionItems[0].owner, '待确认');
});
test('archived records remain locked and do not become publishable again', () => {
  const room = fixture(); room.minutes!.publishedLocked = true;
  assert.equal(archiveWorkflow(room).locked, true);
  assert.equal(archiveWorkflow(room).canArchive, false);
  assert.equal(getArchiveStatus(room), 'published');
});
test('ongoing generation is processing; minutes existence alone is not', () => {
  const room = fixture(); room.minutes!.reviewedConfirmed = false;
  assert.equal(getArchiveStatus(room), 'reviewable');
  assert.equal(getArchiveStatus(room, true), 'processing');
});
test('a room without transcript has an explicit manual review path', () => {
  const room = fixture();
  room.utterances = [];
  room.originalSegments = [];
  room.interpretedSegments = [];
  room.minutes!.reviewedConfirmed = false;
  assert.equal(archiveWorkflow(room).textReviewed, false);
  assert.equal(archiveWorkflow(room).canReview, false);
  room.noTranscriptConfirmed = true;
  assert.equal(archiveWorkflow(room).noTranscript, true);
  assert.equal(archiveWorkflow(room).textReviewed, true);
  assert.equal(archiveWorkflow(room).canReview, true);
  room.minutes!.summary = '';
  assert.equal(archiveWorkflow(room).canReview, false);
  room.minutes!.summary = '人工记录的会议摘要';
  room.originalSegments = [{ id: 'missing', startSec: 0, endSec: 1, label: '原声缺段', isGap: true }];
  assert.equal(archiveWorkflow(room).canReview, false);
});

test('empty meeting and blank minutes draft have no review or playback content', () => {
  const room = fixture();
  room.utterances = [];
  room.minutes = undefined;
  room.noTranscriptConfirmed = true;
  assert.equal(archiveWorkflow(room).empty, true);
  assert.equal(archiveWorkflow(room).textReviewed, false);
  assert.equal(getArchiveStatus(room), 'empty');
  room.minutes = { version: 1, summary: '', topics: [], topicAnalyses: [], keyConclusions: [], actionItems: [], risksAndOpenQuestions: [], reviewedConfirmed: false, publishedLocked: false, generatedAt: '' };
  assert.equal(getArchiveStatus(room), 'empty');
  room.minutes.summary = '人工记录的会议摘要';
  assert.equal(archiveWorkflow(room).empty, false);
});

test('audio gap does not prevent confirming manually corrected text', () => {
  const room = fixture();
  room.minutes!.reviewedConfirmed = false;
  room.interpretedSegments = [{ id: 'gap', startSec: 32, endSec: 44, label: '译音缺段', isGap: true }];
  assert.equal(archiveWorkflow(room).textReady, true);
  assert.equal(archiveWorkflow(room).audioGaps, 1);
  assert.equal(archiveWorkflow(room).canReview, false);
  room.interpretedSegments[0].resolved = true;
  assert.equal(archiveWorkflow(room).canReview, true);
});

test('manually corrected sample utterances can be confirmed while audio gap remains', () => {
  const room = structuredClone(createRichInitialRooms().find(r => r.id === 'room-arch-1')!);
  room.utterances![1].translationStatus = 'confirmed';
  room.utterances![2].translatedText = 'Bảng theo dõi nhiệt độ và độ ẩm cần được lưu ít nhất 90 ngày.';
  room.utterances![2].translationStatus = 'confirmed';
  room.utterances![2].gapResolved = true;
  assert.equal(archiveWorkflow(room).textBlockers, 0);
  assert.equal(archiveWorkflow(room).textReady, true);
  assert.equal(archiveWorkflow(room).audioGaps, 1);
});

test('the last saved translation can finish text confirmation in one action', () => {
  const room = structuredClone(createRichInitialRooms().find(r => r.id === 'room-arch-1')!);
  const utterances = room.utterances!;
  utterances[1].translationStatus = 'confirmed';
  utterances[2].translatedText = 'Bảng theo dõi cần được lưu trong 90 ngày.';
  utterances[2].translationStatus = 'confirmed';
  utterances[2].gapResolved = true;
  assert.equal(areAllUtterancesConfirmed(utterances), true);
  assert.equal(archiveWorkflow({ ...room, transcriptReviewed: true }).textReviewed, true);
  utterances[1].translationStatus = 'draft';
  assert.equal(areAllUtterancesConfirmed(utterances), false);
});
