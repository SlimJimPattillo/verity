import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, FileText, Image as ImageIcon } from "lucide-react";
import { MetricCard } from "@/components/report-builder/MetricCard";
import { MetricBuilderModal } from "@/components/report-builder/MetricBuilderModal";
import { ReportPreview } from "@/components/report-builder/ReportPreview";
import { Metric, mockOrganization } from "@/lib/mockData";
import { sectorConfigs } from "@/lib/sectorData";
import { useOnboarding } from "@/hooks/useOnboarding";

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
  };

  return (
    <div className="flex h-screen animate-fade-in">
      {/* Left Column - Editor */}
      <div className="flex w-2/5 flex-col border-r border-border">
        <div className="border-b border-border p-4">
          <h1 className="text-xl font-semibold text-foreground">Report Builder</h1>
          <p className="text-sm text-muted-foreground">
            Create your impact report
            {sectorData && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {sectorData.label}
              </span>
            )}
          </p>
        </div>

        <Tabs defaultValue="content" className="flex-1">
          <div className="border-b border-border px-4">
            <TabsList className="h-12 w-full justify-start gap-4 bg-transparent p-0">
              <TabsTrigger
                value="content"
                className="h-12 rounded-none border-b-2 border-transparent px-1 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="design"
                className="h-12 rounded-none border-b-2 border-transparent px-1 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Design / Theme
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content" className="flex-1 overflow-auto p-4">
            <Accordion type="multiple" defaultValue={["header", "metrics"]} className="space-y-2">
              {/* Header Info */}
              <AccordionItem value="header" className="rounded-lg border border-border bg-card px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Header Info</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Input
                      id="dateRange"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Metrics */}
              <AccordionItem value="metrics" className="rounded-lg border border-border bg-card px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Metrics (Logic Model)</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {metrics.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  {metrics.map((metric) => (
                    <MetricCard
                      key={metric.id}
                      metric={metric}
                      onDelete={handleDeleteMetric}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Metric
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Narrative */}
              <AccordionItem value="narrative" className="rounded-lg border border-border bg-card px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Narrative</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="space-y-2">
                    <Label htmlFor="narrative">Story / Description</Label>
                    <Textarea
                      id="narrative"
                      rows={4}
                      value={narrative}
                      onChange={(e) => setNarrative(e.target.value)}
                      placeholder="Share the story behind your impact..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <div className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-muted-foreground/30">
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Financials */}
              <AccordionItem value="financials" className="rounded-lg border border-border bg-card px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Financials</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="program">Program %</Label>
                      <Input
                        id="program"
                        type="number"
                        value={financials.program}
                        onChange={(e) =>
                          setFinancials({ ...financials, program: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin">Admin %</Label>
                      <Input
                        id="admin"
                        type="number"
                        value={financials.admin}
                        onChange={(e) =>
                          setFinancials({ ...financials, admin: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fundraising">Fundraising %</Label>
                      <Input
                        id="fundraising"
                        type="number"
                        value={financials.fundraising}
                        onChange={(e) =>
                          setFinancials({ ...financials, fundraising: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="design" className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border border-border"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
          <ReportPreview
            title={title}
            dateRange={dateRange}
            metrics={metrics}
            narrative={narrative}
            financials={financials}
            viewMode={viewMode}
            primaryColor={primaryColor}
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
