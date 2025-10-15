"use client";

export default function PageContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="w-[500px] bg-surface border border-border rounded-xl shadow-sm p-8">
        {title && <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>}
        {children}
      </div>
    </main>
  );
}
