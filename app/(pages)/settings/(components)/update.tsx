"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { apiRequest, getErrorMessage } from "./api";

export default function AccountSecurityForm() {
    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [loading, setLoading] = useState(true);
    const [savingName, setSavingName] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function loadAccount() {
            try {
                if (!localStorage.getItem("token")) {
                    throw new Error("Please sign in to manage your settings.");
                }

                const response = await apiRequest("/me");

                if (!response.ok) {
                    throw new Error(await getErrorMessage(response));
                }

                const data = await response.json();
                setName(data.name ?? "");
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Unable to load account.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadAccount();
    }, []);

    async function saveName() {
        if (!name.trim()) {
            setError("Name cannot be empty.");
            return;
        }

        setSavingName(true);
        setError("");
        setStatus("");

        try {
            const response = await apiRequest("/me/name", {
                method: "PUT",
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            setStatus("Name updated successfully.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to update name.",
            );
        } finally {
            setSavingName(false);
        }
    }

    async function savePassword() {
        if (!currentPassword || !newPassword) {
            setError("Enter both your current and new passwords.");
            return;
        }

        setSavingPassword(true);
        setError("");
        setStatus("");

        try {
            const response = await apiRequest("/change-password", {
                method: "PUT",
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            setCurrentPassword("");
            setNewPassword("");
            setStatus("Password updated successfully.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to update password.",
            );
        } finally {
            setSavingPassword(false);
        }
    }

    const inputClass =
        "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-600";

    return (
        <section className="space-y-8">
            <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-emerald-500" />

                <div>
                    <h2 className="text-lg font-medium">Account & Security</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Update your account name and password.
                    </p>
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

            <div className="max-w-xl space-y-4">
                <h3 className="text-sm font-medium text-zinc-200">
                    Account Name
                </h3>

                <div className="space-y-2">
                    <Label htmlFor="account-name" className="text-zinc-300">
                        Name
                    </Label>

                    <Input
                        id="account-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter your name"
                        disabled={loading}
                        className={inputClass}
                    />
                </div>

                <Button
                    type="button"
                    onClick={saveName}
                    disabled={loading || savingName}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    {savingName ? "Saving..." : "Update Name"}
                </Button>
            </div>

            <Separator className="bg-zinc-800" />

            <div className="max-w-xl space-y-5">
                <div>
                    <h3 className="text-sm font-medium text-zinc-200">
                        Change Password
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                        Choose a strong password you have not used elsewhere.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-zinc-300">
                        Current Password
                    </Label>

                    <div className="relative">
                        <Input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(event) =>
                                setCurrentPassword(event.target.value)
                            }
                            placeholder="Enter current password"
                            className={`${inputClass} pr-11`}
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
                    <Label htmlFor="new-password" className="text-zinc-300">
                        New Password
                    </Label>

                    <div className="relative">
                        <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Enter new password"
                            className={`${inputClass} pr-11`}
                        />

                        <button
                            type="button"
                            onClick={() => setShowNewPassword((visible) => !visible)}
                            aria-label={
                                showNewPassword ? "Hide new password" : "Show new password"
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
                    type="button"
                    onClick={savePassword}
                    disabled={savingPassword}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    {savingPassword ? "Updating..." : "Update Password"}
                </Button>
            </div>
        </section>
    );
}