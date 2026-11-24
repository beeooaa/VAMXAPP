import { AppLanguage, FolderItem, SummaryTemplate } from '../types/vamx';

export interface UiStrings {
  common: {
    allFiles: string;
    unfiled: string;
    close: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    restore: string;
    rename: string;
    move: string;
    exportBtn: string;
    copy: string;
    copied: string;
    retry: string;
    justNow: string;
    itemsUnit: string;
    minutesUnit: string;
    speakerDefault: string;
    speakerN: (n: number) => string;
    phoneFileDate: string;
    localImportDate: string;
    linkImportDate: string;
    commentsImportDate: string;
    cardFastSyncDate: string;
  };
  auth: {
    deletedTitle: string;
    signedOutTitle: string;
    deletedDesc: string;
    signedOutDesc: string;
    reRegisterTitle: string;
    welcomeBackTitle: string;
    phoneOrEmailLabel: string;
    phoneOrEmailPlaceholder: string;
    passwordLabel: string;
    passwordOptionalLabel: string;
    passwordSetPlaceholder: string;
    passwordEnterPlaceholder: string;
    createNewAccountBtn: string;
    signInBtn: string;
    restoreDemoAccountBtn: string;
    footerTip: string;
    errEmptyAccount: string;
    errEmptyPassword: string;
    toastCreated: string;
    toastSignedIn: string;
    tagline: string;
    deletedBanner: string;
    emailOrPhoneInputLabel: string;
    loginPwdPlaceholder: string;
    registerAndSignIn: string;
    signInVamx: string;
    quickContinueWith: (acct: string) => string;
    restoreDemoExperience: string;
    errEmptyPwd: string;
    toastWelcomeBack: (acct: string) => string;
    toastResignedIn: (acct: string) => string;
  };
  sidebar: {
    modeMobile: string;
    modeDesktop: string;
    recordingNow: string;
    unboundDevice: string;
    tapToBind: string;
    battery: (pct: number) => string;
  };
  files: {
    multiSelect: string;
    cancelMultiSelect: string;
    selectAll: string;
    deselectAll: string;
    selectedCount: (n: number) => string;
    batchMove: string;
    batchDelete: string;
    askVamx: string;
    fastSyncBanner: (deviceName: string) => string;
    fastSyncing: string;
    fastSync: string;
    trashBanner: (count: number) => string;
    emptyTrashBtn: string;
    emptyTrashTitle: string;
    emptyFilesTitle: string;
    emptySearchHint: string;
    emptyFolderHint: string;
    clearSearchBtn: string;
    trashedAt: (at?: string) => string;
    generatingStatus: string;
    failedStatus: string;
    retryingBadge: string;
    noSelectionDesktop: string;
    openMenuAria: (title: string) => string;
    backToList: string;
    clearSearchAria: string;
    trashedHint: string;
    emptyTrashAction: string;
    emptyTrashDesc: string;
    emptyFilesDesc: string;
    backToAllFiles: string;
    trashBothBadge: string;
    trashCloudBadge: string;
    trashLocalBadge: string;
    cloudBadge: string;
    localBadge: string;
    deleteForeverAria: string;
    headerDeviceAria: string;
    headerSearchAria: string;
    headerProfileAria: string;
    desktopBackToMobile: string;
  };
  toolbox: {
    askVamxDynamicSub: (count: number) => string;
    liveTranslateCardSub: string;
    roomsLiveSub: (count: number) => string;
    roomsIdleSub: string;
    importAudioCardSub: string;
    templatesCountSub: (count: number) => string;
    cardUnboundSub: string;
    cardPendingSub: (name: string, pending: number) => string;
    cardSyncedSub: (name: string, total: number) => string;
    pendingBadge: (count: number) => string;
    dockNavAria: string;
    dockRecordActiveAria: string;
    dockRecordStartAria: string;
  };
  sheets: {
    deviceTitle: string;
    cardFilesBtn: string;
    liveTranslateBtn: string;
    unboundTitle: string;
    startRecord: string;
    recordingInProgress: string;
    bindCardNow: string;
    scanningNearby: string;
    selectNearbyPrompt: string;
    connectThisCard: string;
    batteryLabel: string;
    storageLabel: string;
    usbReadLabel: string;
    phoneLocalAudio: string;
    selectPhoneAudio: string;
    cardFilesTitle: string;
    cardFilesCount: (n: number) => string;
    refresh: string;
    unbind: string;
    folderSheetTitle: string;
    statusSection: string;
    foldersSection: string;
    deletedSection: string;
    newFolderBtn: string;
    rowMenuRenameLabel: string;
    renamePlaceholder: string;
    moveToFolder: string;
    backupToCloud: string;
    deleteLocalCopy: string;
    deleteCloudCopy: string;
    batchMoveTitle: (n: number) => string;
    newFolderTitle: string;
    newFolderPlaceholder: string;
    createBtn: string;
    deviceManageTitle: string;
    unboundCardLabel: string;
    viewLiveRecStatus: string;
    startCardDirectRec: string;
    usePhoneMicRec: string;
    statusUnbound: string;
    statusConnected: string;
    statusDisconnected: string;
    firmwareLabel: string;
    cardStorageLabel: string;
    reconnect: string;
    disconnect: string;
    unbindDevice: string;
    scanningVamxCards: string;
    nearbyVamxCards: string;
    collapse: string;
    bleSearching: string;
    bindAndConnect: string;
    scanNearbyDevices: string;
    scanNoDeviceHint: string;
    selectPhoneAudioFull: string;
    trashLabel: string;
    rowRenameBtn: string;
    rowRenamePlaceholder: string;
    createFolderBtn: string;
  };
  toasts: {
    usingPhoneMic: string;
    scannedOneNew: string;
    refreshedPending: (n: number) => string;
    fastSyncImported: (n: number) => string;
    fastSyncDone: string;
    savedLiveRecording: (title: string) => string;
    liveRecTitlePrefix: string;
    createdFolder: (name: string) => string;
    retriedRecording: (title: string) => string;
    deletedLocalAndTrashed: string;
    deletedCloudAndTrashed: string;
    deletedLocalKeptCloud: string;
    deletedCloudKeptLocal: string;
    restoredFromTrash: string;
    permanentlyDeleted: string;
    emptiedTrash: string;
    resetAllDone: string;
    loggedOut: string;
    accountDeleted: string;
    importedFromPhone: (name: string) => string;
    bindCardFirst: string;
    connectedAndSwitchedCard: (name: string) => string;
    switchedToCard: (name: string) => string;
    switchedToPhone: string;
    startedNewChat: string;
    jumpedToAudio: (time: string) => string;
    deviceUnbound: string;
    usbEnabled: string;
    usbDisabled: string;
    boundCard: (name: string) => string;
    renamedTo: (name: string) => string;
    movedToFolder: (name: string) => string;
    uploadedToCloud: (title: string) => string;
    batchMoved: (count: number, folderName: string) => string;
    batchDeleted: (count: number) => string;
    exportedLiveTranslation: (title: string) => string;
    translatedBlockPrefix: string;
    endTranslation: string;
    pipEnabled: string;
    readingAloud: string;
    selectOrBindCard: string;
    disconnectedDevice: string;
    reconnectedDevice: (name: string) => string;
    unboundDevice: (name: string) => string;
    cancelledRecording: string;
    insertedLiveNote: string;
    transferResumed: string;
    defaultUserName: string;
    renamedRecording: string;
    backedUpToCloud: string;
    switchedZh: string;
    switchedEn: string;
    switchedVi: string;
  };
  waveform: {
    pauseAria: string;
    playAria: string;
    sliderAria: string;
    rewind10Aria: string;
    forward10Aria: string;
    markTitle: string;
    markBtn: string;
    exportAria: string;
  };
  deviceVisual: {
    stopHwRecTitle: string;
    startHwRecTitle: string;
    stopHwRecAria: string;
    startHwRecAria: string;
  };
  profile: {
    workspaceSub: string;
    preferencesSub: string;
    accountSub: string;
    creditsAvailable: (n: number) => string;
    boundStatus: (name: string) => string;
    unboundStatus: string;
    transferPending: (pending: number) => string;
    transferTotal: (total: number) => string;
    automationEnabled: (enabled: number) => string;
    templatesCount: (n: number) => string;
    trashRecoverable: (n: number) => string;
    trashEmpty: string;
    emailOrPhoneUnbound: string;
    resetBtn: string;
    resetConfirmTitle: string;
    resetConfirmBtn: string;
    footerMotto: string;
    // Automation sheet
    autoImportTitle: string;
    autoImportDesc: string;
    autoUploadTitle: string;
    autoUploadDesc: string;
    autoTranscribeTitle: string;
    autoTranscribeDesc: string;
    autoSummaryTitle: string;
    autoSummaryDesc: string;
    wifiOnlyTitle: string;
    wifiOnlyDesc: string;
    defaultTemplateLabel: string;
    // Templates sheet
    newTemplateBtn: string;
    defaultBadge: string;
    useAsDefaultBtn: string;
    customBadge: string;
    createTemplateModalTitle: string;
    templateNameLabel: string;
    templateNamePlaceholder: string;
    templateDescLabel: string;
    templateDescPlaceholder: string;
    templateToneLabel: string;
    toneIndigo: string;
    toneAmber: string;
    toneEmerald: string;
    toneSlate: string;
    createTemplateSubmit: string;
    toastTemplateCreated: (name: string) => string;
    toastDefaultTemplateUpdated: string;
    // Device sheet
    noCardTitle: string;
    noCardDesc: string;
    scanNearbyBtn: string;
    discoveredDevices: string;
    bindThisBtn: string;
    connectedBadge: string;
    disconnectedBadge: string;
    protocolLabel: string;
    batteryLabel: string;
    storageLabel: string;
    firmwareLabel: string;
    macLabel: string;
    toggleUsb: string;
    reconnectBtn: string;
    disconnectBtn: string;
    cardFilesCardBtn: string;
    phonePickerCardBtn: string;
    switchCardBtn: string;
    unbindCardBtn: string;
    toastBound: (name: string) => string;
    toastUsbToggled: (on: boolean) => string;
    toastReconnected: string;
    toastDisconnected: string;
    toastUnbound: string;
    // Transfers sheet
    retryAllFailed: (n: number) => string;
    noTransfers: string;
    failedStatus: string;
    completedStatus: string;
    pausedStatus: string;
    uploadingStatus: (pct: number) => string;
    // Credits sheet
    remainingMinutes: (mins: number) => string;
    checkedInToday: string;
    dailyCheckIn: string;
    creditRuleTitle: string;
    creditRule1: string;
    creditRule2: string;
    creditRule3: string;
    toastCheckedIn: string;
    // Profile edit sheet
    displayNameLabel: string;
    displayNamePlaceholder: string;
    emailLabel: string;
    phoneLabel: string;
    uploadAvatarBtn: string;
    removeAvatarBtn: string;
    avatarFileHint: string;
    avatarInvalidFile: string;
    avatarTooLarge: string;
    saveProfileBtn: string;
    toastProfileEmpty: string;
    toastProfileSaved: string;
    // Password sheet
    currentPwdLabel: string;
    currentPwdPlaceholder: string;
    newPwdLabel: string;
    newPwdPlaceholder: string;
    confirmPwdLabel: string;
    confirmPwdPlaceholder: string;
    pwdRuleHint: string;
    submitPwdBtn: string;
    toastPwdEmpty: string;
    toastPwdShort: string;
    toastPwdMismatch: string;
    toastPwdUpdated: string;
    // Trash sheet
    trashSheetCount: (n: number) => string;
    emptyAllBtn: string;
    trashEmptyState: string;
    deletedAtPrefix: string;
    deleteForeverBtn: string;
    // Logout sheet
    logoutTitle: string;
    logoutDesc: string;
    confirmLogoutBtn: string;
    // Delete account sheet
    deleteAccountTitle: string;
    deleteWarn1: string;
    deleteWarn2: string;
    deleteWarn3: string;
    deleteConfirmPromptPrefix: string;
    deleteConfirmKeyword: string;
    deleteConfirmPromptSuffix: string;
    deleteConfirmPlaceholder: string;
    confirmDeleteBtn: string;
    toastDeletedAccount: string;
    uiLanguageAria: string;
    transcribeLangAria: string;
    transcribeLangToast: (langLabel: string) => string;
    notifyEnabledToast: string;
    notifyDisabledToast: string;
    pipeImport: string;
    pipeCloud: string;
    pipeAi: string;
    automationSheetTitle: string;
    templatesSheetTitle: string;
    templatesSheetSub: string;
    createTemplateSheetSub: string;
    createTemplateDescOptional: string;
    saveTemplateBtn: string;
    closeAria: string;
    deviceSheetTitle: string;
    devUnboundSub: string;
    devConnectedSub: (protocol: string) => string;
    devDisconnectedSub: string;
    devConnectedBattery: (pct: number) => string;
    devDisconnectedBadge: string;
    devReadyToast: string;
    checkUpdateBtn: string;
    firmwareLatestToast: (ver: string) => string;
    pendingCountLabel: string;
    pendingCountValue: (n: number) => string;
    usbDesc: string;
    syncCardBtn: string;
    addDeviceBtn: string;
    rescanBtn: string;
    bleSearching: string;
    bleSearchingTitle: string;
    foundDevicesTitle: string;
    boundBadge: string;
    bindAndConnectBtn: string;
    cardBatteryShort: (pct: number) => string;
    phoneAudioLinkBtn: string;
    transfersSheetTitle: string;
    transfersSheetSub: string;
    transferInterrupted: string;
    resumeTransferBtn: string;
    creditsCurrentLabel: string;
    creditsTotalEarned: string;
    creditsCheckIn150: string;
    creditsCheckedIn150: string;
    toastCheckedIn150: string;
    creditsFreeTitle: string;
    creditsFreeDesc: string;
    creditsProTitle: string;
    creditsProDesc: string;
    creditsProPrice: string;
    creditsProToast: string;
    trashSheetTitle: string;
    trashSheetSub: string;
    trashCountLine: (n: number) => string;
    trashEmptyDesc: string;
    logoutCurrentPrefix: string;
    cancelDeleteAccount: string;
    deleteConfirmAck: string;
    noBoundCardName: string;
    deleteSheetSub: string;
    deleteWarnHeading: string;
    deleteWarnCredits: (n: number) => string;
    deleteWarnFiles: string;
    deleteWarnCard: (name: string) => string;
  };
  detail: {
    backToList: string;
    moveToFolderBtn: string;
    renameTitleAria: string;
    moreActionsAria: string;
    renamePlaceholder: string;
    folderPrefix: string;
    sourceCard: string;
    sourcePhone: string;
    sourceLink: string;
    sourceImport: string;
    localOnlyBadge: string;
    tabSummary: string;
    tabTranscript: string;
    tabNotes: string;
    tabMindmap: string;
    tabAsk: string;
    // Generation stages
    stagePreparing: string;
    stageDrafting: string;
    stagePolishing: string;
    // Summary tab
    summaryHeader: string;
    summaryTemplateSelectAria: string;
    summaryLangSelectAria: string;
    summaryAutoLanguageLabel: string;
    regenerateBtn: string;
    generatingBtn: string;
    emptySummaryTitle: string;
    emptySummaryDesc: string;
    generateSummaryBtn: string;
    sectionOverview: string;
    sectionKeyPoints: string;
    sectionDecisions: string;
    sectionActions: string;
    actionOwnerPrefix: string;
    copySummaryBtn: string;
    exportMarkdownBtn: string;
    // Transcript tab
    transcriptHeader: string;
    speakersCount: (n: number) => string;
    segmentsCount: (n: number) => string;
    searchTranscriptAria: string;
    searchTranscriptPlaceholder: string;
    mergeSpeakersBtn: string;
    separateSpeakersBtn: string;
    editSpeakersBtn: string;
    doneEditBtn: string;
    speakerPanelTitle: string;
    speakerNamePlaceholder: (id: string) => string;
    emptyTranscriptTitle: string;
    emptyTranscriptDesc: string;
    startTranscribeBtn: string;
    retranscribingStatus: string;
    noTranscriptMatch: string;
    clickToEditSpeaker: string;
    clickToJumpAudio: string;
    // Notes tab
    highlightsTitle: string;
    addHighlightHere: string;
    noHighlights: string;
    jumpTooltip: string;
    noteLabel: string;
    notePlaceholder: string;
    freeNotesTitle: string;
    freeNotesHint: string;
    freeNotesPlaceholder: string;
    // Mindmap tab
    mindmapHeader: string;
    refreshMindmapBtn: string;
    generatingMindmapBtn: string;
    emptyMindmapTitle: string;
    generateMindmapBtn: string;
    mindmapGeneratingDesc: string;
    // Ask tab
    askEmptyTitle: string;
    askQuick1: string;
    askQuick2: string;
    askQuick3: string;
    askThinking: string;
    askInputPlaceholder: string;
    askSendAria: string;
    // More / Export sheets
    renameRecordingAction: string;
    moveFolderAction: string;
    retranscribeAction: string;
    exportShareAction: string;
    deleteLocalAction: string;
    deleteCloudAction: string;
    moveSheetTitle: string;
    exportSheetTitle: string;
    exportCopySummary: string;
    exportCopySummaryDesc: string;
    exportCopyTranscript: string;
    exportCopyTranscriptDesc: string;
    exportDownloadMd: string;
    exportDownloadMdDesc: string;
    exportShareLink: string;
    exportShareLinkDesc: string;
    // Toasts & dynamic strings
    toastTitleUpdated: string;
    toastMovedFolder: (name: string) => string;
    toastAddedHighlight: (time: string) => string;
    toastMergedSpeakers: string;
    toastSeparatedSpeakers: string;
    toastSpeakerUpdated: string;
    toastSummaryReady: string;
    toastTranscriptReady: string;
    toastMindmapReady: string;
    toastCopiedSummary: string;
    toastCopiedTranscript: string;
    toastDownloadedMd: string;
    toastCopiedShareLink: string;
    toastSeekedTo: (time: string) => string;
    defaultHighlightNote: string;
    newHighlightNote: string;
    autoSummaryOverview: (tplName: string, title: string, firstLine: string) => string;
    autoSummaryKp1: (tplName: string) => string;
    autoSummaryKp2: string;
    autoSummaryKp3: string;
    autoSummaryDecision: string;
    autoSummaryAction1: string;
    autoSummaryAction2: string;
    autoActionOwner1: string;
    autoActionOwner2: string;
    autoAskResponse: (question: string, excerpt: string, firstTime: string) => string;
    autoAskDefaultExcerpt: string;
    statusTranscribed: string;
    statusProcessing: string;
    statusPending: string;
    statusFailed: string;
    miniPauseAria: string;
    miniPlayAria: string;
    miniSliderAria: string;
    pauseAudioBarAria: string;
    templatePrefix: string;
    mindmapSubtitle: string;
    askHeadline: string;
    askTagline: string;
    askHistoryCount: (n: number) => string;
    askNewChat: string;
    askSourcesHeader: string;
    askSaveToNotes: string;
    askSavedToNotesToast: string;
    askRemoveContextAria: string;
    askAttachContext: string;
    askQuickChips: string[];
    askQuickMenuAria: string;
    askVoiceAria: string;
    askDefaultPrompt1: string;
    askDefaultPrompt2: string;
    askDefaultPrompt3: string;
    deleteHighlightAria: string;
    insertTimeBtn: (time: string) => string;
    markCurrentBtn: (time: string) => string;
    highlightsHeaderCount: (n: number) => string;
    notesSavedBtn: string;
    saveNotesBtn: string;
    toastNotesSaved: string;
    toastUploadedCloud: string;
    moreTitle: string;
    closeMenuAria: string;
    downloadTxt: string;
    downloadPdf: string;
    downloadWord: string;
    noLocalCopy: string;
    noCloudCopy: string;
    toastDownloadedTxt: string;
    toastDownloadedDoc: string;
    toastDownloadedPdf: string;
    confirmSpeakerBtn: string;
    speakerInputPlaceholder: string;
    diarizedSpeakersCount: (n: number) => string;
    noDiarizationLabel: string;
    summaryCardEmptyHeadline: string;
    mindmapEmptySubtitle: string;
    stageReadingAudio: string;
    stageDistillingTpl: (tpl: string) => string;
    stagePolishingActions: string;
  };
  ai: {
    title: string;
    subtitle: string;
    historyAria: string;
    newChatAria: string;
    emptyTitle: string;
    emptyDesc: string;
    prompts: string[];
    searchingStatus: (n: number) => string;
    citationsLabel: string;
    scopeAria: string;
    scopeAll: string;
    scopeFolder: (name: string) => string;
    inputPlaceholder: string;
    sendAria: string;
    disclaimer: string;
    historyTitle: string;
    closeHistoryAria: string;
    historyItems: Array<{ title: string; time: string }>;
    replyHeader: (n: number, body: string) => string;
    replyNoMatch: string;
  };
  rooms: {
    title: string;
    subtitle: string;
    joinBtn: string;
    createBtn: string;
    statTotal: string;
    statLive: string;
    statListeners: string;
    searchPlaceholder: string;
    trashToggleAria: string;
    densityToggleAria: string;
    tabAll: string;
    tabLive: string;
    tabUpcoming: string;
    tabPaused: string;
    tabEnded: string;
    statusLive: string;
    statusPaused: string;
    statusUpcoming: string;
    statusEnded: string;
    emptyTrash: string;
    emptyState: string;
    emptyCreateHint: string;
    listenersCount: (n: number) => string;
    enterLive: string;
    viewDetail: string;
    restoredRoom: string;
    trashedRoom: string;
    restoreAria: string;
    trashAria: string;
    createModalTitle: string;
    topicLabel: string;
    roomTitlePlaceholder: string;
    sourceLangLabel: string;
    targetLangLabel: string;
    createModalSubmit: string;
    joinModalTitle: string;
    joinCodePlaceholder: string;
    joinModalSubmit: string;
    inviteCodePrefix: string;
    directionLabel: string;
    totalListenersLabel: string;
    personsCount: (n: number) => string;
    copyInviteBtn: string;
    enterWorkbenchBtn: string;
    untitledRoom: string;
    invitedRoomPrefix: string;
    toastCreated: (title: string) => string;
    toastJoined: (title: string) => string;
    toastJoinedCode: (code: string) => string;
    toastCopyInvite: (code: string) => string;
  };
  translate: {
    backAria: string;
    title: string;
    switchSuffix: string;
    sourceLangAria: string;
    targetLangAria: string;
    swapLangAria: string;
    settingsAria: string;
    modeBilingualShort: string;
    modeSourceShort: string;
    modeTargetShort: string;
    pipBtn: string;
    pipActiveBtn: string;
    readAloud: string;
    listeningVia: (src: string) => string;
    receivingAudio: string;
    pausedAudio: string;
    sourceCard: string;
    sourcePhone: string;
    pauseCapture: string;
    resumeCapture: string;
    endAndSave: string;
    settingsTitle: string;
    closeSettingsAria: string;
    tabTranslate: string;
    tabTts: string;
    tabDevice: string;
    onlySourceTitle: string;
    onlySourceDesc: string;
    industryLabel: string;
    defaultIndustry: string;
    keywordsLabel: string;
    defaultKeywords: string;
    autoSpeakTitle: string;
    autoSpeakDesc: string;
    ttsRateLabel: string;
    chooseSourceLabel: string;
    phoneMicTitle: string;
    phoneMicDesc: string;
    cardBoundTitle: (name: string) => string;
    cardUnboundTitle: string;
    cardUnboundDesc: string;
    cardConnectedDesc: (pct: number) => string;
    cardDisconnectedDesc: string;
    doneBtn: string;
    settingsSavedToast: string;
    pipSourceToggle: string;
    pipExpandAria: string;
    pipCloseAria: string;
    pipPlayAria: string;
    pipPauseAria: string;
    pipCardSource: (name: string) => string;
    pipPhoneSource: string;
  };
  liveRecord: {
    statusRecording: string;
    statusPaused: string;
    cancel: string;
    sourceCard: (name: string) => string;
    sourcePhone: string;
    pausedNotice: string;
    promptCard: string;
    promptPhone: string;
    noteBtn: string;
    translateBtn: string;
    markedFeedback: string;
    markHighlightBtn: string;
    saveAria: string;
    saveLabel: string;
    resumeAria: string;
    pauseAria: string;
    resumeLabel: string;
    pauseLabel: string;
    drawerTitle: string;
    drawerCancel: string;
    drawerPlaceholder: (time: string) => string;
    drawerAddBtn: string;
    quickTags: string[];
    defaultHighlightPrefix: string;
  };
  importSheet: {
    menuTitle: string;
    closeMenuAria: string;
    optComments: string;
    optCommentsSub: string;
    optLocal: string;
    optLocalSub: string;
    optLink: string;
    optLinkSub: string;
    optRecord: string;
    optRecordSub: string;
    linkTitle: string;
    linkHeading: string;
    linkDesc: string;
    linkLabel: string;
    fillExample: string;
    linkPlaceholder: string;
    linkInvalidErr: string;
    targetLangLabel: string;
    folderLabel: string;
    diarizeLabel: string;
    processingBtn: string;
    linkSubmit: string;
    localTitle: string;
    localHeading: string;
    localDesc: string;
    localAudioLabel: string;
    localPickBtn: string;
    localNoFile: string;
    localHint: string;
    localSubmitting: string;
    localSubmit: string;
    commentsTitle: string;
    commentsHeading: string;
    commentsDesc: string;
    commentsInputLabel: string;
    commentsPlaceholder: string;
    commentsInvalidErr: string;
    commentsDiarizeLabel: string;
    commentsDownloadOnly: string;
    commentsDownloadAudio: string;
    commentsSubmitting: string;
    commentsSubmit: string;
    deviceTitle: string;
    deviceUnboundStatus: string;
    deviceConnectedStatus: (name: string, pending: number, imported: number) => string;
    deviceOfflineStatus: string;
    importAllBtn: string;
    importOneBtn: string;
    closeImportAria: string;
    tabAll: (n: number) => string;
    tabPending: (n: number) => string;
    tabImported: (n: number) => string;
    searchCardPlaceholder: string;
    refreshCardAria: string;
    emptyCardFiles: string;
    pendingBadge: string;
    importedBadge: string;
    importBtn: string;
    openMenuFooterBtn: string;
    justImportedDate: string;
    justImportedLocalDate: string;
    justImportedLinkDate: string;
    justImportedCommentsDate: string;
    toastCardImported: (name: string) => string;
    toastCardBatch: (n: number) => string;
    toastLocalImported: (name: string) => string;
    toastLinkImported: (platform: string) => string;
    toastCommentsAudioDone: string;
    toastCommentsOnlyDone: string;
  };
}

export const UI_STRINGS: Record<AppLanguage, UiStrings> = {
  zh: {
    common: {
      allFiles: '全部文件',
      unfiled: '未分类',
      close: '关闭',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      restore: '恢复',
      rename: '重命名',
      move: '移动',
      exportBtn: '导出',
      copy: '复制',
      copied: '已复制',
      retry: '重试',
      justNow: '刚刚',
      itemsUnit: '条',
      minutesUnit: '分钟',
      speakerDefault: '说话人',
      speakerN: (n) => `说话人 ${n}`,
      phoneFileDate: '手机文件',
      localImportDate: '本地导入',
      linkImportDate: '链接导入',
      commentsImportDate: '评论音频',
      cardFastSyncDate: '刚刚 · 录音卡快传',
    },
    auth: {
      deletedTitle: '账号已永久注销',
      signedOutTitle: '已退出当前账号',
      deletedDesc: '你之前的本地与云端记录已清空，可随时重新注册或恢复初始示例体验。',
      signedOutDesc: '重新登录后即可继续访问你的录音文件、总结模板与设备同步状态。',
      reRegisterTitle: '重新注册 / 登录 VAMX',
      welcomeBackTitle: '欢迎回到 VAMX',
      phoneOrEmailLabel: '手机号 / 邮箱',
      phoneOrEmailPlaceholder: '请输入手机号或邮箱',
      passwordLabel: '登录密码',
      passwordOptionalLabel: '密码（可选）',
      passwordSetPlaceholder: '请设置登录密码',
      passwordEnterPlaceholder: '请输入密码或留空免密体验',
      createNewAccountBtn: '创建新账号并进入',
      signInBtn: '立即登录',
      restoreDemoAccountBtn: '恢复初始示例账号与数据',
      footerTip: '所有数据与偏好配置均安全存储在本地工作区',
      errEmptyAccount: '请输入手机号或邮箱',
      errEmptyPassword: '请设置登录密码',
      toastCreated: '已注册并登录新账号',
      toastSignedIn: '欢迎回来，已登录',
      tagline: '让每一次对话，都有所收获',
      deletedBanner: '原账号已永久注销并清空全部数据，您可以使用新账号登录或恢复体验数据。',
      emailOrPhoneInputLabel: '邮箱 / 手机号',
      loginPwdPlaceholder: '输入登录密码',
      registerAndSignIn: '注册并登录',
      signInVamx: '登录 VAMX',
      quickContinueWith: (acct) => `一键继续使用 ${acct}`,
      restoreDemoExperience: '恢复初始示例数据体验',
      errEmptyPwd: '请输入登录密码',
      toastWelcomeBack: (acct) => `欢迎回来，${acct}`,
      toastResignedIn: (acct) => `已重新登录 ${acct}`,
    },
    sidebar: {
      modeMobile: 'VAMX 移动端',
      modeDesktop: '桌面宽屏',
      recordingNow: '正在录音中',
      unboundDevice: '未绑定设备',
      tapToBind: '点击绑定',
      battery: (pct) => `电量 ${pct}%`,
    },
    files: {
      multiSelect: '多选',
      cancelMultiSelect: '取消多选',
      selectAll: '全选',
      deselectAll: '取消全选',
      selectedCount: (n) => `已选 ${n} 条`,
      batchMove: '移动',
      batchDelete: '删除',
      askVamx: '问 VAMX',
      fastSyncBanner: (name) => `正在从 ${name} 传输录音至 App…`,
      fastSyncing: '快传中…',
      fastSync: '快传',
      trashBanner: (count) => `回收站 (${count})`,
      emptyTrashBtn: '清空',
      emptyTrashTitle: '回收站为空',
      emptyFilesTitle: '未找到匹配文件',
      emptySearchHint: '尝试清除搜索关键词或切换筛选范围',
      emptyFolderHint: '点击右上角导入，或使用下方蓝色按钮开始录音',
      clearSearchBtn: '清除搜索条件',
      trashedAt: (at) => `删除于 ${at || '刚刚'}`,
      generatingStatus: '生成中…',
      failedStatus: '处理失败',
      retryingBadge: '点击重试',
      noSelectionDesktop: '选择任意一条录音，立即查看声波、转写与 AI 纪要',
      openMenuAria: (title) => `操作 ${title}`,
      backToList: '返回列表',
      clearSearchAria: '清空搜索',
      trashedHint: '已删除的录音保留在此，支持恢复或彻底删除',
      emptyTrashAction: '清空回收站',
      emptyTrashDesc: '删除云端或本机录音后，文件会暂存在这里以便误删恢复',
      emptyFilesDesc: '尝试切换文件夹、清空搜索或点击底部蓝色按钮录制新音频',
      backToAllFiles: '返回全部文件',
      trashBothBadge: '本机 · 云端',
      trashCloudBadge: '云端副本',
      trashLocalBadge: '本机副本',
      cloudBadge: '云端',
      localBadge: '本机',
      deleteForeverAria: '彻底删除',
      headerDeviceAria: '录音卡状态与快捷管理',
      headerSearchAria: '搜索或问 AI',
      headerProfileAria: '个人中心',
      desktopBackToMobile: '返回手机端视图',
    },
    toolbox: {
      askVamxDynamicSub: (count) => `跨 ${count} 条录音对比结论、提取待办并溯源原声`,
      liveTranslateCardSub: '双语字幕与语音播报',
      roomsLiveSub: (count) => `${count} 个房间在线`,
      roomsIdleSub: '多人跨语种房间',
      importAudioCardSub: '评论 · 本地 · 链接 · 录音',
      templatesCountSub: (count) => `${count} 套结构化纪要模板`,
      cardUnboundSub: '未绑定录音卡 · 点击管理或导入',
      cardPendingSub: (name, pending) => `${name} · ${pending} 个文件待导入`,
      cardSyncedSub: (name, total) => `${name} · 共 ${total} 个已同步`,
      pendingBadge: (count) => `${count} 待导`,
      dockNavAria: '主导航',
      dockRecordActiveAria: '查看实时录音',
      dockRecordStartAria: '立即开始录音',
    },
    sheets: {
      deviceTitle: '我的设备',
      cardFilesBtn: '卡内文件',
      liveTranslateBtn: '实时翻译',
      unboundTitle: '未绑定录音卡',
      startRecord: '开始录音',
      recordingInProgress: '正在录音 · 点击查看',
      bindCardNow: '立即绑定录音卡',
      scanningNearby: '正在搜索附近蓝牙录音卡…',
      selectNearbyPrompt: '请选择要绑定的设备：',
      connectThisCard: '连接此卡',
      batteryLabel: '电量',
      storageLabel: '可用空间',
      usbReadLabel: 'U 盘模式读取',
      phoneLocalAudio: '手机本机音频',
      selectPhoneAudio: '选择文件',
      cardFilesTitle: '录音卡文件',
      cardFilesCount: (n) => `${n} 个文件`,
      refresh: '刷新',
      unbind: '解绑',
      folderSheetTitle: '筛选与文件夹',
      statusSection: '文件状态',
      foldersSection: '我的文件夹',
      deletedSection: '已删除文件',
      newFolderBtn: '新建文件夹',
      rowMenuRenameLabel: '重命名',
      renamePlaceholder: '输入录音名称',
      moveToFolder: '移动到文件夹',
      backupToCloud: '备份上传至云端',
      deleteLocalCopy: '删除 · 本机副本',
      deleteCloudCopy: '删除云端副本',
      batchMoveTitle: (n) => `移动 ${n} 条录音至`,
      newFolderTitle: '新建文件夹',
      newFolderPlaceholder: '输入文件夹名称…',
      createBtn: '创建',
      deviceManageTitle: '管理设备录音文件',
      unboundCardLabel: '未绑定录音卡',
      viewLiveRecStatus: '查看实时录音状态',
      startCardDirectRec: '开始录音卡直录',
      usePhoneMicRec: '使用手机麦克风录音',
      statusUnbound: '未绑定',
      statusConnected: '已连接',
      statusDisconnected: '已断开',
      firmwareLabel: '固件版本',
      cardStorageLabel: '卡片已用 / 总容量',
      reconnect: '重新连接',
      disconnect: '断开连接',
      unbindDevice: '解除本机绑定',
      scanningVamxCards: '正在扫描附近的 VAMX 录音卡…',
      nearbyVamxCards: '附近的 VAMX 录音卡',
      collapse: '收起',
      bleSearching: '蓝牙搜索中…',
      bindAndConnect: '绑定并连接',
      scanNearbyDevices: '扫描附近设备',
      scanNoDeviceHint: '尚未发现录音卡，请确认设备已开机、靠近手机且没有被其他应用占用。',
      selectPhoneAudioFull: '从手机选择音频文件',
      trashLabel: '回收站',
      rowRenameBtn: '重命名',
      rowRenamePlaceholder: '修改录音标题…',
      createFolderBtn: '创建文件夹',
    },
    toasts: {
      usingPhoneMic: '将使用手机麦克风开始实时录音',
      scannedOneNew: '已扫描录音卡，发现 1 条待导入新录音',
      refreshedPending: (n) => `已刷新，当前共 ${n} 条未导入录音`,
      fastSyncImported: (n) => `已快传导入 ${n} 条卡内录音并归档`,
      fastSyncDone: '已完成录音卡快传与云端归档',
      savedLiveRecording: (title) => `已保存「${title}」`,
      liveRecTitlePrefix: '实时录音',
      createdFolder: (name) => `已创建文件夹「${name}」`,
      retriedRecording: (title) => `已重新转写 ${title}`,
      deletedLocalAndTrashed: '已删除本机文件并移入回收站',
      deletedCloudAndTrashed: '已将云端文件移入回收站，可在「全部文件 ▾」或「我的」中恢复',
      deletedLocalKeptCloud: '已删除本机副本并移入回收站，云端副本仍保留',
      deletedCloudKeptLocal: '已删除云端副本并移入回收站，本机副本仍保留',
      restoredFromTrash: '已从回收站恢复录音',
      permanentlyDeleted: '已彻底删除回收站副本',
      emptiedTrash: '已清空回收站',
      resetAllDone: '已恢复所有初始示例数据',
      loggedOut: '已退出当前账号',
      accountDeleted: '账号已永久注销，相关数据已清空',
      importedFromPhone: (name) => `已从手机导入「${name}」`,
      bindCardFirst: '请先绑定 VAMX 录音卡后再切换录音卡收音',
      connectedAndSwitchedCard: (name) => `已连接 ${name} 并切换为录音卡收音`,
      switchedToCard: (name) => `已切换为 ${name} 录音卡收音`,
      switchedToPhone: '已切换为本机麦克风收音',
      startedNewChat: '已开启新对话',
      jumpedToAudio: (time) => `已定位至原声 ${time}`,
      deviceUnbound: '已解除录音卡绑定',
      usbEnabled: '已开启 U 盘模式读取',
      usbDisabled: '已关闭 U 盘模式读取',
      boundCard: (name) => `已绑定 ${name}`,
      renamedTo: (name) => `已重命名为「${name}」`,
      movedToFolder: (name) => `已移动至「${name}」`,
      uploadedToCloud: (title) => `已上传「${title}」至云端`,
      batchMoved: (count, folderName) => `已将 ${count} 条录音移动至「${folderName}」`,
      batchDeleted: (count) => `已将 ${count} 条录音移入回收站`,
      exportedLiveTranslation: (title) => `已导出「${title}」至文件库`,
      translatedBlockPrefix: '实时翻译记录',
      endTranslation: '已结束实时翻译',
      pipEnabled: '已悬浮画中画字幕，切换页面仍可继续观看与拖动',
      readingAloud: '正在朗读译文',
      selectOrBindCard: '请先选择并绑定录音卡，或使用手机麦克风录音',
      disconnectedDevice: '已断开设备连接',
      reconnectedDevice: (name) => `已重新连接 ${name}`,
      unboundDevice: (name) => `已解除与 ${name} 的本机绑定`,
      cancelledRecording: '已取消本次录音',
      insertedLiveNote: '已插入时间戳笔记',
      transferResumed: '文件已续传完成',
      defaultUserName: 'VAMX 用户',
      renamedRecording: '已重命名录音',
      backedUpToCloud: '已备份上传至云端',
      switchedZh: '已切换为简体中文',
      switchedEn: 'Switched to English',
      switchedVi: 'Đã chuyển sang Tiếng Việt',
    },
    waveform: {
      pauseAria: '暂停播放',
      playAria: '开始播放',
      sliderAria: '音频进度条',
      rewind10Aria: '快退 10 秒',
      forward10Aria: '快进 10 秒',
      markTitle: '在当前时间标记重点',
      markBtn: '标重点',
      exportAria: '导出或分享',
    },
    deviceVisual: {
      stopHwRecTitle: '停止硬件录音',
      startHwRecTitle: '一键触发硬件录音',
      stopHwRecAria: '停止硬件录音',
      startHwRecAria: '开始快速录音',
    },
    profile: {
      workspaceSub: '管理你的积分、录音卡、自动化规则与模板',
      preferencesSub: '界面语言、转写引擎与通知偏好',
      accountSub: '登录账号与数据安全操作',
      creditsAvailable: (n) => `${n.toLocaleString()} 可用`,
      boundStatus: (name) => `${name} · 已绑定`,
      unboundStatus: '未绑定',
      transferPending: (n) => `${n} 项待处理`,
      transferTotal: (n) => `共 ${n} 条`,
      automationEnabled: (n) => `已开启 ${n} 项`,
      templatesCount: (n) => `${n} 个模板`,
      trashRecoverable: (n) => `${n} 条可恢复`,
      trashEmpty: '空',
      emailOrPhoneUnbound: '未绑定',
      resetBtn: '恢复初始示例数据',
      resetConfirmTitle: '确认恢复初始示例数据？',
      resetConfirmBtn: '确认恢复',
      footerMotto: 'VAMX · 让每一次对话，都有所收获。',
      autoImportTitle: '连接后自动导入录音卡文件',
      autoImportDesc: '蓝牙与 Wi-Fi 快传就绪后自动拉取卡内新录音',
      autoUploadTitle: '自动上传至 VAMX 云端',
      autoUploadDesc: '备份音频并同步跨端转写与 AI 纪要',
      autoTranscribeTitle: '上传后自动开始语音转写',
      autoTranscribeDesc: '支持说话人区分与多语种自动识别',
      autoSummaryTitle: '转写完成后自动生成 AI 总结',
      autoSummaryDesc: '按下方默认模板提取核心要点、决策与待办',
      wifiOnlyTitle: '仅在 Wi-Fi 下执行批量上传',
      wifiOnlyDesc: '节省蜂窝网络流量',
      defaultTemplateLabel: '默认总结模板',
      newTemplateBtn: '新建自定义模板',
      defaultBadge: '默认',
      useAsDefaultBtn: '设为默认',
      customBadge: '自定义',
      createTemplateModalTitle: '新建总结模板',
      templateNameLabel: '模板名称',
      templateNamePlaceholder: '例如：产品周会 / 投资复盘',
      templateDescLabel: '结构说明',
      templateDescPlaceholder: '描述该模板侧重提炼哪些章节或重点…',
      templateToneLabel: '视觉色调',
      toneIndigo: '深海蓝',
      toneAmber: '琥珀金',
      toneEmerald: '森系绿',
      toneSlate: '石墨灰',
      createTemplateSubmit: '创建并使用',
      toastTemplateCreated: (name) => `已创建模板「${name}」`,
      toastDefaultTemplateUpdated: '已更新默认模板',
      noCardTitle: '暂未绑定 VAMX 录音卡',
      noCardDesc: '可扫描绑定蓝牙硬件录音卡，或先使用手机麦克风与本地音频。',
      scanNearbyBtn: '扫描附近录音卡',
      discoveredDevices: '发现附近设备：',
      bindThisBtn: '立即绑定',
      connectedBadge: '已连接',
      disconnectedBadge: '未连接',
      protocolLabel: '连接协议',
      batteryLabel: '剩余电量',
      storageLabel: '卡内存储',
      firmwareLabel: '固件版本',
      macLabel: '设备 MAC',
      toggleUsb: 'U 盘模式读取卡内文件',
      reconnectBtn: '重新连接设备',
      disconnectBtn: '断开蓝牙连接',
      cardFilesCardBtn: '管理卡内录音',
      phonePickerCardBtn: '导入手机音频',
      switchCardBtn: '更换录音卡',
      unbindCardBtn: '解除绑定',
      toastBound: (name) => `已绑定并连接 ${name}`,
      toastUsbToggled: (on) => (on ? '已开启 U 盘读取模式' : '已关闭 U 盘读取模式'),
      toastReconnected: '蓝牙设备已重新连接',
      toastDisconnected: '已断开录音卡蓝牙连接',
      toastUnbound: '已解除录音卡绑定',
      retryAllFailed: (n) => `重试全部失败项 (${n})`,
      noTransfers: '暂无传输任务',
      failedStatus: '失败',
      completedStatus: '已完成',
      pausedStatus: '已暂停',
      uploadingStatus: (pct) => `传输中 ${pct}%`,
      remainingMinutes: (mins) => `约可支持 ${mins.toLocaleString()} 分钟高精度转写与总结`,
      checkedInToday: '今日已签到 (+100 积分)',
      dailyCheckIn: '每日签到领 +100 积分',
      creditRuleTitle: '消耗与获取说明',
      creditRule1: '• 音频转写：10 积分 / 分钟',
      creditRule2: '• AI 总结与导图：5 积分 / 次',
      creditRule3: '• 实时同声传译：15 积分 / 分钟',
      toastCheckedIn: '签到成功！+100 积分已到账',
      displayNameLabel: '昵称',
      displayNamePlaceholder: '输入你的显示昵称',
      emailLabel: '绑定邮箱',
      phoneLabel: '绑定手机',
      uploadAvatarBtn: '上传头像',
      removeAvatarBtn: '移除头像',
      avatarFileHint: '支持 JPG、PNG、WebP，图片会裁成方形',
      avatarInvalidFile: '请选择 JPG、PNG 或 WebP 图片',
      avatarTooLarge: '图片不能超过 8 MB',
      saveProfileBtn: '保存资料',
      toastProfileEmpty: '昵称不能为空',
      toastProfileSaved: '个人资料已更新',
      currentPwdLabel: '当前密码',
      currentPwdPlaceholder: '请输入当前密码',
      newPwdLabel: '新密码',
      newPwdPlaceholder: '至少 6 位字符',
      confirmPwdLabel: '确认新密码',
      confirmPwdPlaceholder: '再次输入新密码',
      pwdRuleHint: '建议包含字母与数字，妥善保管账号凭据',
      submitPwdBtn: '确认修改',
      toastPwdEmpty: '请填写完整的密码信息',
      toastPwdShort: '新密码长度不能少于 6 位',
      toastPwdMismatch: '两次输入的新密码不一致',
      toastPwdUpdated: '登录密码已修改',
      trashSheetCount: (n) => `共 ${n} 条可恢复记录`,
      emptyAllBtn: '一键清空',
      trashEmptyState: '回收站里干干净净',
      deletedAtPrefix: '删除于 ',
      deleteForeverBtn: '彻底删除',
      logoutTitle: '退出当前账号？',
      logoutDesc: '退出后需重新登录才可访问个人录音库、模板与云端同步状态。',
      confirmLogoutBtn: '确认退出登录',
      deleteAccountTitle: '永久注销账号',
      deleteWarn1: '• 清空全部本机与云端录音及 AI 纪要数据',
      deleteWarn2: '• 清空剩余积分、传译房间与自定义模板',
      deleteWarn3: '• 解除所有 VAMX 硬件录音卡绑定关系',
      deleteConfirmPromptPrefix: '请输入 ',
      deleteConfirmKeyword: '确认注销',
      deleteConfirmPromptSuffix: ' 以继续不可逆操作',
      deleteConfirmPlaceholder: '输入“确认注销”',
      confirmDeleteBtn: '永久注销账号',
      toastDeletedAccount: '账号已永久注销',
      uiLanguageAria: '界面语言',
      transcribeLangAria: '默认转写语言',
      transcribeLangToast: (langLabel) => `默认转写语言已设为「${langLabel}」`,
      notifyEnabledToast: '已开启完成通知',
      notifyDisabledToast: '已关闭完成通知',
      pipeImport: '导入音频',
      pipeCloud: '云端同步',
      pipeAi: '转写与总结',
      automationSheetTitle: '自动化',
      templatesSheetTitle: '模板中心',
      templatesSheetSub: '为每一种对话，匹配最清晰的结构',
      createTemplateSheetSub: '自定义 AI 纪要的提取重点与结构',
      createTemplateDescOptional: '输出结构描述（选填）',
      saveTemplateBtn: '保存模板',
      closeAria: '关闭',
      deviceSheetTitle: '我的设备',
      devUnboundSub: '暂未绑定硬件录音卡',
      devConnectedSub: (protocol) => `已连接 · ${protocol}`,
      devDisconnectedSub: '设备未连接 · 可重新连接或管理绑定',
      devConnectedBattery: (pct) => `已连接 · 电量 ${pct}%`,
      devDisconnectedBadge: '已断开连接',
      devReadyToast: '硬件录音卡已就绪，可通过顶部卡片快捷按键开始录音',
      checkUpdateBtn: '检查更新',
      firmwareLatestToast: (ver) => `固件 v${ver} 已是最新版本`,
      pendingCountLabel: '待导入录音',
      pendingCountValue: (n) => `${n} 条`,
      usbDesc: '连接数据线时允许快速读取卡片录音',
      syncCardBtn: '同步卡片录音',
      addDeviceBtn: '添加设备',
      rescanBtn: '重新扫描',
      bleSearching: '蓝牙低功耗搜索中…',
      bleSearchingTitle: '正在扫描附近 VAMX 设备…',
      foundDevicesTitle: '发现可绑定设备',
      boundBadge: '已绑定',
      bindAndConnectBtn: '绑定并连接',
      cardBatteryShort: (pct) => `电量 ${pct}%`,
      phoneAudioLinkBtn: '从手机选择音频文件',
      transfersSheetTitle: '传输与任务',
      transfersSheetSub: '上传期间保持连接；中断后支持断点续传',
      transferInterrupted: '传输中断',
      resumeTransferBtn: '继续传输',
      creditsCurrentLabel: '当前可用积分',
      creditsTotalEarned: '本期累计总额 240,375',
      creditsCheckIn150: '每日签到 +150',
      creditsCheckedIn150: '今日已签到',
      toastCheckedIn150: '已领取每日签到 +150 积分',
      creditsFreeTitle: '永久免费版',
      creditsFreeDesc: '每日赠送 150 积分 · 基础转写与导出',
      creditsProTitle: 'VAMX Pro 专业版',
      creditsProDesc: '每月 3,000 分钟转写 · 无限思维导图与同传',
      creditsProPrice: '¥68 / 月',
      creditsProToast: '当前账号已处于开发者体验全功能状态',
      trashSheetTitle: '录音回收站',
      trashSheetSub: '已删除的云端与本机录音会保留在此，支持恢复或彻底清除',
      trashCountLine: (n) => `共 ${n} 条已删除录音`,
      trashEmptyDesc: '删除的录音会暂存在这里，方便随时误删找回',
      logoutCurrentPrefix: '当前登录：',
      cancelDeleteAccount: '暂不注销',
      deleteConfirmAck: '我已阅读并了解账号注销后所有数据均不可恢复',
      noBoundCardName: '当前无绑定',
      deleteSheetSub: '此操作永久生效且不可撤销，请谨慎确认',
      deleteWarnHeading: '注销账号后，以下数据将被永久清除：',
      deleteWarnCredits: (n) => `个人资料、登录凭证及剩余 ${n.toLocaleString()} 积分`,
      deleteWarnFiles: '本机与云端所有录音文件、转写原文与 AI 纪要',
      deleteWarnCard: (name) => `已绑定的硬件录音卡（${name}）将自动解绑`,
    },
    detail: {
      backToList: '返回列表',
      moveToFolderBtn: '文件夹',
      renameTitleAria: '点击重命名标题',
      moreActionsAria: '更多操作',
      renamePlaceholder: '输入标题…',
      folderPrefix: '文件夹：',
      sourceCard: '录音卡',
      sourcePhone: '手机录音',
      sourceLink: '链接导入',
      sourceImport: '本地导入',
      localOnlyBadge: '仅本机',
      tabSummary: '总结',
      tabTranscript: '转写',
      tabNotes: '笔记',
      tabMindmap: '导图',
      tabAsk: '问录音',
      stagePreparing: '正在检索重点与转写上下文…',
      stageDrafting: '正在凝练核心观点与待办事项…',
      stagePolishing: '正在排版结构化纪要…',
      summaryHeader: 'AI 结构化总结',
      summaryTemplateSelectAria: '选择总结模板',
      summaryLangSelectAria: '选择总结语言',
      summaryAutoLanguageLabel: '自动语言',
      regenerateBtn: '重新生成',
      generatingBtn: '生成中…',
      emptySummaryTitle: '尚未生成 AI 总结',
      emptySummaryDesc: '一键提炼核心洞察与待办行动',
      generateSummaryBtn: '立即生成总结',
      sectionOverview: '核心摘要',
      sectionKeyPoints: '关键要点',
      sectionDecisions: '关键决策',
      sectionActions: '行动项',
      actionOwnerPrefix: '负责人：',
      copySummaryBtn: '复制总结',
      exportMarkdownBtn: '导出 Markdown',
      transcriptHeader: '逐字稿与说话人',
      speakersCount: (n) => `${n} 位说话人`,
      segmentsCount: (n) => `${n} 段`,
      searchTranscriptAria: '搜索转写内容',
      searchTranscriptPlaceholder: '搜索转写原文或说话人…',
      mergeSpeakersBtn: '合并说话人',
      separateSpeakersBtn: '区分说话人',
      editSpeakersBtn: '编辑说话人',
      doneEditBtn: '完成编辑',
      speakerPanelTitle: '批量修改说话人称呼',
      speakerNamePlaceholder: (id) => `输入说话人名称 (${id})`,
      emptyTranscriptTitle: '暂无转写内容',
      emptyTranscriptDesc: '点击下方按钮开始高精度语音识别与说话人分离',
      startTranscribeBtn: '开始语音转写',
      retranscribingStatus: '正在重新识别声纹与文字…',
      noTranscriptMatch: '未找到包含该关键词的转写片段',
      clickToEditSpeaker: '点击修改说话人名称',
      clickToJumpAudio: '点击跳转音频',
      highlightsTitle: '时间戳重点标记',
      addHighlightHere: '在当前时间打点',
      noHighlights: '暂无时间点标记，播放时可点击「标重点」快速记录',
      jumpTooltip: '跳转到此位置播放',
      noteLabel: '备注',
      notePlaceholder: '补充这条重点的具体说明…',
      freeNotesTitle: '自由记录',
      freeNotesHint: '自动保存',
      freeNotesPlaceholder: '在这里记录会议背景、私人想法或补充事项…',
      mindmapHeader: '思维导图大纲',
      refreshMindmapBtn: '刷新导图',
      generatingMindmapBtn: '构图中…',
      emptyMindmapTitle: '尚未生成思维导图',
      generateMindmapBtn: '一键生成导图',
      mindmapGeneratingDesc: '正在提取层级脉络与主题节点…',
      askEmptyTitle: '针对本条录音内容向 AI 提问',
      askQuick1: '这条录音最核心的结论是什么？',
      askQuick2: '列出需要跟进的行动项和责任人',
      askQuick3: '提炼 3 个可以复用的关键金句',
      askThinking: '正在追溯本条录音原文…',
      askInputPlaceholder: '围绕这条录音提问…',
      askSendAria: '发送问题',
      renameRecordingAction: '重命名录音',
      moveFolderAction: '移动到文件夹',
      retranscribeAction: '重新转写语音',
      exportShareAction: '导出或分享',
      deleteLocalAction: '删除本机文件',
      deleteCloudAction: '删除云端副本',
      moveSheetTitle: '移动到文件夹',
      exportSheetTitle: '导出与分享',
      exportCopySummary: '复制 AI 总结文本',
      exportCopySummaryDesc: '含核心摘要、要点、决策与待办列表',
      exportCopyTranscript: '复制完整逐字稿',
      exportCopyTranscriptDesc: '附带时间戳与说话人标注',
      exportDownloadMd: '下载 Markdown 笔记 (.md)',
      exportDownloadMdDesc: '适合导入 Notion、Obsidian 或飞书文档',
      exportShareLink: '复制分享链接',
      exportShareLinkDesc: '生成只读分享链接',
      toastTitleUpdated: '标题已更新',
      toastMovedFolder: (name) => `已移动至「${name}」`,
      toastAddedHighlight: (time) => `已标记重点 ${time}`,
      toastMergedSpeakers: '已合并为统一说话人',
      toastSeparatedSpeakers: '已恢复多说话人分段',
      toastSpeakerUpdated: '说话人名称已更新',
      toastSummaryReady: 'AI 总结已生成',
      toastTranscriptReady: '语音转写已完成',
      toastMindmapReady: '思维导图已生成',
      toastCopiedSummary: '已复制 AI 总结',
      toastCopiedTranscript: '已复制完整转写文本',
      toastDownloadedMd: '已导出 Markdown 文档',
      toastCopiedShareLink: '已复制分享链接',
      toastSeekedTo: (time) => `已跳转至 ${time}`,
      defaultHighlightNote: '重点标记',
      newHighlightNote: '新标记重点',
      autoSummaryOverview: (tplName, title, firstLine) =>
        `基于「${tplName}」模板对「${title}」完成结构化提炼。内容聚焦于：${firstLine}`,
      autoSummaryKp1: (tplName) => `按「${tplName}」维度完成分段语境归类，并保留关键原声时间戳。`,
      autoSummaryKp2: '明确了核心讨论主题与各发言方的关键表态。',
      autoSummaryKp3: '提取了可追踪的执行项，建议结合「笔记」中的重点标注同步归档。',
      autoSummaryDecision: '已确认当前阶段沟通结论，后续可在文件详情内随时补充行动项状态。',
      autoSummaryAction1: '复核本条录音中的关键时间点标注与逐字稿细节',
      autoSummaryAction2: '同步最终纪要至相关协作成员',
      autoActionOwner1: '我',
      autoActionOwner2: '项目组',
      autoAskResponse: (question, excerpt, firstTime) =>
        `针对你询问的「${question}」，结合原声记录分析如下：\n\n• 核心依据：${excerpt}\n• 建议行动：点击下方时间点 ${firstTime} 可立即回听原声语境与上下文细节。`,
      autoAskDefaultExcerpt: '本条录音已完成声学采集，可先点击转写获取更精准的逐字问答上下文。',
      statusTranscribed: '已转写',
      statusProcessing: '处理中',
      statusPending: '待转写',
      statusFailed: '处理失败',
      miniPauseAria: '暂停播放',
      miniPlayAria: '继续播放',
      miniSliderAria: '迷你进度条',
      pauseAudioBarAria: '暂停播放',
      templatePrefix: '模板 · ',
      mindmapSubtitle: '结构化知识脉络',
      askHeadline: '问 VAMX',
      askTagline: '从你的记录中，找到有据可查的答案。',
      askHistoryCount: (n) => `对话记录 (${n})`,
      askNewChat: '新对话',
      askSourcesHeader: '原声溯源（点击立即播放）',
      askSaveToNotes: '记入笔记',
      askSavedToNotesToast: '已保存到本条录音的「笔记」中',
      askRemoveContextAria: '移除关联录音',
      askAttachContext: '关联当前录音',
      askQuickChips: ['提炼待办', '总结结论'],
      askQuickMenuAria: '添加关联内容或快捷提示',
      askVoiceAria: '语音提问',
      askDefaultPrompt1: '有哪些值得跟进的行动？',
      askDefaultPrompt2: '帮我梳理关键决策',
      askDefaultPrompt3: '讨论中还有哪些未解决的问题？',
      deleteHighlightAria: '删除重点',
      insertTimeBtn: (time) => `插入时间 (${time})`,
      markCurrentBtn: (time) => `标记当前 (${time})`,
      highlightsHeaderCount: (n) => `重点时间轴 (${n})`,
      notesSavedBtn: '已保存',
      saveNotesBtn: '保存笔记',
      toastNotesSaved: '笔记已保存',
      toastUploadedCloud: '已同步上传至 VAMX 云端',
      moreTitle: '更多',
      closeMenuAria: '关闭菜单',
      downloadTxt: '下载 TXT',
      downloadPdf: '下载 PDF',
      downloadWord: '下载 WORD',
      noLocalCopy: '无本机副本',
      noCloudCopy: '无云端副本',
      toastDownloadedTxt: '已下载 TXT 文件',
      toastDownloadedDoc: '已导出 WORD 文档',
      toastDownloadedPdf: '已生成 PDF 纪要并开始下载',
      confirmSpeakerBtn: '确认',
      speakerInputPlaceholder: '输入发言人姓名…',
      diarizedSpeakersCount: (n) => `已识别 ${n} 位发言人`,
      noDiarizationLabel: '未区分发言人',
      summaryCardEmptyHeadline: '把长对话，变成清晰的下一步',
      mindmapEmptySubtitle: '把长对话，变成清晰的下一步',
      stageReadingAudio: '正在读取音频脉络…',
      stageDistillingTpl: (tpl) => `按「${tpl}」提炼关键结论…`,
      stagePolishingActions: '整理已确认决策与后续行动…',
    },
    ai: {
      title: 'AI 工作台',
      subtitle: '从你的全部录音资产中，获得有据可查的答案',
      historyAria: '历史问答记录',
      newChatAria: '新建对话',
      emptyTitle: '问 VAMX 任何录音细节',
      emptyDesc: '支持跨多场会议对比决策、提取待办事项并溯源原声片段',
      prompts: [
        '最近几次项目沟通中有哪些值得跟进的关键行动？',
        '帮我汇总上海煤科和世运工业园的待办事项',
        '《美国往事》拉片中提到了哪些时空转场手法？',
      ],
      searchingStatus: (n) => `正在跨 ${n} 条录音检索原声与结论`,
      citationsLabel: '引用来源 · 点击跳转原声',
      scopeAria: '问答范围',
      scopeAll: '全录音库问答',
      scopeFolder: (name) => `文件夹 · ${name}`,
      inputPlaceholder: '询问这些录音的细节、决策或待办…',
      sendAria: '发送',
      disclaimer: 'AI 结果可能有误，可点击来源卡片核对原声转写',
      historyTitle: '历史问答会话',
      closeHistoryAria: '关闭历史记录',
      historyItems: [
        { title: '最近几次项目沟通中有哪些值得跟进的关键行动？', time: '今天 23:40' },
        { title: '世运工业园 02 阶段排期核对要点', time: '昨天 16:30' },
        { title: '《美国往事》叙事结构与时间线梳理', time: '11月19日' },
      ],
      replyHeader: (n, body) =>
        `已在当前范围检索 ${n} 条录音资产，为你整理核心结论：\n\n${body}\n\n点击下方引用来源可直接跳转至对应原声位置核对。`,
      replyNoMatch: '当前筛选文件夹内暂无已转写的录音，请切换范围或先导入录音。',
    },
    rooms: {
      title: '同声传译室',
      subtitle: '多人多语种低延迟同传广播与会议室管理',
      joinBtn: '邀请码加入',
      createBtn: '创建房间',
      statTotal: '我的房间',
      statLive: '进行中',
      statListeners: '在线听众',
      searchPlaceholder: '搜索房间名称、语种或邀请码',
      trashToggleAria: '切换回收站',
      densityToggleAria: '切换列表密度',
      tabAll: '全部',
      tabLive: '进行中',
      tabUpcoming: '待开始',
      tabPaused: '暂停中',
      tabEnded: '已结束',
      statusLive: '进行中',
      statusPaused: '暂停中',
      statusUpcoming: '待开始',
      statusEnded: '已结束',
      emptyTrash: '回收站为空',
      emptyState: '暂无符合条件的传译房间',
      emptyCreateHint: '点击右上角“创建房间”立即发起同声传译',
      listenersCount: (n) => `${n} 位听众`,
      enterLive: '进入直播',
      viewDetail: '查看详情',
      restoredRoom: '已从回收站恢复',
      trashedRoom: '已移至回收站',
      restoreAria: '恢复房间',
      trashAria: '移入回收站',
      createModalTitle: '创建同传房间',
      topicLabel: '房间主题',
      roomTitlePlaceholder: '例如：Q4 全球合作伙伴峰会',
      sourceLangLabel: '源语言',
      targetLangLabel: '目标译文',
      createModalSubmit: '立即创建并开启直播',
      joinModalTitle: '邀请码加入',
      joinCodePlaceholder: '输入房间邀请码，例如 VX-3905',
      joinModalSubmit: '加入同传房间',
      inviteCodePrefix: '邀请码 ',
      directionLabel: '同传方向',
      totalListenersLabel: '累计听众',
      personsCount: (n) => `${n} 人`,
      copyInviteBtn: '复制邀请码',
      enterWorkbenchBtn: '进入实时同传台',
      untitledRoom: '未命名同传会议',
      invitedRoomPrefix: '受邀会议',
      toastCreated: (title) => `已创建并开启同传房间「${title}」`,
      toastJoined: (title) => `已进入房间「${title}」`,
      toastJoinedCode: (code) => `已通过邀请码 ${code} 加入`,
      toastCopyInvite: (code) => `已复制邀请码 ${code}`,
    },
    translate: {
      backAria: '返回',
      title: '实时翻译',
      switchSuffix: ' (切换)',
      sourceLangAria: '源语言',
      targetLangAria: '目标语言',
      swapLangAria: '交换语言',
      settingsAria: '翻译设置',
      modeBilingualShort: '双语',
      modeSourceShort: '原文',
      modeTargetShort: '译文',
      pipBtn: '画中画字幕',
      pipActiveBtn: '浮窗已开启',
      readAloud: '朗读',
      listeningVia: (src) => `正在通过 ${src} 实时识别与翻译…`,
      receivingAudio: '正在接收实时音频',
      pausedAudio: '已暂停收音',
      sourceCard: '录音卡',
      sourcePhone: '本机麦克风',
      pauseCapture: '暂停识别',
      resumeCapture: '继续收音',
      endAndSave: '结束翻译',
      settingsTitle: '翻译设置',
      closeSettingsAria: '关闭设置',
      tabTranslate: '翻译',
      tabTts: '朗读',
      tabDevice: '音源设备',
      onlySourceTitle: '仅翻译源语言',
      onlySourceDesc: '忽略目标语种发言，避免双向重复',
      industryLabel: '行业背景',
      defaultIndustry: '智能硬件 / SaaS',
      keywordsLabel: '专业热词（逗号分隔，提升识别准确率）',
      defaultKeywords: 'VAMX, Hnote01, 声学降噪, 纪要',
      autoSpeakTitle: '自动朗读译文',
      autoSpeakDesc: '每句确认后自动通过耳机播报',
      ttsRateLabel: '朗读语速',
      chooseSourceLabel: '选择实时翻译收音来源',
      phoneMicTitle: '本机麦克风',
      phoneMicDesc: '手机内置高清降噪拾音 · 即开即用',
      cardBoundTitle: (name) => `VAMX 录音卡 (${name})`,
      cardUnboundTitle: 'VAMX 录音卡（未绑定）',
      cardUnboundDesc: '未绑定设备 · 请先前往「我的设备」扫码或蓝牙绑定',
      cardConnectedDesc: (pct) => `蓝牙已连接 · 电量 ${pct}%`,
      cardDisconnectedDesc: '未连接 · 点击一键直连并切换',
      doneBtn: '完成',
      settingsSavedToast: '翻译参数已生效',
      pipSourceToggle: '原文',
      pipExpandAria: '回到实时翻译',
      pipCloseAria: '关闭画中画',
      pipPlayAria: '继续翻译',
      pipPauseAria: '暂停翻译',
      pipCardSource: (name) => `${name} 收音 · 拖动可停靠边角`,
      pipPhoneSource: '本机麦克风 · 拖动可停靠边角',
    },
    liveRecord: {
      statusRecording: '正在录音',
      statusPaused: '已暂停',
      cancel: '取消',
      sourceCard: (name) => `${name} · 硬件直录`,
      sourcePhone: '本机麦克风直录',
      pausedNotice: '录音已暂停 · 点击下方继续恢复录制',
      promptCard: '录音卡正高保真采集声场，随时支持打点重点或实时转写',
      promptPhone: '高灵敏声学拾音中，建议保持设备距离发言人 30–60 cm',
      noteBtn: '笔记',
      translateBtn: '实时翻译',
      markedFeedback: '已打点',
      markHighlightBtn: '标记重点',
      saveAria: '结束并保存',
      saveLabel: '保存',
      resumeAria: '继续录音',
      pauseAria: '暂停录音',
      resumeLabel: '继续',
      pauseLabel: '暂停',
      drawerTitle: '添加实时笔记',
      drawerCancel: '取消',
      drawerPlaceholder: (time) => `记录 ${time} 的关键内容或行动项…`,
      drawerAddBtn: '添加到时间轴',
      quickTags: ['关键决策', '待办跟进', '风险点', '金句灵感'],
      defaultHighlightPrefix: '重点标记 @ ',
    },
    importSheet: {
      menuTitle: '导入音频',
      closeMenuAria: '关闭导入菜单',
      optComments: '下载评论',
      optCommentsSub: '导入 YouTube 视频评论',
      optLocal: '本地导入',
      optLocalSub: '选择手机中的音频文件',
      optLink: '链接导入',
      optLinkSub: '导入受支持的视频链接',
      optRecord: '录音',
      optRecordSub: '使用当前快速录音',
      linkTitle: '链接导入',
      linkHeading: '输入音视频链接',
      linkDesc: '支持抖音、B站、快手、YouTube、Facebook、X/Twitter 等平台的公开音视频链接。',
      linkLabel: '音视频链接',
      fillExample: '填入示例',
      linkPlaceholder: '粘贴分享链接或包含链接的文字',
      linkInvalidErr: '请输入包含 http:// 或 https:// 的有效分享链接',
      targetLangLabel: '目标语言',
      folderLabel: '文件夹',
      diarizeLabel: '区分发言人',
      processingBtn: '正在处理…',
      linkSubmit: '开始处理',
      localTitle: '本地导入',
      localHeading: '上传音频文件',
      localDesc: '支持中文、英文、韩语、日语等十多种语言。',
      localAudioLabel: '音频文件',
      localPickBtn: '选取文件',
      localNoFile: '未选择文件',
      localHint: '单个文件建议不超过 4 小时；支持 MP3、M4A、AAC、AMR、WAV、OGG、FLAC、OPUS，暂不支持 MP4/MOV 等视频文件。',
      localSubmitting: '正在导入并转写…',
      localSubmit: '导入并转写',
      commentsTitle: '下载评论',
      commentsHeading: '输入 YouTube 视频链接',
      commentsDesc: '仅支持公开可访问的 YouTube 视频链接。',
      commentsInputLabel: 'YouTube 视频链接',
      commentsPlaceholder: '请输入 YouTube 平台音视频链接',
      commentsInvalidErr: '请输入有效的 YouTube 视频链接（youtube.com 或 youtu.be）',
      commentsDiarizeLabel: '区分发言人及发言总结（适用于会议分析与总结）',
      commentsDownloadOnly: '下载评论',
      commentsDownloadAudio: '同时下载音频文件',
      commentsSubmitting: '正在转录…',
      commentsSubmit: '转录',
      deviceTitle: '导入文件',
      deviceUnboundStatus: '尚未绑定硬件录音卡',
      deviceConnectedStatus: (name, pending, imported) => `${name} · ${pending} 条未导入 · ${imported} 条已导入`,
      deviceOfflineStatus: '录音卡未连接 · 仅展示历史记录',
      importAllBtn: '一键全导',
      importOneBtn: '一键导入',
      closeImportAria: '关闭导入',
      tabAll: (n) => `全部 (${n})`,
      tabPending: (n) => `未导入 (${n})`,
      tabImported: (n) => `已导入 (${n})`,
      searchCardPlaceholder: '搜索录音卡内文件名',
      refreshCardAria: '刷新设备列表',
      emptyCardFiles: '当前筛选下暂无录音卡文件',
      pendingBadge: '· 未导入',
      importedBadge: '已导入',
      importBtn: '导入',
      openMenuFooterBtn: '打开「导入音频」（评论 / 本地 / 链接 / 录音）',
      justImportedDate: '刚刚导入',
      justImportedLocalDate: '本地导入',
      justImportedLinkDate: '链接导入',
      justImportedCommentsDate: '下载评论',
      toastCardImported: (name) => `已导入 ${name}`,
      toastCardBatch: (n) => `已批量导入 ${n} 条录音卡文件`,
      toastLocalImported: (name) => `已导入并转写「${name}」`,
      toastLinkImported: (platform) => `已导入 ${platform} 音视频并完成转写`,
      toastCommentsAudioDone: '已转录评论并下载音频文件',
      toastCommentsOnlyDone: '已下载并转录 YouTube 评论',
    },
  },
  en: {
    common: {
      allFiles: 'All Files',
      unfiled: 'Unfiled',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      restore: 'Restore',
      rename: 'Rename',
      move: 'Move',
      exportBtn: 'Export',
      copy: 'Copy',
      copied: 'Copied',
      retry: 'Retry',
      justNow: 'Just now',
      itemsUnit: 'items',
      minutesUnit: 'min',
      speakerDefault: 'Speaker',
      speakerN: (n) => `Speaker ${n}`,
      phoneFileDate: 'Phone File',
      localImportDate: 'Local Import',
      linkImportDate: 'Link Import',
      commentsImportDate: 'Comments Audio',
      cardFastSyncDate: 'Just now · Card Sync',
    },
    auth: {
      deletedTitle: 'Account Permanently Deleted',
      signedOutTitle: 'Signed Out',
      deletedDesc: 'Local and cloud recordings have been cleared. You can register again or restore sample data anytime.',
      signedOutDesc: 'Sign back in to access your recordings, summary templates, and device sync.',
      reRegisterTitle: 'Register / Sign In to VAMX',
      welcomeBackTitle: 'Welcome Back to VAMX',
      phoneOrEmailLabel: 'Phone / Email',
      phoneOrEmailPlaceholder: 'Enter phone number or email',
      passwordLabel: 'Password',
      passwordOptionalLabel: 'Password (Optional)',
      passwordSetPlaceholder: 'Set a password',
      passwordEnterPlaceholder: 'Enter password or leave blank',
      createNewAccountBtn: 'Create Account & Continue',
      signInBtn: 'Sign In',
      restoreDemoAccountBtn: 'Restore Sample Account & Data',
      footerTip: 'All workspace data and preferences are stored locally',
      errEmptyAccount: 'Please enter a phone number or email',
      errEmptyPassword: 'Please set a password',
      toastCreated: 'Account created and signed in',
      toastSignedIn: 'Welcome back, signed in',
      tagline: 'Capture every conversation with clarity',
      deletedBanner: 'Your previous account and data were permanently deleted. Sign up again or restore sample data.',
      emailOrPhoneInputLabel: 'Email / Phone',
      loginPwdPlaceholder: 'Enter password',
      registerAndSignIn: 'Sign Up & Sign In',
      signInVamx: 'Sign In to VAMX',
      quickContinueWith: (acct) => `Continue as ${acct}`,
      restoreDemoExperience: 'Restore Sample Data Demo',
      errEmptyPwd: 'Please enter your password',
      toastWelcomeBack: (acct) => `Welcome back, ${acct}`,
      toastResignedIn: (acct) => `Signed back in as ${acct}`,
    },
    sidebar: {
      modeMobile: 'VAMX Mobile',
      modeDesktop: 'Desktop Wide',
      recordingNow: 'Recording Live',
      unboundDevice: 'No Device Bound',
      tapToBind: 'Tap to Bind',
      battery: (pct) => `${pct}% Battery`,
    },
    files: {
      multiSelect: 'Select',
      cancelMultiSelect: 'Cancel',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      selectedCount: (n) => `${n} selected`,
      batchMove: 'Move',
      batchDelete: 'Delete',
      askVamx: 'Ask VAMX',
      fastSyncBanner: (name) => `Transferring from ${name}…`,
      fastSyncing: 'Syncing…',
      fastSync: 'Sync',
      trashBanner: (count) => `Trash (${count})`,
      emptyTrashBtn: 'Empty',
      emptyTrashTitle: 'Trash is empty',
      emptyFilesTitle: 'No matching recordings',
      emptySearchHint: 'Try clearing keywords or switching filters',
      emptyFolderHint: 'Tap Import above or press the blue mic button below to record',
      clearSearchBtn: 'Clear search',
      trashedAt: (at) => `Deleted ${at === '刚刚' || !at ? 'just now' : at}`,
      generatingStatus: 'Processing…',
      failedStatus: 'Failed',
      retryingBadge: 'Tap to retry',
      noSelectionDesktop: 'Select any recording to inspect waveform, transcript, and AI summary',
      openMenuAria: (title) => `Actions for ${title}`,
      backToList: 'Back to list',
      clearSearchAria: 'Clear search',
      trashedHint: 'Deleted recordings stay here for easy recovery or permanent deletion',
      emptyTrashAction: 'Empty Trash',
      emptyTrashDesc: 'Deleted local or cloud recordings stay here briefly for recovery',
      emptyFilesDesc: 'Try switching folders, clearing search, or tapping the blue mic button below',
      backToAllFiles: 'Back to All Files',
      trashBothBadge: 'Local · Cloud',
      trashCloudBadge: 'Cloud Copy',
      trashLocalBadge: 'Local Copy',
      cloudBadge: 'Cloud',
      localBadge: 'Local',
      deleteForeverAria: 'Delete permanently',
      headerDeviceAria: 'Voice card status & quick controls',
      headerSearchAria: 'Search or Ask AI',
      headerProfileAria: 'Account & Settings',
      desktopBackToMobile: 'Return to mobile layout',
    },
    toolbox: {
      askVamxDynamicSub: (count) => `Cross-check ${count} recordings with timestamped citations`,
      liveTranslateCardSub: 'Bilingual captions & voice',
      roomsLiveSub: (count) => `${count} live now`,
      roomsIdleSub: 'Multi-user live rooms',
      importAudioCardSub: 'Comments · Local · Link · Mic',
      templatesCountSub: (count) => `${count} structured templates`,
      cardUnboundSub: 'No card bound · Tap to manage or import',
      cardPendingSub: (name, pending) => `${name} · ${pending} pending import`,
      cardSyncedSub: (name, total) => `${name} · ${total} synced`,
      pendingBadge: (count) => `${count} pending`,
      dockNavAria: 'Main navigation',
      dockRecordActiveAria: 'View live recording',
      dockRecordStartAria: 'Start recording',
    },
    sheets: {
      deviceTitle: 'My Device',
      cardFilesBtn: 'Card Files',
      liveTranslateBtn: 'Live Translate',
      unboundTitle: 'No Card Bound',
      startRecord: 'Start Recording',
      recordingInProgress: 'Recording · Tap to view',
      bindCardNow: 'Bind Voice Card',
      scanningNearby: 'Scanning nearby Bluetooth cards…',
      selectNearbyPrompt: 'Select a device to bind:',
      connectThisCard: 'Connect Card',
      batteryLabel: 'Battery',
      storageLabel: 'Free Space',
      usbReadLabel: 'USB Disk Mode',
      phoneLocalAudio: 'Phone Local Audio',
      selectPhoneAudio: 'Choose File',
      cardFilesTitle: 'Card Recordings',
      cardFilesCount: (n) => `${n} files`,
      refresh: 'Refresh',
      unbind: 'Unbind',
      folderSheetTitle: 'Filter & Folders',
      statusSection: 'File Status',
      foldersSection: 'My Folders',
      deletedSection: 'Deleted',
      newFolderBtn: 'New Folder',
      rowMenuRenameLabel: 'Rename',
      renamePlaceholder: 'Recording title',
      moveToFolder: 'Move to Folder',
      backupToCloud: 'Back Up to Cloud',
      deleteLocalCopy: 'Delete Local Copy',
      deleteCloudCopy: 'Delete Cloud Copy',
      batchMoveTitle: (n) => `Move ${n} recordings to`,
      newFolderTitle: 'New Folder',
      newFolderPlaceholder: 'Folder name…',
      createBtn: 'Create',
      deviceManageTitle: 'Manage card recordings',
      unboundCardLabel: 'No Voice Card Bound',
      viewLiveRecStatus: 'View live recording',
      startCardDirectRec: 'Record with Voice Card',
      usePhoneMicRec: 'Record with Phone Mic',
      statusUnbound: 'Unbound',
      statusConnected: 'Connected',
      statusDisconnected: 'Disconnected',
      firmwareLabel: 'Firmware',
      cardStorageLabel: 'Used / Capacity',
      reconnect: 'Reconnect',
      disconnect: 'Disconnect',
      unbindDevice: 'Unbind Device',
      scanningVamxCards: 'Scanning nearby VAMX cards…',
      nearbyVamxCards: 'Nearby VAMX Cards',
      collapse: 'Collapse',
      bleSearching: 'Searching via Bluetooth…',
      bindAndConnect: 'Bind & Connect',
      scanNearbyDevices: 'Scan Nearby Devices',
      scanNoDeviceHint: 'No card detected yet. Ensure it is powered on, nearby, and not connected elsewhere.',
      selectPhoneAudioFull: 'Choose Audio File from Phone',
      trashLabel: 'Trash',
      rowRenameBtn: 'Rename',
      rowRenamePlaceholder: 'Edit title…',
      createFolderBtn: 'Create Folder',
    },
    toasts: {
      usingPhoneMic: 'Recording with phone microphone',
      scannedOneNew: 'Scanned voice card: 1 new recording found',
      refreshedPending: (n) => `Refreshed: ${n} pending recording(s) on card`,
      fastSyncImported: (n) => `Fast-synced and archived ${n} card recording(s)`,
      fastSyncDone: 'Fast sync & cloud archive complete',
      savedLiveRecording: (title) => `Saved "${title}"`,
      liveRecTitlePrefix: 'Live Recording',
      createdFolder: (name) => `Created folder "${name}"`,
      retriedRecording: (title) => `Re-transcribed "${title}"`,
      deletedLocalAndTrashed: 'Local file moved to Trash',
      deletedCloudAndTrashed: 'Cloud file moved to Trash. Restore via All Files or Account.',
      deletedLocalKeptCloud: 'Local copy moved to Trash; cloud copy kept',
      deletedCloudKeptLocal: 'Cloud copy moved to Trash; local copy kept',
      restoredFromTrash: 'Recording restored from Trash',
      permanentlyDeleted: 'Copy permanently deleted',
      emptiedTrash: 'Trash emptied',
      resetAllDone: 'Sample data restored',
      loggedOut: 'Signed out',
      accountDeleted: 'Account permanently deleted',
      importedFromPhone: (name) => `Imported "${name}" from phone`,
      bindCardFirst: 'Bind a VAMX voice card before switching to card mic',
      connectedAndSwitchedCard: (name) => `Connected ${name} and switched to card mic`,
      switchedToCard: (name) => `Switched input to ${name}`,
      switchedToPhone: 'Switched input to phone microphone',
      startedNewChat: 'Started a new conversation',
      jumpedToAudio: (time) => `Jumped to ${time}`,
      deviceUnbound: 'Voice card unbound',
      usbEnabled: 'USB disk mode enabled',
      usbDisabled: 'USB disk mode disabled',
      boundCard: (name) => `Bound ${name}`,
      renamedTo: (name) => `Renamed to "${name}"`,
      movedToFolder: (name) => `Moved to "${name}"`,
      uploadedToCloud: (title) => `Uploaded "${title}" to cloud`,
      batchMoved: (count, folderName) => `Moved ${count} recording(s) to "${folderName}"`,
      batchDeleted: (count) => `Moved ${count} recording(s) to Trash`,
      exportedLiveTranslation: (title) => `Exported "${title}" to Files`,
      translatedBlockPrefix: 'Live Translation',
      endTranslation: 'Live translation ended',
      pipEnabled: 'PiP captions active — drag to any corner across screens',
      readingAloud: 'Reading translation aloud',
      selectOrBindCard: 'Bind a voice card first, or use phone mic to record',
      disconnectedDevice: 'Device disconnected',
      reconnectedDevice: (name) => `Reconnected ${name}`,
      unboundDevice: (name) => `Unbound ${name} from this device`,
      cancelledRecording: 'Recording discarded',
      insertedLiveNote: 'Timestamped note added',
      transferResumed: 'File transfer resumed and completed',
      defaultUserName: 'VAMX User',
      renamedRecording: 'Recording renamed',
      backedUpToCloud: 'Backed up to cloud',
      switchedZh: '已切换为简体中文',
      switchedEn: 'Switched to English',
      switchedVi: 'Đã chuyển sang Tiếng Việt',
    },
    waveform: {
      pauseAria: 'Pause playback',
      playAria: 'Play audio',
      sliderAria: 'Audio progress',
      rewind10Aria: 'Rewind 10 seconds',
      forward10Aria: 'Forward 10 seconds',
      markTitle: 'Bookmark highlight at current timestamp',
      markBtn: 'Mark',
      exportAria: 'Export or share',
    },
    deviceVisual: {
      stopHwRecTitle: 'Stop hardware recording',
      startHwRecTitle: 'Quick-start hardware recording',
      stopHwRecAria: 'Stop recording',
      startHwRecAria: 'Start quick recording',
    },
    profile: {
      workspaceSub: 'Manage credits, hardware card, automation & templates',
      preferencesSub: 'App language, transcription & alerts',
      accountSub: 'Credentials and security controls',
      creditsAvailable: (n) => `${n.toLocaleString()} left`,
      boundStatus: (name) => `${name} · Bound`,
      unboundStatus: 'Unbound',
      transferPending: (n) => `${n} pending`,
      transferTotal: (n) => `${n} total`,
      automationEnabled: (n) => `${n} active`,
      templatesCount: (n) => `${n} templates`,
      trashRecoverable: (n) => `${n} recoverable`,
      trashEmpty: 'Empty',
      emailOrPhoneUnbound: 'Not linked',
      resetBtn: 'Reset Sample Data',
      resetConfirmTitle: 'Reset all local data to defaults?',
      resetConfirmBtn: 'Confirm Reset',
      footerMotto: 'VAMX · Capture every conversation with clarity.',
      autoImportTitle: 'Auto-import card files on connect',
      autoImportDesc: 'Pull new recordings automatically via Bluetooth & Wi-Fi',
      autoUploadTitle: 'Auto-upload to VAMX Cloud',
      autoUploadDesc: 'Back up audio and sync transcripts across devices',
      autoTranscribeTitle: 'Auto-transcribe after upload',
      autoTranscribeDesc: 'Includes speaker diarization and language detection',
      autoSummaryTitle: 'Auto-generate AI summary',
      autoSummaryDesc: 'Extract takeaways, decisions, and action items with default template',
      wifiOnlyTitle: 'Batch upload on Wi-Fi only',
      wifiOnlyDesc: 'Save cellular data',
      defaultTemplateLabel: 'Default Summary Template',
      newTemplateBtn: 'New Custom Template',
      defaultBadge: 'Default',
      useAsDefaultBtn: 'Set Default',
      customBadge: 'Custom',
      createTemplateModalTitle: 'New Summary Template',
      templateNameLabel: 'Template Name',
      templateNamePlaceholder: 'e.g. Product Weekly / Investor Call',
      templateDescLabel: 'Structure Notes',
      templateDescPlaceholder: 'Describe what sections or takeaways this template focuses on…',
      templateToneLabel: 'Accent Tone',
      toneIndigo: 'Cobalt',
      toneAmber: 'Amber',
      toneEmerald: 'Emerald',
      toneSlate: 'Slate',
      createTemplateSubmit: 'Create & Use',
      toastTemplateCreated: (name) => `Created template "${name}"`,
      toastDefaultTemplateUpdated: 'Default template updated',
      noCardTitle: 'No VAMX Card Bound',
      noCardDesc: 'Scan for a Bluetooth voice card, or record with your phone mic and local files.',
      scanNearbyBtn: 'Scan Nearby Cards',
      discoveredDevices: 'Nearby devices found:',
      bindThisBtn: 'Bind',
      connectedBadge: 'Connected',
      disconnectedBadge: 'Offline',
      protocolLabel: 'Protocol',
      batteryLabel: 'Battery',
      storageLabel: 'Card Storage',
      firmwareLabel: 'Firmware',
      macLabel: 'MAC Address',
      toggleUsb: 'USB Disk File Access',
      reconnectBtn: 'Reconnect Device',
      disconnectBtn: 'Disconnect Bluetooth',
      cardFilesCardBtn: 'Card Files',
      phonePickerCardBtn: 'Phone Audio',
      switchCardBtn: 'Switch Card',
      unbindCardBtn: 'Unbind Card',
      toastBound: (name) => `Bound and connected ${name}`,
      toastUsbToggled: (on) => (on ? 'USB disk mode enabled' : 'USB disk mode disabled'),
      toastReconnected: 'Device reconnected',
      toastDisconnected: 'Bluetooth disconnected',
      toastUnbound: 'Voice card unbound',
      retryAllFailed: (n) => `Retry Failed (${n})`,
      noTransfers: 'No transfer tasks',
      failedStatus: 'Failed',
      completedStatus: 'Done',
      pausedStatus: 'Paused',
      uploadingStatus: (pct) => `Uploading ${pct}%`,
      remainingMinutes: (mins) => `Supports ~${mins.toLocaleString()} min of high-accuracy transcription & AI summary`,
      checkedInToday: 'Checked in today (+100 credits)',
      dailyCheckIn: 'Daily Check-In (+100 credits)',
      creditRuleTitle: 'Usage & Rates',
      creditRule1: '• Transcription: 10 credits / min',
      creditRule2: '• AI Summary & Mind Map: 5 credits / run',
      creditRule3: '• Live Interpretation: 15 credits / min',
      toastCheckedIn: 'Checked in! +100 credits added',
      displayNameLabel: 'Display Name',
      displayNamePlaceholder: 'Enter display name',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      uploadAvatarBtn: 'Upload photo',
      removeAvatarBtn: 'Remove photo',
      avatarFileHint: 'JPG, PNG or WebP · cropped to a square',
      avatarInvalidFile: 'Choose a JPG, PNG or WebP image',
      avatarTooLarge: 'Image must be under 8 MB',
      saveProfileBtn: 'Save Profile',
      toastProfileEmpty: 'Display name cannot be empty',
      toastProfileSaved: 'Profile updated',
      currentPwdLabel: 'Current Password',
      currentPwdPlaceholder: 'Enter current password',
      newPwdLabel: 'New Password',
      newPwdPlaceholder: 'At least 6 characters',
      confirmPwdLabel: 'Confirm Password',
      confirmPwdPlaceholder: 'Re-enter new password',
      pwdRuleHint: 'Use a mix of letters and numbers to keep your account secure',
      submitPwdBtn: 'Update Password',
      toastPwdEmpty: 'Please complete all password fields',
      toastPwdShort: 'New password must be at least 6 characters',
      toastPwdMismatch: 'New passwords do not match',
      toastPwdUpdated: 'Password updated',
      trashSheetCount: (n) => `${n} recoverable item(s)`,
      emptyAllBtn: 'Empty All',
      trashEmptyState: 'Trash is completely empty',
      deletedAtPrefix: 'Deleted ',
      deleteForeverBtn: 'Delete Forever',
      logoutTitle: 'Sign out of VAMX?',
      logoutDesc: 'You will need to sign back in to access your library, templates, and cloud sync.',
      confirmLogoutBtn: 'Sign Out',
      deleteAccountTitle: 'Permanently Delete Account',
      deleteWarn1: '• Permanently clears all local & cloud recordings and AI notes',
      deleteWarn2: '• Clears remaining credits, interpretation rooms, and custom templates',
      deleteWarn3: '• Unbinds all VAMX hardware voice cards',
      deleteConfirmPromptPrefix: 'Type ',
      deleteConfirmKeyword: 'DELETE',
      deleteConfirmPromptSuffix: ' to confirm this irreversible action',
      deleteConfirmPlaceholder: 'Type "DELETE"',
      confirmDeleteBtn: 'Delete Account Forever',
      toastDeletedAccount: 'Account permanently deleted',
      uiLanguageAria: 'App Language',
      transcribeLangAria: 'Default Transcription Language',
      transcribeLangToast: (langLabel) => `Default transcription language set to "${langLabel}"`,
      notifyEnabledToast: 'Completion notifications enabled',
      notifyDisabledToast: 'Completion notifications disabled',
      pipeImport: 'Import Audio',
      pipeCloud: 'Cloud Sync',
      pipeAi: 'Transcribe & AI',
      automationSheetTitle: 'Automation',
      templatesSheetTitle: 'Template Center',
      templatesSheetSub: 'Match every conversation with clear structure',
      createTemplateSheetSub: 'Customize focus areas and output layout',
      createTemplateDescOptional: 'Structure Description (Optional)',
      saveTemplateBtn: 'Save Template',
      closeAria: 'Close',
      deviceSheetTitle: 'My Device',
      devUnboundSub: 'No hardware voice card bound',
      devConnectedSub: (protocol) => `Connected · ${protocol}`,
      devDisconnectedSub: 'Disconnected · Reconnect or manage binding',
      devConnectedBattery: (pct) => `Connected · ${pct}% Battery`,
      devDisconnectedBadge: 'Disconnected',
      devReadyToast: 'Voice card ready — press the card button above to record',
      checkUpdateBtn: 'Check Update',
      firmwareLatestToast: (ver) => `Firmware v${ver} is up to date`,
      pendingCountLabel: 'Pending Files',
      pendingCountValue: (n) => `${n} items`,
      usbDesc: 'Allow quick card file access over USB cable',
      syncCardBtn: 'Sync Card Recordings',
      addDeviceBtn: 'Add Device',
      rescanBtn: 'Rescan',
      bleSearching: 'Searching via BLE…',
      bleSearchingTitle: 'Scanning nearby VAMX devices…',
      foundDevicesTitle: 'Devices Ready to Bind',
      boundBadge: 'Bound',
      bindAndConnectBtn: 'Bind & Connect',
      cardBatteryShort: (pct) => `${pct}% Battery`,
      phoneAudioLinkBtn: 'Choose Audio from Phone',
      transfersSheetTitle: 'Transfers & Tasks',
      transfersSheetSub: 'Stay connected during upload; resumable on interruption',
      transferInterrupted: 'Interrupted',
      resumeTransferBtn: 'Resume',
      creditsCurrentLabel: 'Available Credits',
      creditsTotalEarned: 'Period Total 240,375',
      creditsCheckIn150: 'Check-In +150',
      creditsCheckedIn150: 'Checked In',
      toastCheckedIn150: 'Daily check-in claimed: +150 credits',
      creditsFreeTitle: 'Free Forever',
      creditsFreeDesc: '150 daily credits · Standard transcription & export',
      creditsProTitle: 'VAMX Pro',
      creditsProDesc: '3,000 min/mo · Unlimited mind maps & live interpret',
      creditsProPrice: '$9.9 / mo',
      creditsProToast: 'Developer preview already includes full Pro features',
      trashSheetTitle: 'Recording Trash',
      trashSheetSub: 'Deleted local & cloud recordings remain here for recovery',
      trashCountLine: (n) => `${n} deleted recording(s)`,
      trashEmptyDesc: 'Deleted recordings rest here temporarily for easy recovery',
      logoutCurrentPrefix: 'Signed in: ',
      cancelDeleteAccount: 'Keep Account',
      deleteConfirmAck: 'I understand all deleted data cannot be recovered',
      noBoundCardName: 'None bound',
      deleteSheetSub: 'This action is permanent and cannot be undone',
      deleteWarnHeading: 'Deleting your account permanently removes:',
      deleteWarnCredits: (n) => `Profile info, login credentials, and ${n.toLocaleString()} credits`,
      deleteWarnFiles: 'All local & cloud audio, transcripts, and AI summaries',
      deleteWarnCard: (name) => `Binding for hardware card (${name})`,
    },
    detail: {
      backToList: 'Files',
      moveToFolderBtn: 'Folder',
      renameTitleAria: 'Tap to rename title',
      moreActionsAria: 'More actions',
      renamePlaceholder: 'Recording title…',
      folderPrefix: 'Folder: ',
      sourceCard: 'Voice Card',
      sourcePhone: 'Phone Mic',
      sourceLink: 'Web Link',
      sourceImport: 'Imported',
      localOnlyBadge: 'Local',
      tabSummary: 'Summary',
      tabTranscript: 'Transcript',
      tabNotes: 'Notes',
      tabMindmap: 'Mind Map',
      tabAsk: 'Ask AI',
      stagePreparing: 'Scanning key points and transcript context…',
      stageDrafting: 'Distilling core takeaways and action items…',
      stagePolishing: 'Formatting structured summary…',
      summaryHeader: 'AI Structured Summary',
      summaryTemplateSelectAria: 'Select summary template',
      summaryLangSelectAria: 'Select summary language',
      summaryAutoLanguageLabel: 'Auto',
      regenerateBtn: 'Regenerate',
      generatingBtn: 'Generating…',
      emptySummaryTitle: 'No AI summary yet',
      emptySummaryDesc: 'Extract key insights and action items in one tap',
      generateSummaryBtn: 'Generate Summary',
      sectionOverview: 'Overview',
      sectionKeyPoints: 'Key Points',
      sectionDecisions: 'Decisions',
      sectionActions: 'Action Items',
      actionOwnerPrefix: 'Owner: ',
      copySummaryBtn: 'Copy Summary',
      exportMarkdownBtn: 'Export Markdown',
      transcriptHeader: 'Transcript & Speakers',
      speakersCount: (n) => `${n} speaker(s)`,
      segmentsCount: (n) => `${n} segments`,
      searchTranscriptAria: 'Search transcript',
      searchTranscriptPlaceholder: 'Search transcript or speaker…',
      mergeSpeakersBtn: 'Merge Speakers',
      separateSpeakersBtn: 'Split Speakers',
      editSpeakersBtn: 'Edit Speakers',
      doneEditBtn: 'Done',
      speakerPanelTitle: 'Rename Speakers',
      speakerNamePlaceholder: (id) => `Speaker name (${id})`,
      emptyTranscriptTitle: 'No transcript yet',
      emptyTranscriptDesc: 'Tap below to run speech recognition with speaker diarization',
      startTranscribeBtn: 'Transcribe Audio',
      retranscribingStatus: 'Re-analyzing voiceprints and transcript…',
      noTranscriptMatch: 'No matching transcript segments found',
      clickToEditSpeaker: 'Tap to rename speaker',
      clickToJumpAudio: 'Jump to audio',
      highlightsTitle: 'Timestamp Bookmarks',
      addHighlightHere: 'Bookmark Current Time',
      noHighlights: 'No bookmarks yet. Tap Mark on the player while listening.',
      jumpTooltip: 'Play from this timestamp',
      noteLabel: 'Note',
      notePlaceholder: 'Add context for this highlight…',
      freeNotesTitle: 'Scratchpad Notes',
      freeNotesHint: 'Auto-saved',
      freeNotesPlaceholder: 'Jot down meeting context, ideas, or follow-ups…',
      mindmapHeader: 'Mind Map Outline',
      refreshMindmapBtn: 'Refresh',
      generatingMindmapBtn: 'Mapping…',
      emptyMindmapTitle: 'No mind map yet',
      generateMindmapBtn: 'Generate Mind Map',
      mindmapGeneratingDesc: 'Organizing topic hierarchy and branches…',
      askEmptyTitle: 'Ask AI about this recording',
      askQuick1: 'What is the main takeaway of this recording?',
      askQuick2: 'List all follow-up action items and owners',
      askQuick3: 'Extract 3 memorable quotes or highlights',
      askThinking: 'Searching transcript context…',
      askInputPlaceholder: 'Ask anything about this recording…',
      askSendAria: 'Send question',
      renameRecordingAction: 'Rename Recording',
      moveFolderAction: 'Move to Folder',
      retranscribeAction: 'Re-transcribe Audio',
      exportShareAction: 'Export or Share',
      deleteLocalAction: 'Delete Local File',
      deleteCloudAction: 'Delete Cloud Copy',
      moveSheetTitle: 'Move to Folder',
      exportSheetTitle: 'Export & Share',
      exportCopySummary: 'Copy AI Summary',
      exportCopySummaryDesc: 'Includes overview, key points, decisions & actions',
      exportCopyTranscript: 'Copy Full Transcript',
      exportCopyTranscriptDesc: 'Includes timestamps and speaker labels',
      exportDownloadMd: 'Download Markdown (.md)',
      exportDownloadMdDesc: 'Ready for Notion, Obsidian, or Docs',
      exportShareLink: 'Copy Share Link',
      exportShareLinkDesc: 'Create a read-only share link',
      toastTitleUpdated: 'Title updated',
      toastMovedFolder: (name) => `Moved to "${name}"`,
      toastAddedHighlight: (time) => `Bookmarked ${time}`,
      toastMergedSpeakers: 'Speakers merged into one',
      toastSeparatedSpeakers: 'Multi-speaker segments restored',
      toastSpeakerUpdated: 'Speaker name updated',
      toastSummaryReady: 'AI summary generated',
      toastTranscriptReady: 'Transcription completed',
      toastMindmapReady: 'Mind map generated',
      toastCopiedSummary: 'Summary copied',
      toastCopiedTranscript: 'Transcript copied',
      toastDownloadedMd: 'Markdown exported',
      toastCopiedShareLink: 'Share link copied',
      toastSeekedTo: (time) => `Seeked to ${time}`,
      defaultHighlightNote: 'Highlight',
      newHighlightNote: 'New Bookmark',
      autoSummaryOverview: (tplName, title, firstLine) =>
        `Structured takeaways for "${title}" using the ${tplName} template. Focus: ${firstLine}`,
      autoSummaryKp1: (tplName) => `Organized segments under the ${tplName} lens with preserved audio timestamps.`,
      autoSummaryKp2: 'Clarified primary discussion topics and participant stances.',
      autoSummaryKp3: 'Extracted trackable action items synced with timestamp bookmarks.',
      autoSummaryDecision: 'Confirmed current conclusions; action items can be updated anytime in details.',
      autoSummaryAction1: 'Review timestamp bookmarks and transcript details in this recording',
      autoSummaryAction2: 'Share final notes with collaborators',
      autoActionOwner1: 'Me',
      autoActionOwner2: 'Team',
      autoAskResponse: (question, excerpt, firstTime) =>
        `Regarding "${question}", based on this recording:\n\n• Key excerpt: ${excerpt}\n• Suggested next step: Tap ${firstTime} below to jump directly to the original audio context.`,
      autoAskDefaultExcerpt: 'Audio has been captured. Run transcription first for richer timestamped answers.',
      statusTranscribed: 'Transcribed',
      statusProcessing: 'Processing',
      statusPending: 'Pending',
      statusFailed: 'Failed',
      miniPauseAria: 'Pause playback',
      miniPlayAria: 'Resume playback',
      miniSliderAria: 'Mini scrubber',
      pauseAudioBarAria: 'Pause playback',
      templatePrefix: 'Tpl · ',
      mindmapSubtitle: 'Structured Knowledge Tree',
      askHeadline: 'Ask VAMX',
      askTagline: 'Find grounded answers from this recording.',
      askHistoryCount: (n) => `Chat History (${n})`,
      askNewChat: 'New Chat',
      askSourcesHeader: 'Audio Sources (Tap to play)',
      askSaveToNotes: 'Save to Notes',
      askSavedToNotesToast: 'Saved to Notes in this recording',
      askRemoveContextAria: 'Detach recording context',
      askAttachContext: 'Attach Recording',
      askQuickChips: ['Action items', 'Key decisions'],
      askQuickMenuAria: 'Attach context or quick prompt',
      askVoiceAria: 'Voice prompt',
      askDefaultPrompt1: 'What action items should we follow up on?',
      askDefaultPrompt2: 'Summarize key decisions made',
      askDefaultPrompt3: 'What open questions remain?',
      deleteHighlightAria: 'Delete highlight',
      insertTimeBtn: (time) => `Insert Time (${time})`,
      markCurrentBtn: (time) => `Mark Now (${time})`,
      highlightsHeaderCount: (n) => `Highlights (${n})`,
      notesSavedBtn: 'Saved',
      saveNotesBtn: 'Save Notes',
      toastNotesSaved: 'Notes saved',
      toastUploadedCloud: 'Synced to VAMX Cloud',
      moreTitle: 'More',
      closeMenuAria: 'Close menu',
      downloadTxt: 'Download TXT',
      downloadPdf: 'Download PDF',
      downloadWord: 'Download WORD',
      noLocalCopy: 'No local copy',
      noCloudCopy: 'No cloud copy',
      toastDownloadedTxt: 'TXT file downloaded',
      toastDownloadedDoc: 'WORD doc exported',
      toastDownloadedPdf: 'PDF summary download started',
      confirmSpeakerBtn: 'Apply',
      speakerInputPlaceholder: 'Speaker name…',
      diarizedSpeakersCount: (n) => `${n} speakers detected`,
      noDiarizationLabel: 'Single speaker view',
      summaryCardEmptyHeadline: 'Turn long talks into clear next steps',
      mindmapEmptySubtitle: 'Turn long talks into clear next steps',
      stageReadingAudio: 'Reading audio context…',
      stageDistillingTpl: (tpl) => `Distilling key takeaways via ${tpl}…`,
      stagePolishingActions: 'Organizing confirmed decisions & actions…',
    },
    ai: {
      title: 'AI Workbench',
      subtitle: 'Traceable, cited answers grounded in your recordings',
      historyAria: 'Chat history',
      newChatAria: 'New chat',
      emptyTitle: 'Ask VAMX Anything',
      emptyDesc: 'Compare decisions across meetings, extract tasks, and jump to exact timestamps',
      prompts: [
        'What follow-up action items came up in recent project calls?',
        'Summarize action items for Shanghai Coal Tech & Shiyun Industrial Park',
        'What transition techniques were analyzed in Once Upon a Time in America?',
      ],
      searchingStatus: (n) => `Searching transcripts & takeaways across ${n} recordings`,
      citationsLabel: 'Citations · Tap to jump to audio',
      scopeAria: 'Search scope',
      scopeAll: 'All Recordings',
      scopeFolder: (name) => `Folder · ${name}`,
      inputPlaceholder: 'Ask about details, decisions, or action items…',
      sendAria: 'Send',
      disclaimer: 'AI answers may vary — tap any citation card to verify original audio',
      historyTitle: 'Conversation History',
      closeHistoryAria: 'Close history',
      historyItems: [
        { title: 'What follow-up action items came up in recent project calls?', time: 'Today 23:40' },
        { title: 'Shiyun Industrial Park Phase 02 schedule checklist', time: 'Yesterday 16:30' },
        { title: 'Once Upon a Time in America timeline & transitions', time: 'Nov 19' },
      ],
      replyHeader: (n, body) =>
        `Searched ${n} recordings in the current scope. Key takeaways:\n\n${body}\n\nTap any citation below to jump straight to the original audio.`,
      replyNoMatch: 'No transcribed recordings in this folder yet. Switch scope or import audio first.',
    },
    rooms: {
      title: 'Interpretation Rooms',
      subtitle: 'Low-latency multi-language live interpretation & room management',
      joinBtn: 'Join Code',
      createBtn: 'Create Room',
      statTotal: 'My Rooms',
      statLive: 'Live Now',
      statListeners: 'Listeners',
      searchPlaceholder: 'Search room title, language, or invite code',
      trashToggleAria: 'Toggle trash',
      densityToggleAria: 'Toggle layout',
      tabAll: 'All',
      tabLive: 'Live',
      tabUpcoming: 'Upcoming',
      tabPaused: 'Paused',
      tabEnded: 'Ended',
      statusLive: 'Live',
      statusPaused: 'Paused',
      statusUpcoming: 'Upcoming',
      statusEnded: 'Ended',
      emptyTrash: 'Trash is empty',
      emptyState: 'No matching interpretation rooms',
      emptyCreateHint: 'Tap Create Room above to start live interpretation',
      listenersCount: (n) => `${n} listening`,
      enterLive: 'Join Live',
      viewDetail: 'Details',
      restoredRoom: 'Restored from Trash',
      trashedRoom: 'Moved to Trash',
      restoreAria: 'Restore room',
      trashAria: 'Move to trash',
      createModalTitle: 'Create Interpretation Room',
      topicLabel: 'Room Topic',
      roomTitlePlaceholder: 'e.g. Q4 Global Partner Summit',
      sourceLangLabel: 'Source',
      targetLangLabel: 'Target',
      createModalSubmit: 'Create & Go Live',
      joinModalTitle: 'Join with Invite Code',
      joinCodePlaceholder: 'Enter invite code, e.g. VX-3905',
      joinModalSubmit: 'Join Room',
      inviteCodePrefix: 'Code ',
      directionLabel: 'Language Pair',
      totalListenersLabel: 'Listeners',
      personsCount: (n) => `${n}`,
      copyInviteBtn: 'Copy Code',
      enterWorkbenchBtn: 'Open Live Console',
      untitledRoom: 'Untitled Interpretation Room',
      invitedRoomPrefix: 'Invited Room',
      toastCreated: (title) => `Created & started "${title}"`,
      toastJoined: (title) => `Entered room "${title}"`,
      toastJoinedCode: (code) => `Joined via code ${code}`,
      toastCopyInvite: (code) => `Copied invite code ${code}`,
    },
    translate: {
      backAria: 'Back',
      title: 'Live Translate',
      switchSuffix: ' (Switch)',
      sourceLangAria: 'Source language',
      targetLangAria: 'Target language',
      swapLangAria: 'Swap languages',
      settingsAria: 'Translation settings',
      modeBilingualShort: 'Bilingual',
      modeSourceShort: 'Source',
      modeTargetShort: 'Target',
      pipBtn: 'PiP Captions',
      pipActiveBtn: 'PiP On',
      readAloud: 'Speak',
      listeningVia: (src) => `Listening & translating live via ${src}…`,
      receivingAudio: 'Receiving live audio',
      pausedAudio: 'Audio paused',
      sourceCard: 'Voice Card',
      sourcePhone: 'Phone Mic',
      pauseCapture: 'Pause',
      resumeCapture: 'Resume',
      endAndSave: 'End Session',
      settingsTitle: 'Translation Settings',
      closeSettingsAria: 'Close settings',
      tabTranslate: 'Translate',
      tabTts: 'Speech',
      tabDevice: 'Input Source',
      onlySourceTitle: 'Translate Source Only',
      onlySourceDesc: 'Ignore target-language speech to prevent echo',
      industryLabel: 'Industry Context',
      defaultIndustry: 'Smart Hardware / SaaS',
      keywordsLabel: 'Glossary Keywords (comma-separated for accuracy)',
      defaultKeywords: 'VAMX, Hnote01, Noise Reduction, Summary',
      autoSpeakTitle: 'Auto-Speak Translations',
      autoSpeakDesc: 'Read finalized lines aloud via earbuds or speaker',
      ttsRateLabel: 'Speech Rate',
      chooseSourceLabel: 'Select Live Audio Input',
      phoneMicTitle: 'Phone Microphone',
      phoneMicDesc: 'Built-in noise-canceling mic · Ready immediately',
      cardBoundTitle: (name) => `VAMX Card (${name})`,
      cardUnboundTitle: 'VAMX Card (Unbound)',
      cardUnboundDesc: 'Not bound · Pair via My Device first',
      cardConnectedDesc: (pct) => `Bluetooth connected · ${pct}% battery`,
      cardDisconnectedDesc: 'Disconnected · Tap to connect and switch',
      doneBtn: 'Done',
      settingsSavedToast: 'Translation settings applied',
      pipSourceToggle: 'Source',
      pipExpandAria: 'Return to live translation',
      pipCloseAria: 'Close PiP',
      pipPlayAria: 'Resume translation',
      pipPauseAria: 'Pause translation',
      pipCardSource: (name) => `${name} · Drag to dock`,
      pipPhoneSource: 'Phone Mic · Drag to dock',
    },
    liveRecord: {
      statusRecording: 'Recording',
      statusPaused: 'Paused',
      cancel: 'Cancel',
      sourceCard: (name) => `${name} · Direct`,
      sourcePhone: 'Phone Mic Live',
      pausedNotice: 'Paused · Tap Resume below to continue recording',
      promptCard: 'Capturing high-fidelity audio from card — add bookmarks or open live translate anytime',
      promptPhone: 'High-sensitivity pickup active — keep 30–60 cm from speaker',
      noteBtn: 'Note',
      translateBtn: 'Translate',
      markedFeedback: 'Marked',
      markHighlightBtn: 'Bookmark',
      saveAria: 'End and save',
      saveLabel: 'Save',
      resumeAria: 'Resume recording',
      pauseAria: 'Pause recording',
      resumeLabel: 'Resume',
      pauseLabel: 'Pause',
      drawerTitle: 'Add Live Note',
      drawerCancel: 'Cancel',
      drawerPlaceholder: (time) => `Capture key note or action item at ${time}…`,
      drawerAddBtn: 'Add to Timeline',
      quickTags: ['Key Decision', 'Follow-up', 'Risk', 'Idea'],
      defaultHighlightPrefix: 'Bookmark @ ',
    },
    importSheet: {
      menuTitle: 'Import Audio',
      closeMenuAria: 'Close import menu',
      optComments: 'Download Comments',
      optCommentsSub: 'Import YouTube video comments & insights',
      optLocal: 'Local Import',
      optLocalSub: 'Choose audio files from your device',
      optLink: 'Link Import',
      optLinkSub: 'Import supported video or podcast URLs',
      optRecord: 'Record',
      optRecordSub: 'Start a quick live recording now',
      linkTitle: 'Link Import',
      linkHeading: 'Enter Media URL',
      linkDesc: 'Supports public links from YouTube, Bilibili, Douyin, Kuaishou, Facebook, and X/Twitter.',
      linkLabel: 'Media URL',
      fillExample: 'Use Sample',
      linkPlaceholder: 'Paste share link or text containing URL',
      linkInvalidErr: 'Please enter a valid URL starting with http:// or https://',
      targetLangLabel: 'Target Language',
      folderLabel: 'Folder',
      diarizeLabel: 'Speaker Diarization',
      processingBtn: 'Processing…',
      linkSubmit: 'Start Processing',
      localTitle: 'Local Import',
      localHeading: 'Upload Audio File',
      localDesc: 'Supports English, Chinese, Japanese, Korean, and 10+ more languages.',
      localAudioLabel: 'Audio File',
      localPickBtn: 'Choose File',
      localNoFile: 'No file selected',
      localHint: 'Recommended under 4 hours per file; supports MP3, M4A, AAC, AMR, WAV, OGG, FLAC, OPUS.',
      localSubmitting: 'Importing & transcribing…',
      localSubmit: 'Import & Transcribe',
      commentsTitle: 'Download Comments',
      commentsHeading: 'Enter YouTube Video URL',
      commentsDesc: 'Only publicly accessible YouTube video URLs are supported.',
      commentsInputLabel: 'YouTube Video URL',
      commentsPlaceholder: 'Enter YouTube video link',
      commentsInvalidErr: 'Please enter a valid YouTube URL (youtube.com or youtu.be)',
      commentsDiarizeLabel: 'Separate commenters & generate summary',
      commentsDownloadOnly: 'Download comments',
      commentsDownloadAudio: 'Also download audio track',
      commentsSubmitting: 'Transcribing…',
      commentsSubmit: 'Transcribe',
      deviceTitle: 'Import Files',
      deviceUnboundStatus: 'No hardware voice card bound',
      deviceConnectedStatus: (name, pending, imported) => `${name} · ${pending} pending · ${imported} imported`,
      deviceOfflineStatus: 'Card offline · Showing cached history',
      importAllBtn: 'Import All',
      importOneBtn: 'Import',
      closeImportAria: 'Close import',
      tabAll: (n) => `All (${n})`,
      tabPending: (n) => `Pending (${n})`,
      tabImported: (n) => `Imported (${n})`,
      searchCardPlaceholder: 'Search filenames on card',
      refreshCardAria: 'Refresh device files',
      emptyCardFiles: 'No matching files on card',
      pendingBadge: '· Pending',
      importedBadge: 'Imported',
      importBtn: 'Import',
      openMenuFooterBtn: 'Open Import Audio (Comments / Local / Link / Mic)',
      justImportedDate: 'Just imported',
      justImportedLocalDate: 'Local Import',
      justImportedLinkDate: 'Link Import',
      justImportedCommentsDate: 'Comments',
      toastCardImported: (name) => `Imported ${name}`,
      toastCardBatch: (n) => `Imported ${n} file(s) from card`,
      toastLocalImported: (name) => `Imported and transcribed "${name}"`,
      toastLinkImported: (platform) => `Imported and transcribed ${platform} media`,
      toastCommentsAudioDone: 'Comments transcribed & audio downloaded',
      toastCommentsOnlyDone: 'YouTube comments downloaded & transcribed',
    },
  },
  vi: {
    common: {
      allFiles: 'Tất cả tệp',
      unfiled: 'Chưa phân loại',
      close: 'Đóng',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      save: 'Lưu',
      delete: 'Xóa',
      restore: 'Khôi phục',
      rename: 'Đổi tên',
      move: 'Di chuyển',
      exportBtn: 'Xuất',
      copy: 'Sao chép',
      copied: 'Đã chép',
      retry: 'Thử lại',
      justNow: 'Vừa xong',
      itemsUnit: 'mục',
      minutesUnit: 'phút',
      speakerDefault: 'Người nói',
      speakerN: (n) => `Người nói ${n}`,
      phoneFileDate: 'Tệp điện thoại',
      localImportDate: 'Nhập cục bộ',
      linkImportDate: 'Nhập từ liên kết',
      commentsImportDate: 'Âm thanh bình luận',
      cardFastSyncDate: 'Vừa xong · Đồng bộ thẻ',
    },
    auth: {
      deletedTitle: 'Tài khoản đã bị xóa vĩnh viễn',
      signedOutTitle: 'Đã đăng xuất',
      deletedDesc: 'Dữ liệu cục bộ và đám mây đã được xóa. Bạn có thể đăng ký lại hoặc khôi phục dữ liệu mẫu.',
      signedOutDesc: 'Đăng nhập lại để tiếp tục truy cập kho ghi âm, mẫu tóm tắt và đồng bộ thiết bị.',
      reRegisterTitle: 'Đăng ký / Đăng nhập VAMX',
      welcomeBackTitle: 'Chào mừng trở lại VAMX',
      phoneOrEmailLabel: 'Số điện thoại / Email',
      phoneOrEmailPlaceholder: 'Nhập số điện thoại hoặc email',
      passwordLabel: 'Mật khẩu',
      passwordOptionalLabel: 'Mật khẩu (Tùy chọn)',
      passwordSetPlaceholder: 'Đặt mật khẩu đăng nhập',
      passwordEnterPlaceholder: 'Nhập mật khẩu hoặc bỏ trống',
      createNewAccountBtn: 'Tạo tài khoản & Tiếp tục',
      signInBtn: 'Đăng nhập ngay',
      restoreDemoAccountBtn: 'Khôi phục tài khoản & dữ liệu mẫu',
      footerTip: 'Dữ liệu và tùy chọn được lưu an toàn tại không gian làm việc cục bộ',
      errEmptyAccount: 'Vui lòng nhập số điện thoại hoặc email',
      errEmptyPassword: 'Vui lòng đặt mật khẩu',
      toastCreated: 'Đã tạo tài khoản và đăng nhập',
      toastSignedIn: 'Chào mừng trở lại, đã đăng nhập',
      tagline: 'Nắm bắt trọn vẹn mọi cuộc trò chuyện',
      deletedBanner: 'Tài khoản trước đây đã bị xóa vĩnh viễn. Bạn có thể đăng ký mới hoặc khôi phục dữ liệu mẫu.',
      emailOrPhoneInputLabel: 'Email / Số điện thoại',
      loginPwdPlaceholder: 'Nhập mật khẩu',
      registerAndSignIn: 'Đăng ký & Đăng nhập',
      signInVamx: 'Đăng nhập VAMX',
      quickContinueWith: (acct) => `Tiếp tục với ${acct}`,
      restoreDemoExperience: 'Khôi phục dữ liệu mẫu',
      errEmptyPwd: 'Vui lòng nhập mật khẩu',
      toastWelcomeBack: (acct) => `Chào mừng trở lại, ${acct}`,
      toastResignedIn: (acct) => `Đã đăng nhập lại ${acct}`,
    },
    sidebar: {
      modeMobile: 'VAMX Di động',
      modeDesktop: 'Màn hình rộng',
      recordingNow: 'Đang ghi âm',
      unboundDevice: 'Chưa ghép thiết bị',
      tapToBind: 'Nhấn để ghép',
      battery: (pct) => `Pin ${pct}%`,
    },
    files: {
      multiSelect: 'Chọn nhiều',
      cancelMultiSelect: 'Hủy chọn',
      selectAll: 'Chọn tất cả',
      deselectAll: 'Bỏ chọn',
      selectedCount: (n) => `Đã chọn ${n}`,
      batchMove: 'Di chuyển',
      batchDelete: 'Xóa',
      askVamx: 'Hỏi VAMX',
      fastSyncBanner: (name) => `Đang truyền từ ${name}…`,
      fastSyncing: 'Đang truyền…',
      fastSync: 'Truyền nhanh',
      trashBanner: (count) => `Thùng rác (${count})`,
      emptyTrashBtn: 'Dọn sạch',
      emptyTrashTitle: 'Thùng rác trống',
      emptyFilesTitle: 'Không tìm thấy bản ghi',
      emptySearchHint: 'Thử xóa từ khóa hoặc chuyển bộ lọc khác',
      emptyFolderHint: 'Nhấn Nhập tệp ở trên hoặc nút micro xanh bên dưới để ghi âm',
      clearSearchBtn: 'Xóa tìm kiếm',
      trashedAt: (at) => `Đã xóa ${at === '刚刚' || !at ? 'vừa xong' : at}`,
      generatingStatus: 'Đang xử lý…',
      failedStatus: 'Lỗi xử lý',
      retryingBadge: 'Nhấn để thử lại',
      noSelectionDesktop: 'Chọn một bản ghi để xem dạng sóng, chép lời và tóm tắt AI',
      openMenuAria: (title) => `Thao tác ${title}`,
      backToList: 'Quay lại',
      clearSearchAria: 'Xóa tìm kiếm',
      trashedHint: 'Bản ghi đã xóa lưu tại đây để khôi phục hoặc xóa vĩnh viễn',
      emptyTrashAction: 'Dọn sạch Thùng rác',
      emptyTrashDesc: 'Bản ghi cục bộ hoặc đám mây đã xóa sẽ tạm lưu tại đây',
      emptyFilesDesc: 'Thử chuyển thư mục, xóa bộ lọc hoặc nhấn nút micro xanh bên dưới',
      backToAllFiles: 'Về Tất cả tệp',
      trashBothBadge: 'Cục bộ · Đám mây',
      trashCloudBadge: 'Bản đám mây',
      trashLocalBadge: 'Bản cục bộ',
      cloudBadge: 'Đám mây',
      localBadge: 'Cục bộ',
      deleteForeverAria: 'Xóa vĩnh viễn',
      headerDeviceAria: 'Trạng thái thẻ & điều khiển nhanh',
      headerSearchAria: 'Tìm kiếm hoặc Hỏi AI',
      headerProfileAria: 'Tài khoản & Cài đặt',
      desktopBackToMobile: 'Về giao diện di động',
    },
    toolbox: {
      askVamxDynamicSub: (count) => `Đối chiếu ${count} bản ghi và trích dẫn mốc thời gian`,
      liveTranslateCardSub: 'Phụ đề song ngữ & giọng đọc',
      roomsLiveSub: (count) => `${count} phòng đang mở`,
      roomsIdleSub: 'Phòng dịch nhiều người',
      importAudioCardSub: 'Bình luận · Tệp · Liên kết · Ghi âm',
      templatesCountSub: (count) => `${count} mẫu tóm tắt chuẩn hóa`,
      cardUnboundSub: 'Chưa ghép thẻ · Nhấn để quản lý hoặc nhập',
      cardPendingSub: (name, pending) => `${name} · ${pending} tệp chờ nhập`,
      cardSyncedSub: (name, total) => `${name} · Đã đồng bộ ${total} tệp`,
      pendingBadge: (count) => `${count} chờ`,
      dockNavAria: 'Điều hướng chính',
      dockRecordActiveAria: 'Xem ghi âm trực tiếp',
      dockRecordStartAria: 'Bắt đầu ghi âm',
    },
    sheets: {
      deviceTitle: 'Thiết bị của tôi',
      cardFilesBtn: 'Tệp trên thẻ',
      liveTranslateBtn: 'Dịch trực tiếp',
      unboundTitle: 'Chưa ghép thẻ ghi âm',
      startRecord: 'Bắt đầu ghi âm',
      recordingInProgress: 'Đang ghi · Nhấn để xem',
      bindCardNow: 'Ghép thẻ ghi âm',
      scanningNearby: 'Đang quét thẻ Bluetooth gần đây…',
      selectNearbyPrompt: 'Chọn thiết bị để ghép nối:',
      connectThisCard: 'Kết nối thẻ',
      batteryLabel: 'Pin',
      storageLabel: 'Dung lượng trống',
      usbReadLabel: 'Chế độ USB',
      phoneLocalAudio: 'Âm thanh trên máy',
      selectPhoneAudio: 'Chọn tệp',
      cardFilesTitle: 'Tệp trên thẻ',
      cardFilesCount: (n) => `${n} tệp`,
      refresh: 'Làm mới',
      unbind: 'Hủy ghép',
      folderSheetTitle: 'Bộ lọc & Thư mục',
      statusSection: 'Trạng thái tệp',
      foldersSection: 'Thư mục của tôi',
      deletedSection: 'Đã xóa',
      newFolderBtn: 'Thư mục mới',
      rowMenuRenameLabel: 'Đổi tên',
      renamePlaceholder: 'Nhập tên bản ghi',
      moveToFolder: 'Chuyển vào thư mục',
      backupToCloud: 'Sao lưu lên đám mây',
      deleteLocalCopy: 'Xóa bản cục bộ',
      deleteCloudCopy: 'Xóa bản đám mây',
      batchMoveTitle: (n) => `Chuyển ${n} bản ghi vào`,
      newFolderTitle: 'Thư mục mới',
      newFolderPlaceholder: 'Tên thư mục…',
      createBtn: 'Tạo',
      deviceManageTitle: 'Quản lý tệp trên thẻ',
      unboundCardLabel: 'Chưa ghép thẻ ghi âm',
      viewLiveRecStatus: 'Xem ghi âm trực tiếp',
      startCardDirectRec: 'Ghi âm trực tiếp bằng thẻ',
      usePhoneMicRec: 'Ghi âm bằng micro máy',
      statusUnbound: 'Chưa ghép',
      statusConnected: 'Đã kết nối',
      statusDisconnected: 'Đã ngắt',
      firmwareLabel: 'Phần mềm',
      cardStorageLabel: 'Đã dùng / Tổng',
      reconnect: 'Kết nối lại',
      disconnect: 'Ngắt kết nối',
      unbindDevice: 'Hủy ghép thiết bị',
      scanningVamxCards: 'Đang quét thẻ VAMX gần đây…',
      nearbyVamxCards: 'Thẻ VAMX gần đây',
      collapse: 'Thu gọn',
      bleSearching: 'Đang tìm Bluetooth…',
      bindAndConnect: 'Ghép & Kết nối',
      scanNearbyDevices: 'Quét thiết bị gần đây',
      scanNoDeviceHint: 'Chưa thấy thẻ. Hãy đảm bảo thẻ đã bật, ở gần điện thoại và chưa ghép với máy khác.',
      selectPhoneAudioFull: 'Chọn tệp âm thanh từ điện thoại',
      trashLabel: 'Thùng rác',
      rowRenameBtn: 'Đổi tên',
      rowRenamePlaceholder: 'Sửa tiêu đề…',
      createFolderBtn: 'Tạo thư mục',
    },
    toasts: {
      usingPhoneMic: 'Bắt đầu ghi âm bằng micro điện thoại',
      scannedOneNew: 'Đã quét thẻ: phát hiện 1 bản ghi mới',
      refreshedPending: (n) => `Đã làm mới: ${n} bản ghi chưa nhập`,
      fastSyncImported: (n) => `Đã truyền nhanh và lưu ${n} bản ghi từ thẻ`,
      fastSyncDone: 'Đã hoàn tất truyền nhanh & đồng bộ đám mây',
      savedLiveRecording: (title) => `Đã lưu "${title}"`,
      liveRecTitlePrefix: 'Ghi âm trực tiếp',
      createdFolder: (name) => `Đã tạo thư mục "${name}"`,
      retriedRecording: (title) => `Đã chép lời lại "${title}"`,
      deletedLocalAndTrashed: 'Đã chuyển tệp cục bộ vào Thùng rác',
      deletedCloudAndTrashed: 'Đã chuyển tệp đám mây vào Thùng rác',
      deletedLocalKeptCloud: 'Đã xóa bản cục bộ, giữ nguyên bản đám mây',
      deletedCloudKeptLocal: 'Đã xóa bản đám mây, giữ nguyên bản cục bộ',
      restoredFromTrash: 'Đã khôi phục từ Thùng rác',
      permanentlyDeleted: 'Đã xóa vĩnh viễn bản sao',
      emptiedTrash: 'Đã dọn sạch Thùng rác',
      resetAllDone: 'Đã khôi phục dữ liệu mẫu',
      loggedOut: 'Đã đăng xuất',
      accountDeleted: 'Tài khoản đã bị xóa vĩnh viễn',
      importedFromPhone: (name) => `Đã nhập "${name}" từ máy`,
      bindCardFirst: 'Vui lòng ghép thẻ VAMX trước khi chuyển sang micro thẻ',
      connectedAndSwitchedCard: (name) => `Đã kết nối ${name} và dùng micro thẻ`,
      switchedToCard: (name) => `Đã chuyển sang micro thẻ ${name}`,
      switchedToPhone: 'Đã chuyển sang micro điện thoại',
      startedNewChat: 'Đã mở cuộc trò chuyện mới',
      jumpedToAudio: (time) => `Đã nhảy tới ${time}`,
      deviceUnbound: 'Đã hủy ghép thẻ ghi âm',
      usbEnabled: 'Đã bật chế độ USB',
      usbDisabled: 'Đã tắt chế độ USB',
      boundCard: (name) => `Đã ghép thẻ ${name}`,
      renamedTo: (name) => `Đã đổi tên thành "${name}"`,
      movedToFolder: (name) => `Đã chuyển vào "${name}"`,
      uploadedToCloud: (title) => `Đã tải "${title}" lên đám mây`,
      batchMoved: (count, folderName) => `Đã chuyển ${count} bản ghi vào "${folderName}"`,
      batchDeleted: (count) => `Đã chuyển ${count} bản ghi vào Thùng rác`,
      exportedLiveTranslation: (title) => `Đã lưu "${title}" vào Tệp`,
      translatedBlockPrefix: 'Bản dịch trực tiếp',
      endTranslation: 'Đã kết thúc dịch trực tiếp',
      pipEnabled: 'Đã bật phụ đề nổi — kéo tới góc màn hình khi chuyển trang',
      readingAloud: 'Đang đọc bản dịch',
      selectOrBindCard: 'Hãy ghép thẻ ghi âm trước hoặc dùng micro điện thoại',
      disconnectedDevice: 'Đã ngắt kết nối thiết bị',
      reconnectedDevice: (name) => `Đã kết nối lại ${name}`,
      unboundDevice: (name) => `Đã hủy ghép ${name}`,
      cancelledRecording: 'Đã hủy bản ghi',
      insertedLiveNote: 'Đã thêm ghi chú mốc thời gian',
      transferResumed: 'Đã tiếp tục và hoàn tất truyền tệp',
      defaultUserName: 'Người dùng VAMX',
      renamedRecording: 'Đã đổi tên bản ghi',
      backedUpToCloud: 'Đã sao lưu lên đám mây',
      switchedZh: '已切换为简体中文',
      switchedEn: 'Switched to English',
      switchedVi: 'Đã chuyển sang Tiếng Việt',
    },
    waveform: {
      pauseAria: 'Tạm dừng',
      playAria: 'Phát âm thanh',
      sliderAria: 'Thanh tiến trình',
      rewind10Aria: 'Tua lùi 10 giây',
      forward10Aria: 'Tua tới 10 giây',
      markTitle: 'Đánh dấu điểm quan trọng tại đây',
      markBtn: 'Đánh dấu',
      exportAria: 'Xuất hoặc chia sẻ',
    },
    deviceVisual: {
      stopHwRecTitle: 'Dừng ghi âm thẻ',
      startHwRecTitle: 'Ghi âm nhanh bằng thẻ',
      stopHwRecAria: 'Dừng ghi âm',
      startHwRecAria: 'Bắt đầu ghi âm nhanh',
    },
    profile: {
      workspaceSub: 'Quản lý điểm, thẻ ghi âm, tự động hóa & mẫu',
      preferencesSub: 'Ngôn ngữ giao diện, chép lời & thông báo',
      accountSub: 'Tài khoản đăng nhập & bảo mật dữ liệu',
      creditsAvailable: (n) => `${n.toLocaleString()} khả dụng`,
      boundStatus: (name) => `${name} · Đã ghép`,
      unboundStatus: 'Chưa ghép',
      transferPending: (n) => `${n} chờ xử lý`,
      transferTotal: (n) => `${n} tác vụ`,
      automationEnabled: (n) => `Đang bật ${n}`,
      templatesCount: (n) => `${n} mẫu`,
      trashRecoverable: (n) => `${n} có thể khôi phục`,
      trashEmpty: 'Trống',
      emailOrPhoneUnbound: 'Chưa liên kết',
      resetBtn: 'Khôi phục dữ liệu mẫu',
      resetConfirmTitle: 'Khôi phục toàn bộ dữ liệu về mặc định?',
      resetConfirmBtn: 'Xác nhận khôi phục',
      footerMotto: 'VAMX · Nắm bắt trọn vẹn mọi cuộc trò chuyện.',
      autoImportTitle: 'Tự động nhập tệp khi kết nối thẻ',
      autoImportDesc: 'Tự động kéo bản ghi mới qua Bluetooth & Wi-Fi',
      autoUploadTitle: 'Tự động tải lên VAMX Cloud',
      autoUploadDesc: 'Sao lưu âm thanh và đồng bộ chép lời đa thiết bị',
      autoTranscribeTitle: 'Tự động chép lời sau khi tải lên',
      autoTranscribeDesc: 'Hỗ trợ phân tách người nói và nhận diện đa ngôn ngữ',
      autoSummaryTitle: 'Tự động tạo tóm tắt AI',
      autoSummaryDesc: 'Trích xuất ý chính, quyết định và việc cần làm theo mẫu mặc định',
      wifiOnlyTitle: 'Chỉ tải lên hàng loạt qua Wi-Fi',
      wifiOnlyDesc: 'Tiết kiệm dữ liệu di động',
      defaultTemplateLabel: 'Mẫu tóm tắt mặc định',
      newTemplateBtn: 'Tạo mẫu tùy chỉnh',
      defaultBadge: 'Mặc định',
      useAsDefaultBtn: 'Đặt mặc định',
      customBadge: 'Tùy chỉnh',
      createTemplateModalTitle: 'Tạo mẫu tóm tắt mới',
      templateNameLabel: 'Tên mẫu',
      templateNamePlaceholder: 'VD: Họp tuần sản phẩm / Phỏng vấn',
      templateDescLabel: 'Mô tả cấu trúc',
      templateDescPlaceholder: 'Mô tả các mục hoặc trọng tâm cần trích xuất…',
      templateToneLabel: 'Tông màu',
      toneIndigo: 'Xanh dương',
      toneAmber: 'Vàng hổ phách',
      toneEmerald: 'Xanh ngọc',
      toneSlate: 'Xám than',
      createTemplateSubmit: 'Tạo & Sử dụng',
      toastTemplateCreated: (name) => `Đã tạo mẫu "${name}"`,
      toastDefaultTemplateUpdated: 'Đã cập nhật mẫu mặc định',
      noCardTitle: 'Chưa ghép thẻ ghi âm VAMX',
      noCardDesc: 'Quét thẻ ghi âm Bluetooth gần đây hoặc dùng micro máy và tệp cục bộ.',
      scanNearbyBtn: 'Quét thẻ gần đây',
      discoveredDevices: 'Thiết bị tìm thấy:',
      bindThisBtn: 'Ghép ngay',
      connectedBadge: 'Đã kết nối',
      disconnectedBadge: 'Ngoại tuyến',
      protocolLabel: 'Giao thức',
      batteryLabel: 'Pin còn lại',
      storageLabel: 'Bộ nhớ thẻ',
      firmwareLabel: 'Phần mềm',
      macLabel: 'Địa chỉ MAC',
      toggleUsb: 'Chế độ ổ đĩa USB',
      reconnectBtn: 'Kết nối lại',
      disconnectBtn: 'Ngắt Bluetooth',
      cardFilesCardBtn: 'Tệp trên thẻ',
      phonePickerCardBtn: 'Âm thanh máy',
      switchCardBtn: 'Đổi thẻ khác',
      unbindCardBtn: 'Hủy ghép thẻ',
      toastBound: (name) => `Đã ghép và kết nối ${name}`,
      toastUsbToggled: (on) => (on ? 'Đã bật chế độ USB' : 'Đã tắt chế độ USB'),
      toastReconnected: 'Đã kết nối lại thiết bị',
      toastDisconnected: 'Đã ngắt kết nối Bluetooth',
      toastUnbound: 'Đã hủy ghép thẻ ghi âm',
      retryAllFailed: (n) => `Thử lại mục lỗi (${n})`,
      noTransfers: 'Không có tác vụ truyền tải',
      failedStatus: 'Thất bại',
      completedStatus: 'Hoàn tất',
      pausedStatus: 'Tạm dừng',
      uploadingStatus: (pct) => `Đang tải ${pct}%`,
      remainingMinutes: (mins) => `Đủ cho ~${mins.toLocaleString()} phút chép lời & tóm tắt AI chính xác cao`,
      checkedInToday: 'Đã điểm danh hôm nay (+100 điểm)',
      dailyCheckIn: 'Điểm danh hằng ngày (+100 điểm)',
      creditRuleTitle: 'Quy tắc điểm',
      creditRule1: '• Chép lời âm thanh: 10 điểm / phút',
      creditRule2: '• Tóm tắt AI & Sơ đồ: 5 điểm / lần',
      creditRule3: '• Phiên dịch trực tiếp: 15 điểm / phút',
      toastCheckedIn: 'Điểm danh thành công! +100 điểm',
      displayNameLabel: 'Tên hiển thị',
      displayNamePlaceholder: 'Nhập tên hiển thị',
      emailLabel: 'Email liên kết',
      phoneLabel: 'Số điện thoại',
      uploadAvatarBtn: 'Tải ảnh đại diện',
      removeAvatarBtn: 'Xóa ảnh',
      avatarFileHint: 'JPG, PNG hoặc WebP · cắt thành hình vuông',
      avatarInvalidFile: 'Chọn ảnh JPG, PNG hoặc WebP',
      avatarTooLarge: 'Ảnh phải nhỏ hơn 8 MB',
      saveProfileBtn: 'Lưu hồ sơ',
      toastProfileEmpty: 'Tên hiển thị không được để trống',
      toastProfileSaved: 'Đã cập nhật hồ sơ',
      currentPwdLabel: 'Mật khẩu hiện tại',
      currentPwdPlaceholder: 'Nhập mật khẩu hiện tại',
      newPwdLabel: 'Mật khẩu mới',
      newPwdPlaceholder: 'Ít nhất 6 ký tự',
      confirmPwdLabel: 'Xác nhận mật khẩu',
      confirmPwdPlaceholder: 'Nhập lại mật khẩu mới',
      pwdRuleHint: 'Nên kết hợp chữ cái và chữ số để bảo vệ tài khoản',
      submitPwdBtn: 'Cập nhật mật khẩu',
      toastPwdEmpty: 'Vui lòng điền đầy đủ thông tin mật khẩu',
      toastPwdShort: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      toastPwdMismatch: 'Mật khẩu xác nhận không khớp',
      toastPwdUpdated: 'Đã đổi mật khẩu',
      trashSheetCount: (n) => `${n} bản ghi có thể khôi phục`,
      emptyAllBtn: 'Dọn sạch tất cả',
      trashEmptyState: 'Thùng rác đang trống',
      deletedAtPrefix: 'Đã xóa ',
      deleteForeverBtn: 'Xóa vĩnh viễn',
      logoutTitle: 'Đăng xuất tài khoản?',
      logoutDesc: 'Bạn cần đăng nhập lại để truy cập kho ghi âm, mẫu và đồng bộ đám mây.',
      confirmLogoutBtn: 'Xác nhận đăng xuất',
      deleteAccountTitle: 'Xóa tài khoản vĩnh viễn',
      deleteWarn1: '• Xóa sạch mọi bản ghi âm & ghi chú AI cục bộ và đám mây',
      deleteWarn2: '• Xóa toàn bộ điểm còn lại, phòng dịch và mẫu tùy chỉnh',
      deleteWarn3: '• Hủy ghép nối toàn bộ thẻ ghi âm VAMX',
      deleteConfirmPromptPrefix: 'Nhập ',
      deleteConfirmKeyword: 'XAC NHAN',
      deleteConfirmPromptSuffix: ' để xác nhận thao tác không thể hoàn tác',
      deleteConfirmPlaceholder: 'Nhập "XAC NHAN"',
      confirmDeleteBtn: 'Xóa tài khoản vĩnh viễn',
      toastDeletedAccount: 'Tài khoản đã bị xóa vĩnh viễn',
      uiLanguageAria: 'Ngôn ngữ giao diện',
      transcribeLangAria: 'Ngôn ngữ chép lời mặc định',
      transcribeLangToast: (langLabel) => `Ngôn ngữ chép lời mặc định: "${langLabel}"`,
      notifyEnabledToast: 'Đã bật thông báo hoàn tất',
      notifyDisabledToast: 'Đã tắt thông báo hoàn tất',
      pipeImport: 'Nhập âm thanh',
      pipeCloud: 'Đồng bộ mây',
      pipeAi: 'Chép lời & AI',
      automationSheetTitle: 'Tự động hóa',
      templatesSheetTitle: 'Trung tâm mẫu',
      templatesSheetSub: 'Cấu trúc rõ ràng cho mọi cuộc trò chuyện',
      createTemplateSheetSub: 'Tùy chỉnh trọng tâm và bố cục tóm tắt AI',
      createTemplateDescOptional: 'Mô tả cấu trúc (Tùy chọn)',
      saveTemplateBtn: 'Lưu mẫu',
      closeAria: 'Đóng',
      deviceSheetTitle: 'Thiết bị của tôi',
      devUnboundSub: 'Chưa ghép thẻ ghi âm phần cứng',
      devConnectedSub: (protocol) => `Đã kết nối · ${protocol}`,
      devDisconnectedSub: 'Chưa kết nối · Kết nối lại hoặc quản lý ghép',
      devConnectedBattery: (pct) => `Đã kết nối · Pin ${pct}%`,
      devDisconnectedBadge: 'Đã ngắt kết nối',
      devReadyToast: 'Thẻ ghi âm sẵn sàng — nhấn nút trên thẻ để ghi ngay',
      checkUpdateBtn: 'Kiểm tra',
      firmwareLatestToast: (ver) => `Phần mềm v${ver} đã là bản mới nhất`,
      pendingCountLabel: 'Chờ nhập',
      pendingCountValue: (n) => `${n} tệp`,
      usbDesc: 'Cho phép đọc nhanh tệp trên thẻ qua cáp USB',
      syncCardBtn: 'Đồng bộ bản ghi từ thẻ',
      addDeviceBtn: 'Thêm thiết bị',
      rescanBtn: 'Quét lại',
      bleSearching: 'Đang tìm Bluetooth BLE…',
      bleSearchingTitle: 'Đang quét thiết bị VAMX gần đây…',
      foundDevicesTitle: 'Thiết bị có thể ghép',
      boundBadge: 'Đã ghép',
      bindAndConnectBtn: 'Ghép & Kết nối',
      cardBatteryShort: (pct) => `Pin ${pct}%`,
      phoneAudioLinkBtn: 'Chọn âm thanh từ điện thoại',
      transfersSheetTitle: 'Truyền tải & Tác vụ',
      transfersSheetSub: 'Giữ kết nối khi tải lên; hỗ trợ tiếp tục nếu gián đoạn',
      transferInterrupted: 'Gián đoạn',
      resumeTransferBtn: 'Tiếp tục',
      creditsCurrentLabel: 'Điểm khả dụng',
      creditsTotalEarned: 'Tổng kỳ này 240,375',
      creditsCheckIn150: 'Điểm danh +150',
      creditsCheckedIn150: 'Đã điểm danh',
      toastCheckedIn150: 'Đã nhận điểm danh +150 điểm',
      creditsFreeTitle: 'Miễn phí vĩnh viễn',
      creditsFreeDesc: '150 điểm mỗi ngày · Chép lời & xuất cơ bản',
      creditsProTitle: 'VAMX Pro',
      creditsProDesc: '3.000 phút/tháng · Không giới hạn sơ đồ & phiên dịch',
      creditsProPrice: '239K / tháng',
      creditsProToast: 'Tài khoản đang mở đầy đủ tính năng trải nghiệm Pro',
      trashSheetTitle: 'Thùng rác ghi âm',
      trashSheetSub: 'Bản ghi cục bộ và đám mây đã xóa lưu tại đây để khôi phục',
      trashCountLine: (n) => `${n} bản ghi đã xóa`,
      trashEmptyDesc: 'Bản ghi đã xóa sẽ tạm lưu tại đây để khôi phục khi cần',
      logoutCurrentPrefix: 'Đang đăng nhập: ',
      cancelDeleteAccount: 'Giữ lại',
      deleteConfirmAck: 'Tôi hiểu toàn bộ dữ liệu đã xóa sẽ không thể khôi phục',
      noBoundCardName: 'Chưa ghép',
      deleteSheetSub: 'Thao tác này có hiệu lực vĩnh viễn và không thể hoàn tác',
      deleteWarnHeading: 'Khi xóa tài khoản, các dữ liệu sau sẽ bị xóa sạch:',
      deleteWarnCredits: (n) => `Hồ sơ, thông tin đăng nhập và ${n.toLocaleString()} điểm còn lại`,
      deleteWarnFiles: 'Toàn bộ âm thanh, chép lời và tóm tắt AI cục bộ & đám mây',
      deleteWarnCard: (name) => `Thẻ phần cứng (${name}) sẽ tự động hủy ghép`,
    },
    detail: {
      backToList: 'Tệp',
      moveToFolderBtn: 'Thư mục',
      renameTitleAria: 'Nhấn để đổi tên',
      moreActionsAria: 'Thao tác khác',
      renamePlaceholder: 'Tiêu đề bản ghi…',
      folderPrefix: 'Thư mục: ',
      sourceCard: 'Thẻ ghi âm',
      sourcePhone: 'Micro máy',
      sourceLink: 'Liên kết',
      sourceImport: 'Nhập cục bộ',
      localOnlyBadge: 'Chỉ cục bộ',
      tabSummary: 'Tóm tắt',
      tabTranscript: 'Chép lời',
      tabNotes: 'Ghi chú',
      tabMindmap: 'Sơ đồ',
      tabAsk: 'Hỏi AI',
      stagePreparing: 'Đang rà soát ý chính và ngữ cảnh chép lời…',
      stageDrafting: 'Đang chắt lọc luận điểm và việc cần làm…',
      stagePolishing: 'Đang hoàn thiện bố cục tóm tắt…',
      summaryHeader: 'Tóm tắt AI có cấu trúc',
      summaryTemplateSelectAria: 'Chọn mẫu tóm tắt',
      summaryLangSelectAria: 'Chọn ngôn ngữ tóm tắt',
      summaryAutoLanguageLabel: 'Tự động',
      regenerateBtn: 'Tạo lại',
      generatingBtn: 'Đang tạo…',
      emptySummaryTitle: 'Chưa có tóm tắt AI',
      emptySummaryDesc: 'Trích xuất ý chính và việc cần làm chỉ với một lần nhấn',
      generateSummaryBtn: 'Tạo tóm tắt ngay',
      sectionOverview: 'Tổng quan',
      sectionKeyPoints: 'Điểm chính',
      sectionDecisions: 'Quyết định',
      sectionActions: 'Việc cần làm',
      actionOwnerPrefix: 'Phụ trách: ',
      copySummaryBtn: 'Chép tóm tắt',
      exportMarkdownBtn: 'Xuất Markdown',
      transcriptHeader: 'Bản chép lời & Người nói',
      speakersCount: (n) => `${n} người nói`,
      segmentsCount: (n) => `${n} đoạn`,
      searchTranscriptAria: 'Tìm trong bản chép lời',
      searchTranscriptPlaceholder: 'Tìm nội dung hoặc người nói…',
      mergeSpeakersBtn: 'Gộp người nói',
      separateSpeakersBtn: 'Tách người nói',
      editSpeakersBtn: 'Sửa người nói',
      doneEditBtn: 'Xong',
      speakerPanelTitle: 'Đổi tên người nói hàng loạt',
      speakerNamePlaceholder: (id) => `Tên người nói (${id})`,
      emptyTranscriptTitle: 'Chưa có bản chép lời',
      emptyTranscriptDesc: 'Nhấn nút bên dưới để nhận diện giọng nói & phân tách người nói',
      startTranscribeBtn: 'Bắt đầu chép lời',
      retranscribingStatus: 'Đang phân tích lại giọng nói và văn bản…',
      noTranscriptMatch: 'Không tìm thấy đoạn phù hợp',
      clickToEditSpeaker: 'Nhấn để đổi tên người nói',
      clickToJumpAudio: 'Nhảy tới đoạn âm thanh',
      highlightsTitle: 'Đánh dấu mốc thời gian',
      addHighlightHere: 'Đánh dấu mốc hiện tại',
      noHighlights: 'Chưa có đánh dấu. Nhấn Đánh dấu trên trình phát khi đang nghe.',
      jumpTooltip: 'Phát từ mốc này',
      noteLabel: 'Ghi chú',
      notePlaceholder: 'Bổ sung chi tiết cho mốc đánh dấu này…',
      freeNotesTitle: 'Ghi chú tự do',
      freeNotesHint: 'Tự động lưu',
      freeNotesPlaceholder: 'Ghi lại bối cảnh cuộc họp, ý tưởng cá nhân hoặc việc cần nhớ…',
      mindmapHeader: 'Sơ đồ tư duy',
      refreshMindmapBtn: 'Làm mới',
      generatingMindmapBtn: 'Đang vẽ…',
      emptyMindmapTitle: 'Chưa có sơ đồ tư duy',
      generateMindmapBtn: 'Tạo sơ đồ tư duy',
      mindmapGeneratingDesc: 'Đang sắp xếp cấu trúc phân cấp và các nhánh chủ đề…',
      askEmptyTitle: 'Hỏi AI về bản ghi âm này',
      askQuick1: 'Kết luận cốt lõi của bản ghi này là gì?',
      askQuick2: 'Liệt kê các đầu việc cần theo dõi và người phụ trách',
      askQuick3: 'Trích xuất 3 câu nói hoặc ý tưởng đáng chú ý',
      askThinking: 'Đang tra cứu ngữ cảnh bản ghi…',
      askInputPlaceholder: 'Đặt câu hỏi về bản ghi này…',
      askSendAria: 'Gửi câu hỏi',
      renameRecordingAction: 'Đổi tên bản ghi',
      moveFolderAction: 'Chuyển vào thư mục',
      retranscribeAction: 'Chép lời lại',
      exportShareAction: 'Xuất hoặc chia sẻ',
      deleteLocalAction: 'Xóa tệp cục bộ',
      deleteCloudAction: 'Xóa bản đám mây',
      moveSheetTitle: 'Chuyển vào thư mục',
      exportSheetTitle: 'Xuất & Chia sẻ',
      exportCopySummary: 'Sao chép tóm tắt AI',
      exportCopySummaryDesc: 'Gồm tổng quan, điểm chính, quyết định & việc cần làm',
      exportCopyTranscript: 'Sao chép toàn bộ chép lời',
      exportCopyTranscriptDesc: 'Kèm mốc thời gian và tên người nói',
      exportDownloadMd: 'Tải ghi chú Markdown (.md)',
      exportDownloadMdDesc: 'Phù hợp nhập vào Notion, Obsidian hoặc Docs',
      exportShareLink: 'Sao chép liên kết chia sẻ',
      exportShareLinkDesc: 'Tạo liên kết chỉ đọc',
      toastTitleUpdated: 'Đã cập nhật tiêu đề',
      toastMovedFolder: (name) => `Đã chuyển vào "${name}"`,
      toastAddedHighlight: (time) => `Đã đánh dấu ${time}`,
      toastMergedSpeakers: 'Đã gộp thành một người nói',
      toastSeparatedSpeakers: 'Đã khôi phục phân tách nhiều người nói',
      toastSpeakerUpdated: 'Đã cập nhật tên người nói',
      toastSummaryReady: 'Đã tạo tóm tắt AI',
      toastTranscriptReady: 'Đã hoàn tất chép lời',
      toastMindmapReady: 'Đã tạo sơ đồ tư duy',
      toastCopiedSummary: 'Đã sao chép tóm tắt',
      toastCopiedTranscript: 'Đã sao chép toàn bộ chép lời',
      toastDownloadedMd: 'Đã xuất tệp Markdown',
      toastCopiedShareLink: 'Đã sao chép liên kết chia sẻ',
      toastSeekedTo: (time) => `Đã nhảy tới ${time}`,
      defaultHighlightNote: 'Điểm nổi bật',
      newHighlightNote: 'Đánh dấu mới',
      autoSummaryOverview: (tplName, title, firstLine) =>
        `Đã tóm tắt "${title}" theo mẫu ${tplName}. Trọng tâm: ${firstLine}`,
      autoSummaryKp1: (tplName) => `Phân loại nội dung theo cấu trúc ${tplName} và giữ nguyên mốc thời gian.`,
      autoSummaryKp2: 'Làm rõ chủ đề thảo luận chính và quan điểm của từng người tham gia.',
      autoSummaryKp3: 'Trích xuất đầu việc cụ thể gắn liền với các mốc đánh dấu.',
      autoSummaryDecision: 'Đã chốt kết luận giai đoạn hiện tại; có thể cập nhật trạng thái việc cần làm bất cứ lúc nào.',
      autoSummaryAction1: 'Rà soát các mốc đánh dấu thời gian và chi tiết chép lời',
      autoSummaryAction2: 'Chia sẻ biên bản hoàn chỉnh với nhóm cộng tác',
      autoActionOwner1: 'Tôi',
      autoActionOwner2: 'Nhóm dự án',
      autoAskResponse: (question, excerpt, firstTime) =>
        `Về câu hỏi "${question}", dựa trên bản ghi này:\n\n• Trích đoạn chính: ${excerpt}\n• Gợi ý tiếp theo: Nhấn mốc ${firstTime} bên dưới để nghe lại nguyên văn.`,
      autoAskDefaultExcerpt: 'Đã thu âm xong. Hãy chạy chép lời trước để hỏi đáp theo ngữ cảnh chính xác hơn.',
      statusTranscribed: 'Đã chép lời',
      statusProcessing: 'Đang xử lý',
      statusPending: 'Chờ chép lời',
      statusFailed: 'Lỗi xử lý',
      miniPauseAria: 'Tạm dừng',
      miniPlayAria: 'Tiếp tục phát',
      miniSliderAria: 'Thanh tua mini',
      pauseAudioBarAria: 'Tạm dừng',
      templatePrefix: 'Mẫu · ',
      mindmapSubtitle: 'Cấu trúc kiến thức',
      askHeadline: 'Hỏi VAMX',
      askTagline: 'Tìm câu trả lời có căn cứ từ bản ghi này.',
      askHistoryCount: (n) => `Lịch sử (${n})`,
      askNewChat: 'Cuộc mới',
      askSourcesHeader: 'Nguồn âm thanh (Nhấn để nghe)',
      askSaveToNotes: 'Lưu ghi chú',
      askSavedToNotesToast: 'Đã lưu vào mục Ghi chú của bản ghi',
      askRemoveContextAria: 'Gỡ ngữ cảnh bản ghi',
      askAttachContext: 'Gắn bản ghi này',
      askQuickChips: ['Việc cần làm', 'Chốt kết luận'],
      askQuickMenuAria: 'Gắn ngữ cảnh hoặc gợi ý nhanh',
      askVoiceAria: 'Hỏi bằng giọng nói',
      askDefaultPrompt1: 'Có những đầu việc nào cần theo dõi tiếp?',
      askDefaultPrompt2: 'Tổng hợp các quyết định chính',
      askDefaultPrompt3: 'Còn vấn đề nào chưa giải quyết không?',
      deleteHighlightAria: 'Xóa đánh dấu',
      insertTimeBtn: (time) => `Chèn mốc (${time})`,
      markCurrentBtn: (time) => `Đánh dấu (${time})`,
      highlightsHeaderCount: (n) => `Mốc nổi bật (${n})`,
      notesSavedBtn: 'Đã lưu',
      saveNotesBtn: 'Lưu ghi chú',
      toastNotesSaved: 'Đã lưu ghi chú',
      toastUploadedCloud: 'Đã đồng bộ lên VAMX Cloud',
      moreTitle: 'Thao tác',
      closeMenuAria: 'Đóng menu',
      downloadTxt: 'Tải TXT',
      downloadPdf: 'Tải PDF',
      downloadWord: 'Tải WORD',
      noLocalCopy: 'Không có bản cục bộ',
      noCloudCopy: 'Không có bản đám mây',
      toastDownloadedTxt: 'Đã tải tệp TXT',
      toastDownloadedDoc: 'Đã xuất tài liệu WORD',
      toastDownloadedPdf: 'Đã bắt đầu tải tóm tắt PDF',
      confirmSpeakerBtn: 'Lưu',
      speakerInputPlaceholder: 'Tên người nói…',
      diarizedSpeakersCount: (n) => `Đã nhận ${n} người nói`,
      noDiarizationLabel: 'Chưa tách người nói',
      summaryCardEmptyHeadline: 'Biến hội thoại dài thành bước đi rõ ràng',
      mindmapEmptySubtitle: 'Biến hội thoại dài thành bước đi rõ ràng',
      stageReadingAudio: 'Đang đọc ngữ cảnh âm thanh…',
      stageDistillingTpl: (tpl) => `Đang chắt lọc ý chính theo "${tpl}"…`,
      stagePolishingActions: 'Đang tổng hợp quyết định & đầu việc…',
    },
    ai: {
      title: 'Không gian AI',
      subtitle: 'Câu trả lời có trích dẫn từ toàn bộ kho ghi âm',
      historyAria: 'Lịch sử trò chuyện',
      newChatAria: 'Hội thoại mới',
      emptyTitle: 'Hỏi VAMX mọi chi tiết',
      emptyDesc: 'Đối chiếu quyết định, trích xuất đầu việc và nhảy tới đoạn ghi âm gốc qua nhiều cuộc họp',
      prompts: [
        'Các đầu việc quan trọng cần theo dõi từ các buổi trao đổi gần đây là gì?',
        'Tổng hợp việc cần làm của Shanghai Coal Tech và KCN Shiyun',
        'Video phân tích Ngày xửa ngày xưa ở Mỹ đề cập kỹ thuật chuyển cảnh nào?',
      ],
      searchingStatus: (n) => `Đang tìm kiếm nguyên văn & kết luận trên ${n} bản ghi`,
      citationsLabel: 'Nguồn trích dẫn · Nhấn để nghe đoạn gốc',
      scopeAria: 'Phạm vi tìm kiếm',
      scopeAll: 'Tất cả bản ghi',
      scopeFolder: (name) => `Thư mục · ${name}`,
      inputPlaceholder: 'Hỏi về chi tiết, quyết định hoặc việc cần làm…',
      sendAria: 'Gửi',
      disclaimer: 'Kết quả AI có thể có sai sót — nhấn thẻ trích dẫn để đối chiếu nguyên văn',
      historyTitle: 'Lịch sử trò chuyện',
      closeHistoryAria: 'Đóng lịch sử',
      historyItems: [
        { title: 'Các đầu việc quan trọng từ các buổi trao đổi gần đây là gì?', time: 'Hôm nay 23:40' },
        { title: 'Rà soát tiến độ giai đoạn 02 KCN Shiyun', time: 'Hôm qua 16:30' },
        { title: 'Phân tích mạch thời gian Ngày xửa ngày xưa ở Mỹ', time: '19/11' },
      ],
      replyHeader: (n, body) =>
        `Đã rà soát ${n} bản ghi trong phạm vi hiện tại. Kết luận chính:\n\n${body}\n\nNhấn vào trích dẫn bên dưới để nghe lại đoạn âm thanh gốc.`,
      replyNoMatch: 'Chưa có bản ghi đã chép lời trong thư mục này. Hãy đổi phạm vi hoặc nhập tệp trước.',
    },
    rooms: {
      title: 'Phòng phiên dịch',
      subtitle: 'Phát phiên dịch đa ngôn ngữ độ trễ thấp & quản lý phòng họp',
      joinBtn: 'Nhập mã mời',
      createBtn: 'Tạo phòng',
      statTotal: 'Phòng của tôi',
      statLive: 'Đang mở',
      statListeners: 'Người nghe',
      searchPlaceholder: 'Tìm tên phòng, ngôn ngữ hoặc mã mời',
      trashToggleAria: 'Chuyển thùng rác',
      densityToggleAria: 'Đổi bố cục',
      tabAll: 'Tất cả',
      tabLive: 'Đang mở',
      tabUpcoming: 'Sắp mở',
      tabPaused: 'Tạm dừng',
      tabEnded: 'Đã kết thúc',
      statusLive: 'Đang mở',
      statusPaused: 'Tạm dừng',
      statusUpcoming: 'Sắp mở',
      statusEnded: 'Đã kết thúc',
      emptyTrash: 'Thùng rác trống',
      emptyState: 'Không có phòng phiên dịch phù hợp',
      emptyCreateHint: 'Nhấn Tạo phòng ở trên để bắt đầu phiên dịch trực tiếp',
      listenersCount: (n) => `${n} người nghe`,
      enterLive: 'Vào trực tiếp',
      viewDetail: 'Chi tiết',
      restoredRoom: 'Đã khôi phục từ Thùng rác',
      trashedRoom: 'Đã chuyển vào Thùng rác',
      restoreAria: 'Khôi phục phòng',
      trashAria: 'Chuyển vào thùng rác',
      createModalTitle: 'Tạo phòng phiên dịch',
      topicLabel: 'Chủ đề phòng',
      roomTitlePlaceholder: 'VD: Hội nghị đối tác toàn cầu Q4',
      sourceLangLabel: 'Ngôn ngữ nguồn',
      targetLangLabel: 'Ngôn ngữ đích',
      createModalSubmit: 'Tạo & Phát trực tiếp',
      joinModalTitle: 'Nhập mã mời vào phòng',
      joinCodePlaceholder: 'Nhập mã mời, VD: VX-3905',
      joinModalSubmit: 'Vào phòng dịch',
      inviteCodePrefix: 'Mã mời ',
      directionLabel: 'Chiều phiên dịch',
      totalListenersLabel: 'Tổng người nghe',
      personsCount: (n) => `${n} người`,
      copyInviteBtn: 'Chép mã mời',
      enterWorkbenchBtn: 'Mở bảng dịch trực tiếp',
      untitledRoom: 'Phòng phiên dịch chưa đặt tên',
      invitedRoomPrefix: 'Phòng được mời',
      toastCreated: (title) => `Đã tạo và mở phòng "${title}"`,
      toastJoined: (title) => `Đã vào phòng "${title}"`,
      toastJoinedCode: (code) => `Đã tham gia qua mã ${code}`,
      toastCopyInvite: (code) => `Đã sao chép mã mời ${code}`,
    },
    translate: {
      backAria: 'Quay lại',
      title: 'Dịch trực tiếp',
      switchSuffix: ' (Đổi)',
      sourceLangAria: 'Ngôn ngữ nguồn',
      targetLangAria: 'Ngôn ngữ đích',
      swapLangAria: 'Đổi chiều ngôn ngữ',
      settingsAria: 'Cài đặt dịch',
      modeBilingualShort: 'Song ngữ',
      modeSourceShort: 'Gốc',
      modeTargetShort: 'Dịch',
      pipBtn: 'Phụ đề nổi',
      pipActiveBtn: 'Đang nổi',
      readAloud: 'Đọc',
      listeningVia: (src) => `Đang nhận diện & dịch trực tiếp qua ${src}…`,
      receivingAudio: 'Đang nhận âm thanh trực tiếp',
      pausedAudio: 'Đã tạm dừng thu',
      sourceCard: 'Thẻ ghi âm',
      sourcePhone: 'Micro máy',
      pauseCapture: 'Tạm dừng',
      resumeCapture: 'Tiếp tục thu',
      endAndSave: 'Kết thúc dịch',
      settingsTitle: 'Cài đặt dịch',
      closeSettingsAria: 'Đóng cài đặt',
      tabTranslate: 'Dịch thuật',
      tabTts: 'Giọng đọc',
      tabDevice: 'Nguồn thu',
      onlySourceTitle: 'Chỉ dịch ngôn ngữ nguồn',
      onlySourceDesc: 'Bỏ qua ngôn ngữ đích để tránh lặp lại hai chiều',
      industryLabel: 'Bối cảnh ngành',
      defaultIndustry: 'Phần cứng thông minh / SaaS',
      keywordsLabel: 'Từ khóa chuyên ngành (cách nhau bằng dấu phẩy)',
      defaultKeywords: 'VAMX, Hnote01, Khử ồn, Biên bản',
      autoSpeakTitle: 'Tự động đọc bản dịch',
      autoSpeakDesc: 'Tự động phát giọng đọc qua tai nghe sau mỗi câu hoàn chỉnh',
      ttsRateLabel: 'Tốc độ đọc',
      chooseSourceLabel: 'Chọn nguồn thu âm dịch trực tiếp',
      phoneMicTitle: 'Micro điện thoại',
      phoneMicDesc: 'Micro khử ồn tích hợp · Dùng ngay lập tức',
      cardBoundTitle: (name) => `Thẻ VAMX (${name})`,
      cardUnboundTitle: 'Thẻ VAMX (Chưa ghép)',
      cardUnboundDesc: 'Chưa ghép · Vào Thiết bị của tôi để ghép trước',
      cardConnectedDesc: (pct) => `Bluetooth đã kết nối · Pin ${pct}%`,
      cardDisconnectedDesc: 'Chưa kết nối · Nhấn để kết nối và chuyển',
      doneBtn: 'Hoàn tất',
      settingsSavedToast: 'Đã áp dụng cài đặt dịch',
      pipSourceToggle: 'Gốc',
      pipExpandAria: 'Quay lại dịch trực tiếp',
      pipCloseAria: 'Đóng cửa sổ nổi',
      pipPlayAria: 'Tiếp tục dịch',
      pipPauseAria: 'Tạm dừng dịch',
      pipCardSource: (name) => `${name} · Kéo để ghim góc`,
      pipPhoneSource: 'Micro máy · Kéo để ghim góc',
    },
    liveRecord: {
      statusRecording: 'Đang ghi',
      statusPaused: 'Tạm dừng',
      cancel: 'Hủy',
      sourceCard: (name) => `${name} · Thu thẻ`,
      sourcePhone: 'Micro máy trực tiếp',
      pausedNotice: 'Đã tạm dừng · Nhấn Tiếp tục bên dưới để ghi tiếp',
      promptCard: 'Thẻ đang thu âm chất lượng cao — có thể đánh dấu hoặc mở dịch trực tiếp',
      promptPhone: 'Đang thu âm độ nhạy cao — giữ khoảng cách 30–60 cm tới người nói',
      noteBtn: 'Ghi chú',
      translateBtn: 'Dịch',
      markedFeedback: 'Đã đánh dấu',
      markHighlightBtn: 'Đánh dấu',
      saveAria: 'Kết thúc và lưu',
      saveLabel: 'Lưu',
      resumeAria: 'Tiếp tục ghi',
      pauseAria: 'Tạm dừng ghi',
      resumeLabel: 'Tiếp tục',
      pauseLabel: 'Tạm dừng',
      drawerTitle: 'Thêm ghi chú trực tiếp',
      drawerCancel: 'Hủy',
      drawerPlaceholder: (time) => `Ghi chú ý chính hoặc việc cần làm tại ${time}…`,
      drawerAddBtn: 'Thêm vào dòng thời gian',
      quickTags: ['Quyết định', 'Cần theo dõi', 'Rủi ro', 'Ý tưởng'],
      defaultHighlightPrefix: 'Đánh dấu @ ',
    },
    importSheet: {
      menuTitle: 'Nhập âm thanh',
      closeMenuAria: 'Đóng menu nhập',
      optComments: 'Tải bình luận',
      optCommentsSub: 'Nhập bình luận video YouTube',
      optLocal: 'Nhập tệp cục bộ',
      optLocalSub: 'Chọn tệp âm thanh từ điện thoại',
      optLink: 'Nhập từ liên kết',
      optLinkSub: 'Nhập liên kết video được hỗ trợ',
      optRecord: 'Ghi âm',
      optRecordSub: 'Bắt đầu ghi âm nhanh ngay',
      linkTitle: 'Nhập từ liên kết',
      linkHeading: 'Nhập URL âm thanh / video',
      linkDesc: 'Hỗ trợ liên kết công khai từ YouTube, Bilibili, Douyin, Kuaishou, Facebook và X/Twitter.',
      linkLabel: 'Liên kết phương tiện',
      fillExample: 'Dùng mẫu',
      linkPlaceholder: 'Dán liên kết chia sẻ hoặc đoạn văn chứa URL',
      linkInvalidErr: 'Vui lòng nhập liên kết hợp lệ bắt đầu bằng http:// hoặc https://',
      targetLangLabel: 'Ngôn ngữ đích',
      folderLabel: 'Thư mục',
      diarizeLabel: 'Phân tách người nói',
      processingBtn: 'Đang xử lý…',
      linkSubmit: 'Bắt đầu xử lý',
      localTitle: 'Nhập tệp cục bộ',
      localHeading: 'Tải lên tệp âm thanh',
      localDesc: 'Hỗ trợ tiếng Việt, tiếng Trung, tiếng Anh, tiếng Nhật, tiếng Hàn và hơn 10 ngôn ngữ.',
      localAudioLabel: 'Tệp âm thanh',
      localPickBtn: 'Chọn tệp',
      localNoFile: 'Chưa chọn tệp',
      localHint: 'Khuyên dùng tệp dưới 4 giờ; hỗ trợ MP3, M4A, AAC, AMR, WAV, OGG, FLAC, OPUS.',
      localSubmitting: 'Đang nhập & chép lời…',
      localSubmit: 'Nhập & Chép lời',
      commentsTitle: 'Tải bình luận',
      commentsHeading: 'Nhập liên kết video YouTube',
      commentsDesc: 'Chỉ hỗ trợ liên kết video YouTube công khai.',
      commentsInputLabel: 'Liên kết video YouTube',
      commentsPlaceholder: 'Nhập liên kết video YouTube',
      commentsInvalidErr: 'Vui lòng nhập liên kết YouTube hợp lệ (youtube.com hoặc youtu.be)',
      commentsDiarizeLabel: 'Phân tách người bình luận & tạo tóm tắt',
      commentsDownloadOnly: 'Tải bình luận',
      commentsDownloadAudio: 'Tải kèm tệp âm thanh',
      commentsSubmitting: 'Đang chép lời…',
      commentsSubmit: 'Chép lời',
      deviceTitle: 'Nhập tệp',
      deviceUnboundStatus: 'Chưa ghép thẻ ghi âm phần cứng',
      deviceConnectedStatus: (name, pending, imported) => `${name} · ${pending} chưa nhập · ${imported} đã nhập`,
      deviceOfflineStatus: 'Thẻ ngoại tuyến · Chỉ hiện lịch sử lưu',
      importAllBtn: 'Nhập tất cả',
      importOneBtn: 'Nhập ngay',
      closeImportAria: 'Đóng nhập tệp',
      tabAll: (n) => `Tất cả (${n})`,
      tabPending: (n) => `Chưa nhập (${n})`,
      tabImported: (n) => `Đã nhập (${n})`,
      searchCardPlaceholder: 'Tìm tên tệp trên thẻ',
      refreshCardAria: 'Làm mới danh sách thẻ',
      emptyCardFiles: 'Không có tệp phù hợp trên thẻ',
      pendingBadge: '· Chưa nhập',
      importedBadge: 'Đã nhập',
      importBtn: 'Nhập',
      openMenuFooterBtn: 'Mở «Nhập âm thanh» (Bình luận / Tệp / Link / Ghi âm)',
      justImportedDate: 'Vừa nhập',
      justImportedLocalDate: 'Nhập cục bộ',
      justImportedLinkDate: 'Nhập từ liên kết',
      justImportedCommentsDate: 'Tải bình luận',
      toastCardImported: (name) => `Đã nhập ${name}`,
      toastCardBatch: (n) => `Đã nhập hàng loạt ${n} tệp từ thẻ`,
      toastLocalImported: (name) => `Đã nhập và chép lời "${name}"`,
      toastLinkImported: (platform) => `Đã nhập và chép lời từ ${platform}`,
      toastCommentsAudioDone: 'Đã chép lời bình luận và tải âm thanh',
      toastCommentsOnlyDone: 'Đã tải và chép lời bình luận YouTube',
    },
  },
};

const DEFAULT_FOLDER_NAMES: Record<string, { zhCheck: string; en: string; vi: string }> = {
  all: { zhCheck: '全部文件夹', en: 'All Files', vi: 'Tất cả tệp' },
  work: { zhCheck: '项目沟通', en: 'Projects & Syncs', vi: 'Dự án & Trao đổi' },
  research: { zhCheck: '灵感与访谈', en: 'Ideas & Interviews', vi: 'Ý tưởng & Phỏng vấn' },
  cinema: { zhCheck: '影音与播客', en: 'Media & Podcasts', vi: 'Phim & Podcast' },
};

export const getFolderDisplayName = (folder: FolderItem | undefined, lang: AppLanguage): string => {
  if (!folder) return UI_STRINGS[lang].common.allFiles;
  if (folder.id === 'all') return UI_STRINGS[lang].common.allFiles;
  const preset = DEFAULT_FOLDER_NAMES[folder.id];
  if (preset && folder.name === preset.zhCheck) {
    if (lang === 'en') return preset.en;
    if (lang === 'vi') return preset.vi;
  }
  return folder.name;
};

const DEFAULT_TEMPLATES_MAP: Record<
  string,
  { zhName: string; zhDesc: string; enName: string; enDesc: string; viName: string; viDesc: string }
> = {
  meeting: {
    zhName: '会议纪要',
    zhDesc: '议题、决策和明确的下一步',
    enName: 'Meeting Minutes',
    enDesc: 'Topics, decisions & clear next steps',
    viName: 'Biên bản họp',
    viDesc: 'Chủ đề, quyết định & bước tiếp theo',
  },
  client: {
    zhName: '客户访谈',
    zhDesc: '需求、异议与跟进机会',
    enName: 'Client Discovery',
    enDesc: 'Needs, objections & follow-up opportunities',
    viName: 'Phỏng vấn khách hàng',
    viDesc: 'Nhu cầu, phản hồi & cơ hội theo sát',
  },
  lecture: {
    zhName: '课堂笔记',
    zhDesc: '核心概念、例子与知识脉络',
    enName: 'Lecture Notes',
    enDesc: 'Core concepts, examples & knowledge tree',
    viName: 'Ghi chú bài giảng',
    viDesc: 'Khái niệm cốt lõi, ví dụ & mạch kiến thức',
  },
  interview: {
    zhName: '访谈整理',
    zhDesc: '问题、回答与关键观点',
    enName: 'Interview Digest',
    enDesc: 'Questions, answers & key perspectives',
    viName: 'Tổng hợp phỏng vấn',
    viDesc: 'Câu hỏi, trả lời & quan điểm chính',
  },
  journal: {
    zhName: '灵感日记',
    zhDesc: '记录想法，留住灵感',
    enName: 'Idea Journal',
    enDesc: 'Capture thoughts and fleeting inspiration',
    viName: 'Nhật ký ý tưởng',
    viDesc: 'Lưu giữ suy nghĩ và cảm hứng bất chợt',
  },
  brief: {
    zhName: '快速摘要',
    zhDesc: '三分钟抓住重点',
    enName: 'Quick Brief',
    enDesc: 'Grasp key takeaways in three minutes',
    viName: 'Tóm tắt nhanh',
    viDesc: 'Nắm bắt ý chính chỉ trong ba phút',
  },
};

export const getTemplateDisplay = (
  tpl: SummaryTemplate,
  lang: AppLanguage
): { name: string; description: string } => {
  const preset = DEFAULT_TEMPLATES_MAP[tpl.id];
  if (preset && tpl.name === preset.zhName) {
    if (lang === 'en') {
      return { name: preset.enName, description: preset.enDesc };
    }
    if (lang === 'vi') {
      return { name: preset.viName, description: preset.viDesc };
    }
  }
  return { name: tpl.name, description: tpl.description };
};

const LANG_OPTION_LABELS: Record<string, { zh: string; en: string; vi: string }> = {
  '不确定/混合': { zh: '不确定/混合', en: 'Auto / Mixed', vi: 'Tự động / Hỗn hợp' },
  '自动 (沿用录音语言)': {
    zh: '自动 (沿用录音语言)',
    en: 'Auto (Follow Recording)',
    vi: 'Tự động (Theo bản ghi)',
  },
  简体中文: { zh: '简体中文', en: 'Simplified Chinese', vi: 'Tiếng Trung Giản thể' },
  中文: { zh: '中文', en: 'Chinese', vi: 'Tiếng Trung' },
  英语: { zh: '英语', en: 'English', vi: 'Tiếng Anh' },
  日语: { zh: '日语', en: 'Japanese', vi: 'Tiếng Nhật' },
  韩语: { zh: '韩语', en: 'Korean', vi: 'Tiếng Hàn' },
  西班牙语: { zh: '西班牙语', en: 'Spanish', vi: 'Tiếng Tây Ban Nha' },
  印尼语: { zh: '印尼语', en: 'Indonesian', vi: 'Tiếng Indonesia' },
  法语: { zh: '法语', en: 'French', vi: 'Tiếng Pháp' },
  德语: { zh: '德语', en: 'German', vi: 'Tiếng Đức' },
  意大利语: { zh: '意大利语', en: 'Italian', vi: 'Tiếng Ý' },
  马来语: { zh: '马来语', en: 'Malay', vi: 'Tiếng Mã Lai' },
  越南语: { zh: '越南语', en: 'Vietnamese', vi: 'Tiếng Việt' },
};

export const getLanguageOptionLabel = (raw: string, lang: AppLanguage): string => {
  const hit = LANG_OPTION_LABELS[raw];
  return hit ? hit[lang] : raw;
};

export const formatDateLabelDisplay = (raw: string, lang: AppLanguage): string => {
  if (lang === 'zh') return raw;
  const c = UI_STRINGS[lang].common;
  if (raw === '刚刚') return c.justNow;
  if (raw === '刚刚 · 录音卡快传') return c.cardFastSyncDate;
  if (raw === '手机文件') return c.phoneFileDate;
  if (raw === '本地导入') return c.localImportDate;
  if (raw === '链接导入') return c.linkImportDate;
  if (raw === '评论音频' || raw === '下载评论') return c.commentsImportDate;
  return raw;
};

const TEMPLATE_CATEGORY_MAP: Record<string, { zh: string; en: string; vi: string }> = {
  工作: { zh: '工作', en: 'Work', vi: 'Công việc' },
  会议: { zh: '会议', en: 'Meeting', vi: 'Cuộc họp' },
  销售: { zh: '销售', en: 'Sales', vi: 'Kinh doanh' },
  学习: { zh: '学习', en: 'Study', vi: 'Học tập' },
  媒体: { zh: '媒体', en: 'Media', vi: 'Truyền thông' },
  生活: { zh: '生活', en: 'Personal', vi: 'Đời sống' },
  个人: { zh: '个人', en: 'Personal', vi: 'Cá nhân' },
  通用: { zh: '通用', en: 'General', vi: 'Chung' },
  自定义: { zh: '自定义', en: 'Custom', vi: 'Tùy chỉnh' },
};

export const getTemplateCategoryLabel = (raw: string, lang: AppLanguage): string => {
  const hit = TEMPLATE_CATEGORY_MAP[raw];
  return hit ? hit[lang] : raw;
};

export const EXTRA_PROFILE_COPY: Record<
  AppLanguage,
  {
    emptyTplName: string;
    profileSheetTitle: string;
    newPwdRuleLabel: string;
  }
> = {
  zh: {
    emptyTplName: '请输入模板名称',
    profileSheetTitle: '个人资料',
    newPwdRuleLabel: '新密码（至少 6 位）',
  },
  en: {
    emptyTplName: 'Please enter a template name',
    profileSheetTitle: 'Edit Profile',
    newPwdRuleLabel: 'New Password (min 6 chars)',
  },
  vi: {
    emptyTplName: 'Vui lòng nhập tên mẫu',
    profileSheetTitle: 'Hồ sơ cá nhân',
    newPwdRuleLabel: 'Mật khẩu mới (ít nhất 6 ký tự)',
  },
};

