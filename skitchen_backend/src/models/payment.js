export default (sequelize, DataTypes) => {
    const Payment = sequelize.define("Payment", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: { type: DataTypes.UUID, allowNull: false },
      payment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      method: { type: DataTypes.ENUM('cash', 'card', 'mobile', 'tab'), allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'), defaultValue: 'pending' },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, { tableName: "Payments", timestamps: false });
    return Payment;
  };
  