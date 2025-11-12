import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useRef } from "react";

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
  const chartRef = useRef<HTMLDivElement>(null);
  
  const chartData = data.map(d => ({
    ...d,
    label: HAPPINESS_LABELS[d.nivel as keyof typeof HAPPINESS_LABELS],
    displayPercentage: `${d.percentage.toFixed(1)}%`,
    displayLabel: `${d.count} (${d.percentage.toFixed(1)}%)`
  }));

  const exportChart = async (format: 'png' | 'pdf') => {
    if (!chartRef.current) return;
    
    const canvas = await html2canvas(chartRef.current);
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'felicidade-distribuicao.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('felicidade-distribuicao.pdf');
    }
  };

  return (
    <Card className="shadow-sm" ref={chartRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Distribuição das Notas de Felicidade
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportChart('png')}>
              <Download className="w-4 h-4 mr-1" />
              PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportChart('pdf')}>
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
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
              <LabelList 
                dataKey="displayLabel" 
                position="right" 
                style={{ fill: 'hsl(var(--foreground))', fontSize: '12px' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
