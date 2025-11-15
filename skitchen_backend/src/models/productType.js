export default (sequelize, DataTypes) => {
    const ProductType = sequelize.define("ProductType", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT }
    }, { tableName: "ProductTypes", timestamps: false });
    return ProductType;
  };
  