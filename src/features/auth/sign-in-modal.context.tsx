import React from "react";

type SignInModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const SignInModalContext = React.createContext<
  SignInModalContextValue | undefined
>(undefined);

export const SignInModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  const value = React.useMemo(
    () => ({ isOpen, open, close }),
    [isOpen, open, close],
  );

  return (
    <SignInModalContext.Provider value={value}>
      {children}
    </SignInModalContext.Provider>
  );
};

export const useSignInModal = () => {
  const context = React.useContext(SignInModalContext);
  if (!context) {
    throw new Error("useSignInModal must be used within SignInModalProvider");
  }
  return context;
};
