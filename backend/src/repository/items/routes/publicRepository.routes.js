import express from "express";
import {
  searchPublicItems,
  getPublicItem,
  trackView,
  trackDownload,
  rateItem,
} from "../controllers/publicRepository.controller.js";

const router = express.Router();

router.get("/search", searchPublicItems);
router.get("/item/:uuid", getPublicItem);
router.post("/item/:uuid/view", trackView);
router.post("/item/:uuid/download", trackDownload);
router.post("/item/:uuid/rate", rateItem);

export default router;
