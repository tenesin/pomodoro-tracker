"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Maximize2, Minimize2 } from "lucide-react";
import PageContainer from "@/components/PageContainer";

type Mode = "pomodoro" | "short" | "long";
interface Tab {
  label: string;
  key: Mode;
}

const TABS: Tab[] = [
  { label: "Pomodoro", key: "pomodoro" },
  { label: "Short Break", key: "short" },
  { label: "Long Break", key: "long" },
];

export default function PomodoroPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [sessionCount, setSessionCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) void router.push("/login");
      else {
        setUserId(data.user.id);
        fetchTodaySessions(data.user.id);
      }
    };
    void checkUser();
  }, [router, supabase]);

  // Fetch sessions
  const fetchTodaySessions = async (uid: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", uid)
      .gte("start_time", today);
    setSessionCount(data?.length || 0);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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
      setSessionCount((p) => p + 1);
      alert("Pomodoro completed 🎉 Time for a break!");
      autoStartBreak();
    } else {
      alert(mode === "short" ? "Short break over ⏰" : "Long break over ☕");
      setMode("pomodoro");
      setTimeLeft(25 * 60);
    }
    setIsRunning(false);
  }, [userId, mode, supabase, sessionCount]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          void handleSessionComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, handleSessionComplete]);

  const setTimerMode = (type: Mode) => {
    setMode(type);
    setIsRunning(false);
    const minutes = type === "pomodoro" ? 25 : type === "short" ? 5 : 15;
    setTimeLeft(minutes * 60);
  };

  const autoStartBreak = () => {
    const next = (sessionCount + 1) % 4 === 0 ? "long" : "short";
    setTimerMode(next);
    setIsRunning(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    void router.push("/login");
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <PageContainer title="">
      <div className="flex flex-col items-center text-center relative z-10 max-w-md mx-auto backdrop-blur-lg bg-surface/40 border border-border rounded-3xl p-8 shadow-xl">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTimerMode(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === tab.key
                  ? "bg-foreground text-background shadow-md"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="text-[8rem] font-mono font-light mb-8 tracking-tight select-none drop-shadow">
          {formatTime(timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsRunning((r) => !r)}
            className="bg-foreground text-background text-lg font-semibold px-8 py-3 rounded-full shadow-md hover:opacity-80 transition-all"
          >
            {isRunning ? "PAUSE" : "START"}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-3 border border-border rounded-full hover:bg-foreground hover:text-background transition-all"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        <p className="mt-6 text-sm opacity-70">
          Completed Today: <strong>{sessionCount}</strong>
        </p>

        {/* Spotify */}
        <div className="mt-8 flex justify-center">
          <iframe
            style={{
              borderRadius: "10px",
              filter: "grayscale(1) contrast(0.9) brightness(0.95)",
            }}
            src="https://open.spotify.com/embed/playlist/2sZYutAwhMODqCaS0mYj4Z?utm_source=generator&theme=0"
            width="380"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy"
            className="shadow-sm opacity-80 hover:opacity-100 transition"
          ></iframe>
        </div>

        <div className="mt-10 flex justify-center gap-4 mx-6">
          <button
            onClick={() => router.push("/home")}
            className="flex-1 sm:flex-none px-6 py-2 rounded-full border border-border bg-surface hover:bg-foreground hover:text-background text-sm font-medium shadow-sm hover:shadow-md transition-all"
          >
            Home
          </button>

          <button
            onClick={() => router.push("/tracker")}
            className="flex-1 sm:flex-none px-6 py-2 rounded-full border border-border bg-foreground text-background hover:opacity-90 text-sm font-medium shadow-sm hover:shadow-md transition-all"
          >
            Tracker
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
