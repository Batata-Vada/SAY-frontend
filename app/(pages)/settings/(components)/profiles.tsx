"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Code2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { apiRequest, getErrorMessage } from "./api";

type SocialProfile = {
    id: string;
    name: string;
    urlKey: string;
    visibilityKey: string;
    placeholder: string;
    value: string;
    visible: boolean;
    icon: typeof Code2;
};

const initialProfiles: SocialProfile[] = [
    {
        id: "instagram",
        name: "Instagram",
        urlKey: "instagram_url",
        visibilityKey: "show_instagram",
        placeholder: "https://instagram.com/username",
        value: "",
        visible: true,
        icon: ArrowUpRight,
    },
    {
        id: "x",
        name: "X (Twitter)",
        urlKey: "x_url",
        visibilityKey: "show_x",
        placeholder: "https://x.com/username",
        value: "",
        visible: true,
        icon: ArrowUpRight,
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        urlKey: "linkedin_url",
        visibilityKey: "show_linkedin",
        placeholder: "https://linkedin.com/in/username",
        value: "",
        visible: true,
        icon: ArrowUpRight,
    },
    {
        id: "leetcode",
        name: "LeetCode",
        urlKey: "leetcode_url",
        visibilityKey: "show_leetcode",
        placeholder: "https://leetcode.com/u/username",
        value: "",
        visible: true,
        icon: Code2,
    },
    {
        id: "codeforces",
        name: "Codeforces",
        urlKey: "codeforces_url",
        visibilityKey: "show_codeforces",
        placeholder: "https://codeforces.com/profile/username",
        value: "",
        visible: true,
        icon: Code2,
    },
    {
        id: "codechef",
        name: "CodeChef",
        urlKey: "codechef_url",
        visibilityKey: "show_codechef",
        placeholder: "https://www.codechef.com/users/username",
        value: "",
        visible: true,
        icon: Code2,
    },
];

export default function SocialProfilesForm() {
    const [profiles, setProfiles] = useState(initialProfiles);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function loadProfiles() {
            try {
                const response = await apiRequest("/profile/me");

                if (!response.ok) {
                    throw new Error(await getErrorMessage(response));
                }

                const body = await response.json();
                const data = body.profile ?? body;

                setProfiles(
                    initialProfiles.map((profile) => ({
                        ...profile,
                        value: String(data[profile.urlKey] ?? ""),
                        visible:
                            typeof data[profile.visibilityKey] === "boolean"
                                ? data[profile.visibilityKey]
                                : true,
                    })),
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load social profiles.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadProfiles();
    }, []);

    function updateProfile(
        id: string,
        changes: Partial<Pick<SocialProfile, "value" | "visible">>,
    ) {
        setProfiles((current) =>
            current.map((profile) =>
                profile.id === id ? { ...profile, ...changes } : profile,
            ),
        );
    }

    async function saveProfiles() {
        setSaving(true);
        setError("");
        setStatus("");

        const payload: Record<string, string | boolean> = {};

        for (const profile of profiles) {
            payload[profile.urlKey] = profile.value.trim();
            payload[profile.visibilityKey] = profile.visible;
        }

        try {
            const response = await apiRequest("/profile/me", {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            setStatus("Social profiles saved successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to save social profiles.",
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600";

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-lg font-medium">Social Profiles</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Add your social and competitive programming profiles.
                </p>
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-400">
                    {error}
                </p>
            )}

            {status && (
                <p role="status" className="text-sm text-emerald-400">
                    {status}
                </p>
            )}

            <div className="space-y-6">
                {profiles.map((profile) => {
                    const Icon = profile.icon;

                    return (
                        <div
                            key={profile.id}
                            className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)_100px] sm:items-center"
                        >
                            <Label
                                htmlFor={`social-${profile.id}`}
                                className="flex items-center gap-2 text-zinc-300"
                            >
                                <Icon className="h-4 w-4 text-zinc-500" />
                                {profile.name}
                            </Label>

                            <Input
                                id={`social-${profile.id}`}
                                type="url"
                                value={profile.value}
                                onChange={(event) =>
                                    updateProfile(profile.id, {
                                        value: event.target.value,
                                    })
                                }
                                placeholder={profile.placeholder}
                                disabled={loading}
                                className={inputClass}
                            />

                            <div className="flex items-center gap-2 sm:justify-end">
                                <Switch
                                    id={`visible-${profile.id}`}
                                    checked={profile.visible}
                                    onCheckedChange={(visible) =>
                                        updateProfile(profile.id, { visible })
                                    }
                                    disabled={loading}
                                />

                                <Label
                                    htmlFor={`visible-${profile.id}`}
                                    className="text-xs text-zinc-400"
                                >
                                    Display
                                </Label>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Button
                type="button"
                onClick={saveProfiles}
                disabled={loading || saving}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {saving ? "Saving..." : "Save Social Profiles"}
            </Button>
        </section>
    );
}