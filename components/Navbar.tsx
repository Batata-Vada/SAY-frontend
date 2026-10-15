
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

type User = {
  name?: string;
  username?: string;
  email?: string;
  privilege?: string;
  role?: string;
  uid?: number;
};

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: token,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        const data: User = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem("token");

    setDropdownOpen(false);

    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: token ?? "",
        },
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      router.replace("/login");
      router.refresh();
    }
  }

  if (loading || !user) {
    return null;
  }

  const displayName =
    user.name || user.username || user.email?.split("@")[0] || "User";

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin =
    user.privilege === "admin" || user.role === "admin";

  return (
    <nav className="w-full border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight"
        >
          SAY
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-neutral-300 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/my-submissions"
            className="text-sm text-neutral-300 hover:text-white"
          >
            Submissions
          </Link>
          <Link
            href="/practice"
            className="text-sm text-neutral-300 hover:text-white"
          >
            Practice
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm text-neutral-300 hover:text-white"
            >
              Admin
            </Link>
          )}

          {/* Avatar and dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-label="Open account menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-sm font-semibold text-white hover:border-green-500 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {initials}
            </button>

            {dropdownOpen && (
              <>
                {/* Close menu when clicking outside */}
                <button
                  type="button"
                  aria-label="Close account menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setDropdownOpen(false)}
                />

                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-3 w-60 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-xl"
                >
                  {/* User information */}
                  <div className="border-b border-neutral-800 px-4 py-4">
                    <p className="truncate text-sm font-medium text-white">
                      {displayName}
                    </p>

                    {user.email && (
                      <p className="mt-1 truncate text-xs text-neutral-400">
                        {user.email}
                      </p>
                    )}

                    {isAdmin && (
                      <p className="mt-2 text-xs font-medium text-green-400">
                        Administrator
                      </p>
                    )}
                  </div>

                  {/* Account actions */}
                  <div className="p-1.5">
                    <Link
                      href="/settings"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    >
                      Modify account
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full rounded-md px-3 py-2.5 text-left text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
