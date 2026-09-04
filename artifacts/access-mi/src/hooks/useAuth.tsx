/**
 * Authentication + staff role state.
 *
 * Sign-in is invite-only: public sign-up is disabled on the backend, so this
 * provider exposes sign-in / sign-out / password-reset only.
 *
 * Roles are read from public.user_roles through RLS. A role is never inferred
 * from localStorage, a URL, or an email address - the database is the only
 * authority, and every protected read is enforced there too.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "moderator";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: StaffRole[];
  isAdmin: boolean;
  isStaff: boolean;
  /** True until the initial session + role lookup has settled. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  // Separate from the session read: roles arrive later, and until they do we
  // must not tell a signed-in reviewer that they have no reviewer role.
  const [rolesLoading, setRolesLoading] = useState(false);


  useEffect(() => {
    let active = true;

    // Register the listener before the initial read so no event is missed.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const next = data.session ?? null;
      setSession(next);
      // A signed-in user still needs a role lookup before we can judge access.
      if (next) setRolesLoading(true);
      setSessionLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    let active = true;
    if (!userId) {
      setRoles([]);
      setRolesLoading(false);
      return;
    }
    setRolesLoading(true);
    (supabase.from("user_roles" as any) as any)
      .select("role")
      .eq("user_id", userId)
      .then(({ data, error }: { data: { role: string }[] | null; error: unknown }) => {
        if (!active) return;
        // A failed lookup grants nothing.
        setRoles(
          error || !data ? [] : (data.map((r: { role: string }) => r.role) as StaffRole[]),
        );
        setRolesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // Signed-in users are still "loading" until their roles are known, so no
  // screen can claim they lack a reviewer role while the query is in flight.
  const loading = sessionLoading || (!!session && rolesLoading);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      roles,
      isAdmin: roles.includes("admin"),
      isStaff: roles.length > 0,
      loading,

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return { error: error ? error.message : null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setRoles([]);
      },
      requestPasswordReset: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/signin`,
        });
        return { error: error ? error.message : null };
      },
    }),
    [session, roles, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
