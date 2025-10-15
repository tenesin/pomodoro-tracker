"use client";

import { useEffect, useState, useCallback } from "react";
import { format, getDaysInMonth } from "date-fns";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageContainer from "@/components/PageContainer";

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

  return (
    <ProtectedRoute>
      <PageContainer title="📊 Task Tracker">
        <div className="flex flex-col gap-10 w-full max-w-xl mx-auto">
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Routine Tasks</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                value={routineInput}
                onChange={(e) => setRoutineInput(e.target.value)}
                placeholder="Add new routine task..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface/50 focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <button
                onClick={() => addTask("routine", routineInput)}
                className="px-4 py-2 rounded-lg bg-foreground text-background font-medium hover:opacity-80 transition"
              >
                Add
              </button>
            </div>
            {routineTasks.length === 0 ? (
              <p className="text-sm text-foreground/60">No routine tasks yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {routineTasks.map((t) => {
                  const p = progress[t.id]?.percent || 0;
                  const d = progress[t.id]?.days || 0;
                  return (
                    <div
                      key={t.id}
                      className="border border-border rounded-2xl p-4 bg-surface/60 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{t.task_name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => markToday(t)}
                            className="px-3 py-1 text-sm rounded-full bg-foreground text-background hover:opacity-80"
                          >
                            Mark
                          </button>
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="text-sm px-3 py-1 rounded-full border border-border hover:bg-red-500 hover:text-background transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all duration-500"
                          style={{ width: `${p}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-foreground/70 text-right">
                        {d} / {totalDays} days ({p}%)
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Daily Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Daily Tasks</h2>
            <div className="flex gap-2 mb-4">
              <input
                value={dailyInput}
                onChange={(e) => setDailyInput(e.target.value)}
                placeholder="Add new daily task..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface/50 focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <button
                onClick={() => addTask("daily", dailyInput)}
                className="px-4 py-2 rounded-lg bg-foreground text-background font-medium hover:opacity-80 transition"
              >
                Add
              </button>
            </div>
            {unfinishedToday.length === 0 ? (
              <p className="text-sm text-foreground/60">All tasks done for today 🎉</p>
            ) : (
              <div className="flex flex-col gap-3">
                {unfinishedToday.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center justify-between bg-surface/60 border border-border rounded-xl p-3 cursor-pointer hover:bg-surface/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => toggleDaily(t, e.target.checked)}
                        className="accent-foreground w-5 h-5"
                      />
                      <span>{t.task_name}</span>
                    </div>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="text-sm px-2 text-foreground/70 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Finished Today</h2>
              {finishedToday.length === 0 ? (
                <p className="text-sm text-foreground/60">No tasks finished yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {finishedToday.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-center justify-between bg-foreground text-background rounded-lg px-4 py-2 hover:opacity-90 transition"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked
                          onChange={(e) => toggleDaily(t, e.target.checked)}
                          className="accent-background w-5 h-5"
                        />
                        <span>{t.task_name}</span>
                      </div>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="text-sm px-2 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-10 flex justify-center gap-4 mx-6">
              <button
                onClick={() => router.push("/home")}
                className="flex-1 sm:flex-none px-6 py-2 rounded-full border border-border bg-surface hover:bg-foreground hover:text-background text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/pomodoro")}
                className="flex-1 sm:flex-none px-6 py-2 rounded-full border border-border bg-foreground text-background hover:opacity-90 text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                Pomodoro
              </button>
            </div>
          </section>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
