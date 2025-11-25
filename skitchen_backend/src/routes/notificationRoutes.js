import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listUserNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
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

// Mark all notifications for a user as read
router.post(
  "/user/:userId/mark-all-read",
  authenticate("admin", "manager", "waiter", "chef"),
  markAllNotificationsReadController
);

export default router;
