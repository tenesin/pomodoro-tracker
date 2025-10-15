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

    if (!cleanEmail || !cleanEmail.includes("@")) {
      alert("⚠️ Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (cleanPassword.length < 6) {
      alert("⚠️ Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    console.log("🟢 Attempting signup:", cleanEmail);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      console.error("❌ Supabase signup error:", error);
      alert(error.message);
      return;
    }

    alert("✅ Registration successful! Please verify your email.");
    router.push("/login");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
      <div className="w-full max-w-sm border border-border rounded-2xl bg-surface/50 shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Create Account</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-foreground/60">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-foreground hover:underline font-medium"
          >
            Log in
          </button>
        </p>
      </div>

      <footer className="mt-8 text-xs text-foreground/50 text-center">
        © {new Date().getFullYear()} ishaqyudha
      </footer>
    </main>
  );
}
