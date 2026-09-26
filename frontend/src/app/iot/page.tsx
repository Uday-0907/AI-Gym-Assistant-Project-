"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/api/config";
import Navbar from "@/components/Navbar";

interface IoTDevice {
  id: number;
  user_id: number;
  device_uid: string;
  device_name: string;
  equipment_category: string;
  status: string;
  is_simulated: boolean;
  current_resistance_kg: number;
  target_resistance_kg: number;
  mac_address?: string;
  firmware_version?: string;
  created_at: string;
  updated_at: string;
}

interface IoTTelemetry {
  id: number;
  device_id: number;
  user_id: number;
  exercise_type: string;
  resistance_kg: number;
  repetition_count: number;
  session_duration_seconds: number;
  intensity_score: number;
  heart_rate_bpm?: number;
  operational_state: string;
  timestamp: string;
}

interface SmartRecommendation {
  recommendation_type: string;
  title: string;
  message: string;
  action_suggested?: string;
  target_device_uid?: string;
  suggested_value?: number;
  confidence_score: number;
}

interface SmartAssistantResponse {
  user_id: number;
  total_active_devices: number;
  recommendations: SmartRecommendation[];
  timestamp: string;
}

export default function SmartGymPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"devices" | "telemetry" | "assistant">("devices");
  
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<IoTTelemetry[]>([]);
  const [assistantData, setAssistantData] = useState<SmartAssistantResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resistanceInput, setResistanceInput] = useState<number>(50);
  const [actionMessage, setActionMessage] = useState("");

  const getAuthToken = () => localStorage.getItem("access_token") || localStorage.getItem("token");

  useEffect(() => {
    fetchInitialIoTData();
  }, []);

  async function fetchInitialIoTData() {
    setLoading(true);
    setError("");
    const token = getAuthToken();
    if (!token) {
      router.push("/login?redirect=/iot");
      return;
    }

    try {
      // 1. Fetch User Devices
      const devRes = await fetch(`${API_BASE_URL}/iot/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (devRes.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        router.push("/login?redirect=/iot");
        return;
      }
      if (!devRes.ok) throw new Error("Failed to load smart gym devices.");
      const devData: IoTDevice[] = await devRes.json();
      setDevices(devData);

      if (devData.length > 0) {
        setSelectedDevice(devData[0]);
        setResistanceInput(devData[0].current_resistance_kg || 50);
        fetchTelemetryForDevice(devData[0].id, token);
      }

      // 2. Fetch Smart Assistant Recommendations
      const assistRes = await fetch(`${API_BASE_URL}/iot/assistant/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (assistRes.ok) {
        const assistJson: SmartAssistantResponse = await assistRes.json();
        setAssistantData(assistJson);
      }
    } catch (err: any) {
      setError(err.message || "IoT Service communication error.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTelemetryForDevice(deviceId: number, token?: string) {
    const authToken = token || getAuthToken();
    if (!authToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/iot/devices/${deviceId}/telemetry?limit=15`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const history: IoTTelemetry[] = await res.json();
        setTelemetryHistory(history);
      }
    } catch (err) {
      console.error("Telemetry fetch error", err);
    }
  }

  async function handleSendResistanceCommand(commandType: string, customVal?: number) {
    if (!selectedDevice) return;
    setActionMessage("");
    const token = getAuthToken();
    if (!token) return;

    const val = customVal !== undefined ? customVal : resistanceInput;

    try {
      const res = await fetch(`${API_BASE_URL}/iot/devices/${selectedDevice.id}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          command_type: commandType,
          target_resistance_kg: val,
          step_increment_kg: 2.5,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || "Command execution failed.");
      }

      const cmdResp = await res.json();
      setActionMessage(`✓ Command '${commandType}' executed! New Resistance: ${cmdResp.target_resistance_kg} kg`);
      
      // Update local state
      const updatedDevices = devices.map((d) =>
        d.id === selectedDevice.id
          ? { ...d, current_resistance_kg: cmdResp.current_resistance_kg, target_resistance_kg: cmdResp.target_resistance_kg }
          : d
      );
      setDevices(updatedDevices);
      setSelectedDevice((prev) => prev ? { ...prev, current_resistance_kg: cmdResp.current_resistance_kg } : null);
    } catch (err: any) {
      setActionMessage(`❌ Error: ${err.message}`);
    }
  }

  async function handleSimulateTelemetryEvent() {
    if (!selectedDevice) return;
    setActionMessage("");
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/iot/simulation/generate/${selectedDevice.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Simulation trigger failed.");
      const newTelem: IoTTelemetry = await res.json();
      
      setActionMessage(`⚡ Simulated Telemetry Event Ingested! Reps: ${newTelem.repetition_count}, Intensity: ${newTelem.intensity_score}%`);
      fetchTelemetryForDevice(selectedDevice.id, token);
    } catch (err: any) {
      setActionMessage(`❌ Error: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-slate-400 text-sm">Synchronizing Smart Gym IoT devices & telemetry...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] p-6">
        <div className="max-w-md rounded-2xl border border-red-900/60 bg-[var(--bg-surface)] p-8 text-center shadow-none">
          <h1 className="text-2xl font-bold text-red-400">IoT Service Error</h1>
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

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Shared Unified Header Navigation */}
        <Navbar
          title="PulseAi"
          subtitle="Smart Gym Equipment Intelligence — Connected equipment telemetry, safe resistance interfaces & real-time intensity heuristics."
        />

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] pb-4">
          <button
            onClick={() => setActiveTab("devices")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition ${
              activeTab === "devices"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            📡 Connected Devices ({devices.length})
          </button>

          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition ${
              activeTab === "telemetry"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            📊 Telemetry Stream ({telemetryHistory.length})
          </button>

          <button
            onClick={() => setActiveTab("assistant")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition ${
              activeTab === "assistant"
                ? "bg-[var(--accent)] text-[#06121A]"
                : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            🤖 Smart Assistant Heuristics ({assistantData?.recommendations.length || 0})
          </button>
        </div>

        {/* TAB 1: CONNECTED DEVICES */}
        {activeTab === "devices" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Device Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>Equipment Inventory</span>
                <span className="text-xs font-normal text-[var(--text-secondary)]">Sample Demo Devices</span>
              </h2>

              <div className="space-y-3">
                {devices.map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => {
                      setSelectedDevice(dev);
                      setResistanceInput(dev.current_resistance_kg);
                      fetchTelemetryForDevice(dev.id);
                    }}
                    className={`w-full text-left rounded-2xl border p-4 transition flex flex-col justify-between ${
                      selectedDevice?.id === dev.id
                        ? "border-[var(--accent)] bg-[var(--bg-surface)] shadow-none"
                        : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-[var(--text-primary)] text-sm">{dev.device_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dev.status === "active"
                          ? "border border-[var(--accent-live)]/40 bg-transparent text-[var(--accent-live)]"
                          : "border border-[var(--border)] bg-transparent text-[var(--text-secondary)]"
                      }`}>
                        {dev.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>Category: <strong className="text-[var(--text-primary)] capitalize">{dev.equipment_category.replace("_", " ")}</strong></span>
                      <span className="font-mono font-semibold text-[var(--accent)]">{dev.current_resistance_kg} kg</span>
                    </div>

                    <div className="mt-2 text-[10px] text-[var(--text-secondary)] italic">
                      UID: {dev.device_uid} • {dev.is_simulated ? "Sample Demo Device" : "Hardware Connected"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Control Interface */}
            {selectedDevice && (
              <div className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-none">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[var(--border)] pb-4 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedDevice.device_name}</h2>
                      <span className="rounded-full border border-[var(--border)] bg-transparent px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                        {selectedDevice.is_simulated ? "Sample Demo IoT Device" : "Real Hardware"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      MQTT Topic: <code className="text-[var(--accent)] font-mono">gym/1/device/{selectedDevice.device_uid}/command</code>
                    </p>
                  </div>

                  <button
                    onClick={handleSimulateTelemetryEvent}
                    className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[#06121A] hover:opacity-90 transition shadow-none"
                  >
                    ⚡ Simulate Telemetry Set
                  </button>
                </div>

                {actionMessage && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3 text-xs font-medium text-[var(--accent)]">
                    {actionMessage}
                  </div>
                )}

                {/* Resistance Control Interface */}
                <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-5">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Equipment Resistance Interface
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">Current Load:</span>
                    <span className="text-2xl font-mono font-extrabold text-[var(--accent)]">{selectedDevice.current_resistance_kg} kg</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-between">
                      <span>Set Target Load (kg):</span>
                      <span className="text-[var(--accent)] font-mono font-bold">{resistanceInput} kg</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="2.5"
                      value={resistanceInput}
                      onChange={(e) => setResistanceInput(parseFloat(e.target.value))}
                      className="w-full accent-[var(--accent)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => handleSendResistanceCommand("set_resistance")}
                      className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-[#06121A] hover:opacity-90 transition"
                    >
                      Apply Target Load
                    </button>

                    <button
                      onClick={() => handleSendResistanceCommand("increase_resistance")}
                      className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition"
                    >
                      + 2.5 kg
                    </button>

                    <button
                      onClick={() => handleSendResistanceCommand("decrease_resistance")}
                      className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition"
                    >
                      - 2.5 kg
                    </button>

                    <button
                      onClick={() => handleSendResistanceCommand("emergency_stop")}
                      className="rounded-lg bg-transparent border border-red-600/60 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/40 transition ml-auto"
                    >
                      🛑 Emergency Stop
                    </button>
                  </div>
                </div>

                {/* Device Telemetry Preview */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Recent Performance Telemetry
                  </h3>

                  {telemetryHistory.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] italic">No telemetry recorded for this equipment yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {telemetryHistory.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded-lg bg-[var(--bg-base)] border border-[var(--border)] p-3 text-xs">
                          <div>
                            <span className="font-semibold text-[var(--text-primary)]">{t.exercise_type}</span>
                            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-mono">
                              Load: {t.resistance_kg}kg • Reps: {t.repetition_count} • HR: {t.heart_rate_bpm ? `${t.heart_rate_bpm} BPM` : "N/A"}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[var(--accent)]">{t.intensity_score}% Intensity</span>
                            <div className="text-[10px] text-[var(--text-secondary)] font-mono">{new Date(t.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TELEMETRY STREAM */}
        {activeTab === "telemetry" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="text-xs text-[var(--text-secondary)]">
                MQTT Payload Schema: <code className="text-[var(--accent)] font-mono">{"{ device_id, resistance_kg, repetition_count, intensity_score, heart_rate_bpm }"}</code>
              </div>
              <span className="text-xs font-bold text-[var(--accent)] border border-[var(--accent)]/40 px-2 py-0.5 rounded-full">Node-RED Compatible</span>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden shadow-none">
              <table className="w-full text-left text-xs text-[var(--text-primary)]">
                <thead className="border-b border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Exercise</th>
                    <th className="p-4">Resistance (kg)</th>
                    <th className="p-4">Reps</th>
                    <th className="p-4">Intensity Score</th>
                    <th className="p-4">Heart Rate</th>
                    <th className="p-4">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {telemetryHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-[var(--text-secondary)] italic">
                        No telemetry logs available. Select an equipment device and trigger a set simulation.
                      </td>
                    </tr>
                  ) : (
                    telemetryHistory.map((t) => (
                      <tr key={t.id} className="hover:bg-[var(--bg-base)]/50 transition">
                        <td className="p-4 text-[var(--text-secondary)] font-mono">{new Date(t.timestamp).toLocaleString()}</td>
                        <td className="p-4 font-semibold text-[var(--text-primary)]">{t.exercise_type}</td>
                        <td className="p-4 font-mono font-bold text-[var(--accent)]">{t.resistance_kg} kg</td>
                        <td className="p-4 font-mono">{t.repetition_count} reps</td>
                        <td className="p-4">
                          <span className="rounded-full border border-[var(--accent)]/40 bg-transparent px-2 py-0.5 text-[11px] font-mono font-bold text-[var(--accent)]">
                            {t.intensity_score}%
                          </span>
                        </td>
                        <td className="p-4 font-mono">{t.heart_rate_bpm ? `❤️ ${t.heart_rate_bpm} BPM` : "—"}</td>
                        <td className="p-4 capitalize text-[var(--text-secondary)]">{t.operational_state}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SMART ASSISTANT HEURISTICS */}
        {activeTab === "assistant" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-none">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>🤖 Smart Gym Assistant Intelligence</span>
                <span className="text-xs font-normal text-[var(--text-secondary)]">Grounded Application Rules</span>
              </h2>

              <p className="text-xs text-[var(--text-secondary)]">
                The Smart Gym Assistant continuously monitors equipment state, set intensity, and heart rate telemetry to suggest safe recovery rest intervals and progressive overload load increases.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {assistantData?.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[var(--text-primary)] text-sm">{rec.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.recommendation_type === "fatigue_alert"
                            ? "border border-red-500/40 bg-transparent text-red-400"
                            : rec.recommendation_type === "rest_interval"
                            ? "border border-amber-500/40 bg-transparent text-amber-300"
                            : "border border-[var(--accent)]/40 bg-transparent text-[var(--accent)]"
                        }`}>
                          {rec.recommendation_type.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{rec.message}</p>
                    </div>

                    {rec.action_suggested && (
                      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[11px] text-[var(--text-secondary)]">Rule Confidence: {(rec.confidence_score * 100).toFixed(0)}%</span>
                        <span className="rounded-md border border-[var(--accent)]/40 bg-transparent px-3 py-1 text-xs font-bold text-[var(--accent)]">
                          {rec.action_suggested}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
