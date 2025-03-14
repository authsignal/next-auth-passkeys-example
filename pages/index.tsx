import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useAuthsignal } from "../utils/authsignal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, LogOut, Key, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

    try {
      // Get a short lived token by tracking an action
      const enrollPasskeyResponse = await fetch("/api/auth/enroll-passkey");
      const token = await enrollPasskeyResponse.json();

      // Initiate the passkey enroll flow
      const username = session.user.email;
      const response = await authsignal.passkey.signUp({
        token,
        username,
      });

      // If we got here, the passkey was successfully created
      // No need to validate the challenge token as the WebAuthn ceremony was completed
      alert("Successfully added passkey");
      
    } catch (error: any) {
      console.error("Error enrolling passkey:", error);
      
      // Handle the case where passkey is already registered
      if (error.name === "InvalidStateError") {
        alert("A passkey is already registered for this device. You can use it to sign in.");
      } else {
        console.error('Detailed error:', error); // Debug log
        alert(`Failed to add passkey. Error: ${error.message || 'Unknown error'}`);
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center break-all">
            Signed in as {session?.user?.email}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h4 className="text-sm font-semibold">Account Security</h4>
                <p className="text-sm text-muted-foreground">
                  Enhance your account security by adding a passkey
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={enrollPasskey}
              size="lg"
            >
              <Key className="mr-2 h-4 w-4" />
              Create Passkey
            </Button>

            <Separator className="my-4" />

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => signOut({ callbackUrl: "/signin" })}
              size="lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
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
