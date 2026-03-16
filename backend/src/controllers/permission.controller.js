  import { Permission } from "../models/permission.model.js";

  export const getPermissions = async (req, res) => {
    res.json(await Permission.findAll());
  };

  export const createPermission = async (req, res) => {
    res.status(201).json(await Permission.create(req.body.name));
  };

  export const deletePermission = async (req, res) => {
    await Permission.delete(req.params.uuid);
    res.json({ message: "Permission deleted" });
  };
