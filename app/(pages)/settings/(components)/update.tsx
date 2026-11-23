"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, getErrorMessage } from "./api";

export default function AccountSecurityForm() {
  const [username, setUsername] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await apiRequest("/auth/session");
        if (!response.ok) throw new Error(await getErrorMessage(response));
        const data = await response.json();
        if (!active) return;
        setUsername(data.say_username ?? "");
        setHandle(data.codeforces?.handle ?? "");
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load account.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function saveUsername() {
    if (username.trim().length < 3 || username.trim().length > 100) {
      setError("SAY username must contain 3–100 characters.");
      return;
    }
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const response = await apiRequest("/me/name", {
        method: "PUT",
        body: JSON.stringify({ name: username.trim() }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setStatus("SAY username updated. Refresh other pages to see the change.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <UserRound className="size-5 text-emerald-500" />
        <div>
          <h2 className="text-lg font-medium">Account</h2>
          <p className="text-sm text-zinc-400">SAY uses Codeforces sign-in. Passwords are not stored by SAY.</p>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {status && <p role="status" className="text-sm text-emerald-400">{status}</p>}
      <div className="max-w-lg space-y-2">
        <Label htmlFor="say-username">SAY username</Label>
        <Input id="say-username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading || saving} maxLength={100} />
        <p className="text-xs text-zinc-500">Changing your username also changes your public profile URL.</p>
        <Button type="button" onClick={() => void saveUsername()} disabled={loading || saving} className="bg-emerald-600 text-white hover:bg-emerald-700">
          {saving ? "Saving..." : "Update username"}
        </Button>
      </div>
      <div className="max-w-lg space-y-2 border-t border-zinc-800 pt-6">
        <Label>Verified Codeforces account</Label>
        <p className="text-zinc-300">{handle || (loading ? "Loading..." : "No verified handle available")}</p>
        <p className="text-xs text-zinc-500">Authentication and password management happen on Codeforces, not SAY.</p>
      </div>
    </section>
  );
}
