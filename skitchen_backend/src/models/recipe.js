export default (sequelize, DataTypes) => {
    const Recipe = sequelize.define(
      "Recipe",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        menu_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        quantity_required: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: 0.01
          }
        },
        unit_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      {
        tableName: "Recipes",
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: ["menu_id", "product_id"]
          }
        ]
      }
    );
  
    return Recipe;
  };
  