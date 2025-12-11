import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { templateSuggestions } from "@/lib/mockData";

interface GetStartedCardProps {
  onSelectTemplate: (templateId: string) => void;
}

export function GetStartedCard({ onSelectTemplate }: GetStartedCardProps) {
  return (
    <Card className="border-2 border-dashed border-border bg-gradient-to-br from-muted/50 to-background">
      <CardContent className="flex flex-col items-center p-12 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          Magic Fill: Get Started Quickly
        </h3>
        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          Start with a pre-filled template designed for your sector. We'll populate
          example metrics and narratives that you can customize.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {templateSuggestions.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              onClick={() => onSelectTemplate(template.id)}
              className="gap-2 border-border bg-card shadow-soft transition-all hover:border-primary hover:shadow-medium"
            >
              <span>{template.icon}</span>
              <span>{template.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
