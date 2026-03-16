import { getUserPermissions } from "../services/rbac.service.js";

export const authorize = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.uuid;

      const permissions = await getUserPermissions(userId);

      if (!permissions.includes(permission)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};
