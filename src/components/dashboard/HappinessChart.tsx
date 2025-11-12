import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface HappinessChartProps {
  data: { nivel: number; count: number; percentage: number }[];
}

const HAPPINESS_LABELS = {
  1: "Nada feliz",
  2: "Pouco feliz",
  3: "Neutro",
  4: "Feliz",
  5: "Muito feliz"
};

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

export function HappinessChart({ data }: HappinessChartProps) {
  const chartData = data.map(d => ({
    ...d,
    label: HAPPINESS_LABELS[d.nivel as keyof typeof HAPPINESS_LABELS],
    displayPercentage: `${d.percentage.toFixed(1)}%`
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Distribuição das Notas de Felicidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis 
              dataKey="label" 
              type="category" 
              stroke="hsl(var(--muted-foreground))"
              width={100}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value} respostas (${props.payload.displayPercentage})`,
                "Total"
              ]}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
