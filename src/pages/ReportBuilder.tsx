import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InteractiveReportPreview } from "@/components/report-builder/InteractiveReportPreview";
import { AddMetricModal } from "@/components/data-input/AddMetricModal";
import { ReportBuilderStepper, BuilderStep } from "@/components/report-builder/ReportBuilderStepper";
import { TemplateLibrary } from "@/components/report-builder/TemplateLibrary";
import { DataUploadStep } from "@/components/report-builder/DataUploadStep";
import { MetricsEditor } from "@/components/report-builder/MetricsEditor";
import { CustomizeStep } from "@/components/report-builder/CustomizeStep";
import { ExportStep } from "@/components/report-builder/ExportStep";
import { Metric, mockOrganization } from "@/lib/mockData";
import { sectorConfigs } from "@/lib/sectorData";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function ReportBuilder() {
  const { selectedSector, completeStep } = useOnboarding();
  const sectorData = selectedSector ? sectorConfigs[selectedSector] : null;

  // Step management
  const [currentStep, setCurrentStep] = useState<BuilderStep>("template");
  const [completedSteps, setCompletedSteps] = useState<BuilderStep[]>([]);

  // Template
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("one-pager");

  // Metrics
  const [metrics, setMetrics] = useState<Metric[]>(() => {
    if (sectorData) {
      return sectorData.metrics.map((m, i) => ({ ...m, id: `sector-${i}` }));
    }
    return [];
  });

  // Report settings
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("2024 Annual Impact Report");
  const [dateRange, setDateRange] = useState("January - December 2024");
  const [narrative, setNarrative] = useState(() => sectorData?.narrative || "");
  const [financials] = useState({
    program: 85,
    admin: 10,
    fundraising: 5,
  });
  const [viewMode, setViewMode] = useState<"pdf" | "social">("pdf");
  const [primaryColor, setPrimaryColor] = useState(mockOrganization.primaryColor);
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);

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

  const handleImportMetrics = (newMetrics: Omit<Metric, "id">[]) => {
    const metricsWithIds = newMetrics.map((m, i) => ({
      ...m,
      id: `import-${Date.now()}-${i}`,
    }));
    setMetrics([...metrics, ...metricsWithIds]);
  };

  const handleMetricUpdate = (id: string, updates: Partial<Metric>) => {
    setMetrics(metrics.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleSettingsUpdate = (updates: Partial<{ title: string; dateRange: string; primaryColor: string }>) => {
    if (updates.title !== undefined) setTitle(updates.title);
    if (updates.dateRange !== undefined) setDateRange(updates.dateRange);
    if (updates.primaryColor !== undefined) setPrimaryColor(updates.primaryColor);
  };

  const handleExport = (format: "pdf" | "png" | "share") => {
    console.log("Exporting as:", format);
    // Export logic would go here
  };

  // Step navigation
  const stepOrder: BuilderStep[] = ["template", "upload", "edit", "customize", "export"];
  const currentIndex = stepOrder.indexOf(currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case "template":
        return !!selectedTemplate;
      case "upload":
        return metrics.length > 0;
      case "edit":
        return metrics.length > 0;
      case "customize":
        return !!title;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (currentIndex < stepOrder.length - 1 && canProceed()) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "template":
        return (
          <TemplateLibrary
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />
        );
      case "upload":
        return (
          <DataUploadStep
            metrics={metrics}
            onImportMetrics={handleImportMetrics}
            onAddManually={() => setModalOpen(true)}
          />
        );
      case "edit":
        return (
          <MetricsEditor
            metrics={metrics}
            onMetricsChange={setMetrics}
            onAddMetric={() => setModalOpen(true)}
          />
        );
      case "customize":
        return (
          <CustomizeStep
            settings={{ title, dateRange, primaryColor }}
            onSettingsChange={handleSettingsUpdate}
          />
        );
      case "export":
        return <ExportStep onExport={handleExport} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col animate-fade-in">
      {/* Stepper Header */}
      <ReportBuilderStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={setCurrentStep}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Step Content */}
        <div className="flex w-96 flex-col border-r border-border bg-card">
          <div className="flex-1 overflow-auto p-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-border p-4">
            <div className="flex gap-3">
              {currentIndex > 0 && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={goToPreviousStep}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              {currentIndex < stepOrder.length - 1 && (
                <Button
                  className="flex-1 gap-2"
                  onClick={goToNextStep}
                  disabled={!canProceed()}
                >
                  {currentStep === "customize" ? "Finish" : "Continue"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="flex flex-1 flex-col bg-muted/50">
          {/* Preview Toggle */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <span className="text-sm font-medium text-foreground">Live Preview</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">PDF</span>
              <Switch
                checked={viewMode === "social"}
                onCheckedChange={(checked) => setViewMode(checked ? "social" : "pdf")}
              />
              <span className="text-sm text-muted-foreground">Social</span>
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
      </div>

      {/* Add Metric Modal */}
      <AddMetricModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleAddMetric}
      />
    </div>
  );
}
