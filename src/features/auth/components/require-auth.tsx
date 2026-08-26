import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth.context";
import { signInPathWithReturnUrl } from "../return-url";

type RequireAuthProps = {
  children: React.ReactNode;
};

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to={signInPathWithReturnUrl(returnUrl)}
        state={{ returnUrl }}
        replace
      />
    );
  }

  return <>{children}</>;
};
