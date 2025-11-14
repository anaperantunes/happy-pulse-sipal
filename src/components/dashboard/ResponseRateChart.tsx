import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ResponseRateChartProps {
  responses: Array<{ tipo_unidade: "Matriz" | "Filial" }>;
}

const TOTAL_MATRIZ = 368;
const TOTAL_FILIAIS = 994;
const TOTAL_GERAL = 1362;

export function ResponseRateChart({ responses }: ResponseRateChartProps) {
  const matrizCount = responses.filter(r => r.tipo_unidade === "Matriz").length;
  const filiaisCount = responses.filter(r => r.tipo_unidade === "Filial").length;
  const totalCount = responses.length;

  const geralRate = (totalCount / TOTAL_GERAL) * 100;
  const matrizRate = (matrizCount / TOTAL_MATRIZ) * 100;
  const filiaisRate = (filiaisCount / TOTAL_FILIAIS) * 100;

  const data = [
    {
      categoria: "Geral",
      taxa: parseFloat(geralRate.toFixed(2)),
      respondentes: totalCount,
      total: TOTAL_GERAL
    },
    {
      categoria: "Matriz",
      taxa: parseFloat(matrizRate.toFixed(2)),
      respondentes: matrizCount,
      total: TOTAL_MATRIZ
    },
    {
      categoria: "Filiais",
      taxa: parseFloat(filiaisRate.toFixed(2)),
      respondentes: filiaisCount,
      total: TOTAL_FILIAIS
    }
  ];

  const chartConfig = {
    taxa: {
      label: "Taxa de Resposta",
      color: "hsl(var(--primary))",
    },
  };

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))"
  ];

  return (
    <Card className="shadow-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Comparativo de Taxa de Resposta
        </CardTitle>
        <CardDescription>
          Percentual de respostas recebidas em relação ao total de colaboradores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="categoria" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                        <p className="font-semibold text-foreground mb-1">{data.categoria}</p>
                        <p className="text-sm text-muted-foreground">
                          Taxa: <span className="font-medium text-foreground">{data.taxa.toFixed(2)}%</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Respondentes: <span className="font-medium text-foreground">{data.respondentes}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: <span className="font-medium text-foreground">{data.total}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="taxa" 
                radius={[8, 8, 0, 0]}
                label={{
                  position: 'top',
                  formatter: (value: number) => `${value.toFixed(2)}%`,
                  fill: 'hsl(var(--foreground))',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
