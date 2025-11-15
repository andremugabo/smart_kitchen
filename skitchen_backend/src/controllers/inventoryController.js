import {
  listInventory,
  getInventoryByProduct,
  setInventoryQuantity,
  incrementInventory,
  decrementInventory,
} from "../services/inventoryService.js";

export const listInventoryController = async (_req, res) => {
  try {
    const data = await listInventory();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getInventoryByProductController = async (req, res) => {
  try {
    const { product_id } = req.params;
    const item = await getInventoryByProduct(product_id);
    if (!item) return res.status(404).json({ success: false, error: "Inventory not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const setInventoryQuantityController = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;
    if (quantity == null) return res.status(400).json({ success: false, error: "quantity is required" });
    const item = await setInventoryQuantity(product_id, quantity);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const incrementInventoryController = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { amount } = req.body;
    if (amount == null) return res.status(400).json({ success: false, error: "amount is required" });
    const item = await incrementInventory(product_id, amount);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const decrementInventoryController = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { amount } = req.body;
    if (amount == null) return res.status(400).json({ success: false, error: "amount is required" });
    const item = await decrementInventory(product_id, amount);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
