import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, Save, Check, Database, TrendingUp, Loader2 } from "lucide-react";
import { Metric } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { generateGrantAnswer } from "@/lib/api";
import { toast as sonnerToast } from "sonner";

export default function GrantCopilot() {
  const { organizationId, user } = useAuth();
  const [question, setQuestion] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState("");
  const [currentAnswerId, setCurrentAnswerId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [orgName, setOrgName] = useState("Your Organization");
  const { toast } = useToast();

  const loadMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
    } finally {
      setLoadingMetrics(false);
    }
  }, [organizationId]);

  const loadOrgName = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      if (data) setOrgName(data.name);
    } catch (error) {
      console.error('Error loading org name:', error);
    }
  }, [organizationId]);

  // Load metrics and org name
  useEffect(() => {
    loadMetrics();
    loadOrgName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const handleGenerate = async () => {
    if (!question.trim()) return;
    if (metrics.length === 0) {
      sonnerToast.error("Please add some metrics to your Asset Vault first");
      return;
    }

    setIsGenerating(true);
    setGeneratedAnswer("");
    setCurrentAnswerId(null);

    try {
      const answer = await generateGrantAnswer({
        question: question.trim(),
        metrics,
        organizationName: orgName,
        tone: tone as 'professional' | 'emotional' | 'urgent',
      });

      setGeneratedAnswer(answer);

      // Save to database
      const { data, error } = await supabase
        .from('grant_answers')
        .insert({
          organization_id: organizationId,
          question: question.trim(),
          answer,
          tone,
          metrics_used: metrics.map(m => m.id),
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentAnswerId(data.id);

    } catch (error) {
      console.error('Error generating answer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate answer';
      sonnerToast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "The answer has been copied to your clipboard.",
    });
  };

  const handleSaveToVault = async () => {
    if (!currentAnswerId || !generatedAnswer) return;

    try {
      // Create a narrative from the grant answer
      const { data: narrativeData, error: narrativeError } = await supabase
        .from('narratives')
        .insert({
          organization_id: organizationId,
          title: question.substring(0, 100), // Truncate long questions
          content: generatedAnswer,
          tags: ['grant-answer', tone],
          source: 'ai_generated',
          created_by: user?.id,
        })
        .select()
        .single();

      if (narrativeError) throw narrativeError;

      // Update grant_answer to link to narrative
      const { error: updateError } = await supabase
        .from('grant_answers')
        .update({
          saved_to_narratives: true,
          narrative_id: narrativeData.id,
        })
        .eq('id', currentAnswerId);

      if (updateError) throw updateError;

      sonnerToast.success("Saved to Asset Vault", {
        description: "This answer is now available in your narratives library.",
      });
    } catch (error) {
      console.error('Error saving to vault:', error);
      sonnerToast.error('Failed to save to vault');
    }
  };

  return (
    <div className="animate-fade-in p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Grant Copilot</h1>
        <p className="mt-1 text-muted-foreground">
          AI-powered grant writing assistance backed by your real data
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Input */}
        <div className="space-y-6 lg:col-span-2">
          {/* Question Input */}
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-base font-medium">
                    Grant Question
                  </Label>
                  <Textarea
                    id="question"
                    rows={6}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Paste the question from the grant portal here...

Example: 'Describe how your organization measures the impact of its programs and provide specific examples of outcomes achieved in the past year.'"
                    className="resize-none"
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="emotional">Emotional / Storytelling</SelectItem>
                        <SelectItem value="urgent">Urgent / Compelling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={!question.trim() || isGenerating}
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Answer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Output */}
          {generatedAnswer && (
            <Card className="animate-scale-in border-primary/20 bg-primary/5 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Generated Answer
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveToVault}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save to Vault
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {generatedAnswer}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Data Context */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-border shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Database className="h-4 w-4 text-primary" />
                Data Context
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                The AI will use these metrics to craft your answer
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        metric.type === "outcome" ? "bg-success" : "bg-primary"
                      }`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {metric.unit === "$" && "$"}
                    {metric.value.toLocaleString()}
                    {metric.unit === "%" && "%"}
                  </span>
                </div>
              ))}
              
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>AI grounds answers in your verified data</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
