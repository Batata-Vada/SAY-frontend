"use client";

import { useEffect, useState } from "react";

import {
    FaLinkedin,
    FaInstagram,
} from "react-icons/fa";

import {
    Globe,
    GraduationCap,
    CalendarDays,
    ExternalLink,
    Code2,
    Loader2,
    UserRound,
} from "lucide-react";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

interface PublicProfile {
    uid: number;
    username: string;
    name: string;
    bio?: string | null;

    instagram_url?: string | null;
    show_instagram?: boolean;

    x_url?: string | null;
    show_x?: boolean;

    linkedin_url?: string | null;
    show_linkedin?: boolean;

    leetcode_url?: string | null;
    show_leetcode?: boolean;

    codeforces_url?: string | null;
    show_codeforces?: boolean;

    codechef_url?: string | null;
    show_codechef?: boolean;

    education?: Education[];
}

interface Education {
    institution: string;
    degree: string;
    field_of_study?: string | null;
    start_year?: number | null;
    end_year?: number | null;
}

interface SocialLink {
    name: string;
    url: string | null | undefined;
    visible: boolean | undefined;
    icon: React.ElementType;
}

export default function MyProfilePage() {
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchMyProfile() {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Please sign in to view your profile.");
                }

                // Get the currently authenticated user's account details.
                const meResponse = await fetch(`${API_URL}/me`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: token,
                    },
                });

                if (meResponse.status === 401 || meResponse.status === 403) {
                    throw new Error("Your session has expired. Please sign in again.");
                }

                if (!meResponse.ok) {
                    throw new Error("Failed to load your account.");
                }

                const me = await meResponse.json();

                // Get the user's public profile, including social links and education.
                // The backend resolves the profile using User.name.
                const response = await fetch(
                    `${API_URL}/profile/${encodeURIComponent(me.name)}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (response.status === 404) {
                    throw new Error("Your profile could not be found.");
                }

                if (!response.ok) {
                    throw new Error("Failed to load your public profile.");
                }

                const data: PublicProfile = await response.json();

                if (!cancelled) {
                    setProfile(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Something went wrong while loading your profile."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchMyProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Loading profile...
            </main>
        );
    }

    if (error || !profile) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center">
                <div>
                    <UserRound className="mx-auto mb-4 h-10 w-10 text-zinc-600" />

                    <h1 className="text-xl font-semibold text-white">
                        Profile unavailable
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        {error ?? "We couldn't load your profile."}
                    </p>
                </div>
            </main>
        );
    }

    const socialLinks: SocialLink[] = [
        {
            name: "Instagram",
            url: profile.instagram_url,
            visible: profile.show_instagram,
            icon: FaInstagram,
        },
        {
            name: "X",
            url: profile.x_url,
            visible: profile.show_x,
            icon: Globe,
        },
        {
            name: "LinkedIn",
            url: profile.linkedin_url,
            visible: profile.show_linkedin,
            icon: FaLinkedin,
        },
        {
            name: "LeetCode",
            url: profile.leetcode_url,
            visible: profile.show_leetcode,
            icon: Code2,
        },
        {
            name: "Codeforces",
            url: profile.codeforces_url,
            visible: profile.show_codeforces,
            icon: Code2,
        },
        {
            name: "CodeChef",
            url: profile.codechef_url,
            visible: profile.show_codechef,
            icon: Code2,
        },
    ];

    const visibleSocialLinks = socialLinks.filter(
        (link) => link.visible && link.url?.trim()
    );

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
                {/* Profile header */}
                <section className="border-b border-zinc-800 pb-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
                            <span className="text-3xl font-semibold text-green-400">
                                {profile.name.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-zinc-500">
                                @{profile.username}
                            </p>

                            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                                {profile.name}
                            </h1>

                            {profile.bio && (
                                <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-zinc-400">
                                    {profile.bio}
                                </p>
                            )}

                            {visibleSocialLinks.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-3">
                                    {visibleSocialLinks.map((link) => {
                                        const Icon = link.icon;

                                        return (
                                            <a
                                                key={link.name}
                                                href={link.url!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={link.name}
                                                title={link.name}
                                                className="inline-flex items-center gap-2 border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-green-500/40 hover:text-green-400"
                                            >
                                                <Icon className="h-4 w-4" />
                                                {link.name}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Education */}
                <section className="py-8">
                    <div className="mb-6 flex items-center gap-3">
                        <GraduationCap className="h-5 w-5 text-green-400" />

                        <h2 className="text-lg font-semibold text-white">
                            Education
                        </h2>
                    </div>

                    {profile.education && profile.education.length > 0 ? (
                        <div className="space-y-0">
                            {profile.education.map((item, index) => (
                                <div
                                    key={`${item.institution}-${index}`}
                                    className="border-l border-zinc-800 py-2 pb-7 pl-6 last:pb-2"
                                >
                                    <div className="relative">
                                        <span className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full bg-green-500" />

                                        <h3 className="font-medium text-zinc-100">
                                            {item.institution}
                                        </h3>

                                        {(item.degree || item.field_of_study) && (
                                            <p className="mt-1 text-sm text-zinc-400">
                                                {[item.degree, item.field_of_study]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </p>
                                        )}

                                        {(item.start_year || item.end_year) && (
                                            <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                                                <CalendarDays className="h-3.5 w-3.5" />

                                                {item.start_year ?? "—"} –{" "}
                                                {item.end_year ?? "Present"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500">
                            No education information available.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}