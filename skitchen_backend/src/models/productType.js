export default (sequelize, DataTypes) => {
    const ProductType = sequelize.define("ProductType", {
      name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT }
    }, { tableName: "ProductTypes", timestamps: false });
    return ProductType;
  };
  