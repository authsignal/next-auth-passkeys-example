import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { useAuthsignal } from "../utils/authsignal";

export default function SignInPage() {
  const { status } = useSession();

  const authsignal = useAuthsignal();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePasskeySignIn = async () => {
      // Initialize the input for passkey autofill
      const signInToken = await authsignal.passkey.signIn({
        autofill: true,
      });

      // Run NextAuth's sign in flow. This will run if the user selects one of their passkeys
      // from the Webauthn dropdown.
      if (signInToken) {
        await signIn("credentials", {
          signInToken,  
          callbackUrl: "/",
        });
      }
    };

    if (status === "unauthenticated") {
      handlePasskeySignIn();
    }
  }, [status, authsignal.passkey]);

  const handleSubmit = async () => {
    if (!email) {
      return;
    }

    setLoading(true);

    await signIn("email", {
      email,
      callbackUrl: "/",
    });

    setLoading(false);
  };

  if (loading || status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="spacer" />
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        onChange={(input) => setEmail(input.target.value)}
        autoComplete="username webauthn"
      />
      <button type="submit">Continue</button>
    </form>
  );
}
