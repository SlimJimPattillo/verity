import { Report } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { FileText, FileCheck, FileClock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityTableProps {
  reports: Report[];
}

const statusStyles = {
  Draft: "bg-muted text-muted-foreground",
  Published: "bg-success/10 text-success",
  "Under Review": "bg-warning/10 text-warning",
};

const typeIcons = {
  "Annual Report": FileText,
  "Grant Application": FileClock,
  "Impact Report": FileCheck,
};

export function RecentActivityTable({ reports }: RecentActivityTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date Modified
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reports.map((report) => {
            const Icon = typeIcons[report.type];
            return (
              <tr
                key={report.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">
                      {report.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {report.type}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(report.dateModified).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant="secondary"
                    className={cn("font-medium", statusStyles[report.status])}
                  >
                    {report.status}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
