import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";

interface MicroBarChartProps {
  currentValue: number;
  previousValue: number;
  primaryColor: string;
}

export function MicroBarChart({
  currentValue,
  previousValue,
  primaryColor,
}: MicroBarChartProps) {
  const data = [
    { name: "Last Year", value: previousValue },
    { name: "This Year", value: currentValue },
  ];

  const colors = ["#94a3b8", primaryColor];

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barCategoryGap={4}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
