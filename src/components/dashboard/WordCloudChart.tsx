import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useMemo, useRef } from "react";

interface WordCloudChartProps {
  data: { text: string; value: number }[];
}

export function WordCloudChart({ data }: WordCloudChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const words = useMemo(() => {
    return data.slice(0, 40).map((word, index) => {
      const size = Math.max(12, (word.value / maxValue) * 48);
      const hue = (index * 30) % 360;
      return {
        ...word,
        size,
        color: `hsl(${hue}, 70%, 50%)`
      };
    });
  }, [data, maxValue]);

  const exportChart = async (format: 'png' | 'pdf') => {
    if (!chartRef.current) return;
    
    const canvas = await html2canvas(chartRef.current);
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'nuvem-palavras.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('nuvem-palavras.pdf');
    }
  };

  return (
    <Card className="shadow-sm" ref={chartRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Principais Termos nas Respostas Abertas
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
        <div className="flex flex-wrap gap-3 justify-center items-center min-h-[300px] p-4">
          {words.map((word, index) => (
            <span
              key={index}
              style={{
                fontSize: `${word.size}px`,
                color: word.color,
                fontWeight: Math.min(900, 400 + word.value * 50),
                opacity: 0.7 + (word.value / maxValue) * 0.3,
                transition: "all 0.3s ease"
              }}
              className="cursor-pointer hover:opacity-100 hover:scale-110"
              title={`${word.text}: ${word.value} menções`}
            >
              {word.text}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
