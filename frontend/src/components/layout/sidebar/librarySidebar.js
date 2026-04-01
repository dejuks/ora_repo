export function buildLibraryRoutes(ROLES) {
  const A = ROLES?.LIBRARY_ADMIN || "LIBRARY_ADMIN";
  const M = ROLES?.LIBRARY_MANAGER || "LIBRARY_MANAGER";
  const L = ROLES?.LIBRARIAN || "LIBRARIAN";
  const C = ROLES?.CATALOGER || "CATALOGER";
  const ACQ = ROLES?.ACQUISITION_OFFICER || "ACQUISITION_OFFICER";
  const INV = ROLES?.INVENTORY_MANAGER || "INVENTORY_MANAGER";
  const UP = ROLES?.CONTENT_UPLOADER || "CONTENT_UPLOADER";
  const MEM = ROLES?.LIBRARY_MEMBER || "LIBRARY_MEMBER";
  const PUB = ROLES?.EXTERNAL_PUBLISHER || "EXTERNAL_PUBLISHER";

  return [
    {
      name: "Dashboard", 
      path: "/library/dashboard",
      icon: "fas fa-book",
      roles: [A, M, L, C, ACQ, INV, UP, MEM, PUB],
    },

    {
      name: "Catalog Management",
      icon: "fas fa-list",
      roles: [A, M, C, L],
      subMenu: [
        {
          name: "All Catalog Records",
          path: "/library/catalog",
          icon: "fas fa-database",
          roles: [A, M, C, L],
        },
        {
          name: "Add New Record",
          path: "/library/catalog/create",
          icon: "fas fa-plus-circle",
          roles: [A, M, C],
        },
      ],
    },

    {
      name: "Acquisition",
      icon: "fas fa-shopping-cart",
      roles: [A, M, ACQ],
      subMenu: [
        {
          name: "Requests",
          path: "/library/acquisitions",
          icon: "fas fa-inbox",
          roles: [A, M, ACQ],
        },
        {
          name: "Suppliers",
          path: "/library/suppliers",
          icon: "fas fa-truck",
          roles: [A, M, ACQ],
        },
      ],
    },

    {
      name: "Inventory",
      icon: "fas fa-boxes",
      roles: [A, M, INV],
      subMenu: [
        {
          name: "Inventory List",
          path: "/library/inventory",
          icon: "fas fa-clipboard-list",
          roles: [A, M, INV],
        },
        {
          name: "Stock Adjustment",
          path: "/library/inventory/adjustment",
          icon: "fas fa-edit",
          roles: [A, M, INV],
        },
      ],
    },

    {
      name: "Digital Library",
      icon: "fas fa-cloud-upload-alt",
      roles: [A, M, UP],
      subMenu: [
        {
          name: "Upload Content",
          path: "/library/digital/upload",
          icon: "fas fa-upload",
          roles: [A, M, UP],
        },
        {
          name: "Manage Files",
          path: "/library/digital/files",
          icon: "fas fa-folder-open",
          roles: [A, M, UP],
        },
      ],
    },

    {
      name: "Circulation",
      icon: "fas fa-exchange-alt",
      roles: [A, M, L],
      subMenu: [
        {
          name: "Borrow Requests",
          path: "/library/circulation/requests",
          icon: "fas fa-hand-holding",
          roles: [A, M, L],
        },
        {
          name: "Issued Items",
          path: "/library/circulation/issued",
          icon: "fas fa-share",
          roles: [A, M, L],
        },
        {
          name: "Returned Items",
          path: "/library/circulation/returned",
          icon: "fas fa-undo",
          roles: [A, M, L],
        },
      ],
    },

    {
      name: "Members",
      icon: "fas fa-users",
      roles: [A, M],
      subMenu: [
        {
          name: "Member List",
          path: "/library/members",
          icon: "fas fa-id-card",
          roles: [A, M],
        },
        {
          name: "Register Member",
          path: "/library/members/create",
          icon: "fas fa-user-plus",
          roles: [A, M],
        },
      ],
    },

    {
      name: "Publisher Portal",
      icon: "fas fa-building",
      roles: [PUB, A],
      subMenu: [
        {
          name: "My Uploads",
          path: "/library/publisher/uploads",
          icon: "fas fa-upload",
          roles: [PUB, A],
        },
      ],
    },

    {
      name: "Reports",
      icon: "fas fa-chart-bar",
      roles: [A, M],
      subMenu: [
        {
          name: "Usage Reports",
          path: "/library/reports/usage",
          icon: "fas fa-chart-line",
          roles: [A, M],
        },
        {
          name: "Inventory Reports",
          path: "/library/reports/inventory",
          icon: "fas fa-file-alt",
          roles: [A, M],
        },
      ],
    },

    {
      name: "Administration",
      icon: "fas fa-user-shield",
      roles: [A],
      subMenu: [
        {
          name: "Library Settings",
          path: "/library/admin/settings",
          icon: "fas fa-cogs",
          roles: [A],
        },
      ],
    },
  ];
}