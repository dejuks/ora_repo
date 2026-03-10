import JournalUser from "../models/journalUser.model.js";

export const registerJournalAuthor = async (req, res) => {
  try {

    const photo = req.file
      ? `/uploads/users/${req.file.filename}`
      : null;

    const user = await JournalUser.createJournalAuthor({
      ...req.body,
      photo,
    });

    res.status(201).json({
      message: "Journal Author registered successfully",
      user,
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Journal registration failed",
    });
  }
};
