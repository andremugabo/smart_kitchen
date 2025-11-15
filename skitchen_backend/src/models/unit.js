export default (sequelize, DataTypes) => {
    const Unit = sequelize.define("Unit", {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT }
    }, {
      tableName: "Units",
      timestamps: false
    });
    return Unit;
  };
  