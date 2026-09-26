"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type User = {
    uid: number;
    name: string;
    email: string;
    privilege: string;
};

export default function Admin() {

    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadAdminPage() {

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/register");
                return;
            }

            try {

                const meResponse = await fetch(
                    "http://127.0.0.1:5001/me",
                    {
                        headers: {
                            "Authorization": token
                        }
                    }
                );

                if (!meResponse.ok) {
                    localStorage.removeItem("token");
                    router.push("/register");
                    return;
                }

                const me = await meResponse.json();

                if (me.privilege !== "admin") {
                    router.push("/not-found");
                    return;
                }

                const usersResponse = await fetch(
                    "http://127.0.0.1:5001/users",
                    {
                        headers: {
                            "Authorization": token
                        }
                    }
                );

                if (!usersResponse.ok) {
                    router.push("/not-found");
                    return;
                }

                const data = await usersResponse.json();

                setUsers(data.users);

            } catch (error) {

                console.error(error);
                router.push("/not-found");

            } finally {

                setLoading(false);

            }
        }

        loadAdminPage();

    }, [router]);


    async function makeAdmin(uid: number) {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://127.0.0.1:5001/users/make-admin/${uid}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": token || ""
                }
            }
        );

        if (response.ok) {

            setUsers(
                users.map((user) =>
                    user.uid === uid
                        ? {
                            ...user,
                            privilege: "admin"
                        }
                        : user
                )
            );
        }
    }


    async function deleteUser(uid: number) {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://127.0.0.1:5001/users/delete/${uid}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": token || ""
                }
            }
        );

        if (response.ok) {

            setUsers(
                users.filter(
                    (user) => user.uid !== uid
                )
            );
        }
    }


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }


    return (
        <div className="p-8">

            <h1 className="mb-6 text-2xl font-bold">
                Admin Panel
            </h1>

            <Table>

                <TableHeader>
                    <TableRow>

                        <TableHead>UID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Privilege</TableHead>
                        <TableHead>Actions</TableHead>

                    </TableRow>
                </TableHeader>

                <TableBody>

                    {users.map((user) => (

                        <TableRow key={user.uid}>

                            <TableCell>
                                {user.uid}
                            </TableCell>

                            <TableCell>
                                {user.name}
                            </TableCell>

                            <TableCell>
                                {user.email}
                            </TableCell>

                            <TableCell>
                                {user.privilege}
                            </TableCell>

                            <TableCell>

                                <div className="flex gap-2">

                                    {user.privilege !== "admin" && (
                                        <button
                                            onClick={() =>
                                                makeAdmin(user.uid)
                                            }
                                            className="rounded bg-green-600 px-3 py-1 text-white"
                                        >
                                            Make Admin
                                        </button>
                                    )}

                                    <button
                                        onClick={() =>
                                            deleteUser(user.uid)
                                        }
                                        className="rounded bg-red-500 px-3 py-1 text-white"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </div>
    );
}