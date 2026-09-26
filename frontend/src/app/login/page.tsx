
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/api/config";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);

      const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
      router.push(redirectUrl);

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] p-4">

      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-none">

        <h1 className="text-3xl font-bold">
          Login
        </h1>

        <p className="mt-3 text-[var(--text-secondary)]">
          Login to your PulseAi account.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-900/30 border border-red-800/50 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] px-5 py-3 font-semibold text-[#06121A] hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50 shadow-none"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="pt-2 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-semibold text-[var(--accent)] hover:opacity-80 underline">
              Create account
            </a>
          </div>

        </form>
      </div>

    </main>
  );
}

