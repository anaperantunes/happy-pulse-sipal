import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface UnitDistributionChartProps {
  data: { unidade: string; count: number }[];
}

const COLORS = ["hsl(var(--chart-primary))", "hsl(var(--chart-accent))"];

export function UnitDistributionChart({ data }: UnitDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const chartData = data.map(d => ({
    ...d,
    percentage: ((d.count / total) * 100).toFixed(1)
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Distribuição por Unidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ unidade, percentage }) => `${unidade}: ${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value} respostas (${props.payload.percentage}%)`,
                props.payload.unidade
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
