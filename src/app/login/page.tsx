"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    setLoading(false);

    if (error) {
      console.error("❌ Login error:", error);
      alert(error.message);
    } else {
      router.push("/home");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-24 top-16 h-64 w-64 rounded-full bg-accent-soft blur-3xl" />
        <div className="absolute bottom-0 right-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
        <section className="space-y-6 text-center lg:text-left lg:w-[46%]">
          <h1 className="text-4xl font-semibold leading-tight">
            Welcome back to <span className="text-accent">deep work</span>
          </h1>
          <p className="text-sm text-muted">
            Pick up right where you left off. Login to sync your pomodoro sessions, monitor streaks,
            and keep your monthly momentum tracking in one focused space.
          </p>

          <ol className="grid gap-3 text-left text-sm text-muted/90">
            {["Stay logged across devices", "Track tasks and pomodoros effortlessly", "Re-focus in under 10 seconds"].map((item, index) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl bg-surface-soft/40 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 w-full max-w-md rounded-3xl border border-border/70 bg-surface/80 p-8 shadow-xl backdrop-blur lg:mt-0">
          <header className="mb-6 space-y-1 text-center">
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="text-sm text-muted">We saved your progress while you were away.</p>
          </header>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="space-y-2 text-left">
              <label htmlFor="login-email" className="text-xs font-medium uppercase tracking-wide text-muted">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border/70 bg-surface-soft/60 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                required
              />
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wide text-muted">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border/70 bg-surface-soft/60 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-medium text-background shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in…" : "Enter workspace"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don’t have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="font-semibold text-accent hover:text-accent/80"
            >
              Create one
            </button>
          </p>
        </section>
      </div>

      <footer className="relative z-10 pb-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} ishaqyudha. Stay consistent.
      </footer>
    </main>
  );
}
