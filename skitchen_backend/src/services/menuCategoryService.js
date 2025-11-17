import { MenuCategory } from "../models/index.js";

export const listMenuCategories = async () => {
  return MenuCategory.findAll({ order: [["name", "ASC"]] });
};

export const getMenuCategory = async (id) => {
  const item = await MenuCategory.findByPk(id);
  if (!item) throw new Error("MenuCategory not found");
  return item;
};

export const createMenuCategory = async (data) => {
  return MenuCategory.create({
    name: data.name,
    description: data.description ?? null,
  });
};

export const updateMenuCategory = async (id, data) => {
  const item = await getMenuCategory(id);
  await item.update({
    name: data.name ?? item.name,
    description: data.description ?? item.description,
  });
  return item;
};

export const deleteMenuCategory = async (id) => {
  const item = await getMenuCategory(id);
  await item.destroy();
  return { id };
};