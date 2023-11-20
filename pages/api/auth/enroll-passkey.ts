import { Authsignal } from "@authsignal/node";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

const authsignal = new Authsignal({
  secret: process.env.AUTHSIGNAL_TENANT_SECRET!,
  apiBaseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_BASE_URL,
});

export default async function enrollPasskey(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionToken = await getToken({ req });

  if (!sessionToken || !sessionToken.email) {
    return res.status(401).json("Unauthenticated");
  }

  const { token } = await authsignal.track({
    userId: sessionToken.email,
    action: "enroll-passkey",
    scope: "add:authenticators",
  });

  res.status(200).json(token);
}
