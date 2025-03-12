import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

import { useAuthsignal } from "../utils/authsignal";

export default function Index() {
  const { data: session, status } = useSession();

  const router = useRouter();

  const authsignal = useAuthsignal();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const enrollPasskey = async () => {
    if (!session?.user?.email || !session.user) {
      throw new Error("No user in session");
    }

    // Get a short lived token by tracking an action
    const enrollPasskeyResponse = await fetch(
      "/api/auth/enroll-passkey"
    );

    const token = await enrollPasskeyResponse.json();

    // Initiate the passkey enroll flow
    const username = session.user.email;

    const resultToken = await authsignal.passkey.signUp({
      token,
      username,
    });

    // Check that the enrollment was successful
    const callbackResponse = await fetch(
      `/api/auth/callback/?token=${resultToken}`
    );

    const { success } = await callbackResponse.json();

    if (success) {
      alert("Successfully added passkey");
    } else {
      alert("Failed to add passkey");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h3>Welcome, {session?.user?.email}</h3>
      <p>You now have a NextAuth session.</p>
      <button onClick={() => signOut({ callbackUrl: "/signin" })}>
        Sign out
      </button>
      <button onClick={enrollPasskey}>Create passkey</button>
    </div>
  );
}
