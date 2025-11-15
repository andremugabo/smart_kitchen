export default (sequelize, DataTypes) => {
    const Order = sequelize.define("Order", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      total_amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'canceled'), defaultValue: 'pending' },
      table_number: { type: DataTypes.STRING(20) },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deleted_at: { type: DataTypes.DATE }
    }, { tableName: "Orders", timestamps: false });
    return Order;
  };
  