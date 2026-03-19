import ManuscriptCategoryies from "../models/models.categories.js";


export const getAllCategories = async (req, res) => {
  try {
    const stages = await ManuscriptCategoryies.findAll();
    res.json(stages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};