"use client";

import { useState } from "react";

import {
    ArrowUpRight,
    BookOpen,
    Code2,
    Eye,
    EyeOff,
    GraduationCap,
    Plus,
    Trash2,
    UserRound,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type SocialProfile = {
    id: string;
    name: string;
    placeholder: string;
    value: string;
    visible: boolean;
    icon: React.ElementType;
};

type EducationEntry = {
    id: number;
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
};

const initialSocialProfiles: SocialProfile[] = [
    {
        id: "instagram",
        name: "Instagram",
        placeholder: "https://instagram.com/username",
        value: "",
        visible: true,
        icon: ArrowUpRight,
    },
    {
        id: "twitter",
        name: "X (Twitter)",
        placeholder: "https://x.com/username",
        value: "",
        visible: true,
        icon: ArrowUpRight,
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        placeholder: "https://linkedin.com/in/username",
        value: "",
        visible: true,
        icon: ArrowUpRight,
    },
    {
        id: "leetcode",
        name: "LeetCode",
        placeholder: "https://leetcode.com/u/username",
        value: "",
        visible: true,
        icon: Code2,
    },
    {
        id: "codeforces",
        name: "Codeforces",
        placeholder: "https://codeforces.com/profile/username",
        value: "",
        visible: true,
        icon: Code2,
    },
    {
        id: "codechef",
        name: "CodeChef",
        placeholder: "https://www.codechef.com/users/username",
        value: "",
        visible: true,
        icon: Code2,
    },
];

const emptyEducation = (id: number): EducationEntry => ({
    id,
    institution: "",
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
});

export default function SettingsPage() {
    const [username, setUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [socialProfiles, setSocialProfiles] = useState(
        initialSocialProfiles
    );

    const [educationVisible, setEducationVisible] = useState(true);
    const [education, setEducation] = useState<EducationEntry[]>([
        emptyEducation(1),
    ]);

    function updateSocial(
        id: string,
        field: "value" | "visible",
        value: string | boolean
    ) {
        setSocialProfiles((profiles) =>
            profiles.map((profile) =>
                profile.id === id
                    ? { ...profile, [field]: value }
                    : profile
            )
        );
    }

    function updateEducation(
        id: number,
        field: keyof Omit<EducationEntry, "id">,
        value: string
    ) {
        setEducation((entries) =>
            entries.map((entry) =>
                entry.id === id ? { ...entry, [field]: value } : entry
            )
        );
    }

    function addEducation() {
        setEducation((entries) => {
            const nextId =
                entries.length > 0
                    ? Math.max(...entries.map((entry) => entry.id)) + 1
                    : 1;

            return [...entries, emptyEducation(nextId)];
        });
    }

    function removeEducation(id: number) {
        setEducation((entries) =>
            entries.filter((entry) => entry.id !== id)
        );
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // UI only: connect the form to the backend in a later step.
    }

    return (
        <main className="min-h-screen bg-[#09090b] text-zinc-100">
            <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
                {/* Page heading */}
                <div className="mb-10">
                    <p className="mb-3 text-sm font-medium tracking-wide text-emerald-500">
                        ACCOUNT
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Settings
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
                        Manage your account, social profiles, and personal information.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Account information */}
                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <UserRound className="h-5 w-5 text-emerald-500" />

                            <div>
                                <h2 className="text-lg font-medium">
                                    Account Information
                                </h2>

                                <p className="mt-1 text-sm text-zinc-400">
                                    Manage your SAY account details.
                                </p>
                            </div>
                        </div>

                        <div className="max-w-xl space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-zinc-300">
                                    Username
                                </Label>

                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                Save Username
                            </Button>
                        </div>
                    </section>

                    <Separator className="bg-zinc-800" />

                    {/* Change password */}
                    <section>
                        <div className="mb-6">
                            <h2 className="text-lg font-medium">
                                Change Password
                            </h2>

                            <p className="mt-1 text-sm text-zinc-400">
                                Update your password to keep your account secure.
                            </p>
                        </div>

                        <div className="max-w-xl space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword" className="text-zinc-300">
                                    Current Password
                                </Label>

                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Enter your current password"
                                        value={currentPassword}
                                        onChange={(event) =>
                                            setCurrentPassword(event.target.value)
                                        }
                                        className="border-zinc-800 bg-zinc-950 pr-11 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrentPassword((visible) => !visible)
                                        }
                                        aria-label={
                                            showCurrentPassword
                                                ? "Hide current password"
                                                : "Show current password"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-zinc-300">
                                    New Password
                                </Label>

                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter your new password"
                                        value={newPassword}
                                        onChange={(event) =>
                                            setNewPassword(event.target.value)
                                        }
                                        className="border-zinc-800 bg-zinc-950 pr-11 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword((visible) => !visible)
                                        }
                                        aria-label={
                                            showNewPassword
                                                ? "Hide new password"
                                                : "Show new password"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                Update Password
                            </Button>
                        </div>
                    </section>

                    <Separator className="bg-zinc-800" />

                    {/* Social profiles */}
                    <section>
                        <div className="mb-6">
                            <h2 className="text-lg font-medium">
                                Social Profiles
                            </h2>

                            <p className="mt-1 text-sm text-zinc-400">
                                Connect your profiles and choose which ones to display
                                on your SAY profile.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {socialProfiles.map((profile) => {
                                const Icon = profile.icon;

                                return (
                                    <div
                                        key={profile.id}
                                        className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-center"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 shrink-0 text-zinc-400" />

                                            <Label
                                                htmlFor={`social-${profile.id}`}
                                                className="text-sm text-zinc-200"
                                            >
                                                {profile.name}
                                            </Label>
                                        </div>

                                        <Input
                                            id={`social-${profile.id}`}
                                            type="text"
                                            placeholder={profile.placeholder}
                                            value={profile.value}
                                            onChange={(event) =>
                                                updateSocial(
                                                    profile.id,
                                                    "value",
                                                    event.target.value
                                                )
                                            }
                                            className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                        />

                                        <div className="flex items-center gap-2 sm:justify-end">
                                            <Switch
                                                id={`visible-${profile.id}`}
                                                checked={profile.visible}
                                                onCheckedChange={(checked) =>
                                                    updateSocial(profile.id, "visible", checked)
                                                }
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

                        <p className="mt-5 text-xs leading-5 text-zinc-500">
                            These settings control the intended public visibility of
                            your social links. Actual profile visibility will be
                            implemented with the backend.
                        </p>

                        <Button
                            type="submit"
                            className="mt-5 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            Save Social Profiles
                        </Button>
                    </section>

                    <Separator className="bg-zinc-800" />

                    {/* Educational background */}
                    <section>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

                                <div>
                                    <h2 className="text-lg font-medium">
                                        Educational Background
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                                        Add your academic history to give others more
                                        context about your background.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Label
                                    htmlFor="education-visible"
                                    className="text-sm text-zinc-300"
                                >
                                    Display on profile
                                </Label>

                                <Switch
                                    id="education-visible"
                                    checked={educationVisible}
                                    onCheckedChange={setEducationVisible}
                                />
                            </div>
                        </div>

                        {educationVisible ? (
                            <div className="space-y-8">
                                {education.map((entry, index) => (
                                    <div key={entry.id}>
                                        {index > 0 && (
                                            <Separator className="mb-8 bg-zinc-800" />
                                        )}

                                        <div className="mb-5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-zinc-500" />

                                                <h3 className="text-sm font-medium text-zinc-200">
                                                    Education {index + 1}
                                                </h3>
                                            </div>

                                            {education.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeEducation(entry.id)}
                                                    className="text-zinc-500 hover:bg-red-950/30 hover:text-red-400"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label
                                                    htmlFor={`institution-${entry.id}`}
                                                    className="text-zinc-300"
                                                >
                                                    Institution
                                                </Label>

                                                <Input
                                                    id={`institution-${entry.id}`}
                                                    placeholder="University or school name"
                                                    value={entry.institution}
                                                    onChange={(event) =>
                                                        updateEducation(
                                                            entry.id,
                                                            "institution",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor={`degree-${entry.id}`}
                                                    className="text-zinc-300"
                                                >
                                                    Degree
                                                </Label>

                                                <Input
                                                    id={`degree-${entry.id}`}
                                                    placeholder="e.g. B.Tech, M.Tech"
                                                    value={entry.degree}
                                                    onChange={(event) =>
                                                        updateEducation(
                                                            entry.id,
                                                            "degree",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor={`field-${entry.id}`}
                                                    className="text-zinc-300"
                                                >
                                                    Field of Study
                                                </Label>

                                                <Input
                                                    id={`field-${entry.id}`}
                                                    placeholder="e.g. Computer Science"
                                                    value={entry.field}
                                                    onChange={(event) =>
                                                        updateEducation(
                                                            entry.id,
                                                            "field",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor={`start-${entry.id}`}
                                                    className="text-zinc-300"
                                                >
                                                    Start Year
                                                </Label>

                                                <Input
                                                    id={`start-${entry.id}`}
                                                    type="text"
                                                    placeholder="e.g. 2022"
                                                    value={entry.startYear}
                                                    onChange={(event) =>
                                                        updateEducation(
                                                            entry.id,
                                                            "startYear",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor={`end-${entry.id}`}
                                                    className="text-zinc-300"
                                                >
                                                    End Year
                                                </Label>

                                                <Input
                                                    id={`end-${entry.id}`}
                                                    type="text"
                                                    placeholder="e.g. 2026 or Present"
                                                    value={entry.endYear}
                                                    onChange={(event) =>
                                                        updateEducation(
                                                            entry.id,
                                                            "endYear",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEducation}
                                    className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-900 hover:text-white"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Education
                                </Button>
                            </div>
                        ) : (
                            <p className="border-l-2 border-zinc-700 py-2 pl-4 text-sm text-zinc-500">
                                Your educational background is marked as hidden from
                                your public profile.
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            Save Educational Background
                        </Button>
                    </section>
                </form>

                <Separator className="my-10 bg-zinc-800" />

                <p className="text-center text-xs text-zinc-600">
                    SAY · Manage your account
                </p>
            </div>
        </main>
    );
}