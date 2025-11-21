export const logout = (reason = "") => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    if (reason) {
      localStorage.setItem("logoutReason", reason);
    } else {
      localStorage.removeItem("logoutReason");
    }
  } catch (e) {
    // ignore
  }

  window.location.href = "/login";
};
