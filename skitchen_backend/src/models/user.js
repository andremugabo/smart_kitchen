export default (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      role: { type: DataTypes.ENUM('admin', 'chef', 'manager', 'waiter'), allowNull: false },
      email: { type: DataTypes.STRING(100), unique: true },
      isActive: {type: DataTypes.BOOLEAN, defaultValue: true},
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deleted_at: { type: DataTypes.DATE }
    }, { tableName: "Users", timestamps: false });
    return User;
  };
  