import { Authsignal } from "@authsignal/node";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

const authsignal = new Authsignal({
  apiSecretKey: process.env.AUTHSIGNAL_TENANT_SECRET_KEY!,
  apiUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_API_HOST!,
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

  try {
    const data = await authsignal.validateChallenge({ token });
    console.log('Validate challenge response:', data); // Debug log

    res.status(200).json({
      state: data.state,
      userId: data.userId,
      success: data.state === "CHALLENGE_SUCCEEDED"
    });
  } catch (error) {
    console.error('Validate challenge error:', error);
    res.status(500).json({ error: 'Failed to validate challenge', state: 'ERROR' });
  }
}
