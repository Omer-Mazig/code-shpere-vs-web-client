import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "./lib/query-client.ts";
import { AuthProvider } from "./features/auth/auth.context.tsx";
import { SignInModalProvider } from "./features/auth/sign-in-modal.context.tsx";
import { App } from "./app.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AuthProvider>
          <SignInModalProvider>
            <App />
          </SignInModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
