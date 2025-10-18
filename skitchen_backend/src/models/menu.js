export default (sequelize, DataTypes) => {
    const Menu = sequelize.define("Menu", {
      name: { type: DataTypes.STRING(100), allowNull: false },
      description: { type: DataTypes.TEXT },
      picture: { type: DataTypes.STRING(255) },
      price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      estimated_cost: { type: DataTypes.DECIMAL(10,2) },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_kitchen_item: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deleted_at: { type: DataTypes.DATE }
    }, { tableName: "Menus", timestamps: false });
    return Menu;
  };
  