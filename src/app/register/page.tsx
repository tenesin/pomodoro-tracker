"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail.includes("@")) {
      alert("⚠️ Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      alert("⚠️ Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      console.error("❌ Registration error:", error);
      alert(error.message);
    } else {
      alert("✅ Registration successful! Please verify your email before logging in.");
      router.push("/login");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-6 top-32 h-80 w-80 rounded-full bg-accent-soft blur-3xl" />
        <div className="absolute bottom-20 right-24 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
        <section className="space-y-6 text-center lg:text-left lg:w-[48%]">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-soft/50 px-4 py-1 text-xs uppercase tracking-[0.35em] text-muted backdrop-blur">
            Start today
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Join the makers staying <span className="text-accent">laser-focused</span> every day
          </h1>
          <p className="text-sm text-muted">
            Track every session, celebrate streaks, and maintain habits with clarity. Your focus
            dashboard will always feel at home on any device.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Smart reminders", desc: "Gentle nudges before your focus window" },
              { title: "Task insights", desc: "See completion momentum build monthly" },
              { title: "Realtime sync", desc: "Instant updates across timer and tracker" },
              { title: "Secure & private", desc: "Powered by Supabase authentication" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/50 bg-surface/70 p-4 text-left shadow-sm backdrop-blur"
              >
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-xs text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 w-full max-w-md rounded-3xl border border-border/70 bg-surface/85 p-8 shadow-xl backdrop-blur-lg lg:mt-0">
          <header className="mb-6 space-y-1 text-center">
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="text-sm text-muted">We’ll keep your sessions and tasks in sync.</p>
          </header>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="space-y-2 text-left">
              <label
                htmlFor="register-email"
                className="text-xs font-medium uppercase tracking-wide text-muted"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border/70 bg-surface-soft/60 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                required
              />
            </div>

            <div className="space-y-2 text-left">
              <label
                htmlFor="register-password"
                className="text-xs font-medium uppercase tracking-wide text-muted"
              >
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-border/70 bg-surface-soft/60 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-medium text-background shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating..." : "Launch your dashboard"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="font-semibold text-accent hover:text-accent/80"
            >
              Log in
            </button>
          </p>
        </section>
      </div>

      <footer className="relative z-10 pb-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} ishaqyudha. Your next streak starts now.
      </footer>
    </main>
  );
}
