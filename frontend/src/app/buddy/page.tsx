"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/api/config";
import Navbar from "@/components/Navbar";

interface BuddyMessageItem {
  id: number;
  sender: string;
  content: string;
  provider?: string | null;
  created_at: string;
}

interface ContextSummary {
  profile?: {
    fitness_goal?: string;
    activity_level?: string;
    height_cm?: number;
    weight_kg?: number;
  };
  workout_performance?: {
    total_workouts?: number;
    avg_performance_score?: number;
    top_exercise?: string;
    next_week_focus?: string;
  };
  nutrition?: {
    target_calories?: number;
    consumed_calories_today?: number;
    remaining_calories_today?: number;
    target_protein?: number;
    consumed_protein_today?: number;
  };
}

export default function VirtualGymBuddyPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<BuddyMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");
  const [contextSummary, setContextSummary] = useState<ContextSummary | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function loadHistory() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/buddy/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setInitLoading(false);
      }
    }

    loadHistory();
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg || loading) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setInputText("");
    setLoading(true);

    // Optimistic local add
    const tempUserMsg: BuddyMessageItem = {
      id: new Date().getTime(),
      sender: "user",
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`${API_BASE_URL}/buddy/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: msg, include_history: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to communicate with Virtual Gym Buddy");
      }

      const tempBotMsg: BuddyMessageItem = {
        id: new Date().getTime() + 1,
        sender: "assistant",
        content: data.message,
        provider: data.provider,
        created_at: data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempBotMsg]);

      if (data.context_summary) {
        setContextSummary(data.context_summary);
      }
    } catch (err: any) {
      setError(err.message || "Network error while connecting to Virtual Gym Buddy");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (!confirm("Are you sure you want to clear all Virtual Gym Buddy chat history?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/buddy/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to clear chat history", err);
    }
  };

  const quickPrompts = [
    { emoji: "📊", label: "How did I perform this week?", text: "How did I perform this week?" },
    { emoji: "🎯", label: "What should I focus on next?", text: "What should I focus on in my next workout?" },
    { emoji: "🥗", label: "How is my nutrition today?", text: "How am I doing with my nutrition today?" },
    { emoji: "🔥", label: "Give me workout motivation!", text: "Give me some motivation for today's workout." },
  ];

  const getProviderBadge = (provider?: string | null) => {
    if (!provider) return null;
    if (provider.includes("gemini")) {
      return <span className="rounded border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">⚡ Gemini AI</span>;
    }
    if (provider.includes("openai")) {
      return <span className="rounded border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">✨ OpenAI</span>;
    }
    if (provider.includes("safety")) {
      return <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">🛡️ Medical Safety Boundary</span>;
    }
    return <span className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">🤖 Deterministic Engine</span>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
      <Navbar
        title="PulseAi"
        subtitle="Virtual Gym Buddy — Authenticated AI Fitness & Nutrition Assistant"
      />

      {/* Main Content Area */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-4 md:p-6">
        {/* Chat Stream Window */}
        <div className="flex flex-1 flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-none overflow-hidden">
          {/* Quick Action Chips Bar */}
          <div className="border-b border-[var(--border)] bg-[var(--bg-surface)] p-3 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-[var(--text-secondary)] mr-1">Quick Prompts:</span>
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  disabled={loading}
                  onClick={() => handleSendMessage(qp.text)}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition disabled:opacity-50"
                >
                  <span>{qp.emoji}</span>
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleClearHistory}
              className="text-xs text-[var(--text-secondary)] hover:text-rose-400 transition px-2 py-1"
            >
              Clear Chat
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-[420px]">
            {initLoading ? (
              <div className="flex h-full items-center justify-center text-[var(--text-secondary)] text-sm">
                Loading Virtual Gym Buddy conversation history...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-secondary)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-base)] border border-[var(--border)] text-3xl mb-4">
                  💬
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">No Messages Yet</h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-md">
                  Ask me anything about your weekly workout performance, squat form, daily nutrition, or workout motivation!
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--text-secondary)] font-medium">{isUser ? "You" : "Virtual Gym Buddy"}</span>
                      {!isUser && getProviderBadge(m.provider)}
                    </div>

                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-[var(--accent)] text-[#06121A] rounded-tr-none font-medium shadow-none"
                          : "bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-none shadow-none"
                      }`}
                    >
                      {m.content}
                    </div>

                    {!isUser && (
                      <span className="mt-1 text-[10px] text-[var(--text-secondary)]">
                        Fitness Assistant • Scoped to current authenticated context
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">Virtual Gym Buddy</span>
                  <span className="rounded border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-xs text-[var(--accent)] animate-pulse">Thinking...</span>
                </div>
                <div className="rounded-2xl rounded-tl-none bg-[var(--bg-base)] p-4 border border-[var(--border)] text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--accent)] animate-ping" />
                  Analyzing your profile, weekly workouts, and nutrition logs...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-6 mb-3 rounded-lg border border-red-900/80 bg-red-950/60 p-3 text-xs text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* Message Input Box */}
          <div className="border-t border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Virtual Gym Buddy (e.g., 'How was my squat form this week?')"
                disabled={loading}
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#06121A] hover:opacity-90 transition disabled:opacity-50 shadow-none"
              >
                Send 🚀
              </button>
            </form>
            <p className="mt-2 text-[11px] text-center text-[var(--text-secondary)]">
              Virtual Gym Buddy uses your real logged data to provide personalized coaching answers.
            </p>
          </div>
        </div>

        {/* Right Sidebar: Context Snapshot */}
        <aside className="hidden lg:flex w-80 flex-col gap-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-none">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🎯</span> Active User Context
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Live context supplied to Virtual Gym Buddy for personalized answers.
            </p>

            {contextSummary ? (
              <div className="mt-4 space-y-4 text-xs">
                {/* Profile Block */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3">
                  <h4 className="font-semibold text-[var(--accent)] mb-1">User Profile</h4>
                  <div className="space-y-0.5 text-[var(--text-secondary)]">
                    <p>Goal: <span className="font-medium text-[var(--text-primary)]">{contextSummary.profile?.fitness_goal || "Not set"}</span></p>
                    <p>Activity: <span className="font-medium text-[var(--text-primary)]">{contextSummary.profile?.activity_level || "Not set"}</span></p>
                  </div>
                </div>

                {/* Workout Block */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3">
                  <h4 className="font-semibold text-[var(--accent-live)] mb-1">7-Day Workout Performance</h4>
                  <div className="space-y-0.5 text-[var(--text-secondary)]">
                    <p>Workouts Logged: <span className="font-medium text-[var(--text-primary)]">{contextSummary.workout_performance?.total_workouts ?? 0}</span></p>
                    <p>Avg Score: <span className="font-medium text-[var(--text-primary)]">{contextSummary.workout_performance?.avg_performance_score ?? "N/A"}/100</span></p>
                    <p>Next Focus: <span className="font-medium text-[var(--text-primary)]">{contextSummary.workout_performance?.next_week_focus || "Consistency"}</span></p>
                  </div>
                </div>

                {/* Nutrition Block */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3">
                  <h4 className="font-semibold text-[var(--accent-live)] mb-1">Today&apos;s Nutrition</h4>
                  <div className="space-y-0.5 text-[var(--text-secondary)]">
                    <p>Target Cals: <span className="font-medium text-[var(--text-primary)]">{contextSummary.nutrition?.target_calories ?? "N/A"} kcal</span></p>
                    <p>Consumed: <span className="font-medium text-[var(--text-primary)]">{contextSummary.nutrition?.consumed_calories_today ?? 0} kcal</span></p>
                    <p>Protein Target: <span className="font-medium text-[var(--text-primary)]">{contextSummary.nutrition?.target_protein ?? "N/A"}g</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 text-xs text-[var(--text-secondary)] text-center">
                Send a message to view the exact snapshot of data Virtual Gym Buddy retrieved.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-xs text-[var(--text-secondary)] leading-relaxed shadow-none">
            <span className="font-bold text-[var(--accent)] block mb-1">🛡️ Safety Disclaimer</span>
            Virtual Gym Buddy is designed for fitness, form coaching, and wellness guidance. It does not provide medical diagnoses or treatment for injuries.
          </div>
        </aside>
      </div>
    </div>
  );
}
