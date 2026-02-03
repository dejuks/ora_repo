import MainLayout from "./MainLayout";
import PublicLayout from "./PublicLayout";
import { useAuth } from "../../context/AuthContext";

export default function LayoutWrapper({ children }) {
  const auth = useAuth();

  // If AuthProvider is not ready or missing
  if (!auth) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  const { user } = auth;

  if (user) {
    return <MainLayout>{children}</MainLayout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
