import { Permission } from "../models/permission.model.js";

export const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    return res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("getPermissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
    });
  }
};

export const createPermission = async (req, res) => {
  try {
    const { name, module_group } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Permission name is required",
      });
    }

    const permission = await Permission.create(
      String(name).trim(),
      module_group ? String(module_group).trim() : "System Wide"
    );

    return res.status(201).json({
      success: true,
      data: permission,
      message: "Permission created successfully",
    });
  } catch (error) {
    console.error("createPermission error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Permission name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create permission",
    });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name, module_group } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Permission name is required",
      });
    }

    const permission = await Permission.update(
      uuid,
      String(name).trim(),
      module_group ? String(module_group).trim() : "System Wide"
    );

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: permission,
      message: "Permission updated successfully",
    });
  } catch (error) {
    console.error("updatePermission error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Permission name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update permission",
    });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const { uuid } = req.params;

    await Permission.delete(uuid);

    return res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    console.error("deletePermission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete permission",
    });
  }
};