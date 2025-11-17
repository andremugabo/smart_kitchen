import api from "./api";

export const login = async ({ emailOrUsername, password }) => {
  const res = await api.post("/users/login", { emailOrUsername, password });
  return res.data;
};

export const register = async (payload) => {
  const res = await api.post("/users", payload);
  return res.data;
};

export const requestPasswordOtp = async (email) => {
  const res = await api.post("/users/password/otp", { email });
  return res.data;
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const res = await api.post("/users/password/reset", {
    email,
    otp,
    newPassword,
  });
  return res.data;
};

export const updatePassword = async (userId, { oldPassword, newPassword }) => {
  const res = await api.put(`/users/${userId}/password`, {
    oldPassword,
    newPassword,
  });
  return res.data;
};

export const getProfile = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const updateProfileImage = async (id, file) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await api.put(`/users/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
