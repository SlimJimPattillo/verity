import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Loader2 } from "lucide-react";
import { InteractiveReportPreview } from "@/components/report-builder/InteractiveReportPreview";
import { AddMetricModal } from "@/components/data-input/AddMetricModal";
import { ReportBuilderStepper, BuilderStep } from "@/components/report-builder/ReportBuilderStepper";
import { TemplateLibrary } from "@/components/report-builder/TemplateLibrary";
import { DataUploadStep } from "@/components/report-builder/DataUploadStep";
import { MetricsEditor } from "@/components/report-builder/MetricsEditor";
import { CustomizeStep } from "@/components/report-builder/CustomizeStep";
import { ExportStep } from "@/components/report-builder/ExportStep";
import { Metric } from "@/lib/mockData";
import { sectorConfigs } from "@/lib/sectorData";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generatePDF, generatePNG } from "@/lib/pdf-export";

export default function ReportBuilder() {
  const { selectedSector, completeStep } = useOnboarding();
  const { organizationId, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');
  const sectorData = selectedSector ? sectorConfigs[selectedSector] : null;

  const [loading, setLoading] = useState(!!reportId);
  const [saving, setSaving] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(reportId);

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
  const [reportName, setReportName] = useState("2024 Annual Impact Report");
  const [reportType, setReportType] = useState<"Annual Report" | "Grant Application" | "Impact Report">("Annual Report");
  const [reportStatus, setReportStatus] = useState<"Draft" | "Published" | "Under Review">("Draft");
  const [title, setTitle] = useState("2024 Annual Impact Report");
  const [dateRange, setDateRange] = useState("January - December 2024");
  const [narrative, setNarrative] = useState(() => sectorData?.narrative || "");
  const [financials] = useState({
    program: 85,
    admin: 10,
    fundraising: 5,
  });
  const [viewMode, setViewMode] = useState<"pdf" | "social">("pdf");
  const [primaryColor, setPrimaryColor] = useState("#059669");
  const [secondaryColor, setSecondaryColor] = useState("#FFC27B");
  const [neutralColor, setNeutralColor] = useState("#F9FAFB");
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);

  // Load existing report if ID provided
  useEffect(() => {
    if (reportId && organizationId) {
      loadReport(reportId);
    } else {
      setLoading(false);
    }
  }, [reportId, organizationId]);

  // Update data when sector changes (only if no report loaded)
  useEffect(() => {
    if (sectorData && !reportId) {
      setMetrics(sectorData.metrics.map((m, i) => ({ ...m, id: `sector-${i}` })));
      setNarrative(sectorData.narrative);
    }
  }, [selectedSector, reportId]);

  const loadReport = async (id: string) => {
    try {
      // Load report
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (reportError) throw reportError;

      // Load associated metrics
      const { data: reportMetrics, error: metricsError } = await supabase
        .from('report_metrics')
        .select('metric_id, sort_order, metrics(*)')
        .eq('report_id', id)
        .order('sort_order');

      if (metricsError) throw metricsError;

      // Set report data
      setReportName(reportData.name);
      setReportType(reportData.type);
      setReportStatus(reportData.status);
      setTitle(reportData.title || "");
      setDateRange(reportData.date_range || "");
      setNarrative(reportData.narrative || "");
      setPrimaryColor(reportData.primary_color || "#059669");
      setSecondaryColor(reportData.secondary_color || "#FFC27B");
      setNeutralColor(reportData.neutral_color || "#F9FAFB");
      setSelectedTemplate(reportData.template_id);

      // Set metrics
      const loadedMetrics: Metric[] = reportMetrics
        .filter(rm => rm.metrics)
        .map((rm: any) => ({
          id: rm.metrics.id,
          label: rm.metrics.label,
          value: Number(rm.metrics.value),
          unit: rm.metrics.unit as Metric['unit'],
          type: rm.metrics.type as Metric['type'],
          comparison: rm.metrics.comparison || undefined,
          previousValue: rm.metrics.previous_value ? Number(rm.metrics.previous_value) : undefined,
        }));

      setMetrics(loadedMetrics);
      toast.success('Report loaded successfully');
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!organizationId) return;

    setSaving(true);
    try {
      const reportData = {
        organization_id: organizationId,
        name: reportName,
        type: reportType,
        status: reportStatus,
        title,
        date_range: dateRange,
        narrative,
        template_id: selectedTemplate,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        neutral_color: neutralColor,
        financials: financials,
        created_by: user?.id,
      };

      let savedReportId = currentReportId;

      if (currentReportId) {
        // Update existing report
        const { error } = await supabase
          .from('reports')
          .update(reportData)
          .eq('id', currentReportId);

        if (error) throw error;
      } else {
        // Create new report
        const { data, error } = await supabase
          .from('reports')
          .insert(reportData)
          .select()
          .single();

        if (error) throw error;
        savedReportId = data.id;
        setCurrentReportId(savedReportId);
      }

      // Delete existing metric associations
      if (savedReportId) {
        await supabase
          .from('report_metrics')
          .delete()
          .eq('report_id', savedReportId);

        // Insert metric associations
        if (metrics.length > 0) {
          const reportMetrics = metrics.map((metric, index) => ({
            report_id: savedReportId,
            metric_id: metric.id,
            sort_order: index,
          }));

          const { error: metricsError } = await supabase
            .from('report_metrics')
            .insert(reportMetrics);

          if (metricsError) throw metricsError;
        }
      }

      toast.success('Report saved successfully');
      completeStep('reportCreated');
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

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
    // Replace existing metrics instead of appending
    // This is expected behavior when uploading a file (replaces template/sector defaults)
    setMetrics(metricsWithIds);
  };

  const handleMetricUpdate = (id: string, updates: Partial<Metric>) => {
    setMetrics(metrics.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleSettingsUpdate = (updates: Partial<{ title: string; dateRange: string; primaryColor: string; secondaryColor: string; neutralColor: string }>) => {
    if (updates.title !== undefined) setTitle(updates.title);
    if (updates.dateRange !== undefined) setDateRange(updates.dateRange);
    if (updates.primaryColor !== undefined) setPrimaryColor(updates.primaryColor);
    if (updates.secondaryColor !== undefined) setSecondaryColor(updates.secondaryColor);
    if (updates.neutralColor !== undefined) setNeutralColor(updates.neutralColor);
  };

  const handleExport = async (format: "pdf" | "png" | "share") => {
    console.log('handleExport called with format:', format);
    console.log('Current state:', {
      organizationId,
      metricsCount: metrics.length,
      title,
      currentReportId
    });

    try {
      // Validate required data
      if (!organizationId) {
        console.error('Export failed: No organizationId');
        toast.error('Organization not found. Please log in again.');
        return;
      }

      if (metrics.length === 0) {
        console.error('Export failed: No metrics');
        toast.error('Please add at least one metric before exporting.');
        return;
      }

      if (!title.trim()) {
        console.error('Export failed: No title');
        toast.error('Please add a report title before exporting.');
        return;
      }

      console.log('Validation passed, starting save...');

      // Save before exporting
      toast.loading('Saving report...', { id: 'save-before-export' });
      await saveReport();

      // Verify save succeeded by checking if we have a report ID
      if (!currentReportId && format === 'share') {
        toast.error('Failed to save report. Please try again.', { id: 'save-before-export' });
        return;
      }
      toast.dismiss('save-before-export');

      // Load organization name for the PDF
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();

      if (orgError) {
        console.error('Error loading organization:', orgError);
      }

      const organizationName = orgData?.name || 'Your Organization';

      if (format === 'pdf') {
        toast.loading('Generating PDF...', { id: 'pdf-export' });
        await generatePDF({
          title,
          dateRange,
          narrative,
          metrics,
          organizationName,
          primaryColor,
          financials,
        });
        toast.success('PDF downloaded successfully!', { id: 'pdf-export' });
      } else if (format === 'png') {
        toast.loading('Generating image...', { id: 'png-export' });
        await generatePNG({
          title,
          dateRange,
          narrative,
          metrics,
          organizationName,
          primaryColor,
          financials,
        });
        toast.success('Image downloaded successfully!', { id: 'png-export' });
      } else if (format === 'share') {
        // Verify we have a saved report ID
        if (!currentReportId) {
          toast.error('Please save your report before sharing.');
          return;
        }

        // Copy report URL to clipboard
        const reportUrl = `${window.location.origin}/report-builder?id=${currentReportId}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(reportUrl);
          toast.success('Report link copied to clipboard!');
        } else {
          // Fallback for browsers that don't support clipboard API
          const textArea = document.createElement('textarea');
          textArea.value = reportUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            toast.success('Report link copied to clipboard!');
          } catch (err) {
            toast.error('Failed to copy link. Please copy manually: ' + reportUrl);
          } finally {
            document.body.removeChild(textArea);
          }
        }
      }
    } catch (error) {
      console.error('Export error:', error);

      // Provide specific error messages
      if (error instanceof Error) {
        if (error.message.includes('preview')) {
          toast.error('Could not capture preview. Please ensure the preview is visible.', { id: 'png-export' });
        } else if (error.message.includes('PDF')) {
          toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-export' });
        } else {
          toast.error(`Export failed: ${error.message}`);
        }
      } else {
        toast.error('Failed to export report. Please try again.');
      }
    }
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
            settings={{ title, dateRange, primaryColor, secondaryColor, neutralColor }}
            onSettingsChange={handleSettingsUpdate}
          />
        );
      case "export":
        return <ExportStep onExport={handleExport} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col animate-fade-in">
      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <ReportBuilderStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setCurrentStep}
        />
        <Button
          onClick={saveReport}
          disabled={saving}
          className="gap-2"
          variant="default"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Report
            </>
          )}
        </Button>
      </div>

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
