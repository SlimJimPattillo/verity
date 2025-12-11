import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, Save, Check, Database, TrendingUp } from "lucide-react";
import { mockMetrics } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function GrantCopilot() {
  const [question, setQuestion] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!question.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const answer = `Based on our program data, Metroville Food Bank has demonstrated significant impact in addressing food insecurity within our community. In the past year alone, we have served over 5,000 meals to families in need, representing a 19% increase from the previous year.

Our outcomes-focused approach has yielded measurable results: we've achieved a 15% reduction in reported food insecurity among our regular recipients, with 88% of our resources directed toward program delivery. This efficiency ensures that donor contributions are maximized for community benefit.

Furthermore, our family-centered model has allowed us to assist 1,250 households, providing not just immediate nutrition support but also connecting families with additional resources for long-term food security. The 23% improvement in food security scores among regular recipients demonstrates the lasting impact of our comprehensive approach.`;
      
      setGeneratedAnswer(answer);
      setIsGenerating(false);
    }, 2000);
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

  const handleSaveToVault = () => {
    toast({
      title: "Saved to Asset Vault",
      description: "This answer has been saved for future use.",
    });
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
              {mockMetrics.map((metric) => (
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
