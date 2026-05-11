export function buildLibraryRoutes(ROLES = {}) {
  const A = ROLES.LIBRARY_ADMIN;
  const M = ROLES.LIBRARY_MANAGER;
  const L = ROLES.LIBRARIAN;
  const C = ROLES.CATALOGER;
  const ACQ = ROLES.ACQUISITION_OFFICER;
  const INV = ROLES.INVENTORY_MANAGER;
  const UP = ROLES.CONTENT_UPLOADER;
  const DL = ROLES.DIGITAL_LIBRARIAN || ROLES.CONTENT_UPLOADER;
  const MEM = ROLES.LIBRARY_MEMBER;
  const PUB = ROLES.EXTERNAL_PUBLISHER;
  const DADMIN = ROLES.DIGITAL_ADMIN || ROLES.LIBRARY_ADMIN;

  const roles = (...values) => values.filter(Boolean);
  return [
    {
      name: "Dashboard",
      path: "/library-dashboard",
      icon: "fas fa-book",
      roles: roles(A, M, L, C, ACQ, INV, DL, UP, MEM, PUB, DADMIN),
      sectionTitle: "Main Navigation",
    },
    {
      name: "Physical Member",
      icon: "fas fa-user-graduate",
      roles: roles(MEM),
      sectionTitle: "Physical Library",
      subMenu: [
        { name: "Dashboard", path: "/library/physical/member/dashboard", icon: "fas fa-home", roles: roles(MEM) },
        { name: "OPAC Search", path: "/library/physical/member/opac", icon: "fas fa-search", roles: roles(MEM) },
        { name: "My Loans", path: "/library/physical/member/my-loans", icon: "fas fa-book-reader", roles: roles(MEM) },
        { name: "My Holds", path: "/library/physical/member/my-holds", icon: "fas fa-bookmark", roles: roles(MEM) },
        { name: "My Fines", path: "/library/physical/member/my-fines", icon: "fas fa-money-bill-wave", roles: roles(MEM) },
        { name: "My Account", path: "/library/physical/member/account", icon: "fas fa-id-card", roles: roles(MEM) },
      ],
    },
    {
      name: "Librarian",
      icon: "fas fa-exchange-alt",
      roles: roles( M, L),
      sectionTitle: "Physical Library",
      subMenu: [
        { name: "Dashboard", path: "/library/physical/librarian/dashboard", icon: "fas fa-home", roles: roles(A, M, L) },
        { name: "Circulation Desk", path: "/library/physical/librarian/circulation-desk", icon: "fas fa-desktop", roles: roles(A, M, L) },
        { name: "Loans", path: "/library/physical/librarian/loans", icon: "fas fa-book-reader", roles: roles(A, M, L) },
        { name: "Holds", path: "/library/physical/librarian/holds", icon: "fas fa-bookmark", roles: roles(A, M, L) },
        { name: "Fines", path: "/library/physical/librarian/fines", icon: "fas fa-money-bill-wave", roles: roles(A, M, L) },
        { name: "History", path: "/library/physical/librarian/history", icon: "fas fa-history", roles: roles(A, M, L) },
      ],
    },
    {
      name: "Cataloger",
      icon: "fas fa-list",
      roles: roles( M, C),
      sectionTitle: "Physical Library",
      subMenu: [
        { name: "Dashboard", path: "/library/physical/cataloger/dashboard", icon: "fas fa-home", roles: roles(A, M, C) },
        { name: "Catalog Records", path: "/library/physical/cataloger/catalog-records", icon: "fas fa-database", roles: roles(A, M, C) },
        { name: "Add Record", path: "/library/physical/cataloger/new-record", icon: "fas fa-plus-circle", roles: roles(A, M, C) },
        { name: "Metadata", path: "/library/physical/cataloger/metadata", icon: "fas fa-tags", roles: roles(A, M, C) },
        { name: "Copies", path: "/library/physical/cataloger/copies", icon: "fas fa-copy", roles: roles(A, M, C, L) },
        { name: "Tools", path: "/library/physical/cataloger/tools", icon: "fas fa-tools", roles: roles(A, M, C) },
      ],
    },
    {
      name: "Acquisition Officer",
      icon: "fas fa-shopping-cart",
      roles: roles(M, ACQ),
      sectionTitle: "Physical Library",
      subMenu: [
        { name: "Dashboard", path: "/library/physical/acquisition-officer/dashboard", icon: "fas fa-home", roles: roles(A, M, ACQ) },
        { name: "Requests", path: "/library/physical/acquisition-officer/requests", icon: "fas fa-inbox", roles: roles(A, M, ACQ) },
        { name: "Orders", path: "/library/physical/acquisition-officer/orders", icon: "fas fa-file-invoice", roles: roles(A, M, ACQ) },
        { name: "Deliveries", path: "/library/physical/acquisition-officer/deliveries", icon: "fas fa-truck", roles: roles(A, M, ACQ) },
        { name: "Approvals", path: "/library/physical/acquisition-officer/approvals", icon: "fas fa-check-circle", roles: roles(A, M, ACQ) },
        { name: "Vendors", path: "/library/physical/acquisition-officer/vendors", icon: "fas fa-building", roles: roles(A, M, ACQ) },
      ],
    },
    {
      name: "Inventory Manager",
      icon: "fas fa-boxes",
      roles: roles( M, INV),
      sectionTitle: "Physical Library",
      subMenu: [
        { name: "Dashboard", path: "/library/physical/inventory-manager/dashboard", icon: "fas fa-home", roles: roles(A, M, INV) },
        { name: "Audits", path: "/library/physical/inventory-manager/audits", icon: "fas fa-clipboard-check", roles: roles(A, M, INV) },
        { name: "Missing Items", path: "/library/physical/inventory-manager/missing-items", icon: "fas fa-search-minus", roles: roles(A, M, INV) },
        { name: "Damaged Items", path: "/library/physical/inventory-manager/damaged-items", icon: "fas fa-exclamation-triangle", roles: roles(A, M, INV) },
        { name: "Tags & Barcodes", path: "/library/physical/inventory-manager/tags", icon: "fas fa-barcode", roles: roles(A, M, INV) },
        { name: "Inventory Report", path: "/library/physical/inventory-manager/report", icon: "fas fa-file-alt", roles: roles(A, M, INV) },
      ],
    },
    {
      name: "Library Manager",
      icon: "fas fa-chart-bar",
      roles: roles( M),
      sectionTitle: "Physical Library",
      subMenu: [
        { name: "Dashboard", path: "/library/physical/library-manager/dashboard", icon: "fas fa-home", roles: roles(A, M) },
        { name: "Policies", path: "/library/physical/library-manager/policies", icon: "fas fa-gavel", roles: roles(A, M) },
        { name: "Usage Reports", path: "/library/physical/library-manager/usage-reports", icon: "fas fa-chart-line", roles: roles(A, M) },
        { name: "Loan Reports", path: "/library/physical/library-manager/loan-reports", icon: "fas fa-book-open", roles: roles(A, M) },
        { name: "Inventory Reports", path: "/library/physical/library-manager/inventory-reports", icon: "fas fa-box-open", roles: roles(A, M) },
      ],
    },
    {
      name: "System Administrator",
      icon: "fas fa-user-shield",
      roles: roles(A),
      sectionTitle: "Physical Library",
      subMenu: [
        { name: "Dashboard", path: "/library/physical/system-administrator/dashboard", icon: "fas fa-home", roles: roles(A) },
        { name: "Users", path: "/library/physical/system-administrator/users", icon: "fas fa-users", roles: roles(A) },
        { name: "Create User", path: "/library/physical/system-administrator/create-user", icon: "fas fa-user-plus", roles: roles(A) },
        { name: "Roles", path: "/library/physical/system-administrator/roles", icon: "fas fa-id-badge", roles: roles(A) },
        { name: "Audit Logs", path: "/library/physical/system-administrator/audit-logs", icon: "fas fa-file-alt", roles: roles(A) },
        { name: "System Settings", path: "/library/physical/system-administrator/system-settings", icon: "fas fa-sliders-h", roles: roles(A) },
        { name: "Security Alerts", path: "/library/physical/system-administrator/security-alerts", icon: "fas fa-shield-alt", roles: roles(A) },
        { name: "Material Types", path: "/library/physical/system-administrator/material-types", icon: "fas fa-layer-group", roles: roles(A) },
        { name: "Categories", path: "/library/physical/system-administrator/categories", icon: "fas fa-sitemap", roles: roles(A) },
        { name: "Publishers", path: "/library/physical/system-administrator/publishers", icon: "fas fa-building", roles: roles(A) },
        { name: "Languages", path: "/library/physical/system-administrator/languages", icon: "fas fa-language", roles: roles(A) },
        { name: "Subjects", path: "/library/physical/system-administrator/subjects", icon: "fas fa-bookmark", roles: roles(A) },
        { name: "Contributors", path: "/library/physical/system-administrator/contributors", icon: "fas fa-users-cog", roles: roles(A) },
        { name: "Branches", path: "/library/physical/system-administrator/branches", icon: "fas fa-code-branch", roles: roles(A) },
        { name: "Locations", path: "/library/physical/system-administrator/locations", icon: "fas fa-map-marker-alt", roles: roles(A) },
        { name: "Member Types", path: "/library/physical/system-administrator/member-types", icon: "fas fa-id-card", roles: roles(A) },
      ],
    },
    {
      name: "Digital Librarian",
      icon: "fas fa-cloud-upload-alt",
      roles: roles( M, DL),
      sectionTitle: "Digital Library",
      subMenu: [
        { name: "Dashboard", path: "/library/digital/digital-librarian/dashboard", icon: "fas fa-home", roles: roles(A, M, DL) },
        { name: "Resources", path: "/library/digital/digital-librarian/resources", icon: "fas fa-folder-open", roles: roles(A, M, DL) },
        { name: "New Resource", path: "/library/digital/digital-librarian/new-resource", icon: "fas fa-upload", roles: roles(A, M, DL) },
        { name: "Metadata", path: "/library/digital/digital-librarian/metadata", icon: "fas fa-tags", roles: roles(A, M, DL) },
        { name: "Access", path: "/library/digital/digital-librarian/access", icon: "fas fa-user-lock", roles: roles(A, M, DL) },
        { name: "Approvals", path: "/library/digital/digital-librarian/approvals", icon: "fas fa-check-circle", roles: roles(A, M, DL) },
        { name: "Collections", path: "/library/digital/digital-librarian/collections", icon: "fas fa-layer-group", roles: roles(A, M, DL) },
        { name: "Analytics", path: "/library/digital/digital-librarian/analytics", icon: "fas fa-chart-line", roles: roles(A, M, DL) },
        { name: "Workflow", path: "/library/digital/digital-librarian/workflow", icon: "fas fa-project-diagram", roles: roles(A, M, DL) },
      ],
    },
    {
      name: "Content Uploader",
      icon: "fas fa-file-upload",
      roles: roles( UP),
      sectionTitle: "Digital Library",
      subMenu: [
        { name: "Dashboard", path: "/library/digital/content-uploader/dashboard", icon: "fas fa-home", roles: roles(A, UP) },
        { name: "Upload", path: "/library/digital/content-uploader/upload", icon: "fas fa-upload", roles: roles(A, UP) },
        { name: "Submissions", path: "/library/digital/content-uploader/submissions", icon: "fas fa-inbox", roles: roles(A, UP) },
        { name: "Metadata", path: "/library/digital/content-uploader/metadata", icon: "fas fa-tags", roles: roles(A, UP) },
      ],
    },
    {
      name: "Digital Member",
      icon: "fas fa-laptop",
      roles: roles(MEM),
      sectionTitle: "Digital Library",
      subMenu: [
        { name: "Dashboard", path: "/library/digital/member/dashboard", icon: "fas fa-home", roles: roles(MEM) },
        { name: "Digital Library", path: "/library/digital/member/library", icon: "fas fa-book-reader", roles: roles(MEM) },
        { name: "Account", path: "/library/digital/member/account", icon: "fas fa-id-card", roles: roles(MEM) },
      ],
    },
    {
      name: "Digital Admin",
      icon: "fas fa-user-cog",
      roles: roles(DADMIN),
      sectionTitle: "Digital Library",
      subMenu: [
        { name: "Dashboard", path: "/library/digital/admin/dashboard", icon: "fas fa-home", roles: roles(DADMIN) },
        { name: "Users", path: "/library/digital/admin/users", icon: "fas fa-users", roles: roles(DADMIN) },
        { name: "System Settings", path: "/library/digital/admin/system-settings", icon: "fas fa-sliders-h", roles: roles(DADMIN) },
        { name: "Audit Logs", path: "/library/digital/admin/audit-logs", icon: "fas fa-file-alt", roles: roles(DADMIN) },
      ],
    },
    {
      name: "External Publisher",
      icon: "fas fa-box-open",
      roles: roles( PUB),
      sectionTitle: "Digital Library",
      subMenu: [
        { name: "Dashboard", path: "/library/digital/external-publisher/dashboard", icon: "fas fa-home", roles: roles(A, PUB) },
        { name: "Packages", path: "/library/digital/external-publisher/packages", icon: "fas fa-boxes", roles: roles(A, PUB) },
      ],
    },
  ];
}
