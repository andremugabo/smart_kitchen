import { ProductCategory } from "../models/index.js";

export const listProductCategories = async () => {
  return ProductCategory.findAll({ order: [["name", "ASC"]] });
};

export const getProductCategory = async (id) => {
  const item = await ProductCategory.findByPk(id);
  if (!item) throw new Error("ProductCategory not found");
  return item;
};

export const createProductCategory = async (data) => {
  return ProductCategory.create({ name: data.name, type_id: data.type_id });
};

export const updateProductCategory = async (id, data) => {
  const item = await getProductCategory(id);
  await item.update({ name: data.name, type_id: data.type_id });
  return item;
};

export const deleteProductCategory = async (id) => {
  const item = await getProductCategory(id);
  await item.destroy();
  return { id };
};
