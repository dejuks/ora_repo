import { WikiArticle } from "../models/wikiArticle.model.js";

/* ================= CREATE ================= */
export const createArticle = async (req, res) => {
  try {
    const { title, slug, language = "om", status = "draft" } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const result = await WikiArticle.create({
      title,
      slug,
      language,
      status,
      created_by: req.user?.uuid || req.body.created_by,
    });

    const article = result?.rows?.[0];
    if (!article) return res.status(500).json({ error: "Article creation failed" });

    res.status(201).json(article);
  } catch (err) {
    console.error("CREATE ARTICLE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET ALL + FILTER ================= */
export const getArticles = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const result = await WikiArticle.findAll({ status, search, page, limit });
    res.json(result?.rows || []);
  } catch (err) {
    console.error("GET ARTICLES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET DRAFT ARTICLES ================= */
export const getDraftArticles = async (req, res) => {
  try {
    const result = await WikiArticle.findByStatus("draft");
    res.json(result?.rows || []);
  } catch (err) {
    console.error("GET DRAFT ARTICLES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET BY ID ================= */
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await WikiArticle.findById(id);

    const article = result?.rows?.[0];
    if (!article) return res.status(404).json({ message: "Article not found" });

    res.json(article);
  } catch (err) {
    console.error("GET ARTICLE BY ID ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET BY SLUG ================= */
export const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await WikiArticle.findBySlug(slug);

    const article = result?.rows?.[0];
    if (!article) return res.status(404).json({ message: "Article not found" });

    res.json(article);
  } catch (err) {
    console.error("GET ARTICLE BY SLUG ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await WikiArticle.update(id, req.body);

    const article = result?.rows?.[0];
    if (!article) return res.status(404).json({ message: "Article not found" });

    res.json(article);
  } catch (err) {
    console.error("UPDATE ARTICLE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE ================= */
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await WikiArticle.delete(id);

    const deleted = result?.rows?.[0];
    if (!deleted) return res.status(404).json({ message: "Article not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ARTICLE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
