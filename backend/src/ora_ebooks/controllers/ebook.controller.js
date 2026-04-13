import { ebookWorkflowService } from "../services/ebookWorkflow.service.js";

export const index = (req, res) => {
  res.json({ message: "Ebook API running..." });
};

export const getPublications = async (req, res, next) => {
  try {
    const data = await ebookWorkflowService.publicCatalog(req.query || {});
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getPublicationBySlug = async (req, res, next) => {
  try {
    const catalog = await ebookWorkflowService.publicCatalog({
      search: req.params.slug,
      limit: 20,
    });

    const row =
      catalog.rows.find((item) => item.slug === req.params.slug) || null;

    if (!row) {
      return res.status(404).json({ message: "Publication not found" });
    }

    await ebookWorkflowService.logPublicAccess(row.publication_id, {
      event_type: "view",
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
      actor_id: null,
    });

    res.json(row);
  } catch (error) {
    next(error);
  }
};