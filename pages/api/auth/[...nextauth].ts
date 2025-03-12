import { Authsignal } from "@authsignal/node";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth, { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";

const authsignal = new Authsignal({
  apiSecretKey: process.env.AUTHSIGNAL_TENANT_SECRET_KEY!,
  apiUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_API_HOST!,
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

        // Use Authsignal API for validation
        try {
          const result = await authsignal.validateChallenge({
            token: signInToken,
          });

          const userId = result.userId;
          if (!userId) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { id: userId },
          });

          if (!user) {
            return null;
          }

          const state = result.state;
          if (state === "CHALLENGE_SUCCEEDED") {
            return { id: user.id, email: user.email };
          }
        } catch (error) {
          console.error("Authsignal validation error:", error);
          // return null
        }

        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
