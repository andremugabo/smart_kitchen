import api from "./api";

export const listPayments = async ({ page = 1, limit = 20, orderId } = {}) => {
  const params = { page, limit };
  if (orderId) params.order_id = orderId;
  const res = await api.get("/payments", { params });
  return res.data;
};

export const createPayment = async ({ order_id, amount, method, status }) => {
  const res = await api.post("/payments", { order_id, amount, method, status });
  return res.data;
};

export const getPayment = async (id) => {
  const res = await api.get(`/payments/${id}`);
  return res.data;
};

export const updatePaymentStatus = async (id, status) => {
  const res = await api.put(`/payments/${id}/status`, { status });
  return res.data;
};

export const getReceiptUrl = (id) => {
  const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const base = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;
  return `${base}/api/payments/${id}/receipt`;
};

export const getOrderReceiptUrl = (orderId) => {
  const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const base = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;
  return `${base}/api/orders/${orderId}/receipt`;
};
