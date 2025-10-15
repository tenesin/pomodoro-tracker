"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserEmail(data.user.email ?? null);
    };
    void loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Welcome back 👋</h1>
          <p className="text-sm text-foreground/70 mb-8">
            Logged in as <span className="font-medium">{userEmail}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/pomodoro")}
              className="px-6 py-2 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition"
            >
              Go to Pomodoro
            </button>
            <button
              onClick={() => router.push("/tracker")}
              className="px-6 py-2 rounded-full border border-border bg-surface hover:bg-foreground hover:text-background transition font-medium"
            >
              Go to Tracker
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="mt-8 px-6 py-2 rounded-full border border-border text-sm hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </div>

        <footer className="mt-10 text-xs text-foreground/50 text-center">
          © {new Date().getFullYear()} ishaqyudha. All rights reserved.
        </footer>
      </main>
    </ProtectedRoute>
  );
}
