import { Authsignal } from "@authsignal/node";
import { NextApiRequest, NextApiResponse } from "next";

const authsignal = new Authsignal({
  secret: process.env.AUTHSIGNAL_TENANT_SECRET!,
  apiBaseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_BASE_URL,
});

export default async function enrollPasskey(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;

  if (!userId || Array.isArray(userId)) {
    res.status(400).json("Invalid userId");
    return;
  }

  const { token } = await authsignal.track({
    userId,
    action: "enroll-passkey",
    scope: "add:authenticators",
  });

  res.status(200).json(token);
}
