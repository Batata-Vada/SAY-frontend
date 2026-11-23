"use client";

import { useState } from "react";
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
  reason?: string;
  explanation?: string;
};

function safeCodeforcesUrl(candidate: string): string | null {
  try {
    const url = new URL(candidate);
    if (url.protocol === "https:" && url.hostname === "codeforces.com") return url.href;
  } catch { /* No valid URL */ }
  return null;
}

export default function PracticePage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  async function loadRecommendations() {
    setLoading(true);
    setError("");
    setLoginRequired(false);
    try {
      // Intentionally initiated by a click: this GET also creates a recommendation audit log.
      const response = await apiRequest("/api/recommendations?limit=10&mode=new");
      if (response.status === 401) {
        setLoginRequired(true);
        return;
      }
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const data = await response.json();
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load personalized problems.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-14 text-neutral-100 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-green-400">SAY / Practice</p>
        <h1 className="mt-4 text-4xl font-semibold">Find your next problem.</h1>
        <p className="mt-4 max-w-2xl text-neutral-400">Personalized recommendations use your verified Codeforces activity. Open problems on Codeforces to submit for official judging.</p>
        <Button type="button" onClick={() => void loadRecommendations()} disabled={loading} className="mt-6 bg-green-500 text-neutral-950 hover:bg-green-400">
          {loading ? "Finding problems..." : "Get personalized recommendations"}
        </Button>
        {loginRequired && <p role="status" className="mt-4 text-neutral-300">Please <Link href="/login" className="text-green-400 underline">sign in with Codeforces</Link> to get recommendations.</p>}
        {error && <p role="alert" className="mt-4 text-red-400">{error} If your history has not been imported, queue a sync from <Link href="/my-submissions" className="underline">Submissions</Link>.</p>}
        {recommendations.length > 0 && (
          <section className="mt-9">
            <h2 className="mb-4 text-2xl font-semibold">Recommended Codeforces problems</h2>
            <div className="divide-y divide-neutral-800 border-y border-neutral-800">
              {recommendations.map((p) => {
                const url = safeCodeforcesUrl(p.url);
                return <div key={`${p.problem_id}-${p.rank}`} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-medium">{p.rank}. {p.title}</h3>
                    <p className="mt-1 text-sm text-neutral-400">{p.external_id} · {p.rating ? `Rating ${p.rating}` : "Unrated"} · {p.tags?.slice(0, 3).join(", ")}</p>
                    <p className="mt-1 text-sm text-neutral-500">{p.reason || p.explanation}</p>
                  </div>
                  {url ? <a className="shrink-0 text-green-400 hover:underline" href={url} target="_blank" rel="noopener noreferrer">Open on Codeforces ↗</a> : <span className="text-neutral-500">URL unavailable</span>}
                </div>;
              })}
            </div>
          </section>
        )}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">SAY workspace examples</h2>
          <p className="mt-3 text-sm text-neutral-400">These are local demonstration problems, not Codeforces recommendations. The SAY editor saves your source code but does not judge it.</p>
          <div className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
            {problems.map((p) => <Link href={`/practice/${p.qid}`} key={p.qid} className="flex items-center justify-between py-5 hover:text-green-400">
              <span>{p.number}. {p.title}</span><span className="text-sm text-neutral-500">{p.difficulty} →</span>
            </Link>)}
          </div>
        </section>
      </div>
    </main>
  );
}
