import express from "express";

import {
  listPublicCatalogController,
  listPublicationsController,
  getPublicSearchSuggestionsController,
  getPublicCitationController,
  downloadPublicPublicationController,
  getPublicPublicationController,
makePublishedController
} from "../controllers/ebook.publication.controller.js";

const router = express.Router();

// ================= PUBLIC =================
router.get("/public/publications/:id",getPublicPublicationController);
// http://localhost:5000/api/ebooks/public/publications/576feeeb-8e2d-4100-b3f2-99df07e67cd8

router.get(
  "/publications",
  listPublicCatalogController
);
// change the status to published in the database to show up in the public catalog
  // publishManuscript
  // publishManuscript: (id, data) => {
  //   return unwrap(() =>
  //     api.put(`/ebooks/manuscripts/${id}/publish`, data)
  //   );
  // },
  router.put('/manuscripts/:id/publish',makePublishedController);
// ================= MANAGEMENT =================
router.get(
  "/management/publications",
  listPublicationsController
);

// ================= SEARCH =================
router.get(
  "/publications/search/suggestions",
  getPublicSearchSuggestionsController
);

router.get(
  "/ebooks/public/publications/:id/citation",
  getPublicCitationController
);

router.get(
  "/ebooks/public/publications/:id/download",
  downloadPublicPublicationController
);

export default router;