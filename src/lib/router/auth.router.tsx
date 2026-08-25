import type { RouteObject } from "react-router-dom";
import { SignInPage } from "@/pages/sign-in-page";
import { SignUpPage } from "@/pages/sign-up-page";
import { CheckEmailPage } from "@/pages/check-email-page";
import { VerifyEmailPage } from "@/pages/verify-email-page";
import { ForgotPasswordPage } from "@/pages/forgot-password-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";

export const authRoutes: RouteObject[] = [
  {
    path: "sign-in",
    element: <SignInPage />,
  },
  {
    path: "sign-up",
    element: <SignUpPage />,
  },
  {
    path: "check-email",
    element: <CheckEmailPage />,
  },
  {
    path: "verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "reset-password",
    element: <ResetPasswordPage />,
  },
];
