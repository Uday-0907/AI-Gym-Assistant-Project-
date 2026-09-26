"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/api/config";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setSuccess("Account created successfully! Logging you in...");

      // Automatically log user in after registration
      const loginFormData = new URLSearchParams();
      loginFormData.append("username", email);
      loginFormData.append("password", password);

      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: loginFormData,
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem("access_token", loginData.access_token);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-none">
        <h1 className="text-3xl font-bold">Create Account</h1>

        <p className="mt-3 text-[var(--text-secondary)]">
          Join PulseAi to track workouts, nutrition & performance.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength={6}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength={6}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-900/30 border border-red-800/50 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-[var(--accent-live)]/10 border border-[var(--accent-live)]/40 p-3 text-sm text-[var(--accent-live)]">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] px-5 py-3 font-semibold text-[#06121A] hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50 shadow-none"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="pt-2 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)] hover:opacity-80 underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
