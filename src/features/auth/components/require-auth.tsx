import { Navigate } from "react-router-dom";
import { useAuth } from "../auth.context";
import type { RoleType } from "../auth.types";
import { AUTH_PATHS } from "@/lib/routes.constants";

type RequireAuthProps = {
  children: React.ReactNode;
  roles?: RoleType[];
};

export const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={AUTH_PATHS.SIGN_IN} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
