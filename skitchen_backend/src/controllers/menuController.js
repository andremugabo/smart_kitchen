import {
  listMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  calculateMenuProfit,
} from "../services/menuService.js";

export const listMenusController = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { rows, count } = await listMenus(page, limit);
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

export const getMenuController = async (req, res) => {
  try {
    const item = await getMenu(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createMenuController = async (req, res) => {
  try {
    const { name, price, category_id } = req.body;
    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        error: "name, price and category_id are required",
      });
    }
    const data = {
      ...req.body,
      picture: req.savedImagePath ?? req.body.picture ?? null,
    };
    const item = await createMenu(data);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateMenuController = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.savedImagePath) {
      data.picture = req.savedImagePath;
    }
    const item = await updateMenu(req.params.id, data);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteMenuController = async (req, res) => {
  try {
    await deleteMenu(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getMenuProfitController = async (req, res) => {
  try {
    const info = await calculateMenuProfit(req.params.id);
    res.json({ success: true, data: info });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};