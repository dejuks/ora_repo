// config/roles.config.js
export const ROLES = {
  RESEARCHER: 'researcher',
  GROUP_MODERATOR: 'group_moderator',
  PLATFORM_ADMIN: 'platform_admin',
  CONTENT_MANAGER: 'content_manager'
};

export const PERMISSIONS = {
  // Researcher permissions
  [ROLES.RESEARCHER]: [
    'view_dashboard',
    'manage_profile',
    'manage_publications',
    'connect_researchers',
    'participate_forums',
    'join_groups',
    'share_updates'
  ],
  
  // Group Moderator permissions (includes researcher permissions plus)
  [ROLES.GROUP_MODERATOR]: [
    ...PERMISSIONS[ROLES.RESEARCHER],
    'manage_group_members',
    'moderate_discussions',
    'enforce_guidelines',
    'resolve_conflicts',
    'manage_group_content'
  ],
  
  // Platform Admin permissions
  [ROLES.PLATFORM_ADMIN]: [
    'view_admin_dashboard',
    'manage_all_users',
    'manage_user_roles',
    'manage_platform_settings',
    'manage_security',
    'system_maintenance',
    'feature_management',
    'content_moderation',
    'view_analytics',
    'manage_backups'
  ],
  
  // Content Manager permissions
  [ROLES.CONTENT_MANAGER]: [
    'view_dashboard',
    'manage_journal_calls',
    'manage_events',
    'manage_news',
    'send_notifications',
    'promote_content',
    'collaborate_researchers'
  ]
};

export const NAVIGATION_CONFIG = {
  [ROLES.RESEARCHER]: [
    {
      section: "Personal",
      items: [
        { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
        { path: "/profile", icon: "profile", label: "My Profile" },
        { path: "/publications", icon: "publications", label: "Publications" },
        { path: "/projects", icon: "projects", label: "Projects" },
        { path: "/connections", icon: "connections", label: "Connections" },
      ]
    },
    {
      section: "Network",
      items: [
        { path: "/network/discover", icon: "discover", label: "Discover" },
        { path: "/groups", icon: "groups", label: "Research Groups" },
        { path: "/forums", icon: "forums", label: "Forums" },
        { path: "/messages", icon: "messages", label: "Messages" },
      ]
    },
    {
      section: "Resources",
      items: [
        { path: "/events", icon: "events", label: "Events" },
        { path: "/funding", icon: "funding", label: "Funding" },
        { path: "/news", icon: "news", label: "News & Updates" },
      ]
    }
  ],
  
  [ROLES.GROUP_MODERATOR]: [
    ...NAVIGATION_CONFIG[ROLES.RESEARCHER],
    {
      section: "Moderation",
      items: [
        { path: "/moderation/groups", icon: "moderate", label: "My Groups" },
        { path: "/moderation/requests", icon: "requests", label: "Join Requests" },
        { path: "/moderation/reports", icon: "reports", label: "Reports" },
        { path: "/moderation/guidelines", icon: "guidelines", label: "Guidelines" },
      ]
    }
  ],
  
  [ROLES.PLATFORM_ADMIN]: [
    {
      section: "Dashboard",
      items: [
        { path: "/admin/dashboard", icon: "admin_dashboard", label: "Admin Dashboard" },
        { path: "/admin/analytics", icon: "analytics", label: "Analytics" },
      ]
    },
    {
      section: "User Management",
      items: [
        { path: "/admin/users", icon: "users", label: "All Users" },
        { path: "/admin/roles", icon: "roles", label: "Role Management" },
        { path: "/admin/approvals", icon: "approvals", label: "Pending Approvals" },
        { path: "/admin/activity", icon: "activity", label: "User Activity" },
      ]
    },
    {
      section: "Platform Management",
      items: [
        { path: "/admin/settings", icon: "settings", label: "Platform Settings" },
        { path: "/admin/security", icon: "security", label: "Security" },
        { path: "/admin/maintenance", icon: "maintenance", label: "System Maintenance" },
        { path: "/admin/backup", icon: "backup", label: "Backup & Restore" },
        { path: "/admin/logs", icon: "logs", label: "System Logs" },
      ]
    },
    {
      section: "Content Management",
      items: [
        { path: "/admin/content", icon: "content", label: "Content Moderation" },
        { path: "/admin/categories", icon: "categories", label: "Categories" },
        { path: "/admin/flags", icon: "flags", label: "Flagged Content" },
      ]
    }
  ],
  
  [ROLES.CONTENT_MANAGER]: [
    {
      section: "Content Dashboard",
      items: [
        { path: "/content/dashboard", icon: "content_dashboard", label: "Content Dashboard" },
        { path: "/content/analytics", icon: "content_analytics", label: "Content Analytics" },
      ]
    },
    {
      section: "Events & Calls",
      items: [
        { path: "/content/events", icon: "events", label: "Manage Events" },
        { path: "/content/journal-calls", icon: "calls", label: "Journal Calls" },
        { path: "/content/conferences", icon: "conferences", label: "Conferences" },
        { path: "/content/workshops", icon: "workshops", label: "Workshops" },
      ]
    },
    {
      section: "News & Updates",
      items: [
        { path: "/content/news", icon: "news", label: "News Articles" },
        { path: "/content/announcements", icon: "announcements", label: "Announcements" },
        { path: "/content/notifications", icon: "notifications", label: "Send Notifications" },
      ]
    },
    {
      section: "Promotions",
      items: [
        { path: "/content/promotions", icon: "promotions", label: "Content Promotion" },
        { path: "/content/collaborations", icon: "collaborations", label: "Researcher Collaborations" },
        { path: "/content/featured", icon: "featured", label: "Featured Content" },
      ]
    }
  ]
};