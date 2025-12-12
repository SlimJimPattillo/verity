import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SparklineChart } from "@/components/charts/SparklineChart";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  className?: string;
  sparklineData?: number[];
}

export function StatCard({ title, value, icon, trend, className, sparklineData }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden border border-border bg-card shadow-soft transition-shadow hover:shadow-medium", className)}>
      {sparklineData && <SparklineChart data={sparklineData} />}
      <CardContent className="relative z-10 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {trend && (
              <p className="text-xs text-success">{trend}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
