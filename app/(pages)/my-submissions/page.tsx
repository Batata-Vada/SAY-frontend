"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, getErrorMessage } from "@/app/(pages)/settings/(components)/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Mode = "official" | "saved";
type OfficialSubmission = {
  cf_submission_id: number;
  external_id: string | null;
  problem_name: string | null;
  verdict: string | null;
  programming_language: string | null;
  submitted_at: string | null;
};
type SavedSubmission = {
  id: number;
  question_id: number;
  language: string;
  filename: string;
  created_at: string | null;
};
const PAGE_SIZE = 20;

function codeforcesProblemUrl(externalId: string | null): string | null {
  if (!externalId) return null;
  const match = /^(\d+):([A-Za-z][A-Za-z0-9]*)$/.exec(externalId);
  return match
    ? `https://codeforces.com/problemset/problem/${match[1]}/${match[2]}`
    : null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function SubmissionsPage() {
  const [mode, setMode] = useState<Mode>("official");
  const [offset, setOffset] = useState(0);
  const [verdict, setVerdict] = useState("");
  const [language, setLanguage] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [official, setOfficial] = useState<OfficialSubmission[]>([]);
  const [saved, setSaved] = useState<SavedSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (mode === "official" && verdict) params.set("verdict", verdict);
      if (mode === "saved" && language) params.set("language", language);
      if (mode === "saved" && questionId) params.set("question_id", questionId);
      const path = mode === "official" ? "/api/codeforces/submissions" : "/submissions";
      const response = await apiRequest(`${path}?${params}`, { signal });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const body = await response.json();
      if (signal?.aborted) return;
      setTotal(Number(body.total ?? body.pagination?.total ?? 0));
      if (mode === "official") {
        setOfficial(Array.isArray(body.submissions) ? body.submissions : []);
      } else {
        setSaved(Array.isArray(body.submissions) ? body.submissions : []);
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Unable to load submissions.");
      setOfficial([]);
      setSaved([]);
      setTotal(0);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [mode, offset, verdict, language, questionId]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function queueSync() {
    setStatus("");
    setError("");
    try {
      const response = await apiRequest("/api/codeforces/sync", {
        method: "POST",
        body: JSON.stringify({ full: false }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setStatus("Codeforces import queued. A backend sync worker must run before new submissions appear.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not queue Codeforces import.");
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setOffset(0);
    setStatus("");
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-neutral-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-400">SAY / Activity</p>
          <h1 className="mt-3 text-3xl font-semibold">My submissions</h1>
          <p className="mt-2 text-sm text-neutral-400">Official Codeforces results are separate from source files saved by SAY.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant={mode === "official" ? "default" : "outline"} onClick={() => switchMode("official")}>Official Codeforces</Button>
          <Button variant={mode === "saved" ? "default" : "outline"} onClick={() => switchMode("saved")}>Saved SAY code</Button>
          {mode === "official" && <Button variant="outline" onClick={() => void queueSync()}>Queue Codeforces sync</Button>}
          <Button variant="outline" onClick={() => void load()}>Refresh</Button>
        </div>
        {mode === "official" ? (
          <label className="flex items-center gap-3 text-sm text-neutral-400">Verdict
            <select value={verdict} onChange={(e) => { setVerdict(e.target.value); setOffset(0); }} className="rounded border border-neutral-700 bg-neutral-900 p-2 text-white">
              <option value="">All</option>
              <option value="OK">Accepted (OK)</option>
              <option value="WRONG_ANSWER">Wrong answer</option>
              <option value="TIME_LIMIT_EXCEEDED">Time limit exceeded</option>
              <option value="RUNTIME_ERROR">Runtime error</option>
            </select>
          </label>
        ) : (
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-400">Language
              <select value={language} onChange={(e) => { setLanguage(e.target.value); setOffset(0); }} className="rounded border border-neutral-700 bg-neutral-900 p-2 text-white">
                <option value="">All</option><option value="cpp">C++</option><option value="python">Python</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-400">Question ID
              <input type="number" min="1" value={questionId} onChange={(e) => { setQuestionId(e.target.value); setOffset(0); }} className="w-28 rounded border border-neutral-700 bg-neutral-900 p-2 text-white" />
            </label>
          </div>
        )}
        {status && <p role="status" className="text-green-400">{status}</p>}
        {error && <p role="alert" className="text-red-400">{error} {error.includes("login") && <Link href="/login" className="underline">Sign in</Link>}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Problem</TableHead><TableHead>{mode === "official" ? "Verdict" : "Language"}</TableHead>
              <TableHead>{mode === "official" ? "Programming language" : "Saved file"}</TableHead><TableHead>Time</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {mode === "official" ? official.map((s) => {
                const url = codeforcesProblemUrl(s.external_id);
                return <TableRow key={s.cf_submission_id}>
                  <TableCell>#{s.cf_submission_id}</TableCell>
                  <TableCell>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">{s.problem_name || s.external_id}</a> : (s.problem_name || s.external_id || "—")}</TableCell>
                  <TableCell>{s.verdict || "—"}</TableCell><TableCell>{s.programming_language || "—"}</TableCell><TableCell>{formatDate(s.submitted_at)}</TableCell>
                </TableRow>;
              }) : saved.map((s) => <TableRow key={s.id}>
                <TableCell>#{s.id}</TableCell><TableCell>Question {s.question_id}</TableCell><TableCell>{s.language}</TableCell>
                <TableCell className="font-mono text-xs">{s.filename}</TableCell><TableCell>{formatDate(s.created_at)}</TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        </div>
        {loading && <p role="status" className="text-neutral-400">Loading submissions...</p>}
        {!loading && !error && ((mode === "official" ? official : saved).length === 0) && <p className="text-neutral-400">No submissions found.</p>}
        <div className="flex items-center justify-between gap-3 border-t border-neutral-800 pt-5">
          <p className="text-xs text-neutral-500">Showing {total ? offset + 1 : 0}–{Math.min(offset + PAGE_SIZE, total)} of {total}</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={loading || offset === 0} onClick={() => setOffset((n) => Math.max(0, n - PAGE_SIZE))}>Previous</Button>
            <Button variant="outline" disabled={loading || offset + PAGE_SIZE >= total} onClick={() => setOffset((n) => n + PAGE_SIZE)}>Next</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
