import express from "express";
import {
  sendMessage,
  getConversations,
  getMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
  deleteMessage
} from "../controllers/message.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post("/", sendMessage);
router.get("/conversations", getConversations);
router.get("/unread/count", getUnreadMessageCount);
router.get("/:conversationId", getMessages);
router.put("/:conversationId/read", markMessagesAsRead);
router.delete("/:messageId", deleteMessage);

export default router;