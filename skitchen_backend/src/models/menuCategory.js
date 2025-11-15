export default (sequelize, DataTypes) => {
    const MenuCategory = sequelize.define(
      "MenuCategory",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        }
      },
      {
        tableName: "MenuCategories",
        timestamps: false 
      }
    );
  
    return MenuCategory;
  };
  