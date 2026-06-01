"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function AccountPanel({ email, onSignedOut }: { email: string; onSignedOut: () => void }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [loading, setLoading] = useState<"signout" | "delete" | null>(null);
  const [message, setMessage] = useState("");

  async function signOut() {
    const supabase = getBrowserSupabase();
    if (!supabase) return setMessage("Sign-out is temporarily unavailable. Please try again later.");
    setLoading("signout");
    const { error } = await supabase.auth.signOut();
    setLoading(null);
    if (error) return setMessage(error.message);
    onSignedOut();
  }

  async function deleteAccount() {
    setLoading("delete");
    const response = await fetch("/api/account", { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setLoading(null);
      return setMessage(payload.error ?? "Could not delete your account. Please try again.");
    }
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    clearLocalWorkspace();
    window.location.assign("/");
  }

  return (
    <div className="card p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Your account</p>
      <p className="mt-3 break-all text-sm font-bold text-emerald-950">{email}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">Your synced planning workspace is private to this account.</p>
      <button className="mt-4 min-h-10 rounded-full border border-emerald-900/15 px-4 text-sm font-bold text-emerald-900 hover:bg-emerald-50 disabled:opacity-50" disabled={loading !== null} onClick={signOut} type="button">
        {loading === "signout" ? "Signing out..." : "Sign out"}
      </button>
      <div className="mt-5 border-t border-emerald-950/10 pt-4">
        {!confirmingDelete ? (
          <button className="text-sm font-bold text-rose-700 underline decoration-rose-300 underline-offset-4" onClick={() => setConfirmingDelete(true)} type="button">
            Delete account
          </button>
        ) : (
          <div>
            <p className="text-sm leading-6 text-slate-600">Delete your account and synced BD2US workspace? This cannot be undone.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="min-h-10 rounded-full bg-rose-700 px-4 text-sm font-bold text-white hover:bg-rose-800 disabled:opacity-50" disabled={loading !== null} onClick={deleteAccount} type="button">
                {loading === "delete" ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button className="min-h-10 rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50" disabled={loading !== null} onClick={() => setConfirmingDelete(false)} type="button">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {message ? <p className="mt-3 text-sm font-bold text-rose-700">{message}</p> : null}
    </div>
  );
}

function clearLocalWorkspace() {
  [
    "bd2us-profile",
    "bd2us-roadmap-progress",
    "bd2us:saved-colleges",
    "bd2us:college-notes",
    "bd2us:deadlines",
    "bd2us-bookmarks",
    "bd2us-guide-complete",
    "bd2us-recent-guides"
  ].forEach((key) => window.localStorage.removeItem(key));
}
