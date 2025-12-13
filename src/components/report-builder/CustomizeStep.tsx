import { Palette, Type, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CustomizeStepProps {
  settings: {
    title: string;
    dateRange: string;
    primaryColor: string;
    secondaryColor: string;
    neutralColor: string;
  };
  onSettingsChange: (updates: Partial<{ 
    title: string; 
    dateRange: string; 
    primaryColor: string;
    secondaryColor: string;
    neutralColor: string;
  }>) => void;
}

interface ColorPickerProps {
  label: string;
  helperText: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, helperText, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Label className="text-sm font-medium">{label}</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{helperText}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-lg border border-border shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm uppercase"
          maxLength={7}
        />
      </div>
    </div>
  );
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

      {/* Report Details */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Report Details</CardTitle>
          <CardDescription>Basic information for your report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Type className="h-4 w-4 text-muted-foreground" />
              Report Title
            </Label>
            <Input
              value={settings.title}
              onChange={(e) => onSettingsChange({ title: e.target.value })}
              placeholder="e.g., 2024 Annual Impact Report"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date Range
            </Label>
            <Input
              value={settings.dateRange}
              onChange={(e) => onSettingsChange({ dateRange: e.target.value })}
              placeholder="e.g., January - December 2024"
            />
          </div>
        </CardContent>
      </Card>

      {/* Report Colors */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Report Colors</CardTitle>
          <CardDescription>
            Customize the color palette for this specific report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Core Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h4 className="text-sm font-semibold text-foreground">Core Brand</h4>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ColorPicker
                label="Primary (Headers & Buttons)"
                helperText="Used for main headers, footers, and key elements."
                value={settings.primaryColor}
                onChange={(color) => onSettingsChange({ primaryColor: color })}
              />
              <ColorPicker
                label="Secondary (Charts & Accents)"
                helperText="Used for charts, icons, and accent elements."
                value={settings.secondaryColor}
                onChange={(color) => onSettingsChange({ secondaryColor: color })}
              />
            </div>
          </div>

          {/* Neutrals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Backgrounds & Surfaces</h4>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ColorPicker
                label="Neutral (Background)"
                helperText="Used for page backgrounds and card surfaces."
                value={settings.neutralColor}
                onChange={(color) => onSettingsChange({ neutralColor: color })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
