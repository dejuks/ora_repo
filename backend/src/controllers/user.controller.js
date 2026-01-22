import { User } from "../models/user.model.js";

export const getUsers = async (_, res) => {
  res.json(await User.findAll());
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.uuid);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
};

export const createUser = async (req, res) => {
  const photo = req.file ? `/uploads/users/${req.file.filename}` : null;
  const user = await User.create({ ...req.body, photo });
  res.status(201).json(user);
};

export const updateUser = async (req, res) => {
  const photo = req.file ? `/uploads/users/${req.file.filename}` : null;
  const user = await User.update(req.params.uuid, { ...req.body, photo });
  res.json(user);
};

export const deleteUser = async (req, res) => {
  await User.delete(req.params.uuid);
  res.json({ message: "User deleted" });
};
