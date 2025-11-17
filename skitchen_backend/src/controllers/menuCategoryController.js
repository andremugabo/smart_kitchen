import {
  listMenuCategories,
  getMenuCategory,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from "../services/menuCategoryService.js";

export const listMenuCategoriesController = async (req, res) => {
  try {
    const items = await listMenuCategories();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getMenuCategoryController = async (req, res) => {
  try {
    const item = await getMenuCategory(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createMenuCategoryController = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "name is required" });
    }
    const item = await createMenuCategory({ name, description });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateMenuCategoryController = async (req, res) => {
  try {
    const item = await updateMenuCategory(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteMenuCategoryController = async (req, res) => {
  try {
    await deleteMenuCategory(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};