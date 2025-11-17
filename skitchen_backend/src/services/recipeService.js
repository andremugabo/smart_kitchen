import { Recipe, Product, Unit, Menu } from "../models/index.js";

export const listRecipes = async () => {
  return Recipe.findAll({
    include: [
      { model: Menu, attributes: ["id", "name"] },
      { model: Product, attributes: ["id", "name"] },
      { model: Unit, attributes: ["id", "name"] },
    ],
  });
};

export const getRecipe = async (id) => {
  const item = await Recipe.findByPk(id, {
    include: [
      { model: Menu, attributes: ["id", "name"] },
      { model: Product, attributes: ["id", "name"] },
      { model: Unit, attributes: ["id", "name"] },
    ],
  });
  if (!item) throw new Error("Recipe not found");
  return item;
};

export const createRecipe = async (data) => {
  return Recipe.create({
    menu_id: data.menu_id,
    product_id: data.product_id,
    quantity_required: data.quantity_required,
    unit_id: data.unit_id,
  });
};

export const updateRecipe = async (id, data) => {
  const item = await getRecipe(id);
  await item.update({
    menu_id: data.menu_id ?? item.menu_id,
    product_id: data.product_id ?? item.product_id,
    quantity_required: data.quantity_required ?? item.quantity_required,
    unit_id: data.unit_id ?? item.unit_id,
  });
  return item;
};

export const deleteRecipe = async (id) => {
  const item = await getRecipe(id);
  await item.destroy();
  return { id };
};

export const listRecipesByMenu = async (menuId) => {
  return Recipe.findAll({
    where: { menu_id: menuId },
    include: [{ model: Product }, { model: Unit }],
  });
};