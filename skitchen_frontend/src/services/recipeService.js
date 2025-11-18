import api from "./api";

export const listRecipes = async () => {
  const res = await api.get("/recipes");
  return res.data;
};

export const getRecipe = async (id) => {
  const res = await api.get(`/recipes/${id}`);
  return res.data;
};

export const listRecipesByMenu = async (menuId) => {
  const res = await api.get(`/recipes/menu/${menuId}`);
  return res.data;
};

export const createRecipe = async (payload) => {
  const res = await api.post("/recipes", payload);
  return res.data;
};

export const updateRecipe = async (id, payload) => {
  const res = await api.put(`/recipes/${id}`, payload);
  return res.data;
};

export const deleteRecipe = async (id) => {
  const res = await api.delete(`/recipes/${id}`);
  return res.data;
};
