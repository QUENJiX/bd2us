"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { College } from "@/lib/types";

const buckets = ["Researching", "Shortlisted", "Applying", "Submitted", "Decision"] as const;
const savedKey = "bd2us:saved-colleges";
const notesKey = "bd2us:college-notes";
const bucketKey = "bd2us:college-buckets";

export function CollegeProfileTools({ college }: { college: College }) {
  const { slug } = college;
  const [bucket, setBucket] = useState<(typeof buckets)[number]>("Researching");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBucket((readRecord(bucketKey)[slug] as (typeof buckets)[number]) ?? "Researching");
      setNote(readRecord(notesKey)[slug] ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [slug]);

  function updateBucket(value: (typeof buckets)[number]) {
    const next = { ...readRecord(bucketKey), [slug]: value };
    window.localStorage.setItem(bucketKey, JSON.stringify(next));
    if (!readList(savedKey).includes(slug)) window.localStorage.setItem(savedKey, JSON.stringify([...readList(savedKey), slug]));
    setBucket(value);
    setMessage(`Moved to ${value}.`);
  }

  function saveNote() {
    window.localStorage.setItem(notesKey, JSON.stringify({ ...readRecord(notesKey), [slug]: note }));
    if (!readList(savedKey).includes(slug)) window.localStorage.setItem(savedKey, JSON.stringify([...readList(savedKey), slug]));
    setMessage("Research note saved on this device.");
  }

  return (
    <section className="research-tools" aria-labelledby="research-tools-title">
      <div className="research-tools-heading"><div><p className="eyebrow">Your research file</p><h2 id="research-tools-title">Decide what to verify next.</h2></div></div>
      <label className="research-field"><span>List stage</span><select value={bucket} onChange={(event) => updateBucket(event.target.value as (typeof buckets)[number])}>{buckets.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="research-field"><span>Private research note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="What attracts you? Which official aid, testing, major, and deadline pages must you confirm?" /></label>
      <div className="research-actions"><button className="button-primary" type="button" onClick={saveNote}>Save research note</button></div>
      <p className="sr-only" aria-live="polite">{message}</p>
      {message ? <p className="research-message" aria-hidden="true">{message}</p> : null}
    </section>
  );
}

export function CollegeProfileActions({ college }: { college: College }) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const timer = window.setTimeout(() => setSaved(readList(savedKey).includes(college.slug)), 0);
    return () => window.clearTimeout(timer);
  }, [college.slug]);

  function toggleSaved() {
    const current = readList(savedKey);
    const next = current.includes(college.slug) ? current.filter((item) => item !== college.slug) : [...current, college.slug];
    window.localStorage.setItem(savedKey, JSON.stringify(next));
    setSaved(next.includes(college.slug));
    setMessage(next.includes(college.slug) ? "Added to your college list." : "Removed from your college list.");
  }

  async function downloadProfile() {
    setPdfStatus("loading");
    setMessage("Preparing the one-page college profile.");
    try {
      const { downloadCollegeProfile } = await import("@/lib/college-profile-pdf");
      await downloadCollegeProfile(college);
      setPdfStatus("idle");
      setMessage("College profile downloaded.");
    } catch {
      setPdfStatus("error");
      setMessage("The profile could not be generated. Please try again.");
    }
  }

  return (
    <div className="college-profile-actions" aria-label="College profile actions">
      <button className={saved ? "save-control is-saved" : "save-control"} type="button" onClick={toggleSaved}>{saved ? "Saved" : `Save ${college.shortName}`}</button>
      <Link className="button-secondary" href={`/colleges?compare=${encodeURIComponent(college.slug)}#comparison`}>Compare</Link>
      <button className="button-secondary" disabled={pdfStatus === "loading"} type="button" onClick={downloadProfile}>{pdfStatus === "loading" ? "Preparing…" : pdfStatus === "error" ? "Try download again" : "Download one-page profile"}</button>
      <p className="sr-only" aria-live="polite">{message}</p>
    </div>
  );
}

function readList(key: string): string[] {
  try { return JSON.parse(window.localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function readRecord(key: string): Record<string, string> {
  try { return JSON.parse(window.localStorage.getItem(key) ?? "{}"); } catch { return {}; }
}
