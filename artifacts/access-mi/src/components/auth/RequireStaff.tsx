/**
 * Route guard for reviewer-only pages.
 *
 * This is a convenience only: the real protection is row-level security in the
 * database, which refuses the reads whatever the client renders.
 */
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RequireStaff({ children }: { children: ReactNode }) {
  const { session, isStaff, loading, roles } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-16">
        <p className="text-sm text-muted-foreground">Checking your access...</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (!isStaff && roles.length === 0) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 max-w-lg mx-auto space-y-3">
        <h1 className="text-xl font-bold">Reviewer access required</h1>
        <p className="text-sm text-muted-foreground">
          This account is signed in but has no reviewer role, so the moderation queue is not available.
          Ask an administrator to grant access.
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
