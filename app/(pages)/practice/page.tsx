"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, getErrorMessage } from "@/app/(pages)/settings/(components)/api";
import { problems } from "@/lib/problems";
import { Button } from "@/components/ui/button";

type Recommendation = {
  problem_id: number;
  external_id: string;
  title: string;
  url: string;
  rank: number;
  rating: number | null;
  tags: string[];
  candidate_type: "new" | "retry";
  reason?: string;
  explanation?: string;
};

type RecommendationResponse = {
  recommendations: Recommendation[];
  recommendation_engine: "default" | "project_red";
  selection_reason: string;
  difficulty_prediction: { center: number; width: number; lower_bound: number; upper_bound: number } | null;
  experience: { solved_problems: number; rated_contests: number | null };
  returned: number;
  history_sync_status: string;
  notes: string[];
};

type PracticeSession = {
  id: number;
  problem_id: number;
  status: "ACTIVE" | "FINISHED" | "ABANDONED";
  started_at: string;
  duration_seconds: number | null;
  official_solve_verified: boolean;
};

function safeCodeforcesUrl(candidate: string): string | null {
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "https:" && parsed.hostname === "codeforces.com" &&
        (/^\/problemset\/problem\/\d+\/[A-Za-z0-9]+$/.test(parsed.pathname) ||
         /^\/contest\/\d+\/problem\/[A-Za-z0-9]+$/.test(parsed.pathname)) &&
        !parsed.search && !parsed.hash && !parsed.port) return parsed.href;
  } catch {
    return null;
  }
  return null;
}

export default function PracticePage() {
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [mode, setMode] = useState<"new" | "retry" | "mixed">("new");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [sessionBusy, setSessionBusy] = useState<number | null>(null);
  const [sessionMessage, setSessionMessage] = useState("");

  const loadSessions = useCallback(async () => {
    try {
      const response = await apiRequest("/api/me/practice-sessions");
      if (response.ok) {
        const data: { sessions?: PracticeSession[] } = await response.json();
        setSessions(Array.isArray(data.sessions) ? data.sessions : []);
      }
    } catch {
      // Recommendations still work without a practice-session connection.
    }
  }, []);

  const loadRecommendations = useCallback(async (selectedMode: "new" | "retry" | "mixed") => {
    setLoading(true);
    setError("");
    setLoginRequired(false);
    try {
      const response = await apiRequest(
        `/api/recommendations?limit=10&mode=${encodeURIComponent(selectedMode)}`
      );
      if (response.status === 401) {
        setResult(null);
        setLoginRequired(true);
        return;
      }
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const data: RecommendationResponse = await response.json();
      if (!Array.isArray(data.recommendations)) throw new Error("Invalid recommendation response");
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Could not load personalized problems.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecommendations(mode);
    void loadSessions();
  // Only the initial render should initiate the first request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRecommendations, loadSessions]);

  async function handleSession(problemId: number, session?: PracticeSession) {
    setSessionBusy(problemId);
    setSessionMessage("");
    try {
      const path = session
        ? `/api/me/practice-sessions/${session.id}/finish`
        : "/api/me/practice-sessions";
      const response = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(session ? {} : { problem_id: problemId }),
      });
      const data: { message?: string } = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || `Practice request failed (${response.status})`);
      setSessionMessage(session
        ? "Practice session finished. An accepted Codeforces submission must be synchronized before it can be used for ML."
        : "Practice timer started. Solve the problem on Codeforces, then finish the timer here.");
      await loadSessions();
    } catch (err) {
      setSessionMessage(err instanceof Error ? err.message : "Could not update practice session.");
      await loadSessions();
    } finally {
      setSessionBusy(null);
    }
  }

  const activeSession = sessions.find((session) => session.status === "ACTIVE");

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-14 text-neutral-100 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-green-400">SAY / Practice</p>
        <h1 className="mt-4 text-4xl font-semibold">Find your next problem.</h1>
        <p className="mt-4 max-w-2xl text-neutral-400">
          Recommended problems come from your Codeforces history. SAY uses its default
          recommender for newer accounts and Project Red when sufficient verified practice
          history is available.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label htmlFor="recommendation-mode" className="text-sm text-neutral-300">Practice type</label>
          <select
            id="recommendation-mode"
            value={mode}
            onChange={(event) => {
              const next = event.target.value as "new" | "retry" | "mixed";
              setMode(next);
              void loadRecommendations(next);
            }}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          >
            <option value="new">New problems</option>
            <option value="retry">Retry attempts</option>
            <option value="mixed">Mixed practice</option>
          </select>
          <Button type="button" onClick={() => void loadRecommendations(mode)} disabled={loading} className="bg-green-500 text-neutral-950 hover:bg-green-400">
            {loading ? "Finding problems..." : "Refresh recommendations"}
          </Button>
        </div>

        {loginRequired && <p role="status" className="mt-5 text-neutral-300">Please <Link href="/login" className="text-green-400 underline">sign in with Codeforces</Link> to see your recommended problems.</p>}
        {error && <p role="alert" className="mt-5 text-red-400">{error} If your history has not been imported, queue a sync from <Link href="/my-submissions" className="underline">Submissions</Link>.</p>}
        {loading && !result && <p role="status" className="mt-6 text-neutral-400">Loading your recommended problems...</p>}
        {result && (
          <section className="mt-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Recommended Codeforces problems</h2>
              <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                {result.recommendation_engine === "project_red" ? "Project Red" : "SAY recommender"}
              </span>
            </div>
            {result.experience && (
              <p className="mt-3 text-sm text-neutral-400">
                {result.experience.solved_problems} solved problems · {result.experience.rated_contests === null
                  ? "Contest history not yet available"
                  : `${result.experience.rated_contests} rated contests`}
              </p>
            )}
            {result.difficulty_prediction && (
              <p className="mt-2 text-sm text-green-300">
                Suggested difficulty: {result.difficulty_prediction.lower_bound}–{result.difficulty_prediction.upper_bound}
                {" "} (target {result.difficulty_prediction.center})
              </p>
            )}
            {result.recommendation_engine !== "project_red" && (
              <p className="mt-2 text-sm text-neutral-500">
                {result.selection_reason === "new_user"
                  ? "The default recommender is active while you build experience."
                  : result.selection_reason === "timed_official_solves_required"
                    ? "Project Red needs more officially verified timed practice sessions. The default recommender remains active."
                    : "The default recommender is active for your current data."}
              </p>
            )}
            {sessionMessage && <p role="status" className="mt-4 text-sm text-yellow-300">{sessionMessage}</p>}
            {activeSession && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                <p>
                  A practice timer is active for problem #{activeSession.problem_id}.
                  Only verified official solves are used for model features.
                </p>
                <button
                  type="button"
                  onClick={() => void handleSession(activeSession.problem_id, activeSession)}
                  disabled={sessionBusy !== null}
                  className="rounded border border-neutral-700 px-3 py-2 text-neutral-200 hover:border-neutral-500 disabled:opacity-40"
                >
                  {sessionBusy === activeSession.problem_id ? "Saving..." : "Finish active timer"}
                </button>
              </div>
            )}
            {result.recommendations.length === 0 ? (
              <p className="mt-6 text-neutral-400">No eligible problems were found in this practice mode. Try another mode or sync your submissions.</p>
            ) : (
              <div className="mt-5 divide-y divide-neutral-800 border-y border-neutral-800">
                {result.recommendations.map((p) => {
                  const url = safeCodeforcesUrl(p.url);
                  const ownActive = sessions.find((s) => s.problem_id === p.problem_id && s.status === "ACTIVE");
                  return (
                    <article key={`${p.problem_id}-${p.rank}`} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-medium">{p.rank}. {p.title}</h3>
                        <p className="mt-1 text-sm text-neutral-400">
                          {p.external_id} · {p.rating != null ? `Rating ${p.rating}` : "Unrated"} · {p.tags?.slice(0, 3).join(", ") || "No tags"} · {p.candidate_type === "retry" ? "Retry" : "New"}
                        </p>
                        <p className="mt-2 max-w-2xl text-sm text-neutral-500">{p.reason || p.explanation}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => void handleSession(p.problem_id, ownActive)}
                          disabled={sessionBusy !== null || (!ownActive && Boolean(activeSession))}
                          className="rounded border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {sessionBusy === p.problem_id ? "Saving..." : ownActive ? "Finish timer" : "Start timer"}
                        </button>
                        {url ? (
                          <a className="text-sm text-green-400 hover:underline" href={url} target="_blank" rel="noopener noreferrer">
                            Open on Codeforces ↗
                          </a>
                        ) : <span className="text-sm text-neutral-500">URL unavailable</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-xs text-neutral-500">
              The timer measures time between start and finish. It does not judge submitted code.
              Sync accepted Codeforces submissions from your Submissions page to verify completed practice.
            </p>
          </section>
        )}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">SAY workspace examples</h2>
          <p className="mt-3 text-sm text-neutral-400">
            These are local demonstration problems, not Codeforces recommendations.
            The SAY editor saves source code but does not judge it.
          </p>
          <div className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
            {problems.map((p) => (
              <Link href={`/practice/${p.qid}`} key={p.qid} className="flex items-center justify-between py-5 hover:text-green-400">
                <span>{p.number}. {p.title}</span>
                <span className="text-sm text-neutral-500">{p.difficulty} →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
