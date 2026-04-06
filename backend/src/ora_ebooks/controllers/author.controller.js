import bcrypt from "bcrypt";
import { createAuthorWithUser } from "../models/author.models.js";

export const registerAuthor = async (req, res) => {
  try {
    const data = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    const result = await createAuthorWithUser(data);

    res.status(201).json({
      message: "Author registered successfully",
      user_id: result.userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};