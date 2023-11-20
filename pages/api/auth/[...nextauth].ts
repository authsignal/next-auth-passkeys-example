import { Authsignal } from "@authsignal/node";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth, { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";

const authsignal = new Authsignal({
  secret: process.env.AUTHSIGNAL_TENANT_SECRET!,
  apiBaseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_BASE_URL,
});

const prisma = new PrismaClient();

const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM,
    }),
    CredentialsProvider({
      name: "webauthn",
      credentials: {},
      async authorize(cred) {
        const { signInToken } = cred as { signInToken: string };

        if (!signInToken) {
          return null;
        }

        const result = await authsignal.validateChallenge({
          token: signInToken,
        });

        const user = await prisma.user.findUnique({
          where: { id: result.userId },
        });

        if (!user) {
          return null;
        }

        const { state } = result;

        if (state === "CHALLENGE_SUCCEEDED") {
          return { id: user.id, email: user.email };
        }

        return null;
      },
    }),
  ],
  secret: process.env.SECRET,
};

export default NextAuth(authOptions);
