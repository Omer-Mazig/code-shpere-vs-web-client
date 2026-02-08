import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { RootErrorPage } from "./root-error-page";
import { SignInModal } from "@/features/auth/components/sign-in-modal";

export const RootLayout = () => {
  return (
    <ErrorBoundary fallbackRender={(error) => <RootErrorPage error={error} />}>
      <Outlet />
      <SignInModal />
    </ErrorBoundary>
  );
};
