export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      order_id: { type: DataTypes.UUID, allowNull: true },
      title: { type: DataTypes.STRING(150), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      type: { type: DataTypes.ENUM('system', 'order', 'inventory', 'payment'), defaultValue: 'system' },
      is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: "Notifications", timestamps: false }
  );

  return Notification;
};
