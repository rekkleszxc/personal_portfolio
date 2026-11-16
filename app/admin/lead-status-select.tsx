"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@/lib/lead-status";

export default function LeadStatusSelect({
  id,
  status,
}: {
  id: number;
  status: LeadStatus;
}) {
  const [value, setValue] = useState<LeadStatus>(status);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const change = async (next: LeadStatus) => {
    const previous = value;
    setValue(next);
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not update status.");
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setValue(previous);
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || pending;

  return (
    <div className="min-w-[130px]">
      <select
        value={value}
        disabled={busy}
        onChange={(e) => change(e.target.value as LeadStatus)}
        aria-label={`Update status for lead ${id}`}
        className="w-full rounded-lg border border-white/15 bg-canvas px-2.5 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
      >
        {LEAD_STATUSES.map((option) => (
          <option key={option} value={option}>
            {LEAD_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs font-medium text-danger">{error}</p>
      ) : null}
    </div>
  );
}
