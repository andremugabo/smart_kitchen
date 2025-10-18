export default (sequelize, DataTypes) => {
    const OrderDetail = sequelize.define("OrderDetail", {
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      price_at_time: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      kitchen_note: { type: DataTypes.TEXT }
    }, { tableName: "OrderDetails", timestamps: false });
    return OrderDetail;
  };
  