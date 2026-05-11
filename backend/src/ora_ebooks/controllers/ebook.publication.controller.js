import * as publicationModel from "../models/ebook.publication.model.js";

// ================= PUBLIC CATALOG =================
export async function listPublicCatalogController(req, res) {
  try {
    const result =
      await publicationModel.listPublicCatalog(req.query);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to load public catalog",
    });
  }
}
// makePublishedController
export async function makePublishedController(req, res) {
  try {
    const { id } = req.params;
    const result = await publicationModel.makePublished(id);
    if (!result) {
      return res.status(404).json({
        message: "Manuscript not found",
      });
    }
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to publish manuscript",
    });
  }
}

// ================= MANAGEMENT =================
export async function listPublicationsController(req, res) {
  try {
    const result =
      await publicationModel.listPublications(req.query);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to load publications",
    });
  }
}

// ================= SEARCH =================
export async function getPublicSearchSuggestionsController(
  req,
  res
) {
  try {
    const result =
      await publicationModel.getPublicSearchSuggestions(
        req.query
      );

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to load suggestions",
    });
  }
}

// ================= GET PUBLICATION =================
export const getPublicPublicationController = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const publication =
      await publicationModel.getPublicationById(id);

    if (!publication) {
      return res.status(404).json({
        message: "Publication not found",
      });
    }

    return res.json(publication);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

// ================= DOWNLOAD =================
export const downloadPublicPublicationController =
  async (req, res) => {
    try {
      const { id } = req.params;

      const publication =
        await publicationModel.getPublicationById(id);

      if (!publication) {
        return res.status(404).json({
          message: "Publication not found",
        });
      }

      if (!publication.file_path) {
        return res.status(404).json({
          message: "Publication file not found",
        });
      }

      return res.download(publication.file_path);
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: err.message || "Server error",
      });
    }
  };

// ================= CITATION =================
export const getPublicCitationController =
  async (req, res) => {
    try {
      const { id } = req.params;

      const citation =
        await publicationModel.getCitationById(id);

      if (!citation) {
        return res.status(404).json({
          message: "Citation not found",
        });
      }

      return res.json(citation);
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: err.message || "Server error",
      });
    }
  };