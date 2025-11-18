import api from "./api";

export const listPurchases = async () => {
  const res = await api.get("/purchases");
  return res.data;
};

export const getPurchase = async (id) => {
  const res = await api.get(`/purchases/${id}`);
  return res.data;
};

export const createPurchase = async (payload) => {
  const res = await api.post("/purchases", payload);
  return res.data;
};

export const uploadPurchaseProof = async (id, file) => {
  const formData = new FormData();
  formData.append("proof", file);
  const res = await api.post("/purchases", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
