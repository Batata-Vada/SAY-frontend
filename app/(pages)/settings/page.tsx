"use client";

import { Separator } from "@/components/ui/separator";

import AccountSecurityForm from "./(components)/update"
import SocialProfilesForm from "./(components)/profiles";
import EducationForm from "./(components)/education";

export default function SettingsPage() {
    return (
        <main className="min-h-screen bg-[#09090b] text-zinc-100">
            <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
                <header className="mb-10">
                    <p className="mb-3 text-sm font-medium tracking-wide text-emerald-500">
                        ACCOUNT
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Settings
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
                        Manage your account, social profiles, and educational background.
                    </p>
                </header>

                <div className="space-y-10">
                    <AccountSecurityForm />

                    <Separator className="bg-zinc-800" />

                    <SocialProfilesForm />

                    <Separator className="bg-zinc-800" />

                    <EducationForm />
                </div>
            </div>
        </main>
    );
}