import express from "express";
import {
  registerPublicUser,
  listPublicUsers,
  getPublicUser,
  updatePublicUserProfile,
  removePublicUser,loginPublicUser,
} from "../controllers/publicUser.controller.js";

const router = express.Router();

router.post("/register", registerPublicUser);        // CREATE /api/public-users/register
router.get("/", listPublicUsers);            // READ ALL
router.get("/:uuid", getPublicUser);          // READ ONE
router.put("/:uuid", updatePublicUserProfile); // UPDATE
router.delete("/:uuid", removePublicUser);    // DELETE
router.post("/login", loginPublicUser);             // LOGIN (added)

export default router;
