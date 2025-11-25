import {
  listUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService.js";

export const listUserNotificationsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await listUserNotifications(userId);
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const markNotificationReadController = async (req, res) => {
  try {
    const item = await markNotificationRead(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const markAllNotificationsReadController = async (req, res) => {
  try {
    const { userId } = req.params;
    await markAllNotificationsRead(userId);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
