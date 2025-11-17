import { Menu, Recipe, Product, Unit, PurchaseHistory } from "../models/index.js";

export const listMenus = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { rows, count } = await Menu.findAndCountAll({
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return { rows, count };
};

export const getMenu = async (id) => {
  const item = await Menu.findByPk(id);
  if (!item) throw new Error("Menu not found");
  return item;
};

export const createMenu = async (data) => {
  return Menu.create({
    name: data.name,
    description: data.description ?? null,
    picture: data.picture ?? null,
    price: data.price,
    estimated_cost: data.estimated_cost ?? null,
    is_active: data.is_active ?? true,
    is_kitchen_item: data.is_kitchen_item ?? false,
    category_id: data.category_id,
  });
};

export const updateMenu = async (id, data) => {
  const item = await getMenu(id);
  await item.update({
    name: data.name ?? item.name,
    description: data.description ?? item.description,
    picture: data.picture ?? item.picture,
    price: data.price ?? item.price,
    estimated_cost: data.estimated_cost ?? item.estimated_cost,
    is_active: data.is_active ?? item.is_active,
    is_kitchen_item: data.is_kitchen_item ?? item.is_kitchen_item,
    category_id: data.category_id ?? item.category_id,
  });
  return item;
};

export const deleteMenu = async (id) => {
  const item = await getMenu(id);
  await item.destroy();
  return { id };
};

export const calculateMenuCost = async (menuId) => {
  const menu = await getMenu(menuId);

  const recipes = await Recipe.findAll({
    where: { menu_id: menuId },
    include: [{ model: Product }, { model: Unit }],
  });

  let totalCost = 0;

  for (const recipe of recipes) {
    const product = recipe.Product;
    if (!product) continue;

    const lastPurchase = await PurchaseHistory.findOne({
      where: { product_id: product.id },
      order: [["purchase_date", "DESC"]],
    });
    if (!lastPurchase) continue;

    const purchasingCostPerUnit = Number(lastPurchase.price_per_unit);
    const conversionFactor = Number(product.conversion_factor || 1);
    const costPerRecipeUnit = purchasingCostPerUnit / conversionFactor;

    const qty = Number(recipe.quantity_required);
    totalCost += qty * costPerRecipeUnit;
  }

  return { menu, cost: totalCost };
};

export const calculateMenuProfit = async (menuId) => {
  const { menu, cost } = await calculateMenuCost(menuId);
  const price = Number(menu.price);
  const profit = price - cost;
  const margin = price > 0 ? profit / price : 0;
  return { menu, cost, price, profit, margin };
};