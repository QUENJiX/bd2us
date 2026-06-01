"use client";

import { useMemo, useState } from "react";
import { estimateBudget } from "@/lib/domain.mjs";
import { Surface, Tag } from "@/components/ui";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export function BudgetEstimator() {
  const [monthlyIncomeBdt, setMonthlyIncomeBdt] = useState(0);
  const [savingsBdt, setSavingsBdt] = useState(0);
  const [assetsBdt, setAssetsBdt] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(118);
  const result = useMemo(
    () => estimateBudget({ monthlyIncomeBdt, savingsBdt, assetsBdt, exchangeRate }),
    [monthlyIncomeBdt, savingsBdt, assetsBdt, exchangeRate]
  );

  return (
    <Surface className="surface-inverse overflow-hidden border-emerald-900/15 p-0 text-white">
      <div className="grid lg:grid-cols-[.9fr_1.1fr]">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,.24),transparent_52%)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <Tag tone="amber">Budget planning tool</Tag>
          <h2 className="font-display mt-5 text-4xl leading-none">Start with a family conversation.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-emerald-100/85">
            Use a broad contribution range while building your college list. This deliberately simple planner is
            not a college financial-aid formula.
          </p>
          <div className="mt-7 rounded-3xl border border-white/15 bg-white/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Planning range</p>
            <p className="mt-2 font-display text-5xl">{money.format(result.planningAmount)}</p>
            <p className="mt-2 text-sm text-emerald-100">{result.band}</p>
          </div>
        </div>
        <div className="grid gap-4 bg-white p-6 text-slate-800 sm:grid-cols-2 sm:p-8">
          <PlannerInput label="Monthly family income" value={monthlyIncomeBdt} onChange={setMonthlyIncomeBdt} />
          <PlannerInput label="Available savings" value={savingsBdt} onChange={setSavingsBdt} />
          <PlannerInput label="Relevant assets" value={assetsBdt} onChange={setAssetsBdt} />
          <PlannerInput label="BDT per USD" value={exchangeRate} onChange={setExchangeRate} step={0.5} />
          <p className="sm:col-span-2 rounded-2xl border border-amber-700/15 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
            {result.disclaimer} Assumptions: 8% of annual income, 4% of savings, and 1% of relevant assets,
            converted at your editable exchange rate. Use official net-price and aid instructions for every college.
          </p>
        </div>
      </div>
    </Surface>
  );
}

function PlannerInput({
  label,
  value,
  onChange,
  step = 1000
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="text-sm font-bold text-slate-700">
      {label}
      <span className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3">
        <span className="text-xs text-slate-400">{label === "BDT per USD" ? "৳" : "৳"}</span>
        <input
          className="min-h-12 w-full bg-transparent px-2 text-base font-medium outline-none"
          min="0"
          step={step}
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </span>
    </label>
  );
}
