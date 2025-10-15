"use client";

import "./globals.css";
import SupabaseProvider from "@/components/SupabaseProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen transition-colors duration-500">
        <SupabaseProvider>
          <main className="flex flex-col items-center justify-center min-h-screen">{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
