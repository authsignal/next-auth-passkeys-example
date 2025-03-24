import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

import { AuthsignalProvider } from "../utils/authsignal";
import '@/styles/globals.css'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <AuthsignalProvider
      tenantId={process.env.NEXT_PUBLIC_AUTHSIGNAL_TENANT_ID!}
    >
      <SessionProvider session={session}>
        <Component {...pageProps}></Component>
      </SessionProvider>
    </AuthsignalProvider>
  );
};
