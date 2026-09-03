/**
 * Staff sign-in. Invite-only: accounts are created by an administrator, so
 * there is no sign-up form here by design.
 */
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function SignInPage() {
  const { signIn, requestPasswordReset, session, isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  usePageMeta({ title: "Staff sign-in", description: "Reviewer sign-in for Access Michigan moderation.", path: "/signin", noindex: true });

  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  useEffect(() => {
    if (!loading && session && isStaff) navigate(from, { replace: true });
  }, [loading, session, isStaff, from, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) setError(err);
  };

  const onReset = async () => {
    if (!email) {
      setError("Enter your email address first, then request a reset link.");
      return;
    }
    const { error: err } = await requestPasswordReset(email);
    setError(err);
    if (!err) setStatus("If that address has an account, a reset link is on its way.");
  };

  return (
    <>      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Staff sign-in</CardTitle>
            <p className="text-sm text-muted-foreground">
              Access Michigan is free to use without an account. This page is only for reviewers who
              moderate submissions. Accounts are issued by invitation.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email">Email address</Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {status && (
                <p role="status" className="text-sm text-muted-foreground">
                  {status}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={onReset} className="text-primary underline">
                Forgot password?
              </button>
              <Link to="/" className="text-muted-foreground underline">
                Back to Access Michigan
              </Link>
            </div>
            {session && !isStaff && !loading && (
              <p className="text-sm text-muted-foreground">
                You are signed in, but this account has no reviewer role. Ask an administrator to grant
                one.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
