import { ProductType } from "../models/index.js";

export const listProductTypes = async () => {
  return ProductType.findAll({ order: [["name", "ASC"]] });
};

export const getProductType = async (id) => {
  const item = await ProductType.findByPk(id);
  if (!item) throw new Error("ProductType not found");
  return item;
};

export const createProductType = async (data) => {
  return ProductType.create({ name: data.name, description: data.description });
};

export const updateProductType = async (id, data) => {
  const item = await getProductType(id);
  await item.update({ name: data.name, description: data.description });
  return item;
};

export const deleteProductType = async (id) => {
  const item = await getProductType(id);
  await item.destroy();
  return { id };
};
