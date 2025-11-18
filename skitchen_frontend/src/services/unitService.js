import api from "./api";

export const listUnits = async () => {
  const res = await api.get("/units");
  return res.data;
};

export const getUnit = async (id) => {
  const res = await api.get(`/units/${id}`);
  return res.data;
};

export const createUnit = async (payload) => {
  const res = await api.post("/units", payload);
  return res.data;
};

export const updateUnit = async (id, payload) => {
  const res = await api.put(`/units/${id}`, payload);
  return res.data;
};

export const deleteUnit = async (id) => {
  const res = await api.delete(`/units/${id}`);
  return res.data;
};
