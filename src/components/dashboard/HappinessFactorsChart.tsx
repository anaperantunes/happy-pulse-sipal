import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smile } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useRef } from "react";

interface HappinessFactorsChartProps {
  data: { fator: string; count: number }[];
}

const CustomizedTick = (props: any) => {
  const { x, y, payload } = props;
  const maxLength = 20;
  const text: string = payload?.value ?? "";
  const truncated = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="hsl(var(--muted-foreground))"
        transform="rotate(-45)"
        fontSize={11}
      >
        <title>{text}</title>
        {truncated}
      </text>
    </g>
  );
};

export function HappinessFactorsChart({ data }: HappinessFactorsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const total = data.reduce((sum, d) => sum + d.count, 0);
  
  const chartData = data.map(d => ({
    ...d,
    displayLabel: `${d.count} (${((d.count / total) * 100).toFixed(1)}%)`
  }));

  const exportChart = async (format: 'png' | 'pdf') => {
    if (!chartRef.current) return;
    
    const canvas = await html2canvas(chartRef.current);
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'motivos-felicidade.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('motivos-felicidade.pdf');
    }
  };

  return (
    <Card className="shadow-sm" ref={chartRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Smile className="h-5 w-5 text-primary" />
            Top 5 Motivos de Felicidade
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
          <BarChart data={chartData} margin={{ left: 20, right: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="fator" 
              angle={-45}
              textAnchor="end"
              height={100}
              stroke="hsl(var(--muted-foreground))"
              interval={0}
              tickMargin={8}
              tick={<CustomizedTick />}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }}
              formatter={(value: number) => [`${value} menções`, "Total"]}
            />
            <Bar 
              dataKey="count" 
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill="hsl(var(--chart-success))" />
              ))}
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
