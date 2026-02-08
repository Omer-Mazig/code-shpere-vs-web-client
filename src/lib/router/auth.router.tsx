import type { RouteObject } from "react-router-dom";
import { SignInPage } from "@/pages/sign-in-page";
import { SignUpPage } from "@/pages/sign-up-page";

export const authRoutes: RouteObject[] = [
  {
    path: "sign-in",
    element: <SignInPage />,
  },
  {
    path: "sign-up",
    element: <SignUpPage />,
  },
];
