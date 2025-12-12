import { Metric, mockOrganization } from "@/lib/mockData";
import { TrendingUp, Users, Hash, DollarSign, Percent } from "lucide-react";
import { FinancialsDonutChart } from "@/components/charts/FinancialsDonutChart";
import { MicroBarChart } from "@/components/charts/MicroBarChart";

interface ReportPreviewProps {
  title: string;
  dateRange: string;
  metrics: Metric[];
  narrative: string;
  financials: { program: number; admin: number; fundraising: number };
  viewMode: "pdf" | "social";
  primaryColor: string;
}

const unitIcons = {
  "$": DollarSign,
  "%": Percent,
  "People": Users,
  "#": Hash,
};

export function ReportPreview({
  title,
  dateRange,
  metrics,
  narrative,
  financials,
  viewMode,
  primaryColor,
}: ReportPreviewProps) {
  const outcomes = metrics.filter((m) => m.type === "outcome");
  const outputs = metrics.filter((m) => m.type === "output");
  const heroOutcome = outcomes[0];

  if (viewMode === "social") {
    return (
      <div className="social-container mx-auto flex flex-col overflow-hidden rounded-lg">
        {/* Header Band */}
        <div
          className="flex items-center justify-center py-6"
          style={{ backgroundColor: primaryColor }}
        >
          <h1 className="text-2xl font-bold text-white">{title || "Impact Report"}</h1>
        </div>

        {/* Hero Number */}
        {heroOutcome && (
          <div className="flex flex-1 flex-col items-center justify-center px-8">
            <div className="text-center">
              <p
                className="text-7xl font-bold"
                style={{ color: primaryColor }}
              >
                {heroOutcome.unit === "$" && "$"}
                {heroOutcome.value.toLocaleString()}
                {heroOutcome.unit === "%" && "%"}
              </p>
              <p className="mt-2 text-xl font-medium text-slate-700">
                {heroOutcome.label}
              </p>
              {heroOutcome.comparison && (
                <p className="mt-1 text-sm text-slate-500">{heroOutcome.comparison}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center border-t border-slate-200 py-4">
          <p className="text-sm font-medium text-slate-600">
            {mockOrganization.name} • {dateRange || "2024"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container mx-auto overflow-hidden rounded-sm">
      {/* Header Band */}
      <div
        className="flex items-center justify-between px-8 py-6"
        style={{ backgroundColor: primaryColor }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">{title || "Impact Report"}</h1>
          <p className="text-sm text-white/80">{dateRange || "January - December 2024"}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
          <span className="text-sm font-bold text-white">
            {mockOrganization.name.split(" ").map((w) => w[0]).join("")}
          </span>
        </div>
      </div>

      {/* Hero Zone - Main Outcome */}
      {heroOutcome && (
        <div className="border-b border-slate-200 bg-slate-50 px-8 py-10 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
            Verified Impact
          </p>
          <p
            className="text-5xl font-bold"
            style={{ color: primaryColor }}
          >
            {heroOutcome.unit === "$" && "$"}
            {heroOutcome.value.toLocaleString()}
            {heroOutcome.unit === "%" && "%"}
          </p>
          <p className="mt-2 text-lg font-medium text-slate-700">
            {heroOutcome.label}
          </p>
          {heroOutcome.comparison && heroOutcome.previousValue ? (
            <div className="mx-auto mt-4 max-w-[200px]">
              <MicroBarChart
                currentValue={heroOutcome.value}
                previousValue={heroOutcome.previousValue}
                primaryColor={primaryColor}
              />
              <p className="mt-1 flex items-center justify-center gap-1 text-xs" style={{ color: primaryColor }}>
                <TrendingUp className="h-3 w-3" />
                {heroOutcome.comparison}
              </p>
            </div>
          ) : heroOutcome.comparison ? (
            <div 
              className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <TrendingUp className="h-3 w-3" />
              {heroOutcome.comparison}
            </div>
          ) : null}
        </div>
      )}

      {/* Grid Zone - Output Metrics */}
      <div className="grid grid-cols-3 gap-4 px-8 py-8">
        {outputs.slice(0, 6).map((metric) => {
          const Icon = unitIcons[metric.unit];
          return (
            <div
              key={metric.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold text-slate-800">
                    {metric.unit === "$" && "$"}
                    {metric.value.toLocaleString()}
                    {metric.unit === "%" && "%"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {metric.label}
                  </p>
                </div>
              </div>
              {/* Micro Bar Chart for comparison */}
              {metric.previousValue && (
                <div className="mt-3">
                  <MicroBarChart
                    currentValue={metric.value}
                    previousValue={metric.previousValue}
                    primaryColor={primaryColor}
                  />
                  {metric.comparison && (
                    <p className="mt-1 text-[10px] text-slate-500">{metric.comparison}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Narrative Section */}
      {narrative && (
        <div className="border-t border-slate-200 px-8 py-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Our Story
          </h3>
          <p className="text-sm leading-relaxed text-slate-600">{narrative}</p>
        </div>
      )}

      {/* Financials with Donut Chart */}
      <div className="border-t border-slate-200 px-8 py-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Financial Breakdown
        </h3>
        <div className="flex items-center gap-8">
          <FinancialsDonutChart
            program={financials.program}
            admin={financials.admin}
            fundraising={financials.fundraising}
            primaryColor={primaryColor}
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-sm text-slate-600">
                Programs: {financials.program}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-400" />
              <span className="text-sm text-slate-600">
                Admin: {financials.admin}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-200" />
              <span className="text-sm text-slate-600">
                Fundraising: {financials.fundraising}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-auto px-8 py-4"
        style={{ backgroundColor: `${primaryColor}10` }}
      >
        <p className="text-center text-xs text-slate-500">
          {mockOrganization.name} • www.metrovillefoodbank.org
        </p>
      </div>
    </div>
  );
}
