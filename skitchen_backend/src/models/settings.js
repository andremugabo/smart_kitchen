export default (sequelize, DataTypes) => {
  const Settings = sequelize.define(
    "Settings",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companyEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      companyPhone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companyAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companyLogoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      taxRate: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      serviceCharge: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      invoiceFooterText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "RWF",
      },
      allowedPaymentMethods: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ["cash", "card", "mobile"],
      },
    },
    {
      tableName: "settings",
      timestamps: true,
    }
  );

  return Settings;
};
