export default (sequelize, DataTypes) => {
    const Inventory = sequelize.define("Inventory", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      product_id: { type: DataTypes.UUID, allowNull: false },
      quantity_available: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      last_updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, { tableName: "Inventory", timestamps: false });
    return Inventory;
  };
  