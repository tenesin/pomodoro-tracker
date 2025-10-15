"use client";

import { createContext, useContext, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
};

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error("useSupabase must be used inside SupabaseProvider");
  return context;
}

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient());

  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>;
}
