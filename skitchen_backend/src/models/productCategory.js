export default (sequelize, DataTypes) => {
    const ProductCategory = sequelize.define("ProductCategory", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(50), allowNull: false },
      type_id: { type: DataTypes.UUID, allowNull: false },
    }, { tableName: "ProductCategories", timestamps: false });
  
    return ProductCategory;
  };
  