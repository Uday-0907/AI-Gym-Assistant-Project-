"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/api/config";
import Navbar from "@/components/Navbar";

interface WorkoutHistoryItem {
  id?: number;
  session_id?: number;
  started_at: string;
  ended_at?: string | null;
  performance_score: number | null;
  calories: number | null;
  notes?: string | null;
  exercise_name?: string;
  sets?: number;
  reps?: number;
  exercises?: {
    name: string;
    category: string;
    sets: number;
    reps: number;
  }[];
}

interface PerformanceSummary {
  total_workouts?: number;
  total_sessions?: number;
  total_reps?: number;
  average_performance_score?: number | null;
  average_score?: number | null;
  trend?: string;
  score_trend?: string;
  score_delta?: number | null;
  top_focus_areas?: string[];
  next_week_focus?: string;
  recurring_issue?: string;
  recent_sessions?: {
    session_id: number;
    date: string;
    exercise: string;
    score: number | null;
    reps: number;
  }[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [historyRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/workouts/history`, { headers }),
          fetch(`${API_BASE_URL}/performance/summary`, { headers }),
        ]);

        if (historyRes.status === 401 || summaryRes.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        if (!historyRes.ok || !summaryRes.ok) {
          throw new Error("Failed to load workout performance data");
        }

        const historyData = await historyRes.json();
        const summaryData = await summaryRes.json();

        setHistory(historyData);
        setSummary(summaryData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error fetching workout history");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <span className="text-[var(--text-secondary)]">Unscored</span>;
    if (score >= 85) {
      return (
        <span className="rounded-full border border-[var(--accent-live)]/40 bg-[var(--accent-live)]/10 px-2.5 py-1 text-xs font-bold text-[var(--accent-live)]">
          {score} • Excellent
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-bold text-[var(--accent)]">
          {score} • Good
        </span>
      );
    }
    return (
      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
        {score} • Needs Work
      </span>
    );
  };

  const getTrendBadge = (trend: string, delta: number | null) => {
    if (trend === "IMPROVING") {
      return (
        <span className="rounded-md border border-[var(--accent-live)]/40 bg-[var(--accent-live)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--accent-live)]">
          ▲ Improving {delta ? `(+${delta})` : ""}
        </span>
      );
    }
    if (trend === "DECLINING") {
      return (
        <span className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400">
          ▼ Declining {delta ? `(${delta})` : ""}
        </span>
      );
    }
    return (
      <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
        ● Stable
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar
        title="PulseAi"
        subtitle="Workout History & Analytics — Historical Session Performance & Longitudinal Biomechanics"
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">

      {error && (
        <div className="mx-auto mt-4 max-w-6xl rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="mx-auto mt-16 max-w-6xl text-center text-slate-400">
          <p>Loading your workout analytics...</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Summary Overview Cards */}
          {summary && (
            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-none">
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Avg Score</span>
                <p className="mt-2 text-3xl font-bold font-mono text-[var(--accent)]">
                  {summary.average_performance_score ?? summary.average_score ?? "—"}
                  <span className="text-sm font-normal text-[var(--text-secondary)]"> / 100</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {getTrendBadge(summary.trend ?? summary.score_trend ?? "STABLE", summary.score_delta ?? null)}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-none">
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Workouts Logged</span>
                <p className="mt-2 text-3xl font-bold font-mono text-[var(--text-primary)]">{summary.total_workouts ?? summary.total_sessions ?? 0}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Completed sessions</p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-none">
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Total Repetitions</span>
                <p className="mt-2 text-3xl font-bold font-mono text-[var(--text-primary)]">{summary.total_reps ?? 0}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Vision verified reps</p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-none">
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Top Coaching Focus</span>
                <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {summary.top_focus_areas && summary.top_focus_areas.length > 0
                    ? summary.top_focus_areas[0]
                    : summary.next_week_focus || summary.recurring_issue || "Maintain consistent form"}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Biomechanical priority</p>
              </div>
            </section>
          )}

          {/* Detailed Workout History Table */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-none">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Completed Sessions</h2>

            {history.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-secondary)] space-y-4">
                <p>No workout sessions logged yet.</p>
                <Link
                  href="/workout"
                  className="inline-block rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#06121A] hover:opacity-90 transition shadow-none"
                >
                  Start Your First PulseAi Workout
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                  <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-4">Session Date</th>
                      <th className="py-3 px-4">Exercise</th>
                      <th className="py-3 px-4">Sets / Reps</th>
                      <th className="py-3 px-4">Performance Score</th>
                      <th className="py-3 px-4">Calories</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/60">
                    {history.map((item, idx) => {
                      const idKey = item.id || item.session_id || idx;
                      const exName = item.exercise_name || (item.exercises && item.exercises[0]?.name) || "Squat";
                      const exCategory = (item.exercises && item.exercises[0]?.category) || "Compound";
                      const sets = item.sets ?? (item.exercises && item.exercises[0]?.sets) ?? 1;
                      const reps = item.reps ?? (item.exercises && item.exercises[0]?.reps) ?? 0;

                      return (
                        <tr key={idKey} className="hover:bg-[var(--border)]/30 transition">
                          <td className="py-3 px-4 font-mono text-xs text-[var(--text-secondary)]">
                            {item.started_at ? new Date(item.started_at).toLocaleString() : "Recent"}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                            {exName}
                            <span className="ml-1.5 text-xs text-[var(--text-secondary)] font-normal">
                              ({exCategory})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[var(--text-primary)]">
                            {sets} set{sets > 1 ? "s" : ""} × {reps} reps
                          </td>
                          <td className="py-3 px-4">{getScoreBadge(item.performance_score)}</td>
                          <td className="py-3 px-4 font-mono text-xs text-[var(--accent-live)]">
                            {item.calories ? `${item.calories} kcal` : "—"}
                          </td>
                          <td className="py-3 px-4 text-xs text-[var(--text-secondary)] max-w-xs truncate">
                            {item.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
      </div>
    </main>
  );
}
