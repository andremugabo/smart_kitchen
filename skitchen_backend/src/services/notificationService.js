import { Notification } from "../models/index.js";

export const listUserNotifications = async (userId) => {
  return Notification.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
  });
};

export const markNotificationRead = async (id) => {
  const item = await Notification.findByPk(id);
  if (!item) throw new Error("Notification not found");
  await item.update({ is_read: true });
  return item;
};

export const markAllNotificationsRead = async (userId) => {
  await Notification.update(
    { is_read: true },
    {
      where: {
        user_id: userId,
        is_read: false,
      },
    }
  );
};
