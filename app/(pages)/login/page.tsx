"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:5001/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid username or password.");
                return;
            }

            localStorage.setItem("token", data.token);
            router.push("/");
        } catch {
            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-12 text-white">

            {/* Subtle background accents */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.09),transparent_55%)]" />

            <div className="relative z-10 w-full max-w-[400px]">

                {/* Brand */}
                <div className="mb-8 text-center">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="mb-6 inline-flex items-center gap-2"
                    >

                        <span className="text-xl font-semibold tracking-tight">
                            SAY
                        </span>
                    </button>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        Welcome back.
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Sign in to continue your coding journey.
                    </p>
                </div>

                {/* Login form */}
                <Card className="border border-zinc-800 bg-zinc-950/80 text-white shadow-2xl shadow-black/20">

                    <CardHeader className="space-y-1 pb-5">
                        <CardTitle className="text-lg font-medium">
                            Sign in to your account
                        </CardTitle>

                        <CardDescription className="text-zinc-500">
                            Enter your credentials below to continue.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium text-zinc-300"
                                >
                                    Username
                                </label>

                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    autoComplete="username"
                                    required
                                    className="mt-2 h-11 border-zinc-800 bg-zinc-900/70 text-white placeholder:text-zinc-600 focus-visible:border-green-500 focus-visible:ring-green-500/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-zinc-300"
                                >
                                    Password
                                </label>

                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                    required
                                    className="mt-2 h-11 border-zinc-800 bg-zinc-900/70 text-white placeholder:text-zinc-600 focus-visible:border-green-500 focus-visible:ring-green-500/20"
                                />
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400"
                                >
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-11 w-full bg-green-600 font-medium text-white hover:bg-green-500 disabled:opacity-60"
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center border-t border-zinc-800 pt-5">
                        <p className="text-sm text-grey-800">
                            Don't have an account?{" "}

                            <button
                                type="button"
                                className="font-medium text-green-400 underline-offset-4 hover:text-green-300 hover:underline"
                                onClick={() => router.push("/register")}
                            >
                                Create one
                            </button>
                        </p>
                    </CardFooter>
                </Card>

                {/* Footer */}
                <p className="mt-8 text-center font-mono text-xs text-zinc-300">
                    &lt; learn. solve. grow. /&gt;
                </p>
            </div>
        </main>
    );
}
