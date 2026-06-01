import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = ""
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const styles = {
    primary: "bg-emerald-900 text-white hover:bg-emerald-800 shadow-[0_8px_20px_rgba(6,78,59,.18)]",
    secondary: "border border-emerald-900/20 bg-white/75 text-emerald-950 hover:border-emerald-800 hover:bg-white",
    ghost: "text-emerald-900 hover:bg-emerald-900/5"
  };
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold ${styles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function ActionButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Tag({
  children,
  tone = "green",
  className = ""
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "neutral";
  className?: string;
}) {
  const styles = {
    green: "border-emerald-900/15 bg-emerald-50 text-emerald-900",
    amber: "border-amber-700/15 bg-amber-50 text-amber-900",
    neutral: "border-slate-700/10 bg-slate-50 text-slate-700"
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${styles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className = ""
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-4xl leading-[1.02] text-emerald-950 sm:text-5xl">{title}</h2>
      {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p> : null}
    </div>
  );
}

export function Surface({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}
