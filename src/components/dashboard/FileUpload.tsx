import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { SurveyResponse } from "@/types/survey";
import { parseHappinessLevel } from "@/utils/dataProcessor";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onDataLoaded: (data: SurveyResponse[], timestamp: string) => void;
  compact?: boolean;
}

export function FileUpload({ onDataLoaded, compact = false }: FileUploadProps) {
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
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
          // Delete existing data
          await supabase.from('survey_responses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          // Insert new responses into database
          const { error: insertError } = await supabase
            .from('survey_responses')
            .insert(allResponses.map(r => ({
              local: r.local,
              felicidade: r.felicidade,
              fatores_positivos: r.fatoresPositivos,
              fatores_negativos: r.fatoresNegativos,
              impacto: r.impacto,
              comentarios: r.comentarios,
              tipo_unidade: r.tipo_unidade
            })));

          if (insertError) {
            throw insertError;
          }

          // Update metadata
          await supabase.from('survey_metadata').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          const { error: metadataError } = await supabase
            .from('survey_metadata')
            .insert({
              last_updated: new Date().toISOString(),
              total_responses: allResponses.length
            });

          if (metadataError) {
            throw metadataError;
          }

          const timestamp = new Date().toISOString();
          onDataLoaded(allResponses, timestamp);
          
          toast({
            title: "Arquivo carregado!",
            description: `${allResponses.length} respostas salvas no banco de dados.`,
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

  if (compact) {
    return (
      <Button asChild variant="outline" size="sm">
        <label className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          Atualizar Base
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Carregue o arquivo Excel com as respostas da pesquisa
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
  );
}
