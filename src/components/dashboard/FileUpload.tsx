import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { SurveyResponse } from "@/types/survey";
import { parseHappinessLevel } from "@/utils/dataProcessor";

interface FileUploadProps {
  onDataLoaded: (data: SurveyResponse[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        const allResponses: SurveyResponse[] = [];
        
        // Process all sheets
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          const tipoUnidade = sheetName.toLowerCase().includes("filial") ? "Filial" : "Matriz";
          
          jsonData.forEach((row: any) => {
            const felicidadeText = Object.values(row)[1] as string || "";
            const felicidade = parseHappinessLevel(felicidadeText);
            
            allResponses.push({
              local: (Object.values(row)[0] as string) || tipoUnidade,
              felicidade,
              fatoresPositivos: (Object.values(row)[2] as string) || "",
              fatoresNegativos: (Object.values(row)[3] as string) || "",
              impacto: (Object.values(row)[4] as string) || "",
              comentarios: (Object.values(row)[5] as string) || "",
              tipo_unidade: tipoUnidade
            });
          });
        });

        if (allResponses.length > 0) {
          onDataLoaded(allResponses);
          toast({
            title: "Arquivo carregado!",
            description: `${allResponses.length} respostas processadas com sucesso.`,
          });
        } else {
          toast({
            title: "Erro",
            description: "Nenhum dado encontrado no arquivo.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro ao processar arquivo",
          description: "Verifique se o formato do arquivo está correto.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataLoaded, toast]);

  return (
    <Card className="shadow-sm border-dashed border-2 border-primary/30 hover:border-primary/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="rounded-full bg-primary/10 p-6">
            <FileSpreadsheet className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Carregar Base Atualizada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione o arquivo Excel com as respostas da pesquisa
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Escolher Arquivo
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
