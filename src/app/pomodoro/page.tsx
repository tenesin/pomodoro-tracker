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
      <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
        <h1 className="text-3xl font-semibold mb-6">Pomodoro Timer 🍅</h1>

        <div className="text-7xl font-mono mb-8">{formatTime(timeLeft)}</div>

        <div className="flex gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-2 rounded-full bg-foreground text-background hover:opacity-80 font-medium transition"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setMode("pomodoro");
              setTimeLeft(25 * 60);
            }}
            className="px-6 py-2 rounded-full border border-border hover:bg-surface transition"
          >
            Reset
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-6 py-2 rounded-full border border-border hover:bg-surface transition"
          >
            Fullscreen
          </button>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 rounded-full border border-border bg-surface hover:bg-foreground hover:text-background transition font-medium"
          >
            Home
          </button>
          <button
            onClick={() => router.push("/tracker")}
            className="px-6 py-2 rounded-full border border-border bg-foreground text-background hover:opacity-90 font-medium"
          >
            Tracker
          </button>
        </div>

        <footer className="mt-10 text-xs text-foreground/50 text-center">
          © {new Date().getFullYear()} ishaqyudha. All rights reserved.
        </footer>
      </main>
    </ProtectedRoute>
  );
}
