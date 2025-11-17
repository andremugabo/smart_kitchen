export default (sequelize, DataTypes) => {
    const Product = sequelize.define("Product", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      picture: { type: DataTypes.STRING(255) },
      min_stock_threshold: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
      category_id: { type: DataTypes.UUID, allowNull: false },
      purchasing_unit_id: { type: DataTypes.UUID, allowNull: true },
      selling_unit_id: { type: DataTypes.UUID, allowNull: true },
      conversion_factor: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true, // or false with default
      },
      isActive: {type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deleted_at: { type: DataTypes.DATE }
    }, { tableName: "Products", timestamps: false });
    return Product;
  };
  