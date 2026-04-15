import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user?.user_metadata?.role !== "branch_manager") {
        supabase.auth.signOut();
        setIsLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
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
