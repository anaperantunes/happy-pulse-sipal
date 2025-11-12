import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface WordCloudChartProps {
  data: { text: string; value: number }[];
}

export function WordCloudChart({ data }: WordCloudChartProps) {
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

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Principais Termos nas Respostas Abertas
        </CardTitle>
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
