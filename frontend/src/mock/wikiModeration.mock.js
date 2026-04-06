export const suppressedRevisionsMock = [
  {
    id: "rev-001",
    articleTitle: "Public Health Budget Draft",
    revisionId: "r-4451",
    editor: "UserAlpha",
    reason: "Contained private phone number",
    suppressedBy: "Oversighter A",
    suppressionType: "personal_data",
    visibility: "hidden",
    suppressedAt: "2026-04-05 10:30",
  },
  {
    id: "rev-002",
    articleTitle: "Hospital Staff Registry",
    revisionId: "r-4459",
    editor: "AnonUser",
    reason: "Email address disclosure",
    suppressedBy: "Oversighter B",
    suppressionType: "email_exposure",
    visibility: "hidden",
    suppressedAt: "2026-04-04 14:10",
  },
];

export const checkUserInvestigationsMock = [
  {
    id: "chk-001",
    username: "SpamFlooder",
    ipAddress: "197.156.78.22",
    userAgent: "Chrome / Windows",
    investigationReason: "Cross-wiki spam attack",
    requestedBy: "Global Steward",
    status: "confirmed_abuse",
    checkedAt: "2026-04-05",
  },
  {
    id: "chk-002",
    username: "TempEditor22",
    ipAddress: "197.156.80.44",
    userAgent: "Firefox / Linux",
    investigationReason: "Sockpuppet suspicion",
    requestedBy: "Moderator",
    status: "under_review",
    checkedAt: "2026-04-04",
  },
];

export const oversightAuditLogsMock = [
  {
    id: "audit-001",
    action: "Revision suppressed",
    actor: "Oversighter A",
    target: "Public Health Budget Draft",
    reason: "Private phone number exposed",
    timestamp: "2026-04-05 10:31",
  },
  {
    id: "audit-002",
    action: "IP lookup performed",
    actor: "CheckUser B",
    target: "SpamFlooder",
    reason: "Spam ring investigation",
    timestamp: "2026-04-05 09:50",
  },
];

export const reportedContentMock = [
  {
    id: "rep-001",
    articleTitle: "Vaccination Outreach Framework",
    reportedBy: "EditorA",
    reason: "Misleading medical statement",
    severity: "high",
    status: "pending",
    assignedModerator: "Moderator A",
    createdAt: "2026-04-05",
  },
  {
    id: "rep-002",
    articleTitle: "Hospital Reporting Standards",
    reportedBy: "UserB",
    reason: "External spam links",
    severity: "medium",
    status: "investigating",
    assignedModerator: "Moderator B",
    createdAt: "2026-04-04",
  },
  {
    id: "rep-003",
    articleTitle: "Digital Health Transformation Guide",
    reportedBy: "AnonUser",
    reason: "Personal data exposure",
    severity: "critical",
    status: "suppressed_revision",
    assignedModerator: "Oversighter",
    createdAt: "2026-04-03",
  },
  {
    id: "rep-004",
    articleTitle: "Community Health Worker Handbook",
    reportedBy: "ReviewerC",
    reason: "Copyright violation",
    severity: "high",
    status: "resolved",
    assignedModerator: "Moderator A",
    createdAt: "2026-04-02",
  },
];