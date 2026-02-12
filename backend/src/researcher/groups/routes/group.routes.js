import express from "express";
import * as GroupController from "../controllers/group.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, GroupController.createGroup);
router.get("/", authenticate, GroupController.getGroups);
router.get("/:uuid", authenticate, GroupController.getGroup);
router.put("/:uuid", authenticate, GroupController.updateGroup);
router.delete("/:uuid", authenticate, GroupController.deleteGroup);
// Add to group.route.js
router.post("/:uuid/invite", authenticate, GroupController.inviteToGroup);
router.get("/:uuid/invites", authenticate, GroupController.getGroupInvites);

// Protected routes
router.get('/my-groups', authenticate, GroupController.getMyGroups);
router.get('/my-publications', authenticate, GroupController.getMyPublications);
router.get('/my-events', authenticate, GroupController.getMyEvents);

export default router;
