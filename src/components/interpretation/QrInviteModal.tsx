import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, ExternalLink, X } from 'lucide-react';
import { AppLanguage, InterpretationRoom } from '../../types/vamx';
import { INTERP_COPY } from '../../data/interpretationData';
import { getLanguageOptionLabel } from '../../data/uiStrings';

interface QrInviteModalProps {
  room: InterpretationRoom | null;
  language: AppLanguage;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  onOpenGuestPreview: (room: InterpretationRoom) => void;
}

export const buildGuestJoinUrl = (room: InterpretationRoom): string => {
  if (typeof window === 'undefined') {
    return `?join=${room.inviteCode}&room=${encodeURIComponent(room.id)}`;
  }
  const url = new URL(window.location.href);
  url.searchParams.set('join', room.inviteCode);
  url.searchParams.set('room', room.id);
  return url.toString();
};

export const QrInviteModal: React.FC<QrInviteModalProps> = ({
  room,
  language,
  onClose,
  onCopyUrl,
  onOpenGuestPreview,
}) => {
  const c = INTERP_COPY[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const joinUrl = room ? buildGuestJoinUrl(room) : '';

  useEffect(() => {
    if (!room || !canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      joinUrl,
      {
        width: 220,
        margin: 2,
        color: {
          dark: '#111827',
          light: '#FFFFFF',
        },
      },
      () => {}
    );
  }, [room, joinUrl]);

  if (!room) return null;

  const handleDownloadPng = () => {
    const srcCanvas = canvasRef.current;
    if (!srcCanvas) return;
    // Composite crisp downloadable poster card with room title + 6-digit invite code
    const out = document.createElement('canvas');
    out.width = 440;
    out.height = 540;
    const ctx = out.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.fillStyle = '#1668FF';
      ctx.fillRect(0, 0, out.width, 10);
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VAMX', out.width / 2, 52);
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(room.title.slice(0, 24), out.width / 2, 84);
      ctx.fillStyle = '#64748B';
      ctx.font = '14px sans-serif';
      ctx.fillText(`${room.sourceLang} → ${room.targetLang}`, out.width / 2, 110);
      ctx.drawImage(srcCanvas, 110, 134, 220, 220);
      ctx.fillStyle = '#64748B';
      ctx.font = '13px sans-serif';
      ctx.fillText(c.inviteCodeLabel, out.width / 2, 392);
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 34px monospace';
      ctx.fillText(room.inviteCode, out.width / 2, 434);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px sans-serif';
      ctx.fillText(joinUrl.slice(0, 56), out.width / 2, 488);

      const link = document.createElement('a');
      link.download = `vamx-room-${room.inviteCode}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] bg-white rounded-2xl border border-[#E5EAF3] shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between">
          <h3 className="text-sm font-display font-bold text-[#111827]">{c.qrTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={c.cancelBtn}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div>
            <div className="text-base font-display font-bold text-[#111827]">{room.title}</div>
            <div className="text-xs text-[#64748B] mt-1">
              {getLanguageOptionLabel(room.sourceLang, language)} →{' '}
              {getLanguageOptionLabel(room.targetLang, language)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#E5ECF5] shadow-xs">
            <canvas ref={canvasRef} className="block rounded-lg" />
          </div>

          <div>
            <div className="text-[11px] text-[#64748B]">{c.inviteCodeLabel}</div>
            <div className="font-mono text-2xl font-bold tracking-[0.18em] text-[#111827] tabular-nums mt-0.5">
              {room.inviteCode}
            </div>
          </div>

          <div className="w-full space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="h-10 px-3 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="truncate">{c.qrDownloadPng}</span>
              </button>
              <button
                type="button"
                onClick={() => onCopyUrl(joinUrl)}
                className="h-10 px-3 rounded-xl border border-[#DCE3EE] bg-white hover:bg-zinc-50 text-xs font-medium text-[#111827] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="truncate">{c.qrCopyLink}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGuestPreview(room);
              }}
              className="w-full h-10 rounded-xl bg-[#F4F7FC] hover:bg-[#EAF0FA] text-[#1668FF] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{c.qrOpenGuestPreview}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
