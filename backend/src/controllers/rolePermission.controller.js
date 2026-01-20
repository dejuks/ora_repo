import {
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions
} from "../services/rolePermission.service.js";

export const assignPermission = async (req, res) => {
  const { roleId, permissionId } = req.body;
  await assignPermissionToRole(roleId, permissionId);
  res.json({ message: "Permission assigned" });
};

export const removePermission = async (req, res) => {
  const { roleId, permissionId } = req.body;
  await removePermissionFromRole(roleId, permissionId);
  res.json({ message: "Permission removed" });
};

export const getPermissionsByRole = async (req, res) => {
  res.json(await getRolePermissions(req.params.roleId));
};
