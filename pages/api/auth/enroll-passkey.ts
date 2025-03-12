import { Authsignal } from "@authsignal/node";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

const authsignal = new Authsignal({
  apiSecretKey: process.env.AUTHSIGNAL_TENANT_SECRET_KEY!,
  apiUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_API_HOST!,
});

export default async function enrollPasskey(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionToken = await getToken({ req });

  if (!sessionToken || !sessionToken.sub) {
    return res.status(401).json("Unauthenticated");
  }

  const { token } = await authsignal.track({
    userId: sessionToken.sub,
    action: "enroll-passkey",
    attributes: {
      scope: "add:authenticators",
    },
  });

  res.status(200).json(token);
}
