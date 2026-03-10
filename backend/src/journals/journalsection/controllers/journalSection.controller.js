import JournalSection from "../models/journalSection.model.js";

export const getSections = async (req, res) => {
  try {
    const { journalId } = req.params;

    const sections = await JournalSection.findByJournalId(journalId);
    res.json(sections);
  } catch (err) {
    console.error("GET SECTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch journal sections" });
  }
};

export const createSection = async (req, res) => {
  try {
    const { journalId } = req.params;
    const { name, description } = req.body;

    const section = await JournalSection.create({
      journal_id: journalId,
      name,
      description,
    });

    res.status(201).json(section);
  } catch (err) {
    console.error("CREATE SECTION ERROR:", err);
    res.status(500).json({ message: "Failed to create section" });
  }
};

export const updateSection = async (req, res) => {
  try {
    const section = await JournalSection.update(req.params.id, req.body);
    res.json(section);
  } catch (err) {
    console.error("UPDATE SECTION ERROR:", err);
    res.status(500).json({ message: "Failed to update section" });
  }
};

export const deleteSection = async (req, res) => {
  try {
    await JournalSection.delete(req.params.id);
    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    console.error("DELETE SECTION ERROR:", err);
    res.status(500).json({ message: "Failed to delete section" });
  }
};
