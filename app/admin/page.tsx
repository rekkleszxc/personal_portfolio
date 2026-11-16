import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, Mail, TrendingUp } from "lucide-react";
import { isDbConfigured } from "@/lib/db";
import { leadStats, listLeads, type Lead, type LeadStats } from "@/lib/leads";
import LeadStatusSelect from "./lead-status-select";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leads | Portfolio Admin",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-6">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-accent/10 p-2.5 text-accent">
          <Database size={20} />
        </span>
        <h2 className="font-display text-xl font-bold">
          Connect your MySQL database
        </h2>
      </div>
      <p className="mt-4 text-muted">
        Add a connection string to{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">
          .env.local
        </code>{" "}
        and restart the dev server. The{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">leads</code>{" "}
        table is created automatically on the first submission.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-canvas p-4 text-sm text-ink">
        {`DATABASE_URL=mysql://user:password@localhost:3306/portfolio
ADMIN_USER=your-admin-name
ADMIN_PASSWORD=your-strong-password`}
      </pre>
      <p className="mt-4 text-sm text-muted">
        Prefer separate variables? Use{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">
          MYSQL_HOST
        </code>
        ,{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">
          MYSQL_PORT
        </code>
        ,{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">
          MYSQL_USER
        </code>
        ,{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">
          MYSQL_PASSWORD
        </code>{" "}
        and{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">
          MYSQL_DATABASE
        </code>
        . You can also run{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">
          db/schema.sql
        </code>{" "}
        manually.
      </p>
    </div>
  );
}

function Metrics({ stats }: { stats: LeadStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total leads"
        value={String(stats.total)}
        hint={`${stats.last7Days} in the last 7 days`}
      />
      <StatCard
        label="Needs a reply"
        value={String(stats.newCount)}
        hint={`${stats.inProgress} in progress`}
      />
      <StatCard
        label="Conversion rate"
        value={`${stats.conversionRate}%`}
        hint={`${stats.won} won of ${stats.total} leads`}
      />
      <StatCard
        label="Won / lost"
        value={`${stats.won} / ${stats.lost}`}
        hint="Mark leads as won to track conversion"
      />
    </div>
  );
}

function LeadTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface p-10 text-center">
        <p className="font-medium">No leads yet.</p>
        <p className="mt-1 text-sm text-muted">
          Submissions from your contact form will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
            <th className="px-5 py-4 font-semibold">Lead</th>
            <th className="px-5 py-4 font-semibold">Message</th>
            <th className="px-5 py-4 font-semibold">Source</th>
            <th className="px-5 py-4 font-semibold">Received</th>
            <th className="px-5 py-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {leads.map((lead) => (
            <tr key={lead.id} className="align-top">
              <td className="px-5 py-4">
                <p className="font-semibold">{lead.name}</p>
                <a
                  href={`mailto:${lead.email}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-accent hover:underline"
                >
                  <Mail size={14} />
                  {lead.email}
                </a>
              </td>
              <td className="px-5 py-4">
                <p
                  className="line-clamp-2 max-w-[340px] text-muted"
                  title={lead.message}
                >
                  {lead.message}
                </p>
              </td>
              <td className="px-5 py-4">
                <p className="font-medium">{lead.source}</p>
                {lead.utm_medium || lead.utm_campaign ? (
                  <p className="mt-1 text-xs text-muted">
                    {[lead.utm_medium, lead.utm_campaign]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                ) : null}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-muted">
                {formatDate(lead.created_at)}
              </td>
              <td className="px-5 py-4">
                <LeadStatusSelect id={lead.id} status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminPage() {
  const configured = isDbConfigured();

  let leads: Lead[] = [];
  let stats: LeadStats = {
    total: 0,
    newCount: 0,
    inProgress: 0,
    won: 0,
    lost: 0,
    last7Days: 0,
    conversionRate: 0,
  };
  let error = "";

  if (configured) {
    try {
      [leads, stats] = await Promise.all([listLeads(), leadStats()]);
    } catch (err) {
      console.error("Could not load leads:", err);
      error = err instanceof Error ? err.message : "Could not load leads.";
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
          >
            <ArrowLeft size={16} /> Back to portfolio
          </Link>
          <h1 className="mt-4 flex items-center gap-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            <TrendingUp className="text-accent" size={30} /> Lead pipeline
          </h1>
          <p className="mt-2 text-muted">
            Every contact submission, with its source and conversion status.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {!configured ? (
          <SetupNotice />
        ) : error ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-5 text-danger">
            <p className="font-semibold">Database error</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <Metrics stats={stats} />
            <LeadTable leads={leads} />
          </>
        )}
      </div>
    </main>
  );
}
