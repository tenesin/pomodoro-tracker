"use client";

import { useEffect, useState, useCallback } from "react";
import { format, getDaysInMonth } from "date-fns";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Task {
  id: string;
  task_name: string;
  month_year: string;
  task_type: "routine" | "daily";
}

interface TaskLog {
  id?: string;
  task_id: string;
  date: string;
  completed: boolean;
}

interface Progress {
  [taskId: string]: { percent: number; days: number };
}

export default function TrackerPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [dailyInput, setDailyInput] = useState("");
  const [routineInput, setRoutineInput] = useState("");

  const today = new Date();
  const currentMonth = format(today, "yyyy-MM");
  const todayStr = format(today, "yyyy-MM-dd");
  const totalDays = getDaysInMonth(today);

  const updateProgress = useCallback(
    async (list: Task[]) => {
      const monthStart = `${currentMonth}-01`;
      const monthEnd = `${currentMonth}-${String(totalDays).padStart(2, "0")}`;
      const prog: Progress = {};

      const { data: logs } = await supabase
        .from("task_logs")
        .select("*")
        .gte("date", monthStart)
        .lte("date", monthEnd);
      setTaskLogs(logs || []);

      for (const t of list.filter((x) => x.task_type === "routine")) {
        const filtered = logs?.filter((log) => log.task_id === t.id) || [];
        const uniqueDays = new Set(filtered.map((d) => d.date)).size;
        const percent = Math.round((uniqueDays / totalDays) * 100);
        prog[t.id] = { percent, days: uniqueDays };
      }
      setProgress(prog);
    },
    [currentMonth, totalDays]
  );

  const fetchTasks = useCallback(
    async (uid: string) => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true });
      setTasks(data || []);
      if (data) await updateProgress(data);
    },
    [updateProgress]
  );

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return void router.push("/login");
      setUserId(data.user.id);
      await fetchTasks(data.user.id);
    };
    void init();
  }, [router, fetchTasks]);

  const toggleDaily = async (task: Task, checked: boolean) => {
    if (checked) {
      await supabase.from("task_logs").upsert({
        task_id: task.id,
        date: todayStr,
        completed: true,
      });
    } else {
      await supabase
        .from("task_logs")
        .delete()
        .eq("task_id", task.id)
        .eq("date", todayStr);
    }
    if (userId) await fetchTasks(userId);
  };

  const markToday = async (task: Task) => {
    await supabase.from("task_logs").upsert({
      task_id: task.id,
      date: todayStr,
      completed: true,
    });
    if (userId) await fetchTasks(userId);
  };

  const addTask = async (type: "routine" | "daily", name: string) => {
    const taskName = name.trim();
    if (!taskName || !userId) return;

    await supabase.from("tasks").insert({
      user_id: userId,
      task_name: taskName,
      month_year: currentMonth,
      task_type: type,
    });

    if (type === "routine") setRoutineInput("");
    if (type === "daily") setDailyInput("");
    await fetchTasks(userId);
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    if (userId) await fetchTasks(userId);
  };

  const routineTasks = tasks.filter((t) => t.task_type === "routine");
  const dailyTasks = tasks.filter((t) => t.task_type === "daily");
  const finishedToday = dailyTasks.filter((t) =>
    taskLogs.some((log) => log.task_id === t.id && log.date === todayStr && log.completed)
  );
  const unfinishedToday = dailyTasks.filter(
    (t) =>
      !taskLogs.some((log) => log.task_id === t.id && log.date === todayStr && log.completed)
  );

  const overallPercent = routineTasks.length
    ? Math.round(
        routineTasks.reduce((acc, task) => acc + (progress[task.id]?.percent ?? 0), 0) /
          routineTasks.length
      )
    : 0;
  const todayCompletion = dailyTasks.length
    ? Math.round((finishedToday.length / dailyTasks.length) * 100)
    : 0;

  return (
    <ProtectedRoute>
    <main className="relative min-h-screen overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-16 h-72 w-72 rounded-full bg-accent-soft blur-3xl" />
        <div className="absolute bottom-10 right-24 h-80 w-80 rounded-full bg-accent/35 blur-[140px]" />
        <div className="absolute inset-x-0 top-32 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col space-y-12">
        <header className="flex flex-col gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-soft/60 px-4 py-1 text-xs uppercase tracking-[0.35em] text-muted">
              Tracker
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Monthly pulse for <span className="text-accent">{format(today, "MMMM yyyy")}</span>
            </h1>
            <p className="text-sm text-muted">
              View routines at a glance, check off today’s focus list, and keep your long-term streaks
              alive.
            </p>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-[520px]">
            {[
              { label: "Routine progress", value: `${overallPercent}%` },
              { label: "Today’s completion", value: `${todayCompletion}%` },
              { label: "Active routines", value: routineTasks.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/60 bg-surface/80 p-4 text-left backdrop-blur"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted">{stat.label}</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/70 bg-surface/80 p-8 shadow-xl backdrop-blur">
              <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Routine momentum</h2>
                  <p className="text-sm text-muted">
                    Build consistency for habits you intend to stick with every day of the month.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/10 px-4 py-2 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  Tracking {routineTasks.length} routines
                </div>
              </header>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  value={routineInput}
                  onChange={(e) => setRoutineInput(e.target.value)}
                  placeholder="Add a new routine…"
                  className="flex-1 rounded-xl border border-border/60 bg-surface-soft/60 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                />
                <button
                  onClick={() => addTask("routine", routineInput)}
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-medium text-background shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                >
                  Add routine
                </button>
              </div>

              {routineTasks.length === 0 ? (
                <p className="mt-8 rounded-2xl border border-dashed border-border/60 bg-background/10 p-6 text-sm text-muted">
                  No routines yet. Add one to start tracking streaks across the month.
                </p>
              ) : (
                <div className="mt-8 space-y-4">
                  {routineTasks.map((t) => {
                    const p = progress[t.id]?.percent ?? 0;
                    const d = progress[t.id]?.days ?? 0;
                    return (
                      <article
                        key={t.id}
                        className="rounded-2xl border border-border/60 bg-background/10 p-5 transition hover:-translate-y-0.5 hover:border-accent/40"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-base font-semibold text-foreground">{t.task_name}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => markToday(t)}
                              className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-background shadow-md shadow-accent/30 transition hover:-translate-y-0.5"
                            >
                              Mark today
                            </button>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="rounded-full border border-border/60 px-4 py-2 text-xs font-medium text-muted transition hover:text-red-400 hover:border-red-400/60"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="w-full rounded-full bg-border/30">
                            <div
                              className="h-2 rounded-full bg-accent transition-all duration-500"
                              style={{ width: `${p}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted sm:text-right">
                            {d} / {totalDays} days · {p}%
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border/70 bg-surface/80 p-8 shadow-xl backdrop-blur">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Today&apos;s focus list</h2>
                  <p className="text-sm text-muted">
                    Check off tasks as you complete them to maintain your daily rhythm.
                  </p>
                </div>
                <span className="rounded-full border border-border/60 bg-background/10 px-4 py-2 text-xs text-muted">
                  {finishedToday.length} of {dailyTasks.length} done
                </span>
              </header>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  value={dailyInput}
                  onChange={(e) => setDailyInput(e.target.value)}
                  placeholder="Add a daily task…"
                  className="flex-1 rounded-xl border border-border/60 bg-surface-soft/60 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                />
                <button
                  onClick={() => addTask("daily", dailyInput)}
                  className="inline-flex items-center justify-center rounded-xl border border-accent/40 px-5 py-3 text-sm font-medium text-accent transition hover:-translate-y-0.5 hover:border-accent/60"
                >
                  Add daily
                </button>
              </div>

              <div className="mt-8 space-y-4">
                {dailyTasks.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border/60 bg-background/10 p-6 text-sm text-muted">
                    Add your first daily task to plan today&apos;s focus.
                  </p>
                ) : (
                  <>
                    {unfinishedToday.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted">In progress</p>
                        {unfinishedToday.map((t) => (
                          <label
                            key={t.id}
                            className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/10 p-4 transition hover:-translate-y-0.5 hover:border-accent/40"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={(e) => toggleDaily(t, e.target.checked)}
                                className="h-5 w-5 rounded border border-border/70 bg-transparent accent-accent"
                              />
                              <span className="text-sm text-foreground">{t.task_name}</span>
                            </div>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="rounded-full border border-transparent px-3 py-1 text-xs text-muted transition hover:border-red-400/60 hover:text-red-400"
                            >
                              Remove
                            </button>
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">Completed today</p>
                      {finishedToday.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-border/60 bg-background/10 p-4 text-xs text-muted">
                          Nothing checked off yet—one small win unlocks momentum.
                        </p>
                      ) : (
                        finishedToday.map((t) => (
                          <label
                            key={t.id}
                            className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/10 p-4 transition hover:-translate-y-0.5"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked
                                onChange={(e) => toggleDaily(t, e.target.checked)}
                                className="h-5 w-5 rounded border border-accent/40 bg-transparent accent-accent"
                              />
                              <span className="text-sm font-medium text-foreground">{t.task_name}</span>
                            </div>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="rounded-full border border-transparent px-3 py-1 text-xs text-accent transition hover:border-red-400/60 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </label>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-surface-soft/70 p-6 text-sm text-muted backdrop-blur">
              <h3 className="text-base font-semibold text-foreground">Stay consistent</h3>
              <p className="mt-3 leading-relaxed">
                Reserve 5 minutes each evening to review your tracker. Mark any routines you completed,
                queue tomorrow’s daily tasks, and reconnect with your progress before diving into the
                next day.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/home")}
                  className="rounded-full border border-border/60 bg-background/10 px-4 py-2 text-xs font-medium text-muted transition hover:text-foreground hover:border-border"
                >
                  Back to dashboard
                </button>
                <button
                  onClick={() => router.push("/pomodoro")}
                  className="rounded-full border border-accent/40 px-4 py-2 text-xs font-medium text-accent transition hover:-translate-y-0.5"
                >
                  Launch Pomodoro →
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="pb-10 text-center text-xs text-muted">
          © {new Date().getFullYear()} ishaqyudha · Keep stacking consistent wins.
        </footer>
      </div>
    </main>
    </ProtectedRoute>
  );
}
