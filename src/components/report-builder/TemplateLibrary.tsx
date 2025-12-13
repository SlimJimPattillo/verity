import { LayoutTemplate, FileText, BarChart3, PieChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  preview: string;
  popular?: boolean;
}

const templates: Template[] = [
  {
    id: "one-pager",
    name: "One-Pager",
    description: "Clean single-page report with hero metric and supporting stats",
    icon: FileText,
    preview: "bg-gradient-to-br from-primary/20 to-primary/5",
    popular: true,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Data-rich layout with charts and multiple metric sections",
    icon: BarChart3,
    preview: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
  },
  {
    id: "annual-report",
    name: "Annual Report",
    description: "Comprehensive multi-section report with financials",
    icon: PieChart,
    preview: "bg-gradient-to-br from-amber-500/20 to-amber-500/5",
  },
  {
    id: "social-card",
    name: "Social Card",
    description: "Square format optimized for social media sharing",
    icon: LayoutTemplate,
    preview: "bg-gradient-to-br from-purple-500/20 to-purple-500/5",
  },
];

interface TemplateLibraryProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateLibrary({ selectedTemplate, onSelectTemplate }: TemplateLibraryProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
          <LayoutTemplate className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Choose a Template</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a starting point for your impact report
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={cn(
                "group relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              {template.popular && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </div>
              )}
              
              <div className={cn(
                "mb-3 flex h-20 w-full items-center justify-center rounded-lg",
                template.preview
              )}>
                <Icon className={cn(
                  "h-8 w-8 transition-transform duration-200 group-hover:scale-110",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              
              <h3 className={cn(
                "text-sm font-medium transition-colors",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {template.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
