import api from "./api";

export const fetchProducts = async ({ page = 1, limit = 20 } = {}) => {
  const res = await api.get("/products", { params: { page, limit } });
  return res.data;
};

export const fetchProduct = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (formData) => {
  const res = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProduct = async (id, formData) => {
  const res = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export const fetchProductCategories = async () => {
  const res = await api.get("/product-categories");
  return res.data;
};

export const fetchProductTypes = async () => {
  const res = await api.get("/product-types");
  return res.data;
};

export const fetchUnits = async () => {
  const res = await api.get("/units");
  return res.data;
};
