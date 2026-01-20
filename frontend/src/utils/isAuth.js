export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};