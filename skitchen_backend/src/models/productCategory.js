export default (sequelize, DataTypes) => {
    const ProductCategory = sequelize.define("ProductCategory", {
      name: { type: DataTypes.STRING(50), allowNull: false },
    }, { tableName: "ProductCategories", timestamps: false });
  
    return ProductCategory;
  };
  