import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listUserNotificationsController,
  markNotificationReadController,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get notifications for a user
router.get(
  "/user/:userId",
  authenticate("admin", "manager", "waiter", "chef"),
  listUserNotificationsController
);

// Mark a notification as read
router.patch(
  "/:id/read",
  authenticate("admin", "manager", "waiter", "chef"),
  markNotificationReadController
);

export default router;
