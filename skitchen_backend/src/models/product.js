export default (sequelize, DataTypes) => {
    const Product = sequelize.define("Product", {
      name: { type: DataTypes.STRING(100), allowNull: false },
      picture: { type: DataTypes.STRING(255) },
      min_stock_threshold: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
      isActive: {type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deleted_at: { type: DataTypes.DATE }
    }, { tableName: "Products", timestamps: false });
    return Product;
  };
  