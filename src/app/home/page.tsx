"use client";

import Link from "next/link";
import { Github, Linkedin, Instagram, LogOut } from "lucide-react";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/");
    };
    void checkUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-between px-6 py-10">
      {/* === Navbar === */}
      <header className="w-full flex justify-between items-center max-w-4xl">
        <h1 className="text-xl font-semibold tracking-tight">FocusSpace</h1>

        <nav className="flex items-center gap-4 text-sm">
          <a
            href="https://linkedin.com/in/YOUR_LINKEDIN"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="https://instagram.com/YOUR_INSTAGRAM"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>
          <a
            href="https://github.com/YOUR_GITHUB"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
          <button
            onClick={handleLogout}
            className="ml-4 hover:opacity-70 transition flex items-center gap-1 text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </header>

      {/* === Main Section === */}
      <main className="flex flex-col items-center justify-center flex-1 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">Manage your Focus & Progress</h2>
        <p className="text-sm sm:text-base text-foreground/70 mb-10 max-w-md">
          Track your daily habits and productivity using the Pomodoro timer and monthly progress
          tracker.
        </p>

        <div className="flex gap-6">
          <Link
            href="/pomodoro"
            className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition"
          >
            🍅 Pomodoro
          </Link>
          <Link
            href="/tracker"
            className="px-6 py-3 rounded-full border border-border hover:bg-foreground hover:text-background text-sm font-medium transition"
          >
            ✅ Tracker
          </Link>
        </div>
      </main>

      {/* === Footer === */}
      <footer className="text-xs text-foreground/60 mt-10">
        © {new Date().getFullYear()} by <span className="font-medium">Ishaqyudha</span>
      </footer>
    </div>
  );
}
