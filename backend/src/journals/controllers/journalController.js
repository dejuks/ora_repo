import Journal from "../models/journal.model.js";

export const getJournals = async (req, res) => {
  try {
    const journals = await Journal.findAll();
    res.json(journals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch journals" });
  }
};

export const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: "Journal not found" });
    res.json(journal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch journal" });
  }
};

export const createJournal = async (req, res) => {
  try {
    const { title, issn, description } = req.body;
    const journal = await Journal.create({ title, issn, description });
    res.status(201).json(journal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create journal" });
  }
};

export const updateJournal = async (req, res) => {
  try {
    const { title, issn, description } = req.body;
    const journal = await Journal.update(req.params.id, { title, issn, description });
    if (!journal) return res.status(404).json({ message: "Journal not found" });
    res.json(journal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update journal" });
  }
};
export const getAllJournals = async (req, res) => {
  try {
    const journals = await Journal.findAll();
    res.json(journals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch journals" });
  }
};


export const deleteJournal = async (req, res) => {
  try {
    await Journal.delete(req.params.id);
    res.json({ message: "Journal deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete journal" });
  }
};
