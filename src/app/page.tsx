"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) router.push("/home");
    };
    void checkUser();
  }, [router]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });
        if (error) throw new Error(error.message);
      }
      router.push("/home");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unexpected error occurred");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-16 left-12 h-56 w-56 rounded-full bg-accent-soft blur-3xl" />
        <div className="absolute -bottom-12 right-0 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-soft blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
        <section className="text-center lg:text-left lg:w-[48%] space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-soft/60 px-4 py-1 text-xs uppercase tracking-[0.2em] text-muted backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Focus mode enabled
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Level up the way you <span className="text-accent">plan, focus, and track</span> your day
          </h1>
          <p className="text-base leading-relaxed text-muted">
            Pomodoro Tracker is your companion for deep work. Switch between the timer, capture your
            streaks, and stay accountable with monthly insights—all synced with Supabase.
          </p>

          <dl className="grid gap-5 sm:grid-cols-3">
            {[
              { label: "Daily Focus", value: "25 min sprints" },
              { label: "Completion Rate", value: "94%" },
              { label: "Active Users", value: "1,200+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-5 text-left shadow-sm backdrop-blur"
              >
                <dt className="text-xs uppercase tracking-wider text-muted">{stat.label}</dt>
                <dd className="mt-2 text-lg font-semibold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 w-full max-w-md self-center rounded-3xl border border-border/70 bg-surface/85 p-8 shadow-xl backdrop-blur-lg lg:mt-0">
          <div className="mb-6 space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
              {isLogin ? "Welcome back 👋" : "Create your space ✨"}
            </h2>
            <p className="text-sm text-muted">
              {isLogin
                ? "Sign in to jump straight into your next focus session."
                : "Register to start tracking your progress and build momentum."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-muted">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-border/70 bg-surface-soft/70 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-border/70 bg-surface-soft/70 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-medium text-background shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              {isLogin ? "Sign in & focus" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            {isLogin ? "Need an account?" : "Already a member?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-accent hover:text-accent/80"
            >
              {isLogin ? "Start here" : "Sign in"}
            </button>
          </div>
        </section>
      </div>

      <footer className="relative z-10 pb-10 text-center text-xs text-muted">
        © {new Date().getFullYear()} <span className="font-medium text-foreground">Ishaqyudha</span>.
        Built for makers who value mindful productivity.
      </footer>
    </div>
  );
}
