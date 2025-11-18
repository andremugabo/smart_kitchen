import api from "./api";

export const listProductTypes = async () => {
  const res = await api.get("/product-types");
  return res.data;
};

export const getProductType = async (id) => {
  const res = await api.get(`/product-types/${id}`);
  return res.data;
};

export const createProductType = async (payload) => {
  const res = await api.post("/product-types", payload);
  return res.data;
};

export const updateProductType = async (id, payload) => {
  const res = await api.put(`/product-types/${id}`, payload);
  return res.data;
};

export const deleteProductType = async (id) => {
  const res = await api.delete(`/product-types/${id}`);
  return res.data;
};
