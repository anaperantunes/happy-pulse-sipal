import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ImpactChartProps {
  data: { impacto: string; count: number }[];
}

export function ImpactChart({ data }: ImpactChartProps) {
  const sortedData = [...data].sort((a, b) => {
    const orderMap: { [key: string]: number } = {
      "1 -Impactou muito": 1,
      "2 - Impactou bastante": 2,
      "3 - Impacto moderado": 3,
      "4 - Impactou pouco": 4,
      "5 - Não impactou nada": 5
    };
    return (orderMap[a.impacto] || 999) - (orderMap[b.impacto] || 999);
  });

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Impacto do SAP no Bem-Estar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="impacto" 
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 11 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }}
              formatter={(value: number) => [`${value} respostas`, "Total"]}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--chart-secondary))" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
