import { FileText, Sparkles, Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { mockReports } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import verityLogoImg from "@/assets/verity-logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const { organizationId } = useAuth();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  return (
    <div className="animate-fade-in p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary">
            <img
              src={verityLogoImg}
              alt="Verity Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1F2937] lg:text-3xl">
              Verity: Bring your impact to light.
            </h1>
            <p className="mt-2 max-w-2xl text-[#1F2937]/80">
              Truth hides in the well of disconnected systems, spreadsheets, and CRM data. Verity brings it to the surface, shining a light on your impact for donors, grants, and your community.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Reports Created"
          value={mockReports.length}
          icon={<FileText className="h-5 w-5" />}
          trend="+2 this month"
        />
        <StatCard
          title="Grant Answers Generated"
          value={12}
          icon={<Sparkles className="h-5 w-5" />}
          trend="+5 this week"
        />
        <StatCard
          title="Assets in Vault"
          value={0}
          icon={<Database className="h-5 w-5" />}
        />
      </div>

      {/* Create Report Button */}
      <div className="mb-8">
        <Button 
          onClick={() => navigate("/report-builder")}
          className="gap-2 shadow-soft"
        >
          <Plus className="h-4 w-4" />
          Create New Report
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
          </Button>
        </div>
        <RecentActivityTable reports={mockReports} />
      </div>
    </div>
  );
}
