import express from "express";
import {
  searchPublicItems,
  getPublicItem,
  trackView,
  trackDownload,
  rateItem,
  getPublicStats,
  getRecentPublicItems,
} from "../controllers/publicRepository.controller.js";

const router = express.Router();

router.get("/search", searchPublicItems);
router.get("/stats", getPublicStats);
router.get("/recent", getRecentPublicItems);

router.get("/item/:uuid", getPublicItem);
router.post("/item/:uuid/view", trackView);
router.post("/item/:uuid/download", trackDownload);
router.post("/item/:uuid/rate", rateItem);

export default router;