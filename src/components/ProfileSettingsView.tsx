import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bluetooth,
  BookOpen,
  ChevronRight,
  Cloud,
  Coins,
  Download,
  FileAudio,
  Globe,
  Languages,
  LayoutGrid,
  LogOut,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserX,
  X,
  Zap,
} from 'lucide-react';
import {
  AppLanguage,
  AutomationConfig,
  DeviceInfo,
  RecordingItem,
  SummaryTemplate,
  TransferTask,
  UserProfileState,
} from '../types/vamx';
import { I18N, NEARBY_DEVICE_CANDIDATES, TRANSCRIPTION_LANGUAGES } from '../data/mockData';
import {
  EXTRA_PROFILE_COPY,
  UI_STRINGS,
  formatDateLabelDisplay,
  getLanguageOptionLabel,
  getTemplateCategoryLabel,
  getTemplateDisplay,
} from '../data/uiStrings';
import { DeviceCardVisual } from './DeviceCardVisual';

export type ProfileSheetType =
  | null
  | 'profile'
  | 'credits'
  | 'device'
  | 'transfers'
  | 'automation'
  | 'templates'
  | 'trash'
  | 'password'
  | 'deleteAccount'
  | 'logout';

interface ProfileSettingsViewProps {
  language: AppLanguage;
  transcriptionLang: string;
  recordingsCount: number;
  localStorageLabel: string;
  trashedRecordings: RecordingItem[];
  device: DeviceInfo;
  automation: AutomationConfig;
  templates: SummaryTemplate[];
  transfers: TransferTask[];
  userProfile: UserProfileState;
  activeSheet: ProfileSheetType;
  onSetActiveSheet: (sheet: ProfileSheetType) => void;
  onUpdateUserProfile: React.Dispatch<React.SetStateAction<UserProfileState>>;
  onChangeLanguage: (lang: AppLanguage) => void;
  onChangeTranscriptionLang: (lang: string) => void;
  onUpdateDevice: (dev: DeviceInfo) => void;
  onUpdateAutomation: (auto: AutomationConfig) => void;
  onAddTemplate: (tpl: SummaryTemplate) => void;
  onRetryTransfer: (id: string) => void;
  onRestoreRecording: (id: string) => void;
  onPermanentDeleteRecording: (id: string) => void;
  onEmptyTrash: () => void;
  onOpenImport: () => void;
  onOpenPhoneAudioPicker: () => void;
  onResetDemoData: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onNotify: (msg: string) => void;
  sheetsOnly?: boolean;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  language,
  transcriptionLang,
  recordingsCount,
  localStorageLabel,
  trashedRecordings,
  device,
  automation,
  templates,
  transfers,
  userProfile,
  activeSheet,
  onSetActiveSheet,
  onUpdateUserProfile,
  onChangeLanguage,
  onChangeTranscriptionLang,
  onUpdateDevice,
  onUpdateAutomation,
  onAddTemplate,
  onRetryTransfer,
  onRestoreRecording,
  onPermanentDeleteRecording,
  onEmptyTrash,
  onOpenImport,
  onOpenPhoneAudioPicker,
  onResetDemoData,
  onLogout,
  onDeleteAccount,
  onNotify,
  sheetsOnly = false,
}) => {
  const t = I18N[language];
  const pr = UI_STRINGS[language].profile;
  const f = UI_STRINGS[language].files;
  const c = UI_STRINGS[language].common;
  const extra = EXTRA_PROFILE_COPY[language];
  const [profileDraft, setProfileDraft] = useState({
    userName: userProfile.userName,
    userEmail: userProfile.userEmail,
    userPhone: userProfile.userPhone,
  });

  const [showCreateTpl, setShowCreateTpl] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const [deleteAck, setDeleteAck] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [isScanningDevices, setIsScanningDevices] = useState(false);
  const [showAddScanner, setShowAddScanner] = useState(false);

  const todayKey = new Date().toISOString().slice(0, 10);
  const checkedInToday = userProfile.lastCheckInDate === todayKey;

  const handleStartAddDeviceScan = () => {
    setShowAddScanner(true);
    setIsScanningDevices(true);
    window.setTimeout(() => {
      setIsScanningDevices(false);
    }, 550);
  };

  const pendingTransfers = transfers.filter((tf) => tf.status !== 'completed').length;

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) {
      onNotify(extra.emptyTplName);
      return;
    }
    const newTpl: SummaryTemplate = {
      id: `tpl-${Date.now()}`,
      category: '自定义',
      name: tplName.trim(),
      description: tplDesc.trim() || pr.customBadge,
      tone: 'indigo',
      isCustom: true,
    };
    onAddTemplate(newTpl);
    setTplName('');
    setTplDesc('');
    setShowCreateTpl(false);
    onNotify(pr.toastTemplateCreated(newTpl.name));
  };

  return (
    <div className={sheetsOnly ? '' : 'space-y-6 pb-8'}>
      {!sheetsOnly && (
        <>
      {/* User Card */}
      <button
        type="button"
        onClick={() => {
          setProfileDraft({
            userName: userProfile.userName,
            userEmail: userProfile.userEmail,
            userPhone: userProfile.userPhone,
          });
          onSetActiveSheet('profile');
        }}
        className="w-full text-left bg-white rounded-2xl border border-zinc-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-zinc-300 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF3FF] text-[#1668FF] font-display font-bold text-lg flex items-center justify-center shrink-0">
            {(userProfile.userName || 'M').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-base font-display font-bold text-[#111113] truncate">
              {userProfile.userName}
            </div>
            <div className="text-xs text-zinc-500 truncate mt-0.5">
              {userProfile.userEmail} · {t.cloudReady}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
      </button>

      {/* 3-Metric Strip */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 grid grid-cols-3 divide-x divide-zinc-100 py-4">
        <div className="text-center px-2">
          <div className="font-mono text-xl font-bold text-[#111113] tabular-nums">
            {recordingsCount}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">{t.recordingsStat}</div>
        </div>
        <div className="text-center px-2">
          <div className="font-mono text-xl font-bold text-[#111113] tabular-nums">
            {localStorageLabel}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">{t.localStorage}</div>
        </div>
        <button
          type="button"
          onClick={() => onSetActiveSheet('credits')}
          className="text-center px-2 cursor-pointer hover:opacity-75 transition-opacity"
        >
          <div className="font-mono text-xl font-bold text-[#111113] tabular-nums">
            {userProfile.credits.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">{t.credits}</div>
        </button>
      </div>

      {/* Workspace Group */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-zinc-400 px-1">{t.workspaceSection}</div>
        <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
          <button
            type="button"
            onClick={() => onSetActiveSheet('credits')}
            className="w-full px-4 h-14 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <Coins className="w-4 h-4 text-zinc-500" />
              <span>{t.creditsCenter}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 tabular-nums">
              <span>{userProfile.credits.toLocaleString()}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSetActiveSheet('device')}
            className="w-full px-4 h-14 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <Bluetooth className="w-4 h-4 text-zinc-500" />
              <span>{t.myDevice}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-mono">
                {device.bound === false ? pr.unboundStatus : device.connected ? device.name : t.disconnected}
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSetActiveSheet('transfers')}
            className="w-full px-4 h-14 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <Download className="w-4 h-4 text-zinc-500" />
              <span>{t.transfers}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 tabular-nums">
              <span>{pendingTransfers > 0 ? pr.transferPending(pendingTransfers) : pr.transferTotal(transfers.length)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSetActiveSheet('automation')}
            className="w-full px-4 h-14 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <Zap className="w-4 h-4 text-zinc-500" />
              <span>{t.automation}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>{pr.automationEnabled(Object.values(automation).filter((v) => v === true).length)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSetActiveSheet('templates')}
            className="w-full px-4 h-14 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <LayoutGrid className="w-4 h-4 text-zinc-500" />
              <span>{t.templates}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>{pr.templatesCount(templates.length)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSetActiveSheet('trash')}
            className="w-full px-4 h-14 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <Trash2 className="w-4 h-4 text-zinc-500" />
              <span>{t.trashBin}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 tabular-nums">
              <span>{trashedRecordings.length > 0 ? pr.trashRecoverable(trashedRecordings.length) : pr.trashEmpty}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Preferences Group */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-zinc-400 px-1">{t.preferences}</div>
        <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <Globe className="w-4 h-4 text-zinc-500" />
              <span>{t.uiLanguage}</span>
            </div>
            <select
              aria-label={pr.uiLanguageAria}
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as AppLanguage)}
              className="text-xs font-medium text-zinc-600 bg-transparent focus:outline-none cursor-pointer text-right"
            >
              <option value="zh">简体中文</option>
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>

          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <Languages className="w-4 h-4 text-zinc-500" />
              <span>{t.transcribeLang}</span>
            </div>
            <select
              aria-label={pr.transcribeLangAria}
              value={transcriptionLang}
              onChange={(e) => {
                onChangeTranscriptionLang(e.target.value);
                onNotify(pr.transcribeLangToast(getLanguageOptionLabel(e.target.value, language)));
              }}
              className="text-xs font-medium text-zinc-600 bg-transparent focus:outline-none cursor-pointer text-right"
            >
              {TRANSCRIPTION_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {getLanguageOptionLabel(l, language)}
                </option>
              ))}
            </select>
          </div>

          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <Bell className="w-4 h-4 text-zinc-500" />
              <span>{t.notifyOnDone}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={userProfile.notifyOnDone}
              onClick={() => {
                const next = !userProfile.notifyOnDone;
                onUpdateUserProfile((p) => ({ ...p, notifyOnDone: next }));
                onNotify(next ? pr.notifyEnabledToast : pr.notifyDisabledToast);
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                userProfile.notifyOnDone ? 'bg-[#1668FF]' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  userProfile.notifyOnDone ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account & Security Group */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-zinc-400 px-1">{t.accountSection}</div>
        <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
          <button
            type="button"
            onClick={() => onSetActiveSheet('password')}
            className="w-full px-4 h-14 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-[#111113]">
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
              <span>{t.changePassword}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              setDeleteAck(false);
              setDeleteConfirmText('');
              onSetActiveSheet('deleteAccount');
            }}
            className="w-full px-4 h-14 flex items-center justify-between hover:bg-red-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-[#E53935]">
              <UserX className="w-4 h-4" />
              <span>{t.deleteAccount}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Standalone Log Out Action */}
      <button
        type="button"
        onClick={() => onSetActiveSheet('logout')}
        className="w-full h-13 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 text-sm font-semibold text-[#111113] flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4 text-zinc-500" />
        <span>{t.logout}</span>
      </button>

      <div className="pt-2 flex flex-col items-center gap-2">
        <p className="text-center text-xs text-zinc-400">
          {pr.footerMotto}
        </p>
        {confirmReset ? (
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setConfirmReset(false);
                onResetDemoData();
              }}
              className="text-[#E53935] font-semibold hover:underline cursor-pointer py-1"
            >
              {pr.resetConfirmTitle}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="text-zinc-400 hover:text-zinc-600 cursor-pointer py-1"
            >
              {c.cancel}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer py-1"
          >
            {t.resetDemo}
          </button>
        )}
      </div>
        </>
      )}

      {/* --- SUB-SHEETS --- */}

      {/* 1. Automation Sheet */}
      {activeSheet === 'automation' && (
        <SheetWrapper title={pr.automationSheetTitle} closeLabel={pr.closeAria} onClose={() => onSetActiveSheet(null)}>
          {/* Clean 3-Node Pipeline Diagram (VAMX Cool Slate Box) */}
          <div className="p-4 rounded-2xl bg-[#F4F6FA] border border-[#E8EDF5] flex items-center justify-around">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6ECF5] flex items-center justify-center text-[#1668FF]">
                <FileAudio className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-zinc-600">{pr.pipeImport}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-300" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6ECF5] flex items-center justify-center text-[#1668FF]">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-zinc-600">{pr.pipeCloud}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-300" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6ECF5] flex items-center justify-center text-[#1668FF]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-zinc-600">{pr.pipeAi}</span>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 mt-4">
            {(
              [
                { key: 'autoImportFromDevice', label: pr.autoImportTitle },
                { key: 'autoUploadToCloud', label: pr.autoUploadTitle },
                { key: 'autoTranscribeAfterUpload', label: pr.autoTranscribeTitle },
                { key: 'autoSummarizeAfterTranscribe', label: pr.autoSummaryTitle },
                { key: 'wifiOnlyUpload', label: pr.wifiOnlyTitle },
              ] as const
            ).map((item) => {
              const checked = automation[item.key];
              return (
                <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
                  <span className="text-sm text-[#111113]">{item.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() =>
                      onUpdateAutomation({ ...automation, [item.key]: !checked })
                    }
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                      checked ? 'bg-[#1668FF]' : 'bg-zinc-200'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}

            <div className="py-3.5 flex items-center justify-between gap-4">
              <span className="text-sm text-[#111113]">{pr.defaultTemplateLabel}</span>
              <select
                value={automation.defaultTemplateId}
                onChange={(e) =>
                  onUpdateAutomation({ ...automation, defaultTemplateId: e.target.value })
                }
                className="text-xs font-medium text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {getTemplateDisplay(tpl, language).name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SheetWrapper>
      )}

      {/* 2. Template Center Sheet */}
      {activeSheet === 'templates' && (
        <SheetWrapper
          title={pr.templatesSheetTitle}
          subtitle={pr.templatesSheetSub}
          closeLabel={pr.closeAria}
          onClose={() => {
            setShowCreateTpl(false);
            onSetActiveSheet(null);
          }}
        >
          <button
            type="button"
            onClick={() => setShowCreateTpl(true)}
            className="mb-3.5 w-full h-11 rounded-xl border border-[#D6E4FF] bg-[#F4F8FF] hover:bg-[#EAF1FF] text-xs font-semibold text-[#1668FF] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{pr.newTemplateBtn}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {templates.map((tpl) => {
              const isSelected = automation.defaultTemplateId === tpl.id;
              const tplDisplay = getTemplateDisplay(tpl, language);
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    onUpdateAutomation({ ...automation, defaultTemplateId: tpl.id });
                    onNotify(pr.toastDefaultTemplateUpdated);
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1668FF] bg-[#F4F8FF]'
                      : 'border-[#E6ECF5] bg-white hover:border-[#CFD9EA]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] flex items-center justify-center text-[#1668FF]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="text-[11px] font-semibold text-[#1668FF]">{pr.defaultBadge}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {tpl.isCustom ? pr.customBadge : getTemplateCategoryLabel(tpl.category, language)}
                  </div>
                  <div className="text-sm font-display font-bold text-[#111113] mt-0.5">
                    {tplDisplay.name}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                    {tplDisplay.description}
                  </p>
                </button>
              );
            })}
          </div>
        </SheetWrapper>
      )}

      {/* Popup Dialog: Create Custom Template (Zero scrolling required) */}
      {activeSheet === 'templates' && showCreateTpl && (
        <div
          className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowCreateTpl(false)}
        >
          <form
            onSubmit={handleCreateTemplate}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] bg-white rounded-3xl border border-[#E5ECF5] p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-[#111827]">
                  {pr.newTemplateBtn}
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {pr.createTemplateSheetSub}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTpl(false)}
                aria-label={pr.closeAria}
                className="w-9 h-9 -mr-1.5 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#64748B]">{pr.templateNameLabel}</label>
                <input
                  type="text"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder={pr.templateNamePlaceholder}
                  autoFocus
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F8FC] border border-[#E3EAF5] text-sm text-[#111827] placeholder:text-zinc-400 focus:outline-none focus:border-[#1668FF] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#64748B]">
                  {pr.createTemplateDescOptional}
                </label>
                <textarea
                  rows={3}
                  value={tplDesc}
                  onChange={(e) => setTplDesc(e.target.value)}
                  placeholder={pr.templateDescPlaceholder}
                  className="w-full p-3 rounded-xl bg-[#F6F8FC] border border-[#E3EAF5] text-xs text-[#111827] placeholder:text-zinc-400 focus:outline-none focus:border-[#1668FF] focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateTpl(false)}
                className="flex-1 h-10 rounded-xl border border-[#E2E8F2] bg-white hover:bg-zinc-50 text-xs font-semibold text-[#111827] cursor-pointer"
              >
                {c.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer"
              >
                {pr.saveTemplateBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Device Management Sheet */}
      {activeSheet === 'device' && (
        <SheetWrapper
          title={pr.deviceSheetTitle}
          subtitle={
            device.bound === false
              ? pr.devUnboundSub
              : device.connected
              ? pr.devConnectedSub(device.protocol)
              : pr.devDisconnectedSub
          }
          closeLabel={pr.closeAria}
          onClose={() => {
            setShowAddScanner(false);
            onSetActiveSheet(null);
          }}
        >
          <div className="space-y-4">
            {device.bound !== false ? (
              <>
                <div className="p-4 rounded-2xl bg-[#F4F6FA] border border-[#E8EDF5] flex flex-col items-center text-center">
                  <DeviceCardVisual
                    device={device}
                    isRecording={false}
                    recordingSeconds={0}
                    compact
                    language={language}
                    onPhysicalButtonClick={() => {
                      if (!device.connected) {
                        onUpdateDevice({ ...device, connected: true });
                        onNotify(pr.toastBound(device.name));
                      } else {
                        onNotify(pr.devReadyToast);
                      }
                    }}
                  />

                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        device.connected ? 'bg-emerald-500' : 'bg-zinc-400'
                      }`}
                    />
                    <span className="text-base font-display font-bold text-[#111827]">
                      {device.name}
                    </span>
                  </div>

                  <div className="text-xs text-[#64748B] mt-1 font-mono">
                    {device.connected
                      ? pr.devConnectedBattery(device.battery)
                      : pr.devDisconnectedBadge}
                  </div>

                  <div className="flex items-center justify-center gap-2.5 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateDevice({ ...device, connected: !device.connected });
                        onNotify(device.connected ? pr.toastDisconnected : pr.toastReconnected);
                      }}
                      className={`h-8 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        device.connected
                          ? 'bg-white border border-[#DCE4F0] text-[#111827] hover:bg-zinc-50'
                          : 'bg-[#1668FF] text-white hover:bg-[#0D59EB]'
                      }`}
                    >
                      {device.connected ? pr.disconnectBtn : pr.reconnectBtn}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateDevice({ ...device, bound: false, connected: false });
                        onNotify(pr.toastUnbound);
                      }}
                      className="h-8 px-3 rounded-xl bg-white border border-[#DCE4F0] hover:border-red-200 hover:bg-red-50/70 text-xs font-medium text-[#D9534F] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{pr.unbindCardBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Hardware Telemetry & Storage Bar */}
                <div className="rounded-2xl border border-[#E6ECF5] bg-white p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[11px] text-[#94A3B8]">{pr.macLabel}</div>
                      <div className="font-mono font-medium text-[#111827] mt-0.5">{device.mac}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#94A3B8]">{pr.firmwareLabel}</div>
                      <div className="font-mono font-medium text-[#111827] mt-0.5 flex items-center gap-2">
                        <span>v{device.firmware}</span>
                        <button
                          type="button"
                          onClick={() => onNotify(pr.firmwareLatestToast(device.firmware))}
                          className="text-[11px] font-sans font-medium text-[#1668FF] hover:underline cursor-pointer"
                        >
                          {pr.checkUpdateBtn}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#94A3B8]">{pr.protocolLabel}</div>
                      <div className="font-mono font-medium text-[#111827] mt-0.5">{device.protocol}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#94A3B8]">{pr.pendingCountLabel}</div>
                      <div className="font-mono font-medium text-[#111827] mt-0.5">
                        {pr.pendingCountValue(device.pendingCount)}
                      </div>
                    </div>
                  </div>

                  {/* Storage Bar */}
                  <div className="pt-2.5 border-t border-[#EDF2F8] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">{pr.storageLabel}</span>
                      <span className="font-mono font-medium text-[#111827] tabular-nums">
                        {device.usedMb} MB / {device.totalGb} GB
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#EEF2F7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1668FF] transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(4, Math.round((device.usedMb / (device.totalGb * 1024)) * 100))
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* USB Read Mode Toggle */}
                  <div className="pt-2.5 border-t border-[#EDF2F8] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#111827]">{pr.toggleUsb}</div>
                      <div className="text-[11px] text-[#94A3B8]">{pr.usbDesc}</div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={device.usbReadEnabled}
                      onClick={() => {
                        onUpdateDevice({ ...device, usbReadEnabled: !device.usbReadEnabled });
                        onNotify(pr.toastUsbToggled(!device.usbReadEnabled));
                      }}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                        device.usbReadEnabled ? 'bg-[#1668FF]' : 'bg-zinc-200'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          device.usbReadEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Quick Hardware Action */}
                <button
                  type="button"
                  onClick={() => {
                    onSetActiveSheet(null);
                    onOpenImport();
                  }}
                  className="w-full h-11 px-3 rounded-2xl bg-[#F4F7FC] hover:bg-[#EAF1FB] border border-[#E4ECF7] text-xs font-semibold text-[#111827] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#1668FF]" />
                  <span>{pr.syncCardBtn}</span>
                </button>
              </>
            ) : (
              <div className="py-8 text-center border-b border-[#EDF2F8] space-y-1.5">
                <div className="w-11 h-11 rounded-2xl bg-[#F4F7FC] text-[#94A3B8] flex items-center justify-center mx-auto mb-2">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-[#111827]">{pr.noCardTitle}</div>
                <div className="text-xs text-[#94A3B8]">{pr.noCardDesc}</div>
              </div>
            )}

            {/* Add / Scan Nearby Devices Panel */}
            {showAddScanner && (
              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E5ECF5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111827]">
                    {isScanningDevices ? pr.bleSearchingTitle : pr.foundDevicesTitle}
                  </span>
                  <button
                    type="button"
                    onClick={handleStartAddDeviceScan}
                    className="text-[11px] font-medium text-[#1668FF] hover:underline cursor-pointer"
                  >
                    {pr.rescanBtn}
                  </button>
                </div>

                {isScanningDevices ? (
                  <div className="py-4 flex items-center justify-center gap-2 text-xs text-[#64748B]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1668FF]" />
                    <span>{pr.bleSearching}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {NEARBY_DEVICE_CANDIDATES.map((cand) => {
                      const isCurrent = device.bound !== false && device.mac === cand.mac;
                      return (
                        <div
                          key={cand.mac}
                          className="p-2.5 rounded-xl bg-white border border-[#E5ECF5] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#111827] truncate">
                              {cand.name}
                            </div>
                            <div className="text-[10.5px] font-mono text-[#64748B] mt-0.5">
                              MAC: {cand.mac} · {pr.cardBatteryShort(cand.battery)}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => {
                              onUpdateDevice({
                                ...device,
                                name: cand.name,
                                mac: cand.mac,
                                battery: cand.battery,
                                firmware: cand.firmware,
                                usedMb: cand.usedMb,
                                totalGb: cand.totalGb,
                                bound: true,
                                connected: true,
                              });
                              setShowAddScanner(false);
                              onNotify(pr.toastBound(cand.name));
                            }}
                            className={`h-8 px-3 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer transition-colors ${
                              isCurrent
                                ? 'bg-[#F4F6FA] text-[#94A3B8] cursor-default'
                                : 'bg-[#1668FF] hover:bg-[#0D59EB] text-white'
                            }`}
                          >
                            {isCurrent ? pr.boundBadge : pr.bindAndConnectBtn}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Primary Add Device CTA */}
            <button
              type="button"
              onClick={handleStartAddDeviceScan}
              className="w-full h-11 rounded-2xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-[0_6px_16px_-6px_rgba(22,104,255,0.45)]"
            >
              <Plus className="w-4 h-4" />
              <span>{pr.addDeviceBtn}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPhoneAudioPicker}
              className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-[#1668FF] hover:text-[#0D59EB] cursor-pointer transition-colors"
            >
              <FileAudio className="w-4 h-4" />
              <span>{pr.phoneAudioLinkBtn}</span>
            </button>
          </div>
        </SheetWrapper>
      )}

      {/* 4. Transfers Sheet */}
      {activeSheet === 'transfers' && (
        <SheetWrapper title={pr.transfersSheetTitle} subtitle={pr.transfersSheetSub} closeLabel={pr.closeAria} onClose={() => onSetActiveSheet(null)}>
          <div className="divide-y divide-zinc-100">
            {transfers.map((tf) => (
              <div key={tf.id} className="py-3.5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#111113] truncate">{tf.filename}</span>
                  <span
                    className={`text-xs font-medium ${
                      tf.status === 'completed'
                        ? 'text-zinc-400'
                        : tf.status === 'failed'
                        ? 'text-[#E53935]'
                        : 'text-[#111113]'
                    }`}
                  >
                    {tf.status === 'completed'
                      ? pr.completedStatus
                      : tf.status === 'failed'
                      ? pr.transferInterrupted
                      : `${tf.progress}%`}
                  </span>
                </div>
                <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      tf.status === 'failed' ? 'bg-[#E53935]' : 'bg-[#121214]'
                    }`}
                    style={{ width: `${tf.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-mono">{tf.sizeLabel}</span>
                  {tf.status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => onRetryTransfer(tf.id)}
                      className="text-xs font-semibold text-[#111113] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{pr.resumeTransferBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetWrapper>
      )}

      {/* 5. Credits Center Sheet */}
      {activeSheet === 'credits' && (
        <SheetWrapper title={t.creditsCenter} closeLabel={pr.closeAria} onClose={() => onSetActiveSheet(null)}>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1668FF] to-[#0D4ED1] text-white space-y-3 shadow-md">
            <div className="text-xs text-white/75">{pr.creditsCurrentLabel}</div>
            <div className="font-mono text-3xl font-bold tabular-nums">
              {userProfile.credits.toLocaleString()}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs text-white/85">
              <span>{pr.creditsTotalEarned}</span>
              <button
                type="button"
                disabled={checkedInToday}
                onClick={() => {
                  if (checkedInToday) return;
                  onUpdateUserProfile((p) => ({
                    ...p,
                    credits: p.credits + 150,
                    lastCheckInDate: todayKey,
                  }));
                  onNotify(pr.toastCheckedIn150);
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  checkedInToday
                    ? 'bg-white/20 text-white/80 cursor-default'
                    : 'bg-white text-[#1668FF] cursor-pointer hover:bg-white/95'
                }`}
              >
                {checkedInToday ? pr.creditsCheckedIn150 : pr.creditsCheckIn150}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-2xl border border-[#E6ECF5] flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#111113]">{pr.creditsFreeTitle}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{pr.creditsFreeDesc}</div>
              </div>
              <span className="font-mono text-sm font-bold text-[#111113]">¥0</span>
            </div>

            <div className="p-4 rounded-2xl border border-[#1668FF] bg-[#F4F8FF] flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#111113]">{pr.creditsProTitle}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{pr.creditsProDesc}</div>
              </div>
              <button
                type="button"
                onClick={() => onNotify(pr.creditsProToast)}
                className="h-9 px-3.5 rounded-xl bg-[#1668FF] text-white text-xs font-medium cursor-pointer"
              >
                {pr.creditsProPrice}
              </button>
            </div>
          </div>
        </SheetWrapper>
      )}

      {/* 6. Profile Edit Sheet */}
      {activeSheet === 'profile' && (
        <SheetWrapper title={extra.profileSheetTitle} closeLabel={pr.closeAria} onClose={() => onSetActiveSheet(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!profileDraft.userName.trim()) {
                onNotify(pr.toastProfileEmpty);
                return;
              }
              onUpdateUserProfile((p) => ({
                ...p,
                userName: profileDraft.userName.trim(),
                userEmail: profileDraft.userEmail.trim() || p.userEmail,
                userPhone: profileDraft.userPhone.trim() || p.userPhone,
              }));
              onSetActiveSheet(null);
              onNotify(pr.toastProfileSaved);
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{pr.displayNameLabel}</label>
              <input
                type="text"
                value={profileDraft.userName}
                onChange={(e) => setProfileDraft((d) => ({ ...d, userName: e.target.value }))}
                placeholder={pr.displayNamePlaceholder}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#1668FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{pr.emailLabel}</label>
              <input
                type="email"
                value={profileDraft.userEmail}
                onChange={(e) => setProfileDraft((d) => ({ ...d, userEmail: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#1668FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{pr.phoneLabel}</label>
              <input
                type="tel"
                value={profileDraft.userPhone}
                onChange={(e) => setProfileDraft((d) => ({ ...d, userPhone: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 font-mono text-sm focus:outline-none focus:border-[#1668FF]"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer mt-2"
            >
              {pr.saveProfileBtn}
            </button>
          </form>
        </SheetWrapper>
      )}

      {/* 7. Change Password Sheet */}
      {activeSheet === 'password' && (
        <SheetWrapper title={t.changePassword} closeLabel={pr.closeAria} onClose={() => onSetActiveSheet(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!oldPwd.trim()) {
                onNotify(pr.toastPwdEmpty);
                return;
              }
              if (newPwd.length < 6) {
                onNotify(pr.toastPwdShort);
                return;
              }
              if (newPwd !== confirmPwd) {
                onNotify(pr.toastPwdMismatch);
                return;
              }
              setOldPwd('');
              setNewPwd('');
              setConfirmPwd('');
              onSetActiveSheet(null);
              onNotify(pr.toastPwdUpdated);
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{pr.currentPwdLabel}</label>
              <input
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                placeholder={pr.currentPwdPlaceholder}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#1668FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{extra.newPwdRuleLabel}</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder={pr.newPwdPlaceholder}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#1668FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{pr.confirmPwdLabel}</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder={pr.confirmPwdPlaceholder}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#1668FF]"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer"
            >
              {pr.submitPwdBtn}
            </button>
          </form>
        </SheetWrapper>
      )}

      {/* 8. Recycle Bin Sheet */}
      {activeSheet === 'trash' && (
        <SheetWrapper
          title={pr.trashSheetTitle}
          subtitle={pr.trashSheetSub}
          closeLabel={pr.closeAria}
          onClose={() => onSetActiveSheet(null)}
        >
          {trashedRecordings.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-11 h-11 rounded-2xl bg-[#F4F7FC] text-[#94A3B8] flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-[#111827]">{f.emptyTrashTitle}</p>
              <p className="text-xs text-[#64748B]">{pr.trashEmptyDesc}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B] tabular-nums">
                  {pr.trashCountLine(trashedRecordings.length)}
                </span>
                <button
                  type="button"
                  onClick={onEmptyTrash}
                  className="text-xs font-semibold text-[#E53935] hover:underline cursor-pointer py-1"
                >
                  {f.emptyTrashAction}
                </button>
              </div>

              <div className="divide-y divide-[#EDF2F8] border border-[#E5ECF5] rounded-2xl overflow-hidden">
                {trashedRecordings.map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-white flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#111827] truncate">
                        {rec.title}
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5 tabular-nums">
                        {f.trashedAt(formatDateLabelDisplay(rec.trashedAt || '刚刚', language))} · {rec.durationLabel} ·{' '}
                        {rec.trashedCloud && !rec.trashed
                          ? f.trashCloudBadge
                          : rec.trashedLocal && !rec.trashed
                          ? f.trashLocalBadge
                          : rec.location === 'cloud'
                          ? f.cloudBadge
                          : f.localBadge}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onRestoreRecording(rec.id)}
                        className="h-8 px-2.5 rounded-lg bg-[#EEF3FF] hover:bg-[#E0EAFF] text-xs font-semibold text-[#1668FF] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{c.restore}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onPermanentDeleteRecording(rec.id)}
                        aria-label={f.deleteForeverAria}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-[#E53935] flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetWrapper>
      )}

      {/* 9. Log Out Confirmation Sheet */}
      {activeSheet === 'logout' && (
        <SheetWrapper
          title={t.logout}
          subtitle={`${pr.logoutCurrentPrefix}${userProfile.userEmail || userProfile.userPhone}`}
          closeLabel={pr.closeAria}
          onClose={() => onSetActiveSheet(null)}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F6F8FC] border border-[#E5ECF5] text-xs text-[#64748B] leading-relaxed">
              {pr.logoutDesc}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSetActiveSheet(null)}
                className="flex-1 h-11 rounded-xl border border-[#E2E8F2] bg-white hover:bg-zinc-50 text-xs font-semibold text-[#111827] cursor-pointer"
              >
                {c.cancel}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 h-11 rounded-xl bg-[#1668FF] hover:bg-[#0D59EB] text-white text-xs font-semibold cursor-pointer"
              >
                {pr.confirmLogoutBtn}
              </button>
            </div>
          </div>
        </SheetWrapper>
      )}

      {/* 11. Delete Account Sheet */}
      {activeSheet === 'deleteAccount' && (
        <SheetWrapper
          title={t.deleteAccount}
          subtitle={pr.deleteSheetSub}
          closeLabel={pr.closeAria}
          onClose={() => onSetActiveSheet(null)}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D93025]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{pr.deleteWarnHeading}</span>
              </div>
              <ul className="text-xs text-[#64748B] space-y-1 pl-6 list-disc leading-relaxed">
                <li>{pr.deleteWarnCredits(userProfile.credits)}</li>
                <li>{pr.deleteWarnFiles}</li>
                <li>{pr.deleteWarnCard(device.bound !== false ? device.name : pr.noBoundCardName)}</li>
              </ul>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-[#111827] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deleteAck}
                onChange={(e) => setDeleteAck(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-[#E53935] focus:ring-[#E53935]"
              />
              <span>{pr.deleteConfirmAck}</span>
            </label>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#64748B]">
                {pr.deleteConfirmPromptPrefix}
                <span className="font-mono font-semibold text-[#111827]">{pr.deleteConfirmKeyword}</span>
                {pr.deleteConfirmPromptSuffix}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={pr.deleteConfirmPlaceholder}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#E53935]"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onSetActiveSheet(null)}
                className="flex-1 h-11 rounded-xl border border-[#E2E8F2] bg-white hover:bg-zinc-50 text-xs font-semibold text-[#111827] cursor-pointer"
              >
                {pr.cancelDeleteAccount}
              </button>
              <button
                type="button"
                disabled={
                  !deleteAck ||
                  (deleteConfirmText.trim() !== pr.deleteConfirmKeyword &&
                    deleteConfirmText.trim() !== '确认注销')
                }
                onClick={onDeleteAccount}
                className="flex-1 h-11 rounded-xl bg-[#E53935] hover:bg-[#C62828] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold cursor-pointer transition-opacity"
              >
                {pr.confirmDeleteBtn}
              </button>
            </div>
          </div>
        </SheetWrapper>
      )}
    </div>
  );
};

const SheetWrapper: React.FC<{
  title: string;
  subtitle?: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, closeLabel, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-[440px] bg-white rounded-t-3xl border-t border-zinc-200 px-5 pt-3 pb-6 shadow-2xl max-h-[86%] overflow-y-auto thin-scrollbar"
    >
      <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto mb-3" />
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-display font-bold text-[#111113]">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="w-11 h-11 -mr-2 -mt-1 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);
