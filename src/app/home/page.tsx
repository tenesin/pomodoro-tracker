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
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-20 left-24 h-64 w-64 rounded-full bg-accent-soft blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16">
          <header className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-soft/60 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted">
                Dashboard
              </span>
              <h1 className="text-4xl font-semibold leading-tight">
                Welcome back{userEmail ? "," : ""}{" "}
                <span className="text-accent">{userEmail ?? "Focus Friend"}</span>
              </h1>
              <p className="text-sm text-muted">
                Track your deep work, finish more tasks, and celebrate consistent wins.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 self-center rounded-full border border-border/70 bg-surface px-5 py-2 text-sm text-muted transition hover:text-foreground hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <span>Logout</span>
            </button>
          </header>

          <section className="mt-12 grid flex-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid gap-6 md:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border border-border/60 bg-surface/85 p-6 shadow-lg backdrop-blur">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-accent/20 blur-3xl transition group-hover:scale-110" />
                <div className="relative space-y-4">
                  <h2 className="text-xl font-semibold">Pomodoro Command Center</h2>
                  <p className="text-sm text-muted">
                    Dive into 25-minute focus sessions with automatic Supabase logging. Pause, reset,
                    and celebrate your streaks.
                  </p>
                  <button
                    onClick={() => router.push("/pomodoro")}
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-background shadow-md shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/40"
                  >
                    Launch Pomodoro
                  </button>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-border/60 bg-surface/85 p-6 shadow-lg backdrop-blur">
                <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-accent/15 blur-3xl transition group-hover:scale-110" />
                <div className="relative space-y-4">
                  <h2 className="text-xl font-semibold">Monthly Task Tracker</h2>
                  <p className="text-sm text-muted">
                    Visualize your progress day by day. Add recurring tasks, mark completions, and
                    keep momentum high.
                  </p>
                  <button
                    onClick={() => router.push("/tracker")}
                    className="inline-flex items-center gap-2 rounded-full border border-transparent bg-background/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40 hover:text-accent"
                  >
                    Review Tasks
                  </button>
                </div>
              </article>

              <article className="col-span-full rounded-3xl border border-border/60 bg-surface-soft/80 p-6 text-sm text-muted backdrop-blur">
                <h3 className="text-base font-semibold text-foreground">Quick tips</h3>
                <ul className="mt-4 grid gap-2 text-left sm:grid-cols-3">
                  {[
                    "Schedule sessions in the morning to improve completion rates.",
                    "Use the tracker to automate monthly retrospectives.",
                    "Short breaks (5 mins) between pomodoros help maintain energy.",
                  ].map((tip) => (
                    <li key={tip} className="rounded-2xl bg-surface/70 p-4">
                      {tip}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <aside className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-surface/70 p-6 text-sm text-muted backdrop-blur">
              <div>
                <h3 className="text-base font-semibold text-foreground">Session snapshot</h3>
                <p className="mt-3 rounded-2xl border border-border/60 bg-background/20 p-4 text-xs leading-relaxed text-muted">
                  Review your focus history in the tracker and celebrate your progress. Every logged
                  session builds your personal productivity graph.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/10 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Today&apos;s focus</p>
                <div className="mt-4 flex items-end gap-4">
                  <span className="text-5xl font-semibold text-accent">04</span>
                  <span className="text-xs text-muted leading-tight">
                    Pomodoro sessions logged <br /> (target 6)
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/10 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Monthly streak</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">12 days strong</p>
                <p className="mt-2 text-xs text-muted">
                  Don’t forget to mark today’s tasks in the tracker to keep your streak alive.
                </p>
              </div>
            </aside>
          </section>

          <footer className="mt-16 text-center text-xs text-muted">
            © {new Date().getFullYear()} ishaqyudha · Build habits, not burnout.
          </footer>
        </div>
      </main>
    </ProtectedRoute>
  );
}
