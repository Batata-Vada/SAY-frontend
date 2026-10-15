
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Submission = {
    id: number;
    question_id: number;
    language: "cpp" | "python";
    filename: string;
    created_at: string | null;
};

type SubmissionResponse = {
    submissions: Submission[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        returned: number;
    };
    message?: string;
};

const API_URL = "http://127.0.0.1:5001";
const PAGE_SIZE = 20;

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [language, setLanguage] = useState("all");
    const [questionId, setQuestionId] = useState("");
    const [appliedQuestionId, setAppliedQuestionId] = useState("");
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please log in to view your submissions.");
                setSubmissions([]);
                setTotal(0);
                return;
            }

            const params = new URLSearchParams({
                limit: String(PAGE_SIZE),
                offset: String(offset),
            });

            if (language !== "all") {
                params.set("language", language);
            }

            if (appliedQuestionId) {
                params.set("question_id", appliedQuestionId);
            }

            const response = await fetch(
                `${API_URL}/submissions?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: token,
                    },
                    cache: "no-store",
                }
            );

            const data: SubmissionResponse = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load submissions."
                );
            }

            setSubmissions(data.submissions ?? []);
            setTotal(data.pagination?.total ?? 0);
        } catch (err) {
            console.error("Failed to fetch submissions:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not connect to the server."
            );
            setSubmissions([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [language, appliedQuestionId, offset]);

    useEffect(() => {
        void fetchSubmissions();
    }, [fetchSubmissions]);

    function applyFilters() {
        setOffset(0);
        setAppliedQuestionId(questionId.trim());
    }

    function clearFilters() {
        setLanguage("all");
        setQuestionId("");
        setAppliedQuestionId("");
        setOffset(0);
    }

    function formatDate(value: string | null) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    const start = total === 0 ? 0 : offset + 1;
    const end = Math.min(offset + submissions.length, total);

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-neutral-950 px-5 py-10 text-neutral-100 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-green-400">
                            SAY / Activity
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                            Submissions
                        </h1>

                        <p className="mt-2 text-sm text-neutral-500">
                            Review your coding history and revisit your attempts.
                        </p>
                    </div>

                    <div className="text-sm text-neutral-500">
                        <span className="font-mono text-neutral-200">{total}</span>{" "}
                        {total === 1 ? "submission" : "submissions"}
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 border-y border-neutral-800 py-5 sm:flex-row sm:items-center">
                    <div className="w-full sm:w-48">
                        <Select
                            value={language}
                            onValueChange={(value) => {
                                if (value === null) return;
                                setLanguage(value);
                                setOffset(0);
                            }}
                        >
                            <SelectTrigger className="border-neutral-800 bg-neutral-950 text-neutral-200">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All languages</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 sm:ml-auto">
                        <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Question ID"
                            value={questionId}
                            onChange={(event) => setQuestionId(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") applyFilters();
                            }}
                            className="w-full border-neutral-800 bg-neutral-950 text-neutral-100 placeholder:text-neutral-600 sm:w-40"
                        />

                        <Button
                            onClick={applyFilters}
                            className="bg-green-500 text-neutral-950 hover:bg-green-400"
                        >
                            Filter
                        </Button>

                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                <TableHead className="w-24 text-neutral-500">
                                    ID
                                </TableHead>
                                <TableHead className="text-neutral-500">
                                    Question
                                </TableHead>
                                <TableHead className="text-neutral-500">
                                    Language
                                </TableHead>
                                <TableHead className="text-neutral-500">
                                    Source file
                                </TableHead>
                                <TableHead className="text-right text-neutral-500">
                                    Submitted at
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                <TableRow className="border-neutral-800 hover:bg-transparent">
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center text-sm text-neutral-500"
                                    >
                                        Loading submissions...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow className="border-neutral-800 hover:bg-transparent">
                                    <TableCell colSpan={5} className="py-12 text-center">
                                        <p className="text-sm text-red-400">{error}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => void fetchSubmissions()}
                                            className="mt-4 border-neutral-800 bg-transparent"
                                        >
                                            Try again
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ) : submissions.length === 0 ? (
                                <TableRow className="border-neutral-800 hover:bg-transparent">
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center text-sm text-neutral-500"
                                    >
                                        No submissions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((submission) => (
                                    <TableRow
                                        key={submission.id}
                                        className="border-neutral-800 transition-none hover:bg-neutral-900/50"
                                    >
                                        <TableCell className="font-mono text-sm text-neutral-400">
                                            #{submission.id}
                                        </TableCell>

                                        <TableCell>
                                            <span className="font-medium text-neutral-200">
                                                Question {submission.question_id}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <span
                                                className={
                                                    submission.language === "cpp"
                                                        ? "text-green-400"
                                                        : "text-sky-400"
                                                }
                                            >
                                                {submission.language === "cpp" ? "C++" : "Python"}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <code className="whitespace-nowrap text-xs text-neutral-400">
                                                {submission.filename}
                                            </code>
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap text-right text-sm text-neutral-500">
                                            {formatDate(submission.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-5 flex flex-col gap-4 border-t border-neutral-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-neutral-500">
                        Showing {start}–{end} of {total}
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={loading || offset === 0}
                            onClick={() =>
                                setOffset((current) =>
                                    Math.max(0, current - PAGE_SIZE)
                                )
                            }
                            className="border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        >
                            Previous
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={loading || offset + PAGE_SIZE >= total}
                            onClick={() => setOffset((current) => current + PAGE_SIZE)}
                            className="border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
