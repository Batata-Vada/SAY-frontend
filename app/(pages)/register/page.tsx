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

export default function Register() {

    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleRegister(e: React.FormEvent) {

        e.preventDefault();
        setError("");

        const response = await fetch(
            "http://127.0.0.1:5001/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || "Registration failed");
            return;
        }

        router.push("/login");
    }

    return (
        <div className="flex min-h-screen items-center justify-center">

            <Card className="w-full max-w-sm">

                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                        Register a new account
                    </CardDescription>
                </CardHeader>

                <CardContent>

                    <form
                        onSubmit={handleRegister}
                        className="space-y-4"
                    >

                        <Input
                            type="text"
                            placeholder="Username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full"
                        >
                            Register
                        </Button>

                    </form>

                    {error && (
                        <p className="mt-4 text-sm text-red-500">
                            {error}
                        </p>
                    )}

                </CardContent>

                <CardFooter className="justify-center">

                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}

                        <button
                            type="button"
                            className="underline"
                            onClick={() => router.push("/login")}
                        >
                            Login
                        </button>

                    </p>

                </CardFooter>

            </Card>

        </div>
    );
}