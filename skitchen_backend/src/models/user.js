export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM("admin", "chef", "manager", "waiter"),
        allowNull: false,
      },
      email: { type: DataTypes.STRING(100), unique: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      picture: { type: DataTypes.STRING(255), allowNull: true },

      // Timestamps
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deleted_at: { type: DataTypes.DATE },
    },
    {
      tableName: "Users",
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    }
  );

  User.beforeUpdate((user) => {
    user.updated_at = new Date();
  });

  return User;
};
