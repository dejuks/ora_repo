import express from "express";
import {
  createPublication,
  getMyPublications,
  getAllPublications,
  getPublicationsByUser,
  updatePublication,
  deletePublication,
  likePublication,
  unlikePublication,
  commentOnPublication,
  getPublicationComments,
  uploadPublicationFile
} from "../controllers/publication.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Publication CRUD
router.post("/", uploadPublicationFile, createPublication);
router.get("/", getMyPublications);
router.get("/all", getAllPublications);
router.get("/user/:userId", getPublicationsByUser);
router.put("/:publicationId", uploadPublicationFile, updatePublication);
router.delete("/:publicationId", deletePublication);

// Likes
router.post("/:publicationId/like", likePublication);
router.delete("/:publicationId/like", unlikePublication);

// Comments
router.post("/:publicationId/comments", commentOnPublication);
router.get("/:publicationId/comments", getPublicationComments);

export default router;