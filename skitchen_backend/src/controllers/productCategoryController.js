import {
  listProductCategories,
  getProductCategory,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "../services/productCategoryService.js";

export const listProductCategoriesController = async (req, res) => {
  try {
    const items = await listProductCategories();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getProductCategoryController = async (req, res) => {
  try {
    const item = await getProductCategory(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createProductCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "name is required" });
    const item = await createProductCategory({ name });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateProductCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const item = await updateProductCategory(req.params.id, { name });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteProductCategoryController = async (req, res) => {
  try {
    await deleteProductCategory(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
