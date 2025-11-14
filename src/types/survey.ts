export interface SurveyResponse {
  local: "Matriz" | "Filial";
  felicidade: number;
  fatoresPositivos: string;
  fatoresNegativos: string;
  impacto: string;
  comentarios: string;
  tipo_unidade: string;
}

export interface ProcessedData {
  responses: SurveyResponse[];
  averageHappiness: number;
  happinessDistribution: { nivel: number; count: number; percentage: number }[];
  impactDistribution: { impacto: string; count: number }[];
  unitDistribution: { unidade: string; count: number }[];
  wordFrequency: { text: string; value: number }[];
  happinessFactors: { fator: string; count: number }[];
  unhappinessFactors: { fator: string; count: number }[];
}
