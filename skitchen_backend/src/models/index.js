import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

import UnitModel from "./unit.js";
import ProductTypeModel from "./productType.js";
import ProductCategoryModel from "./productCategory.js";
import UserModel from "./user.js";
import ProductModel from "./product.js";
import InventoryModel from "./inventory.js";
import PurchaseHistoryModel from "./purchaseHistory.js";
import MenuCategoryModel from "./menuCategory.js";
import MenuModel from "./menu.js";
import RecipeModel from "./recipe.js";
import OrderModel from "./order.js";
import OrderDetailModel from "./orderDetail.js";
import OrderChangeRequestModel from "./orderChangeRequest.js";
import PaymentModel from "./payment.js";
import NotificationModel from "./notification.js";
import SettingsModel from "./settings.js";

const Unit = UnitModel(sequelize, DataTypes);
const ProductType = ProductTypeModel(sequelize, DataTypes);
const ProductCategory = ProductCategoryModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const Inventory = InventoryModel(sequelize, DataTypes);
const PurchaseHistory = PurchaseHistoryModel(sequelize, DataTypes);
const MenuCategory = MenuCategoryModel(sequelize, DataTypes);
const Menu = MenuModel(sequelize, DataTypes);
const Recipe = RecipeModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);
const OrderDetail = OrderDetailModel(sequelize, DataTypes);
const OrderChangeRequest = OrderChangeRequestModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const Settings = SettingsModel(sequelize, DataTypes);

// Relationships
ProductType.hasMany(ProductCategory, { foreignKey: "type_id" });
ProductCategory.belongsTo(ProductType, { foreignKey: "type_id" });

ProductCategory.hasMany(Product, { foreignKey: "category_id" });
Product.belongsTo(ProductCategory, { foreignKey: "category_id" });

Product.belongsTo(Unit, { as: "purchasing_unit", foreignKey: "purchasing_unit_id" });
Product.belongsTo(Unit, { as: "selling_unit", foreignKey: "selling_unit_id" });

Product.hasOne(Inventory, { foreignKey: "product_id" });
Inventory.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(PurchaseHistory, { foreignKey: "product_id" });
PurchaseHistory.belongsTo(Product, { foreignKey: "product_id" });
User.hasMany(PurchaseHistory, { foreignKey: "user_id" });
PurchaseHistory.belongsTo(User, { foreignKey: "user_id" });

MenuCategory.hasMany(Menu, { foreignKey: "category_id" });
Menu.belongsTo(MenuCategory, { foreignKey: "category_id" });

Menu.hasMany(Recipe, { foreignKey: "menu_id" });
Recipe.belongsTo(Menu, { foreignKey: "menu_id" });
Product.hasMany(Recipe, { foreignKey: "product_id" });
Recipe.belongsTo(Product, { foreignKey: "product_id" });
Recipe.belongsTo(Unit, { foreignKey: "unit_id" });

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderDetail, { foreignKey: "order_id" });
OrderDetail.belongsTo(Order, { foreignKey: "order_id" });

Menu.hasMany(OrderDetail, { foreignKey: "menu_id" });
OrderDetail.belongsTo(Menu, { foreignKey: "menu_id" });

// Chef preparing items
User.hasMany(OrderDetail, { foreignKey: "chef_id", as: "PreparedItems" });
OrderDetail.belongsTo(User, { foreignKey: "chef_id", as: "Chef" });

Order.hasMany(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

// Notifications
User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(Notification, { foreignKey: "order_id" });
Notification.belongsTo(Order, { foreignKey: "order_id" });

Order.hasMany(OrderChangeRequest, { foreignKey: "order_id" });
OrderChangeRequest.belongsTo(Order, { foreignKey: "order_id" });

OrderDetail.hasMany(OrderChangeRequest, { foreignKey: "order_detail_id" });
OrderChangeRequest.belongsTo(OrderDetail, { foreignKey: "order_detail_id" });

// DB connection test
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
    await sequelize.sync({ alter: false }); 
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

export {
  sequelize,
  Unit,
  ProductType,
  ProductCategory,
  User,
  Product,
  Inventory,
  PurchaseHistory,
  MenuCategory,
  Menu,
  Recipe,
  Order,
  OrderDetail,
  OrderChangeRequest,
  Payment,
  Notification,
  Settings,
};
