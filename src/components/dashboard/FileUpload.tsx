import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { SurveyResponse } from "@/types/survey";
import { parseHappinessLevel } from "@/utils/dataProcessor";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Validation schema for survey responses
const surveyResponseSchema = z.object({
  local: z.string().trim().min(1, "Local é obrigatório").max(200, "Local muito longo"),
  felicidade: z.number().int().min(1, "Felicidade deve ser entre 1 e 5").max(5, "Felicidade deve ser entre 1 e 5"),
  fatoresPositivos: z.string().max(5000, "Fatores positivos muito longos").optional(),
  fatoresNegativos: z.string().max(5000, "Fatores negativos muito longos").optional(),
  impacto: z.string().max(500, "Impacto muito longo").optional(),
  comentarios: z.string().max(10000, "Comentários muito longos").optional(),
  tipo_unidade: z.enum(["Matriz", "Filial"], { errorMap: () => ({ message: "Tipo de unidade inválido" }) })
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 10000;

interface FileUploadProps {
  onDataLoaded: (data: SurveyResponse[], timestamp: string) => void;
  compact?: boolean;
}

export function FileUpload({ onDataLoaded, compact = false }: FileUploadProps) {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog before proceeding
    setPendingFile(file);
    setShowConfirmDialog(true);
    
    // Reset input
    event.target.value = '';
  }, [toast]);

  const processFile = useCallback(async (file: File) => {
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
            
            // Sanitize strings to prevent formula injection
            const sanitize = (str: string) => typeof str === 'string' ? str.replace(/^[=+\-@]/g, "'") : str;
            
            allResponses.push({
              local: sanitize((Object.values(row)[0] as string) || tipoUnidade),
              felicidade,
              fatoresPositivos: sanitize((Object.values(row)[2] as string) || ""),
              fatoresNegativos: sanitize((Object.values(row)[3] as string) || ""),
              impacto: sanitize((Object.values(row)[4] as string) || ""),
              comentarios: sanitize((Object.values(row)[5] as string) || ""),
              tipo_unidade: tipoUnidade
            });
          });
        });

        // Check row count limit
        if (allResponses.length > MAX_ROWS) {
          toast({
            title: "Muitas linhas",
            description: `O arquivo contém ${allResponses.length} linhas. O limite é ${MAX_ROWS}.`,
            variant: "destructive",
          });
          return;
        }

        // Validate all responses
        const validationErrors: string[] = [];
        allResponses.forEach((response, index) => {
          try {
            surveyResponseSchema.parse(response);
          } catch (error) {
            if (error instanceof z.ZodError) {
              validationErrors.push(`Linha ${index + 1}: ${error.errors[0].message}`);
            }
          }
        });

        if (validationErrors.length > 0) {
          toast({
            title: "Erro de validação",
            description: validationErrors.slice(0, 3).join("; ") + (validationErrors.length > 3 ? "..." : ""),
            variant: "destructive",
          });
          return;
        }

        if (allResponses.length > 0) {
          const timestamp = new Date().toISOString();
          
          // Delete old responses (explicit condition for all records)
          const { error: deleteError } = await supabase
            .from('survey_responses')
            .delete()
            .gte('created_at', '1970-01-01');
          
          if (deleteError) throw deleteError;
          
          // Insert new responses to Supabase
          const { error: insertError } = await supabase
            .from('survey_responses')
            .insert(
              allResponses.map(response => ({
                local: response.local,
                felicidade: response.felicidade,
                fatores_positivos: response.fatoresPositivos,
                fatores_negativos: response.fatoresNegativos,
                impacto: response.impacto,
                comentarios: response.comentarios,
                tipo_unidade: response.tipo_unidade,
              }))
            );

          if (insertError) {
            throw insertError;
          }

          // Update metadata
          await supabase.from('survey_metadata').delete().gte('last_updated', '1970-01-01');
          const { error: metadataError } = await supabase.from('survey_metadata').insert({
            total_responses: allResponses.length,
            last_updated: timestamp,
          });

          if (metadataError) throw metadataError;
          
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
        toast({
          title: "Erro ao processar arquivo",
          description: "Não foi possível carregar o arquivo. Verifique o formato e tente novamente.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataLoaded, toast]);

  const handleConfirm = useCallback(() => {
    if (pendingFile) {
      processFile(pendingFile);
      setPendingFile(null);
    }
    setShowConfirmDialog(false);
  }, [pendingFile, processFile]);

  const handleCancel = useCallback(() => {
    setPendingFile(null);
    setShowConfirmDialog(false);
  }, []);
  if (compact) {
    return (
      <>
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
        
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Substituição de Dados</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá <strong>substituir todos os dados existentes</strong> no banco de dados.
                Todos os registros atuais serão permanentemente removidos. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
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
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Substituição de Dados</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá <strong>substituir todos os dados existentes</strong> no banco de dados.
              Todos os registros atuais serão permanentemente removidos. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
