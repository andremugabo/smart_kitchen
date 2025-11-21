import api from "./api";

export const fetchSettings = async () => {
  const res = await api.get("/settings");
  return res.data?.data;
};

export const updateSettings = async (payload) => {
  const res = await api.put("/settings", payload);
  return res.data?.data;
};

export const resetSettings = async () => {
  const res = await api.put("/settings", { reset: true });
  return res.data?.data;
};
