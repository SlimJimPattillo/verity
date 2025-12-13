import { FileText, Sparkles, Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { GetStartedCard } from "@/components/dashboard/GetStartedCard";
import { GettingStartedWidget } from "@/components/dashboard/GettingStartedWidget";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { mockUser, mockReports } from "@/lib/mockData";
import { sectorConfigs, Sector } from "@/lib/sectorData";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import verityLogoImg from "@/assets/verity-logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const showEmptyState = false;
  
  const {
    showWelcomeModal,
    selectedSector,
    userName,
    completedSteps,
    progressPercent,
    isComplete,
    selectSector,
    setUserName,
    dismissOnboarding,
  } = useOnboarding();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  const handleSectorSelect = (sector: Sector) => {
    selectSector(sector);
    const config = sectorConfigs[sector];
    toast.success(`We've pre-loaded a ${config.label} template for you!`, {
      description: "Your metrics and narrative have been customized.",
    });
  };

  const metricsCount = selectedSector 
    ? sectorConfigs[selectedSector].metrics.length 
    : 5;

  return (
    <div className="animate-fade-in p-6 lg:p-8">
      {/* Welcome Modal */}
      <WelcomeModal 
        open={showWelcomeModal} 
        onSelectSector={handleSectorSelect}
        onSetUserName={setUserName}
      />

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Getting Started Widget - only show if not dismissed */}
          {!isComplete && completedSteps.sectorSelected && (
            <div className="w-full sm:w-72">
              <GettingStartedWidget
                progressPercent={progressPercent}
                completedSteps={completedSteps}
                onDismiss={dismissOnboarding}
              />
            </div>
          )}
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
          value={metricsCount}
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
