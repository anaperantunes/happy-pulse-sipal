import { SurveyResponse, ProcessedData } from "@/types/survey";

// Palavras irrelevantes/genéricas a serem excluídas
const stopWords = new Set([
  'a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'os', 'as', 'dos', 'das',
  'para', 'com', 'por', 'no', 'na', 'ao', 'à', 'pelo', 'pela', 'mais', 'que',
  'se', 'não', 'como', 'mas', 'ou', 'quando', 'muito', 'nos', 'eu', 'ele', 'ela',
  'você', 'ser', 'ter', 'estar', 'fazer', 'ir', 'poder', 'sua', 'seu', 'meu', 'minha',
  // Palavras genéricas sem valor analítico
  'empresa', 'trabalho', 'colaborador', 'colaboradores', 'funcionário', 'funcionários',
  'bom', 'boa', 'bons', 'boas', 'ótimo', 'ótima', 'ótimos', 'ótimas', 'ok', 'sim',
  'sistema', 'processo', 'processos', 'mudança', 'mudanças', 'coisa', 'coisas',
  'algo', 'sempre', 'ainda', 'também', 'aqui', 'ali', 'isso', 'essa', 'esse',
  'área', 'setor', 'parte', 'vez', 'vezes', 'dia', 'dias', 'ano', 'anos',
  'pode', 'podem', 'deve', 'devem', 'precisa', 'precisam', 'tem', 'têm'
]);

// Termos relevantes para o plano de ação organizacional
const relevantTerms = new Set([
  // Clima e relações interpessoais
  'ambiente', 'clima', 'relacionamento', 'relacionamentos', 'equipe', 'equipes',
  'colega', 'colegas', 'convivência', 'integração', 'respeito', 'confiança',
  
  // Liderança e gestão
  'liderança', 'líder', 'líderes', 'gestão', 'gestor', 'gestores', 'gerente',
  'gerentes', 'supervisor', 'supervisores', 'chefia', 'chefe', 'coordenador',
  
  // Reconhecimento e valorização
  'reconhecimento', 'valorização', 'valorizar', 'reconhecer', 'motivação',
  'incentivo', 'feedback', 'elogio', 'mérito', 'recompensa',
  
  // Comunicação interna
  'comunicação', 'diálogo', 'informação', 'informações', 'transparência',
  'clareza', 'alinhamento', 'reunião', 'reuniões',
  
  // Carga e ritmo de trabalho
  'carga', 'sobrecarga', 'ritmo', 'prazo', 'prazos', 'pressão', 'demanda',
  'demandas', 'tempo', 'horas', 'horário', 'jornada',
  
  // Condições de trabalho e infraestrutura
  'infraestrutura', 'estrutura', 'recursos', 'ferramenta', 'ferramentas',
  'equipamento', 'equipamentos', 'espaço', 'instalação', 'instalações',
  
  // Desenvolvimento e crescimento
  'desenvolvimento', 'crescimento', 'carreira', 'oportunidade', 'oportunidades',
  'capacitação', 'treinamento', 'treinamentos', 'curso', 'cursos',
  'aprendizado', 'conhecimento', 'promoção',
  
  // Equilíbrio vida pessoal/profissional
  'equilíbrio', 'flexibilidade', 'home', 'office', 'remoto', 'presencial',
  'família', 'pessoal', 'saúde', 'bem-estar', 'qualidade',
  
  // Remuneração e benefícios
  'salário', 'remuneração', 'benefício', 'benefícios', 'plano', 'vale',
  'auxílio', 'bonificação', 'participação'
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
  const MIN_FREQUENCY = 3; // Frequência mínima para incluir palavra
  
  comments.forEach(comment => {
    if (!comment || comment.trim() === '') return;
    
    const words = comment
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos para melhor agrupamento
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });
  
  // Filtra palavras com frequência mínima e prioriza termos relevantes
  const filteredWords = Object.entries(wordCount)
    .filter(([_, count]) => count >= MIN_FREQUENCY)
    .map(([text, value]) => {
      // Aumenta o peso de palavras relevantes para destacá-las
      const isRelevant = relevantTerms.has(text);
      const adjustedValue = isRelevant ? value * 1.5 : value;
      
      return { 
        text, 
        value,
        displayValue: adjustedValue,
        isRelevant 
      };
    })
    .sort((a, b) => b.displayValue - a.displayValue)
    .slice(0, 80); // Aumenta limite para 80 palavras
  
  return filteredWords.map(({ text, value }) => ({ text, value }));
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
    unitCount[r.local] = (unitCount[r.local] || 0) + 1;
  });
  
  const unitDistribution = Object.entries(unitCount).map(([unidade, count]) => ({
    unidade,
    count
  }));
  
  const wordFrequency = processWordFrequency(
    responses.map(r => r.comentarios).filter(c => c && c.trim() !== '')
  );
  
  // Process happiness factors (positive factors)
  const happinessFactorCount: { [key: string]: number } = {};
  responses.forEach(r => {
    if (r.fatoresPositivos && r.fatoresPositivos.trim() !== '') {
      happinessFactorCount[r.fatoresPositivos] = (happinessFactorCount[r.fatoresPositivos] || 0) + 1;
    }
  });
  
  const happinessFactors = Object.entries(happinessFactorCount)
    .map(([fator, count]) => ({ fator, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Process unhappiness factors (negative factors)
  const unhappinessFactorCount: { [key: string]: number } = {};
  responses.forEach(r => {
    if (r.fatoresNegativos && r.fatoresNegativos.trim() !== '') {
      unhappinessFactorCount[r.fatoresNegativos] = (unhappinessFactorCount[r.fatoresNegativos] || 0) + 1;
    }
  });
  
  const unhappinessFactors = Object.entries(unhappinessFactorCount)
    .map(([fator, count]) => ({ fator, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    responses,
    averageHappiness,
    happinessDistribution,
    impactDistribution,
    unitDistribution,
    wordFrequency,
    happinessFactors,
    unhappinessFactors
  };
}
