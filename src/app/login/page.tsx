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

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
      <div className="w-full max-w-sm border border-border rounded-2xl bg-surface/50 shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Welcome Back</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 py-2 rounded-lg font-medium transition-all ${
              loading
                ? "bg-border text-foreground/60 cursor-not-allowed"
                : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-foreground/60">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-foreground hover:underline font-medium"
          >
            Register
          </button>
        </p>
      </div>

      <footer className="mt-8 text-xs text-foreground/50 text-center">
        © {new Date().getFullYear()} ishaqyudha. All rights reserved.
      </footer>
    </main>
  );
}
