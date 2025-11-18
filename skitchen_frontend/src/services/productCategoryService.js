import api from "./api";

export const listProductCategories = async () => {
  const res = await api.get("/product-categories");
  return res.data;
};

export const getProductCategory = async (id) => {
  const res = await api.get(`/product-categories/${id}`);
  return res.data;
};

export const createProductCategory = async (payload) => {
  const res = await api.post("/product-categories", payload);
  return res.data;
};

export const updateProductCategory = async (id, payload) => {
  const res = await api.put(`/product-categories/${id}`, payload);
  return res.data;
};

export const deleteProductCategory = async (id) => {
  const res = await api.delete(`/product-categories/${id}`);
  return res.data;
};
