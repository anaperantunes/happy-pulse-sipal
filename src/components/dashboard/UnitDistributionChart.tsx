import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useRef } from "react";

interface UnitDistributionChartProps {
  data: { unidade: string; count: number }[];
}

const COLORS = ["hsl(var(--chart-primary))", "hsl(var(--chart-accent))"];

export function UnitDistributionChart({ data }: UnitDistributionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const chartData = data.map(d => ({
    ...d,
    percentage: ((d.count / total) * 100).toFixed(1)
  }));

  const exportChart = async (format: 'png' | 'pdf') => {
    if (!chartRef.current) return;
    
    const canvas = await html2canvas(chartRef.current);
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'distribuicao-unidade.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('distribuicao-unidade.pdf');
    }
  };

  return (
    <Card className="shadow-sm" ref={chartRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Distribuição por Unidade
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
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ unidade, count, percentage }) => `${unidade}: ${count} (${percentage}%)`}
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
