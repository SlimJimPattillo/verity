import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { SortableMetricCard } from "@/components/report-builder/SortableMetricCard";
import { MetricBuilderModal } from "@/components/report-builder/MetricBuilderModal";
import { InteractiveReportPreview } from "@/components/report-builder/InteractiveReportPreview";
import { InspectorPanel } from "@/components/report-builder/InspectorPanel";
import { Metric, mockOrganization } from "@/lib/mockData";
import { sectorConfigs } from "@/lib/sectorData";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function ReportBuilder() {
  const { selectedSector, completeStep } = useOnboarding();
  const sectorData = selectedSector ? sectorConfigs[selectedSector] : null;

  const [metrics, setMetrics] = useState<Metric[]>(() => {
    if (sectorData) {
      return sectorData.metrics.map((m, i) => ({ ...m, id: `sector-${i}` }));
    }
    return [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("2024 Annual Impact Report");
  const [dateRange, setDateRange] = useState("January - December 2024");
  const [narrative, setNarrative] = useState(() => {
    return sectorData?.narrative || "";
  });
  const [financials, setFinancials] = useState({
    program: 85,
    admin: 10,
    fundraising: 5,
  });
  const [viewMode, setViewMode] = useState<"pdf" | "social">("pdf");
  const [primaryColor, setPrimaryColor] = useState(mockOrganization.primaryColor);
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);

  // Get selected metric
  const selectedMetric = selectedMetricId 
    ? metrics.find((m) => m.id === selectedMetricId) || null 
    : null;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update data when sector changes
  useEffect(() => {
    if (sectorData) {
      setMetrics(sectorData.metrics.map((m, i) => ({ ...m, id: `sector-${i}` })));
      setNarrative(sectorData.narrative);
    }
  }, [selectedSector]);

  // Mark report as created when user makes changes
  useEffect(() => {
    if (metrics.length > 0 || narrative) {
      completeStep("reportCreated");
    }
  }, [metrics, narrative, completeStep]);

  const handleAddMetric = (metric: Omit<Metric, "id">) => {
    const newMetric: Metric = {
      ...metric,
      id: Date.now().toString(),
    };
    setMetrics([...metrics, newMetric]);
  };

  const handleDeleteMetric = (id: string) => {
    setMetrics(metrics.filter((m) => m.id !== id));
    if (selectedMetricId === id) {
      setSelectedMetricId(null);
    }
  };

  const handleMetricUpdate = (id: string, updates: Partial<Metric>) => {
    setMetrics(metrics.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleSettingsUpdate = (updates: Partial<{ title: string; dateRange: string; primaryColor: string }>) => {
    if (updates.title !== undefined) setTitle(updates.title);
    if (updates.dateRange !== undefined) setDateRange(updates.dateRange);
    if (updates.primaryColor !== undefined) setPrimaryColor(updates.primaryColor);
  };

  const handleMetricDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex h-screen animate-fade-in">
      {/* Left Column - Inspector Panel */}
      <div className="flex w-80 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {selectedMetric ? "Edit Metric" : "Report Settings"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {selectedMetric 
                  ? "Adjust properties in the panel below" 
                  : "Click a metric in preview to edit it"}
              </p>
            </div>
            {selectedMetric && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMetricId(null)}
                className="text-xs"
              >
                Done
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <InspectorPanel
            selectedMetric={selectedMetric}
            reportSettings={{ title, dateRange, primaryColor }}
            onMetricUpdate={handleMetricUpdate}
            onMetricDelete={handleDeleteMetric}
            onSettingsUpdate={handleSettingsUpdate}
            onDeselect={() => setSelectedMetricId(null)}
          />
        </div>

        {/* Metrics List */}
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Your Metrics ({metrics.length})
            </span>
          </div>
          <div className="max-h-48 space-y-2 overflow-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleMetricDragEnd}
            >
              <SortableContext
                items={metrics.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                {metrics.length > 0 ? (
                  metrics.map((metric) => (
                    <SortableMetricCard
                      key={metric.id}
                      metric={metric}
                      onDelete={handleDeleteMetric}
                      isSelected={selectedMetricId === metric.id}
                      onSelect={() => setSelectedMetricId(metric.id)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No metrics yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Click below to add your first metric</p>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full gap-2 border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Metric
          </Button>
        </div>
      </div>

      {/* Right Column - Preview */}
      <div className="flex flex-1 flex-col bg-muted/50">
        {/* Preview Toggle */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <span className="text-sm font-medium text-foreground">Live Preview</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">PDF Preview</span>
            <Switch
              checked={viewMode === "social"}
              onCheckedChange={(checked) => setViewMode(checked ? "social" : "pdf")}
            />
            <span className="text-sm text-muted-foreground">Social Media</span>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-8">
          <InteractiveReportPreview
            title={title}
            dateRange={dateRange}
            metrics={metrics}
            narrative={narrative}
            financials={financials}
            viewMode={viewMode}
            primaryColor={primaryColor}
            selectedMetricId={selectedMetricId}
            onMetricSelect={setSelectedMetricId}
            onMetricUpdate={handleMetricUpdate}
            onCanvasClick={() => setSelectedMetricId(null)}
            onAddMetric={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* Metric Builder Modal */}
      <MetricBuilderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleAddMetric}
      />
    </div>
  );
}
