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

        // First attempt: Extract user from token payload
        const tokenParts = signInToken.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            
            if (payload.other && payload.other.userId) {
              const userId = payload.other.userId;
              
              const user = await prisma.user.findUnique({
                where: { id: userId },
              });
              
              if (user) {
                return { id: user.id, email: user.email };
              }
            }
          } catch {
            // If token parsing fails, continue to the next approach
          }
        }
        
        // Second attempt: Use Authsignal API
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
        } catch {
          // return null
        }

        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
