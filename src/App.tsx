import { Toaster } from "sonner";
import { router } from "./lib/router/router";
import { RouterProvider } from "react-router-dom";
import { useIsMobile } from "./hooks/use-mobile";

export const App = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <RouterProvider router={router} />

      <Toaster
        position={isMobile ? "bottom-center" : "bottom-right"}
        richColors
        closeButton
      />
    </>
  );
};
