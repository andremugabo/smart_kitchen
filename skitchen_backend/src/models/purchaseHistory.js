export default (sequelize, DataTypes) => {
    const PurchaseHistory = sequelize.define("PurchaseHistory", {
      purchase_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      quantity: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      price_per_unit: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      supplier_name: { type: DataTypes.STRING(100) }
    }, { tableName: "PurchaseHistory", timestamps: false });
    return PurchaseHistory;
  };
  