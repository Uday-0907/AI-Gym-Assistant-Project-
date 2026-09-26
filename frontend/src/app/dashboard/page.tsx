
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/api/config";
import Navbar from "@/components/Navbar";

type Profile = {
  name: string;
  email: string;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_goal: string | null;
  activity_level: string | null;
  dietary_preference: string | null;
};

export default function Dashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load profile");
        }

        setProfile(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);



  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)]">
        <p className="text-[var(--text-secondary)]">Loading your profile...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)]">
        <div className="rounded-xl border border-red-900/60 bg-[var(--bg-surface)] p-8">
          <h1 className="text-xl font-semibold text-red-400">
            Error
          </h1>

          <p className="mt-3 text-[var(--text-secondary)]">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-6 md:p-8 text-[var(--text-primary)]">

      <Navbar
        title="PulseAi"
        subtitle={profile ? `Welcome back, ${profile.name} 👋` : "Welcome back 👋"}
      />

      {/* Phase 2 Quick Launch Banner */}
      <section className="mx-auto mt-8 max-w-6xl rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#39FF88]/30 bg-[#39FF88]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent-live)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-live)] animate-pulse" />
            AI Pose Vision Active
          </span>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">Real-Time AI Fitness Coach</h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-xl">
            Track your repetitions, measure precise knee flexion angles, monitor biomechanical tempo, and receive instant posture feedback with MediaPipe computer vision.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/workout")}
            className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[#06121A] hover:opacity-90 transition"
          >
            Launch AI Trainer
          </button>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-3">

        <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Height
            </h2>

            {profile?.height_cm ? (
              <p className="mt-3 text-3xl font-mono font-bold text-[var(--text-primary)]">
                {profile.height_cm}{" "}
                <span className="text-sm font-normal text-[var(--text-secondary)]">cm</span>
              </p>
            ) : (
              <button
                onClick={() => router.push("/profile")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Set height &rarr;
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Weight
            </h2>

            {profile?.weight_kg ? (
              <p className="mt-3 text-3xl font-mono font-bold text-[var(--text-primary)]">
                {profile.weight_kg}{" "}
                <span className="text-sm font-normal text-[var(--text-secondary)]">kg</span>
              </p>
            ) : (
              <button
                onClick={() => router.push("/profile")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Set weight &rarr;
              </button>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] mb-1">
              <span>Trend (30d)</span>
              <span className="font-mono text-[var(--accent)]">--</span>
            </div>
            <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 24" fill="none" aria-hidden="true">
              <path
                d="M 0 16 Q 25 12, 50 14 T 100 10"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="3 3"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Fitness Goal
            </h2>

            {profile?.fitness_goal ? (
              <p className="mt-3 text-2xl font-mono font-bold text-[var(--text-primary)]">
                {profile.fitness_goal}
              </p>
            ) : (
              <button
                onClick={() => router.push("/profile")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Set goal &rarr;
              </button>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] mb-1">
              <span>Target Velocity</span>
              <span className="font-mono text-[var(--accent)]">Adaptive</span>
            </div>
            <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 24" fill="none" aria-hidden="true">
              <line
                x1="0"
                y1="12"
                x2="100"
                y2="12"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.3"
              />
              <circle cx="65" cy="12" r="3" fill="var(--accent)" />
            </svg>
          </div>
        </div>

      </section>

      <section className="mx-auto mt-8 max-w-6xl rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Your Profile
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          <p className="text-[var(--text-primary)]">
            <span className="text-[var(--text-secondary)]">Email:</span>{" "}
            {profile?.email}
          </p>

          <p className="text-[var(--text-primary)]">
            <span className="text-[var(--text-secondary)]">Activity:</span>{" "}
            {profile?.activity_level ?? "Not set"}
          </p>

          <p className="text-[var(--text-primary)]">
            <span className="text-[var(--text-secondary)]">Diet:</span>{" "}
            {profile?.dietary_preference ?? "Not set"}
          </p>

        </div>

      </section>

    </main>
  );
}
