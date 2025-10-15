"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { format, subDays } from "date-fns";

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const loadUserAndSessions = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) {
        setUserEmail(user.email ?? null);
        await fetchStats(user.id);
      }
    };

    void loadUserAndSessions();
  }, []);

  // ✅ Fetch Pomodoro sessions & compute streak
  const fetchStats = async (uid: string) => {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("start_time, completed")
      .eq("user_id", uid)
      .eq("completed", true);

    if (error) {
      console.error("❌ Error fetching pomodoro sessions:", error);
      return;
    }

    if (!data) return;

    // ✅ Get all unique dates (yyyy-MM-dd) where completed = true
    const completedDates = Array.from(
      new Set(data.map((s) => format(new Date(s.start_time), "yyyy-MM-dd")))
    ).sort();

    // ✅ Today count
    const todaySessions = completedDates.filter((d) => d === today).length;
    setTodayCount(todaySessions);

    // ✅ Compute streak
    let count = 0;
    let currentDate = new Date();

    for (let i = 0; i < 60; i++) {
      // check backward up to 60 days max
      const dayStr = format(currentDate, "yyyy-MM-dd");
      if (completedDates.includes(dayStr)) {
        count++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    setStreak(count);
  };

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

          {/* Dashboard Sections */}
          <section className="mt-10 sm:mt-12 grid flex-1 gap-4 sm:gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Pomodoro */}
              <article className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-surface/85 p-5 sm:p-6 shadow-lg backdrop-blur">
                <div className="absolute right-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-full bg-accent/20 blur-3xl transition group-hover:scale-110" />
                <div className="relative space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold">Pomodoro Command Center</h2>
                  <p className="text-xs sm:text-sm text-muted">
                    Dive into 25-minute focus sessions with automatic Supabase logging.
                  </p>
                  <button
                    onClick={() => router.push("/pomodoro")}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs sm:text-sm font-medium text-background shadow-md shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/40"
                  >
                    Launch Pomodoro
                  </button>
                </div>
              </article>

              {/* Tracker */}
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

              {/* Tips */}
              <article className="col-span-full rounded-2xl sm:rounded-3xl border border-border/60 bg-surface-soft/80 p-5 sm:p-6 text-xs sm:text-sm text-muted backdrop-blur">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Quick tips</h3>
                <ul className="mt-3 sm:mt-4 grid gap-2 text-left sm:grid-cols-3">
                  {[
                    "Schedule sessions early for better focus.",
                    "Use the tracker for monthly retrospectives.",
                    "Take 5-min breaks between pomodoros.",
                  ].map((tip) => (
                    <li key={tip} className="rounded-2xl bg-surface/70 p-3 sm:p-4">
                      {tip}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-border/60 bg-surface/70 p-5 sm:p-6 text-xs sm:text-sm text-muted backdrop-blur">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Session snapshot
                </h3>
                <p className="mt-3 rounded-2xl border border-border/60 bg-background/20 p-4 leading-relaxed">
                  Review your focus history and celebrate your progress. Every logged session builds
                  your productivity graph.
                </p>
              </div>

              {/* ✅ Live Pomodoro Count */}
              <div className="rounded-2xl border border-border/60 bg-background/10 p-4 sm:p-5">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted">
                  Today&apos;s focus
                </p>
                <div className="mt-3 sm:mt-4 flex items-end gap-3 sm:gap-4">
                  <span className="text-4xl sm:text-5xl font-semibold text-accent">
                    {String(todayCount).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs leading-tight text-muted">
                    Pomodoro sessions logged <br /> (target 6)
                  </span>
                </div>
              </div>

              {/* ✅ Dynamic Streak */}
              <div className="rounded-2xl border border-border/60 bg-background/10 p-4 sm:p-5">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted">
                  Monthly streak
                </p>
                <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold text-foreground">
                  {streak} day{streak !== 1 ? "s" : ""} strong
                </p>
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-muted">
                  Keep logging sessions to extend your streak 🔥
                </p>
              </div>
            </aside>
          </section>

          <footer className="mt-12 sm:mt-16 text-center text-[10px] sm:text-xs text-muted">
            © {new Date().getFullYear()} ishaqyudha · Build habits, not burnout.
          </footer>
        </div>
      </main>
    </ProtectedRoute>
  );
}
