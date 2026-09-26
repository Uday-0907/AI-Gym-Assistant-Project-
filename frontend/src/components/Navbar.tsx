"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface NavbarProps {
  title?: string;
  subtitle?: React.ReactNode;
}

export default function Navbar({ title = "PulseAi", subtitle }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    router.push("/login");
  }

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Gym & Planner", href: "/planner" },
    { label: "Analytics Dashboard", href: "/analytics" },
    { label: "Smart Gym IoT", href: "/iot" },
    { label: "Habit Tracker", href: "/habit" },
    { label: "Weekly Intelligence", href: "/reports" },
    { label: "Nutrition & Diet", href: "/nutrition" },
    { label: "Media & Storage", href: "/storage" },
    { label: "History", href: "/history" },
    { label: "Edit Profile", href: "/profile" },
  ];

  return (
    <header className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[var(--border)] pb-6 mb-8">
      <div>
        <Link
          href="/dashboard"
          className="text-3xl font-bold tracking-tight text-[var(--text-primary)] hover:opacity-90 transition"
        >
          {title}
        </Link>
        {subtitle && (
          <div className="mt-1 text-sm text-[var(--text-secondary)]">
            {subtitle}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/workout"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#06121A] hover:opacity-90 transition shadow-none"
        >
          + Start Workout
        </Link>

        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-semibold"
                  : "border-[var(--border)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          type="button"
          className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
