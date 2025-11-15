export default (sequelize, DataTypes) => {
    const PurchaseHistory = sequelize.define("PurchaseHistory", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      purchase_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      product_id: { type: DataTypes.UUID, allowNull: false },
      user_id: { type: DataTypes.UUID, allowNull: false },
      quantity: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      price_per_unit: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      supplier_name: { type: DataTypes.STRING(100) },
      invoice_no: { type: DataTypes.STRING(100) },
      notes: { type: DataTypes.TEXT },
      proof_image: { type: DataTypes.STRING(255) }
    }, { tableName: "PurchaseHistory", timestamps: false });
    return PurchaseHistory;
  };
  