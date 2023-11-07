import { Authsignal } from "@authsignal/node";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

const authsignal = new Authsignal({
  secret: process.env.AUTHSIGNAL_TENANT_SECRET!,
  apiBaseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_BASE_URL,
});

export default async function callback(req: NextApiRequest, res: NextApiResponse) {
  const sessionToken = await getToken({ req })

  if (!sessionToken) {
    return res.status(401).json('Unauthenticated');
  }

  const { token } = req.query;

  if (!token || Array.isArray(token)) {
    res.status(400).json("Invalid token");
    return;
  }

  const data = await authsignal.validateChallenge({ token });

  res.status(200).json(data);
};
