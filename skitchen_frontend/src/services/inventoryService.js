import api from "./api";

export const listInventory = async () => {
  const res = await api.get("/inventory");
  return res.data;
};

export const getInventoryByProduct = async (productId) => {
  const res = await api.get(`/inventory/${productId}`);
  return res.data;
};

export const setInventoryQuantity = async (productId, quantity) => {
  const res = await api.put(`/inventory/${productId}/set`, { quantity });
  return res.data;
};

export const incrementInventory = async (productId, amount) => {
  const res = await api.patch(`/inventory/${productId}/increment`, { amount });
  return res.data;
};

export const decrementInventory = async (productId, amount) => {
  const res = await api.patch(`/inventory/${productId}/decrement`, { amount });
  return res.data;
};
