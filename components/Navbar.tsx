"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest, getErrorMessage } from "@/app/(pages)/settings/(components)/api";

type Session = { uid: number; say_username: string; privilege: string };
type Viewer = { uid: number; name: string; privilege: string };

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Viewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  // Route changes after OAuth/profile setup recheck the session and display name.
  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      setLoading(true);
      try {
        const response = await apiRequest("/auth/session");
        if (!response.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const session: Session = await response.json();
        let name = session.say_username;
        try {
          const profileResponse = await apiRequest("/profile/me");
          if (profileResponse.ok) {
            const body = await profileResponse.json();
            const profile = body.profile ?? body;
            name = (typeof profile.display_name === "string" &&
              profile.display_name.trim()) || name;
          }
        } catch {
          // Still show the authenticated navbar when the optional profile lookup fails.
        }
        if (!cancelled) setUser({ uid: session.uid, name, privilege: session.privilege });
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadSession();
    return () => { cancelled = true; };
  }, [pathname]);

  async function logout() {
    setError("");
    try {
      const response = await apiRequest("/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError(await getErrorMessage(response));
        return;
      }
      setUser(null);
      setMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log out.");
    }
  }

  return (
    <nav aria-label="Main navigation" className="w-full border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-2">
        <Link href="/" className="text-lg font-semibold">SAY<span className="text-green-400">.</span></Link>
        <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
          <Link href="/" className="text-neutral-300 hover:text-white">Home</Link>
          <Link href="/practice" className="text-neutral-300 hover:text-white">Practice</Link>
          {user && (
            <Link href="/my-submissions" className="text-neutral-300 hover:text-white">Submissions</Link>
          )}
          {user?.privilege === "admin" && (
            <Link href="/admin" className="text-neutral-300 hover:text-white">Admin</Link>
          )}
          {!user ? (
            <Link href="/login" className="rounded-md bg-green-500 px-3 py-2 font-semibold text-neutral-950 hover:bg-green-400">
              {loading ? "Sign in" : "Login"}
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => { setMenuOpen((v) => !v); setError(""); }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                className="flex size-9 items-center justify-center rounded-full border border-green-500/40 bg-neutral-800 font-semibold text-white"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <>
                  <button className="fixed inset-0 z-10 cursor-default" aria-label="Close account menu" onClick={() => setMenuOpen(false)} />
                  <div role="menu" className="absolute right-0 z-20 mt-2 w-60 rounded-lg border border-neutral-800 bg-neutral-950 p-2 shadow-xl">
                    <p className="truncate border-b border-neutral-800 px-3 py-2 font-medium">{user.name}</p>
                    <Link href="/settings" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 hover:bg-neutral-800">Settings</Link>
                    <Link href="/users/me" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 hover:bg-neutral-800">My profile</Link>
                    <button type="button" role="menuitem" onClick={() => void logout()} className="block w-full rounded px-3 py-2 text-left text-red-400 hover:bg-neutral-800">Log out</button>
                    {error && <p role="alert" className="px-3 py-2 text-xs text-red-400">{error}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
