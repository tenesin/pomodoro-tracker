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
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        {/* Background visuals */}
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-20 left-12 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-accent-soft blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 sm:h-96 sm:w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft blur-[100px]" />
        </div>

        {/* Main content */}
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-6 sm:py-16">
          {/* Header */}
          <header className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:gap-6 md:text-left">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-soft/60 px-3 py-1 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted">
                Dashboard
              </span>
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
                Welcome back{userEmail ? "," : ""}{" "}
                <span className="text-accent break-all">
                  {userEmail ?? "Focus Friend"}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Track your deep work, finish more tasks, and celebrate consistent wins.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface px-5 py-2 text-xs sm:text-sm text-muted transition hover:text-foreground hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              Logout
            </button>
          </header>

          {/* Sections */}
          <section className="mt-10 sm:mt-12 grid flex-1 gap-4 sm:gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* Left main column */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Pomodoro Card */}
              <article className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-surface/85 p-5 sm:p-6 shadow-lg backdrop-blur">
                <div className="absolute right-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-full bg-accent/20 blur-3xl transition group-hover:scale-110" />
                <div className="relative space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold">Pomodoro Command Center</h2>
                  <p className="text-xs sm:text-sm text-muted">
                    Dive into 25-minute focus sessions with automatic Supabase logging. Pause, reset,
                    and celebrate your streaks.
                  </p>
                  <button
                    onClick={() => router.push("/pomodoro")}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs sm:text-sm font-medium text-background shadow-md shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/40"
                  >
                    Launch Pomodoro
                  </button>
                </div>
              </article>

              {/* Tracker Card */}
              <article className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-surface/85 p-5 sm:p-6 shadow-lg backdrop-blur">
                <div className="absolute left-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-full bg-accent/15 blur-3xl transition group-hover:scale-110" />
                <div className="relative space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold">Monthly Task Tracker</h2>
                  <p className="text-xs sm:text-sm text-muted">
                    Visualize your progress day by day. Add recurring tasks, mark completions, and
                    keep momentum high.
                  </p>
                  <button
                    onClick={() => router.push("/tracker")}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full border border-transparent bg-background/10 px-4 py-2 text-xs sm:text-sm font-medium text-foreground transition hover:border-accent/40 hover:text-accent"
                  >
                    Review Tasks
                  </button>
                </div>
              </article>

              {/* Quick Tips */}
              <article className="col-span-full rounded-2xl sm:rounded-3xl border border-border/60 bg-surface-soft/80 p-5 sm:p-6 text-xs sm:text-sm text-muted backdrop-blur">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Quick tips</h3>
                <ul className="mt-3 sm:mt-4 grid gap-2 text-left sm:grid-cols-3">
                  {[
                    "Schedule sessions early to improve completion rates.",
                    "Use the tracker for monthly retrospectives.",
                    "Take short 5-min breaks between pomodoros.",
                  ].map((tip) => (
                    <li key={tip} className="rounded-2xl bg-surface/70 p-3 sm:p-4">
                      {tip}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            {/* Right sidebar */}
            <aside className="flex flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-border/60 bg-surface/70 p-5 sm:p-6 text-xs sm:text-sm text-muted backdrop-blur">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Session snapshot
                </h3>
                <p className="mt-3 rounded-2xl border border-border/60 bg-background/20 p-4 leading-relaxed">
                  Review your focus history and celebrate your progress. Every logged session builds
                  your personal productivity graph.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/10 p-4 sm:p-5">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted">
                  Today&apos;s focus
                </p>
                <div className="mt-3 sm:mt-4 flex items-end gap-3 sm:gap-4">
                  <span className="text-4xl sm:text-5xl font-semibold text-accent">04</span>
                  <span className="text-[10px] sm:text-xs leading-tight text-muted">
                    Pomodoro sessions logged <br /> (target 6)
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/10 p-4 sm:p-5">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted">
                  Monthly streak
                </p>
                <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold text-foreground">
                  12 days strong
                </p>
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-muted">
                  Don’t forget to mark today’s tasks in the tracker to keep your streak alive.
                </p>
              </div>
            </aside>
          </section>

          {/* Footer */}
          <footer className="mt-12 sm:mt-16 text-center text-[10px] sm:text-xs text-muted">
            © {new Date().getFullYear()} ishaqyudha · Build habits, not burnout.
          </footer>
        </div>
      </main>
    </ProtectedRoute>
  );
}
