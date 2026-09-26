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

    async function handleLogin(e: React.FormEvent) {

        e.preventDefault();
        setError("");

        const response = await fetch(
            "http://127.0.0.1:5001/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);

        router.push("/");
    }

    return (
        <div className="flex min-h-screen items-center justify-center">

            <Card className="w-full max-w-sm">

                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Login to your account
                    </CardDescription>
                </CardHeader>

                <CardContent>

                    <form
                        onSubmit={handleLogin}
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
                            Login
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
                        Don't have an account?{" "}

                        <button
                            type="button"
                            className="underline"
                            onClick={() => router.push("/register")}
                        >
                            Register
                        </button>

                    </p>

                </CardFooter>

            </Card>

        </div>
    );
}