import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Hash, Percent, Users, DollarSign, FileText, Image, MoreHorizontal, Upload, Trash2, Pencil } from "lucide-react";
import { mockMetrics, Metric } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { AddMetricModal } from "@/components/data-input/AddMetricModal";
import { CSVUploadModal } from "@/components/data-input/CSVUploadModal";
import { QuickAddBar } from "@/components/data-input/QuickAddBar";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const unitIcons = {
  "$": DollarSign,
  "%": Percent,
  "People": Users,
  "#": Hash,
};

const savedNarratives = [
  {
    id: "1",
    title: "2024 Impact Summary",
    excerpt: "This year, Metroville Food Bank has made tremendous strides...",
    date: "Jan 15, 2024",
  },
  {
    id: "2",
    title: "Grant Question: Measuring Impact",
    excerpt: "Based on our program data, Metroville Food Bank has demonstrated...",
    date: "Jan 12, 2024",
  },
];

export default function AssetVault() {
  const [searchQuery, setSearchQuery] = useState("");
  const [metrics, setMetrics] = useState<Metric[]>(mockMetrics);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const filteredMetrics = metrics.filter((m) =>
    m.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMetric = (metric: Omit<Metric, "id">) => {
    const newMetric: Metric = {
      ...metric,
      id: `vault-${Date.now()}`,
    };
    setMetrics([...metrics, newMetric]);
    toast.success("Metric added to vault");
  };

  const handleImportMetrics = (newMetrics: Omit<Metric, "id">[]) => {
    const metricsWithIds = newMetrics.map((m, i) => ({
      ...m,
      id: `import-${Date.now()}-${i}`,
    }));
    setMetrics([...metrics, ...metricsWithIds]);
  };

  const handleDeleteMetric = (id: string) => {
    setMetrics(metrics.filter((m) => m.id !== id));
    toast.success("Metric deleted");
  };

  return (
    <div className="animate-fade-in p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Asset Vault</h1>
          <p className="mt-1 text-muted-foreground">
            Your centralized library of metrics, narratives, and media
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setCsvModalOpen(true)}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Metric
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics" className="gap-2">
            <Hash className="h-4 w-4" />
            Metrics ({metrics.length})
          </TabsTrigger>
          <TabsTrigger value="narratives" className="gap-2">
            <FileText className="h-4 w-4" />
            Narratives
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2">
            <Image className="h-4 w-4" />
            Media
          </TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {/* Quick Add Bar */}
          <QuickAddBar onAdd={handleAddMetric} />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Metrics Grid */}
          {filteredMetrics.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMetrics.map((metric) => {
                const Icon = unitIcons[metric.unit];
                return (
                  <Card
                    key={metric.id}
                    className="group border-border shadow-soft transition-all hover:shadow-medium hover:border-primary/30"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg",
                            metric.type === "outcome"
                              ? "bg-primary/10"
                              : "bg-secondary/30"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              metric.type === "outcome"
                                ? "text-primary"
                                : "text-secondary-foreground"
                            )}
                          />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMetric(metric.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-foreground">
                          {metric.unit === "$" && "$"}
                          {metric.value.toLocaleString()}
                          {metric.unit === "%" && "%"}
                        </p>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs font-medium uppercase",
                            metric.type === "outcome"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary/50 text-secondary-foreground"
                          )}
                        >
                          {metric.type}
                        </Badge>
                        {metric.comparison && (
                          <span className="text-xs text-muted-foreground">
                            {metric.comparison}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-border bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Hash className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  {searchQuery ? "No metrics found" : "No metrics yet"}
                </h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search query" 
                    : "Start by adding metrics manually or importing from a spreadsheet"}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => setCsvModalOpen(true)}>
                    <Upload className="h-4 w-4" />
                    Import CSV
                  </Button>
                  <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Metric
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Narratives Tab */}
        <TabsContent value="narratives">
          <div className="space-y-4">
            {savedNarratives.map((narrative) => (
              <Card
                key={narrative.id}
                className="group border-border shadow-soft transition-shadow hover:shadow-medium"
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {narrative.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {narrative.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {narrative.date}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card className="border-2 border-dashed border-border bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">
                No media assets yet
              </h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Upload photos, logos, and graphics to use in your reports and
                grant applications.
              </p>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Media
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddMetricModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSave={handleAddMetric}
      />
      <CSVUploadModal
        open={csvModalOpen}
        onOpenChange={setCsvModalOpen}
        onImport={handleImportMetrics}
      />
    </div>
  );
}
