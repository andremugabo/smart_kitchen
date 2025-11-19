import { PurchaseHistory, Product, User } from "../models/index.js";
import { incrementInventory } from "./inventoryService.js";

export const listPurchases = async () => {
  return PurchaseHistory.findAll({ order: [["purchase_date", "DESC"]] });
};

export const getPurchase = async (id) => {
  const ph = await PurchaseHistory.findByPk(id);
  if (!ph) throw new Error("Purchase not found");
  return ph;
};

export const createPurchase = async ({ product_id, user_id, quantity, price_per_unit, supplier_name, purchase_date, invoice_no, notes, proof_image }) => {
  const product = await Product.findByPk(product_id);
  if (!product) throw new Error("Product not found");

  if (user_id) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error("User not found");
  }

  const payload = {
    product_id,
    user_id,
    quantity,
    price_per_unit,
    supplier_name,
    purchase_date: purchase_date || new Date(),
    invoice_no,
    notes,
    proof_image,
  };

  const purchase = await PurchaseHistory.create(payload);

  // Update inventory: create or increment quantity for this product
  if (quantity != null) {
    await incrementInventory(product_id, quantity);
  }

  return purchase;
};
