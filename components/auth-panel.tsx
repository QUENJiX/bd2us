"use client";

import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { ActionButton } from "@/components/ui";

export function AuthPanel() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setMessage("Sign-in is temporarily unavailable. Please try again later.");
      return;
    }
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
    });
    setLoading(false);
    setMessage(error ? error.message : "Check your inbox for a secure sign-in link.");
  }

  async function signInWithGoogle() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setMessage("Sign-in is temporarily unavailable. Please try again later.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
    });
  }

  return (
    <div className="card p-5">
      <p className="font-display text-2xl font-bold text-emerald-950">Sync your plan</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Reading remains public. Sign in only when you want your progress, saved colleges, and notes on every device.
      </p>
      <button
        type="button"
        onClick={signInWithGoogle}
        className="mt-4 min-h-11 w-full rounded-full border border-emerald-950/15 bg-white px-4 text-sm font-bold text-emerald-950 hover:border-emerald-800"
      >
        Continue with Google
      </button>
      <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-emerald-950/10" />
        or
        <span className="h-px flex-1 bg-emerald-950/10" />
      </div>
      <form onSubmit={sendMagicLink} className="grid gap-2">
        <label htmlFor="auth-email" className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Email magic link
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="min-h-11 rounded-full border border-emerald-950/15 bg-white px-4 text-sm"
        />
        <ActionButton type="submit" disabled={loading}>
          {loading ? "Sending..." : "Email me a sign-in link"}
        </ActionButton>
      </form>
      {message ? <p className="mt-3 text-sm font-bold text-emerald-800">{message}</p> : null}
    </div>
  );
}
