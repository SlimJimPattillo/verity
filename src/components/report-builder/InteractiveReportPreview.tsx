import { Metric, mockOrganization } from "@/lib/mockData";
import { FinancialsDonutChart } from "@/components/charts/FinancialsDonutChart";
import { EditableMetricCard } from "./EditableMetricCard";
import { Plus } from "lucide-react";
import verityLogoImg from "@/assets/verity-logo.png";
import { cn } from "@/lib/utils";

interface InteractiveReportPreviewProps {
  title: string;
  dateRange: string;
  metrics: Metric[];
  narrative: string;
  financials: { program: number; admin: number; fundraising: number };
  viewMode: "pdf" | "social";
  primaryColor: string;
  selectedMetricId: string | null;
  onMetricSelect: (id: string | null) => void;
  onMetricUpdate: (id: string, updates: Partial<Metric>) => void;
  onCanvasClick: () => void;
  onAddMetric: () => void;
}

function EmptySlot({ onClick, hint }: { onClick: () => void; hint?: string }) {
  return (
    <div
      onClick={onClick}
      className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-md group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-primary/10">
        <Plus className="h-5 w-5 text-slate-400 transition-colors group-hover:text-primary" />
      </div>
      <div className="text-center">
        <span className="text-sm font-medium text-slate-500 group-hover:text-primary">Add Metric</span>
        {hint && (
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        )}
      </div>
    </div>
  );
}

export function InteractiveReportPreview({
  title,
  dateRange,
  metrics,
  narrative,
  financials,
  viewMode,
  primaryColor,
  selectedMetricId,
  onMetricSelect,
  onMetricUpdate,
  onCanvasClick,
  onAddMetric,
}: InteractiveReportPreviewProps) {
  const outcomes = metrics.filter((m) => m.type === "outcome");
  const outputs = metrics.filter((m) => m.type === "output");
  const heroOutcome = outcomes[0];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCanvasClick();
    }
  };

  if (viewMode === "social") {
    return (
      <div 
        className="social-container mx-auto flex flex-col overflow-hidden rounded-lg"
        onClick={handleCanvasClick}
      >
        {/* Header Band */}
        <div
          className="flex items-center justify-center py-6"
          style={{ backgroundColor: primaryColor }}
        >
          <h1 className="text-2xl font-bold text-white">{title || "Impact Report"}</h1>
        </div>

        {/* Hero Number */}
        {heroOutcome ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8">
            <EditableMetricCard
              metric={heroOutcome}
              isSelected={selectedMetricId === heroOutcome.id}
              primaryColor={primaryColor}
              onSelect={() => onMetricSelect(heroOutcome.id)}
              onUpdate={onMetricUpdate}
              variant="hero"
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptySlot onClick={onAddMetric} />
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
    <div 
      className="page-container mx-auto overflow-hidden rounded-sm"
      onClick={handleCanvasClick}
    >
      {/* Header Band */}
      <div
        className="flex items-center justify-between px-8 py-6"
        style={{ backgroundColor: primaryColor }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">{title || "Impact Report"}</h1>
          <p className="text-sm text-white/80">{dateRange || "January - December 2024"}</p>
        </div>
        <img
          src={verityLogoImg}
          alt="Verity Logo"
          className="h-10 w-10 object-contain"
        />
      </div>

      {/* Hero Zone - Main Outcome */}
      <div className="border-b border-slate-200 bg-slate-50">
        {heroOutcome ? (
          <EditableMetricCard
            metric={heroOutcome}
            isSelected={selectedMetricId === heroOutcome.id}
            primaryColor={primaryColor}
            onSelect={() => onMetricSelect(heroOutcome.id)}
            onUpdate={onMetricUpdate}
            variant="hero"
          />
        ) : (
          <div className="px-8 py-10">
            <EmptySlot onClick={onAddMetric} hint="Add your headline impact metric" />
          </div>
        )}
      </div>

      {/* Grid Zone - Output Metrics */}
      <div className="px-8 py-8" onClick={handleCanvasClick}>
        {outputs.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {outputs.slice(0, 6).map((metric) => (
              <EditableMetricCard
                key={metric.id}
                metric={metric}
                isSelected={selectedMetricId === metric.id}
                primaryColor={primaryColor}
                onSelect={() => onMetricSelect(metric.id)}
                onUpdate={onMetricUpdate}
                variant="grid"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <EmptySlot onClick={onAddMetric} hint="Track activities" />
            <EmptySlot onClick={onAddMetric} hint="Show effort" />
            <EmptySlot onClick={onAddMetric} hint="Measure output" />
          </div>
        )}
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
