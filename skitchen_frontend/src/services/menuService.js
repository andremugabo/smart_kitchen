import api from "./api";

export const listMenus = async ({ page = 1, limit = 20 } = {}) => {
  const res = await api.get("/menus", { params: { page, limit } });
  return res.data;
};

export const getMenu = async (id) => {
  const res = await api.get(`/menus/${id}`);
  return res.data;
};

export const createMenu = async (formData) => {
  const res = await api.post("/menus", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateMenu = async (id, formData) => {
  const res = await api.put(`/menus/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteMenu = async (id) => {
  const res = await api.delete(`/menus/${id}`);
  return res.data;
};

export const getMenuProfit = async (id) => {
  const res = await api.get(`/menus/${id}/profit`);
  return res.data;
};
