"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, getErrorMessage } from "@/app/(pages)/settings/(components)/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminUser = { uid: number; name: string; privilege: string };

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [promoting, setPromoting] = useState<number | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sessionResponse = await apiRequest("/auth/session");
      if (sessionResponse.status === 401) {
        router.replace("/login");
        return;
      }
      if (!sessionResponse.ok) throw new Error(await getErrorMessage(sessionResponse));
      const session = await sessionResponse.json();
      if (session.privilege !== "admin") {
        setError("Only SAY administrators can view this page.");
        return;
      }
      const response = await apiRequest("/users");
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const data = await response.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
      setAuthorized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function promote(uid: number) {
    if (!window.confirm("Grant administrator access to this SAY account?")) return;
    setPromoting(uid);
    setError("");
    setMessage("");
    try {
      const response = await apiRequest(`/users/make-admin/${uid}`, { method: "PUT" });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setUsers((old) => old.map((u) => u.uid === uid ? { ...u, privilege: "admin" } : u));
      setMessage("Administrator access granted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to grant administrator access.");
    } finally {
      setPromoting(null);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-neutral-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-semibold">SAY administration</h1>
        <p className="text-sm text-neutral-400">Manage verified SAY users and account privileges.</p>
        {loading && <p role="status">Loading users...</p>}
        {error && <p role="alert" className="text-red-400">{error}</p>}
        {message && <p role="status" className="text-green-400">{message}</p>}
        {!loading && authorized && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>UID</TableHead><TableHead>SAY username</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.uid}>
                    <TableCell>{u.uid}</TableCell>
                    <TableCell><Link href={`/users/${encodeURIComponent(u.name)}`} className="text-green-400 hover:underline">{u.name}</Link></TableCell>
                    <TableCell>{u.privilege}</TableCell>
                    <TableCell>{u.privilege !== "admin" ? (
                      <Button type="button" disabled={promoting !== null} onClick={() => void promote(u.uid)} className="bg-green-600 text-white hover:bg-green-500">
                        {promoting === u.uid ? "Granting..." : "Make admin"}
                      </Button>
                    ) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {!loading && authorized && users.length === 0 && <p>No accounts found.</p>}
        <p className="text-xs text-neutral-500">Account deletion is intentionally unavailable: the backend requires a reviewed data-retention workflow.</p>
      </div>
    </main>
  );
}
