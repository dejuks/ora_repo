import { User } from "../models/user.model.js";

export const getUsers = async (_, res) => {
  res.json(await User.findAll());
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.uuid);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
};

// users/reviewers
export const getReviewers = async (_, res) => {
  const reviewers = await User.findReviewers();
  res.json(reviewers);
};

export const getEditors = async (_, res) => {
  const editors = await User.findEditors();
  res.json(editors);
};

export const getEICs = async (_, res) => {
  const eics = await User.findEICs();
  res.json(eics);
};  


export const createUser = async (req, res) => {
  try {

    const photo = req.file
      ? `/uploads/users/${req.file.filename}`
      : null;

    const user = await User.create({
      ...req.body,
      photo,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });

  } catch (error) {

    // 🔥 PostgreSQL duplicate email error
    if (error.code === "23505") {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Something went wrong while creating user",
    });
  }
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
