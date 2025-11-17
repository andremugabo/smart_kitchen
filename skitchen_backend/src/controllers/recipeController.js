import {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  listRecipesByMenu,
} from "../services/recipeService.js";

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
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateRecipeController = async (req, res) => {
  try {
    const item = await updateRecipe(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteRecipeController = async (req, res) => {
  try {
    await deleteRecipe(req.params.id);
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