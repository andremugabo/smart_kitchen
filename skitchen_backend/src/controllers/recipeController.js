import {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  listRecipesByMenu,
} from "../services/recipeService.js";
import { calculateMenuCost } from "../services/menuService.js";

export const listRecipesController = async (req, res) => {
  try {
    const items = await listRecipes();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getRecipeController = async (req, res) => {
  try {
    const item = await getRecipe(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createRecipeController = async (req, res) => {
  try {
    const { menu_id, product_id, quantity_required, unit_id } = req.body;
    if (!menu_id || !product_id || !quantity_required || !unit_id) {
      return res.status(400).json({
        success: false,
        error: "menu_id, product_id, quantity_required, unit_id are required",
      });
    }
    const item = await createRecipe({
      menu_id,
      product_id,
      quantity_required,
      unit_id,
    });
    await calculateMenuCost(menu_id);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateRecipeController = async (req, res) => {
  try {
    const existing = await getRecipe(req.params.id);
    const item = await updateRecipe(req.params.id, req.body);

    const oldMenuId = existing.menu_id;
    const newMenuId = item.menu_id;

    if (oldMenuId) {
      await calculateMenuCost(oldMenuId);
    }
    if (newMenuId && newMenuId !== oldMenuId) {
      await calculateMenuCost(newMenuId);
    }

    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteRecipeController = async (req, res) => {
  try {
    const existing = await getRecipe(req.params.id);
    const menuId = existing.menu_id;

    await deleteRecipe(req.params.id);

    if (menuId) {
      await calculateMenuCost(menuId);
    }

    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const listRecipesByMenuController = async (req, res) => {
  try {
    const items = await listRecipesByMenu(req.params.menuId);
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};