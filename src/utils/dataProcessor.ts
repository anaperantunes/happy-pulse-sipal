import { SurveyResponse, ProcessedData } from "@/types/survey";

const stopWords = new Set([
  'a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'os', 'as', 'dos', 'das',
  'para', 'com', 'por', 'no', 'na', 'ao', 'à', 'pelo', 'pela', 'mais', 'que',
  'se', 'não', 'como', 'mas', 'ou', 'quando', 'muito', 'nos', 'eu', 'ele', 'ela',
  'você', 'ser', 'ter', 'estar', 'fazer', 'ir', 'poder', 'sua', 'seu', 'meu', 'minha'
]);

export function parseHappinessLevel(text: string): number {
  if (text.includes('1') || text.includes('Nada')) return 1;
  if (text.includes('2') || text.includes('Pouco')) return 2;
  if (text.includes('3') || text.includes('Neutro')) return 3;
  if (text.includes('4') || text.includes('Feliz') && !text.includes('Muito')) return 4;
  if (text.includes('5') || text.includes('Muito feliz')) return 5;
  return 3;
}

export function processWordFrequency(comments: string[]): { text: string; value: number }[] {
  const wordCount: { [key: string]: number } = {};
  
  comments.forEach(comment => {
    if (!comment || comment.trim() === '') return;
    
    const words = comment
      .toLowerCase()
      .replace(/[^\wÀ-ÿ\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });
  
  return Object.entries(wordCount)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
}

export function processData(responses: SurveyResponse[]): ProcessedData {
  const averageHappiness = responses.reduce((sum, r) => sum + r.felicidade, 0) / responses.length;
  
  const happinessCount: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  responses.forEach(r => {
    happinessCount[r.felicidade]++;
  });
  
  const happinessDistribution = Object.entries(happinessCount).map(([nivel, count]) => ({
    nivel: parseInt(nivel),
    count,
    percentage: (count / responses.length) * 100
  }));
  
  const impactCount: { [key: string]: number } = {};
  responses.forEach(r => {
    if (r.impacto && r.impacto.trim() !== '') {
      impactCount[r.impacto] = (impactCount[r.impacto] || 0) + 1;
    }
  });
  
  const impactDistribution = Object.entries(impactCount).map(([impacto, count]) => ({
    impacto,
    count
  }));
  
  const unitCount: { [key: string]: number } = {};
  responses.forEach(r => {
    unitCount[r.tipo_unidade] = (unitCount[r.tipo_unidade] || 0) + 1;
  });
  
  const unitDistribution = Object.entries(unitCount).map(([unidade, count]) => ({
    unidade,
    count
  }));
  
  const wordFrequency = processWordFrequency(
    responses.map(r => r.comentarios).filter(c => c && c.trim() !== '')
  );
  
  return {
    responses,
    averageHappiness,
    happinessDistribution,
    impactDistribution,
    unitDistribution,
    wordFrequency
  };
}
