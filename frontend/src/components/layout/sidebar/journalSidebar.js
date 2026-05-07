export function buildJournalRoutes(ROLES) {
  if (!ROLES) {
    console.error("ROLES is missing in buildJournalRoutes");
    return [];
  }

  const JM = ROLES.JOURNAL_MANAGER;
  const JA = ROLES.JOURNAL_AUTHOR;
  const E = ROLES.EDITOR;
  const REV = ROLES.REVIEWER;
  const EIC = ROLES.JOURNAL_EIC;
  const AE = ROLES.JOURNAL_ASSOCIATE_EDITOR;
  const REF = ROLES.JOURNAL_REVIEWER;

//   JOURNAL_REVIEWER
// const JR = ROLES.JOURNAL_REVIEWER;

  return [
    {
      name: "Dashboard",
      path: "/journal-dashboard",
      icon: "fas fa-tachometer-alt",
      roles: [JM, E, REV],
    },

    {
      name: "Users & Roles",
      icon: "fas fa-users",
      roles: [JM],
      subMenu: [
        { name: "All Users", path: "/journal/users", icon: "fas fa-user", roles: [JM] },
        { name: "Add New User", path: "/module/users/add", icon: "fas fa-user-tag", roles: [JM] },
      ],
    },

    {
      name: "Journals",
      icon: "fas fa-book",
      roles: [JM, E],
      subMenu: [
        { name: "Add Journal", path: "/journal/create", icon: "fas fa-plus", roles: [JM, E] },
        { name: "Journal List", path: "/journal/list", icon: "fas fa-list", roles: [JM, E] },
      ],
    },
    {
      name: "Author Dashboard",
      path: "/journal/author-dashboard",
      icon: "fas fa-tachometer-alt",
      roles: [JA],
    },

    {
      name: "Submissions",
      icon: "fas fa-file-alt",
      roles: [JM, JA, E],
      subMenu: [
        { name: "My Submissions", path: "/journal/manuscripts", icon: "fas fa-inbox", roles: [JA] },
        { name: "New Submission", path: "/manuscripts/create", icon: "fas fa-paper-plane", roles: [JA] },
        { name: "Incomplete Submissions", path: "/manuscript/draft-manuscript", icon: "fas fa-file", roles: [JA] },
        { name: "Revisions", path: "/journal/manuscripts/revisions", icon: "fas fa-edit", roles: [JA] },
      ],
    },

    {
      name: "Editorial Oversight",
      icon: "fas fa-user-shield",
      roles: [EIC],
      subMenu: [
        { name: "All Submissions", path: "/journal/eic/submissions", icon: "fas fa-folder-open", roles: [EIC] },
        { name: "Publication Payments", path: "/eic/payment-orders", icon: "fas fa-credit-card", roles: [EIC] },
      ],
    },

    {
      name: "Manuscript Handling",
      icon: "fas fa-user-edit",
      roles: [AE],
      subMenu: [
        { name: "Submitted Manuscripts", path: "/manuscript/ae/assigned-manuscripts", icon: "fas fa-folder-open", roles: [AE] },
        { name: "Initial Screening", path: "/manuscription/ae/screening", icon: "fas fa-search", roles: [AE] },
        { name: "Under Review", path: "/manuscript/ae/under-review", icon: "fas fa-hourglass-half", roles: [AE] },
      ],
    },

    {
      name: "Peer Review",
      icon: "fas fa-user-check",
      roles: [REF],
      subMenu: [
        { name: "Assigned Reviews", path: "/journal/reviewer/assigned", icon: "fas fa-inbox", roles: [REF] },
      ],
    },

    {
      name: "Profile & Declarations",
      icon: "fas fa-id-card",
      roles: [JA, REV, E, JM],
      subMenu: [
        { name: "My Profile", path: "/journal/profile", icon: "fas fa-user" },
        { name: "Ethics Declarations", path: "/journal/declarations", icon: "fas fa-shield-alt" },
      ],
    },
  ];
}