import React from "react";
import { Navigate } from "react-router-dom";

function getRoleNames(user) {
  const roles = [];
  if (user?.role) roles.push(String(user.role));
  if (Array.isArray(user?.roles)) {
    user.roles.forEach((r) => roles.push(String(r?.name || r?.role_name || r?.role || '')));
  }
  return roles.map((x) => x.toUpperCase()).filter(Boolean);
}

export default function LibraryRoleRedirect() {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }
  const roles = getRoleNames(user);
  const route = roles.includes('LIBRARY_ADMIN') || roles.includes('SYSTEM_ADMINISTRATOR') ? '/library/physical/system-administrator/dashboard'
    : roles.includes('LIBRARY_MANAGER') ? '/library/physical/library-manager/dashboard'
    : roles.includes('INVENTORY_MANAGER') ? '/library/physical/inventory-manager/dashboard'
    : roles.includes('ACQUISITION_OFFICER') ? '/library/physical/acquisition-officer/dashboard'
    : roles.includes('CATALOGER') ? '/library/physical/cataloger/dashboard'
    : roles.includes('LIBRARIAN') ? '/library/physical/librarian/dashboard'
    : roles.includes('DIGITAL_LIBRARIAN') ? '/library/digital/digital-librarian/dashboard'
    : roles.includes('CONTENT_UPLOADER') ? '/library/digital/content-uploader/dashboard'
    : roles.includes('EXTERNAL_PUBLISHER') ? '/library/digital/external-publisher/dashboard'
    : '/library/physical/member/dashboard';
  return <Navigate to={route} replace />;
}
