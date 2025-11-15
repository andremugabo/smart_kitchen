import { Product } from "../models/index.js";

export const listProducts = async () => {
  return Product.findAll({ order: [["created_at", "DESC"]] });
};

export const getProduct = async (id) => {
  const item = await Product.findByPk(id);
  if (!item) throw new Error("Product not found");
  return item;
};

export const createProduct = async (data) => {
  return Product.create({
    name: data.name,
    picture: data.picture,
    min_stock_threshold: data.min_stock_threshold ?? 0,
    category_id: data.category_id,
    purchasing_unit_id: data.purchasing_unit_id ?? null,
    selling_unit_id: data.selling_unit_id ?? null,
    isActive: data.isActive ?? true,
  });
};

export const updateProduct = async (id, data) => {
  const item = await getProduct(id);
  await item.update({
    name: data.name ?? item.name,
    picture: data.picture ?? item.picture,
    min_stock_threshold: data.min_stock_threshold ?? item.min_stock_threshold,
    category_id: data.category_id ?? item.category_id,
    purchasing_unit_id: data.purchasing_unit_id ?? item.purchasing_unit_id,
    selling_unit_id: data.selling_unit_id ?? item.selling_unit_id,
    isActive: data.isActive ?? item.isActive,
  });
  return item;
};

export const deleteProduct = async (id) => {
  const item = await getProduct(id);
  await item.destroy();
  return { id };
};
