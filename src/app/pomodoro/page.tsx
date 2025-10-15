"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PomodoroPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [sessionCount, setSessionCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const autoStartBreak = useCallback(() => {
    const next = (sessionCount + 1) % 4 === 0 ? "long" : "short";
    setMode(next);
    setTimeLeft(next === "long" ? 15 * 60 : 5 * 60);
    setIsRunning(true);
  }, [sessionCount]);

  const handleSessionComplete = useCallback(async () => {
    if (!userId) return;

    if (mode === "pomodoro") {
      await supabase.from("pomodoro_sessions").insert({
        user_id: userId,
        start_time: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        end_time: new Date().toISOString(),
        duration_min: 25,
        completed: true,
      });
      setSessionCount((prev) => prev + 1);
      alert("Pomodoro complete! Take a break ☕");
      autoStartBreak();
    } else {
      alert(mode === "short" ? "Short break done ⏰" : "Long break done 🌅");
      setMode("pomodoro");
      setTimeLeft(25 * 60);
      setIsRunning(false);
    }
  }, [mode, userId, autoStartBreak]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning && timeLeft > 0) setTimeLeft((prev) => prev - 1);
      if (isRunning && timeLeft === 0) handleSessionComplete();
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleSessionComplete]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setUserId(data.user.id);
    };
    void fetchUser();
  }, [router]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <ProtectedRoute>
      <main className="relative min-h-screen overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-24 h-64 w-64 rounded-full bg-accent/40 blur-3xl" />
          <div className="absolute bottom-16 right-20 h-80 w-80 rounded-full bg-accent-soft blur-[140px]" />
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <section className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-soft/60 px-4 py-1 text-xs uppercase tracking-[0.35em] text-muted">
              Pomodoro
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Sustain your focus with <span className="text-accent">25-minute sprints</span>
            </h1>
            <p className="text-sm text-muted">
              Start a session, stay in flow, and let us log everything automatically. Each completed
              Pomodoro boosts your daily stats and keeps your tracker in sync.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Auto logging",
                  desc: "Completed sessions sync straight to Supabase.",
                },
                {
                  title: "Break intelligence",
                  desc: "Alternate short and long breaks automatically.",
                },
                {
                  title: "Session targets",
                  desc: "Aim for 6 sessions per day—small wins compound fast.",
                },
                {
                  title: "Ambient focus",
                  desc: "Toggle fullscreen for a distraction-free workspace.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border/60 bg-surface/80 p-4 text-left backdrop-blur"
                >
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-xs text-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-center gap-8 rounded-3xl border border-border/70 bg-surface/80 p-10 text-center shadow-xl backdrop-blur">
            <div className="flex w-full justify-center gap-3">
              {(["pomodoro", "short", "long"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setIsRunning(false);
                    setMode(option);
                    if (option === "pomodoro") setTimeLeft(25 * 60);
                    if (option === "short") setTimeLeft(5 * 60);
                    if (option === "long") setTimeLeft(15 * 60);
                  }}
                  className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    mode === option
                      ? "bg-accent text-background shadow-md shadow-accent/30"
                      : "border border-border/60 bg-background/10 text-muted hover:text-foreground"
                  }`}
                >
                  {option === "pomodoro" ? "Focus" : option === "short" ? "Short break" : "Long break"}
                </button>
              ))}
            </div>

            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-accent/40 bg-gradient-to-br from-accent/20 via-transparent to-transparent shadow-inner shadow-accent/20">
              <div className="absolute inset-[18px] rounded-full border border-border/60 bg-surface-soft/80 backdrop-blur" />
              <div className="relative text-6xl font-mono tracking-tight text-foreground">
                {formatTime(timeLeft)}
              </div>
              <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-2 text-xs text-muted backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                {isRunning ? "In session" : "Paused"}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 my-5 sm:flex-row">
              <button
                onClick={() => setIsRunning((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-medium text-background shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                {isRunning ? "Pause session" : "Start session"}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setMode("pomodoro");
                  setTimeLeft(25 * 60);
                }}
                className="inline-flex items-center justify-center rounded-xl border border-border/60 px-6 py-3 text-sm font-medium text-muted transition hover:text-foreground hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                Reset timer
              </button>
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center justify-center rounded-xl border border-border/60 px-6 py-3 text-sm font-medium text-muted transition hover:text-foreground hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                Fullscreen
              </button>
            </div>

            <div className="mt-4 grid w-full gap-4 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Sessions today</p>
                <p className="mt-3 text-3xl font-semibold text-accent">{sessionCount}</p>
                <p className="text-xs text-muted">Each completed sprint moves you closer to your goal.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Next break</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {mode === "pomodoro"
                    ? `${Math.max(Math.floor(timeLeft / 60), 0)} min`
                    : mode === "short"
                      ? "Short break"
                      : "Long break"}
                </p>
                <p className="text-xs text-muted">
                  {mode === "pomodoro"
                    ? "Stay focused—your break arrives once the timer hits zero."
                    : "Ease back into focus when you’re ready to start another sprint."}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/10 p-4 text-xs text-muted">
              <button
                onClick={() => router.push("/home")}
                className="rounded-full border border-transparent px-4 py-2 font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
              >
                Back to dashboard
              </button>
              <button
                onClick={() => router.push("/tracker")}
                className="rounded-full border border-accent/40 px-4 py-2 font-medium text-accent transition hover:-translate-y-0.5"
              >
                Open tracker →
              </button>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
