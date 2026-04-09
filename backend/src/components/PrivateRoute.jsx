import { Navigate, useLocation } from "react-router-dom";

const DEV_BYPASS_ACCESS_CHECK = true;

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (DEV_BYPASS_ACCESS_CHECK) {
    return children;
  }

  return children;
}
