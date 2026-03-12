import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createPublicUser,
  getAllPublicUsers,
  getPublicUserByUUID,
  updatePublicUser,
  deletePublicUser,getPublicUserByEmail
} from "../models/publicUser.model.js";

/* CREATE */
export const registerPublicUser = async (req, res) => {
  const { full_name, email, password, affiliation, country } = req.body;

  if (!full_name || !email || !password)
    return res.status(400).json({ message: "Missing required fields" });

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const result = await createPublicUser({
      full_name,
      email,
      password_hash,
      affiliation,
      country,
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Registration failed" });
  }
};

/* READ ALL */
export const listPublicUsers = async (_, res) => {
  const { rows } = await getAllPublicUsers();
  res.json(rows);
};

/* READ ONE */
export const getPublicUser = async (req, res) => {
  const { uuid } = req.params;
  const { rows } = await getPublicUserByUUID(uuid);

  if (!rows.length)
    return res.status(404).json({ message: "User not found" });

  res.json(rows[0]);
};

/* UPDATE */
export const updatePublicUserProfile = async (req, res) => {
  const { uuid } = req.params;
  const { rows } = await updatePublicUser(uuid, req.body);

  if (!rows.length)
    return res.status(404).json({ message: "User not found" });

  res.json(rows[0]);
};

/* DELETE */
export const removePublicUser = async (req, res) => {
  const { uuid } = req.params;
  await deletePublicUser(uuid);
  res.sendStatus(204);
};



/* LOGIN */
export const loginPublicUser = async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await getPublicUserByEmail(email);
  if (!rows.length)
    return res.status(401).json({ message: "Invalid credentials" });

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    {
      uuid: user.uuid,
      role: "REPOSITORY_PUBLIC_USER",
      module: "REPOSITORY",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      uuid: user.uuid,
      full_name: user.full_name,
      email: user.email,
      module_id: "87efa5b1-59dd-4c1e-8168-c82a519cb167", // REPOSITORY
      module_name: "Repository",
      roles: [
        {
          role_id: "bcb471d4-e59c-45f3-b512-e7c17a03c46c", // PUBLIC USER
          role_name: "Public User",
        },
      ],
    },
  });
};
