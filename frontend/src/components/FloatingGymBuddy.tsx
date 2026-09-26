"use client";

import { usePathname, useRouter } from "next/navigation";

export default function FloatingGymBuddy() {
  const router = useRouter();
  const pathname = usePathname();
  // Don't render on auth pages or when already on gym buddy page
  if (pathname === "/login" || pathname === "/register" || pathname === "/buddy") {
    return null;
  }

  const handleClick = () => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    router.push(token ? "/buddy" : "/login?redirect=/buddy");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)]/95 px-4 py-3 backdrop-blur-md transition-all hover:scale-105 hover:border-[var(--accent)] group"
      title="Ask Virtual Gym Buddy"
      aria-label="Ask Virtual Gym Buddy"
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent)]/10 text-lg">
        🤖
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
      </div>
      <span className="text-xs font-semibold text-[var(--text-primary)] hidden sm:inline group-hover:text-[var(--accent)] transition-colors">
        Gym Buddy
      </span>
    </button>
  );
}
