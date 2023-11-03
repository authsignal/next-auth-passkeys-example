import { Authsignal } from "@authsignal/browser";
import { useEffect, useState, createContext, useContext } from "react";

const AuthsignalContext = createContext<{ authsignal: Authsignal } | undefined>(
  undefined
);

type AuthsignalProviderProps = {
  tenantId: string;
  children: React.ReactNode;
};

function AuthsignalProvider({ tenantId, children }: AuthsignalProviderProps) {
  const [authsignal, setAuthsignal] = useState<Authsignal | undefined>(
    undefined
  );

  useEffect(() => {
    if (!authsignal) {
      setAuthsignal(
        new Authsignal({
          tenantId,
          baseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_BASE_URL!,
        })
      );
    }
  }, [authsignal, tenantId]);

  if (!authsignal) {
    return null;
  }

  return (
    <AuthsignalContext.Provider value={{ authsignal }}>
      {children}
    </AuthsignalContext.Provider>
  );
}

function useAuthsignal() {
  const context = useContext(AuthsignalContext);

  if (context === undefined) {
    throw new Error("useAuthsignal must be used within an AuthsignalProvider");
  }

  return context.authsignal;
}

export { AuthsignalProvider, useAuthsignal };
