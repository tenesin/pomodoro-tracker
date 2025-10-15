"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      const { data } = await supabase.auth.getUser();
      if (data.user) router.push("/home");
    };
    void checkUser();
  }, [supabase, router]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw new Error(error.message);
      }

      router.push("/home");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-surface/50 border border-border rounded-2xl p-8 shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-6">
          {isLogin ? "Welcome Back 👋" : "Create an Account ✨"}
        </h1>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="px-4 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="px-4 py-2 border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-foreground text-background py-2 rounded-lg font-medium hover:opacity-80 transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-foreground/70">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="underline hover:text-foreground transition"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>

      <footer className="mt-10 text-xs text-foreground/60">
        © {new Date().getFullYear()} by <span className="font-medium">Ishaqyudha</span>
      </footer>
    </div>
  );
}
