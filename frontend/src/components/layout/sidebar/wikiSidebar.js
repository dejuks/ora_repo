export function buildWikiRoutes(ROLES) {
  if (!ROLES) {
    console.error("ROLES is missing in buildWikiRoutes");
    return [];
  }

  const WM = ROLES.ORO_WIKI_MANAGER;
  const ED = ROLES.ORO_WIKI_EDITOR;
  const PUB = ROLES.ORO_WIKI_PUBLISHER;
  const BUR = ROLES.ORO_WIKI_BUREAUCRAT;
  const OVS = ROLES.ORO_WIKI_OVERSIGHTER;
    const AUT = ROLES.ORO_WIKI_AUTHOR;
    const WAD = ROLES.ORO_WIKI_ADMINISTRATOR;

  return [
    /* ================= Dashboard ================= */
    {
      name: "Dashboard",
      path: "/wiki/dashboard",
      icon: "fas fa-globe",
      roles: [WM, ED, PUB, BUR, OVS, AUT, WAD],
    },
// Administrator has access to all routes, but we can still show the dashboard link for them
    {
      name: "Administrator",
      icon: "fas fa-user-cog",
      roles: [WAD],
      subMenu: [  
        { name: "All Articles", path: "/wiki/articles", icon: "fas fa-list" },
        { name: "Recent Changes", path: "/wiki/recent-changes", icon: "fas fa-clock" },
        { name: "Popular Articles", path: "/wiki/popular", icon: "fas fa-star" },
        { name: "Check Vandalism", path: "/wiki/vandalism/check", icon: "fas fa-flag" },
        { name: "All Categories", path: "/wiki/categories", icon: "fas fa-list" },
        { name: "Create Category", path: "/wiki/categories/create", icon: "fas fa-plus" },
        { name: "All Users", path: "/wiki/users", icon: "fas fa-user" },
        { name: "Roles", path: "/wiki/roles", icon: "fas fa-user-tag" },
        { name: "Settings", path: "/wiki/settings", icon: "fas fa-cogs" },
        { name: "Reports", path: "/wiki/reports", icon: "fas fa-chart-bar" },
      ],
    },
    /* ================= Manager ================= */
    {
      name: "Management",
      icon: "fas fa-user-cog",
      roles: [WM],
      subMenu: [
        { name: "All Articles", path: "/wiki/articles", icon: "fas fa-list", roles: [WM] },
        { name: "Recent Changes", path: "/wiki/recent-changes", icon: "fas fa-clock", roles: [WM] },
        { name: "Popular Articles", path: "/wiki/popular", icon: "fas fa-star", roles: [WM] },
        { name: "Check Vandalism", path: "/wiki/vandalism/check", icon: "fas fa-flag", roles: [WM] },
      ],
    },

    {
      name: "Categories",
      icon: "fas fa-folder",
      roles: [WM],
      subMenu: [
        { name: "All Categories", path: "/wiki/categories", icon: "fas fa-list" },
        { name: "Create Category", path: "/wiki/categories/create", icon: "fas fa-plus" },
      ],
    },

    {
      name: "Users & Roles",
      icon: "fas fa-users",
      roles: [WM, BUR],
      subMenu: [
        { name: "All Users", path: "/wiki/users", icon: "fas fa-user" },
        { name: "Roles", path: "/wiki/roles", icon: "fas fa-user-tag" },
      ],
    },

    {
      name: "Settings",
      path: "/wiki/settings",
      icon: "fas fa-cogs",
      roles: [WM],
    },

    {
      name: "Reports",
      path: "/wiki/reports",
      icon: "fas fa-chart-bar",
      roles: [WM, BUR],
    },
    /* ================= Author ================= */
    {
      name: "Author",
      icon: "fas fa-user-edit",
      roles: [AUT],
        subMenu: [
          { name: "My Articles", path: "/wiki/my-articles", icon: "fas fa-list" },
        { name: "Create Article", path: "/wiki/articles/new", icon: "fas fa-plus" },
        { name: "Drafts", path: "/wiki/my-articles/drafts", icon: "fas fa-edit" },
        ]
    },  

    /* ================= Editor ================= */
    {
      name: "My Articles",
      icon: "fas fa-file-alt",
      roles: [ED],
      subMenu: [
        { name: "All Articles", path: "/wiki/articles", icon: "fas fa-list" },
        { name: "Create Article", path: "/wiki/articles/create", icon: "fas fa-plus" },
        { name: "Drafts", path: "/wiki/articles/drafts", icon: "fas fa-edit" },
      ],
    },

    /* ================= Publisher ================= */
    {
      name: "Publishing",
      icon: "fas fa-upload",
      roles: [PUB],
      subMenu: [
        { name: "Publishing Queue", path: "/wiki/articles/publish", icon: "fas fa-upload" },
        { name: "All Articles", path: "/wiki/articles", icon: "fas fa-list" },
      ],
    },

    /* ================= Oversight ================= */
    {
      name: "Moderation",
      icon: "fas fa-shield-alt",
      roles: [OVS],
      subMenu: [
        { name: "Moderation Panel", path: "/wiki/moderation", icon: "fas fa-gavel" },
        { name: "Reported Content", path: "/wiki/reports/content", icon: "fas fa-flag" },
      ],
    },

    /* ================= Shared ================= */
    {
      name: "Media Library",
      icon: "fas fa-photo-video",
      roles: [WM, ED, PUB],
      subMenu: [
        { name: "All Media", path: "/wiki/media", icon: "fas fa-images" },
        { name: "Upload Media", path: "/wiki/media/upload", icon: "fas fa-upload" },
      ],
    },

    {
      name: "Profile",
      icon: "fas fa-id-card",
      roles: [WM, ED, PUB, BUR, OVS],
      subMenu: [
        { name: "My Profile", path: "/wiki/profile", icon: "fas fa-user" },
      ],
    },
  ];
}