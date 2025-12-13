import { Palette, Type, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomizeStepProps {
  settings: {
    title: string;
    dateRange: string;
    primaryColor: string;
  };
  onSettingsChange: (updates: Partial<{ title: string; dateRange: string; primaryColor: string }>) => void;
}

export function CustomizeStep({ settings, onSettingsChange }: CustomizeStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Customize Your Report</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add your branding and report details
        </p>
      </div>

      <div className="space-y-4">
        {/* Report Title */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Type className="h-4 w-4 text-muted-foreground" />
            Report Title
          </Label>
          <Input
            value={settings.title}
            onChange={(e) => onSettingsChange({ title: e.target.value })}
            placeholder="e.g., 2024 Annual Impact Report"
            className="h-10"
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Image className="h-4 w-4 text-muted-foreground" />
            Date Range
          </Label>
          <Input
            value={settings.dateRange}
            onChange={(e) => onSettingsChange({ dateRange: e.target.value })}
            placeholder="e.g., January - December 2024"
            className="h-10"
          />
        </div>

        {/* Brand Color */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4 text-muted-foreground" />
            Brand Color
          </Label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => onSettingsChange({ primaryColor: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div 
                className="h-10 w-10 rounded-lg border border-border shadow-sm cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: settings.primaryColor }}
              />
            </div>
            <Input
              value={settings.primaryColor}
              onChange={(e) => onSettingsChange({ primaryColor: e.target.value })}
              className="h-10 flex-1 font-mono text-sm uppercase"
            />
          </div>
        </div>
      </div>

      {/* Quick Color Presets */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick Presets</Label>
        <div className="flex gap-2">
          {["#059669", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#1F2937"].map((color) => (
            <button
              key={color}
              onClick={() => onSettingsChange({ primaryColor: color })}
              className="h-8 w-8 rounded-full border-2 border-transparent hover:border-foreground/20 transition-all hover:scale-110"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
