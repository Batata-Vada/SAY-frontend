"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, getErrorMessage } from "@/app/(pages)/settings/(components)/api";

type Author = {
    uid: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
};

type ForumThread = {
    id: number;
    problem_id: number;
    title: string;
    body: string | null;
    spoiler: boolean;
    hidden_spoiler: boolean;
    is_deleted: boolean;
    is_locked: boolean;
    score: number;
    author: Author;
    created_at: string;
    updated_at: string;
};

type ForumReply = {
    id: number;
    thread_id: number;
    parent_id: number | null;
    body: string | null;
    spoiler: boolean;
    hidden_spoiler: boolean;
    is_deleted: boolean;
    author: Author;
    created_at: string;
    updated_at: string;
};

type NestedReply = ForumReply & {
    children: NestedReply[];
};

type ProblemInfo = {
    id: number;
    external_id: string;
    title: string;
};

function buildReplyTree(rows: ForumReply[]): NestedReply[] {
    const nodes = rows.map((reply) => ({
        ...reply,
        children: [],
    })) as NestedReply[];

    const byId = new Map<number, NestedReply>();
    nodes.forEach((node) => byId.set(node.id, node));

    const roots: NestedReply[] = [];

    nodes.forEach((node) => {
        const parent = node.parent_id ? byId.get(node.parent_id) : null;

        if (parent) {
            parent.children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

function formatDate(value: string) {
    return new Date(value).toLocaleString();
}

function authorName(author: Author) {
    return author.display_name?.trim() || author.username;
}

export default function ForumDiscussion({
    problemId,
}: {
    problemId: number;
}) {
    const [problem, setProblem] = useState<ProblemInfo | null>(null);
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loginRequired, setLoginRequired] = useState(false);

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [creating, setCreating] = useState(false);
    const [showComposer, setShowComposer] = useState(false);

    const [expandedThreads, setExpandedThreads] = useState<number[]>([]);
    const [loadedReplies, setLoadedReplies] = useState<number[]>([]);
    const [replies, setReplies] = useState<Record<number, NestedReply[]>>({});
    const [replyLoading, setReplyLoading] = useState<number | null>(null);

    const [replyTarget, setReplyTarget] = useState<{
        threadId: number;
        parentId: number | null;
    } | null>(null);
    const [replyBody, setReplyBody] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    const loadThreads = useCallback(async () => {
        setLoading(true);
        setError("");
        setLoginRequired(false);

        try {
            const response = await apiRequest(
                `/api/problems/${problemId}/forum/threads?limit=50&offset=0`
            );

            if (response.status === 401) {
                setLoginRequired(true);
                setThreads([]);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const data = await response.json();

            setProblem(data.problem);
            setThreads(data.threads ?? []);
            setTotal(data.total ?? 0);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to load discussions."
            );
        } finally {
            setLoading(false);
        }
    }, [problemId]);

    const loadReplies = useCallback(async (threadId: number) => {
        setReplyLoading(threadId);

        try {
            const response = await apiRequest(
                `/api/forum/threads/${threadId}/replies?limit=50&offset=0`
            );

            if (response.status === 401) {
                setLoginRequired(true);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const data = await response.json();

            setReplies((current) => ({
                ...current,
                [threadId]: buildReplyTree(data.replies ?? []),
            }));

            setLoadedReplies((current) =>
                current.includes(threadId) ? current : [...current, threadId]
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to load replies."
            );
        } finally {
            setReplyLoading(null);
        }
    }, []);

    useEffect(() => {
        void loadThreads();
    }, [loadThreads]);

    async function createThread(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (creating) return;

        setCreating(true);
        setError("");

        try {
            const response = await apiRequest(
                `/api/problems/${problemId}/forum/threads`,
                {
                    method: "POST",
                    body: JSON.stringify({ title, body }),
                }
            );

            if (response.status === 401) {
                setLoginRequired(true);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            setTitle("");
            setBody("");
            setShowComposer(false);

            await loadThreads();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to create post."
            );
        } finally {
            setCreating(false);
        }
    }

    async function toggleReplies(threadId: number) {
        if (expandedThreads.includes(threadId)) {
            setExpandedThreads((current) =>
                current.filter((id) => id !== threadId)
            );
            setReplyTarget(null);
            return;
        }

        setExpandedThreads((current) => [...current, threadId]);

        if (!loadedReplies.includes(threadId)) {
            await loadReplies(threadId);
        }
    }

    function openReply(threadId: number, parentId: number | null) {
        setReplyTarget({ threadId, parentId });
        setReplyBody("");

        if (!expandedThreads.includes(threadId)) {
            void toggleReplies(threadId);
        }
    }

    async function createReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!replyTarget || sendingReply) return;

        setSendingReply(true);
        setError("");

        try {
            const response = await apiRequest(
                `/api/forum/threads/${replyTarget.threadId}/replies`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        body: replyBody,
                        parent_id: replyTarget.parentId,
                    }),
                }
            );

            if (response.status === 401) {
                setLoginRequired(true);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            setReplyBody("");
            setReplyTarget(null);

            await loadReplies(replyTarget.threadId);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to send reply."
            );
        } finally {
            setSendingReply(false);
        }
    }

    async function vote(threadId: number, value: 1 | -1) {
        setError("");

        try {
            const response = await apiRequest(
                `/api/forum/threads/${threadId}/vote`,
                {
                    method: "PUT",
                    body: JSON.stringify({ value }),
                }
            );

            if (response.status === 401) {
                setLoginRequired(true);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const data = await response.json();

            setThreads((current) =>
                current.map((thread) =>
                    thread.id === threadId ? data.thread : thread
                )
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to vote."
            );
        }
    }

    function replyComposer() {
        return (
            <form
                onSubmit={createReply}
                className="mt-3 space-y-3 border border-neutral-800 bg-neutral-900 p-4"
            >
                <textarea
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder="Write your reply..."
                    maxLength={10000}
                    required
                    rows={3}
                    className="w-full resize-y bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
                />
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setReplyTarget(null)}
                        className="text-sm text-neutral-500 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={sendingReply || !replyBody.trim()}
                        className="bg-green-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-green-400 disabled:opacity-50"
                    >
                        {sendingReply ? "Sending..." : "Reply"}
                    </button>
                </div>
            </form>
        );
    }

    function renderReply(
        reply: NestedReply,
        threadId: number,
        depth = 0
    ): ReactNode {
        const isReplying =
            replyTarget?.threadId === threadId &&
            replyTarget.parentId === reply.id;

        return (
            <div
                key={reply.id}
                className="border-l border-neutral-800 pl-4"
                style={{ marginLeft: `${Math.min(depth, 4) * 12}px` }}
            >
                <div className="py-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-medium text-neutral-200">
                            {authorName(reply.author)}
                        </span>
                        <span className="text-neutral-600">
                            {formatDate(reply.created_at)}
                        </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-400">
                        {reply.is_deleted
                            ? "This reply has been deleted."
                            : reply.hidden_spoiler
                                ? "This reply contains a hidden spoiler."
                                : reply.body}
                    </p>

                    {!reply.is_deleted && (
                        <button
                            type="button"
                            onClick={() => openReply(threadId, reply.id)}
                            className="mt-2 text-xs text-green-400 hover:text-green-300"
                        >
                            Reply
                        </button>
                    )}

                    {isReplying && replyComposer()}
                </div>

                {reply.children.map((child) =>
                    renderReply(child, threadId, depth + 1)
                )}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 px-5 py-12 text-neutral-100 sm:px-8">
            <div className="mx-auto max-w-4xl">
                <Link
                    href="/practice"
                    className="text-sm text-neutral-500 hover:text-white"
                >
                    ← Back to Practice
                </Link>

                <header className="mt-8 border-b border-neutral-800 pb-6">
                    <p className="text-xs uppercase tracking-widest text-green-400">
                        SAY / Discussions
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                        {problem?.title ?? "Problem discussion"}
                    </h1>

                    {problem && (
                        <p className="mt-2 text-sm text-neutral-500">
                            {problem.external_id} · {total} discussion posts
                        </p>
                    )}
                </header>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">Discussions</h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Share ideas, ask questions, and discuss approaches.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowComposer((current) => !current)}
                        className="bg-green-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-green-400"
                    >
                        {showComposer ? "Cancel" : "Create post"}
                    </button>
                </div>

                {showComposer && (
                    <form
                        onSubmit={createThread}
                        className="mt-6 space-y-4 border border-neutral-800 bg-neutral-900/50 p-5"
                    >
                        <div>
                            <label htmlFor="post-title" className="mb-2 block text-sm text-neutral-300">
                                Title
                            </label>
                            <input
                                id="post-title"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                minLength={3}
                                maxLength={160}
                                required
                                placeholder="What would you like to discuss?"
                                className="w-full border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm outline-none focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="post-body" className="mb-2 block text-sm text-neutral-300">
                                Content
                            </label>
                            <textarea
                                id="post-body"
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                maxLength={10000}
                                required
                                rows={6}
                                placeholder="Share your question, approach, or insight..."
                                className="w-full resize-y border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm leading-6 outline-none focus:border-green-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={creating || !title.trim() || !body.trim()}
                                className="bg-green-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-green-400 disabled:opacity-50"
                            >
                                {creating ? "Publishing..." : "Publish post"}
                            </button>
                        </div>
                    </form>
                )}

                {loginRequired && (
                    <p role="status" className="mt-8 text-sm text-neutral-400">
                        Sign in with <Link href="/login" className="text-green-400 underline">Codeforces</Link> to view and participate in discussions.
                    </p>
                )}

                {error && (
                    <p role="alert" className="mt-5 text-sm text-red-400">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p role="status" className="mt-8 text-sm text-neutral-500">
                        Loading discussions...
                    </p>
                ) : !loginRequired && threads.length === 0 ? (
                    <div className="mt-8 border-y border-neutral-800 py-12 text-center">
                        <h3 className="font-medium">No discussions yet</h3>
                        <p className="mt-2 text-sm text-neutral-500">
                            Start the first discussion for this problem.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 divide-y divide-neutral-800 border-y border-neutral-800">
                        {threads.map((thread) => {
                            const expanded = expandedThreads.includes(thread.id);
                            const targetIsTopLevel =
                                replyTarget?.threadId === thread.id &&
                                replyTarget.parentId === null;

                            return (
                                <article key={thread.id} className="py-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold">
                                                {thread.title}
                                            </h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                                                <span className="text-neutral-300">
                                                    {authorName(thread.author)}
                                                </span>
                                                <span>·</span>
                                                <span>{formatDate(thread.created_at)}</span>
                                                {thread.is_locked && (
                                                    <span className="border border-yellow-700/50 px-2 py-0.5 text-yellow-400">
                                                        Locked
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => void vote(thread.id, 1)}
                                                    aria-label="Upvote post"
                                                    className="text-neutral-500 hover:text-green-400"
                                                >
                                                    ▲
                                                </button>
                                                <span className="text-sm tabular-nums text-neutral-300">
                                                    {thread.score}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => void vote(thread.id, -1)}
                                                    aria-label="Downvote post"
                                                    className="text-neutral-500 hover:text-red-400"
                                                >
                                                    ▼
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-400">
                                        {thread.is_deleted
                                            ? "This post has been deleted."
                                            : thread.hidden_spoiler
                                                ? "This post contains a hidden spoiler."
                                                : thread.body}
                                    </p>

                                    <div className="mt-5 flex flex-wrap items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => void toggleReplies(thread.id)}
                                            className="text-sm text-green-400 hover:text-green-300"
                                        >
                                            {expanded ? "Hide replies" : "View replies"}
                                        </button>

                                        {!thread.is_locked && !thread.is_deleted && (
                                            <button
                                                type="button"
                                                onClick={() => openReply(thread.id, null)}
                                                className="text-sm text-neutral-400 hover:text-white"
                                            >
                                                Reply to post
                                            </button>
                                        )}
                                    </div>

                                    {targetIsTopLevel && replyComposer()}

                                    {expanded && (
                                        <section className="mt-5 border-t border-neutral-800 pt-3">
                                            {replyLoading === thread.id ? (
                                                <p className="py-4 text-sm text-neutral-500">
                                                    Loading replies...
                                                </p>
                                            ) : (
                                                <>
                                                    {(replies[thread.id] ?? []).length === 0 ? (
                                                        <p className="py-4 text-sm text-neutral-500">
                                                            No replies yet.
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {(replies[thread.id] ?? []).map((reply) =>
                                                                renderReply(reply, thread.id)
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </section>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}

                {!loading && total > threads.length && (
                    <p className="mt-4 text-center text-xs text-neutral-500">
                        Showing the first {threads.length} of {total} discussions.
                    </p>
                )}
            </div>
        </main>
    );
}