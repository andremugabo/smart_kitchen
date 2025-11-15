import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService.js";

export const listProductsController = async (req, res) => {
  try {
    const items = await listProducts();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getProductController = async (req, res) => {
  try {
    const item = await getProduct(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createProductController = async (req, res) => {
  try {
    const { name, picture, min_stock_threshold, category_id, purchasing_unit_id, selling_unit_id, isActive } = req.body;
    if (!name || !category_id) {
      return res.status(400).json({ success: false, error: "name and category_id are required" });
    }
    const item = await createProduct({ name, picture, min_stock_threshold, category_id, purchasing_unit_id, selling_unit_id, isActive });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const item = await updateProduct(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
