"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, getErrorMessage } from "@/app/(pages)/settings/(components)/api";

type Category = "GENERAL" | "QUESTION" | "SUGGESTION" | "BUG_REPORT";
type CategoryFilter = Category | "ALL";

type Author = {
    uid: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
};

type DiscussionPost = {
    id: number;
    title: string;
    body: string | null;
    category: Category;
    is_deleted: boolean;
    is_locked: boolean;
    reply_count: number;
    author: Author;
    created_at: string;
    updated_at: string;
};

type DiscussionReply = {
    id: number;
    post_id: number;
    parent_id: number | null;
    body: string | null;
    is_deleted: boolean;
    author: Author;
    created_at: string;
    updated_at: string;
};

type NestedReply = DiscussionReply & {
    children: NestedReply[];
};

type Session = {
    uid: number;
    say_username: string;
    privilege: string;
};

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
    { value: "ALL", label: "All discussions" },
    { value: "GENERAL", label: "General" },
    { value: "QUESTION", label: "Questions" },
    { value: "SUGGESTION", label: "Suggestions" },
    { value: "BUG_REPORT", label: "Bug reports" },
];

function buildReplyTree(rows: DiscussionReply[]): NestedReply[] {
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
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "Unknown date"
        : date.toLocaleString();
}

function authorName(author: Author) {
    return author.display_name?.trim() || author.username;
}

function categoryLabel(category: Category) {
    return CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

export default function DiscussionsPage() {
    const [posts, setPosts] = useState<DiscussionPost[]>([]);
    const [total, setTotal] = useState(0);

    const [category, setCategory] = useState<CategoryFilter>("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loginRequired, setLoginRequired] = useState(false);

    const [session, setSession] = useState<Session | null>(null);

    const [showComposer, setShowComposer] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [newCategory, setNewCategory] = useState<Category>("GENERAL");
    const [creating, setCreating] = useState(false);

    const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
    const [loadedReplies, setLoadedReplies] = useState<number[]>([]);
    const [replies, setReplies] = useState<Record<number, NestedReply[]>>({});
    const [replyLoading, setReplyLoading] = useState<number | null>(null);

    const [replyTarget, setReplyTarget] = useState<{
        postId: number;
        parentId: number | null;
    } | null>(null);

    const [replyBody, setReplyBody] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    const [editingPost, setEditingPost] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editBody, setEditBody] = useState("");
    const [editCategory, setEditCategory] = useState<Category>("GENERAL");
    const [savingEdit, setSavingEdit] = useState(false);

    const [editingReply, setEditingReply] = useState<number | null>(null);
    const [editReplyBody, setEditReplyBody] = useState("");
    const [savingReplyEdit, setSavingReplyEdit] = useState(false);

    const isAdmin = session?.privilege === "admin";

    const canModify = (uid: number) => (
        session?.uid === uid || isAdmin
    );

    const loadSession = useCallback(async () => {
        try {
            const response = await apiRequest("/auth/session");

            if (response.ok) {
                setSession(await response.json());
            } else if (response.status === 401) {
                setSession(null);
                setLoginRequired(true);
            }
        } catch {
            // The post request will report connection errors.
        }
    }, []);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                limit: "50",
                offset: "0",
            });

            if (category !== "ALL") {
                params.set("category", category);
            }

            const response = await apiRequest(
                `/api/discussions?${params.toString()}`
            );

            if (response.status === 401) {
                setLoginRequired(true);
                setPosts([]);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const data = await response.json();

            setPosts(data.posts ?? []);
            setTotal(data.total ?? 0);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load discussions."
            );
        } finally {
            setLoading(false);
        }
    }, [category]);

    const loadReplies = useCallback(async (postId: number) => {
        setReplyLoading(postId);

        try {
            const response = await apiRequest(
                `/api/discussions/${postId}/replies?limit=50&offset=0`
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
                [postId]: buildReplyTree(data.replies ?? []),
            }));

            setLoadedReplies((current) =>
                current.includes(postId)
                    ? current
                    : [...current, postId]
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load replies."
            );
        } finally {
            setReplyLoading(null);
        }
    }, []);

    useEffect(() => {
        void loadSession();
    }, [loadSession]);

    useEffect(() => {
        setExpandedPosts([]);
        setLoadedReplies([]);
        setReplies({});
        void loadPosts();
    }, [loadPosts]);

    async function createPost(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (creating) return;

        setCreating(true);
        setError("");

        try {
            const response = await apiRequest("/api/discussions", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    body,
                    category: newCategory,
                }),
            });

            if (response.status === 401) {
                setLoginRequired(true);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const data = await response.json();

            if (category === "ALL" || category === newCategory) {
                setPosts((current) => [data.post, ...current]);
                setTotal((current) => current + 1);
            }

            setTitle("");
            setBody("");
            setNewCategory("GENERAL");
            setShowComposer(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to create post."
            );
        } finally {
            setCreating(false);
        }
    }

    async function toggleReplies(postId: number) {
        if (expandedPosts.includes(postId)) {
            setExpandedPosts((current) =>
                current.filter((id) => id !== postId)
            );

            setReplyTarget(null);
            return;
        }

        setExpandedPosts((current) => [...current, postId]);

        if (!loadedReplies.includes(postId)) {
            await loadReplies(postId);
        }
    }

    function openReply(postId: number, parentId: number | null) {
        setReplyTarget({ postId, parentId });
        setReplyBody("");

        if (!expandedPosts.includes(postId)) {
            setExpandedPosts((current) => [...current, postId]);
        }

        if (!loadedReplies.includes(postId)) {
            void loadReplies(postId);
        }
    }

    async function createReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!replyTarget || sendingReply) return;

        setSendingReply(true);
        setError("");

        try {
            const response = await apiRequest(
                `/api/discussions/${replyTarget.postId}/replies`,
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

            const postId = replyTarget.postId;

            setReplyBody("");
            setReplyTarget(null);

            setPosts((current) =>
                current.map((post) =>
                    post.id === postId
                        ? { ...post, reply_count: post.reply_count + 1 }
                        : post
                )
            );

            await loadReplies(postId);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to send reply."
            );
        } finally {
            setSendingReply(false);
        }
    }

    function startPostEdit(post: DiscussionPost) {
        setEditingPost(post.id);
        setEditTitle(post.title);
        setEditBody(post.body ?? "");
        setEditCategory(post.category);
    }

    async function savePostEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (editingPost === null || savingEdit) return;

        setSavingEdit(true);
        setError("");

        try {
            const response = await apiRequest(
                `/api/discussions/${editingPost}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        title: editTitle,
                        body: editBody,
                        category: editCategory,
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

            const data = await response.json();

            setPosts((current) =>
                current.map((post) =>
                    post.id === editingPost ? data.post : post
                )
            );

            setEditingPost(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to update post."
            );
        } finally {
            setSavingEdit(false);
        }
    }

    async function deletePost(postId: number) {
        if (!window.confirm("Delete this discussion?")) return;

        setError("");

        try {
            const response = await apiRequest(
                `/api/discussions/${postId}`,
                { method: "DELETE" }
            );

            if (response.status === 401) {
                setLoginRequired(true);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            setPosts((current) =>
                current.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            title: "[Deleted post]",
                            body: null,
                            is_deleted: true,
                        }
                        : post
                )
            );

            setEditingPost(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to delete post."
            );
        }
    }

    async function saveReplyEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (editingReply === null || savingReplyEdit) return;

        setSavingReplyEdit(true);
        setError("");

        try {
            const response = await apiRequest(
                `/api/discussions/replies/${editingReply}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ body: editReplyBody }),
                }
            );

            if (response.status === 401) {
                setLoginRequired(true);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const updated = await response.json();
            const postId = updated.reply.post_id;

            setEditingReply(null);
            setEditReplyBody("");

            await loadReplies(postId);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to edit reply."
            );
        } finally {
            setSavingReplyEdit(false);
        }
    }

    async function deleteReply(reply: DiscussionReply) {
        if (!window.confirm("Delete this reply?")) return;

        setError("");

        try {
            const response = await apiRequest(
                `/api/discussions/replies/${reply.id}`,
                { method: "DELETE" }
            );

            if (response.status === 401) {
                setLoginRequired(true);
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            setEditingReply(null);

            setPosts((current) =>
                current.map((post) =>
                    post.id === reply.post_id
                        ? {
                            ...post,
                            reply_count: Math.max(0, post.reply_count - 1),
                        }
                        : post
                )
            );

            await loadReplies(reply.post_id);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to delete reply."
            );
        }
    }

    function renderReplyComposer(postId: number, parentId: number | null) {
        const isOpen =
            replyTarget?.postId === postId &&
            replyTarget.parentId === parentId;

        if (!isOpen) return null;

        return (
            <form
                onSubmit={createReply}
                className="mt-4 space-y-3 border border-neutral-800 bg-neutral-900 p-4"
            >
                <textarea
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder="Write your reply..."
                    rows={3}
                    maxLength={10000}
                    required
                    className="w-full resize-y bg-transparent text-sm leading-6 text-neutral-200 outline-none placeholder:text-neutral-600"
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

    function renderReply(reply: NestedReply, post: DiscussionPost, depth = 0): ReactNode {
        const isEditing = editingReply === reply.id;

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
                            · {formatDate(reply.created_at)}
                        </span>
                    </div>

                    {isEditing ? (
                        <form onSubmit={saveReplyEdit} className="mt-3 space-y-3">
                            <textarea
                                value={editReplyBody}
                                onChange={(event) => setEditReplyBody(event.target.value)}
                                rows={3}
                                maxLength={10000}
                                required
                                className="w-full border border-neutral-800 bg-neutral-900 p-3 text-sm outline-none focus:border-green-500"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingReply(null)}
                                    className="text-xs text-neutral-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingReplyEdit || !editReplyBody.trim()}
                                    className="text-xs font-medium text-green-400 disabled:opacity-50"
                                >
                                    {savingReplyEdit ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-400">
                            {reply.is_deleted
                                ? "This reply has been deleted."
                                : reply.body}
                        </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        {!reply.is_deleted && (
                            <button
                                type="button"
                                onClick={() => openReply(post.id, reply.id)}
                                className="text-xs text-green-400 hover:text-green-300"
                            >
                                Reply
                            </button>
                        )}

                        {!reply.is_deleted && canModify(reply.author.uid) && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingReply(reply.id);
                                        setEditReplyBody(reply.body ?? "");
                                    }}
                                    className="text-xs text-neutral-500 hover:text-white"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void deleteReply(reply)}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>

                    {renderReplyComposer(post.id, reply.id)}
                </div>

                {reply.children.map((child) =>
                    renderReply(child, post, depth + 1)
                )}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 px-5 py-12 text-neutral-100 sm:px-8">
            <div className="mx-auto max-w-5xl">

                <header className="mb-10">
                    <p className="text-xs uppercase tracking-widest text-green-400">
                        SAY / Community
                    </p>

                    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Discussions
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400">
                                Ask questions, share ideas, suggest improvements, and
                                discuss anything about the SAY community.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowComposer((current) => !current)}
                            className="bg-green-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-green-400"
                        >
                            {showComposer ? "Cancel" : "Create discussion"}
                        </button>
                    </div>
                </header>

                {showComposer && (
                    <form
                        onSubmit={createPost}
                        className="mb-8 space-y-4 border border-neutral-800 bg-neutral-900/40 p-5 sm:p-6"
                    >
                        <h2 className="text-lg font-semibold">Start a discussion</h2>

                        <div>
                            <label htmlFor="post-title" className="mb-2 block text-sm text-neutral-300">
                                Title
                            </label>
                            <input
                                id="post-title"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="What would you like to discuss?"
                                minLength={3}
                                maxLength={160}
                                required
                                className="w-full border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm outline-none focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="post-category" className="mb-2 block text-sm text-neutral-300">
                                Category
                            </label>
                            <select
                                id="post-category"
                                value={newCategory}
                                onChange={(event) => setNewCategory(event.target.value as Category)}
                                className="w-full border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm outline-none focus:border-green-500"
                            >
                                {CATEGORIES.filter((item) => item.value !== "ALL").map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="post-body" className="mb-2 block text-sm text-neutral-300">
                                Description
                            </label>
                            <textarea
                                id="post-body"
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                placeholder="Share your thoughts..."
                                rows={6}
                                maxLength={10000}
                                required
                                className="w-full resize-y border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm leading-6 outline-none focus:border-green-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={creating || !title.trim() || !body.trim()}
                                className="bg-green-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {creating ? "Publishing..." : "Publish discussion"}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setCategory(item.value)}
                                className={`px-3 py-2 text-xs transition-colors ${category === item.value
                                        ? "bg-green-500 text-neutral-950"
                                        : "border border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <span className="text-xs text-neutral-500">
                        {total} {total === 1 ? "discussion" : "discussions"}
                    </span>
                </div>

                {loginRequired && (
                    <div className="border border-neutral-800 p-6 text-center">
                        <p className="text-neutral-300">
                            Sign in with Codeforces to participate in SAY discussions.
                        </p>
                        <Link
                            href="/login"
                            className="mt-4 inline-block text-sm text-green-400 hover:underline"
                        >
                            Sign in →
                        </Link>
                    </div>
                )}

                {error && (
                    <p role="alert" className="mb-5 text-sm text-red-400">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p role="status" className="py-12 text-center text-sm text-neutral-500">
                        Loading discussions...
                    </p>
                ) : !loginRequired && posts.length === 0 ? (
                    <div className="border-y border-neutral-800 py-16 text-center">
                        <h2 className="text-lg font-medium">No discussions yet</h2>
                        <p className="mt-2 text-sm text-neutral-500">
                            Start the first conversation in the SAY community.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-800 border-y border-neutral-800">
                        {posts.map((post) => {
                            const expanded = expandedPosts.includes(post.id);
                            const isEditing = editingPost === post.id;
                            const isOwner = canModify(post.author.uid);

                            return (
                                <article key={post.id} className="py-7">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <span className="inline-block border border-neutral-800 px-2 py-1 text-[10px] uppercase tracking-wider text-green-400">
                                                {categoryLabel(post.category)}
                                            </span>

                                            {isEditing ? (
                                                <form onSubmit={savePostEdit} className="mt-4 space-y-4">
                                                    <input
                                                        value={editTitle}
                                                        onChange={(event) => setEditTitle(event.target.value)}
                                                        minLength={3}
                                                        maxLength={160}
                                                        required
                                                        className="w-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-lg font-semibold outline-none focus:border-green-500"
                                                    />

                                                    <select
                                                        value={editCategory}
                                                        onChange={(event) => setEditCategory(event.target.value as Category)}
                                                        className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
                                                    >
                                                        {CATEGORIES.filter((item) => item.value !== "ALL").map((item) => (
                                                            <option key={item.value} value={item.value}>
                                                                {item.label}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <textarea
                                                        value={editBody}
                                                        onChange={(event) => setEditBody(event.target.value)}
                                                        rows={5}
                                                        maxLength={10000}
                                                        required
                                                        className="w-full border border-neutral-800 bg-neutral-900 p-3 text-sm outline-none focus:border-green-500"
                                                    />

                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingPost(null)}
                                                            className="text-sm text-neutral-500"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={savingEdit || !editTitle.trim() || !editBody.trim()}
                                                            className="text-sm font-medium text-green-400 disabled:opacity-50"
                                                        >
                                                            {savingEdit ? "Saving..." : "Save changes"}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <h2 className="mt-3 text-xl font-semibold tracking-tight">
                                                        {post.title}
                                                    </h2>

                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                                                        <span className="text-neutral-300">
                                                            {authorName(post.author)}
                                                        </span>
                                                        <span>·</span>
                                                        <span>{formatDate(post.created_at)}</span>
                                                        {post.is_locked && (
                                                            <span className="text-yellow-400">Locked</span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {!post.is_deleted && isOwner && !isEditing && (
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => startPostEdit(post)}
                                                    className="text-xs text-neutral-500 hover:text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void deletePost(post.id)}
                                                    className="text-xs text-red-400 hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!isEditing && (
                                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-400">
                                            {post.is_deleted
                                                ? "This discussion has been deleted."
                                                : post.body}
                                        </p>
                                    )}

                                    {!post.is_deleted && (
                                        <div className="mt-5 flex flex-wrap items-center gap-5">
                                            <button
                                                type="button"
                                                onClick={() => void toggleReplies(post.id)}
                                                className="text-sm text-neutral-400 hover:text-white"
                                            >
                                                {expanded ? "Hide replies" : "View replies"}
                                                <span className="ml-2 text-neutral-600">
                                                    ({post.reply_count})
                                                </span>
                                            </button>

                                            {!post.is_locked && (
                                                <button
                                                    type="button"
                                                    onClick={() => openReply(post.id, null)}
                                                    className="text-sm text-green-400 hover:text-green-300"
                                                >
                                                    Reply
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {renderReplyComposer(post.id, null)}

                                    {expanded && (
                                        <section className="mt-5 border-t border-neutral-800 pt-3">
                                            {replyLoading === post.id ? (
                                                <p className="py-4 text-sm text-neutral-500">
                                                    Loading replies...
                                                </p>
                                            ) : (replies[post.id] ?? []).length === 0 ? (
                                                <p className="py-4 text-sm text-neutral-500">
                                                    No replies yet.
                                                </p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {(replies[post.id] ?? []).map((reply) =>
                                                        renderReply(reply, post)
                                                    )}
                                                </div>
                                            )}
                                        </section>
                                    )}

                                </article>
                            );
                        })}
                    </div>
                )}

                {!loading && posts.length === 50 && total > posts.length && (
                    <p className="mt-5 text-center text-xs text-neutral-500">
                        Showing the first 50 discussions. Pagination can be added next.
                    </p>
                )}
            </div>
        </main>
    );
}