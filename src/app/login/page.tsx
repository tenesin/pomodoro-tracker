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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      console.error("❌ Login error:", error);
      alert(error.message);
      return;
    }

    alert("✅ Logged in successfully!");
    router.push("/home");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
      <div className="w-full max-w-sm border border-border rounded-2xl bg-surface/50 shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Welcome Back</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="px-3 py-2 border rounded-lg bg-background"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="px-3 py-2 border rounded-lg bg-background"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Login"}
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
        © {new Date().getFullYear()} ishaqyudha
      </footer>
    </main>
  );
}
