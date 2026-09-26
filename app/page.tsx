"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

    const router = useRouter();

    const [name, setName] = useState("");

    useEffect(() => {

        async function getUser() {

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/register");
                return;
            }

            const response = await fetch(
                "http://127.0.0.1:5001/me",
                {
                    headers: {
                        "Authorization": token
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setName(data.name);

            } else {

                localStorage.removeItem("token");
                router.push("/login");

            }
        }

        getUser();

    }, [router]);


    async function logout() {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://127.0.0.1:5001/logout",
            {
                method: "POST",
                headers: {
                    "Authorization": token || ""
                }
            }
        );

        const data = await response.json();

        console.log(data);

        if (response.ok) {

            localStorage.removeItem("token");

            router.push("/login");
        }
    }


    return (
        <div className="flex gap-12">

            Hello {name}

            <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1"
            >
                Logout
            </button>

        </div>
    );
}