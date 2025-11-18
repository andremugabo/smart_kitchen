import api from "./api";

export const listMenuCategories = async () => {
  const res = await api.get("/menu-categories");
  return res.data;
};

export const getMenuCategory = async (id) => {
  const res = await api.get(`/menu-categories/${id}`);
  return res.data;
};

export const createMenuCategory = async (payload) => {
  const res = await api.post("/menu-categories", payload);
  return res.data;
};

export const updateMenuCategory = async (id, payload) => {
  const res = await api.put(`/menu-categories/${id}`, payload);
  return res.data;
};

export const deleteMenuCategory = async (id) => {
  const res = await api.delete(`/menu-categories/${id}`);
  return res.data;
};
