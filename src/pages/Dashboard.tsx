import { FileText, Sparkles, Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { GetStartedCard } from "@/components/dashboard/GetStartedCard";
import { mockUser, mockReports, mockMetrics } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const showEmptyState = false; // Toggle to see empty state

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  return (
    <div className="animate-fade-in p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {greeting}, {mockUser.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your impact reporting
          </p>
        </div>
        <Button 
          onClick={() => navigate("/report-builder")}
          className="gap-2 shadow-soft"
        >
          <Plus className="h-4 w-4" />
          Create New Report
        </Button>
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
          value={mockMetrics.length}
          icon={<Database className="h-5 w-5" />}
        />
      </div>

      {/* Main Content */}
      {showEmptyState ? (
        <GetStartedCard onSelectTemplate={(id) => console.log("Selected:", id)} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
            </Button>
          </div>
          <RecentActivityTable reports={mockReports} />
        </div>
      )}
    </div>
  );
}
