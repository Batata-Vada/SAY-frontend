"use client";

import { useEffect, useState } from "react";

export default function Home() {

    const [name, setName] = useState("");

    useEffect(() => {

        async function getUser() {

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://127.0.0.1:5001/me",
                {
                    headers: {
                        "Authorization": token || ""
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setName(data.name);
            }
        }

        getUser();

    }, []);

    return (
        <div>
            Hello {name}
        </div>
    );
}