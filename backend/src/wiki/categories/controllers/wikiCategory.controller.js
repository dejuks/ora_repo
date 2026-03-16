import { WikiCategory } from "../models/wikiCategory.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const result = await WikiCategory.create({ name, description });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await WikiCategory.findAll();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const result = await WikiCategory.findById(req.params.id);
    if (!result.rows.length)
      return res.status(404).json({ error: "Category not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await WikiCategory.update(req.params.id, { name, description });
    if (!result.rows.length)
      return res.status(404).json({ error: "Category not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const result = await WikiCategory.delete(req.params.id);
    if (!result.rows.length)
      return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
