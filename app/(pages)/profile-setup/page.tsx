"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import SocialProfilesForm from "../settings/(components)/profiles";
import { apiRequest, getErrorMessage } from "../settings/(components)/api";

export default function ProfileSetupPage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [showSetup, setShowSetup] = useState(false);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function checkProfile() {
            setChecking(true);
            setError("");

            try {
                const sessionResponse = await apiRequest("/auth/session");

                if (sessionResponse.status === 401) {
                    router.replace("/login");
                    return;
                }

                if (!sessionResponse.ok) {
                    throw new Error(await getErrorMessage(sessionResponse));
                }

                const profileResponse = await apiRequest("/profile/me");

                if (profileResponse.status === 401) {
                    router.replace("/login");
                    return;
                }

                if (!profileResponse.ok) {
                    throw new Error(await getErrorMessage(profileResponse));
                }

                const body = await profileResponse.json();
                const profile = body.profile ?? body;

                if (String(profile.display_name ?? "").trim()) {
                    router.replace("/");
                    return;
                }

                if (!cancelled) {
                    setShowSetup(true);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to check your profile.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setChecking(false);
                }
            }
        }

        checkProfile();

        return () => {
            cancelled = true;
        };
    }, [attempt, router]);

    useEffect(() => {
        if (!saved) return;

        const timeout = window.setTimeout(() => router.replace("/"), 900);
        return () => window.clearTimeout(timeout);
    }, [saved, router]);

    if (saved) {
        return (
            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#09090b] px-6 text-center text-zinc-100">
                <p role="status" className="text-emerald-400">
                    Profile saved. Taking you to SAY...
                </p>
            </main>
        );
    }

    if (checking || !showSetup) {
        return (
            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#09090b] px-6 text-zinc-300">
                {checking ? (
                    <p className="flex items-center gap-3" role="status">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Checking your profile...
                    </p>
                ) : error ? (
                    <div className="max-w-md text-center">
                        <p role="alert" className="text-red-400">{error}</p>
                        <button
                            type="button"
                            onClick={() => setAttempt((value) => value + 1)}
                            className="mt-5 text-sm text-emerald-400 underline underline-offset-4"
                        >
                            Try again
                        </button>
                    </div>
                ) : null}
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-[#09090b] text-zinc-100">
            <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
                <header className="mb-10">
                    <p className="mb-3 text-sm font-medium tracking-wide text-emerald-500">
                        WELCOME TO SAY
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Set up your profile
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
                        Add a display name to finish setting up your account. You can update your profile later in Settings.
                    </p>
                </header>

                <SocialProfilesForm isSetup onSaved={() => setSaved(true)} />
            </div>
        </main>
    );
}
