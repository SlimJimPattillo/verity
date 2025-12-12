import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data?: number[];
  color?: string;
}

export function SparklineChart({
  data = [12, 18, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
  color = "hsl(var(--primary))",
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div className="absolute inset-0 opacity-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#sparklineGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
