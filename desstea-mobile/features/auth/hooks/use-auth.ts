import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
        return;
      }

      if (session.user?.user_metadata?.role !== "branch_manager") {
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      const { error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        if ((refreshError as any).__isAuthError) {
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }
        // Network error — offline, fall back to cached session
        setSession(session);
        setUser(session.user);
      }
      // On success: onAuthStateChange TOKEN_REFRESHED fires and updates session

      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user?.user_metadata?.role !== "branch_manager") {
        supabase.auth.signOut();
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const role = data.user?.user_metadata?.role;
    if (role !== "branch_manager") {
      throw new Error("Access denied. Branch manager accounts only.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, user, isLoading, signIn, signOut };
}
