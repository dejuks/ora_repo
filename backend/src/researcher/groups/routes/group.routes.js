import express from "express";
import * as GroupController from "../controllers/group.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Group CRUD
router.post("/", authenticate, GroupController.createGroup);
router.get("/", authenticate, GroupController.getGroups);
router.get("/my-groups", authenticate, GroupController.getMyGroups); // Moved before /:uuid
router.get("/:uuid", authenticate, GroupController.getGroup);
router.put("/:uuid", authenticate, GroupController.updateGroup);
router.delete("/:uuid", authenticate, GroupController.deleteGroup);

// Member management routes - MUST be before /:uuid routes with params
router.get("/:uuid/members", authenticate, GroupController.getGroupMembers);
router.get("/:uuid/members/count", authenticate, GroupController.getMembersCount);
router.get("/:uuid/membership-status", authenticate, GroupController.checkMembershipStatus);
router.put("/:uuid/members/:userId/role", authenticate, GroupController.updateMemberRole);
router.delete("/:uuid/members/:userId", authenticate, GroupController.removeMember);

// Invitation routes
router.post("/:uuid/invite", authenticate, GroupController.inviteToGroup);
router.get("/:uuid/invites", authenticate, GroupController.getGroupInvites);

// Placeholder routes
router.get('/my-publications', authenticate, GroupController.getMyPublications);
router.get('/my-events', authenticate, GroupController.getMyEvents);

/* =====================================================
   PUBLIC/GLOBAL ACCESS ROUTES - NO PERMISSION CHECKS
   These routes bypass all permission validations
===================================================== */

// PUBLIC: Get all members of a group - NO PERMISSION REQUIRED
router.get("/:uuid/members/public", GroupController.getGroupMembersPublic);

// PUBLIC: Get members count - NO PERMISSION REQUIRED
router.get("/:uuid/members/count/public", async (req, res) => {
  try {
    const { uuid } = req.params;
    const count = await GroupModel.getMembersCount(uuid);
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   ADMIN ROUTES
===================================================== */

// Get all groups (admin)
router.get("/admin/all", authenticate, GroupController.getAllGroupsAdmin);

// Update group status (admin)
router.put("/admin/:uuid/status", authenticate, GroupController.updateGroupStatus);

// ================= ADMIN ROUTES =================

// MUST be before "/:uuid"
router.get(
  "/admin/:uuid/details",
  authenticate,
  GroupController.getGroupDetailsAdmin
);

// ================= NORMAL ROUTES =================
router.put('/groups/:groupId/status', authenticate, GroupController.updateGroupStatus);
// router.get("/:uuid", authenticate, GroupController.getGroupById);

export default router;