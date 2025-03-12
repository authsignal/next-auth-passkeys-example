import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useAuthsignal } from "../utils/authsignal";

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();

  const authsignal = useAuthsignal();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePasskeySignIn = async () => {
      try {
        // Initialize the input for passkey autofill
        const response = await authsignal.passkey.signIn({
          autofill: true,
        });
        
        // Extract token from response.data.token
        let signInToken = null;
        
        if (response && response.data && response.data.token) {
          signInToken = response.data.token;
        }

        // Run NextAuth's sign in flow. This will run if the user selects one of their passkeys from the Webauthn dropdown.
        if (signInToken && typeof signInToken === 'string') {
          console.log("Calling NextAuth signIn with token");
          const result = await signIn("credentials", {
            signInToken,
            redirect: false,
          });

          if (result?.error) {
            alert("Failed to sign in with passkey");
          } else {
            router.push("/");
          }
        } else {
          alert("Failed to sign in with passkey: Invalid token format");
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Passkey sign-in aborted");
          // Ignore
        } else {
          console.error("Passkey sign-in error:", err);
          throw err;
        }
      }
    };

    if (status === "unauthenticated") {
      handlePasskeySignIn();
    }
  }, [status, authsignal.passkey, router]);

  const handleSubmit = async () => {
    if (!email) {
      return;
    }

    setLoading(true);

    await signIn("email", {
      email,
      callbackUrl: "/",
    });
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
