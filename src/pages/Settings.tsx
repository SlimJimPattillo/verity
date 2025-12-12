import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Palette, Building2, User, Bell } from "lucide-react";
import { mockOrganization, mockUser } from "@/lib/mockData";

export default function Settings() {
  const [primaryColor, setPrimaryColor] = useState("#059669");
  const [secondaryColor, setSecondaryColor] = useState("#FFC27B");
  const [highlightColor, setHighlightColor] = useState("#FFC27B");
  const [neutralBg, setNeutralBg] = useState("#F9FAFB");
  const [neutralSurface, setNeutralSurface] = useState("#FFFFFF");
  const [orgName, setOrgName] = useState(mockOrganization.name);

  // Apply colors to CSS variables for live preview
  const applyColors = () => {
    document.documentElement.style.setProperty('--brand-primary', primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', secondaryColor);
    document.documentElement.style.setProperty('--brand-highlight', highlightColor);
    document.documentElement.style.setProperty('--brand-neutral-bg', neutralBg);
    document.documentElement.style.setProperty('--brand-neutral-surface', neutralSurface);
  };

  // Apply colors on change
  const handleColorChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setTimeout(applyColors, 0);
  };

  interface ColorPickerProps {
    label: string;
    helperText: string;
    value: string;
    onChange: (value: string) => void;
  }

  const ColorPicker = ({ label, helperText, value, onChange }: ColorPickerProps) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Label className="text-sm font-medium">{label}</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{helperText}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-lg border border-border shadow-soft transition-transform hover:scale-105"
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

  return (
    <div className="animate-fade-in p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your organization's brand and preferences
        </p>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList>
          <TabsTrigger value="brand" className="gap-2">
            <Palette className="h-4 w-4" />
            Brand Kit
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Brand Kit Tab */}
        <TabsContent value="brand" className="space-y-6">
          {/* Logo Upload */}
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Logo</CardTitle>
              <CardDescription>
                Upload your organization's logo for reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-muted-foreground/30">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Color Settings - Expanded Grid */}
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Brand Colors</CardTitle>
              <CardDescription>
                Define your color palette for accessible and professional report designs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Row 1: Core Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Core Brand</h4>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ColorPicker
                    label="Primary (Core Brand)"
                    helperText="Used for main headers and footers."
                    value={primaryColor}
                    onChange={handleColorChange(setPrimaryColor)}
                  />
                  <ColorPicker
                    label="Secondary (Accents)"
                    helperText="Used for charts and icons."
                    value={secondaryColor}
                    onChange={handleColorChange(setSecondaryColor)}
                  />
                  <ColorPicker
                    label="Highlight (CTAs & Hero Stats)"
                    helperText="Used for buttons and high-impact numbers."
                    value={highlightColor}
                    onChange={handleColorChange(setHighlightColor)}
                  />
                </div>
              </div>

              {/* Row 2: Neutrals & Surfaces */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Neutrals & Surfaces</h4>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ColorPicker
                    label="Neutral 1 (Page Background)"
                    helperText="Usually white or a very light gray for the main page."
                    value={neutralBg}
                    onChange={handleColorChange(setNeutralBg)}
                  />
                  <ColorPicker
                    label="Neutral 2 (Card Surface/Borders)"
                    helperText="Used for card backgrounds to separate them from the page."
                    value={neutralSurface}
                    onChange={handleColorChange(setNeutralSurface)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>
                See how your brand looks on a sample report element
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="overflow-hidden rounded-lg border border-border"
                style={{ backgroundColor: neutralBg }}
              >
                {/* Sample Header */}
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div>
                    <h3 className="font-semibold text-white">{orgName}</h3>
                    <p className="text-sm text-white/80">Impact Report 2024</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <span className="text-sm font-bold text-white">
                      {orgName.split(" ").map((w) => w[0]).join("")}
                    </span>
                  </div>
                </div>
                {/* Sample Content */}
                <div className="p-6" style={{ backgroundColor: neutralSurface }}>
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Hero Stat with Highlight */}
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${highlightColor}15` }}
                    >
                      <span
                        className="text-3xl font-bold"
                        style={{ color: highlightColor }}
                      >
                        5K
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Meals Served</p>
                      <div
                        className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${secondaryColor}20`,
                          color: secondaryColor,
                        }}
                      >
                        ↑ 19% vs last year
                      </div>
                    </div>
                    {/* CTA Button Preview */}
                    <button
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: highlightColor }}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Organization Details</CardTitle>
              <CardDescription>
                Basic information about your nonprofit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  defaultValue="www.metrovillefoodbank.org"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ein">EIN</Label>
                <Input id="ein" defaultValue="12-3456789" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Account Settings</CardTitle>
              <CardDescription>
                Manage your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={mockUser.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={mockUser.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={mockUser.role} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>
                Choose what updates you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notification settings coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
