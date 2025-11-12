import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useRef } from "react";

interface ImpactChartProps {
  data: { impacto: string; count: number }[];
}

export function ImpactChart({ data }: ImpactChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const total = data.reduce((sum, d) => sum + d.count, 0);
  
  const sortedData = [...data].sort((a, b) => {
    const orderMap: { [key: string]: number } = {
      "1 -Impactou muito": 1,
      "2 - Impactou bastante": 2,
      "3 - Impacto moderado": 3,
      "4 - Impactou pouco": 4,
      "5 - Não impactou nada": 5
    };
    return (orderMap[a.impacto] || 999) - (orderMap[b.impacto] || 999);
  }).map(d => ({
    ...d,
    displayLabel: `${d.count} (${((d.count / total) * 100).toFixed(1)}%)`
  }));

  const exportChart = async (format: 'png' | 'pdf') => {
    if (!chartRef.current) return;
    
    const canvas = await html2canvas(chartRef.current);
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'impacto-sap.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('impacto-sap.pdf');
    }
  };

  return (
    <Card className="shadow-sm" ref={chartRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Impacto do SAP nas suas respostas
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
            >
              <LabelList 
                dataKey="displayLabel" 
                position="top" 
                style={{ fill: 'hsl(var(--foreground))', fontSize: '12px' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
