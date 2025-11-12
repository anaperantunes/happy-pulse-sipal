import { useState, useMemo, useEffect } from "react";
import { Heart, TrendingUp, Users, MessageSquare, Calendar } from "lucide-react";
import logoSipal from "@/assets/logo-sipal.png";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { HappinessChart } from "@/components/dashboard/HappinessChart";
import { ImpactChart } from "@/components/dashboard/ImpactChart";
import { UnitDistributionChart } from "@/components/dashboard/UnitDistributionChart";
import { WordCloudChart } from "@/components/dashboard/WordCloudChart";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { SurveyResponse } from "@/types/survey";
import { processData } from "@/utils/dataProcessor";

const Index = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('surveyData');
    const savedTimestamp = localStorage.getItem('surveyDataTimestamp');
    
    if (savedData && savedTimestamp) {
      try {
        const parsedData = JSON.parse(savedData);
        setResponses(parsedData);
        setLastUpdate(savedTimestamp);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const handleDataLoaded = (data: SurveyResponse[], timestamp: string) => {
    setResponses(data);
    setLastUpdate(timestamp);
  };

  const formatLastUpdate = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredResponses = useMemo(() => {
    if (selectedUnit === "all") return responses;
    return responses.filter(r => r.tipo_unidade === selectedUnit);
  }, [responses, selectedUnit]);

  const processedData = useMemo(() => {
    if (filteredResponses.length === 0) return null;
    return processData(filteredResponses);
  }, [filteredResponses]);

  const totalResponses = filteredResponses.length;
  const happyPercentage = processedData
    ? ((processedData.happinessDistribution.filter(h => h.nivel >= 4).reduce((sum, h) => sum + h.count, 0) / totalResponses) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary">
                Pesquisa de Felicidade no Trabalho
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard SIPAL - Análise em tempo real
              </p>
            </div>
            <img 
              src={logoSipal} 
              alt="Logo SIPAL" 
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-16">
        {responses.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filters and Update Button */}
            <div className="flex items-center justify-between gap-4">
              <div className="max-w-xs">
                <FilterPanel
                  selectedUnit={selectedUnit}
                  onUnitChange={setSelectedUnit}
                />
              </div>
              <FileUpload onDataLoaded={handleDataLoaded} compact />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Média Geral de Felicidade"
                value={processedData?.averageHappiness.toFixed(1) || "0.0"}
                icon={Heart}
                subtitle="Escala de 1 a 5"
              />
              <MetricCard
                title="Colaboradores Felizes"
                value={`${happyPercentage}%`}
                icon={TrendingUp}
                subtitle="Notas 4 e 5"
              />
              <MetricCard
                title="Total de Respostas"
                value={totalResponses}
                icon={Users}
              />
              <MetricCard
                title="Comentários Recebidos"
                value={filteredResponses.filter(r => r.comentarios && r.comentarios.trim() !== "").length}
                icon={MessageSquare}
              />
            </div>

            {/* Charts */}
            {processedData && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HappinessChart data={processedData.happinessDistribution} />
                  <ImpactChart data={processedData.impactDistribution} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <UnitDistributionChart data={processedData.unitDistribution} />
                  <WordCloudChart data={processedData.wordFrequency} />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer with last update info */}
      {lastUpdate && (
        <footer className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border/50 py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Última atualização: {formatLastUpdate(lastUpdate)}</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
