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
    // Termos críticos que devem ter destaque visual adicional
    const criticalTerms = new Set([
      'lideranca', 'lider', 'gestao', 'gestor', 'reconhecimento', 'valorizacao',
      'comunicacao', 'sobrecarga', 'carga', 'pressao', 'salario', 'remuneracao',
      'desenvolvimento', 'oportunidade', 'crescimento', 'equilibrio', 'flexibilidade'
    ]);
    
    return data.map((word, index) => {
      const normalizedWord = word.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const isCritical = criticalTerms.has(normalizedWord);
      
      // Ajusta tamanho com base na relevância
      const baseSizeMultiplier = isCritical ? 56 : 48;
      const size = Math.max(14, (word.value / maxValue) * baseSizeMultiplier);
      
      // Esquema de cores por categoria
      let color;
      if (isCritical) {
        // Termos críticos em tons mais fortes (vermelho/laranja para atenção)
        color = `hsl(${10 + (index * 15) % 40}, 75%, 45%)`;
      } else if (word.value >= maxValue * 0.6) {
        // Termos muito frequentes em azul/roxo
        color = `hsl(${220 + (index * 20) % 60}, 65%, 50%)`;
      } else {
        // Demais termos em tons variados
        color = `hsl(${(index * 35) % 360}, 60%, 50%)`;
      }
      
      return {
        ...word,
        size,
        color,
        isCritical
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
        <div className="flex flex-wrap gap-3 justify-center items-center min-h-[400px] p-6">
          {words.map((word, index) => (
            <span
              key={index}
              style={{
                fontSize: `${word.size}px`,
                color: word.color,
                fontWeight: word.isCritical ? 700 : Math.min(700, 400 + word.value * 40),
                opacity: word.isCritical ? 0.95 : 0.75 + (word.value / maxValue) * 0.2,
                transition: "all 0.3s ease",
                textShadow: word.isCritical ? '0 0 8px rgba(0,0,0,0.1)' : 'none'
              }}
              className="cursor-pointer hover:opacity-100 hover:scale-110"
              title={`${word.text}: ${word.value} menções${word.isCritical ? ' (termo prioritário)' : ''}`}
            >
              {word.text}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
