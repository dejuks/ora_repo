export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
export const getToken = () => {
  return localStorage.getItem("token");
};

export const getAuthUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};