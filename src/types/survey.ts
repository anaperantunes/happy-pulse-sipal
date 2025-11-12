export interface SurveyResponse {
  local: string;
  felicidade: number;
  fatoresPositivos: string;
  fatoresNegativos: string;
  impacto: string;
  comentarios: string;
  tipo_unidade: "Matriz" | "Filial";
}

export interface ProcessedData {
  responses: SurveyResponse[];
  averageHappiness: number;
  happinessDistribution: { nivel: number; count: number; percentage: number }[];
  impactDistribution: { impacto: string; count: number }[];
  unitDistribution: { unidade: string; count: number }[];
  wordFrequency: { text: string; value: number }[];
}
