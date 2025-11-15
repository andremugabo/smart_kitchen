import { Inventory } from "../models/index.js";

export const listInventory = async () => {
  return Inventory.findAll({ order: [["last_updated", "DESC"]] });
};

export const getInventoryByProduct = async (product_id) => {
  return Inventory.findOne({ where: { product_id } });
};

export const setInventoryQuantity = async (product_id, quantity) => {
  const existing = await getInventoryByProduct(product_id);
  if (existing) {
    existing.quantity_available = quantity;
    existing.last_updated = new Date();
    await existing.save();
    return existing;
  }
  return Inventory.create({ product_id, quantity_available: quantity });
};

export const incrementInventory = async (product_id, amount) => {
  const existing = await getInventoryByProduct(product_id);
  if (existing) {
    const current = parseFloat(existing.quantity_available) || 0;
    existing.quantity_available = current + parseFloat(amount);
    existing.last_updated = new Date();
    await existing.save();
    return existing;
  }
  return Inventory.create({ product_id, quantity_available: amount });
};

export const decrementInventory = async (product_id, amount) => {
  const existing = await getInventoryByProduct(product_id);
  if (!existing) throw new Error("Inventory record not found");
  const current = parseFloat(existing.quantity_available) || 0;
  const next = current - parseFloat(amount);
  if (next < 0) throw new Error("Insufficient inventory");
  existing.quantity_available = next;
  existing.last_updated = new Date();
  await existing.save();
  return existing;
};
