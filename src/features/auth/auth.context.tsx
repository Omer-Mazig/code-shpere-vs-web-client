import React from "react";
import { setAccessToken } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AuthSession,
  AuthUser,
  RegisterDto,
  RegisterResponseDto,
  ResendVerificationResponseDto,
} from "./types";
import { authQueryOptionsFactory } from "./auth-query-options-factory";
import { authApi } from "./auth.api";
import { setUnauthorizedHandler } from "./auth.session";
import { AppLoader } from "@/components/shared/app-loader";
import { AUTH_PATHS } from "@/lib/routes.constants";
import { signInPathWithReturnUrl } from "./return-url";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterDto) => Promise<RegisterResponseDto>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<ResendVerificationResponseDto>;
  logout: () => Promise<void>;
  applySession: (session: AuthSession) => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const channelRef = React.useRef<BroadcastChannel | null>(null);
  const { data: session, isLoading } = useQuery(
    authQueryOptionsFactory.session(),
  );
  const user = session?.accessToken && session.user ? session.user : null;

  const applySession = React.useCallback(
    (data: AuthSession) => {
      if (data.accessToken && data.user) {
        setAccessToken(data.accessToken);
        queryClient.setQueryData(
          authQueryOptionsFactory.session().queryKey,
          data,
        );
        return;
      }

      setAccessToken(null);
      queryClient.setQueryData(
        authQueryOptionsFactory.session().queryKey,
        undefined,
      );
    },
    [queryClient],
  );

  const clearSession = React.useCallback(
    (redirectToLogin = false) => {
      setAccessToken(null);
      queryClient.setQueryData(
        authQueryOptionsFactory.session().queryKey,
        undefined,
      );
      if (redirectToLogin) {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith(AUTH_PATHS.AUTH)) {
          window.location.assign(
            signInPathWithReturnUrl(
              `${window.location.pathname}${window.location.search}${window.location.hash}`,
            ),
          );
        }
      }
    },
    [queryClient],
  );

  const broadcastLogout = React.useCallback(() => {
    channelRef.current?.postMessage({ type: "logout" });
    try {
      localStorage.setItem("auth:logout", String(Date.now()));
    } catch {
      // Ignore storage failures (private mode, disabled storage, etc.)
    }
  }, []);

  const handleUnauthorized = React.useCallback(() => {
    clearSession(false);
    broadcastLogout();
  }, [broadcastLogout, clearSession]);

  React.useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  React.useEffect(() => {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("auth");
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === "logout") {
          clearSession(true);
        }
      };
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "auth:logout") {
        clearSession(true);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
      window.removeEventListener("storage", handleStorage);
    };
  }, [clearSession]);

  const { mutateAsync: loginMutation } = useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: applySession,
  });

  const { mutateAsync: registerMutation } = useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: (payload: RegisterDto) => authApi.register(payload),
  });

  const { mutateAsync: verifyEmailMutation } = useMutation({
    mutationKey: ["auth", "verify-email"],
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: applySession,
  });

  const { mutateAsync: resendVerificationMutation } = useMutation({
    mutationKey: ["auth", "resend-verification"],
    mutationFn: (email: string) => authApi.resendVerification(email),
  });

  const { mutateAsync: logoutMutation } = useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearSession(true);
      broadcastLogout();
    },
  });

  const login = React.useCallback(
    async (email: string, password: string) => {
      await loginMutation({ email, password });
    },
    [loginMutation],
  );

  const register = React.useCallback(
    async (payload: RegisterDto): Promise<RegisterResponseDto> => {
      return registerMutation(payload);
    },
    [registerMutation],
  );

  const verifyEmail = React.useCallback(
    async (token: string) => {
      await verifyEmailMutation(token);
    },
    [verifyEmailMutation],
  );

  const resendVerification = React.useCallback(
    async (email: string): Promise<ResendVerificationResponseDto> => {
      return resendVerificationMutation(email);
    },
    [resendVerificationMutation],
  );

  const logout = React.useCallback(async () => {
    await logoutMutation();
  }, [logoutMutation]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      verifyEmail,
      resendVerification,
      logout,
      applySession,
    }),
    [
      user,
      isLoading,
      login,
      register,
      verifyEmail,
      resendVerification,
      logout,
      applySession,
    ],
  );

  if (isLoading) {
    return <AppLoader message="Loading session..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
