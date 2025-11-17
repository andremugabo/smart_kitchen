import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService.js";

export const listProductsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { rows, count } = await listProducts(page, limit);
    res.json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
      },
    });
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
    const { name, min_stock_threshold, category_id, purchasing_unit_id, selling_unit_id, isActive } = req.body;
    if (!name || !category_id) {
      return res.status(400).json({ success: false, error: "name and category_id are required" });
    }
    const picture = req.savedImagePath ?? req.body.picture ?? null;
    const item = await createProduct({ name, picture, min_stock_threshold, category_id, purchasing_unit_id, selling_unit_id, isActive });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.savedImagePath) {
      data.picture = req.savedImagePath;
    }
    const item = await updateProduct(req.params.id, data);
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
