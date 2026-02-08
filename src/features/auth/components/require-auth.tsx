import { Navigate } from "react-router-dom";
import { useAuth } from "../auth.context";
import { AUTH_PATHS } from "@/lib/routes.constants";

type RequireAuthProps = {
  children: React.ReactNode;
};

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={AUTH_PATHS.SIGN_IN} replace />;
  }

  return <>{children}</>;
};
