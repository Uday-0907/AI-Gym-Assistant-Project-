"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/api/config";
import Navbar from "@/components/Navbar";

type TimeWindow = "7_days" | "14_days" | "30_days";

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("7_days");
  const [activeTab, setActiveTab] = useState<"overview" | "workouts" | "nutrition" | "habits" | "iot">("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any>(null);
  const [nutrition, setNutrition] = useState<any>(null);
  const [habits, setHabits] = useState<any>(null);
  const [iot, setIot] = useState<any>(null);

  useEffect(() => {
    async function loadAnalytics() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [ovRes, wkRes, nuRes, hbRes, ioRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/overview?time_window=${timeWindow}`, { headers }),
          fetch(`${API_BASE_URL}/analytics/workouts?time_window=${timeWindow}`, { headers }),
          fetch(`${API_BASE_URL}/analytics/nutrition?time_window=${timeWindow}`, { headers }),
          fetch(`${API_BASE_URL}/analytics/habits?time_window=${timeWindow}`, { headers }),
          fetch(`${API_BASE_URL}/analytics/iot?time_window=${timeWindow}`, { headers }),
        ]);

        if (ovRes.status === 401 || wkRes.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        const ovData = await ovRes.json();
        const wkData = await wkRes.json();
        const nuData = await nuRes.json();
        const hbData = await hbRes.json();
        const ioData = await ioRes.json();

        setOverview(ovData);
        setWorkouts(wkData);
        setNutrition(nuData);
        setHabits(hbData);
        setIot(ioData);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [router, timeWindow]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm font-medium">Loading Multi-Domain Analytics...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-4 md:p-8">
      {/* Shared Unified Header Navigation */}
      <Navbar
        title="PulseAi"
        subtitle="Analytics & Intelligence Dashboard — Multi-domain progress tracking across Workouts, Nutrition, Habits & Smart Gym"
      />

      {error && (
        <div className="mx-auto max-w-7xl mb-6 rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Controls & Tabs Bar */}
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "overview"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            📊 Multi-Domain Overview
          </button>
          <button
            onClick={() => setActiveTab("workouts")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "workouts"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            🏋️ Workout Performance
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "nutrition"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            🥗 Nutrition & Compliance
          </button>
          <button
            onClick={() => setActiveTab("habits")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "habits"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            📈 Habit & Skip Risk
          </button>
          <button
            onClick={() => setActiveTab("iot")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "iot"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            ⚡ Smart Gym & IoT
          </button>
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 self-start md:self-auto">
          <span className="text-xs text-[var(--text-secondary)] font-medium">Window:</span>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
            className="bg-transparent text-xs font-semibold text-[var(--accent)] focus:outline-none cursor-pointer"
          >
            <option value="7_days" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Last 7 Days</option>
            <option value="14_days" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Last 14 Days</option>
            <option value="30_days" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === "overview" && overview && (
        <section className="mx-auto max-w-7xl space-y-6">
          {/* Summary Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: User Profile */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">User Profile</span>
              <p className="text-xl font-bold text-[var(--text-primary)]">{overview.user_profile?.name}</p>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <span>Goal: <strong className="text-[var(--accent)] uppercase">{overview.user_profile?.fitness_goal}</strong></span>
                <span>BMI: <strong className="font-mono text-[var(--accent)]">{overview.user_profile?.bmi || "N/A"}</strong></span>
              </div>
            </div>

            {/* Card 2: Workout Summary */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Workouts ({timeWindow})</span>
              <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                {overview.workout_summary?.total_workouts} <span className="text-xs font-normal text-[var(--text-secondary)] font-sans">sessions</span>
              </p>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <span>Avg Score: <strong className="font-mono text-[var(--accent)]">{overview.workout_summary?.avg_performance_score ? `${overview.workout_summary.avg_performance_score}/100` : "No data"}</strong></span>
                <span>Trend: <strong className="text-[var(--accent)] capitalize">{overview.workout_summary?.performance_trend || "N/A"}</strong></span>
              </div>
            </div>

            {/* Card 3: Nutrition Summary */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Nutrition ({timeWindow})</span>
              <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                {overview.nutrition_summary?.avg_daily_calories ? `${overview.nutrition_summary.avg_daily_calories} kcal` : "No logs"}
              </p>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <span>Target: <strong className="font-mono text-[var(--accent)]">{overview.nutrition_summary?.target_calories} kcal</strong></span>
                <span>Compliance: <strong className="font-mono text-[var(--accent)]">{overview.nutrition_summary?.calorie_compliance_pct ? `${overview.nutrition_summary.calorie_compliance_pct}%` : "N/A"}</strong></span>
              </div>
            </div>

            {/* Card 4: Habit & IoT Summary */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Habit & IoT Status</span>
              <p className="text-lg font-bold text-[var(--text-primary)] capitalize">
                Risk: <span className="text-[var(--accent)]">{overview.habit_summary?.risk_level || "Unknown"}</span>
              </p>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <span>Consistency: <strong className="font-mono text-[var(--accent)]">{overview.habit_summary?.consistency_rate_pct ? `${overview.habit_summary.consistency_rate_pct}%` : "0%"}</strong></span>
                <span>IoT Devices: <strong className="font-mono text-[var(--accent)]">{overview.iot_summary?.total_devices || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Cross-Domain Observational Insights Section */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4">
            <h2 className="text-base font-semibold text-[var(--accent)] flex items-center gap-2">
              <span>🧠</span> Cross-Domain Observational Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overview.cross_domain_insights?.map((item: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
                    <span>{item.domain}</span>
                    <span className="text-[var(--text-secondary)] font-normal">{item.note}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB CONTENT: 2. WORKOUT PERFORMANCE */}
      {activeTab === "workouts" && workouts && (
        <section className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Total Sessions</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">{workouts.total_workouts}</p>
              <p className="text-xs text-[var(--text-secondary)] font-mono">{workouts.total_duration_minutes} total minutes logged</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Average Score</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">
                {workouts.avg_performance_score ? `${workouts.avg_performance_score}/100` : "N/A"}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Based on computer vision pose analysis</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Performance Trend</span>
              <p className="text-2xl font-bold text-[var(--accent-live)] capitalize">{workouts.performance_trend}</p>
              <p className="text-xs text-[var(--text-secondary)]">Evaluated across selected window</p>
            </div>
          </div>

          {!workouts.has_data ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-secondary)]">
              ℹ️ No workout sessions recorded in the selected {timeWindow} window. Complete a workout to view performance breakdown.
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4">
              <h3 className="text-md font-bold text-[var(--text-primary)]">Recent Session History</h3>
              <div className="space-y-2">
                {workouts.session_history?.map((s: any) => (
                  <div key={s.session_id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-sm">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{s.date}</p>
                      <p className="text-xs text-[var(--text-secondary)] font-mono">Duration: {s.duration_minutes} mins</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold border border-[var(--accent)]/40 bg-transparent text-[var(--accent)]">
                        Score: {s.performance_score || "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: 3. NUTRITION */}
      {activeTab === "nutrition" && nutrition && (
        <section className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Daily Caloric Target</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">{nutrition.target?.calories_target} kcal</p>
              <p className="text-xs text-[var(--text-secondary)] font-mono">Protein target: {nutrition.target?.protein_grams}g</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Avg Daily Intake</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">
                {nutrition.average_daily_intake?.avg_calories ? `${nutrition.average_daily_intake.avg_calories} kcal` : "N/A"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-mono">Avg Protein: {nutrition.average_daily_intake?.avg_protein_g || 0}g</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Calorie Compliance</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">
                {nutrition.compliance?.calorie_compliance_pct !== null ? `${nutrition.compliance.calorie_compliance_pct}%` : "N/A"}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Target tolerance: ±15%</p>
            </div>
          </div>

          {!nutrition.has_data ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-secondary)]">
              ℹ️ Insufficient nutrition logs in the selected {timeWindow} window. Log your meals to track daily compliance.
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4">
              <h3 className="text-md font-bold text-[var(--text-primary)]">Daily Intake Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nutrition.daily_trends?.map((d: any) => (
                  <div key={d.date} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-xs space-y-1">
                    <div className="flex justify-between items-center font-semibold text-[var(--text-primary)]">
                      <span>{d.date}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.is_compliant ? 'border border-[var(--accent-live)]/40 bg-transparent text-[var(--accent-live)]' : 'border border-[var(--border)] bg-transparent text-[var(--text-secondary)]'}`}>
                        {d.is_compliant ? 'Compliant' : 'Off Target'}
                      </span>
                    </div>
                    <p className="text-[var(--text-primary)] font-mono font-bold text-sm">{d.calories} kcal</p>
                    <p className="text-[var(--text-secondary)] font-mono">P: {d.protein_g}g | C: {d.carbs_g}g | F: {d.fat_g}g</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: 4. HABITS */}
      {activeTab === "habits" && habits && (
        <section className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Habit Risk Level</span>
              <p className="text-3xl font-bold text-[var(--accent)] capitalize">{habits.current_status?.risk_level || "Normal"}</p>
              <p className="text-xs text-[var(--text-secondary)] font-mono">Skip prob: {habits.current_status?.skip_probability !== null ? `${(habits.current_status.skip_probability * 100).toFixed(1)}%` : "N/A"}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Consistency Rate</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">{habits.consistency?.consistency_rate_pct}%</p>
              <p className="text-xs text-[var(--text-secondary)]">Target: {habits.consistency?.target_days_per_week} days/week</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Workouts Completed</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">
                {habits.consistency?.actual_workouts_in_window} / {habits.consistency?.expected_workouts_in_window}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Actual vs Expected in window</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-3">
            <h3 className="text-md font-bold text-[var(--accent)]">Adaptive Behavioral Guidance</h3>
            <p className="text-sm text-[var(--text-primary)]">{habits.current_status?.recommendation}</p>
          </div>
        </section>
      )}

      {/* TAB CONTENT: 5. SMART GYM IOT */}
      {activeTab === "iot" && iot && (
        <section className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Connected Devices</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">{iot.device_counts?.total_devices}</p>
              <p className="text-xs text-[var(--text-secondary)]">{iot.device_counts?.simulated_devices} Simulated Demo Devices</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Avg Set Intensity</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">
                {iot.telemetry_averages?.avg_intensity ? `${iot.telemetry_averages.avg_intensity}%` : "N/A"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-mono">Avg Resistance: {iot.telemetry_averages?.avg_resistance_kg || 0} kg</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase">Avg Heart Rate</span>
              <p className="text-3xl font-mono font-bold text-[var(--accent)]">
                {iot.telemetry_averages?.avg_heart_rate ? `${iot.telemetry_averages.avg_heart_rate} BPM` : "N/A"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-mono">{iot.telemetry_averages?.total_telemetry_records || 0} telemetry records</p>
            </div>
          </div>

          {!iot.has_data ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-secondary)]">
              ℹ️ No connected Smart Gym devices or telemetry recorded in {timeWindow}. Visit the Smart Gym IoT page to connect devices or generate simulation telemetry.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {iot.device_breakdown?.map((dev: any) => (
                <div key={dev.device_id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{dev.device_name}</span>
                    {dev.is_simulated && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/40 bg-transparent text-amber-300">
                        Simulation Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] capitalize">Category: {dev.equipment_category}</p>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                    <span>Intensity: <strong className="font-mono text-[var(--accent)]">{dev.avg_intensity ? `${dev.avg_intensity}%` : "N/A"}</strong></span>
                    <span>Resistance: <strong className="font-mono text-[var(--accent)]">{dev.avg_resistance_kg} kg</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
