"use client";

import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { apiRequest, getErrorMessage } from "./api";

type EducationEntry = {
    id: number;
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
};

function emptyEducation(id: number): EducationEntry {
    return {
        id,
        institution: "",
        degree: "",
        field: "",
        startYear: "",
        endYear: "",
    };
}

export default function EducationForm() {
    const [education, setEducation] = useState<EducationEntry[]>([
        emptyEducation(1),
    ]);

    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function loadEducation() {
            try {
                const response = await apiRequest("/education/me");

                if (!response.ok) {
                    throw new Error(await getErrorMessage(response));
                }

                const body = await response.json();
                const rows = Array.isArray(body.education) ? body.education : [];

                setEducation(
                    rows.length
                        ? rows.map(
                            (row: Record<string, unknown>, index: number) => ({
                                id: Number(row.id) || index + 1,
                                institution: String(row.institution ?? ""),
                                degree: String(row.degree ?? ""),
                                field: String(row.field_of_study ?? ""),
                                startYear: String(row.start_year ?? ""),
                                endYear: String(row.end_year ?? ""),
                            }),
                        )
                        : [emptyEducation(1)],
                );

                if (rows.length > 0) {
                    setIsVisible(Boolean(rows[0].is_visible));
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load education.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadEducation();
    }, []);

    function updateEducation(
        id: number,
        field: keyof Omit<EducationEntry, "id">,
        value: string,
    ) {
        setEducation((current) =>
            current.map((entry) =>
                entry.id === id ? { ...entry, [field]: value } : entry,
            ),
        );
    }

    function addEducation() {
        setEducation((current) => {
            const nextId =
                current.length > 0
                    ? Math.max(...current.map((entry) => entry.id)) + 1
                    : 1;

            return [...current, emptyEducation(nextId)];
        });
    }

    function removeEducation(id: number) {
        setEducation((current) => {
            const remaining = current.filter((entry) => entry.id !== id);
            return remaining.length > 0 ? remaining : [emptyEducation(1)];
        });
    }

    async function saveEducation() {
        setSaving(true);
        setError("");
        setStatus("");

        const started = education.filter(
            (entry) =>
                entry.institution.trim() ||
                entry.degree.trim() ||
                entry.field.trim() ||
                entry.startYear.trim() ||
                entry.endYear.trim(),
        );

        if (
            started.some(
                (entry) =>
                    !entry.institution.trim() ||
                    !entry.degree.trim() ||
                    !entry.startYear.trim(),
            )
        ) {
            setError(
                "Each education entry must include an institution, degree, and start year.",
            );
            setSaving(false);
            return;
        }

        const validYear = (value: string) =>
            /^\d{4}$/.test(value) &&
            Number(value) >= 1900 &&
            Number(value) <= 2200;

        if (
            started.some(
                (entry) =>
                    !validYear(entry.startYear) ||
                    (entry.endYear.trim() &&
                        (!validYear(entry.endYear) ||
                            Number(entry.endYear) < Number(entry.startYear))),
            )
        ) {
            setError("Enter valid years between 1900 and 2200.");
            setSaving(false);
            return;
        }

        const payload = started.map((entry) => ({
            institution: entry.institution.trim(),
            degree: entry.degree.trim(),
            field_of_study: entry.field.trim() || null,
            start_year: Number(entry.startYear),
            end_year: entry.endYear.trim() ? Number(entry.endYear) : null,
        }));

        try {
            const response = await apiRequest("/education/me", {
                method: "PUT",
                body: JSON.stringify({
                    education: payload,
                    is_visible: isVisible,
                }),
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const body = await response.json();
            const rows = Array.isArray(body.education) ? body.education : [];

            setEducation(
                rows.length
                    ? rows.map(
                        (row: Record<string, unknown>, index: number) => ({
                            id: Number(row.id) || index + 1,
                            institution: String(row.institution ?? ""),
                            degree: String(row.degree ?? ""),
                            field: String(row.field_of_study ?? ""),
                            startYear: String(row.start_year ?? ""),
                            endYear: String(row.end_year ?? ""),
                        }),
                    )
                    : [emptyEducation(1)],
            );

            setStatus("Educational background saved successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to save education.",
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600";

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 h-5 w-5 text-emerald-500" />

                    <div>
                        <h2 className="text-lg font-medium">
                            Educational Background
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-400">
                            Add your academic history to your profile.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Label htmlFor="education-visible" className="text-zinc-300">
                        Display on profile
                    </Label>

                    <Switch
                        id="education-visible"
                        checked={isVisible}
                        onCheckedChange={setIsVisible}
                        disabled={loading}
                    />
                </div>
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

            <div className="space-y-8">
                {education.map((entry, index) => (
                    <div key={entry.id}>
                        {index > 0 && <Separator className="mb-8 bg-zinc-800" />}

                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-zinc-500" />
                                <h3 className="text-sm font-medium text-zinc-200">
                                    Education {index + 1}
                                </h3>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducation(entry.id)}
                                disabled={loading || saving}
                                className="text-zinc-400 hover:bg-zinc-900 hover:text-red-400"
                                aria-label={`Remove education ${index + 1}`}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label className="text-zinc-300">Institution</Label>
                                <Input
                                    value={entry.institution}
                                    onChange={(event) =>
                                        updateEducation(
                                            entry.id,
                                            "institution",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="University or institution"
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Degree</Label>
                                <Input
                                    value={entry.degree}
                                    onChange={(event) =>
                                        updateEducation(entry.id, "degree", event.target.value)
                                    }
                                    placeholder="B.Tech, M.Tech, Ph.D..."
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">
                                    Field of Study
                                </Label>
                                <Input
                                    value={entry.field}
                                    onChange={(event) =>
                                        updateEducation(entry.id, "field", event.target.value)
                                    }
                                    placeholder="Computer Science"
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Start Year</Label>
                                <Input
                                    inputMode="numeric"
                                    value={entry.startYear}
                                    onChange={(event) =>
                                        updateEducation(
                                            entry.id,
                                            "startYear",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="2024"
                                    maxLength={4}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">
                                    End Year
                                    <span className="ml-2 text-xs text-zinc-500">
                                        Leave empty if ongoing
                                    </span>
                                </Label>
                                <Input
                                    inputMode="numeric"
                                    value={entry.endYear}
                                    onChange={(event) =>
                                        updateEducation(
                                            entry.id,
                                            "endYear",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="2028"
                                    maxLength={4}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={addEducation}
                    disabled={loading || saving}
                    className="border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900 hover:text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Education
                </Button>

                <Button
                    type="button"
                    onClick={saveEducation}
                    disabled={loading || saving}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    {saving ? "Saving..." : "Save Education"}
                </Button>
            </div>
        </section>
    );
}