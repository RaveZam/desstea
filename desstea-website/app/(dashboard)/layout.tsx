import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "../_components/layout/Sidebar";
import Header from "../_components/layout/Header";

async function AuthShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  const displayName =
    user?.user_metadata?.display_name ||
    (() => {
      const local = email.split("@")[0];
      return local.charAt(0).toUpperCase() + local.slice(1);
    })();
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F8]">
      <Sidebar email={email} displayName={displayName} initials={initials} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header email={email} displayName={displayName} initials={initials} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen overflow-hidden bg-[#F4F6F8] animate-pulse">
          <div className="w-[250px] bg-gray-200" />
          <div className="flex-1 flex flex-col">
            <div className="h-14 bg-gray-200" />
            <main className="flex-1" />
          </div>
        </div>
      }
    >
      <AuthShell>{children}</AuthShell>
    </Suspense>
  );
}
