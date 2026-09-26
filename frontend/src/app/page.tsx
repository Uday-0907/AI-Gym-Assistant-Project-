import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          PulseAi
        </h1>

        <Link
          href="/login"
          className="rounded-lg bg-[var(--accent)] px-5 py-2 font-semibold text-[#06121A] hover:opacity-90 transition shadow-none"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-8 py-24 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
          AI-Powered Fitness
        </p>

        <h2 className="max-w-4xl text-5xl font-bold leading-tight">
          Your Personal
          <span className="text-[var(--accent)]"> PulseAi Assistant</span>
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
          Train smarter with AI-powered workout analysis, personalized
          nutrition, fitness tracking, and intelligent guidance.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[#06121A] hover:opacity-90 transition shadow-none"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-[var(--border)] bg-transparent px-6 py-3 font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition"
          >
            Explore Features
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-6xl gap-6 px-8 pb-20 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            PulseAi Trainer
          </h3>

          <p className="mt-3 text-[var(--text-secondary)]">
            Analyze exercise posture, count repetitions, and receive
            real-time form feedback.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            AI Dietician
          </h3>

          <p className="mt-3 text-[var(--text-secondary)]">
            Get personalized nutrition guidance based on your goals,
            profile, and dietary preferences.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            Fitness Analytics
          </h3>

          <p className="mt-3 text-[var(--text-secondary)]">
            Track workouts, performance, habits, and long-term fitness
            progress.
          </p>
        </div>
      </section>
    </main>
  );
}