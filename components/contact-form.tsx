"use client";

import { useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    });
    const payload = (await response.json()) as { error?: string };
    setMessage(payload.error ?? (response.ok ? "Message received. Thank you for making the guide better." : "Please try again."));
    setState(response.ok ? "success" : "error");
    if (response.ok) form.reset();
  }

  return (
    <form className="card grid gap-4 p-5 sm:p-7" onSubmit={submit}>
      <Input label="Your name" name="name" required />
      <Input label="Email address" name="email" required type="email" />
      <label className="text-sm font-bold text-slate-700">What can we help with?
        <select className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium" name="subject">
          <option>Guide feedback</option><option>Incorrect or stale information</option><option>Partnership inquiry</option><option>Technical issue</option>
        </select>
      </label>
      <label className="text-sm font-bold text-slate-700">Message
        <textarea className="mt-2 min-h-36 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium" minLength={10} name="message" required />
      </label>
      <label className="hidden">Website<input autoComplete="off" name="website" tabIndex={-1} /></label>
      <ActionButton disabled={state === "loading"} type="submit">{state === "loading" ? "Sending..." : "Send message"}</ActionButton>
      {message ? <p className={`text-sm font-bold ${state === "error" ? "text-rose-700" : "text-emerald-800"}`}>{message}</p> : null}
    </form>
  );
}

function Input({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="text-sm font-bold text-slate-700">{label}<input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium" name={name} required={required} type={type} /></label>;
}
