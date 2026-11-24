import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Headphones,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { AppLanguage, InterpretationRoom } from '../types/vamx';
import { getLanguageOptionLabel, UI_STRINGS } from '../data/uiStrings';

interface InterpretationRoomViewProps {
  rooms: InterpretationRoom[];
  language?: AppLanguage;
  onCreateRoom: (room: InterpretationRoom) => void;
  onUpdateRoom: (room: InterpretationRoom) => void;
  onEnterLiveTranslate: () => void;
  onNotify: (msg: string) => void;
}

export const InterpretationRoomView: React.FC<InterpretationRoomViewProps> = ({
  rooms,
  language = 'zh',
  onCreateRoom,
  onUpdateRoom,
  onEnterLiveTranslate,
  onNotify,
}) => {
  const rm = UI_STRINGS[language].rooms;
  const cm = UI_STRINGS[language].common;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'paused' | 'ended'>('all');
  const [showTrash, setShowTrash] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSrcLang, setNewSrcLang] = useState('中文');
  const [newTgtLang, setNewTgtLang] = useState('英语');

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<InterpretationRoom | null>(null);

  const activeRooms = useMemo(() => rooms.filter((r) => !r.trashed), [rooms]);
  const liveCount = activeRooms.filter((r) => r.status === 'live').length;
  const totalListeners = activeRooms.reduce((acc, r) => acc + r.listenerCount, 0);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (showTrash ? !r.trashed : r.trashed) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.inviteCode.toLowerCase().includes(q) ||
          r.sourceLang.includes(q) ||
          r.targetLang.includes(q)
        );
      }
      return true;
    });
  }, [rooms, showTrash, statusFilter, search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || rm.untitledRoom;
    const room: InterpretationRoom = {
      id: `room-${Date.now()}`,
      title,
      sourceLang: newSrcLang,
      targetLang: newTgtLang,
      status: 'live',
      listenerCount: 1,
      inviteCode: `VX-${Math.floor(1000 + Math.random() * 9000)}`,
      createdByMe: true,
      createdAt: cm.justNow,
    };
    onCreateRoom(room);
    setNewTitle('');
    setShowCreateModal(false);
    setSelectedRoom(room);
    onNotify(rm.toastCreated(title));
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const found = rooms.find((r) => r.inviteCode === code && !r.trashed);
    if (found) {
      setSelectedRoom(found);
      setShowJoinModal(false);
      setJoinCode('');
      onNotify(rm.toastJoined(found.title));
    } else {
      const joined: InterpretationRoom = {
        id: `room-${Date.now()}`,
        title: `${rm.invitedRoomPrefix} ${code}`,
        sourceLang: '英语',
        targetLang: '中文',
        status: 'live',
        listenerCount: 8,
        inviteCode: code,
        createdByMe: false,
        createdAt: cm.justNow,
      };
      onCreateRoom(joined);
      setSelectedRoom(joined);
      setShowJoinModal(false);
      setJoinCode('');
      onNotify(rm.toastJoinedCode(code));
    }
  };

  const statusLabel = (s: InterpretationRoom['status']) => {
    switch (s) {
      case 'live':
        return rm.statusLive;
      case 'upcoming':
        return rm.statusUpcoming;
      case 'paused':
        return rm.statusPaused;
      case 'ended':
        return rm.statusEnded;
    }
  };

  return (
    <div className="space-y-5 pb-4">
      {/* Header + Actions */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-[#111113]">
            {rm.title}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {rm.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setShowJoinModal(true)}
            className="h-11 px-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-medium text-[#111113] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Headphones className="w-4 h-4" />
            <span>{rm.joinBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="h-11 px-3 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-[0_4px_12px_-4px_rgba(22,104,255,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>{rm.createBtn}</span>
          </button>
        </div>
      </div>

      {/* Clean 3-Metric Hairline Strip */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 grid grid-cols-3 divide-x divide-zinc-100 py-4">
        <div className="text-center px-2">
          <div className="text-[11px] text-zinc-400">{rm.statTotal}</div>
          <div className="font-mono text-xl font-bold text-[#111113] tabular-nums mt-0.5">
            {activeRooms.length}
          </div>
        </div>
        <div className="text-center px-2">
          <div className="text-[11px] text-zinc-400">{rm.statLive}</div>
          <div className="font-mono text-xl font-bold text-[#111113] tabular-nums mt-0.5">
            {liveCount}
          </div>
        </div>
        <div className="text-center px-2">
          <div className="text-[11px] text-zinc-400">{rm.statListeners}</div>
          <div className="font-mono text-xl font-bold text-[#111113] tabular-nums mt-0.5">
            {totalListeners}
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={rm.searchPlaceholder}
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-white border border-zinc-200/80 text-xs text-[#111113] placeholder:text-zinc-400 focus:outline-none focus:border-[#111113]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowTrash((t) => !t)}
            aria-label={rm.trashToggleAria}
            className={`min-w-[44px] h-10 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              showTrash
                ? 'bg-[#1668FF] text-white border-[#1668FF]'
                : 'bg-white text-zinc-600 border-[#E5EAF3] hover:bg-zinc-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setLayoutMode((m) => (m === 'list' ? 'grid' : 'list'))}
            aria-label={rm.densityToggleAria}
            className="min-w-[44px] h-10 rounded-xl border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 flex items-center justify-center cursor-pointer"
          >
            {layoutMode === 'list' ? (
              <LayoutGrid className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-5 border-b border-zinc-200/70 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: rm.tabAll },
              { id: 'live', label: rm.tabLive },
              { id: 'upcoming', label: rm.tabUpcoming },
              { id: 'paused', label: rm.tabPaused },
              { id: 'ended', label: rm.tabEnded },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`relative py-2.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active ? 'text-[#111113]' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111113] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Cards */}
      {filteredRooms.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200/70">
          <p className="text-sm font-medium text-zinc-700">
            {showTrash ? rm.emptyTrash : rm.emptyState}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {rm.emptyCreateHint}
          </p>
        </div>
      ) : (
        <div
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-2 gap-2.5'
              : 'space-y-3'
          }
        >
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 p-4 sm:p-5 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    {room.status === 'live' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-pulse" />
                    )}
                    <span
                      className={`font-medium ${
                        room.status === 'live' ? 'text-[#E53935]' : 'text-zinc-500'
                      }`}
                    >
                      {statusLabel(room.status)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{room.inviteCode}</span>
                  </div>
                  <h3 className="text-base font-display font-semibold text-[#111113] truncate">
                    {room.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateRoom({ ...room, trashed: !room.trashed });
                    onNotify(room.trashed ? rm.restoredRoom : rm.trashedRoom);
                  }}
                  aria-label={room.trashed ? rm.restoreAria : rm.trashAria}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-[#111113]">
                    {getLanguageOptionLabel(room.sourceLang, language)} → {getLanguageOptionLabel(room.targetLang, language)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 tabular-nums">
                    <Users className="w-3.5 h-3.5" />
                    {rm.listenersCount(room.listenerCount)}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 font-medium text-[#111113] group-hover:translate-x-0.5 transition-transform">
                  <span>{room.status === 'live' ? rm.enterLive : rm.viewDetail}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Room Bottom Sheet */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setShowCreateModal(false)}
        >
          <form
            onSubmit={handleCreate}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl border-t border-zinc-200 px-5 pt-3 pb-6 space-y-4 shadow-2xl"
          >
            <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#111113]">{rm.createModalTitle}</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label={cm.close}
                className="w-11 h-11 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-500">{rm.topicLabel}</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={rm.roomTitlePlaceholder}
                autoFocus
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#111113]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-500">{rm.sourceLangLabel}</label>
                <select
                  value={newSrcLang}
                  onChange={(e) => setNewSrcLang(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm bg-white focus:outline-none"
                >
                  <option value="中文">{getLanguageOptionLabel('中文', language)}</option>
                  <option value="英语">{getLanguageOptionLabel('英语', language)}</option>
                  <option value="日语">{getLanguageOptionLabel('日语', language)}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-500">{rm.targetLangLabel}</label>
                <select
                  value={newTgtLang}
                  onChange={(e) => setNewTgtLang(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm bg-white focus:outline-none"
                >
                  <option value="英语">{getLanguageOptionLabel('英语', language)}</option>
                  <option value="中文">{getLanguageOptionLabel('中文', language)}</option>
                  <option value="越南语">{getLanguageOptionLabel('越南语', language)}</option>
                  <option value="日语">{getLanguageOptionLabel('日语', language)}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-sm font-medium cursor-pointer"
            >
              {rm.createModalSubmit}
            </button>
          </form>
        </div>
      )}

      {/* Join by Code Bottom Sheet */}
      {showJoinModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setShowJoinModal(false)}
        >
          <form
            onSubmit={handleJoin}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl border-t border-zinc-200 px-5 pt-3 pb-6 space-y-4 shadow-2xl"
          >
            <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#111113]">{rm.joinModalTitle}</h3>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                aria-label={cm.close}
                className="w-11 h-11 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder={rm.joinCodePlaceholder}
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 font-mono text-sm uppercase focus:outline-none focus:border-[#111113]"
            />
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-sm font-medium cursor-pointer"
            >
              {rm.joinModalSubmit}
            </button>
          </form>
        </div>
      )}

      {/* Room Detail Bottom Sheet */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl border-t border-zinc-200 px-5 pt-3 pb-6 space-y-4 shadow-2xl"
          >
            <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono text-zinc-400">
                  {rm.inviteCodePrefix}{selectedRoom.inviteCode} · {statusLabel(selectedRoom.status)}
                </div>
                <h3 className="text-lg font-display font-bold text-[#111113] mt-1">
                  {selectedRoom.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                aria-label={cm.close}
                className="w-11 h-11 -mr-2 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F6F8FC] border border-[#E8EDF5] text-xs">
              <div>
                <span className="text-zinc-400">{rm.directionLabel}</span>
                <div className="font-semibold text-[#111113] mt-0.5">
                  {getLanguageOptionLabel(selectedRoom.sourceLang, language)} → {getLanguageOptionLabel(selectedRoom.targetLang, language)}
                </div>
              </div>
              <div>
                <span className="text-zinc-400">{rm.totalListenersLabel}</span>
                <div className="font-mono font-semibold text-[#111113] mt-0.5 tabular-nums">
                  {rm.personsCount(selectedRoom.listenerCount)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(selectedRoom.inviteCode).catch(() => {});
                  onNotify(rm.toastCopyInvite(selectedRoom.inviteCode));
                }}
                className="flex-1 h-11 rounded-xl border border-[#E2E8F2] hover:bg-zinc-50 text-xs font-medium text-[#111113] cursor-pointer"
              >
                {rm.copyInviteBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoom(null);
                  onEnterLiveTranslate();
                }}
                className="flex-1 h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-medium cursor-pointer"
              >
                {rm.enterWorkbenchBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
