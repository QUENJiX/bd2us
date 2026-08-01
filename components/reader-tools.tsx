"use client";

import { useEffect, useState } from "react";
import { touchReading } from "@/lib/local-workspace";

function readSet(key: string) {
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

export function ReaderTools({ slug }: { slug: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / available) * 100)));
    }
    const timer = window.setTimeout(() => {
      setBookmarked(readSet("bd2us-bookmarks").has(slug));
      setCompleted(readSet("bd2us-guide-complete").has(slug));
      updateProgress();
    }, 0);
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", updateProgress);
    };
  }, [slug]);

  function toggle(key: "bd2us-bookmarks" | "bd2us-guide-complete", current: boolean, setter: (value: boolean) => void) {
    const values = readSet(key);
    if (current) values.delete(slug);
    else values.add(slug);
    window.localStorage.setItem(key, JSON.stringify([...values]));
    touchReading("guide", slug, key === "bd2us-bookmarks" ? { bookmarked: !current } : { completed: !current });
    if (key === "bd2us-bookmarks") {
      navigator.serviceWorker?.controller?.postMessage({
        type: current ? "REMOVE_READING_PAGE" : "CACHE_READING_PAGE",
        url: window.location.pathname
      });
    }
    setter(!current);
  }

  return (
    <>
      <div className="fixed left-0 top-16 z-40 h-1 bg-amber-600 transition-[width]" style={{ width: `${progress}%` }} />
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggle("bd2us-bookmarks", bookmarked, setBookmarked)}
          className="min-h-11 rounded-full border border-emerald-900/15 bg-white px-4 text-sm font-bold text-emerald-950 hover:border-emerald-700"
        >
          {bookmarked ? "Saved for later" : "Save for later"}
        </button>
        <button
          type="button"
          onClick={() => toggle("bd2us-guide-complete", completed, setCompleted)}
          className="min-h-11 rounded-full bg-emerald-900 px-4 text-sm font-bold text-white hover:bg-emerald-800"
        >
          {completed ? "Marked complete" : "Mark as read"}
        </button>
      </div>
    </>
  );
}
