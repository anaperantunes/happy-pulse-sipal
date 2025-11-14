import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface ResponseRateChartProps {
  responses: Array<{ tipo_unidade: "Matriz" | "Filial" }>;
}

export function ResponseRateChart({ responses }: ResponseRateChartProps) {
  const [employeeCounts, setEmployeeCounts] = useState({
    matriz: 368,
    filiais: 722,
    geral: 1090
  });

  useEffect(() => {
    const fetchEmployeeCounts = async () => {
      const { data, error } = await supabase
        .from('employee_counts')
        .select('tipo, total_colaboradores');

      if (!error && data) {
        const counts = {
          matriz: data.find(d => d.tipo === 'Matriz')?.total_colaboradores || 368,
          filiais: data.find(d => d.tipo === 'Filiais')?.total_colaboradores || 722,
          geral: data.find(d => d.tipo === 'Geral')?.total_colaboradores || 1090
        };
        setEmployeeCounts(counts);
      }
    };

    fetchEmployeeCounts();
  }, []);

  const matrizCount = responses.filter(r => r.tipo_unidade === "Matriz").length;
  const filiaisCount = responses.filter(r => r.tipo_unidade === "Filial").length;
  const totalCount = responses.length;

  const geralRate = (totalCount / employeeCounts.geral) * 100;
  const matrizRate = (matrizCount / employeeCounts.matriz) * 100;
  const filiaisRate = (filiaisCount / employeeCounts.filiais) * 100;

  const data = [
    {
      categoria: "Geral",
      taxa: parseFloat(geralRate.toFixed(2)),
      respondentes: totalCount,
      total: employeeCounts.geral
    },
    {
      categoria: "Matriz",
      taxa: parseFloat(matrizRate.toFixed(2)),
      respondentes: matrizCount,
      total: employeeCounts.matriz
    },
    {
      categoria: "Filiais",
      taxa: parseFloat(filiaisRate.toFixed(2)),
      respondentes: filiaisCount,
      total: employeeCounts.filiais
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
