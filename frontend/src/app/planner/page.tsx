"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/api/config";
import Navbar from "@/components/Navbar";

interface GymItem {
  id: number;
  name: string;
  address: string;
  city: string;
  price_category: string;
  rating: number;
  opening_hours: string;
  facilities: string[];
  equipment: string[];
  supported_workout_types: string[];
  is_verified_sample: boolean;
}

interface GymRecommendation {
  gym: GymItem;
  suitability_score: number;
  match_category: string;
  match_reasons: string[];
}

interface ExerciseItem {
  name: string;
  sets: number;
  reps_or_duration: string;
  target_muscle: string;
  technique_cue?: string;
}

interface WorkoutPlanItem {
  id: number;
  day_of_week: string;
  day_title: string;
  is_rest_day: boolean;
  target_muscle_groups?: string;
  exercises: ExerciseItem[];
  warmup_notes?: string;
}

interface WorkoutPlan {
  id: number;
  user_id: number;
  plan_name: string;
  fitness_goal: string;
  target_split: string;
  days_per_week: number;
  habit_adapted: boolean;
  performance_adapted: boolean;
  adaptation_notes?: string;
  items: WorkoutPlanItem[];
  created_at: string;
}

export default function PlannerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"gyms" | "planner">("gyms");
  
  // Gyms state
  const [recommendations, setRecommendations] = useState<GymRecommendation[]>([]);
  const [gymSearch, setGymSearch] = useState("");
  const [userGoal, setUserGoal] = useState("");
  
  // Planner state
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string>("hypertrophy");
  const [generating, setGenerating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [recRes, planRes] = await Promise.all([
          fetch(`${API_BASE_URL}/gyms/recommendations?limit=6`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/planner/latest`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (recRes.status === 401 || planRes.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData.recommendations || []);
          setUserGoal(recData.user_goal || "maintenance");
          if (recData.user_goal) {
            setSelectedGoal(recData.user_goal);
          }
        }

        if (planRes.ok) {
          const planData = await planRes.json();
          setActivePlan(planData);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to communicate with recommendation server.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  async function handleGeneratePlan() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/planner/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fitness_goal: selectedGoal,
        }),
      });

      if (res.ok) {
        const newPlan = await res.json();
        setActivePlan(newPlan);
      }
    } catch (err) {
      console.error("Plan generation error", err);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent"></div>
          <p className="text-[var(--text-secondary)] text-sm">Matching gym suitability & generating weekly planner...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] p-6">
        <div className="max-w-md rounded-2xl border border-red-900/60 bg-[var(--bg-surface)] p-8 text-center shadow-none">
          <h1 className="text-2xl font-bold text-red-400">Service Error</h1>
          <p className="mt-3 text-[var(--text-secondary)] text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[#06121A] hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const filteredRecommendations = recommendations.filter((item) => {
    if (!gymSearch) return true;
    const search = gymSearch.toLowerCase();
    return (
      item.gym.name.toLowerCase().includes(search) ||
      item.gym.address.toLowerCase().includes(search) ||
      item.gym.equipment.some((e) => e.toLowerCase().includes(search))
    );
  });

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Shared Unified Header Navigation */}
        <Navbar
          title="PulseAi"
          subtitle="Gym Recommender & Workout Planner — Personalized gym suitability scoring and adaptive weekly workout schedule design."
        />

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <button
            onClick={() => setActiveTab("gyms")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition ${
              activeTab === "gyms"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            🏋️ Gym Recommender ({filteredRecommendations.length})
          </button>

          <button
            onClick={() => setActiveTab("planner")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition ${
              activeTab === "planner"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            📅 Weekly Workout Planner
          </button>
        </div>

        {/* TAB 1: GYM RECOMMENDER */}
        {activeTab === "gyms" && (
          <div className="space-y-6">
            
            {/* Search Filter & Context Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search by equipment, location, or facility..."
                  value={gymSearch}
                  onChange={(e) => setGymSearch(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs text-[var(--text-secondary)]">
                  Personalized for goal: <strong className="text-[var(--accent)] capitalize">{userGoal}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const queryGoal = userGoal.includes("hypertrophy") || userGoal.includes("strength")
                      ? "strength gym near me"
                      : userGoal.includes("weight") || userGoal.includes("fat")
                      ? "fitness center gym near me"
                      : "gym near me";
                    window.open(`https://www.google.com/maps/search/${encodeURIComponent(queryGoal)}`, "_blank");
                  }}
                  className="rounded-lg border border-[var(--border)] bg-transparent px-3.5 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition flex items-center gap-1.5"
                >
                  📍 Find More Gyms Near Me (Google Maps)
                </button>
              </div>
            </div>

            {/* Gym Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredRecommendations.map((rec) => (
                <div
                  key={rec.gym.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between shadow-none space-y-4 hover:border-[var(--accent)]/50 transition"
                >
                  <div>
                    {/* Header line: Gym Name & Suitability Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{rec.gym.name}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                          📍 {rec.gym.address}, {rec.gym.city}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="rounded-full border border-[var(--accent)]/40 bg-transparent px-3 py-1 text-xs font-bold text-[var(--accent)]">
                          {rec.suitability_score}% Suitability
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] mt-1">{rec.match_category}</span>
                      </div>
                    </div>

                    {/* Metadata line: Rating & Price */}
                    <div className="flex items-center gap-4 my-3 text-xs text-[var(--text-secondary)] border-y border-[var(--border)] py-2.5">
                      <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                        ★ {rec.gym.rating.toFixed(1)} / 5.0
                      </div>
                      <div>
                        Price Tier: <span className="font-semibold capitalize text-[var(--accent)]">{rec.gym.price_category.replace("_", " ")}</span>
                      </div>
                      <div>
                        Hours: <span className="text-[var(--text-primary)]">{rec.gym.opening_hours}</span>
                      </div>
                    </div>

                    {/* Match Reasons List */}
                    <div className="space-y-1.5 my-3">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Match Explanations</div>
                      <ul className="space-y-1 text-xs text-[var(--text-primary)]">
                        {rec.match_reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[var(--accent)] font-bold">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Equipment Tags */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Available Infrastructure</div>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.gym.equipment.map((eq, idx) => (
                          <span key={idx} className="rounded-md bg-transparent border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-[var(--text-secondary)] italic pt-2 border-t border-[var(--border)]">
                    Sample Demo Gym Data • Grounded Recommendation Algorithm
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: WEEKLY WORKOUT PLANNER */}
        {activeTab === "planner" && (
          <div className="space-y-6">
            
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Interactive 7-Day Workout Planner</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Dynamically structured for your goal with biomechanical posture & behavioral habit adaptivity.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value="hypertrophy">Hypertrophy (Muscle Gain)</option>
                  <option value="strength">Strength (Power & Heavy Loading)</option>
                  <option value="weight_loss">Weight Loss & HIIT</option>
                  <option value="endurance">Endurance & Conditioning</option>
                  <option value="maintenance">General Maintenance</option>
                </select>

                <button
                  onClick={handleGeneratePlan}
                  disabled={generating}
                  className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[#06121A] hover:opacity-90 transition disabled:opacity-50"
                >
                  {generating ? "Generating..." : "Generate New Plan"}
                </button>
              </div>
            </div>

            {/* Plan Info Banner */}
            {activePlan && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-none space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="rounded-full border border-[var(--accent)]/40 bg-transparent px-3 py-0.5 text-xs font-semibold text-[var(--accent)]">
                      Active Weekly Plan
                    </span>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-1">{activePlan.plan_name}</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Target Split: <strong className="text-[var(--accent)]">{activePlan.target_split}</strong> • <span className="font-mono text-[var(--accent)]">{activePlan.days_per_week}</span> Training Days / Week
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {activePlan.habit_adapted && (
                      <span className="rounded-lg border border-amber-500/40 bg-transparent px-3 py-1 text-xs font-bold text-amber-300">
                        Habit Adapted
                      </span>
                    )}
                    {activePlan.performance_adapted && (
                      <span className="rounded-lg border border-[var(--accent-live)]/40 bg-transparent px-3 py-1 text-xs font-bold text-[var(--accent-live)]">
                        Performance Adapted
                      </span>
                    )}
                  </div>
                </div>

                {activePlan.adaptation_notes && (
                  <div className="text-xs text-[var(--text-primary)] bg-[var(--bg-base)] border border-[var(--border)] p-3 rounded-xl leading-relaxed">
                    💡 <strong>Adaptation Cues:</strong> {activePlan.adaptation_notes}
                  </div>
                )}
              </div>
            )}

            {/* 7-Day Schedule Items */}
            {activePlan?.items && (
              <div className="grid gap-4 md:grid-cols-2">
                {activePlan.items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 space-y-3 shadow-none transition ${
                      item.is_rest_day
                        ? "border-[var(--border)] bg-[var(--bg-surface)]/60"
                        : "border-[var(--border)] bg-[var(--bg-surface)]"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                      <div>
                        <span className="text-xs font-mono font-semibold text-[var(--accent)] uppercase">{item.day_of_week}</span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{item.day_title}</h4>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.is_rest_day
                          ? "border border-[var(--border)] bg-transparent text-[var(--text-secondary)]"
                          : "border border-[var(--accent-live)]/40 bg-transparent text-[var(--accent-live)]"
                      }`}>
                        {item.is_rest_day ? "Rest Day" : "Workout"}
                      </span>
                    </div>

                    {!item.is_rest_day ? (
                      <div className="space-y-3">
                        {item.warmup_notes && (
                          <div className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-base)] border border-[var(--border)] p-2 rounded-lg">
                            ⚡ <strong>Warmup/Technique:</strong> {item.warmup_notes}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Prescribed Exercises</div>
                          {item.exercises.map((ex, idx) => (
                            <div key={idx} className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3 flex flex-col justify-between gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--text-primary)]">{ex.name}</span>
                                <span className="text-xs font-mono font-bold text-[var(--accent)]">{ex.sets} sets × {ex.reps_or_duration}</span>
                              </div>
                              {ex.technique_cue && (
                                <p className="text-[11px] text-[var(--text-secondary)] italic">
                                  Cue: {ex.technique_cue}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-secondary)] italic py-2">
                        Focus on active recovery, hydration, foam rolling, and mobility work.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
