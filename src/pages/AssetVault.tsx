import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Hash, Percent, Users, DollarSign, FileText, Image, MoreHorizontal, Upload, Trash2, Pencil, Loader2 } from "lucide-react";
import { Metric } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { AddMetricModal } from "@/components/data-input/AddMetricModal";
import { EditMetricModal } from "@/components/data-input/EditMetricModal";
import { CSVUploadModal } from "@/components/data-input/CSVUploadModal";
import { NarrativeModal } from "@/components/data-input/NarrativeModal";
import { QuickAddBar } from "@/components/data-input/QuickAddBar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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

interface Narrative {
  id: string;
  title: string;
  content: string;
  tags?: string[] | null;
  source?: 'manual' | 'ai_generated' | 'imported' | null;
  created_at: string;
}

export default function AssetVault() {
  const { organizationId, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // Narratives state
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [narrativeModalOpen, setNarrativeModalOpen] = useState(false);
  const [narrativeMode, setNarrativeMode] = useState<'add' | 'edit'>('add');
  const [editingNarrative, setEditingNarrative] = useState<Narrative | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database metrics to frontend format
      const mappedMetrics: Metric[] = (data || []).map((m) => ({
        id: m.id,
        label: m.label,
        value: Number(m.value),
        unit: m.unit as Metric['unit'],
        type: m.type as Metric['type'],
        comparison: m.comparison || undefined,
        previousValue: m.previous_value ? Number(m.previous_value) : undefined,
      }));

      setMetrics(mappedMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const loadNarratives = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('narratives')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNarratives(data || []);
    } catch (error) {
      console.error('Error loading narratives:', error);
      toast.error('Failed to load narratives');
    }
  }, [organizationId]);

  // Load metrics and narratives from Supabase
  useEffect(() => {
    if (organizationId) {
      loadMetrics();
      loadNarratives();
    }
  }, [organizationId, loadMetrics, loadNarratives]);

  const filteredMetrics = metrics.filter((m) =>
    m.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMetric = async (metric: Omit<Metric, "id">) => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('metrics')
        .insert({
          organization_id: organizationId,
          label: metric.label,
          value: metric.value,
          unit: metric.unit,
          type: metric.type,
          comparison: metric.comparison || null,
          previous_value: metric.previousValue || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newMetric: Metric = {
        id: data.id,
        label: data.label,
        value: Number(data.value),
        unit: data.unit,
        type: data.type,
        comparison: data.comparison || undefined,
        previousValue: data.previous_value ? Number(data.previous_value) : undefined,
      };

      setMetrics([newMetric, ...metrics]);
      toast.success("Metric added to vault");
    } catch (error) {
      console.error('Error adding metric:', error);
      toast.error('Failed to add metric');
    }
  };

  const handleImportMetrics = async (newMetrics: Omit<Metric, "id">[]) => {
    if (!organizationId) return;

    try {
      const metricsToInsert = newMetrics.map((m) => ({
        organization_id: organizationId,
        label: m.label,
        value: m.value,
        unit: m.unit,
        type: m.type,
        comparison: m.comparison || null,
        previous_value: m.previousValue || null,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from('metrics')
        .insert(metricsToInsert)
        .select();

      if (error) throw error;

      const mappedMetrics: Metric[] = (data || []).map((m) => ({
        id: m.id,
        label: m.label,
        value: Number(m.value),
        unit: m.unit,
        type: m.type,
        comparison: m.comparison || undefined,
        previousValue: m.previous_value ? Number(m.previous_value) : undefined,
      }));

      setMetrics([...mappedMetrics, ...metrics]);
      toast.success(`${mappedMetrics.length} metrics imported successfully`);
    } catch (error) {
      console.error('Error importing metrics:', error);
      toast.error('Failed to import metrics');
    }
  };

  const handleEditMetric = async (id: string, updatedMetric: Omit<Metric, "id">) => {
    try {
      const { error } = await supabase
        .from('metrics')
        .update({
          label: updatedMetric.label,
          value: updatedMetric.value,
          unit: updatedMetric.unit,
          type: updatedMetric.type,
          comparison: updatedMetric.comparison || null,
          previous_value: updatedMetric.previousValue || null,
        })
        .eq('id', id);

      if (error) throw error;

      setMetrics(metrics.map((m) =>
        m.id === id ? { id, ...updatedMetric } : m
      ));
      toast.success("Metric updated successfully");
    } catch (error) {
      console.error('Error updating metric:', error);
      toast.error('Failed to update metric');
    }
  };

  const handleDeleteMetric = async (id: string) => {
    try {
      const { error } = await supabase
        .from('metrics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMetrics(metrics.filter((m) => m.id !== id));
      toast.success("Metric deleted");
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast.error('Failed to delete metric');
    }
  };

  const openEditModal = (metric: Metric) => {
    setEditingMetric(metric);
    setEditModalOpen(true);
  };

  // Narrative handlers
  const handleAddNarrative = async (narrative: Omit<Narrative, "id" | "created_at">) => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('narratives')
        .insert({
          organization_id: organizationId,
          title: narrative.title,
          content: narrative.content,
          tags: narrative.tags || null,
          source: narrative.source || 'manual',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setNarratives([data, ...narratives]);
      toast.success("Narrative added successfully");
    } catch (error) {
      console.error('Error adding narrative:', error);
      toast.error('Failed to add narrative');
    }
  };

  const handleEditNarrative = async (narrative: Omit<Narrative, "id" | "created_at">) => {
    if (!editingNarrative) return;

    try {
      const { error } = await supabase
        .from('narratives')
        .update({
          title: narrative.title,
          content: narrative.content,
          tags: narrative.tags || null,
        })
        .eq('id', editingNarrative.id);

      if (error) throw error;

      setNarratives(narratives.map((n) =>
        n.id === editingNarrative.id
          ? { ...n, title: narrative.title, content: narrative.content, tags: narrative.tags || null }
          : n
      ));
      toast.success("Narrative updated successfully");
    } catch (error) {
      console.error('Error updating narrative:', error);
      toast.error('Failed to update narrative');
    }
  };

  const handleDeleteNarrative = async (id: string) => {
    try {
      const { error } = await supabase
        .from('narratives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNarratives(narratives.filter((n) => n.id !== id));
      toast.success("Narrative deleted");
    } catch (error) {
      console.error('Error deleting narrative:', error);
      toast.error('Failed to delete narrative');
    }
  };

  const openAddNarrativeModal = () => {
    setNarrativeMode('add');
    setEditingNarrative(null);
    setNarrativeModalOpen(true);
  };

  const openEditNarrativeModal = (narrative: Narrative) => {
    setNarrativeMode('edit');
    setEditingNarrative(narrative);
    setNarrativeModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            Import Data
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
            Narratives ({narratives.length})
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
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => openEditModal(metric)}
                            >
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
                    : "Start by adding metrics manually or importing from CSV/Excel"}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => setCsvModalOpen(true)}>
                    <Upload className="h-4 w-4" />
                    Import Data
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
        <TabsContent value="narratives" className="space-y-6">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={openAddNarrativeModal}>
              <Plus className="h-4 w-4" />
              Add Narrative
            </Button>
          </div>

          {narratives.length > 0 ? (
            <div className="space-y-4">
              {narratives.map((narrative) => (
                <Card
                  key={narrative.id}
                  className="group border-border shadow-soft transition-shadow hover:shadow-medium"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {narrative.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {narrative.content}
                          </p>
                          {narrative.tags && narrative.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {narrative.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(narrative.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => openEditNarrativeModal(narrative)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDeleteNarrative(narrative.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-border bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  No narratives yet
                </h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Create reusable narrative snippets for your reports and grant applications
                </p>
                <Button className="gap-2" onClick={openAddNarrativeModal}>
                  <Plus className="h-4 w-4" />
                  Add Narrative
                </Button>
              </CardContent>
            </Card>
          )}
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
      <EditMetricModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleEditMetric}
        metric={editingMetric}
      />
      <CSVUploadModal
        open={csvModalOpen}
        onOpenChange={setCsvModalOpen}
        onImport={handleImportMetrics}
      />
      <NarrativeModal
        open={narrativeModalOpen}
        onOpenChange={setNarrativeModalOpen}
        onSave={narrativeMode === 'add' ? handleAddNarrative : handleEditNarrative}
        narrative={editingNarrative}
        mode={narrativeMode}
      />
    </div>
  );
}
