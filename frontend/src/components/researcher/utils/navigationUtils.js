// utils/navigationUtils.js
import { NAVIGATION_CONFIG } from "../config/roles.config";

export function getNavigationForRole(role) {
  return NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.researcher;
}

export function hasPermission(userRole, permission) {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function getRoleColor(role) {
  const colors = {
    researcher: '#0a66c2',
    group_moderator: '#28a745',
    platform_admin: '#dc3545',
    content_manager: '#17a2b8'
  };
  return colors[role] || '#0a66c2';
}