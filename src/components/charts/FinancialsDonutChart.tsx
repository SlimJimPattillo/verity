import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface FinancialsDonutChartProps {
  program: number;
  admin: number;
  fundraising: number;
  primaryColor: string;
  secondaryColor?: string;
}

export function FinancialsDonutChart({
  program,
  admin,
  fundraising,
  primaryColor,
  secondaryColor = "#94a3b8",
}: FinancialsDonutChartProps) {
  const data = [
    { name: "Programs", value: program, color: primaryColor },
    { name: "Admin", value: admin, color: secondaryColor },
    { name: "Fundraising", value: fundraising, color: "#e2e8f0" },
  ];

  const efficiency = program;

  return (
    <div className="relative h-32 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-800">{efficiency}%</span>
        <span className="text-[10px] text-slate-500">Efficiency</span>
      </div>
    </div>
  );
}
