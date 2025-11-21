export default (sequelize, DataTypes) => {
    const OrderDetail = sequelize.define("OrderDetail", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: { type: DataTypes.UUID, allowNull: false },
      menu_id: { type: DataTypes.UUID, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      price_at_time: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      kitchen_note: { type: DataTypes.TEXT },
      chef_id: { type: DataTypes.UUID, allowNull: true },
      prep_started_at: { type: DataTypes.DATE, allowNull: true },
      prep_completed_at: { type: DataTypes.DATE, allowNull: true }
    }, { tableName: "OrderDetails", timestamps: false });
    return OrderDetail;
  };