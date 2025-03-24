import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import React from "react";

import { useAuthsignal } from "../utils/authsignal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Mail, Loader2, KeyRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();

  const authsignal = useAuthsignal();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handlePasskeySignIn = async (isAutoFill = false) => {
    try {
      if (!isAutoFill) {
        setPasskeyLoading(true);
      }
      
      // Initialize the passkey sign-in with appropriate autofill setting
      const response = await authsignal.passkey.signIn({
        autofill: isAutoFill,
      });
      
      // Extract token from response.data.token
      let signInToken = null;
      
      if (response && response.data && response.data.token) {
        signInToken = response.data.token;
      }

      // Run NextAuth's sign in flow
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
        alert("Failed to sign in with passkey");
      }
    } finally {
      if (!isAutoFill) {
        setPasskeyLoading(false);
      }
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      handlePasskeySignIn(true);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("email", {
        email,
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        alert("Failed to sign in with email");
      } else {
        // Show a success message while redirecting
        alert("Check your email for the sign-in link!");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Failed to sign in with email");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred way to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  autoComplete="username webauthn"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending sign-in link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Email
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => handlePasskeySignIn(false)}
            size="lg"
            disabled={passkeyLoading}
          >
            {passkeyLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Sign in with Passkey
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Secured by Authsignal
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
