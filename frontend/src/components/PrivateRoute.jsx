import { Navigate } from "react-router-dom";

export default function PrivateRoute({
  children,
  allowedModules = [],
  allowedRoles = [],
}) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  /* ✅ MODULE CHECK (UUID BASED) */
  if (
    allowedModules.length > 0 &&
    !allowedModules.includes(user.module_id)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  /* ✅ ROLE CHECK */
  if (allowedRoles.length > 0) {
    const userRoles = user.roles?.map(r => r.role_name) || [];

    const hasRole = allowedRoles.some(role =>
      userRoles.includes(role)
    );

    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
