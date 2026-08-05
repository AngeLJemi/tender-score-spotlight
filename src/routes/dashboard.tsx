import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  FileText,
  PanelLeft,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { RelevanceBadge } from "@/components/tenders/RelevanceBadge";
import { daysToClose } from "@/lib/tenders";
import {
  byCategory,
  bySource,
  closingSoon,
  kpis,
  relevanceBreakdown,
  topAgencies,
  weeklyTrend,
} from "@/lib/dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Equip Medical Tender Portal" },
      {
        name: "description",
        content:
          "Analytics overview of Singapore healthcare tender opportunities: open pipeline, strong matches, closing deadlines and publishing trends.",
      },
      { property: "og:title", content: "Dashboard · Equip Medical Tender Portal" },
      {
        property: "og:description",
        content:
          "Pipeline overview with relevance breakdown, category and source mix, weekly publishing trend and tenders closing soon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function Panel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: 12,
    boxShadow: "0 6px 24px -12px rgb(0 0 0 / 0.25)",
  },
  labelStyle: { color: "var(--muted-foreground)" },
} as const;

function StatCard({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border border-border border-l-4 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl leading-none font-semibold">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{label}</p>
        </div>
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`, color: accent }}
        >
          <Icon className="size-4" />
        </span>
      </div>
    </div>
  );
}

function DashboardPage() {
  const maxCategory = Math.max(...byCategory.map((c) => c.count), 1);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-border bg-card px-5 py-4">
          <PanelLeft className="size-5 shrink-0 text-muted-foreground" />
          <span className="h-6 w-px bg-border" />
          <h1 className="truncate text-xl font-semibold">Dashboard</h1>
        </header>

        <div className="min-w-0 flex-1 space-y-5 p-5">
          <p className="text-sm text-muted-foreground">
            Overview of tender opportunities for Equip Medical.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={FileText}
              value={kpis.open}
              label="Open tenders"
              accent="var(--open)"
            />
            <StatCard
              icon={Sparkles}
              value={kpis.strong}
              label="Strong matches"
              accent="var(--relevance-high)"
            />
            <StatCard
              icon={CalendarClock}
              value={kpis.closingThisWeek}
              label="Closing this week"
              accent="var(--urgent)"
            />
            <StatCard
              icon={TrendingUp}
              value={kpis.newThisWeek}
              label="New this week"
              accent="var(--tag-category-foreground)"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <Panel title="Relevance breakdown" subtitle="Open tenders by match strength">
              <div className="flex items-center gap-4">
                <div className="h-[136px] w-[136px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={relevanceBreakdown}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={38}
                        outerRadius={64}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {relevanceBreakdown.map((d) => (
                          <Cell key={d.label} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="min-w-0 space-y-2 text-sm">
                  {relevanceBreakdown.map((d) => (
                    <li key={d.label} className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="truncate text-muted-foreground">{d.label}</span>
                      <span className="ml-auto font-semibold">{d.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            <Panel title="Tenders by category" subtitle="All tenders, highest first">
              <ul className="space-y-2.5">
                {byCategory.map((c) => (
                  <li key={c.name} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-muted-foreground">{c.name}</span>
                      <span className="font-semibold">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-tag-category-foreground/70"
                        style={{ width: `${(c.count / maxCategory) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Tenders by source" subtitle="Listings per portal">
              <div className="h-[168px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySource} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip {...tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                    <Bar
                      dataKey="count"
                      name="Tenders"
                      radius={[6, 6, 0, 0]}
                      fill="var(--tag-method-foreground)"
                      maxBarSize={46}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="New tenders trend" subtitle="Published per week, last 8 weeks">
              <div className="h-[168px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Published"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#trendFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="Closing soon"
              subtitle="Open tenders with the nearest deadlines"
              action={
                <Link
                  to="/"
                  search={{ status: "Open", sort: "closing" }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                >
                  View all
                  <ArrowUpRight className="size-3.5" />
                </Link>
              }
            >
              <ul className="divide-y divide-border">
                {closingSoon.map((t) => {
                  const days = daysToClose(t.closingDate);
                  const urgent = days <= 3;
                  return (
                    <li key={t.tenderId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.title}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.agency}</p>
                      </div>
                      <RelevanceBadge relevance={t.relevance} />
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
                          urgent
                            ? "bg-urgent/12 text-urgent"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {days === 0 ? "Today" : `${days}d left`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="Top agencies" subtitle="Most active buyers in our space">
              <ol className="divide-y divide-border">
                {topAgencies.map((a, i) => (
                  <li key={a.agency} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.agency}</span>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      {a.count} {a.count === 1 ? "tender" : "tenders"}
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}
